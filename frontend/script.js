document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const gridSize = 6; // Defines a 6x6 grid

    // Sample puzzle definition:
    // Empty strings '' represent editable cells.
    // Letters or numbers represent pre-filled, non-editable cells.
    const samplePuzzle = [
        ['', 'A', '', '', '5', ''],
        ['2', '', '', '', '', 'C'],
        ['', '', 'B', '4', '', ''],
        ['', '1', '', '', '', 'E'],
        ['D', '', '', '', '3', ''],
        ['', '', '6', '', '', 'F']
    ];

    if (!gameGrid) {
        console.error('Error: The element with id="game-grid" was not found.');
        return;
    }
    gameGrid.innerHTML = ''; // Clear existing content

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            const prefilledValue = samplePuzzle[row][col];

            if (prefilledValue !== '') {
                // This is a pre-filled cell
                cell.textContent = prefilledValue;
                cell.classList.add('prefilled-cell');
                cell.contentEditable = false; // Make pre-filled cells not editable
            } else {
                // This is an editable cell
                cell.contentEditable = true;
                cell.spellcheck = false; // Turn off spellcheck for single char input

                // Event listener to handle and restrict input on keydown
                cell.addEventListener('keydown', (e) => {
                    const currentCell = e.target;

                    if (e.key === 'Enter') {
                        e.preventDefault();
                        currentCell.blur();
                        return;
                    }
                    if (['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
                        return;
                    }

                    if (currentCell.textContent.length >= 1) {
                        e.preventDefault();
                        return;
                    }

                    if (!/^[a-zA-Z1-9]$/.test(e.key)) {
                        e.preventDefault();
                    }
                });

                // Event listener to sanitize input
                cell.addEventListener('input', (e) => {
                    const currentCell = e.target;
                    let value = currentCell.textContent.toUpperCase();
                    let sanitizedValue = '';

                    if (value.length > 0) {
                        const firstChar = value.charAt(0);
                        if (/[A-Z]/.test(firstChar)) {
                            sanitizedValue = firstChar;
                        } else if (/[1-9]/.test(firstChar)) {
                            sanitizedValue = firstChar;
                        }
                    }
                    currentCell.textContent = sanitizedValue;
                });
            }
            gameGrid.appendChild(cell);
        }
    }
});
