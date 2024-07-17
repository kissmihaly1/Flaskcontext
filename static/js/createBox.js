function createBoxes(number) {
        const container = document.getElementById('box-container');
        container.innerHTML = '';
        let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
        for (let i = number; i > 0; i--) {
                const box = document.createElement('div');
                if (i === gameDay) {
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