function createBoxes(number) {
    const container = document.getElementById('box-container');
    container.innerHTML = '';
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let isRandom = gameData.isRandom || false;

    // Létrehozunk egy véletlenszerű dobozt
    const randomBox = document.createElement('div');
    randomBox.className = 'random-box';
    randomBox.innerHTML = `Véletlenszerű`;
    if (isRandom) {
        randomBox.className = 'actual-box';
    }

    randomBox.addEventListener('click', function () {
        const unsolvedDays = [];
        for (let i = 1; i <= number; i++) {
            if (!gameData[i] || (!gameData[i].solvedToday && !gameData[i].giveUp)) {
                unsolvedDays.push(i);
            }
        }
        if (unsolvedDays.length > 0) {
            const randomDay = unsolvedDays[Math.floor(Math.random() * unsolvedDays.length)];
            let changeGameID = JSON.parse(localStorage.getItem('gameData')) || {};
            changeGameID.lastGameID = randomDay;
            changeGameID.isRandom = true;
            localStorage.setItem('gameData', JSON.stringify(changeGameID));
            gameDay = randomDay;
            otherDayPlay(randomDay);
            lastGameID = randomDay;
            closeGameModal();
            isRandom = true;
            location.reload();
        } else {
            showError("Minden játék megoldva vagy feladva!");
        }
    });

    container.appendChild(randomBox);
    const separator = document.createElement('div');
    separator.className = 'separator';
    container.appendChild(separator);

    for (let i = number; i > 0; i--) {
        const box = document.createElement('div');
        if (i === gameDay && !gameData.isRandom) {
            if (gameData[i]) {
                if (gameData[i].solvedToday) {
                    box.className = 'actual-box';
                    box.innerHTML = `<strong class="number">${i}</strong> <strong class="status"> Játék megoldva</strong>`;
                } else if (gameData[i].giveUp) {
                    box.className = 'actual-box';
                    box.innerHTML = `<strong class="number">${i}</strong> <strong class="status"> Játék feladva!</strong>`;
                } else {
                    box.className = 'actual-box';
                    box.innerHTML = `<strong class="number">${i}</strong>`;
                }
            } else {
                box.className = 'box';
                box.innerHTML = `<strong class="number current">${i}</strong>`;
            }
        } else {
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

    let textboxRandom;
    if (isRandom) {
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
        textboxRandom = document.getElementById('game-number')
        if (textboxRandom) {
            textboxRandom.innerText = "Véletlenszerű";
            gameData.isRandom = false;
        }
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }
}