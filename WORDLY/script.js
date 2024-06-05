const grid = document.getElementById('grid');
const backspaceButton = document.getElementById('backspace-button');
const hintButton = document.getElementById('hint-button');
const hintDiv = document.getElementById('hint');
const messageDiv = document.getElementById('message');
const guidanceModal = document.getElementById('guidance-modal');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const keyboardButtons = document.querySelectorAll('.keyboard-button');
const submitButton = document.getElementById('submit-button');
const fallbackWords = ['man', 'bat', 'app', 'pen', 'pea', 'sun'];

let word = '';
let currentRow = 0;
let currentGuess = [];
let currentCursor = 0;
let cachedWords = [];

async function getRandomWord() {
    if (cachedWords.length === 0) {
        try {
            const response = await fetch('https://random-word-api.vercel.app/api?words=10&length=3');
            const data = await response.json();
            if (!data || data.length === 0 || data.some(word => word.length !== 3)) throw new Error('Invalid word data');
            cachedWords = data;
        } catch (error) {
            console.error('Error fetching words:', error);
            cachedWords = fallbackWords;
        }
    }
    const wordIndex = Math.floor(Math.random() * cachedWords.length);
    const word = cachedWords[wordIndex];
    cachedWords.splice(wordIndex, 1); // Remove fetched word from cache
    return word;
}

keyboardButtons.forEach(button => {
    button.addEventListener('click', () => {
        const key = button.textContent;
        if (key === 'Backspace') {
            if (currentGuess.length > 0) {
                currentGuess.pop();
                currentCursor--;
                updateGrid();
                updateCursor();
            }
        } else if (key === 'Enter') {
            if (currentGuess.length === 3) {
                checkGuess();
            }
        } else {
            if (currentGuess.length < 3 && /^[a-z]$/i.test(key)) {
                currentGuess.push(key.toUpperCase());
                currentCursor++;
                updateGrid();
                updateCursor();
            }
        }
    });
});


submitButton.addEventListener('click', () => {
    if (currentGuess.length === 3) {
        checkGuess();
    }
});

async function initializeGame() {
    word = await getRandomWord();
    console.log(`Random word: ${word}`); // For debugging purposes
    createGrid();
    updateCursor();
    guidanceModal.style.display = 'block'; // Show the guidance modal
    grid.style.visibility = 'visible'; // Show grid
    document.querySelector('.hint-container').style.visibility = 'visible'; // Show hint button
    hintDiv.textContent = ''; // Reset hint
    messageDiv.textContent = ''; // Clear previous messages
}

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < 3 * 5; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('id', `cell-${i}`);
        grid.appendChild(cell);
    }
}

function updateGrid() {
    for (let i = 0; i < 3; i++) {
        const cell = document.getElementById(`cell-${currentRow * 3 + i}`);
        cell.textContent = currentGuess[i] || '';
    }
}

function updateCursor() {
    const cells = document.querySelectorAll('.grid div');
    cells.forEach(cell => cell.classList.remove('cursor'));

    if (currentCursor < 3) {
        const cursorCell = document.getElementById(`cell-${currentRow * 3 + currentCursor}`);
        cursorCell.classList.add('cursor');
    }
}

function checkGuess() {
    currentGuess.forEach((letter, index) => {
        const cell = document.getElementById(`cell-${currentRow * 3 + index}`);
        if (letter === word[index]) {
            cell.style.backgroundColor = 'green';
        } else if (word.includes(letter)) {
            cell.style.backgroundColor = 'yellow';
        } else {
            cell.style.backgroundColor = 'red';
        }
    });

    if (currentGuess.join('') === word) {
        resultMessage.textContent = "Congratulations! You guessed the word!";
        resultModal.style.display = 'block'; // Show the result modal
        // Add winning animation here
    } else {
        currentRow++;
        if (currentRow === 5) {
            resultMessage.textContent = `Better luck next time! The word was "${word}".`;
            resultModal.style.display = 'block'; // Show the result modal
        } else {
            currentGuess = [];
            currentCursor = 0;
            updateCursor();
        }
        
    }
}

document.addEventListener('keydown', (event) => {
    if (messageDiv.textContent) return; // Stop input after game is over

    if (currentGuess.length < 3 && /^[a-z]$/i.test(event.key)) {
        currentGuess.push(event.key.toLowerCase());
        currentCursor++;
        updateGrid();
        updateCursor();
    } else if (event.key === 'Enter' && currentGuess.length === 3) {
        checkGuess();
    } else if (event.key === 'Backspace' && currentGuess.length > 0) {
        currentGuess.pop();
        currentCursor--;
        updateGrid();
        updateCursor();
    }
});

backspaceButton.addEventListener('click', () => {
    if (currentGuess.length > 0) {
        currentGuess.pop();
        currentCursor--;
        updateGrid();
        updateCursor();
    }
});

hintButton.addEventListener('click', () => {
    hintDiv.textContent = `The word starts with "${word[0]}"`;
});

startButton.addEventListener('click', () => {
    guidanceModal.style.display = 'none';
});

playAgainButton.addEventListener('click', () => {
    resultModal.style.display = 'none'; // Hide the play-again modal
    currentRow = 0;
    currentGuess = [];
    currentCursor = 0;
    initializeGame(); // Fetch a new word and restart the game

    // Set the same message in the play-again modal
    playAgainMessage.textContent = resultMessage.textContent;
});

initializeGame();