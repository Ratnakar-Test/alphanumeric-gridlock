document.addEventListener('DOMContentLoaded', () => {
    const solvedGridElement = document.getElementById('solved-game-grid');
    const logicDetailsElement = document.getElementById('logic-details');
    const gridSize = 6;

    const storedData = localStorage.getItem('alphaNumericGridlockSolutionData');
    if (!storedData) {
        if (solvedGridElement) solvedGridElement.innerHTML = '<p>Solution data not found. Please open from the game page.</p>';
        return;
    }

    // Note: 'puzzleData' in stored obj is the initial gridDefinition.
    // 'solutionGrid' is the actual solved values.
    const { gridDefinition, cages, solutionGrid, letterValues } = JSON.parse(storedData);

    if (!solvedGridElement || !solutionGrid || !gridDefinition || !cages || !letterValues) {
        if (solvedGridElement) solvedGridElement.innerHTML = '<p>Error loading solution components.</p>';
        return;
    }
    
    solvedGridElement.style.display = 'grid';
    solvedGridElement.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;
    solvedGridElement.style.gridTemplateRows = `repeat(${gridSize}, 50px)`;

    const cellCageInfo = {}; 
    cages.forEach((cage, cageIndex) => {
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
            cellElement.classList.add('grid-cell'); // Use existing style
            
            // Display the value from the solutionGrid
            cellElement.textContent = solutionGrid[row][col]; 

            // Style as prefilled if it was prefilled in the original puzzle for consistency
            if (gridDefinition[row][col].p) {
                cellElement.classList.add('prefilled-cell');
            }
            // Add cell type class for consistent styling if any
            const cellType = gridDefinition[row][col].t;
            if (cellType === 'n') cellElement.classList.add('cell-type-number');
            else if (cellType === 'l') cellElement.classList.add('cell-type-letter');


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
                    
                    if (checkCageSatisfied(cage, solutionGrid, letterValues)) { // Check with solutionGrid
                        clueSpan.classList.add('cage-clue-correct');
                    } else {
                        clueSpan.classList.add('cage-clue-error'); 
                    }
                    cellElement.appendChild(clueSpan);
                    if(cellElement.textContent !== clueSpan.textContent){ 
                        const mainValue = cellElement.textContent.replace(clueSpan.textContent, '');
                        cellElement.innerHTML = ''; 
                        cellElement.appendChild(clueSpan);
                        cellElement.appendChild(document.createTextNode(mainValue));
                    }
                }
            }
            solvedGridElement.appendChild(cellElement);
        }
    }

    if (logicDetailsElement && cages.length > 0) {
        logicDetailsElement.innerHTML = ''; // Clear any default li
        const generalLi1 = document.createElement('li');
        generalLi1.textContent = 'All numbers adhere to Sudoku-like rules (unique in row, column, and 2x3 region).';
        logicDetailsElement.appendChild(generalLi1);
        const generalLi2 = document.createElement('li');
        generalLi2.textContent = 'All letter sequences of 3+ letters form valid English words (checked via API).';
        logicDetailsElement.appendChild(generalLi2);
         const generalLi3 = document.createElement('li');
        generalLi3.textContent = 'All cage calculations are satisfied by the solution values.';
        logicDetailsElement.appendChild(generalLi3);


        for (let i = 0; i < Math.min(cages.length, 3); i++) {
            const cage = cages[i];
            const li = document.createElement('li');
            let valuesInCage = cage.cells.map(([r,c]) => solutionGrid[r][c]); // Use solutionGrid
            let numericValues = valuesInCage.map(v => letterValues[v] || ( ( /^[1-9]$/.test(v) ) ? parseInt(v) : v ) );
            li.innerHTML = `<b>Example Cage:</b> Clue "<code>${cage.target}${cage.displayOp}</code>" with cell values [${valuesInCage.join(', ')}] (numerically [${numericValues.join(', ')}]) correctly results in ${cage.target}.`;
            logicDetailsElement.appendChild(li);
        }
    }
});

// This checkCageSatisfied function is duplicated from main script for solution page use.
// In a modular system, this would be shared.
function checkCageSatisfied(cage, solvedGridVals, lettersMap) {
    const cageCellValues = [];
    for (const [r, c] of cage.cells) {
        const rawVal = solvedGridVals[r][c];
        let val = null;
        if (lettersMap[rawVal]) {
            val = lettersMap[rawVal];
        } else if (/^[1-9]$/.test(rawVal)) {
            val = parseInt(rawVal);
        }
        if (val === null) return false;
        cageCellValues.push(val);
    }

    let result;
    let isValid = false;
    if (cageCellValues.length === 0 && cage.cells.length > 0) return false; // Not all cells might be parsable

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
    }
    return isValid;
}
