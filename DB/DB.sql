CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Questions table
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL
);

-- User answers table for storing individual responses
CREATE TABLE user_answers (
    response_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    selected_answer INTEGER REFERENCES answers(answer_id), -- Foreign key to answers table
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User scores table with a unique constraint on user_id to ensure one score entry per user
CREATE TABLE user_scores (
    score_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) UNIQUE ON DELETE CASCADE,
    highest_score INTEGER DEFAULT 0
);

-- Answers table for storing multiple-choice options for each question
CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);


ALTER TABLE questions
DROP COLUMN correct_answer;

ALTER TABLE user_answers
DROP COLUMN score;

ALTER TABLE user_answers
DROP CONSTRAINT user_answers_user_id_fkey;

ALTER TABLE user_answers
ADD CONSTRAINT user_answers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE user_scores
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

ALTER TABLE user_scores
DROP CONSTRAINT user_scores_user_id_fkey;

ALTER TABLE user_scores
ADD CONSTRAINT user_scores_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE user_answers
DROP CONSTRAINT user_answers_question_id_fkey;

ALTER TABLE user_answers
ADD CONSTRAINT user_answers_question_id_fkey
FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE;

-- Rename answer_id to response_id in user_answers
ALTER TABLE user_answers
RENAME COLUMN answer_id TO response_id;

-- Change selected_answer column in user_answers to INTEGER to match answers.answer_id
ALTER TABLE user_answers
ALTER COLUMN selected_answer TYPE INTEGER USING selected_answer::integer;

-- Add foreign key constraint to link selected_answer in user_answers to answer_id in answers
ALTER TABLE user_answers
ADD CONSTRAINT fk_selected_answer
FOREIGN KEY (selected_answer) REFERENCES answers(answer_id);


-- Set selected_answer in user_answers as a foreign key referencing answers(answer_id)
ALTER TABLE user_answers
ADD CONSTRAINT fk_selected_answer
FOREIGN KEY (selected_answer) REFERENCES answers(answer_id);

--FOREIGN KEY with ON DELETE CASCADE to answers(answer_id):
ALTER TABLE user_answers
DROP CONSTRAINT fk_selected_answer;

ALTER TABLE user_answers
ADD CONSTRAINT fk_selected_answer
FOREIGN KEY (selected_answer) REFERENCES answers(answer_id) ON DELETE CASCADE;

SELECT answer_id, answer_text, question_id
FROM answers
ORDER BY answer_id;


DELETE FROM user_answers;

DELETE FROM questions;

DELETE FROM user_scores;

DELETE FROM users;

ALTER SEQUENCE users_user_id_seq RESTART WITH 1;

ALTER SEQUENCE questions_question_id_seq RESTART WITH 1;

ALTER SEQUENCE answers_answer_id_seq RESTART WITH 1;

ALTER SEQUENCE user_scores_score_id_seq RESTART WITH 1;

SELECT *
FROM users
WHERE username = 'user8';

SELECT *
FROM questions
WHERE question_text = 'testq1';


select * from users
select * from questions
select * from user_answers
select * from answers
select * from user_scores
