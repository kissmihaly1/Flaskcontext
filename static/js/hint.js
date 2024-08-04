
function handleHint() {
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let results = gameData[gameDay].results || [];

    updateJsVariablesFromLocalStorage();
    if (savedResults.length <= 0) {
        showError("Tippelned kell, mielőtt segítséget kérnél.");
        event.preventDefault();
    } else {
            var loadingDiv = document.getElementById("loading-wrapper");
            loadingDiv.style.display = "flex";
            hintCount += 1;
            gameData[gameDay].hintCount = hintCount;

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

                        loadingDiv.style.display = "none";
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
                    document.getElementById('hint-left').innerText = hintCount;

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