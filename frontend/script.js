document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const gridSize = 6;

    // Define numerical values for letters
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
        'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
    };

    const samplePuzzle = [
        ['', 'A', '', '', '5', ''],
        ['2', '', '', '', '', 'C'],
        ['', '', 'B', '4', '', ''],
        ['', '1', '', '', '', 'E'],
        ['D', '', '', '', '3', ''],
        ['', '', '6', '', '', 'F']
    ];

    const sampleCages = [
        {
            cells: [[0, 0], [1, 0]],
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
            cells: [[1, 1], [2, 1], [2, 0]],
            target: 10,
            operation: 'add',
            displayOp: '+'
        },
        {
            cells: [[4, 3], [5, 3]],
            target: 2,
            operation: 'sub',
            displayOp: '−'
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

    const cellCageInfo = {};
    sampleCages.forEach((cage, cageIndex) => {
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

        cage.cells.forEach(([r, c]) => {
            const key = `${r}-${c}`;
            cellCageInfo[key] = {
                cage: cage,
                isClueDisplay: (r === clueCellR && c === clueCellC),
                cageId: `cage-${cageIndex}`
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
                cell.classList.add(cageData.cageId);
                if (row === 0 || !cellCageInfo[`${row-1}-${col}`] || cellCageInfo[`${row-1}-${col}`].cageId !== cageData.cageId) {
                    cell.style.borderTop = '2px solid black';
                }
                if (row === gridSize - 1 || !cellCageInfo[`${row+1}-${col}`] || cellCageInfo[`${row+1}-${col}`].cageId !== cageData.cageId) {
                    cell.style.borderBottom = '2px solid black';
                }
                if (col === 0 || !cellCageInfo[`${row}-${col-1}`] || cellCageInfo[`${row}-${col-1}`].cageId !== cageData.cageId) {
                    cell.style.borderLeft = '2px solid black';
                }
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
                const existingClue = cell.querySelector('.cage-clue');
                if (existingClue) { // If a clue was already added
                    cell.innerHTML = ''; // Clear cell
                    cell.appendChild(existingClue.cloneNode(true)); // Add clue back
                    cell.appendChild(document.createTextNode(prefilledValue)); // Add prefilled value
                } else {
                    cell.textContent = prefilledValue;
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
                    
                    // Determine current value excluding clue
                    let actualValue = '';
                    currentCell.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            actualValue += node.textContent;
                        }
                    });

                    if (actualValue.length >= 1) {
                        e.preventDefault();
                        return;
                    }

                    if (!/^[a-zA-Z1-9]$/.test(e.key)) {
                        e.preventDefault();
                    }
                });

                cell.addEventListener('input', (e) => {
                    const currentCell = e.target;
                    const clueElement = currentCell.querySelector('.cage-clue');
                    let currentText = '';
                    
                    currentCell.childNodes.forEach(node => {
                        if(node.nodeType === Node.TEXT_NODE) {
                            currentText += node.textContent;
                        }
                    });

                    let value = currentText.toUpperCase();
                    let sanitizedValue = '';

                    if (value.length > 0) {
                        // Prioritize last typed char for single input feel
                        const lastChar = value.charAt(value.length - 1);
                        if (/[A-Z]/.test(lastChar)) {
                            sanitizedValue = lastChar;
                        } else if (/[1-9]/.test(lastChar)) {
                            sanitizedValue = lastChar;
                        } else if (value.length > 1) { // Fallback if last char is invalid but previous was OK (e.g. paste)
                             const firstChar = value.charAt(0);
                             if (/[A-Z]/.test(firstChar)) {
                                sanitizedValue = firstChar;
                            } else if (/[1-9]/.test(firstChar)) {
                                sanitizedValue = firstChar;
                            }
                        }
                    }
                    
                    currentCell.innerHTML = '';
                    if (clueElement) {
                        currentCell.appendChild(clueElement.cloneNode(true));
                    }
                    currentCell.appendChild(document.createTextNode(sanitizedValue));

                    const range = document.createRange();
                    const sel = window.getSelection();
                    if (currentCell.childNodes.length > 0) {
                        const lastNode = currentCell.lastChild; // Should be the text node
                        if (lastNode) { // Check if lastNode exists
                           range.setStart(lastNode, lastNode.textContent ? lastNode.textContent.length : 0);
                        } else {
                           range.setStart(currentCell, currentCell.childNodes.length);
                        }
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
