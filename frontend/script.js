document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const gridSize = 6;

    const samplePuzzle = [
        ['', 'A', '', '', '5', ''],
        ['2', '', '', '', '', 'C'],
        ['', '', 'B', '4', '', ''],
        ['', '1', '', '', '', 'E'],
        ['D', '', '', '', '3', ''],
        ['', '', '6', '', '', 'F']
    ];

    // Cage definitions:
    // Each cage: { cells: [[row, col], ...], target: number, operation: string, displayOp: string }
    // 'displayOp' is for visual representation (e.g., "×", "+")
    // 'operation' can be a simpler string for logic (e.g., "mul", "add")
    const sampleCages = [
        {
            cells: [[0, 0], [1, 0]], // Cells (R0,C0) and (R1,C0)
            target: 7,
            operation: 'add',
            displayOp: '+'
        },
        {
            cells: [[0, 2], [0, 3]],
            target: 15,
            operation: 'mul',
            displayOp: '×'
        },
        {
            cells: [[1, 1], [2, 1], [2, 0]], // Note: cells can be non-contiguous visually but part of same cage logic
            target: 10,
            operation: 'add',
            displayOp: '+'
        },
        {
            cells: [[4, 3], [5, 3]],
            target: 2,
            operation: 'sub', // For subtraction/division, order of cells might matter or need specific rules
            displayOp: '−'  // For display. Logic will need to handle which cell is minuend/dividend
        },
        {
            cells: [[5,4], [5,5]],
            target: 30,
            operation: 'mul',
            displayOp: '×'
        }
    ];

    if (!gameGrid) {
        console.error('Error: The element with id="game-grid" was not found.');
        return;
    }
    gameGrid.innerHTML = '';

    // Create a lookup for cells to quickly find their cage and if they display a clue
    const cellCageInfo = {}; // Key: "row-col", Value: { cage: object, isClueDisplay: boolean }

    sampleCages.forEach((cage, cageIndex) => {
        // Determine the top-leftmost cell for displaying the clue
        let clueCellR = Infinity;
        let clueCellC = Infinity;
        cage.cells.forEach(([r, c]) => {
            if (r < clueCellR) {
                clueCellR = r;
                clueCellC = c;
            } else if (r === clueCellR && c < clueCellC) {
                clueCellC = c;
            }
        });

        cage.cells.forEach(([r, c], cellInCageIndex) => {
            const key = `${r}-${c}`;
            cellCageInfo[key] = {
                cage: cage,
                isClueDisplay: (r === clueCellR && c === clueCellC),
                cageId: `cage-${cageIndex}` // Unique ID for the cage
            };
        });
    });


    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            const cellKey = `${row}-${col}`;
            const cageData = cellCageInfo[cellKey];

            if (cageData) {
                cell.classList.add(cageData.cageId); // Add cage-specific class for potential grouped styling

                // Add borders based on which neighbors are NOT in the same cage
                // Top border
                if (row === 0 || !cellCageInfo[`${row-1}-${col}`] || cellCageInfo[`${row-1}-${col}`].cageId !== cageData.cageId) {
                    cell.style.borderTop = '2px solid black';
                }
                // Bottom border
                if (row === gridSize - 1 || !cellCageInfo[`${row+1}-${col}`] || cellCageInfo[`${row+1}-${col}`].cageId !== cageData.cageId) {
                    cell.style.borderBottom = '2px solid black';
                }
                // Left border
                if (col === 0 || !cellCageInfo[`${row}-${col-1}`] || cellCageInfo[`${row}-${col-1}`].cageId !== cageData.cageId) {
                    cell.style.borderLeft = '2px solid black';
                }
                // Right border
                if (col === gridSize - 1 || !cellCageInfo[`${row}-${col+1}`] || cellCageInfo[`${row}-${col+1}`].cageId !== cageData.cageId) {
                    cell.style.borderRight = '2px solid black';
                }


                if (cageData.isClueDisplay) {
                    const clueSpan = document.createElement('span');
                    clueSpan.classList.add('cage-clue');
                    clueSpan.textContent = `${cageData.cage.target}${cageData.cage.displayOp}`;
                    cell.appendChild(clueSpan);
                }
            }


            const prefilledValue = samplePuzzle[row][col];
            if (prefilledValue !== '') {
                cell.textContent = prefilledValue; // This will overwrite the clueSpan if prefilled is also clue cell
                if (cageData && cageData.isClueDisplay) { // Re-add clue if prefilled cell is clue display
                    const clueSpan = document.createElement('span');
                    clueSpan.classList.add('cage-clue');
                    clueSpan.textContent = `${cageData.cage.target}${cageData.cage.displayOp}`;
                    cell.insertBefore(clueSpan, cell.firstChild); // Put clue before prefilled number
                }
                cell.classList.add('prefilled-cell');
                cell.contentEditable = false;
            } else {
                cell.contentEditable = true;
                cell.spellcheck = false;

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
                    if (currentCell.textContent.length >= 1 && !currentCell.querySelector('.cage-clue')) { // Only prevent if no clue
                        e.preventDefault();
                        return;
                    } else if (currentCell.querySelector('.cage-clue') && currentCell.childNodes.length > 1 && currentCell.lastChild.textContent.length >=1 ) {
                         e.preventDefault(); // if clue exists, prevent more than 1 char for the value
                         return;
                    }


                    if (!/^[a-zA-Z1-9]$/.test(e.key)) {
                        e.preventDefault();
                    }
                });

                cell.addEventListener('input', (e) => {
                    const currentCell = e.target;
                    const clueElement = currentCell.querySelector('.cage-clue');
                    let currentText = currentCell.textContent;
                    let clueText = '';

                    if (clueElement) {
                        clueText = clueElement.textContent;
                        // Remove clue text from currentText for sanitization if present
                        if (currentText.startsWith(clueText)) {
                            currentText = currentText.substring(clueText.length);
                        }
                    }
                    
                    let value = currentText.toUpperCase();
                    let sanitizedValue = '';

                    if (value.length > 0) {
                        const firstChar = value.charAt(value.length - 1); // Check last typed char
                        if (/[A-Z]/.test(firstChar)) {
                            sanitizedValue = firstChar;
                        } else if (/[1-9]/.test(firstChar)) {
                            sanitizedValue = firstChar;
                        }
                    }
                    
                    // Reconstruct content, preserving clue
                    currentCell.innerHTML = ''; // Clear cell
                    if (clueElement) {
                        currentCell.appendChild(clueElement.cloneNode(true)); // Add clue back
                    }
                    currentCell.appendChild(document.createTextNode(sanitizedValue)); // Add sanitized value

                    // Ensure cursor is at the end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    if (currentCell.childNodes.length > 0) {
                        const lastNode = currentCell.lastChild;
                        range.setStart(lastNode, lastNode.textContent.length);
                    } else {
                        range.setStart(currentCell, 0);
                    }
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            }
            gameGrid.appendChild(cell);
        }
    }
});
