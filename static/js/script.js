let gameDay;
let savedResults;
let giveUp;
let hintCount;
let solvedToday;
let lastGuess;
let cooldown;
let streak; // Initialize streak
let lastSolvedDay;
// Function to fetch the current game day from the backend
async function getDate() {
    return fetch('/checkdate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        return data.day;
    })
    .catch(error => {
        showError(error.message);
        throw error;
    });
}

// Function to initialize new game data
function initializeNewGameData() {
    return {
        results: [],
        guessesCount: 0,
        giveUp: false,
        hintCount: 0,
        solvedToday: false,
        lastGuess: []
    };
}

// Function to update game data in localStorage
function updateGameData(gameDay, dayData) {
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    gameData[gameDay] = dayData;
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// Function to update streak in localStorage
function updateStreak(streak, lastSolvedDay) {
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastSolvedDay', lastSolvedDay);
}

// Initialize gameDay when the page loads
window.addEventListener('load', () => {
    getDate().then(day => {
        gameDay = day;
        document.getElementById('game-number').innerText = `${gameDay}`;
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};

        // Load streak and last solved day from localStorage
        streak = parseInt(localStorage.getItem('streak')) || 0;
        lastSolvedDay = localStorage.getItem('lastSolvedDay');
        document.getElementById('streak').innerText = streak;
        // Check if data for the current game day exists
        let storedGameData = gameData[gameDay];

        if (!storedGameData) {
            // Initialize new game data for the current game day
            storedGameData = initializeNewGameData();
            updateGameData(gameDay, storedGameData);

            // If last solved day is not yesterday, reset the streak
            if (gameDay - lastSolvedDay !== 1) {
                streak = 0;
                updateStreak(streak, null);
            }
        } else {
            // At this point, `storedGameData` contains the current game day's data
            savedResults = storedGameData.results;
            guessesCount = savedResults.length;
            giveUp = storedGameData.giveUp;
            hintCount = storedGameData.hintCount;
            solvedToday = storedGameData.solvedToday;
            lastGuess = storedGameData.lastGuess;
            // Example of updating the current game day's data (if needed)
            let newDayData = {
                results: savedResults,
                guessesCount: guessesCount,
                giveUp: giveUp,
                hintCount: hintCount,
                solvedToday: solvedToday,
                lastGuess: lastGuess,
            };
            updateGameData(gameDay, newDayData);
            if (giveUp) {
                handleGiveUp();
                return;
            }
            if (solvedToday) {
                const solutionWord = savedResults.find(result => result.rank === 1).word;
                showCongratulationsPage(solutionWord, savedResults.length);
            } else {
                // Load existing boxes from results
                if (savedResults && savedResults.length > 0) {
                    const pElement = document.querySelector('p.find');
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <strong id="guesses-count">0</strong> | Sorozat: <span id="streak">0</span> nap | Segítségek száma: <span id="hint-left">5</span>';
                    document.getElementById('guesses-count').innerText = savedResults.length;
                    document.getElementById('hint-left').innerText = 5-hintCount;
                    document.querySelector('.instructions').classList.add('hidden');
                    document.querySelector('footer').classList.add('hidden');
                    const container = document.getElementById('results');
                    container.innerHTML = '';

                    // Create and insert the latest tip box (first occurrence of the current guess)
                    const latestResult = lastGuess;
                    createWordBox(latestResult.word, latestResult.rank, true);

                    // Add a separator line
                    const separator = document.createElement('div');
                    separator.classList.add('separator');
                    container.appendChild(separator);

                    // Sort the results by rank and create and insert all word boxes
                    savedResults.sort((a, b) => a.rank - b.rank);
                    savedResults.forEach(result => {
                        createWordBox(result.word, result.rank, result.word === latestResult.word);
                    });
                }
            }
        }
    }).catch(error => {
        console.error('Failed to check date and manage game data:', error);
    });
});

function handleGuess() {
    let word = document.getElementById('word-input').value.trim().toLowerCase();
    document.getElementById('word-input').value = '';

    getDate().then(day => {
        if(gameDay !== day){
        location.reload();
        return;
        }else{
    // Retrieve gameData from localStorage
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};

    // Check if gameDay matches the current game day
    if (!gameData[gameDay]) {
        location.reload(); // Reload the page if the current game day data is not found
        return;
    }

    // Retrieve results for the current game day
    let results = gameData[gameDay].results || [];

    let duplicateResult = results.find(result => result.word === word);
    if (duplicateResult) {
        // Find the box element and add the shake effect
        const boxes = document.querySelectorAll('.row-wrapper');
        boxes.forEach(box => {
            if (box.querySelector('.row span:first-child').textContent === word) {
                box.classList.add('shake');
                setTimeout(() => {
                    box.classList.remove('shake');
                }, 1000);
            }
        });
    } else {
        // Send the word to the backend
        gameData[gameDay].guessesCount += 1;
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
            const inputElement = document.getElementById('word-input');
                    inputElement.classList.add('shake');
                    setTimeout(() => {
                        inputElement.classList.remove('shake');
                    }, 1000);
                showError(data.error);
            } else {
                if (data.rank === 1) {
                    gameData[gameDay].solvedToday = true;
                    solvedToday = true;
                    streak += 1;
                    updateStreak(streak, gameDay);
                    results.push({ word: word, rank: data.rank });
                    gameData[gameDay].results = results;
                    localStorage.setItem('gameData', JSON.stringify(gameData));
                    let solutionWord = results.find(result => result.rank === 1)?.word;
                    showCongratulationsPage(solutionWord, results.length);
                } else {
                    const pElement = document.querySelector('p.find');
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <span id="guesses-count">0</span> | Sorozat: <span id="streak">0</span> nap | Segítségek száma: <span id="hint-left">5</span>';

                    document.querySelector('.instructions').classList.add('hidden');
                    document.querySelector('footer').classList.add('hidden');
                    results.push({ word: word, rank: data.rank });
                    gameData[gameDay].results = results;
                    lastGuess = { word: word, rank: data.rank };
                    gameData[gameDay].lastGuess = lastGuess;
                    localStorage.setItem('gameData', JSON.stringify(gameData));

                    document.getElementById('guesses-count').innerText = results.length;
                    document.getElementById('game-number').innerText = gameDay;
                    document.getElementById('streak').innerText = streak;
                    document.getElementById('hint-left').innerText = 5-hintCount;

                    // Clear previous results
                    const container = document.getElementById('results');
                    container.innerHTML = '';

                    // Create and insert the latest tip box (first occurrence of the current guess)
                    createWordBox(word, data.rank, true);

                    // Add a separator line
                    const separator = document.createElement('div');
                    separator.classList.add('separator');
                    container.appendChild(separator);

                    // Sort the results by rank and create and insert all word boxes
                    results.sort((a, b) => a.rank - b.rank);
                    results.forEach(result => {
                        createWordBox(result.word, result.rank, result.word === word);
                    });
                }
            }
        })
        .catch(error => {
            showError(error.message);
        });
    }
    }
    })
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

const getWidth = (rank) => {
    const total = 80000;
    const lambda = 0.5;
    const pdf = (x) => lambda * Math.exp(-lambda * x);
    const startX = 0;
    const endX = 100;
    const startY = pdf(startX);
    const endY = pdf(endX);
    const x = (rank / total) * (endX - startX);
    let result = ((pdf(x) - endY) / (startY - endY)) * 100;
    if (result < 1) {
        result = 1;
    }
    return `${result}%`;
};

function createWordBox(word, rank, isCurrent) {
    const container = document.getElementById('results'); // Assuming there's a container with id="results"

    const rowWrapper = document.createElement('div');
    rowWrapper.classList.add('row-wrapper');
    if (isCurrent) {
        rowWrapper.classList.add('current');
    }

    const outerBar = document.createElement('div');
    outerBar.classList.add('outer-bar');

    const innerBar = document.createElement('div');
    innerBar.classList.add('inner-bar');
    innerBar.style.width = getWidth(rank);
    innerBar.style.backgroundColor = getColorClass(rank);

    const row = document.createElement('div');
    row.classList.add('row');

    const wordSpan = document.createElement('span');
    wordSpan.textContent = word;

    const rankSpan = document.createElement('span');
    rankSpan.textContent = rank;

    row.appendChild(wordSpan);
    row.appendChild(rankSpan);
    outerBar.appendChild(innerBar);
    rowWrapper.appendChild(outerBar);
    rowWrapper.appendChild(row);
    container.appendChild(rowWrapper);
}

// Assuming you have defined the showError function as follows:
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

// Function to show the congratulations page after finding the solution word
function showCongratulationsPage(word, guessCount) {
    let green_number = 0;
    let orange_number = 0;
    let red_number = 0;

    // Get the results from localStorage
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let savedResults = gameData[gameDay]?.results || [];

    savedResults.forEach(data => {
        if (data.rank <= 1000) {
            green_number += 1;
        } else if (data.rank <= 5000) {
            orange_number += 1;
        } else {
            red_number += 1;
        }
    });
updateJsVariablesFromLocalStorage();
guessCount = guessCount-hintCount;
green_number = green_number - hintCount;
document.body.innerHTML = `
    <div class="congrats">
        <header>
            <h1 class="title">KONT<span class="highlight">EXTUS</span>.</h1>
            <hr>
        </header>
        <main class="congrats-main">
            <div class="solution">
                <h1 class="subtitle">Gratulálok!</h1>
                <p>Eltaláltad a titkos szót:</p>
                <strong class="solution-word">${word}</strong>

            </div>
            <div class="stats">
                <p>Tippek száma: <strong id="guesses-count">${guessCount}</strong> | Segítségek száma: <span id="hint-count">${hintCount}</span></p>

                <canvas id="colorBarChart" width="400" height="200"></canvas>
            </div>
            <div class="hints">
            </div>
            <div class="countdown-container">
                <p>A következő napi játék:</p>
                <div id="countdown"></div>
                <hr>
            </div>
            <div class="streak-container">
                <p>Sorozat: <strong id="streak">${streak}</strong> nap</p>
            </div>
        </main>
    </div>
`;

// Function to create the bar chart
function createColorBarChart(green, orange, red) {
    const ctx = document.getElementById('colorBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Zöld', 'Narancssárga', 'Piros'],
            datasets: [{
                label: '',
                data: [green, orange, red],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 69, 0, 0.7)'
                ],
                borderColor: [
                    'rgba(0, 255, 0, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(255, 69, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'end',
                    formatter: Math.round,
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    offset: 5
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    suggestedMax: Math.max(green, orange, red) + 6
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// Create the bar chart with the given numbers
createColorBarChart(green_number, orange_number, red_number);

    // Countdown to 00:00:00
    function updateCountdown() {
        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = nextMidnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown').innerHTML =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (diff <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = "00:00:00";
        }
    }

    updateCountdown(); // Initial call to display immediately
    const countdownInterval = setInterval(updateCountdown, 1000); // Update every second
}


// Add event listeners for various UI interactions and modal behavior
        document.addEventListener('DOMContentLoaded', (event) => {
            updateJsVariablesFromLocalStorage()
            document.getElementById('give-up').addEventListener('click', (event) => {
                let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
                let results = gameData[gameDay].results || [];
                if (results.length <= 0) {
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
            window.addEventListener('click', function (event) {
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

function handleGiveUp() {
    closeSurrenderModal();

    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    if (!gameData[gameDay]) {
        gameData[gameDay] = initializeNewGameData();
    }
    gameData[gameDay].giveUp = true;
    updateGameData(gameDay, gameData[gameDay]);

    streak = 0;
    updateStreak(streak, null);

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

        // Countdown to 00:00:00
        function updateCountdown() {
            const now = new Date();
            const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = nextMidnight - now;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('countdown').innerHTML =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (diff <= 0) {
                clearInterval(countdownInterval);
                document.getElementById('countdown').innerHTML = "00:00:00";
            }
        }

        updateCountdown(); // Initial call to display immediately
        const countdownInterval = setInterval(updateCountdown, 1000); // Update every second
    })
    .catch(error => {
        showError(error.message);
    });
}

function handleHint() {
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let results = gameData[gameDay].results || [];

    updateJsVariablesFromLocalStorage();
    if (savedResults.length <= 0) {
        showError("Tippelned kell, mielőtt segítséget kérnél.");
        event.preventDefault();
    } else {

        if (hintCount >= 5) {
            showError("Már elhasználtad az 5 tippedet mára.");
        } else {
            hintCount += 1;
            gameData[gameDay].hintCount = hintCount;
            document.getElementById('hint-left').innerText = 5-hintCount;

            const best_yet = savedResults.reduce((best, current) => {
                return (current.rank < best.rank) ? current : best;
            }, savedResults[0]);
            let best_rank = best_yet.rank;
            fetch('/hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({best_rank: best_rank})
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showError(data.error);
                    } else {
                        if (data === 'None') {
                            showError(data.error);
                        }else {
                    // Save the result to localStorage
                    lastGuess = { word: data.word, rank: data.rank };
                    gameData[gameDay].lastGuess = lastGuess;
                    results.push({ word: data.word, rank: data.rank });
                    gameData[gameDay].results = results;
                    localStorage.setItem('gameData', JSON.stringify(gameData));

                    // Clear previous results
                    const container = document.getElementById('results');
                    container.innerHTML = '';

                    // Create and insert the latest tip box (first occurrence of the current guess)
                    createWordBox(data.word, data.rank, true);

                    // Add a separator line
                    const separator = document.createElement('div');
                    separator.classList.add('separator');
                    container.appendChild(separator);

                    // Sort the results by rank and create and insert all word boxes
                    results.sort((a, b) => a.rank - b.rank);
                    results.forEach(result => {
                        createWordBox(result.word, result.rank, result.word === data.word);
                    });
                    updateGameData(gameDay, gameData[gameDay]);
                }

                    }
                });
        }
    }
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

function updateJsVariablesFromLocalStorage() {
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let lastSolvedDay = localStorage.getItem('lastSolvedDay');
    streak = parseInt(localStorage.getItem('streak')) || 0;

    if (gameData[gameDay]) {
        savedResults = gameData[gameDay].results || [];
        giveUp = gameData[gameDay].giveUp || false;
        hintCount = gameData[gameDay].hintCount || 0;
        solvedToday = gameData[gameDay].solvedToday || false;
        lastGuess = gameData[gameDay].lastGuess || null;
    } else {
        savedResults = [];
        giveUp = false;
        hintCount = 0;
        solvedToday = false;
        lastGuess = [];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const faqTitle = document.querySelector('.faq-title');
    const faqContent = document.querySelector('.faq-content');

    faqTitle.addEventListener('click', function() {
        if (faqContent.style.maxHeight) {
            faqContent.style.maxHeight = null;
        } else {
            faqContent.style.maxHeight = faqContent.scrollHeight + "px";
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
const faqTitle = document.querySelector('.faq-title2');
const faqContent = document.querySelector('.faq-content2');
const arrow = faqTitle.querySelector('.arrow');
faqTitle.addEventListener('click', function() {
    if (faqContent.style.maxHeight) {
        faqContent.style.maxHeight = null;
        arrow.classList.remove('rotate');
    } else {
        arrow.classList.add('rotate');
        faqContent.style.maxHeight = faqContent.scrollHeight + "px";
    }
});
});