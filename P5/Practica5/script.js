
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// resolucion
canvas.width = 800;
canvas.height = 450;

let gameState = {
    phase: 'MENU',
    mode: null,
    score: { blue: 0, red: 0 },
    countdown: 3
};

// objetos
const ball = {
    x: 400, y: 225, radius: 10,
    vx: 0, vy: 0,
    friction: 0.98
};

const player = {
    x: 200, y: 225, radius: 15,
    speed: 4, angle: 0,
    color: '#3498db', team: 'blue'
};

const bots = [
    { x: 600, y: 150, radius: 15, speed: 1.5, color: '#e74c3c', team: 'red', behavior: 'aggressive', cooldown: 0 },
    { x: 650, y: 300, radius: 15, speed: 1.5, color: '#e74c3c', team: 'red', behavior: 'defensive', cooldown: 0 }
];


const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (gameState.phase === 'GAMEOVER') {
        if (e.code === 'KeyR') resetGame(gameState.mode);
        if (e.code === 'KeyM') backToMenu();
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

// Funciones de inicio

function startGame(mode) {
    gameState.mode = mode;
    gameState.score = { blue: 0, red: 0 };
    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('game-mode-label').innerText = mode === '3goals' ? 'Modo: A 3 goles' : 'Modo: Gol de Oro';
    startRound();
}

function startRound() {
    gameState.phase = 'COUNTDOWN';
    gameState.countdown = 3;
    resetPositions();
    document.getElementById('countdown-overlay').classList.remove('hidden');
    
    const interval = setInterval(() => {
        gameState.countdown--;
        document.getElementById('countdown-number').innerText = gameState.countdown;
        if (gameState.countdown <= 0) {
            clearInterval(interval);
            gameState.phase = 'PLAYING';
            document.getElementById('countdown-overlay').classList.add('hidden');
        }
    }, 1000);
}

function resetPositions() {
    ball.x = 400; ball.y = 225; ball.vx = 0; ball.vy = 0;
    player.x = 200; player.y = 225;
    bots[0].x = 600; bots[0].y = 150;
    bots[1].x = 650; bots[1].y = 300;
}


function update() {
    if (gameState.phase !== 'PLAYING') return;

    // Movimiento Jugador
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;
    
    if (keys['KeyA']) player.angle -= 0.1;
    if (keys['KeyD']) player.angle += 0.1;

    // Bots
    bots.forEach(bot => {
        let targetX = ball.x;
        let targetY = ball.y;

        // Comportamiento defensivo
        if (bot.behavior === 'defensive' && ball.x < 400) {
            targetX = 650; targetY = canvas.height / 2;
        }

        const dx = targetX - bot.x;
        const dy = targetY - bot.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Movimiento hacia la bola
        if (dist > bot.radius + ball.radius) {
            bot.x += (dx / dist) * bot.speed;
            bot.y += (dy / dist) * bot.speed;
        }

        // disparo del Bot
        if (dist < bot.radius + ball.radius + 5) {
            if (bot.cooldown <= 0) {
                const angleToGoal = Math.atan2((canvas.height / 2) - ball.y, 0 - ball.x);
                ball.vx = Math.cos(angleToGoal) * 10;
                ball.vy = Math.sin(angleToGoal) * 10;
                bot.cooldown = 60;
            }
        }
        if (bot.cooldown > 0) bot.cooldown--;

        checkCollision(bot, ball);
    });

    // Pelota y Rebotes
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;

    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius + 1;
        ball.vy *= -1;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius - 1;
        ball.vy *= -1;
    }

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        if (ball.y > canvas.height * 0.3 && ball.y < canvas.height * 0.7) {
            handleGoal(ball.x < 400 ? 'red' : 'blue');
        } else {
            if (ball.x - ball.radius < 0) ball.x = ball.radius + 1;
            if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius - 1;
            ball.vx *= -1;
        }
    }

    // Colisiones Jugador y Chute Manual
    checkCollision(player, ball);
    if (keys['Space']) {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.radius + ball.radius + 5) {
            ball.vx = Math.cos(player.angle) * 11;
            ball.vy = Math.sin(player.angle) * 11;
        }
    }

    // Límites
    [player, ...bots].forEach(p => {
        p.x = Math.max(p.radius + 2, Math.min(canvas.width - p.radius - 2, p.x));
        p.y = Math.max(p.radius + 2, Math.min(canvas.height - p.radius - 2, p.y));
    });
}

// Colisión para evitar bloqueos
function checkCollision(p, b) {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const minDist = p.radius + b.radius;

    if (distance < minDist) {
        const overlap = minDist - distance;
        const angle = Math.atan2(dy, dx);
        
        // Empuja la bola fuera del jugador
        b.x += Math.cos(angle) * (overlap + 1);
        b.y += Math.sin(angle) * (overlap + 1);

        // Rebote suave al contacto
        b.vx = Math.cos(angle) * 2.5;
        b.vy = Math.sin(angle) * 2.5;
    }
}

// --- INTERFAZ Y RENDERIZADO ---

function handleGoal(team) {
    gameState.phase = 'GOAL';
    gameState.score[team]++;
    updateScoreboard();

    document.getElementById('status-text').innerText = team === 'blue' ? '¡GOOOL!' : '¡Gol rival!';
    document.getElementById('message-overlay').classList.remove('hidden');

    setTimeout(() => {
        document.getElementById('message-overlay').classList.add('hidden');
        checkWinner();
    }, 2000);
}

function updateScoreboard() {
    document.getElementById('score-blue').innerText = gameState.score.blue;
    document.getElementById('score-red').innerText = gameState.score.red;
}

function checkWinner() {
    let winner = null;
    if (gameState.mode === 'golden') {
        winner = gameState.score.blue > 0 ? 'Jugador' : 'Bots';
    } else if (gameState.mode === '3goals') {
        if (gameState.score.blue >= 3) winner = 'Jugador';
        if (gameState.score.red >= 3) winner = 'Bots';
    }

    if (winner) {
        gameState.phase = 'GAMEOVER';
        document.getElementById('winner-text').innerText = winner === 'Jugador' ? '¡Has ganado!' : '¡Has perdido!';
        document.getElementById('final-overlay').classList.remove('hidden');
    } else {
        startRound();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar Pelota
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    
    [player, ...bots].forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        if (p === player) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.angle) * 25, p.y + Math.sin(p.angle) * 25);
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame(mode) {
    document.getElementById('final-overlay').classList.add('hidden');
    startGame(mode);
}

function backToMenu() {
    location.reload();
}

gameLoop();