const pairs = {
    'casa-cama': {
        word1: 'CASA', word2: 'CAMA',
        img1: 'https://cdn-icons-png.flaticon.com/128/619/619153.png',
        img2: 'https://cdn-icons-png.flaticon.com/128/3030/3030336.png'
    },
    'sol-sal': {
        word1: 'SOL', word2: 'SAL',
        img1: 'https://cdn-icons-png.flaticon.com/128/439/439842.png',
        img2: 'https://cdn-icons-png.flaticon.com/128/2316/2316654.png'
    }
};

let currentLevel = 1;
let gameInterval = null;
let timerInterval = null;
let startTime = 0;
let currentIndex = 0;
let musicOn = false;

// Elementos DOM
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnMusic = document.getElementById('btn-music');
const pairSelect = document.getElementById('pair-selector');
const levelSelect = document.getElementById('level-selector');
const levelDisplay = document.getElementById('current-level');
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('game-state');
const wordDisplay = document.getElementById('word-display');
const audio = document.getElementById('bg-music');
const cells = document.querySelectorAll('.cell');

const levelsConfig = [
    { speed: 1000, pattern: [0,0,0,0,1,1,1,1] }, // Nivel 1
    { speed: 800,  pattern: [0,1,0,1,0,1,0,1] }, // Nivel 2
    { speed: 600,  pattern: [1,1,0,0,1,1,0,0] }, // Nivel 3
    { speed: 400,  pattern: [0,0,1,1,0,0,1,1] }, // Nivel 4
    { speed: 250,  pattern: [1,0,1,1,0,1,0,0] }  // Nivel 5 (Rápido)
];

function setupGrid() {
    const pair = pairs[pairSelect.value];
    const pattern = levelsConfig[currentLevel - 1].pattern;
    cells.forEach((cell, i) => {
        cell.style.backgroundImage = `url(${pattern[i] === 0 ? pair.img1 : pair.img2})`;
        cell.dataset.word = pattern[i] === 0 ? pair.word1 : pair.word2;
    });
}

function startLevel() {
    if (currentLevel > 5) return finishGame();
    
    setupGrid();
    levelDisplay.textContent = currentLevel;
    statusDisplay.textContent = '¡Ronda en curso!';
    currentIndex = 0;

    const speed = levelsConfig[currentLevel - 1].speed;
    
    gameInterval = setInterval(() => {
        cells.forEach(c => c.classList.remove('active'));
        
        if (currentIndex < 8) {
            const activeCell = cells[currentIndex];
            activeCell.classList.add('active');
            wordDisplay.textContent = activeCell.dataset.word;
            currentIndex++;
        } else {
            clearInterval(gameInterval);
            currentLevel++;
            statusDisplay.textContent = 'Preparando siguiente...';
            setTimeout(startLevel, 1500); // Pausa entre niveles
        }
    }, speed);
}

btnStart.onclick = () => {
    currentLevel = parseInt(levelSelect.value);
    btnStart.disabled = true;
    btnStop.disabled = false;
    pairSelect.disabled = true;
    levelSelect.disabled = true;
    
    startTime = Date.now();
    timerInterval = setInterval(() => {
        timerDisplay.textContent = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    }, 100);

    if (musicOn) audio.play();
    startLevel();
};

btnStop.onclick = resetGame;

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    audio.pause();
    audio.currentTime = 0;
    
    btnStart.disabled = false;
    btnStop.disabled = true;
    pairSelect.disabled = false;
    levelSelect.disabled = false;
    
    cells.forEach(c => c.classList.remove('active'));
    wordDisplay.textContent = 'Juego Detenido';
    statusDisplay.textContent = 'Esperando...';
}

function finishGame() {
    resetGame();
    wordDisplay.textContent = '¡FIN DE PARTIDA!';
    statusDisplay.textContent = 'Completado';
}

btnMusic.onclick = () => {
    musicOn = !musicOn;
    btnMusic.textContent = musicOn ? '🎵 Música: ON' : '🎵 Música: OFF';
    if (!musicOn) audio.pause();
    else if (!btnStart.disabled) audio.pause(); // Solo suena si el juego está activo
};