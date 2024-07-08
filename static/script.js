    const currentDate = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('gameDate');
    let guessedWords = new Set();
    let savedResults = [];
    let guessesCount = 0;
    let solutionGuessed = false;
    let giveUp = false;

    if (storedDate !== currentDate) {
        localStorage.setItem('gameDate', currentDate);
    } else {
        guessedWords = new Set(JSON.parse(localStorage.getItem(`guessedWords_${currentDate}`) || '[]'));
        savedResults = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');
        guessesCount = localStorage.getItem(`guessesCount_${currentDate}`) || 0;
        solutionGuessed = localStorage.getItem(`solutionGuessed_${currentDate}`) === 'true';
        giveUp = localStorage.getItem(`giveUp_${currentDate}`) === 'true';
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        document.getElementById('game-number').innerText = `${currentDate}`;

        if (solutionGuessed) {
            const solutionWord = savedResults.find(result => result.rank === 1).word;
            showCongratulationsPage(solutionWord, guessedWords.size);
            return;
        }
        if (giveUp){
            handleGiveUp();
            return;
        }

        document.getElementById('guesses-count').innerText = guessesCount;

        let resultContainer = document.getElementById('results');

        if (savedResults.length > 0) {
            savedResults.sort((a, b) => a.rank - b.rank);
            document.querySelector('.instructions').classList.add('hidden');
            document.getElementById('faq-section').classList.add('hidden');

            let lastOne = [...guessedWords].pop();
            let latestGuess = savedResults.find(pair => pair.word === lastOne);
            let guessedWordBox = document.createElement('div');
            guessedWordBox.classList.add('result-box', 'guessed-word-box', getColorClass(latestGuess.rank));
            guessedWordBox.id = 'guessed-word-box';
            guessedWordBox.innerHTML = `<span>${latestGuess.word}</span> <span>${latestGuess.rank}</span>`;
            resultContainer.prepend(guessedWordBox);

            let separator = document.createElement('hr');
            separator.id = 'separator';
            resultContainer.appendChild(separator);

            savedResults.forEach(data => {
                let newResult = document.createElement('div');
                newResult.classList.add('result-box', getColorClass(data.rank));
                newResult.setAttribute('data-word', data.word);
                newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;
                resultContainer.appendChild(newResult);
            });
        }
    });

    function handleGuess() {
        let word = document.getElementById('word-input').value.trim().toLowerCase();
        document.getElementById('word-input').value = '';

        if (guessedWords.has(word)) {
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
                    showError(data.error);
                } else {
                    guessedWords.add(word);
                    localStorage.setItem(`guessedWords_${currentDate}`, JSON.stringify([...guessedWords]));

                    if (data.rank === 1) {
                        const results = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');
                        results.push(data);
                        localStorage.setItem(`results_${currentDate}`, JSON.stringify(results));
                        localStorage.setItem(`solutionGuessed_${currentDate}`, 'true');
                        showCongratulationsPage(data.word, guessedWords.size);
                        return;
                    }

                    let resultContainer = document.getElementById('results');

                    let guessedWordBox = document.getElementById('guessed-word-box');
                    if (guessedWordBox) {
                        guessedWordBox.remove();
                    }

                    guessedWordBox = document.createElement('div');
                    guessedWordBox.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank));
                    guessedWordBox.id = 'guessed-word-box';
                    guessedWordBox.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                    resultContainer.prepend(guessedWordBox);

                    let separator = document.getElementById('separator');
                    if (!separator) {
                        separator = document.createElement('hr');
                        separator.id = 'separator';
                        resultContainer.appendChild(separator);
                    }

                    let newResult = document.createElement('div');
                    newResult.classList.add('result-box', getColorClass(data.rank));
                    newResult.setAttribute('data-word', word);
                    newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

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

                    const results = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');
                    results.push(data);
                    results.sort((a, b) => a.rank - b.rank);
                    localStorage.setItem(`results_${currentDate}`, JSON.stringify(results));

                    document.getElementById('faq-section').classList.add('hidden');
                    document.querySelector('.instructions').classList.add('hidden');
                    guessesCount = parseInt(guessesCount) + 1;
                    document.getElementById('guesses-count').innerText = guessesCount;
                    localStorage.setItem(`guessesCount_${currentDate}`, guessesCount);
                }
            })
            .catch(error => {
                showError(error);
            });
        }
    }

    document.getElementById('submit-button').addEventListener('click', handleGuess);
    document.getElementById('word-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });

    function getColorClass(rank) {
        if (rank <= 1000) {
            return 'green';
        } else if (rank <= 5000) {
            return 'orange';
        } else {
            return 'red';
        }
    }

    function showCongratulationsPage(word, guessCount) {
        let green_number = 0;
        let orange_number = 0;
        let red_number = 0;
        const savedResults = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');

        savedResults.forEach(data => {
            if (data.rank <= 1000) {
                green_number += 1;
            } else if (data.rank <= 5000) {
                orange_number += 1;
            } else {
                red_number += 1;
            }
        });

        document.body.innerHTML = `
            <div class="congrats">
                <header>
                    <h1>KONT<span class="highlight">EXTUS</span></h1>
                    <hr>
                    <h1>Gratulálok!</h1>
                </header>
                <main>
                    <p>Eltaláltad a titkos szót: <strong>${word}</strong></p>
                    <p>Tippek száma: <span id="guesses-count">${guessCount}</span></p>
                    <p>🟩: <span>${green_number}</span></p>
                    <p>🟧: <span>${orange_number}</span></p>
                    <p>🟥: <span>${red_number}</span></p>
                    <p>A következő napi játék: </p><div id="countdown"></div>
                    
                </main>

            </div>
        `;
        startCountdown();
    }
    document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('give-up').addEventListener('click', handleGiveUp);
    document.getElementById('hint').addEventListener('click', handleHint);
    document.getElementById('informations').addEventListener('click', handleInformations);
    document.querySelector('.dropbtn').addEventListener('click', toggleDropdown);

    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropbtn')) {
            let dropdowns = document.getElementsByClassName('dropdown-content');
            for (let i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if (openDropdown.style.display === 'block') {
                    openDropdown.style.display = 'none';
                }
            }
        }
    });

    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        let modal = document.getElementById('modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});

function toggleDropdown() {
    let dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

function handleGiveUp() {
    localStorage.setItem(`giveUp_${currentDate}`, 'true');
    fetch('/giveup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
        .then(response => response.json())
        .then(data => {
            const solutionWord = data.solution_word;
            document.body.innerHTML = `
                <div class="giveup">
                    <header>
                        <h1>A mai játék feladva</h1>
                    </header>
                    <main>
                        <p>A megoldás a <strong>${solutionWord}</strong> szó volt. Próbáld meg holnap is!</p>
                    
                        <p>A következő napi játék: </p><div id="countdown"></div>

                    </main>
                </div>
            `;
            startCountdown();

        })
        .catch(error => {
                showError(error);
        });

}
        function handleHint() {
            savedResults = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');
            const best_yet = savedResults.reduce((best, current) => {
                return (current.rank < best.rank) ? current : best;
            }, savedResults[0]);
            let best_rank = best_yet.rank;
            fetch('/hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ best_rank: best_rank})
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showError(data.error);
                } else {
                    if (data === 'None') {
                        showError(data.error);
                    }
                    word=data.word;
                    guessedWords.add(word);
                    localStorage.setItem(`guessedWords_${currentDate}`, JSON.stringify([...guessedWords]));

                    let resultContainer = document.getElementById('results');

                    let guessedWordBox = document.getElementById('guessed-word-box');
                    if (guessedWordBox) {
                        guessedWordBox.remove();
                    }

                    guessedWordBox = document.createElement('div');
                    guessedWordBox.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank));
                    guessedWordBox.id = 'guessed-word-box';
                    guessedWordBox.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

                    resultContainer.prepend(guessedWordBox);

                    let separator = document.getElementById('separator');
                    if (!separator) {
                        separator = document.createElement('hr');
                        separator.id = 'separator';
                        resultContainer.appendChild(separator);
                    }

                    let newResult = document.createElement('div');
                    newResult.classList.add('result-box', getColorClass(data.rank));
                    newResult.setAttribute('data-word', word);
                    newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

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

                    const results = JSON.parse(localStorage.getItem(`results_${currentDate}`) || '[]');
                    results.push(data);
                    results.sort((a, b) => a.rank - b.rank);
                    localStorage.setItem(`results_${currentDate}`, JSON.stringify(results));

                    document.getElementById('faq-section').classList.add('hidden');
                    document.querySelector('.instructions').classList.add('hidden');
                    guessesCount = parseInt(guessesCount) + 1;
                    document.getElementById('guesses-count').innerText = guessesCount;
                    localStorage.setItem(`guessesCount_${currentDate}`, guessesCount);
                }
            })
            .catch(error => {
                showError(error);

            });
        }

function handleInformations() {
    let modal = document.getElementById('modal');
    modal.style.display = 'block';
}

function closeModal() {
    let modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function startCountdown() {
            const countdownElement = document.getElementById('countdown');

            function updateCountdown() {
                const now = new Date();
                const endOfDay = new Date();
                endOfDay.setHours(24, 0, 0, 0); // 0:00:00 of next day

                const totalSeconds = (endOfDay - now) / 1000;

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = Math.floor(totalSeconds % 60);

                countdownElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            updateCountdown();
            setInterval(updateCountdown, 1000);
        }

        document.addEventListener('DOMContentLoaded', startCountdown);


let cooldown = false;

function showError(message) {
    if (cooldown) return;

    cooldown = true;

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);

    setTimeout(() => {
        errorElement.classList.add('show');
    }, 10);

    setTimeout(() => {
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.remove();
            cooldown = false;
        }, 300);
    }, 3000);
}


//TODO
    //újrakezdés gomb
    //
    //