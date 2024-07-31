document.addEventListener('DOMContentLoaded', async (event) => {
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

    const questions = document.getElementById('questions');
    const answer = document.getElementById('answer');

    const fetchFaqs = async () => {
        const response = await fetch('http://localhost:3000/faqs');
        return await response.json();
    };

    const populateQuestions = (faqs) => {
        faqs.forEach(faq => {
            const option = document.createElement('option');
            option.value = faq.id;
            option.textContent = faq.question;
            questions.appendChild(option);
        });
    };

    const faqs = await fetchFaqs();
    populateQuestions(faqs);

    questions.addEventListener('change', (event) => {
        const selectedQuestionId = event.target.value;
        const selectedFaq = faqs.find(faq => faq.id == selectedQuestionId);
        answer.textContent = selectedFaq ? selectedFaq.answer : '';
    });

    const addFaqForm = document.getElementById('add-faq-form');
    addFaqForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newQuestion = document.getElementById('new-question').value;
        const newAnswer = document.getElementById('new-answer').value;

        const response = await fetch('http://localhost:3000/faqs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: newQuestion, answer: newAnswer })
        });

        const addedFaq = await response.json();
        const option = document.createElement('option');
        option.value = addedFaq.id;
        option.textContent = addedFaq.question;
        questions.appendChild(option);

        addFaqForm.reset();
    });
});
