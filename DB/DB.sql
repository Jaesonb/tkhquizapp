CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL -- removed later by query
);

-- User answers for storing user responses
CREATE TABLE user_answers (
    answer_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    question_id INTEGER REFERENCES questions(question_id),
    selected_answer TEXT,
    is_correct BOOLEAN,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User scores table
CREATE TABLE user_scores (
    score_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    highest_score INTEGER DEFAULT 0
);

-- Answers table for storing multiple-choice answers for each question
CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

ALTER TABLE questions
DROP COLUMN correct_answer;


select * from users
select * from questions
select * from answers
select * from user_scores