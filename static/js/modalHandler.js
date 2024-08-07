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
                let modalClosest = document.getElementById('modal-closest-words');
                let modalGeneral = document.getElementById('modal');
                let dropdownContent = document.querySelector('.dropdown-content');

                if (event.target === modal) {
                    modal.style.display = 'none';
                }
                if (event.target === modalInfo){
                    modalInfo.style.display = 'none';
                }
                if (event.target === modalClosest){
                    modalClosest.style.display = 'none';
                }

                if (event.target === modalGeneral){
                    modalGeneral.style.display = 'none';
                }

                if ( event.target === modalGame){
                    modalGame.style.display = 'none';
                }

                /*if (!event.target.matches('.dropbtn')) {
                    if (dropdownContent) {
                        if (dropdownContent.style.display === 'block') {
                            dropdownContent.style.display = 'none';
                        }
                    }
                }*/
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
            document.getElementById('modal-closest-words').style.display = 'none';
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
    let gameData = JSON.parse(localStorage.getItem('gameData')) || {};
    let lastGameID = gameData.lastGameID;
}

function modalClosestWords(day){
    let loadingDiv = document.getElementById("loading-wrapper");
    loadingDiv.style.display = "flex";
    const container = document.getElementById('results');
    container.innerHTML = '';
    let modal = document.getElementById('modal-closest-words');
    modal.style.display = 'block';
    fetch('/closestWords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({day: gameDay })
            })
            .then(response => response.json())
            .then(data => {
                    const words = data.solution_words;
                    // Create a word box for each word with its rank
                    let rank = 1;
                    words.forEach(result => {
                        createWordBoxClosest(result, rank, false);
                        rank += 1;
                    });
            });
    loadingDiv.style.display = "none";
}
let isDropdownOpen = false;


function toggleDropdown2(event) {
  const dropdownContent = document.querySelector('.dropdown-content');
  const arrow = document.querySelector('.dropbtn i');

  isDropdownOpen = !isDropdownOpen;
  dropdownContent.style.display = isDropdownOpen ? 'block' : 'none';
  arrow.classList.toggle('rotate');

  // Prevent the click event from propagating
  event.stopPropagation();
}

document.querySelector('.dropbtn').addEventListener('click', toggleDropdown2);
document.addEventListener('click', closeDropdown);

function closeDropdown() {
  const dropdownContent = document.querySelector('.dropdown-content');
  const arrow = document.querySelector('.dropbtn i');

  if (isDropdownOpen) {
    isDropdownOpen = false;
    dropdownContent.style.display = 'none';
    arrow.classList.remove('rotate');
  }
}


function smoothScroll(targetY, duration) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    function step() {
        const progress = (performance.now() - startTime) / duration;
        if (progress < 1) {
            window.scrollTo(0, startY + difference * easeInOutCubic(progress));
            requestAnimationFrame(step);
        } else {
            window.scrollTo(0, targetY);
        }
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    requestAnimationFrame(step);
}

document.querySelectorAll('.faq-title, .faq-title2, .faq-title3').forEach(title => {
    title.addEventListener('click', function() {
        const content = this.nextElementSibling;
        content.classList.toggle('active');
        this.classList.toggle('active');

        if (content.classList.contains('active')) {
            setTimeout(() => {
                const yOffset = -50; // Adjust this value to scroll more or less
                const y = this.getBoundingClientRect().top + window.pageYOffset + yOffset;

                smoothScroll(y, 1500); // 1500ms duration for a slower scroll
        }, 50);
        }
    });
});