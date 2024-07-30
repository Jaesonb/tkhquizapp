// Mock data for user scores
const userScores = [
    { username: 'user1', score: 90 },
    { username: 'user2', score: 85 },
    { username: 'user3', score: 78 }
];

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