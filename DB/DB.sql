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