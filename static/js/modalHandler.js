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
                    if (dropdownContent) {
                        if (dropdownContent.style.display === 'block') {
                            dropdownContent.style.display = 'none';
                        }
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
