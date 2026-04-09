const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const energyBar = document.getElementById("energy-bar");
const messageEl = document.getElementById("message");

canvas.width = 800;
canvas.height = 600;

let score = 0;
let lives = 3;
let energy = 100;
let gameOver = false;

// Sonidos
const shootSound = new Audio('juanpa-2025-2026-CSAAI-Practicas/P3/Practica3/chakong-laser-gun-shot-sound-future-sci-fi-lazer-wobble-chakongaudio-174883.mp3');
const explosionSound = new Audio('juanpa-2025-2026-CSAAI-Practicas/P3/Practica3/chakong-gunshot-sfx-foley-impact-shot-gun-xploson-sound-chakongaudio-182540.mp3');

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    w: 50,
    h: 30,
    speed: 7,
    dx: 0
};

let bullets = [];
let enemyBullets = [];
let enemies = [];
const enemyRows = 3;
const enemyCols = 8;
let enemyDirection = 1;
let enemySpeed = 1;

// Inicializar enemigos
for (let r = 0; r < enemyRows; r++) {
    for (let c = 0; c < enemyCols; c++) {
        enemies.push({
            x: 100 + c * 60,
            y: 50 + r * 50,
            w: 40,
            h: 30,
            status: 1,
            timer: 0
        });
    }
}

// Controles
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
    if (e.key === " " && energy >= 20) firePlayer();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

function firePlayer() {
    bullets.push({ x: player.x + player.w/2 - 2, y: player.y, w: 4, h: 10, speed: 8 });
    energy -= 20;
    shootSound.play();
}

function update() {
    if (gameOver) return;

    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    if (energy < 100) energy += 0.4;
    energyBar.value = energy;

    bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    enemyBullets.forEach((eb, i) => {
        eb.y += eb.speed;
        if (eb.y > canvas.height) enemyBullets.splice(i, 1);

        if (eb.x < player.x + player.w && eb.x + eb.w > player.x && eb.y < player.y + player.h && eb.y + eb.h > player.y) {
            enemyBullets.splice(i, 1);
            lives--;
            livesEl.innerText = lives;
            if (lives <= 0) endGame("GAME OVER - LA HUMANIDAD HA CAÍDO");
        }
    });

    let touchWall = false;
    enemies.forEach(en => {
        if (en.status === 1) {
            en.x += enemySpeed * enemyDirection;
            if (en.x + en.w > canvas.width || en.x < 0) touchWall = true;
        }
    });

    if (touchWall) {
        enemyDirection *= -1;
        enemies.forEach(en => en.y += 20);
    }

    bullets.forEach((b, bi) => {
        enemies.forEach((en) => {
            if (en.status === 1 && b.x < en.x + en.w && b.x + b.w > en.x && b.y < en.y + en.h && b.y + b.h > en.y) {
                en.status = 0;
                en.timer = 15;
                bullets.splice(bi, 1);
                score += 10;
                scoreEl.innerText = score;
                explosionSound.play();
                
                // Aumentar velocidad
                enemySpeed += 0.15;
            }
        });
    });

    if (Math.random() < 0.02) {
        const aliveEnemies = enemies.filter(e => e.status === 1);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({ x: shooter.x + shooter.w/2, y: shooter.y + shooter.h, w: 4, h: 10, speed: 4 });
        } else {
            endGame("¡VICTORIA! CANVA CENTAURI ESTÁ A SALVO");
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00fbff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    enemies.forEach(en => {
        if (en.status === 1) {
            ctx.fillStyle = "#ff004c";
            ctx.fillRect(en.x, en.y, en.w, en.h);
        } else if (en.timer > 0) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(en.x + en.w/2, en.y + en.h/2, 15, 0, Math.PI*2);
            ctx.fill();
            en.timer--;
        }
    });

    // Dibujar Balas
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.fillStyle = "red";
    enemyBullets.forEach(eb => ctx.fillRect(eb.x, eb.y, eb.w, eb.h));

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

function endGame(txt) {
    gameOver = true;
    messageEl.innerText = txt;
    messageEl.classList.remove("hidden");
}

draw();