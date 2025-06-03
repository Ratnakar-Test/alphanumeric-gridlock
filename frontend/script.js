document.addEventListener('DOMContentLoaded', () => {
    const gameGridElement = document.getElementById('game-grid');
    const gridSize = 6;
    const regionRows = 2;
    const regionCols = 3;
    const minWordLength = 3; // Minimum length for a sequence of letters to be considered a word

    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
        'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
    };

    // Small embedded dictionary (all uppercase)
    const wordDictionary = [
        "ACE", "ACT", "ADD", "ART", "ASK", "ATE", "BAD", "BAG", "BAT", "BED", "BEG", "BET", "BIG", "BIT", "BOX", "BOY",
        "BUG", "BUS", "BUT", "BUY", "BYE", "CAB", "CAN", "CAP", "CAR", "CAT", "COD", "COT", "COW", "CRY", "CUB", "CUP",
        "CUT", "DAD", "DAY", "DID", "DIE", "DIG", "DOG", "DOT", "DRY", "DUE", "EAT", "EGG", "END", "EYE", "FAR", "FAT",
        "FEW", "FIX", "FLY", "FOG", "FOR", "FUN", "FUR", "GAP", "GAS", "GET", "GOD", "GOT", "GUM", "GUN", "GUT", "GUY",
        "HAD", "HAS", "HAT", "HEN", "HER", "HEY", "HID", "HIM", "HIP", "HIS", "HIT", "HOT", "HOW", "HUG", "HUM", "ICE",
        "ILL", "INK", "ITS", "JET", "JOB", "JOG", "JOY", "JUG", "KID", "KIT", "LAB", "LAP", "LAW", "LAY", "LED", "LEG",
        "LET", "LID", "LIE", "LIP", "LIT", "LOG", "LOT", "LOW", "MAD", "MAN", "MAP", "MAT", "MAY", "MEN", "MIX", "MOM",
        "MUD", "NET", "NEW", "NOD", "NOT", "NOW", "NUT", "OAK", "ODD", "OFF", "OLD", "ONE", "OUR", "OUT", "OWE", "OWL",
        "OWN", "PAD", "PAN", "PAT", "PAY", "PEG", "PEN", "PET", "PIG", "PIN", "PIT", "POT", "PUT", "RAG", "RAN", "RAT",
        "RED", "REP", "RIB", "RID", "RIG", "RIM", "RIP", "ROB", "ROD", "ROT", "ROW", "RUB", "RUG", "RUM", "RUN", "SAD",
        "SAG", "SAP", "SAT", "SAW", "SAY", "SEA", "SEE", "SET", "SEW", "SHE", "SKY", "SON", "SUN", "TAP", "TAX", "TEA",
        "TEN", "THE", "TIE", "TIP", "TOE", "TOO", "TOP", "TOY", "TRY", "TUB", "TUG", "TWO", "USE", "VAN", "VET", "WAR",
        "WAS", "WAY", "WEB", "WED", "WET", "WHO", "WHY", "WIN", "WOK", "YES", "YET", "YOU", "ZIP", "ZOO",
        "ABLE", "ACID", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL", "BAND", "BANK", "BASE", "BATH", "BEAR",
        "BEAT", "BEEN", "BEER", "BELL", "BELT", "BEND", "BEST", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB", "BOND",
        "BONE", "BOOK", "BOSS", "BOTH", "BOWL", "BURN", "BUSH", "BUSY", "CAKE", "CALL", "CALM", "CAME", "CAMP", "CARD",
        "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT", "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME",
        "COOK", "COOL", "COPY", "CORE", "CORN", "COST", "CREW", "CROP", "DARK", "DATA", "DATE", "DEAL", "DEAR", "DEBT",
        "DECK", "DEEP", "DEER", "DESK", "DIAL", "DIET", "DIRT", "DISK", "DOES", "DONE", "DOOR", "DOWN", "DRAW", "DREAM",
        "DRESS", "DRINK", "DRIVE", "DROP", "DRUG", "DUCK", "DUST", "DUTY", "EACH", "EARN", "EAST", "EASY", "EDGE", "ELSE",
        "EVEN", "EVER", "FACE", "FACT", "FAIL", "FAIR", "FALL", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET",
        "FELT", "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAG", "FLAT", "FLOW", "FOOD",
        "FOOT", "FORD", "FORM", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "GAIN", "GAME", "GANG", "GATE", "GAVE",
        "GEAR", "GENE", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOLD", "GONE", "GOOD", "GRAY", "GREW", "GREY", "GRID",
        "GROW", "HAIR", "HALF", "HALL", "HAND", "HANG", "HARD", "HATE", "HAVE", "HEAD", "HEAR", "HEAT", "HELD", "HELL",
        "HELP", "HERE", "HIGH", "HILL", "HOLD", "HOLE", "HOME", "HOPE", "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA",
        "INCH", "INTO", "IRON", "ITEM", "JOIN", "JUMP", "JURY", "JUST", "KEEP", "KICK", "KILL", "KIND", "KING", "KNEE",
        "KNEW", "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAMB", "LAND", "LANE", "LAST", "LATE", "LAZY", "LEAD", "LEAF",
        "LEFT", "LEND", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE", "LOAD", "LOAN", "LOCK", "LONG",
        "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOUD", "LOVE", "LUCK", "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY",
        "MARK", "MASS", "MEAL", "MEAN", "MEAT", "MEET", "MENU", "MILE", "MILK", "MIND", "MINE", "MISS", "MODE", "MOOD",
        "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME", "NAVY", "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE",
        "NINE", "NONE", "NOSE", "NOTE", "NOUN", "ONTO", "OPEN", "OVER", "PAGE", "PAIN", "PAIR", "PALE", "PARK", "PART",
        "PASS", "PAST", "PATH", "PEAK", "PICK", "PILE", "PINK", "PIPE", "PLAN", "PLAY", "PLOT", "PLUS", "POEM", "POET",
        "POLE", "POOL", "POOR", "PORT", "POST", "PULL", "PURE", "PUSH", "RACE", "RAIN", "RARE", "RATE", "READ", "REAL",
        "RELY", "RENT", "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOF",
        "ROOM", "ROOT", "ROSE", "ROUGH", "ROUND", "RULE", "RUSH", "SAFE", "SAID", "SAKE", "SALE", "SALT", "SAME", "SAND",
        "SAVE", "SEAT", "SEED", "SEEK", "SEEM", "SELL", "SEND", "SENSE", "SENT", "SEVEN", "SHIP", "SHOP", "SHOT", "SHOW",
        "SICK", "SIDE", "SIGN", "SING", "SITE", "SIZE", "SKIN", "SNOW", "SOFT", "SOIL", "SOLD", "SOME", "SONG", "SOON",
        "SORT", "SOUL", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", "TAKE", "TALE", "TALK", "TALL",
        "TANK", "TAPE", "TASK", "TAXI", "TEAM", "TEAR", "TELL", "TERM", "TEST", "TEXT", "THAN", "THAT", "THEM", "THEN",
        "THIN", "THIS", "THUS", "TIME", "TINY", "TONE", "TOOL", "TOUR", "TOWN", "TREE", "TRIP", "TRUE", "TUNE", "TURN",
        "TYPE", "UNIT", "UPON", "USED", "USER", "VAST", "VERY", "VIEW", "VOTE", "WAIT", "WAKE", "WALK", "WALL", "WANT",
        "WARD", "WARM", "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST", "WHAT", "WHEN", "WIDE",
        "WIFE", "WILD", "WILL", "WIND", "WINE", "WING", "WIRE", "WISE", "WISH", "WITH", "WOOD", "WORD", "WORK", "YARD", "YEAR",
        "ALPHA", "BRAVO", "CHARM", "DELTA", "ECHO", "FOCUS", "GAMMA", "HOTEL", "INDIA", "JULIET", "KAPPA", "LOGIC",
        "MACRO", "NINJA", "OMEGA", "PAPA", "QUEEN", "ROMEO", "SOLVE", "TANGO", "ULTRA", "VICTOR", "WHISKY", "XRAY", "YANKEE", "ZEBRA",
        "NUMBER", "LETTER", "PUZZLE", "SQUARE", "CREATE", "ACTIVE", "VERIFY", "ANSWER", "METHOD", "SYSTEM", "FORMAT"
    ];


    // Puzzle definition with cell types: 'n' for number, 'l' for letter, 'a' for any
    // v: value, t: type, p: prefilled (boolean)
    const samplePuzzleData = [
        // Row 0
        [ {v:'', t:'n', p:false}, {v:'A', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'L', t:'l', p:false}, {v:'5', t:'n', p:true},  {v:'P', t:'l', p:false} ],
        // Row 1
        [ {v:'2', t:'n', p:true},  {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'P', t:'l', p:false}, {v:'', t:'l', p:false}, {v:'C', t:'l', p:true}  ],
        // Row 2
        [ {v:'', t:'n', p:false}, {v:'', t:'n', p:false}, {v:'B', t:'l', p:true},  {v:'4', t:'n', p:true},  {v:'H', t:'l', p:false}, {v:'A', t:'l', p:false} ],
        // Row 3
        [ {v:'S', t:'l', p:false}, {v:'1', t:'n', p:true},  {v:'O', t:'l', p:false}, {v:'L', t:'l', p:false}, {v:'V', t:'l', p:false}, {v:'E', t:'l', p:true}  ],
        // Row 4
        [ {v:'D', t:'l', p:true},  {v:'', t:'n', p:false}, {v:'G', t:'l', p:false}, {v:'', t:'n', p:false}, {v:'3', t:'n', p:true},  {v:'', t:'l', p:false} ],
        // Row 5
        [ {v:'', t:'a', p:false}, {v:'T', t:'l', p:false}, {v:'6', t:'n', p:true},  {v:'E', t:'l', p:false}, {v:'S', t:'l', p:false}, {v:'F', t:'l', p:true}  ]
    ]; // Example: Row 3 can form SOLVE, Col 3 can form APPLE (if cells allow)

    const sampleCages = [ /* ... cage definitions remain the same ... */
        { cells: [[0,0], [1,0]], target: 7, operation: 'add', displayOp: '+' },
        { cells: [[0,2], [0,3]], target: 15, operation: 'mul', displayOp: '×' }, // (0,3) is L=12, (0,2) needs to be 15/12 (not int) - adjust puzzle for better example
        { cells: [[1,1], [2,1], [2,0]], target: 10, operation: 'add', displayOp: '+' },
        { cells: [[4,3], [5,3]], target: 2, operation: 'sub', displayOp: '−' },
        { cells: [[5,4], [5,5]], target: 30, operation: 'mul', displayOp: '×' }
    ];
    // Adjusting cage for (0,2), (0,3) to be more solvable with example letters. If (0,3) is L=12, (0,2) is 'n'. For target 24, (0,2) could be 2.
    sampleCages[1] = { cells: [[0,2], [0,3]], target: 24, operation: 'mul', displayOp: '×' };


    const gridCells = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    if (!gameGridElement) { /* ... error handling ... */ return; }
    gameGridElement.innerHTML = '';

    const cellCageInfo = {}; /* ... cage info setup ... */
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


    for (let row = 0; row < gridSize; row++) { /* ... cell creation loop ... */
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
            if (cageData) { /* ... cage border and clue rendering ... */
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

            if (puzzleCellData.p) { /* ... prefilled cell rendering ... */
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
    
    validateAllGameRules(); // Changed from validateAllCellsAndCages

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

    function handleInput(e, cellType) { /* ... mostly same, triggers validateAllGameRules ... */
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

        validateAllGameRules(); // Central validation call
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
    
    function clearAllValidationStyles() {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                gridCells[r][c].classList.remove('cell-invalid', 'cell-word-error', 'cell-word-correct');
            }
        }
        sampleCages.forEach(cage => {
            const firstCellOfCage = cage.cells[0];
            const clueElementId = `clue-${cellCageInfo[`${firstCellOfCage[0]}-${firstCellOfCage[1]}`].cageId}`;
            const clueElement = document.getElementById(clueElementId);
            if (clueElement) {
                clueElement.classList.remove('cage-clue-error', 'cage-clue-correct');
            }
        });
    }

    function validateAllGameRules() {
        clearAllValidationStyles(); // Clear previous validation states

        // 1. Validate individual cells (Sudoku rules for numbers)
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!samplePuzzleData[r][c].p) { // Only validate user-editable cells for their own content
                    validateNumberCellUniqueness(r, c);
                }
            }
        }

        // 2. Validate words
        validateWordsInGrid();

        // 3. Validate cages
        validateAllCages();
    }


    function validateNumberCellUniqueness(row, col) {
        const cellElement = gridCells[row][col];
        const puzzleCellData = samplePuzzleData[row][col];
        const currentValue = getCellRawContent(row, col);
        
        // Check applies if cell type is 'n', or 'a' and holds a number
        if (currentValue && (puzzleCellData.t === 'n' || (puzzleCellData.t === 'a' && /^[1-9]$/.test(currentValue)))) {
            // Check row
            for (let c = 0; c < gridSize; c++) {
                if (c !== col && getCellRawContent(row, c) === currentValue) {
                    cellElement.classList.add('cell-invalid'); gridCells[row][c].classList.add('cell-invalid');
                }
            }
            // Check column
            for (let r = 0; r < gridSize; r++) {
                if (r !== row && getCellRawContent(r, col) === currentValue) {
                    cellElement.classList.add('cell-invalid'); gridCells[r][col].classList.add('cell-invalid');
                }
            }
            // Check 2x3 region
            const startRow = Math.floor(row / regionRows) * regionRows;
            const startCol = Math.floor(col / regionCols) * regionCols;
            for (let r = startRow; r < startRow + regionRows; r++) {
                for (let c = startCol; c < startCol + regionCols; c++) {
                    if ((r !== row || c !== col) && getCellRawContent(r, c) === currentValue) {
                        cellElement.classList.add('cell-invalid'); gridCells[r][c].classList.add('cell-invalid');
                    }
                }
            }
        }
    }
    
    function validateWordsInGrid() {
        const lines = []; // To store all rows and columns data

        // Get rows
        for (let r = 0; r < gridSize; r++) {
            const rowLine = [];
            for (let c = 0; c < gridSize; c++) {
                rowLine.push({ r, c, char: getCellRawContent(r,c), type: samplePuzzleData[r][c].t });
            }
            lines.push(rowLine);
        }
        // Get columns
        for (let c = 0; c < gridSize; c++) {
            const colLine = [];
            for (let r = 0; r < gridSize; r++) {
                colLine.push({ r, c, char: getCellRawContent(r,c), type: samplePuzzleData[r][c].t });
            }
            lines.push(colLine);
        }

        lines.forEach(line => {
            let currentWord = '';
            let wordCells = [];
            for (let i = 0; i < line.length; i++) {
                const cellData = line[i];
                const isLetterCell = (cellData.type === 'l' || (cellData.type === 'a' && /^[A-Z]$/.test(cellData.char)));
                
                if (isLetterCell && cellData.char) {
                    currentWord += cellData.char;
                    wordCells.push(gridCells[cellData.r][cellData.c]);
                } else {
                    if (currentWord.length >= minWordLength) {
                        if (!wordDictionary.includes(currentWord)) {
                            wordCells.forEach(cellEl => cellEl.classList.add('cell-word-error'));
                        } else {
                             // Optionally add 'cell-word-correct' if desired
                        }
                    }
                    currentWord = '';
                    wordCells = [];
                }
            }
            // Check for word at the end of the line
            if (currentWord.length >= minWordLength) {
                if (!wordDictionary.includes(currentWord)) {
                    wordCells.forEach(cellEl => cellEl.classList.add('cell-word-error'));
                } else {
                    // Optionally add 'cell-word-correct'
                }
            }
        });
    }

    function validateAllCages() { /* ... same as before ... */
        sampleCages.forEach(cage => {
            const cageCellValues = [];
            let allCellsFilledAndValid = true;
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
                return; 
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
                case 'sub': 
                    if (cageCellValues.length === 2) {
                        isValid = Math.abs(cageCellValues[0] - cageCellValues[1]) === cage.target;
                    }
                    break;
                case 'div': 
                     if (cageCellValues.length === 2) {
                        const v0 = cageCellValues[0]; const v1 = cageCellValues[1];
                        if (v1 !== 0 && v0 / v1 === cage.target && v0 % v1 === 0) isValid = true;
                        else if (v0 !== 0 && v1 / v0 === cage.target && v1 % v0 === 0) isValid = true;
                    }
                    break;
                default: 
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
