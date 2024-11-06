function checkGrammar() {
    const text = document.getElementById('textInput').value;
    const errorMessages = document.getElementById('errorMessages');
    errorMessages.innerHTML = '';  // Clear previous errors

    // Only send request if there's some text
    if (text.trim() === "") return;

    // Call LanguageTool API for grammar checking
    fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(text)}&language=en-US`
    })
    .then(response => response.json())
    .then(data => {
        if (data.matches.length === 0) {
            errorMessages.innerHTML = "<p>No issues found!</p>";
        } else {
            data.matches.forEach(match => {
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('error');
                errorDiv.innerHTML = ` 
                    <strong>${match.message}</strong> 
                    at position ${match.offset} for the word "<em>${match.context.text.slice(match.offset, match.offset + match.length)}</em>"
                `;

                // Tooltip for explaining the error
                const tooltip = document.createElement('div');
                tooltip.classList.add('error-tooltip');
                tooltip.textContent = `Suggested correction: ${match.replacements[0]?.value || 'No suggestion available'}`;
                errorDiv.appendChild(tooltip);

                // Suggestion list
                const suggestionsDiv = document.createElement('div');
                match.replacements.forEach(replacement => {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.classList.add('suggestion');
                    suggestionDiv.innerText = `Try: ${replacement.value}`;
                    suggestionDiv.onclick = function () {
                        applyCorrection(match.offset, match.length, replacement.value);
                    };
                    suggestionsDiv.appendChild(suggestionDiv);
                });
                errorDiv.appendChild(suggestionsDiv);
                errorMessages.appendChild(errorDiv);
            });
        }
    })
    .catch(error => {
        console.error('Error checking grammar:', error);
    });
}

function applyCorrection(offset, length, replacement) {
    const textArea = document.getElementById('textInput');
    const text = textArea.value;
    // Apply the replacement directly into the text
    const newText = text.slice(0, offset) + replacement + text.slice(offset + length);
    textArea.value = newText;
    checkGrammar();  // Recheck the text after the correction
}
