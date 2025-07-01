// server.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const db = require('./db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Auth middleware
const authenticateToken = (req, res, next) => {
    const token = req.session.token;
    if (!token) return res.redirect('/login');
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.redirect('/login');
        req.user = user;
        next();
    });
};

const ensureAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).send('Access denied');
    next();
};

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, hashedPassword, isAdmin || false]);
        res.redirect('/login');
    } catch (err) {
        if (err.code === '23505') return res.status(400).send('Username already exists');
        res.status(500).send('User registration failed');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length && await bcrypt.compare(password, user.rows[0].password)) {
            const token = jwt.sign(
                { userId: user.rows[0].user_id, isAdmin: user.rows[0].is_admin },
                process.env.JWT_SECRET || 'your_jwt_secret'
            );
            req.session.token = token;
            res.redirect(user.rows[0].is_admin ? '/admin' : '/user-dashboard');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Login failed');
    }
});

app.get('/user-dashboard', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // did they answer anything?
    const taken = await db.query(
      'SELECT 1 FROM user_answers WHERE user_id=$1 LIMIT 1',
      [userId]
    );
    const hasTakenQuiz = taken.rowCount > 0;

    if (hasTakenQuiz) {
      // load high score
      const { rows: sr } = await db.query(
        'SELECT highest_score FROM user_scores WHERE user_id=$1',
        [userId]
      );
      const highestScore = sr[0]?.highest_score || 0;

      // load each question’s selected + correct answer
      const { rows: detail } = await db.query(`
        SELECT
          q.question_text,
          sa.answer_text  AS selected_answer_text,
          sa.is_correct   AS is_selected_correct,
          ca.answer_text  AS correct_answer_text
        FROM user_answers ua
        JOIN questions q ON q.question_id = ua.question_id
        JOIN answers sa ON sa.answer_id = ua.selected_answer
        JOIN answers ca
          ON ca.question_id = q.question_id
         AND ca.is_correct = true
        WHERE ua.user_id = $1
        ORDER BY q.question_id
      `, [userId]);

      const correctAnswers = detail.map(r => ({
        question:        r.question_text,
        selected_answer: r.selected_answer_text,
        correct_answer:  r.correct_answer_text,
        is_correct:      r.is_selected_correct
      }));

      return res.render('user_dashboard', {
        hasTakenQuiz,
        highestScore,
        correctAnswers
      });
    }

    // otherwise, pull fresh quiz
    const { rows: qr } = await db.query(`
      SELECT
        q.question_id, q.question_text,
        a.answer_id,   a.answer_text, a.is_correct
      FROM questions q
      JOIN answers   a ON a.question_id = q.question_id
      ORDER BY RANDOM()
    `);

    const questions = {};
    qr.forEach(r => {
      questions[r.question_id] ??= { question_text: r.question_text, answers: [] };
      questions[r.question_id].answers.push({
        answer_id:   r.answer_id,
        answer_text: r.answer_text,
        is_correct:  r.is_correct
      });
    });

    return res.render('user_dashboard', {
      hasTakenQuiz:    false,
      highestScore:    0,
      questions,
      correctAnswers:  []
    });
  } catch (err) {
    console.error('Error in /user-dashboard route:', err);
    return res.status(500).send('Failed to load user dashboard');
  }
});


app.post('/submit-answers', authenticateToken, async (req, res) => {
  const userId      = req.user.userId;
  let { answers, questionIds } = req.body;  
  // Fallback: if answers came in as an array, rebuild the mapping
  if (Array.isArray(answers) && Array.isArray(questionIds)) {
    const rebuilt = {};
    answers.forEach((ans, i) => {
      rebuilt[ questionIds[i] ] = ans;
    });
    answers = rebuilt;
  }

  console.log(' Parsed answers:', answers);
  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).send('No answers submitted');
  }

  try {
    // fetch valid question IDs
    const { rows: validQs } = await db.query('SELECT question_id FROM questions');
    const validIds = new Set(validQs.map(r => r.question_id));

    let score = 0;
    for (const [qid, aid] of Object.entries(answers)) {
      const qn = parseInt(qid, 10);
      const an = parseInt(aid, 10);
      if (!validIds.has(qn)) continue;

      // check correctness
      const { rows } = await db.query(
        'SELECT is_correct FROM answers WHERE answer_id=$1 AND question_id=$2',
        [an, qn]
      );
      if (!rows.length) continue;
      const correct = rows[0].is_correct;
      if (correct) score++;

      // insert
      await db.query(
        `INSERT INTO user_answers
           (user_id, question_id, selected_answer, is_correct)
         VALUES ($1,$2,$3,$4)`,
        [userId, qn, an, correct]
      );
    }

    // update high score
    await db.query(`
      INSERT INTO user_scores (user_id, highest_score)
           VALUES ($1,$2)
      ON CONFLICT (user_id) DO UPDATE
        SET highest_score = EXCLUDED.highest_score
      WHERE user_scores.highest_score < EXCLUDED.highest_score
    `, [userId, score]);

    return res.redirect('/user-dashboard');
  } catch (err) {
    console.error(' Error submitting answers:', err);
    return res.status(500).send('Error submitting answers');
  }
});

app.post('/reset-quiz', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await db.query('DELETE FROM user_answers WHERE user_id = $1', [userId]);
        res.redirect('/user-dashboard');
    } catch (err) {
        res.status(500).send('Failed to reset quiz');
    }
});

app.get('/admin', authenticateToken, ensureAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.username, COALESCE(us.highest_score, 0) AS highest_score
            FROM users u
            LEFT JOIN user_scores us ON u.user_id = us.user_id
            WHERE u.is_admin = FALSE
            ORDER BY u.username
        `);

        const questions = await db.query(`
            SELECT q.question_id, q.question_text, 
                   json_agg(json_build_object('answer_id', a.answer_id, 'answer_text', a.answer_text, 'is_correct', a.is_correct)) AS answers
            FROM questions q
            JOIN answers a ON q.question_id = a.question_id
            GROUP BY q.question_id
        `);

        res.render('admin_dashboard', { scores: result.rows, questions: questions.rows });
    } catch (err) {
        res.status(500).send('Failed to load admin dashboard');
    }
});

app.post('/admin/questions', authenticateToken, ensureAdmin, async (req, res) => {
    const { questionText, answers } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO questions (question_text) VALUES ($1) RETURNING question_id',
            [questionText]
        );
        const questionId = result.rows[0].question_id;
        for (let answer of answers) {
            await db.query(
                'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3)',
                [questionId, answer.text, answer.isCorrect === 'on']
            );
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Failed to add question');
    }
});

app.post('/admin/questions/:id/delete', authenticateToken, ensureAdmin, async (req, res) => {
    const questionId = req.params.id;

    try {
        // Step 1: Get all answer IDs for this question
        const answersRes = await db.query(
            'SELECT answer_id FROM answers WHERE question_id = $1',
            [questionId]
        );
        const answerIds = answersRes.rows.map(row => row.answer_id);

        // Step 2: Delete user_answers referencing those answers
        if (answerIds.length > 0) {
            await db.query(
                'DELETE FROM user_answers WHERE selected_answer = ANY($1)',
                [answerIds]
            );
        }

        // Step 3: Delete answers for this question
        await db.query('DELETE FROM answers WHERE question_id = $1', [questionId]);

        // Step 4: Delete the question itself
        await db.query('DELETE FROM questions WHERE question_id = $1', [questionId]);

        res.redirect('/admin');
    } catch (err) {
        console.error('Failed to delete question:', err);
        res.status(500).send('Failed to delete question');
    }
});

app.post('/admin/questions/:id/edit', authenticateToken, ensureAdmin, async (req, res) => {
    const questionId = req.params.id;
    const { questionText, answers } = req.body;

    try {
        // Step 1: Fetch all answer_ids for this question
        const existingAnswers = await db.query(
            'SELECT answer_id FROM answers WHERE question_id = $1',
            [questionId]
        );
        const answerIds = existingAnswers.rows.map(row => row.answer_id);

        if (answerIds.length > 0) {
            // Step 2: Delete user_answers that refer to those answers
            await db.query(
                'DELETE FROM user_answers WHERE selected_answer = ANY($1)',
                [answerIds]
            );
        }

        // Step 3: Now safe to delete answers
        await db.query('DELETE FROM answers WHERE question_id = $1', [questionId]);

        // Step 4: Update question text
        await db.query('UPDATE questions SET question_text = $1 WHERE question_id = $2', [questionText, questionId]);

        // Step 5: Insert new answers
        for (const key in answers) {
            const answer = answers[key];
            const answerText = answer.text;
            const isCorrect = answer.isCorrect === 'on' || answer.isCorrect === true;
            await db.query(
                'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3)',
                [questionId, answerText, isCorrect]
            );
        }

        res.redirect('/admin');
    } catch (err) {
        console.error('❌ Failed to update question:', err);
        res.status(500).send('Failed to update question');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Logout failed');
        res.redirect('/login');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
