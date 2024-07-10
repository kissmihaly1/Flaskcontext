const currentDate = new Date().toLocaleDateString();
const storedGameData = JSON.parse(localStorage.getItem(currentDate)) || {};
let guessedWords = new Set(storedGameData.guessedWords || []);
let savedResults = storedGameData.results || [];
let guessesCount = storedGameData.guessesCount || 0;
let solutionGuessed = storedGameData.solutionGuessed || false;
let giveUp = storedGameData.giveUp || false;
let streak = parseInt(localStorage.getItem('streak')) || 0;
let lastSolvedDate = localStorage.getItem('lastSolvedDate') || null;
let hintCount = storedGameData.hintCount || 0;


// Check if there's stored game data for today, if not initialize new data
if (!storedGameData || storedGameData.date !== currentDate) {
    localStorage.setItem(currentDate, JSON.stringify({ date: currentDate }));
    localStorage.removeItem('giveUp');
    hintCount = 0;
}

// Setup the game on DOM content loaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('game-number').innerText = `${currentDate}`;

    if (solutionGuessed) {
        const solutionWord = savedResults.find(result => result.rank === 1).word;
        showCongratulationsPage(solutionWord, savedResults.length);
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
            if (latestGuess.word === data.word){
                newResult.classList.add('guessed-word-box');
            }
            newResult.classList.add('result-box', getColorClass(data.rank));
            newResult.setAttribute('data-word', data.word);
            newResult.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;
            resultContainer.appendChild(newResult);

        });
    }

    document.getElementById('streak').innerText = streak;
});

// Handle a new guess submission
function handleGuess() {
    const newCurrentDate = new Date().toLocaleDateString();

    if (currentDate !== newCurrentDate) {
        localStorage.setItem(newCurrentDate, JSON.stringify({ date: newCurrentDate }));
        location.reload();
        return;
    }

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
                saveGameData();

                if (data.rank === 1) {
                    savedResults.push(data);
                    solutionGuessed = true;
                    saveGameData();
                    if (lastSolvedDate) {
                        const lastDate = new Date(lastSolvedDate);
                        const differenceInTime = new Date(newCurrentDate) - lastDate;
                        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

                        if (differenceInDays === -1) {
                            streak++;
                        } else {
                            streak = 0;
                        }
                    } else {
                        streak = 1;
                    }
                    localStorage.setItem('lastSolvedDate', currentDate);
                    localStorage.setItem('streak', streak);

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

                let allResultBoxes = resultContainer.getElementsByClassName('result-box');
                for (let box of allResultBoxes) {
                    box.classList.remove('guessed-word-box');
                }

                let newResult = document.createElement('div');
                newResult.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank));
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
                let lastOne = [...guessedWords].pop();
                let latestGuess = savedResults.find(pair => pair.word === lastOne);
                guessedWordBox.classList.add('guessed-word-box');
                guessedWordBox.id = 'guessed-word-box';

                if (!inserted) {
                    resultContainer.appendChild(newResult);
                }

                savedResults.push(data);
                savedResults.sort((a, b) => a.rank - b.rank);
                saveGameData();

                document.getElementById('faq-section').classList.add('hidden');
                document.querySelector('.instructions').classList.add('hidden');
                guessesCount = parseInt(guessesCount) + 1;
                document.getElementById('guesses-count').innerText = guessesCount;
                saveGameData();
            }
        })
        .catch(error => {
            showError(error);
        });
    }
}

// Add event listeners for guess submission
document.getElementById('submit-button').addEventListener('click', handleGuess);
document.getElementById('word-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

// Function to update the solutionGuessed flag in localStorage
function updateSolutionGuessed(currentDate, newValue) {
    let gameData = JSON.parse(localStorage.getItem(currentDate)) || {};

    gameData.solutionGuessed = newValue;

    localStorage.setItem(currentDate, JSON.stringify(gameData));
}

// Function to get CSS class for rank-based coloring
function getColorClass(rank) {
    if (rank <= 1000) {
        return 'green';
    } else if (rank <= 5000) {
        return 'orange';
    } else {
        return 'red';
    }
}

// Function to show the congratulations page after finding the solution word
function showCongratulationsPage(word, guessCount) {
    let green_number = 0;
    let orange_number = 0;
    let red_number = 0;
    const savedResults = JSON.parse(localStorage.getItem(currentDate)).results || [];

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
                <h1>KONT<span class="highlight">EXTUS</span>.</h1>
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
                <p>Sorozat: <span id="streak">${streak}</span> nap</p>
            </main>
        </div>
    `;
    startCountdown();
}


// Add event listeners for various UI interactions and modal behavior
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('give-up').addEventListener('click', (event) => {
        if (savedResults.length <= 0) {
            showError("Tippelned kell, mielőtt feladnád.");
            event.preventDefault();
            return;
        }

        showSurrenderModal();
    });

    document.getElementById('hint').addEventListener('click', handleHint);
    document.getElementById('informations').addEventListener('click', handleInformations);
    document.querySelector('.dropbtn').addEventListener('click', toggleDropdown);
    document.getElementById('game_info').addEventListener('click', gameInformations);

    // Surrender modal event listeners
    document.getElementById('close-surrender-modal').addEventListener('click', closeSurrenderModal);
    document.getElementById('close-game-info-modal').addEventListener('click', closeGameInformations);
    document.getElementById('close-info-modal').addEventListener('click', closeInformations);
    document.getElementById('cancel-surrender').addEventListener('click', closeSurrenderModal);
    document.getElementById('confirm-surrender').addEventListener('click', handleGiveUp);

    // Close modals and dropdowns when clicking outside them
    window.addEventListener('click', function(event) {
        let modal = document.getElementById('surrender-modal');
        let modalInfo = document.getElementById('modal_info');
        let modalGeneral = document.getElementById('modal');
        let dropdownContent = document.querySelector('.dropdown-content');

        if (event.target === modal || event.target === modalInfo || event.target === modalGeneral) {
            modal.style.display = 'none';
            modalInfo.style.display = 'none';
            modalGeneral.style.display = 'none';
        }

        if (!event.target.matches('.dropbtn')) {
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            }
        }
    });

    document.querySelector('.close').addEventListener('click', closeModal);
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
});

// Function to toggle the dropdown menu visibility
function toggleDropdown() {
    let dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

// Function to show the surrender modal
function showSurrenderModal() {
    document.getElementById('surrender-modal').style.display = 'block';
}

// Function to close the surrender modal
function closeSurrenderModal() {
    document.getElementById('surrender-modal').style.display = 'none';
}

// Function to close the game information modal
function closeGameInformations() {
    document.getElementById('modal_info').style.display = 'none';
}
// Function to close the general information modal
function closeInformations() {
    document.getElementById('modal').style.display = 'none';
}

// Function to close any modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal_info').style.display = 'none';
    document.getElementById('surrender-modal').style.display = 'none';
}

// Handle giving up the game
function handleGiveUp() {
    closeSurrenderModal();
    localStorage.setItem(`giveUp_${currentDate}`, 'true');
    localStorage.setItem('streak', 0);
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
                        <h1>KONT<span class="highlight">EXTUS</span>.</h1>
                        <hr>
                        <h1>A mai játék feladva</h1>
                    </header>
                    <main>
                        <p>A megoldás a(z) <strong>${solutionWord}</strong> szó volt. Próbáld meg holnap is!</p>
                    
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

// Handle requesting a hint
function handleHint() {
    if (savedResults.length <= 0) {
        showError("Tippelned kell, mielőtt segítséget kérnél.");
        event.preventDefault();
        return;
        }

    if (hintCount >= 4) {
        showError("Már elhasználtad a 4 tippedet mára.");
        return;
    }

    savedResults = JSON.parse(localStorage.getItem(currentDate)).results || [];
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
            word = data.word;
            guessedWords.add(word);
            saveGameData();

            let resultContainer = document.getElementById('results');

            let guessedWordBox = document.getElementById('guessed-word-box');
            if (guessedWordBox) {
                guessedWordBox.remove();
            }

            guessedWordBox = document.createElement('div');
            guessedWordBox.classList.add('result-box', 'guessed-word-box', 'current-hint', getColorClass(data.rank));
            guessedWordBox.innerHTML = `<span>${data.word}</span> <span>${data.rank}</span>`;

            resultContainer.prepend(guessedWordBox);

            let separator = document.getElementById('separator');
            if (!separator) {
                separator = document.createElement('hr');
                separator.id = 'separator';
                resultContainer.appendChild(separator);
            }

            let allResultBoxes = resultContainer.getElementsByClassName('result-box');
            for (let box of allResultBoxes) {
                box.classList.remove('guessed-word-box');
            }

            let newResult = document.createElement('div');
            newResult.classList.add('result-box', 'guessed-word-box', getColorClass(data.rank));
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
            let lastOne = [...guessedWords].pop();
            let latestGuess = savedResults.find(pair => pair.word === lastOne);
            guessedWordBox.classList.add('guessed-word-box');
            guessedWordBox.id = 'guessed-word-box';
            if (!inserted) {
                resultContainer.appendChild(newResult);
            }

            savedResults.push(data);
            savedResults.sort((a, b) => a.rank - b.rank);
            saveGameData();

            document.getElementById('faq-section').classList.add('hidden');
            document.querySelector('.instructions').classList.add('hidden');
            guessesCount = parseInt(guessesCount) + 1;
            document.getElementById('guesses-count').innerText = guessesCount;
            saveGameData();

            hintCount++;
            let gameData = JSON.parse(localStorage.getItem(currentDate)) || {};
            gameData.hintCount = hintCount;
            localStorage.setItem(currentDate, JSON.stringify(gameData));
        }
    })
    .catch(error => {
        showError(error);
    });
}

// Function to show the general information modal
function handleInformations() {
    let modal = document.getElementById('modal');
    modal.style.display = 'block';
}

// Function to show the game information modal
function gameInformations() {
    let modal = document.getElementById('modal_info');
    modal.style.display = 'block';
}

// Function to start the countdown timer for the next game
function startCountdown() {
    const countdownElement = document.getElementById('countdown');

    function updateCountdown() {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(24, 0, 0, 0);

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

// Function to show an error message

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

// Function to save the current game data to localStorage
function saveGameData() {
    const newCurrentDate = new Date().toLocaleDateString();
    const gameData = {
        date: newCurrentDate,
        guessedWords: [...guessedWords],
        results: savedResults,
        guessesCount: guessesCount,
        solutionGuessed: solutionGuessed,
        giveUp: giveUp,
        hintCount: hintCount
    };

    localStorage.setItem(newCurrentDate, JSON.stringify(gameData));
}


// TODO
//telefonnál ha máshova klikkelek akkor a dropdown menüről dobjon le, meg a modalokról is ha meg vannak nyitva és máshova
//automatizálni éjfélrere