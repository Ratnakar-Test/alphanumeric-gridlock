document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const gridSize = 6; // Defines a 6x6 grid

    if (!gameGrid) {
        console.error('Error: The element with id="game-grid" was not found.');
        return; // Stop script execution if the grid container is missing
    }

    // Clear any existing content in game-grid (e.g., placeholder text)
    gameGrid.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');

            // Add data attributes to identify cells later (optional but helpful)
            cell.dataset.row = row;
            cell.dataset.col = col;
            // You could also give them unique IDs if needed:
            // cell.id = `cell-<span class="math-inline">\{row\}\-</span>{col}`;

            // For now, cells are just empty divs.
            // We will add input capabilities in a later step.

            gameGrid.appendChild(cell);
        }
    }
});
