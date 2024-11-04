document.addEventListener("DOMContentLoaded", function () {
    // Select the form element
    const questionnaireForm = document.getElementById("questionnaire-form");

    // Validate form submission to ensure all questions are answered
    questionnaireForm.addEventListener("submit", function (event) {
        const unansweredQuestions = [];

        // Loop through each question fieldset to check if an answer is selected
        document.querySelectorAll("fieldset.question").forEach((fieldset, index) => {
            const selectedAnswer = fieldset.querySelector("input[type='radio']:checked");

            // If no answer is selected, add the question index to the list
            if (!selectedAnswer) {
                unansweredQuestions.push(index + 1); // Display as 1-indexed for user clarity
            }
        });

        // If there are unanswered questions, prevent form submission and alert the user
        if (unansweredQuestions.length > 0) {
            event.preventDefault();
            alert("Please answer all questions before submitting.");
        }
    });

    // Enhance the radio button labels to highlight the selected answer
    document.querySelectorAll("input[type='radio']").forEach((radio) => {
        radio.addEventListener("change", function () {
            // Remove highlight from other options in the same question
            const parentFieldset = radio.closest("fieldset.question");
            parentFieldset.querySelectorAll("label").forEach(label => label.classList.remove("selected"));

            // Add highlight to the selected option
            radio.closest("label").classList.add("selected");
        });
    });
});
