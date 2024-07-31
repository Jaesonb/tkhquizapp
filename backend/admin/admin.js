// Mock data for user scores - Delete this
document.addEventListener('DOMContentLoaded', (event) => {
    const userScores = [
        { username: 'user1', score: 90 },
        { username: 'user2', score: 85 },
        { username: 'user3', score: 78 }
    ];

    const userScoresTableBody = document.querySelector('#user-scores-table tbody');

    userScores.forEach(user => {
        const tr = document.createElement('tr');
        
        const usernameTd = document.createElement('td');
        usernameTd.textContent = user.username;
        tr.appendChild(usernameTd);
        
        const scoreTd = document.createElement('td');
        scoreTd.textContent = user.score;
        tr.appendChild(scoreTd);
        
        userScoresTableBody.appendChild(tr);
    });
});

//navbar toggle effect
document.querySelector('.navbar-toggler').addEventListener('click', function() {
    var icon = document.querySelector('#togglerIcon');
    if (icon.innerHTML === 'close') {
      icon.innerHTML = 'menu';
    } else {
      icon.innerHTML = 'close';
    }
  });

const userScoresTable = document.getElementById('userScores');
    if (userScoresTable) {
        fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                const row = document.createElement('tr');
                const usernameCell = document.createElement('td');
                const scoreCell = document.createElement('td');
                usernameCell.textContent = user.username;
                scoreCell.textContent = user.score;
                row.appendChild(usernameCell);
                row.appendChild(scoreCell);
                userScoresTable.appendChild(row);
            });
        });
    }

    const userScore = document.getElementById('userScore');
    if (userScore) {
        const username = 'guestUser'; // Replace with the actual logged-in username
        fetch(`/api/score/${username}`)
        .then(response => response.json())
        .then(data => {
            userScore.textContent = `Score: ${data.score}`;
        });
    }

// // Mock data for user's score (guest)
// const userScore = document.getElementById('userScore');
// if (userScore) {
//     userScore.textContent = 'Score: 85';
// }

/* Temporary hardcoded questions and answers */

// const questions = document.getElementById('questions');
//     const answer = document.getElementById('answer');

//     const answers = {
//         q1: 'Using socially available mediums to reveal or identify specific information.',
//         q2: 'Store it in the password manager only.',
//         q3: 'Report it to the security team.'
//     };

//     questions.addEventListener('change', (event) => {
//         const selectedQuestion = event.target.value;
//         answer.textContent = answers[selectedQuestion] || '';
//     });


// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { Pool } = require('pg');

// const app = express();
// const port = process.env.PORT || 3000;

// // Connect to PostgreSQL
// const db = pgp(process.env.DATABASE_URL);

// app.use(cors());
// app.use(bodyParser.json());

// app.get('/faqs', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM questions');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post('/faqs', async (req, res) => {
//   const { question, answer } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING *',
//       [question, answer]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


document.addEventListener('DOMContentLoaded', (event) => {


    const questions = document.getElementById('questions');
    const answer = document.getElementById('answer');

    const answers = {
        q1: 'Using socially available mediums to reveal or identify specific information',
        q2: 'Store it in the password manager only',
        q3: 'Report it to the security team'
    };

    questions.addEventListener('change', (event) => {
        const selectedQuestion = event.target.value;
        answer.textContent = answers[selectedQuestion] || '';
    });
});