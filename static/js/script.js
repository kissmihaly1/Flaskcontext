let gameDay;
let savedResults;
let giveUp;
let hintCount;
let solvedToday;
let lastGuess;
let cooldown;
let streak;
let lastSolvedDay;
let lastGameID;
let numberofDays
let solved = 0;

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
        lastGuess: [],
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
        numberofDays = day;
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
        gameDay = gameData[lastGameID];
        if (!gameData[day]){
            gameDay = day;
            lastGameID = day;
        }else{
            gameDay = gameData.lastGameID;
        }
        document.getElementById('game-number').innerText = `${gameDay}`;


        // Load streak and last solved day from localStorage
        lastSolvedDay = localStorage.getItem('lastSolvedDay');
        document.getElementById('streak').innerText = solved;
        // Check if data for the current game day exists
        let storedGameData = gameData[gameDay];

        if (!storedGameData) {
            // Initialize new game data for the current game day
            storedGameData = initializeNewGameData();

            updateGameData(gameDay, storedGameData);
            let changeGameID = JSON.parse(localStorage.getItem('gameData')) || {};
            changeGameID.lastGameID = gameDay;
            localStorage.setItem('gameData', JSON.stringify(changeGameID));
        } else {
            // At this point, `storedGameData` contains the current game day's data
            savedResults = storedGameData.results;
            guessesCount = savedResults.length;
            giveUp = storedGameData.giveUp;
            hintCount = storedGameData.hintCount;
            solvedToday = storedGameData.solvedToday;
            lastGuess = storedGameData.lastGuess;
            lastGameID = storedGameData.lastGameID;
            // Example of updating the current game day's data (if needed)
            let newDayData = {
                results: savedResults,
                guessesCount: guessesCount,
                giveUp: giveUp,
                hintCount: hintCount,
                solvedToday: solvedToday,
                lastGuess: lastGuess,
                lastGameID: lastGameID,
            };
            updateGameData(gameDay, newDayData);
            if (giveUp) {
                handleGiveUp();
                return;
            }
            if (solvedToday) {
                solved = 0;
                for (let i = 1; i <= day; i++) {
                    if (gameData[i]) {
                        if (gameData[i].solvedToday === true) {
                            solved++;
                        }
                    }
                }
                const solutionWord = savedResults.find(result => result.rank === 1).word;
                showCongratulationsPage(solutionWord, savedResults.length);
            } else {
                solved = 0;
                for (let i = 1; i <= day; i++) {
                    if (gameData[i]) {
                        if (gameData[i].solvedToday === true) {
                            solved++;
                        }
                    }
                }
                document.getElementById('streak').innerText = solved;
                        // Load existing boxes from results
                if (savedResults && savedResults.length > 0) {
                    const pElement = document.querySelector('p.find');
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <strong id="guesses-count">0</strong> | Megoldva: <span id="streak">0</span> játék | Segítségek száma: <span id="hint-left">5</span>';
                    document.getElementById('guesses-count').innerText = savedResults.length;
                    document.getElementById('streak').innerText = solved;
                    document.getElementById('hint-left').innerText = 5-hintCount;
                    document.getElementById('game-number').innerText = gameDay;
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
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    getDate().then(day => {
        if(!gameData[day]){
        location.reload();
        return;
        }else{
    // Retrieve gameData from localStorage

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
            body: JSON.stringify({ word: word, day: gameDay })
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

                    results.push({ word: word, rank: data.rank });
                    gameData[gameDay].results = results;
                    localStorage.setItem('gameData', JSON.stringify(gameData));
                    let solutionWord = results.find(result => result.rank === 1)?.word;
                    showCongratulationsPage(solutionWord, results.length);
                } else {
                    const pElement = document.querySelector('p.find');
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <span id="guesses-count">0</span> | Megoldva: <span id="streak">0</span> játék | Segítségek száma: <span id="hint-left">5</span>';

                    document.querySelector('.instructions').classList.add('hidden');
                    document.querySelector('footer').classList.add('hidden');
                    results.push({ word: word, rank: data.rank });
                    gameData[gameDay].results = results;
                    lastGuess = { word: word, rank: data.rank };
                    gameData[gameDay].lastGuess = lastGuess;
                    localStorage.setItem('gameData', JSON.stringify(gameData));

                    document.getElementById('guesses-count').innerText = results.length;
                    document.getElementById('game-number').innerText = gameDay;
                    document.getElementById('streak').innerText = solved;
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
    }, 1500);
}
function showGameModal(){
    let modal = document.getElementById('modal-game');
    modal.style.display = 'block';
}
// Function to show the congratulations page after finding the solution word
function showCongratulationsPage(word, guessCount) {
    let green_number = 0;
    let orange_number = 0;
    let red_number = 0;

    // Get the results from localStorage
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let savedResults = gameData[gameDay]?.results || [];
    solved = 0;
    for (let i = 1; i <= numberofDays; i++) {
        if (gameData[i]) {
            if (gameData[i].solvedToday === true) {
                solved++;
            }
        }
    }
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
                <p>Eltaláltad a titkos szót: <strong class="solution-word">${word}</strong></p>

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
                <p>Megoldva: <strong id="streak">${solved}</strong> játék</p>
            </div>
                <div id="modal-game" class="modal-game">
                <div class="modal-content-game">
                    <span class="close" id="close-game-modal">&times;</span>
                    <h2>Korábbi játékok</h2>
                    <div id="box-container"></div>
                </div>
            </div>
               <div><button class="button" onclick="modalGame()">Játszanál még? További napok itt!</button></div>
        </main>
    </div>
`;
document.getElementById("close-game-modal").onclick = function() {
    document.getElementById("modal-game").style.display = "none";
};

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
            document.getElementById('game_choose').addEventListener('click', modalGame);

            // Surrender modal event listeners
            document.getElementById('close-surrender-modal').addEventListener('click', closeSurrenderModal);
            document.getElementById('close-game-modal').addEventListener('click', closeGameModal);
            document.getElementById('close-game-info-modal').addEventListener('click', closeGameInformations);
            document.getElementById('close-info-modal').addEventListener('click', closeInformations);
            document.getElementById('cancel-surrender').addEventListener('click', closeSurrenderModal);
            document.getElementById('confirm-surrender').addEventListener('click', handleGiveUp);

            // Close modals and dropdowns when clicking outside them
            window.addEventListener('click', function (event) {
                let modal = document.getElementById('surrender-modal');
                let modalInfo = document.getElementById('modal_info');
                let modalGame = document.getElementById('modal-game');
                let modalGeneral = document.getElementById('modal');
                let dropdownContent = document.querySelector('.dropdown-content');

                if (event.target === modal) {
                    modal.style.display = 'none';
                }
                if (event.target === modalInfo){
                    modalInfo.style.display = 'none';
                }

                if (event.target === modalGeneral){
                    modalGeneral.style.display = 'none';
                }

                if ( event.target === modalGame){
                    modalGame.style.display = 'none';
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
        function closeGameModal() {
            document.getElementById('modal-game').style.display = 'none';
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
            document.getElementById('modal-game').style.display = 'none';
        }

function handleGiveUp() {
    if (document.getElementById('surrender-modal')) {
        closeSurrenderModal();
    }
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    if (!gameData[gameDay]) {
        gameData[gameDay] = initializeNewGameData();
    }
    gameData[gameDay].giveUp = true;
    updateGameData(gameDay, gameData[gameDay]);
    solved = 0;
    for (let i = 1; i <= numberofDays; i++) {
        if (gameData[i]) {
            if (gameData[i].solvedToday === true) {
                solved++;
            }
        }
    }
    fetch('/giveup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ day: gameDay })
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
                    <p>A megoldás a(z) <strong class="orange">${solutionWord}</strong> szó volt. Próbáld meg holnap is!</p>
                    <p>A következő napi játék: </p><div id="countdown"></div>
                    <hr>
                    <div class="streak-container">
                        <p>Megoldva: <strong id="streak">${solved}</strong> játék</p>
                    </div>
                    <div><button class="button" onclick="modalGame()">Játszanál még? További napok itt!</button></div>

                    <div id="modal-game" class="modal-game">
                        <div class="modal-content">
                            <span class="close" id="close-game-modal">&times;</span>
                            <h2>Korábbi játékok</h2>
                            <div id="box-container"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
document.getElementById("close-game-modal").onclick = function() {
    document.getElementById("modal-game").style.display = "none";
};
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
                body: JSON.stringify({best_rank: best_rank, day: gameDay})
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
function modalGame() {

    createBoxes(numberofDays);
    let modal = document.getElementById('modal-game');
    modal.style.display = 'block';
    //HERE MAKE THE CHANGE GAME FOR THE CHOSEN DAY

    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let lastGameID = gameData.lastGameID;

}

function updateJsVariablesFromLocalStorage() {
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let lastSolvedDay = localStorage.getItem('lastSolvedDay');

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

});


    function createBoxes(number) {
        const container = document.getElementById('box-container');
        container.innerHTML = '';
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
        for (let i = number; i > 0; i--) {
                const box = document.createElement('div');
                if (i === gameDay) {
                    if (gameData[i]) {
                        if (gameData[i].solvedToday) {
                            box.className = 'box';
                            box.innerHTML = `<strong class="number">${i}</strong> <strong class="status"> Játék megoldva</strong>`;
                        } else if (gameData[i].giveUp) {
                            box.className = 'box';
                            box.innerHTML = `<strong class="number">${i}</strong> <strong class="status"> Játék feladva!</strong>`;
                        } else {
                            box.className = 'box';
                            box.innerHTML = `<strong class="number">${i}</strong>`;
                        }
                    } else {
                        box.className = 'box';
                        box.innerHTML = `<strong class="number current">${i}</strong>`;
                    }
                }else{
                                        if (gameData[i]) {
                        if (gameData[i].solvedToday) {
                            box.className = 'box';
                            box.innerHTML = `<span class="number">${i}</span> <strong class="status"> Játék megoldva</strong>`;
                        } else if (gameData[i].giveUp) {
                            box.className = 'box';
                            box.innerHTML = `<span class="number">${i}</span> <strong class="status"> Játék feladva!</strong>`;
                        } else {
                            box.className = 'box';
                            box.innerHTML = `<span class="number">${i}</span>`;
                        }
                    } else {
                        box.className = 'box';
                        box.innerHTML = `<span class="number">${i}</span>`;
                    }

                }

                box.addEventListener('click', function () {
                    let changeGameID = JSON.parse(localStorage.getItem('gameData')) || {};
                    changeGameID.lastGameID = i;
                    localStorage.setItem('gameData', JSON.stringify(changeGameID));
                    gameDay = i;
                    otherDayPlay(i);
                    location.reload();
                    lastGameID = i;
                    closeGameModal();
                    document.getElementById('game-number').innerText = `${i}`;
                });

                container.appendChild(box);
            }
    }
function updateBodyContent() {
        document.body.innerHTML = `
            <div class="container">
                <header class="header-flex">
                    <h1>KONT<span class="highlight">EXTUS</span>.</h1>
                    <div class="dropdown">
                        <button class="dropbtn">⋮</button>
                        <div class="dropdown-content">
                            <a href="#" id="give-up">Feladás</a>
                            <a href="#" id="hint">Segítség kérése</a>
                            <a href="#" id="informations">Információk</a>
                            <a href="#" id="game_info">A játékról</a>
                            <a href="#" id="game_choose">Korábbi napok játékai</a>
                        </div>
                    </div>
                </header>
                <hr>
                <p class="find">Nap: <span id="game-number"></span> |  Megoldva: <strong id="streak"></strong> játék</p>
                <main>
                    <input type="text" placeholder="írj ide egy szót..." id="word-input" aria-label="Word input">
                    <button id="submit-button">Küldés</button>
                    <div id="results"></div>
                    <section class="instructions">
                        <h2>Hogyan kell játszani?</h2>
                        <p>Találd meg a titkos szót. Egy pontszámot fogsz kapni a tippelt szó mellé, amely azt mutatja, hogy milyen közel áll a kontextusa (jelentése) a titkos szóhoz. Minél kisebb szám, annál jobb a tipp! A titkos szó az 1-es szám.</p>
                        <p>Korlátlan számú tipped van.</p>
                        <p>Csak 5 segítségkérést használhatsz egy nap!</p>
                        <p>A szavakat egy mesterséges intelligencia algoritmusa rendezte aszerint, hogy mennyire hasonlítanak a titkos szóhoz.</p>
                        <p><strong>A játék béta verzióban van, fejlesztés alatt áll!</strong></p>
                    </section>
                </main>
                <footer id="faq-section">
                    <h2>Gyakran Ismételt Kérdések</h2>
                    <p class="faq-title">Hogyan számoljuk ki a szavak pontszámait?</p>
                    <div class="faq-content">
                        <p>A játék egy mesterséges intelligencia algoritmus és több ezer szöveg segítségével számítja ki a szavak hasonlóságát a nap titkos szavához képest. Nem feltétlenül CSAK a szavak jelentésével függ össze, hanem az interneten használt közelségével is. Például, ha a nap szava „végtelen”, akkor a „szeretet”-hez vagy az „univerzumhoz” kapcsolódó szavak közel állhatnak a nap szavához, mivel a „végtelen” kifejezést általában ebben a két kontextusban használják.</p>
                    </div>
                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112526044003198" crossorigin="anonymous"></script>
                </footer>
            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close" id="close-info-modal">&times;</span>
                    <h2>Információk</h2>
                    <p>Ez egy személyes projekt, amelyet már létező oldalak ihlettek, azonban azok nem voltak elérhetőek magyar szavakkal. Hibák előfordulhatnak, és <strong>még</strong> nem a legjobb a pontosság, de folyamatosan fejlesztve van.</p>
                    <p>Visszajelzés: kissmihalyit@gmail.com</p>
                    <p>A weboldal cookie-kat használ statisztikák gyűjtésére és hirdetések megjelenítésére. További információk az <a href="{{ url_for('privacy') }}">Adatvédelmi tájékoztató</a>-ban</p>
                </div>
            </div>
            <div id="modal_info" class="modal_info">
                <div class="modal-content">
                    <span class="close" id="close-game-info-modal">&times;</span>
                    <h2>A játékról</h2>
                    <p>Találd meg a titkos szót. Egy pontszámot fogsz kapni a tippelt szó mellé, amely azt mutatja, hogy milyen közel áll a kontextusa (jelentése) a titkos szóhoz. Minél kisebb a szám, annál jobb a tipp! A titkos szó az 1-es szám.</p>
                    <p>Csak 5 segítségkérést használhatsz egy nap!</p>
                    <hr>
                    <p>A játék egy mesterséges intelligencia algoritmus és több ezer szöveg segítségével számítja ki a szavak hasonlóságát a nap titkos szavához képest. Nem feltétlenül CSAK a szavak jelentésével függ össze, hanem az interneten használt közelségével is. Például, ha a nap szava „végtelen”, akkor a „szeretet”-hez vagy az „univerzumhoz” kapcsolódó szavak közel állhatnak a nap szavához, mivel a „végtelen” kifejezést általában ebben a két kontextusban használják.</p>
                </div>
            </div>
            <div id="surrender-modal" class="modal">
                <div class="modal-content">
                    <span class="close" id="close-surrender-modal">&times;</span>
                    <h2>Biztos, hogy feladod?</h2>
                    <p>Ezt nem tudod visszacsinálni!</p>
                    <button id="cancel-surrender">Mégsem</button>
                    <button id="confirm-surrender">Feladás</button>
                </div>
            </div>
            <div id="modal-game" class="modal-game">
                <div class="modal-content-game">
                    <span class="close" id="close-game-modal">&times;</span>
                    <h2>Korábbi játékok</h2>
                    <hr>
                    <div id="box-container"></div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
            <script src="../static/js/script.js"></script>
        `;

        // Ensure all scripts are loaded
        const scripts = [
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112526044003198",
            "https://cdn.jsdelivr.net/npm/chart.js",
            "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels",
            "../static/js/script.js"
        ];

        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Make sure scripts are executed in order
            document.body.appendChild(script);
        });
    }
function updateIndex() {

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '../static/styles.css';
    cssLink.onload = updateBodyContent;
    document.head.appendChild(cssLink);
}

function otherDayPlay(chosenDay){

        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
        let storedGameData = gameData[chosenDay];
        solved = 0;
        for (let i = 1; i <= numberofDays; i++) {
            if (gameData[i]) {
                if (gameData[i].solvedToday === true) {
                    solved++;
                }
            }
        }
        document.getElementById('streak').innerText = solved;
        if (!storedGameData) {
            // Initialize new game data for the current game day
            storedGameData = initializeNewGameData();

            updateGameData(chosenDay, storedGameData);
            let changeGameID = JSON.parse(localStorage.getItem('gameData')) || {};
            changeGameID.lastGameID = chosenDay;
            localStorage.setItem('gameData', JSON.stringify(changeGameID));

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
            updateGameData(chosenDay, newDayData);
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
                    updateIndex();
                    location.reload()
                    const pElement = document.querySelector('p.find');
                        pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <strong id="guesses-count">0</strong> | Megoldva: <span id="streak">0</span> játék | Segítségek száma: <span id="hint-left">5</span>';
                        document.getElementById('guesses-count').innerText = savedResults.length;
                        document.getElementById('hint-left').innerText = 5 - hintCount;
                        document.getElementById('streak').innerText = solved;
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
    }
    document.getElementById('submit-button').addEventListener('click', handleGuess);
    document.getElementById('word-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
