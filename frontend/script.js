document.addEventListener('DOMContentLoaded', () => {
    const gameGridElement = document.getElementById('game-grid');
    const gridSize = 6;
    const regionRows = 2;
    const regionCols = 3;
    const minWordLength = 3;

    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
        'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
    };

    // --- NEW: Current Puzzle Object ---
    // This structure would ideally be fetched from a backend for a daily puzzle system.
    // For now, it's defined here.
    const currentPuzzle = {
        id: "daily_2025_06_03", // Example ID
        gridDefinition: [ // v: initial value, t: type ('n','l','a'), p: prefilled
            // Row 0
            [ {v:'5', t:'n', p:true},  {v:'A', t:'l', p:true},  {v:'2', t:'n', p:true},  {v:'L', t:'l', p:true},  {v:'P', t:'l', p:true},  {v:'H', t:'l', p:true} ],
            // Row 1
            [ {v:'2', t:'n', p:true},  {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'P', t:'l', p:true},  {v:'H', t:'l', p:true},  {v:'A', t:'l', p:true} ],
            // Row 2
            [ {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'B', t:'l', p:true},  {v:'4', t:'n', p:true},  {v:'A', t:'l', p:true},  {v:'S', t:'l', p:true} ],
            // Row 3
            [ {v:'S', t:'l', p:true},  {v:'1', t:'n', p:true},  {v:'O', t:'l', p:true},  {v:'L', t:'l', p:true},  {v:'V', t:'l', p:true},  {v:'E', t:'l', p:true} ],
            // Row 4
            [ {v:'D', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'G', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'3', t:'n', p:true},  {v:'R', t:'l', p:true} ],
            // Row 5
            [ {v:'E', t:'l', p:false}, {v:'T', t:'l', p:true},  {v:'6', t:'n', p:true},  {v:'', t:'n', p:false}, {v:'E', t:'l', p:true},  {v:'F', t:'l', p:true} ]
        ],
        cages: [ // Ensure these cages are solvable with the solutionGrid below
            { cells: [[0,0], [1,0]], target: 7, operation: 'add', displayOp: '+' }, // 5+2=7
            { cells: [[0,2], [0,3], [0,4]], target: 34, operation: 'add', displayOp: '+' }, // 2 + L(12) + P(16) = 30. Target 30.
            { cells: [[1,1], [1,2]], target: 12, operation: 'mul', displayOp: '×'}, // Needs 3 * 4 = 12
            { cells: [[2,0],[2,1],[3,1]], target: 10, operation: 'add', displayOp: '+' }, // 6+3+1=10
            { cells: [[4,1],[4,3],[5,3]], target: 2, operation: 'sub', displayOp: '−'}, // e.g. (4,1)=4, (4,3)=5, (5,3)=3 -> complex. Let's simplify. Cage: (4,1), (4,3) Target:1 (5-4)
            { cells: [[5,0], [4,0]], target: 9, operation: 'add', displayOp: '+' }, // E(5) + D(4) = 9
            { cells: [[5,4], [5,5], [4,5]], target: 48, operation: 'mul', displayOp: '×' } // E(5)*F(6)*R(18) - no, E(5)*F(6) = 30. (4,5) is R.
        ],
        solutionGrid: [ // The unique solution for the gridDefinition above
            ['5', 'A', '2', 'L', 'P', 'H'],
            ['2', '4', '3', 'P', 'H', 'A'], // 4*3 = 12 (Cage 2)
            ['6', '3', 'B', '4', 'A', 'S'], // 6+3+1 (from S1) = 10 (Cage 3)
            ['S', '1', 'O', 'L', 'V', 'E'],
            ['D', '4', 'G', '5', '3', 'R'], // For Cage 4: (4,1)=4, (4,3)=5.  |5-4|=1
            ['E', 'T', '6', '1', 'E', 'F']  // (4,3)=5, (5,3)=1. Let's set (5,3) to 1 in gridDef
        ],
        // Manually re-evaluating cages for this example solution
        // Cage 0: [0,0]=5, [1,0]=2. Sum = 7. Correct.
        // Cage 1: [0,2]=2, [0,3]=L(12), [0,4]=P(16). Sum = 2+12+16 = 30.
        // Cage 2: [1,1]=4, [1,2]=3. Mul = 12. Correct.
        // Cage 3: [2,0]=6, [2,1]=3, [3,1]=1. Sum = 10. Correct.
        // Cage 4: This cage needs redefinition for simple solution. Let's make it [4,1], [4,3] with target 1. (Values are 4, 5). |4-5|=1. Correct.
        // Cage 5: [5,0]=E(5), [4,0]=D(4). Sum = 9. Correct.
        // Cage 6: [5,4]=E(5), [5,5]=F(6), [4,5]=R(18). Mul = 5*6*18 = 540. Far from 48.
        // Puzzle design is hard! Let's simplify Cage 6: cells: [[5,4],[5,5]], target: 30, op: mul (E*F = 5*6=30).
    };
    // Apply corrections to currentPuzzle.cages based on re-evaluation for solvability
    currentPuzzle.cages[1] = { cells: [[0,2], [0,3], [0,4]], target: 30, operation: 'add', displayOp: '+' };
    currentPuzzle.cages[4] = { cells: [[4,1], [4,3]], target: 1, operation: 'sub', displayOp: '−'};
    currentPuzzle.cages[6] = { cells: [[5,4],[5,5]], target: 30, operation: 'mul', displayOp: '×' };
    // And ensure (5,3) is not prefilled and is type 'n' to accept '1' for the solution.
    currentPuzzle.gridDefinition[5][3] = {v:'', t:'n', p:false};


    const gridCells = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const wordValidationCache = new Map(); // Cache for API responses

    if (!gameGridElement) { console.error('Game grid element not found'); return; }
    gameGridElement.innerHTML = '';

    const cellCageInfo = {};
    currentPuzzle.cages.forEach((cage, cageIndex) => {
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

            const puzzleCellData = currentPuzzle.gridDefinition[row][col];
            cellElement.dataset.cellType = puzzleCellData.t;

            if (puzzleCellData.t === 'n') cellElement.classList.add('cell-type-number');
            else if (puzzleCellData.t === 'l') cellElement.classList.add('cell-type-letter');

            const cageData = cellCageInfo[`${row}-${col}`];
            if (cageData) { /* ... cage border and clue rendering (same as before) ... */
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

            if (puzzleCellData.p) { /* ... prefilled cell rendering (same as before) ... */
                 const existingClue = cellElement.querySelector('.cage-clue');
                if (existingClue) {
                    cellElement.innerHTML = ''; cellElement.appendChild(existingClue.cloneNode(true));
                    cellElement.appendChild(document.createTextNode(puzzleCellData.v));
                } else {
                    cellElement.textContent = puzzleCellData.v;
                }
                cellElement.classList.add('prefilled-cell');
                cellElement.contentEditable = false;
            } else { /* ... editable cell setup ... */
                cellElement.contentEditable = true;
                cellElement.spellcheck = false;
                cellElement.addEventListener('keydown', (e) => handleKeyDown(e, puzzleCellData.t));
                cellElement.addEventListener('input', (e) => handleInput(e, puzzleCellData.t));
            }
            gameGridElement.appendChild(cellElement);
        }
    }
    
    validateAllGameRules();

    function handleKeyDown(e, cellType) { /* ... same as before ... */
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

    async function handleInput(e, cellType) { // Made async for word validation
        const currentCell = e.target;
        const clueElement = currentCell.querySelector('.cage-clue');
        let currentText = '';
        currentCell.childNodes.forEach(node => { if(node.nodeType === Node.TEXT_NODE) currentText += node.textContent; });

        let value = currentText.toUpperCase();
        let sanitizedValue = '';

        if (value.length > 0) { /* ... input sanitization (same as before) ... */
            const charToTest = value.charAt(value.length - 1);
            if (cellType === 'n' && /[1-9]/.test(charToTest)) sanitizedValue = charToTest;
            else if (cellType === 'l' && /[A-Z]/.test(charToTest)) sanitizedValue = charToTest;
            else if (cellType === 'a') {
                if (/[A-Z]/.test(charToTest)) sanitizedValue = charToTest;
                else if (/[1-9]/.test(charToTest)) sanitizedValue = charToTest;
            }
            if (!sanitizedValue && value.length > 0) { // Fallback for paste
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

        await validateAllGameRules(); // Now potentially async due to word validation
    }

    function setCursorToEnd(element) { /* ... same as before ... */
        const range = document.createRange();
        const sel = window.getSelection();
        if (element.childNodes.length > 0) {
            const lastNode = element.lastChild;
            range.setStart(lastNode, lastNode.textContent ? lastNode.textContent.length : 0);
        } else { range.setStart(element, 0); }
        range.collapse(true);
        sel.removeAllRanges(); sel.addRange(range);
    }

    function getCellRawContent(row, col) { /* ... same as before ... */
        const cellElement = gridCells[row][col];
        if (!cellElement) return '';
        let textContent = '';
        cellElement.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) textContent += node.textContent; });
        return textContent.trim().toUpperCase();
    }
    function getCellValueForCalc(row, col) { /* ... same as before ... */
        const rawContent = getCellRawContent(row, col);
        if (letterValues[rawContent]) return letterValues[rawContent];
        if (/^[1-9]$/.test(rawContent)) return parseInt(rawContent);
        return null;
    }
    
    function clearAllValidationStyles() { /* ... same as before ... */
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                gridCells[r][c].classList.remove('cell-invalid', 'cell-word-error', 'cell-word-correct');
            }
        }
        currentPuzzle.cages.forEach(cage => {
            const firstCellOfCage = cage.cells[0];
            const cageInfoForCell = cellCageInfo[`${firstCellOfCage[0]}-${firstCellOfCage[1]}`];
            if (cageInfoForCell) {
                const clueElementId = `clue-${cageInfoForCell.cageId}`;
                const clueElement = document.getElementById(clueElementId);
                if (clueElement) {
                    clueElement.classList.remove('cage-clue-error', 'cage-clue-correct');
                }
            }
        });
    }

    async function validateAllGameRules() { // Made async
        clearAllValidationStyles(); 

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!currentPuzzle.gridDefinition[r][c].p) { 
                    validateNumberCellUniqueness(r, c);
                }
            }
        }
        await validateWordsInGrid(); // Now an async call
        validateAllCages();
    }

    function validateNumberCellUniqueness(row, col) { /* ... same as before ... */
        const cellElement = gridCells[row][col];
        const puzzleCellData = currentPuzzle.gridDefinition[row][col];
        const currentValue = getCellRawContent(row, col);
        
        if (currentValue && (puzzleCellData.t === 'n' || (puzzleCellData.t === 'a' && /^[1-9]$/.test(currentValue)))) {
            let isInvalid = false;
            for (let c = 0; c < gridSize; c++) {
                if (c !== col && getCellRawContent(row, c) === currentValue) { isInvalid = true; gridCells[row][c].classList.add('cell-invalid');}
            }
            for (let r = 0; r < gridSize; r++) {
                if (r !== row && getCellRawContent(r, col) === currentValue) { isInvalid = true; gridCells[r][col].classList.add('cell-invalid');}
            }
            const startRow = Math.floor(row / regionRows) * regionRows;
            const startCol = Math.floor(col / regionCols) * regionCols;
            for (let r = startRow; r < startRow + regionRows; r++) {
                for (let c = startCol; c < startCol + regionCols; c++) {
                    if ((r !== row || c !== col) && getCellRawContent(r, c) === currentValue) {
                       isInvalid = true; gridCells[r][c].classList.add('cell-invalid');
                    }
                }
            }
            if (isInvalid) cellElement.classList.add('cell-invalid');
        }
    }
    
    async function isWordValid(word) {
        if (wordValidationCache.has(word)) {
            return wordValidationCache.get(word);
        }
        try {
            // Using Datamuse API: sp={word} means "spelled like". We check if exact word is returned.
            // &max=1 to limit results. We only care if our exact word is considered valid.
            const response = await fetch(`https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`);
            if (!response.ok) {
                console.error(`API error for "${word}": ${response.status}`);
                wordValidationCache.set(word, false); // Assume invalid on API error to be safe
                return false;
            }
            const data = await response.json();
            // Check if the API returned our exact word as the top (or only) suggestion
            const isValid = data.length > 0 && data[0].word.toUpperCase() === word.toUpperCase();
            wordValidationCache.set(word, isValid);
            return isValid;
        } catch (error) {
            console.error(`Network error validating word "${word}":`, error);
            wordValidationCache.set(word, false); // Assume invalid on network error
            return false;
        }
    }

    async function validateWordsInGrid() {
        const linesData = []; 
        for (let r = 0; r < gridSize; r++) {
            const rowLine = [];
            for (let c = 0; c < gridSize; c++) { rowLine.push({ r, c, char: getCellRawContent(r,c), type: currentPuzzle.gridDefinition[r][c].t }); }
            linesData.push(rowLine);
        }
        for (let c = 0; c < gridSize; c++) {
            const colLine = [];
            for (let r = 0; r < gridSize; r++) { colLine.push({ r, c, char: getCellRawContent(r,c), type: currentPuzzle.gridDefinition[r][c].t }); }
            linesData.push(colLine);
        }

        const validationPromises = [];

        linesData.forEach(line => {
            let currentWord = ''; let wordCells = [];
            for (let i = 0; i < line.length; i++) {
                const cellData = line[i];
                const isLetterCell = (cellData.type === 'l' || (cellData.type === 'a' && /^[A-Z]$/.test(cellData.char)));
                
                if (isLetterCell && cellData.char) {
                    currentWord += cellData.char; wordCells.push(gridCells[cellData.r][cellData.c]);
                } else {
                    if (currentWord.length >= minWordLength) {
                        const promise = isWordValid(currentWord).then(isValid => {
                            if (!isValid) wordCells.forEach(cellEl => cellEl.classList.add('cell-word-error'));
                        });
                        validationPromises.push(promise);
                    }
                    currentWord = ''; wordCells = [];
                }
            }
            if (currentWord.length >= minWordLength) { // Check at end of line
                const promise = isWordValid(currentWord).then(isValid => {
                    if (!isValid) wordCells.forEach(cellEl => cellEl.classList.add('cell-word-error'));
                });
                validationPromises.push(promise);
            }
        });
        await Promise.all(validationPromises); // Wait for all API calls to complete
    }

    function validateAllCages() { /* ... same as before ... */
        currentPuzzle.cages.forEach(cage => {
            const cageCellValues = [];
            let allCellsFilledAndValid = true;
            for (const [r, c] of cage.cells) {
                const val = getCellValueForCalc(r, c);
                if (val === null) { allCellsFilledAndValid = false; break; }
                cageCellValues.push(val);
            }
            const firstCellOfCage = cage.cells[0];
            const cageInfoForCell = cellCageInfo[`${firstCellOfCage[0]}-${firstCellOfCage[1]}`];
            if (!cageInfoForCell) { return; }
            const clueElementId = `clue-${cageInfoForCell.cageId}`;
            const clueElement = document.getElementById(clueElementId);

            if (!clueElement) return;
            clueElement.classList.remove('cage-clue-error', 'cage-clue-correct');
            if (!allCellsFilledAndValid) return; 

            let result, isValid = false;
            switch (cage.operation) {
                case 'add': result = cageCellValues.reduce((s, v) => s + v, 0); isValid = result === cage.target; break;
                case 'mul': result = cageCellValues.reduce((p, v) => p * v, 1); isValid = result === cage.target; break;
                case 'sub': if (cageCellValues.length === 2) isValid = Math.abs(cageCellValues[0] - cageCellValues[1]) === cage.target; break;
                case 'div': 
                     if (cageCellValues.length === 2) {
                        const v0 = cageCellValues[0], v1 = cageCellValues[1];
                        if (v1 !== 0 && v0 / v1 === cage.target && v0 % v1 === 0) isValid = true;
                        else if (v0 !== 0 && v1 / v0 === cage.target && v1 % v0 === 0) isValid = true;
                    } break;
                default: console.warn("Unknown cage operation:", cage.operation); break;
            }
            if (isValid) clueElement.classList.add('cage-clue-correct'); else clueElement.classList.add('cage-clue-error');
        });
    }

    const solutionButton = document.getElementById('solutionButton');
    if (solutionButton) {
        solutionButton.addEventListener('click', () => {
            const puzzleToStore = {
                gridDefinition: currentPuzzle.gridDefinition, // The structure, types, prefilled
                cages: currentPuzzle.cages,
                solutionGrid: currentPuzzle.solutionGrid, // The specific solved values
                letterValues: letterValues
            };
            localStorage.setItem('alphaNumericGridlockSolutionData', JSON.stringify(puzzleToStore));
            window.location.href = 'solution.html';
        });
    }
});
