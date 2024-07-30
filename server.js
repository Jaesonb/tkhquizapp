// // Load environment variables
// require('dotenv').config();

// const express = require('express');
// const bodyParser = require('body-parser');
// const pgp = require('pg-promise')();

// const app = express();
// const port = process.env.PORT;  // Use PORT from .env, default to 3000

// // Use DATABASE_URL from environment variables
// const db = pgp(process.env.DATABASE_URL);

// // const app = express();
// // const port = 3000;

// // const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     db.oneOrNone('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password])
//         .then(user => {
//             if (user) {
//                 res.send('Login successful!');
//             } else {
//                 res.send('Invalid username or password');
//             }
//         })
//         .catch(error => {
//             console.log(error);
//             res.status(500).send('Internal Server Error');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
// });

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Connect to PostgreSQL
const db = pgp(process.env.DATABASE_URL);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.oneOrNone('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password])
        .then(user => {
            if (user) {
                if (user.role === 'admin') {
                    res.redirect('/frontend/admin/admin.html');
                } else {
                    res.redirect('/frontend/guest/guest.html');
                }
            } else {
                res.send('Invalid username or password');
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
});

// API endpoint to get all users' scores (for admin)
app.get('/api/users', (req, res) => {
    db.any('SELECT username, score FROM users')
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
});

// API endpoint to add a new question (for admin)
app.post('/api/questions', (req, res) => {
    const { question } = req.body;
    db.none('INSERT INTO questions(question_text) VALUES($1)', [question])
        .then(() => {
            res.status(200).send('Question added');
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
});

// API endpoint to get user score (for guest)
app.get('/api/score/:username', (req, res) => {
    const { username } = req.params;
    db.oneOrNone('SELECT score FROM users WHERE username = $1', [username])
        .then(user => {
            if (user) {
                res.json({ score: user.score });
            } else {
                res.status(404).send('User not found');
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
