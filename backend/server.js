const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();

const app = express();
const port = 5500;

const db = pgp('postgres://user:jhb77@localhost:5432/thekernelhub_login');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'frontend/login/index.html');
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
    console.log(`Server running at http://localhost:${5500}/`);
});
