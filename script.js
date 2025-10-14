// Wait for the entire HTML document to be loaded before running the script
document.addEventListener("DOMContentLoaded", function() {
    // Select the span element with the class 'role'
    const roleSpan = document.querySelector(".role");

    // The list of roles you want to display
    const roles = ["Data Engineer", "Web Developer", "Machine Learning Engineer","Coder","Full Stack Developer"];
    
    // Variables to track the current role and character
    let roleIndex = 0;
    let charIndex = 0;

    // Speeds for typing, deleting, and pausing (in milliseconds)
    const typingSpeed = 80;
    const deletingSpeed = 80;
    const pauseDuration = 600; // Pause after a word is fully typed

    function type() {
        if (charIndex < roles[roleIndex].length) {
            // Add one character at a time
            roleSpan.textContent += roles[roleIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        } else {
            // Once the word is typed, wait and then start erasing
            setTimeout(erase, pauseDuration);
        }
    }

    function erase() {
        if (charIndex > 0) {
            // Remove one character at a time
            roleSpan.textContent = roles[roleIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, deletingSpeed);
        } else {
            // Once the word is erased, move to the next role
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(type, typingSpeed);
        }
    }

    // Start the typing effect
    type();
});