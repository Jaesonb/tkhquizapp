// document.getElementById('loginForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     fetch('/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//     })
//     .then(response => response.text())
//     .then(data => {
//         document.getElementById('message').innerText = data;
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });
// });


document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;


            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.text())
            .then(data => {
                if (data === 'Invalid username or password') {
                    alert(data);
                } else {
                    window.location.href = data;
                }
            });


            // // Mock login function
            // if (username === 'admin' && password === 'admin') {
            //     window.location.href = '/frontend/admin/admin.html';
            // } else {
            //     window.location.href = '/frontend/guest//guest.html';
            // }
        });
    }
});