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
    <head><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112526044003198"
     crossorigin="anonymous"></script></head>
    <div class="congrats">
        <header>
            <h1 class="title">KONT<span class="highlight">EXTUS</span>.</h1>
        </header>
        <main class="congrats-main">
            <div class="solution">
                <h1 class="subtitle">Gratulálok!</h1>
                <p>Kitaláltad a(z) ${gameDay}. nap titkos szavát: <strong class="solution-word">${word}</strong></p>
               <div><button class="button" onclick="modalClosestWords(gameDay)">Legközelebbi 500 szó</button></div>
               <hr>     
            </div>
            <div class="stats">
                <p>Tippek száma: <strong id="guesses-count">${guessCount}</strong> | Használt segítség: <span id="hint-count">${hintCount}</span></p>

                <canvas id="colorBarChart" width="400" height="200"></canvas>
            </div>
            <div class="loading-wrapper" id="loading-wrapper">
                <div class="loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
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
            <div id="modal-closest-words" class="modal-closest-words">
                <div class="modal-content-game">
                    <span class="close" id="close-game-modal">&times;</span>
                    <h2>Legközelebbi 500 szó</h2>
                    <div id="results"></div>
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
    document.body.classList.remove('hidden');
}