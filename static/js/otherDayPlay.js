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
                        pElement.innerHTML = 'Nap: <span id="game-number"></span> | Tippek száma: <strong id="guesses-count">0</strong> | Megoldva: <span id="streak">0</span> játék';
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
