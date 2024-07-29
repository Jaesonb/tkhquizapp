// Load environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();

const app = express();
const port = process.env.PORT;  // Use PORT from .env, default to 3000

// Use DATABASE_URL from environment variables
const db = pgp(process.env.DATABASE_URL);

// const app = express();
// const port = 3000;

// const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.oneOrNone('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password])
        .then(user => {
            if (user) {
                res.send('Login successful!');
            } else {
                res.send('Invalid username or password');
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
