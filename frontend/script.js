document.addEventListener('DOMContentLoaded', () => {
    const gameGridElement = document.getElementById('game-grid');
    const gridSize = 6;
    const regionRows = 2; // For 2x3 regions
    const regionCols = 3; // For 2x3 regions

    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
        'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
    };

    // Puzzle definition with cell types: 'n' for number, 'l' for letter, 'a' for any
    // v: value, t: type, p: prefilled (boolean)
    const samplePuzzleData = [
        // Row 0
        [ {v:'', t:'n', p:false}, {v:'A', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'', t:'l', p:false}, {v:'5', t:'n', p:true},  {v:'', t:'a', p:false} ],
        // Row 1
        [ {v:'2', t:'n', p:true},  {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'', t:'l', p:false}, {v:'', t:'a', p:false}, {v:'C', t:'l', p:true}  ],
        // Row 2
        [ {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'B', t:'l', p:true},  {v:'4', t:'n', p:true},  {v:'', t:'l', p:false}, {v:'', t:'a', p:false} ],
        // Row 3
        [ {v:'', t:'l', p:false}, {v:'1', t:'n', p:true},  {v:'', t:'a', p:false}, {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'E', t:'l', p:true}  ],
        // Row 4
        [ {v:'D', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'', t:'l', p:false}, {v:'', t:'n', p:false}, {v:'3', t:'n', p:true},  {v:'', t:'l', p:false} ],
        // Row 5
        [ {v:'', t:'a', p:false}, {v:'', t:'l', p:false}, {v:'6', t:'n', p:true},  {v:'', t:'n', p:false}, {v:'', t:'l', p:false}, {v:'F', t:'l', p:true}  ]
    ];

    const sampleCages = [
        { cells: [[0,0], [1,0]], target: 7, operation: 'add', displayOp: '+' }, // (0,0) is 'n', (1,0) is 'n'
        { cells: [[0,2], [0,3]], target: 15, operation: 'mul', displayOp: '×' }, // (0,2) is 'n', (0,3) is 'l'
        { cells: [[1,1], [2,1], [2,0]], target: 10, operation: 'add', displayOp: '+' }, // All 'n'
        { cells: [[4,3], [5,3]], target: 2, operation: 'sub', displayOp: '−' }, // (4,3) is 'n', (5,3) is 'n'
        { cells: [[5,4], [5,5]], target: 30, operation: 'mul', displayOp: '×' }  // (5,4) is 'l', (5,5) is 'l' (F=6, so needs E=5)
    ];

    const gridCells = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    if (!gameGridElement) {
        console.error('Error: The element with id="game-grid" was not found.');
        return;
    }
    gameGridElement.innerHTML = '';

    const cellCageInfo = {};
    sampleCages.forEach((cage, cageIndex) => {
        let clueCellR = Infinity, clueCellC = Infinity;
        cage.cells.forEach(([r, c]) => {
            if (r < clueCellR) { clueCellR = r; clueCellC = c; }
            else if (r === clueCellR && c < clueCellC) { clueCellC = c; }
        });
        cage.cells.forEach(([r, c]) => {
            cellCageInfo[`${r}-${c}`] = { cage, isClueDisplay: (r === clueCellR && c === clueCellC), cageId: `cage-${cageIndex}` };
        });
    });

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            gridCells[row][col] = cellElement;

            const puzzleCellData = samplePuzzleData[row][col];
            cellElement.dataset.cellType = puzzleCellData.t;

            if (puzzleCellData.t === 'n') cellElement.classList.add('cell-type-number');
            else if (puzzleCellData.t === 'l') cellElement.classList.add('cell-type-letter');

            const cageData = cellCageInfo[`${row}-${col}`];
            if (cageData) {
                cellElement.classList.add(cageData.cageId);
                if (row === 0 || !cellCageInfo[`${row-1}-${col}`] || cellCageInfo[`${row-1}-${col}`].cageId !== cageData.cageId) cellElement.style.borderTop = '2px solid black';
                if (row === gridSize - 1 || !cellCageInfo[`${row+1}-${col}`] || cellCageInfo[`${row+1}-${col}`].cageId !== cageData.cageId) cellElement.style.borderBottom = '2px solid black';
                if (col === 0 || !cellCageInfo[`${row}-${col-1}`] || cellCageInfo[`${row}-${col-1}`].cageId !== cageData.cageId) cellElement.style.borderLeft = '2px solid black';
                if (col === gridSize - 1 || !cellCageInfo[`${row}-${col+1}`] || cellCageInfo[`${row}-${col+1}`].cageId !== cageData.cageId) cellElement.style.borderRight = '2px solid black';

                if (cageData.isClueDisplay) {
                    const clueSpan = document.createElement('span');
                    clueSpan.classList.add('cage-clue');
                    clueSpan.textContent = `${cageData.cage.target}${cageData.cage.displayOp}`;
                    clueSpan.id = `clue-${cageData.cageId}`;
                    cellElement.appendChild(clueSpan);
                }
            }

            if (puzzleCellData.p) {
                const existingClue = cellElement.querySelector('.cage-clue');
                if (existingClue) {
                    cellElement.innerHTML = ''; cellElement.appendChild(existingClue.cloneNode(true));
                    cellElement.appendChild(document.createTextNode(puzzleCellData.v));
                } else {
                    cellElement.textContent = puzzleCellData.v;
                }
                cellElement.classList.add('prefilled-cell');
                cellElement.contentEditable = false;
            } else {
                cellElement.contentEditable = true;
                cellElement.spellcheck = false;
                cellElement.addEventListener('keydown', (e) => handleKeyDown(e, puzzleCellData.t));
                cellElement.addEventListener('input', (e) => handleInput(e, puzzleCellData.t));
            }
            gameGridElement.appendChild(cellElement);
        }
    }
    
    validateAllCellsAndCages();

    function handleKeyDown(e, cellType) {
        const currentCell = e.target;
        if (e.key === 'Enter') { e.preventDefault(); currentCell.blur(); return; }
        if (['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;

        let actualValue = '';
        currentCell.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) actualValue += node.textContent; });
        if (actualValue.length >= 1) { e.preventDefault(); return; }

        let isValidKey = false;
        if (cellType === 'n') isValidKey = /^[1-9]$/.test(e.key);
        else if (cellType === 'l') isValidKey = /^[a-zA-Z]$/.test(e.key);
        else if (cellType === 'a') isValidKey = /^[a-zA-Z1-9]$/.test(e.key);
        if (!isValidKey) e.preventDefault();
    }

    function handleInput(e, cellType) {
        const currentCell = e.target;
        const clueElement = currentCell.querySelector('.cage-clue');
        let currentText = '';
        currentCell.childNodes.forEach(node => { if(node.nodeType === Node.TEXT_NODE) currentText += node.textContent; });

        let value = currentText.toUpperCase();
        let sanitizedValue = '';

        if (value.length > 0) {
            const charToTest = value.charAt(value.length - 1);
            if (cellType === 'n' && /[1-9]/.test(charToTest)) sanitizedValue = charToTest;
            else if (cellType === 'l' && /[A-Z]/.test(charToTest)) sanitizedValue = charToTest;
            else if (cellType === 'a') {
                if (/[A-Z]/.test(charToTest)) sanitizedValue = charToTest;
                else if (/[1-9]/.test(charToTest)) sanitizedValue = charToTest;
            }
            if (!sanitizedValue && value.length > 0) {
                const firstChar = value.charAt(0);
                 if (cellType === 'n' && /[1-9]/.test(firstChar)) sanitizedValue = firstChar;
                 else if (cellType === 'l' && /[A-Z]/.test(firstChar)) sanitizedValue = firstChar;
                 else if (cellType === 'a') {
                    if (/[A-Z]/.test(firstChar)) sanitizedValue = firstChar;
                    else if (/[1-9]/.test(firstChar)) sanitizedValue = firstChar;
                 }
            }
        }
        
        currentCell.innerHTML = '';
        if (clueElement) currentCell.appendChild(clueElement.cloneNode(true));
        currentCell.appendChild(document.createTextNode(sanitizedValue));
        setCursorToEnd(currentCell);

        validateCell(parseInt(currentCell.dataset.row), parseInt(currentCell.dataset.col));
        validateAllCages();
    }

    function setCursorToEnd(element) {
        const range = document.createRange();
        const sel = window.getSelection();
        if (element.childNodes.length > 0) {
            const lastNode = element.lastChild;
            range.setStart(lastNode, lastNode.textContent ? lastNode.textContent.length : 0);
        } else { range.setStart(element, 0); }
        range.collapse(true);
        sel.removeAllRanges(); sel.addRange(range);
    }

    function getCellRawContent(row, col) {
        const cellElement = gridCells[row][col];
        if (!cellElement) return '';
        let textContent = '';
        cellElement.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) textContent += node.textContent; });
        return textContent.trim().toUpperCase();
    }

    function getCellValueForCalc(row, col) { // For calculations
        const rawContent = getCellRawContent(row, col);
        if (letterValues[rawContent]) return letterValues[rawContent];
        if (/^[1-9]$/.test(rawContent)) return parseInt(rawContent);
        return null;
    }

    function validateCell(row, col) {
        const cellElement = gridCells[row][col];
        const puzzleCellData = samplePuzzleData[row][col];
        const currentValue = getCellRawContent(row, col); // This is 'A' or '5'
        
        cellElement.classList.remove('cell-invalid');

        // Sudoku-like check for numbers
        // Applies if cell type is 'n', or if type is 'a' and it currently holds a number
        if (currentValue && (puzzleCellData.t === 'n' || (puzzleCellData.t === 'a' && /^[1-9]$/.test(currentValue)))) {
            // Check row
            for (let c = 0; c < gridSize; c++) {
                if (c !== col && getCellRawContent(row, c) === currentValue) {
                    cellElement.classList.add('cell-invalid'); return;
                }
            }
            // Check column
            for (let r = 0; r < gridSize; r++) {
                if (r !== row && getCellRawContent(r, col) === currentValue) {
                    cellElement.classList.add('cell-invalid'); return;
                }
            }
            // Check 2x3 region
            const startRow = Math.floor(row / regionRows) * regionRows;
            const startCol = Math.floor(col / regionCols) * regionCols;
            for (let r = startRow; r < startRow + regionRows; r++) {
                for (let c = startCol; c < startCol + regionCols; c++) {
                    if ((r !== row || c !== col) && getCellRawContent(r, c) === currentValue) {
                        cellElement.classList.add('cell-invalid'); return;
                    }
                }
            }
        }
        // Word validation would go here later
    }
    
    function validateAllCellsAndCages() {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!samplePuzzleData[r][c].p) {
                    validateCell(r, c);
                }
            }
        }
        validateAllCages();
    }

    function validateAllCages() {
        sampleCages.forEach(cage => {
            const cageCellValues = [];
            let allCellsFilledAndValid = true; // All cells must have a calculable value
            for (const [r, c] of cage.cells) {
                const val = getCellValueForCalc(r, c);
                if (val === null) {
                    allCellsFilledAndValid = false;
                    break; 
                }
                cageCellValues.push(val);
            }

            const firstCellOfCage = cage.cells[0];
            const clueElementId = `clue-${cellCageInfo[`${firstCellOfCage[0]}-${firstCellOfCage[1]}`].cageId}`;
            const clueElement = document.getElementById(clueElementId);

            if (!clueElement) return;
            clueElement.classList.remove('cage-clue-error', 'cage-clue-correct');

            if (!allCellsFilledAndValid) {
                return; // Not all cells in cage have values, so don't mark as error/correct yet
            }

            let result;
            let isValid = false;
            switch (cage.operation) {
                case 'add':
                    result = cageCellValues.reduce((sum, val) => sum + val, 0);
                    isValid = result === cage.target;
                    break;
                case 'mul':
                    result = cageCellValues.reduce((prod, val) => prod * val, 1);
                    isValid = result === cage.target;
                    break;
                case 'sub': // Assumes 2 cells. Target = absolute difference.
                    if (cageCellValues.length === 2) {
                        isValid = Math.abs(cageCellValues[0] - cageCellValues[1]) === cage.target;
                    } else { /* Rule for >2 cells undefined, treat as error or pending */ }
                    break;
                case 'div': // Assumes 2 cells. Target = one divided by other (either way).
                     if (cageCellValues.length === 2) {
                        const v0 = cageCellValues[0]; const v1 = cageCellValues[1];
                        if (v1 !== 0 && v0 / v1 === cage.target) isValid = true;
                        else if (v0 !== 0 && v1 / v0 === cage.target) isValid = true;
                    } else { /* Rule for >2 cells undefined */ }
                    break;
                default: // Unknown operation
                    console.warn("Unknown cage operation:", cage.operation);
                    break;
            }

            if (isValid) {
                clueElement.classList.add('cage-clue-correct');
            } else {
                clueElement.classList.add('cage-clue-error');
            }
        });
    }
});
