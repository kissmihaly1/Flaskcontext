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
                </header>
                <main>
                    <h2>Feladva: ${gameDay}. nap</h2>
                    <p>A megoldás a(z) <strong class="orange">${solutionWord}</strong> szó volt. Próbálj ki másik napot is!</p>
                   <div><button class="button" onclick="modalClosestWords(gameDay)">Legközelebbi 500 szó</button></div>
                   <hr>
                    <p>A következő napi játék: </p><div id="countdown"></div>
                    <hr>
                    <div class="streak-container">
                        <p>Megoldva: <strong id="streak">${solved}</strong> játék</p>
                    </div>
                    <div><button class="button" onclick="modalGame()">Játszanál még? További napok itt!</button></div>

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
document.body.classList.remove('hidden');
updateCountdown(); // Initial call to display immediately
const countdownInterval = setInterval(updateCountdown, 1000); // Update every second
})
.catch(error => {
showError(error.message);
});

}