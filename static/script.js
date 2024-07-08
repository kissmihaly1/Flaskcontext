    const guessedWords = new Set(JSON.parse(localStorage.getItem('guessedWords')) || []);

    document.addEventListener('DOMContentLoaded', () => {
        // Restore the previous state from localStorage
        if (guessedWords.size > 0) {
            restoreState();
        }
    });

    document.getElementById('submit-button').addEventListener('click', function () {
        let word = document.getElementById('word-input').value.trim().toLowerCase();

        if (guessedWords.has(word)) {
            // Highlight the existing word box
            let existingBox = document.querySelector(`[data-word="${word}"]`);
            existingBox.classList.add('highlight');
            setTimeout(() => {
                existingBox.classList.remove('highlight');
            }, 1000);
        } else {
            fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: word })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    guessedWords.add(word);
                    localStorage.setItem('guessedWords', JSON.stringify(Array.from(guessedWords)));

                    if (data.rank === 1) {
                        // Show congratulations page
                        document.body.innerHTML = `
                            <div class="container">
                                <header>
                                    <h1>Congratulations!</h1>
                                </header>
                                <main>
                                    <p>You have guessed the correct word: <strong>${data.word}</strong></p>
                                    <p>Number of guesses: <span id="guesses-count">${guessedWords.size}</span></p>
                                </main>
                            </div>
                        `;
                        return;
                    }

                    let resultContainer = document.getElementById('results');

                    // Create the box for the current guessed word
                    let guessedWordBox = document.createElement('div');
                    guessedWordBox.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank), 'current-guess');
                    guessedWordBox.id = 'guessed-word-box';
                    guessedWordBox.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                    // Insert the guessed word box at the top
                    resultContainer.prepend(guessedWordBox);

                    // Create a line separator if it doesn't exist
                    let separator = document.getElementById('separator');
                    if (!separator) {
                        separator = document.createElement('hr');
                        separator.id = 'separator';
                        resultContainer.appendChild(separator);
                    }

                    // Create the new result box
                    let newResult = document.createElement('div');
                    newResult.classList.add('result-box', getColorClass(data.rank));
                    newResult.setAttribute('data-word', word);
                    newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                    // Insert the new result in the correct position based on the rank
                    let inserted = false;
                    let resultBoxes = resultContainer.getElementsByClassName('result-box');
                    for (let i = 0; i < resultBoxes.length; i++) {
                        let rank = parseInt(resultBoxes[i].querySelector('span:nth-child(2)').textContent);
                        if (data.rank < rank) {
                            resultContainer.insertBefore(newResult, resultBoxes[i]);
                            inserted = true;
                            break;
                        }
                    }

                    if (!inserted) {
                        resultContainer.appendChild(newResult);
                    }

                    document.getElementById('faq-section').classList.add('hidden');
                    document.querySelector('.instructions').classList.add('hidden');
                    let guessesCount = document.getElementById('guesses-count');
                    guessesCount.innerText = parseInt(guessesCount.innerText) + 1;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    function restoreState() {
        let resultContainer = document.getElementById('results');
        let isFirst = true;
        guessedWords.forEach(word => {
            fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: word })
            })
            .then(response => response.json())
            .then(data => {
                if (data.rank === 1) {
                    // Show congratulations page
                    document.body.innerHTML = `
                        <div class="container">
                            <header>
                                <h1>Congratulations!</h1>
                            </header>
                            <main>
                                <p>You have guessed the correct word: <strong>${data.word}</strong></p>
                                <p>Number of guesses: <span id="guesses-count">${guessedWords.size}</span></p>
                            </main>
                        </div>
                    `;
                    return;
                }

                if (isFirst) {
                    // Create the box for the current guessed word
                    let guessedWordBox = document.createElement('div');
                    guessedWordBox.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank), 'current-guess');
                    guessedWordBox.id = 'guessed-word-box';
                    guessedWordBox.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                    // Insert the guessed word box at the top
                    resultContainer.prepend(guessedWordBox);

                    // Create a line separator if it doesn't exist
                    let separator = document.getElementById('separator');
                    if (!separator) {
                        separator = document.createElement('hr');
                        separator.id = 'separator';
                        resultContainer.appendChild(separator);
                    }

                    isFirst = false;
                }

                // Create the new result box
                let newResult = document.createElement('div');
                newResult.classList.add('result-box', getColorClass(data.rank));
                newResult.setAttribute('data-word', word);
                newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                // Insert the new result in the correct position based on the rank
                let inserted = false;
                let resultBoxes = resultContainer.getElementsByClassName('result-box');
                for (let i = 0; i < resultBoxes.length; i++) {
                    let rank = parseInt(resultBoxes[i].querySelector('span:nth-child(2)').textContent);
                    if (data.rank < rank) {
                        resultContainer.insertBefore(newResult, resultBoxes[i]);
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    resultContainer.appendChild(newResult);
                }

                document.getElementById('faq-section').classList.add('hidden');
                document.querySelector('.instructions').classList.add('hidden');
                let guessesCount = document.getElementById('guesses-count');
                guessesCount.innerText = guessedWords.size;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    function getColorClass(rank) {
        if (rank <= 1000) {
            return 'green-box';
        } else if (rank <= 5000) {
            return 'orange-box';
        } else {
            return 'red-box';
        }
    }

