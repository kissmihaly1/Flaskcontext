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
let isRandom = false
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
        isRandom: false,
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
        isRandom = gameData.isRandom;
        if (!gameData[day]){
            gameDay = day;
            lastGameID = day;
        }else{
            gameDay = gameData.lastGameID;
        }
        if (!isRandom) {
            document.getElementById('game-number').innerText = `${gameDay}`;
        }
        else{
            document.getElementById('game-number').innerText = "Véletlenszerű";
        }

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
            solved = 0;
            for (let i = 1; i <= numberofDays; i++) {
                if (gameData[i]) {
                    if (gameData[i].solvedToday === true) {
                        solved++;
                    }
                }
            }
            document.getElementById('streak').innerText = solved;
            document.body.classList.remove('hidden');
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
                document.body.classList.remove('hidden');
                document.getElementById('streak').innerText = solved;
                        // Load existing boxes from results
                if (savedResults && savedResults.length > 0) {
                    const pElement = document.querySelector('p.find');
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <strong id="guesses-count">0</strong> | Megoldva: <span id="streak">0</span> játék';
                    document.getElementById('guesses-count').innerText = savedResults.length;
                    document.getElementById('streak').innerText = solved;
                    if (!isRandom) {
                        document.getElementById('game-number').innerText = `${gameDay}`;
                    }
                    else{
                        document.getElementById('game-number').innerText = "Véletlenszerű";
                    }
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
        gameData.isRandom = false;
        localStorage.setItem('gameData', JSON.stringify(gameData));
        location.reload();
        return;
        }else{

    // Check if gameDay matches the current game day
    if (!gameData[gameDay]) {
        gameData.isRandom=false;
        localStorage.setItem('gameData', JSON.stringify(gameData));
        location.reload(); // Reload the page if the current game day data is not found
        return;
    }

    let results = gameData[gameDay].results || [];
    var loadingDiv = document.getElementById("loading-wrapper");
    loadingDiv.style.display = "flex";
    let duplicateResult = results.find(result => result.word === word);
    if (duplicateResult) {
const boxes = document.querySelectorAll('.row-wrapper');
    boxes.forEach(box => {
        if (box.querySelector('.row span:first-child').textContent === word) {
            const isInViewport = (element) => {
                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight-200 || document.documentElement.clientHeight-200) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            };

            if (!isInViewport(box)) {
                box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    box.classList.add('shake');
                    setTimeout(() => {
                        box.classList.remove('shake');
                    }, 1000);
                }, 500);
            } else {
                box.classList.add('shake');
                setTimeout(() => {
                    box.classList.remove('shake');
                }, 1000);
            }
        }
            loadingDiv.style.display = "none";
        });
    } else {

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
                loadingDiv.style.display = "none";
            const inputElement = document.getElementById('word-input');
                    inputElement.classList.add('shake');
                    setTimeout(() => {
                        inputElement.classList.remove('shake');
                    }, 1000);
                showError(data.error);
                loadingDiv.style.display = "none";
            } else {
                    loadingDiv.style.display = "none";
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
                    pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <span id="guesses-count">0</span> | Megoldva: <span id="streak">0</span> játék';

                    document.querySelector('.instructions').classList.add('hidden');
                    document.querySelector('footer').classList.add('hidden');
                    results.push({ word: word, rank: data.rank });
                    gameData[gameDay].results = results;
                    lastGuess = { word: word, rank: data.rank };
                    gameData[gameDay].lastGuess = lastGuess;
                    localStorage.setItem('gameData', JSON.stringify(gameData));

                    document.getElementById('guesses-count').innerText = results.length;
                    if (!isRandom) {
                        document.getElementById('game-number').innerText = `${gameDay}`;
                    }
                    else{
                        document.getElementById('game-number').innerText = "Véletlenszerű";
                    }
                    document.getElementById('streak').innerText = solved;

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
                showError("Valami hiba történt, kérlek próbáld újra később!");
            loadingDiv.style.display = "none";
        });
    }
    }
    })
}




// Showing error messages:
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
                    <div id="box-container"></div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
            <script src="../js/script.js"></script>
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

