CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);

-- Insert a test user
INSERT INTO users (username, password) VALUES ('testuser', 'testpassword');
INSERT INTO users (username, password) VALUES ('admin', 'admin123');
INSERT INTO users (username, password) VALUES ('guest', 'guest123');


Select * from users; 

GRANT ALL PRIVILEGES ON DATABASE thekernelhub_login WHERE username = admin;

GRANT ALL PRIVILEGES ON DATABASE thekernelhub_login TO admin;

SELECT admin
FROM pg_roles
WHERE pg_has_role('admin');

SELECT * FROM pg_user;

SELECT * FROM pg_roles;

UPDATE users
SET password = 'jhb777'
WHERE username = 'admin';

-- Create questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create answers table
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Insert sample data into questions
INSERT INTO questions (question_text) VALUES ('What is the capital of France?');

-- Insert sample data into answers
INSERT INTO answers (question_id, answer_text) VALUES
(1, 'Paris'),
(1, 'Lyon'),
(1, 'Marseille');

Select * from questions; 

Select * from answers; 

UPDATE questions
SET question_text = 'what is social engineering?'
WHERE id = '1';

UPDATE answers
SET answer_text = 'I dont know'
WHERE id = '3';
