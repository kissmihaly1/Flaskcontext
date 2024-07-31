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
function getColorClass(rank) {
    if (rank <= 1000) {
        return 'green';
    } else if (rank <= 5000) {
        return '#f59204';
    } else {
        return 'red';
    }
}
