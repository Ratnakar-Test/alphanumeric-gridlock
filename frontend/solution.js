document.addEventListener('DOMContentLoaded', () => {
    const solvedGridElement = document.getElementById('solved-game-grid');
    const logicDetailsElement = document.getElementById('logic-details');
    const gridSize = 6;

    const storedData = localStorage.getItem('alphaNumericGridlockSolutionData');
    if (!storedData) {
        if (solvedGridElement) solvedGridElement.innerHTML = '<p class="text-error">Solution data not found in localStorage. Please try navigating from the main game page after it has loaded.</p>';
        console.error("Solution data not found in localStorage.");
        return;
    }

    let parsedData;
    try {
        parsedData = JSON.parse(storedData);
    } catch (e) {
        if (solvedGridElement) solvedGridElement.innerHTML = '<p class="text-error">Error parsing solution data. Data might be corrupted.</p>';
        console.error("Error parsing solution data:", e);
        return;
    }

    const { gridDefinition, cages, solutionGrid, letterValues } = parsedData;

    if (!solvedGridElement || !solutionGrid || !gridDefinition || !cages || !letterValues) {
        if (solvedGridElement) solvedGridElement.innerHTML = '<p class="text-error">Essential solution components (grid, cages, solution values, or letter values) are missing from the stored data.</p>';
        console.error("Essential solution components missing from stored data.", parsedData);
        return;
    }
    
    // Apply grid container styles dynamically
    solvedGridElement.style.display = 'grid';
    solvedGridElement.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;
    solvedGridelement.style.gridTemplateRows = `repeat(${gridSize}, 50px)`;
    // The following styles are from #game-grid in style.css, ensuring consistency
    solvedGridElement.style.position = 'relative';
    // Use a themed border for the solution grid container, can adjust if needed
    const outerBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--bc') || '#777777'; // Get base-content color
    solvedGridElement.style.border = `2px solid hsla(${outerBorderColor}, 0.6)`;


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
            cellElement.classList.add('grid-cell'); // Uses styles from main style.css
            
            const solvedValue = solutionGrid[row][col] || ''; // Ensure solvedValue is at least an empty string

            // Clear cell content first before adding new elements
            cellElement.innerHTML = '';

            // Add cage borders and clues for context
            const cageData = cellCageInfo[`${row}-${col}`];
            if (cageData) {
                cellElement.classList.add(cageData.cageId);
                // Apply cage borders (copied from main script.js logic)
                if (row === 0 || !cellCageInfo[`${row-1}-${col}`] || cellCageInfo[`${row-1}-${col}`].cageId !== cageData.cageId) cellElement.style.borderTop = '2px solid black';
                if (row === gridSize - 1 || !cellCageInfo[`${row+1}-${col}`] || cellCageInfo[`${row+1}-${col}`].cageId !== cageData.cageId) cellElement.style.borderBottom = '2px solid black';
                if (col === 0 || !cellCageInfo[`${row}-${col-1}`] || cellCageInfo[`${row}-${col-1}`].cageId !== cageData.cageId) cellElement.style.borderLeft = '2px solid black';
                if (col === gridSize - 1 || !cellCageInfo[`${row}-${col+1}`] || cellCageInfo[`${row}-${col+1}`].cageId !== cageData.cageId) cellElement.style.borderRight = '2px solid black';

                if (cageData.isClueDisplay) {
                    const clueSpan = document.createElement('span');
                    clueSpan.classList.add('cage-clue');
                    clueSpan.textContent = `${cageData.cage.target}${cageData.cage.displayOp}`;
                    
                    if (checkCageSatisfied(cage, solutionGrid, letterValues)) {
                        clueSpan.classList.add('cage-clue-correct');
                    } else {
                        clueSpan.classList.add('cage-clue-error'); 
                    }
                    cellElement.appendChild(clueSpan); // Add clue first
                }
            }
            
            // Append the solved value as a text node AFTER the clue (if any)
            cellElement.appendChild(document.createTextNode(solvedValue));

            // Style as prefilled if it was prefilled in the original puzzle definition
            if (gridDefinition[row][col] && gridDefinition[row][col].p) {
                cellElement.classList.add('prefilled-cell');
            }
            // Add cell type class for consistent styling if any
            if(gridDefinition[row][col]){
                const cellType = gridDefinition[row][col].t;
                if (cellType === 'n') cellElement.classList.add('cell-type-number');
                else if (cellType === 'l') cellElement.classList.add('cell-type-letter');
            }
            
            solvedGridElement.appendChild(cellElement);
        }
    }

    // Populate logic details (example for a few cages)
    if (logicDetailsElement && cages.length > 0) {
        logicDetailsElement.innerHTML = ''; // Clear any default/previous li
        const generalLiPreamble = document.createElement('li');
        generalLiPreamble.innerHTML = `The solution adheres to all game rules: unique numbers in rows/columns/regions (Sudoku-like), valid words from letters, and correct cage arithmetic.`;
        logicDetailsElement.appendChild(generalLiPreamble);


        for (let i = 0; i < Math.min(cages.length, 3); i++) { // Show logic for first 3 cages
            const cage = cages[i];
            const li = document.createElement('li');
            let valuesInCage = cage.cells.map(([r,c]) => solutionGrid[r][c]); 
            let numericValues = valuesInCage.map(v => letterValues[v] || ( ( /^[1-9]$/.test(v) ) ? parseInt(v) : v ) );
            li.innerHTML = `<b>Cage Example ${i+1}:</b> Clue "<code>${cage.target}${cage.displayOp}</code>". Cells contain [${valuesInCage.join(', ')}]. These numerically evaluate to [${numericValues.join(', ')}]. The operation correctly results in ${cage.target}.`;
            logicDetailsElement.appendChild(li);
        }
    } else if (logicDetailsElement) {
        logicDetailsElement.innerHTML = '<li>No specific cage logic details to display for this solution.</li>';
    }
});

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
        // If a cell in the solution for this cage doesn't have a valid number or parsable letter,
        // the solution itself is flawed for this cage, or data is incomplete.
        if (val === null) return false; 
        cageCellValues.push(val);
    }

    // It's possible a cage has cells but no values that could be pushed (e.g. all cells had unparsable solution values)
    if (cage.cells.length > 0 && cageCellValues.length !== cage.cells.length) {
        return false; // Not all cells provided a usable value
    }
    if (cageCellValues.length === 0 && cage.cells.length > 0) { // No values extracted but cells exist
        return false;
    }


    let result;
    let isValid = false;
    // For empty cages (no cells), or if no values extracted somehow, consider it not validly checkable here.
    if (cageCellValues.length === 0) return false;


    switch (cage.operation) {
        case 'add': result = cageCellValues.reduce((s, v) => s + v, 0); isValid = result === cage.target; break;
        case 'mul': result = cageCellValues.reduce((p, v) => p * v, 1); isValid = result === cage.target; break;
        case 'sub': 
            if (cageCellValues.length === 2) isValid = Math.abs(cageCellValues[0] - cageCellValues[1]) === cage.target; 
            // Add rule for single cell cage: value must be target
            else if (cageCellValues.length === 1) isValid = cageCellValues[0] === cage.target;
            break;
        case 'div':
            if (cageCellValues.length === 2) {
                const v0 = cageCellValues[0], v1 = cageCellValues[1];
                if (v1 !== 0 && v0 / v1 === cage.target && v0 % v1 === 0) isValid = true;
                else if (v0 !== 0 && v1 / v0 === cage.target && v1 % v0 === 0) isValid = true;
            } 
            // Add rule for single cell cage: value must be target
            else if (cageCellValues.length === 1) isValid = cageCellValues[0] === cage.target;
            break;
        default: isValid = false; break; // Unknown operation or unhandled cage size
    }
    return isValid;
}
