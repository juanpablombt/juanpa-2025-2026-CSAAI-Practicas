class Crono {
    constructor(display) {
        this.display = display;

        this.cent = 0,
        this.seg = 0,
        this.min = 0,
        this.timer = 0;
    }

    tic() {
        this.cent += 1;

        if (this.cent == 100) {
        this.seg += 1;
        this.cent = 0;
        }

        if (this.seg == 60) {
        this.min = 1;
        this.seg = 0;
        }

        this.display.innerHTML = this.min + ":" + this.seg + ":" + this.cent
    }

    start() {
       if (!this.timer) {
          this.timer = setInterval( () => {
              this.tic();
          }, 10);
        }
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    reset() {
        this.cent = 0;
        this.seg = 0;
        this.min = 0;

        this.display.innerHTML = "0:0:0";
    }
}

const gui = {
    display : document.getElementById("display"),
    start : document.getElementById("start"),
    stop : document.getElementById("stop"),
    reset : document.getElementById("reset"),
    digit1 : document.getElementById("digit1"),
    digit2 : document.getElementById("digit2"),
    digit3 : document.getElementById("digit3"),
    digit4 : document.getElementById("digit4"),
    attempts : document.getElementById("attempts"),
    counter : document.getElementById("counter"),
    digits : document.querySelectorAll('.digito')
}

console.log("Ejecutando JS...");

//-- Función para generar la clave secreta
function generateSecretKey() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let key = [];
    for (let i = 0; i < 4; i++) {
        let index = Math.floor(Math.random() * digits.length);
        key.push(digits.splice(index, 1)[0]);
    }
    return key;
}
let secretKey = generateSecretKey();
console.log("Clave secreta generada:", secretKey);

let intentos = 7;
let gameOver = false;
const status = document.getElementById("status");

//-- Funcion para comprobar el estado de revelación de dígitos
function allDigitsRevealed() {
    return [1,2,3,4].every(i => gui['digit'+i].innerHTML !== '*');
}

function endGameLose() {
    gameOver = true;
    crono.stop();
    status.textContent = `Partida perdida. La clave correcta es ${secretKey.join('')}.`;
    gui.digits.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('used');
    });
}

function endGameWin() {
    gameOver = true;
    crono.stop();
    status.textContent = `¡Enhorabuena! Has ganado. \n Has tardado ${gui.display.innerHTML}.\n Intentos gastado ${7 - intentos}. Intentos restantes ${intentos}.`;
    gui.digits.forEach(btn => {
        btn.disabled = true;
    });
}

//-- Definir un objeto cronómetro
const crono = new Crono(gui.display);
gui.start.onclick = () => {
    console.log("Start!!");
    crono.start();
}
gui.stop.onclick = () => {
    console.log("Stop!");
    crono.stop();
}
gui.reset.onclick = () => {
    console.log("Reset!");
    crono.reset();

    status.textContent = "";
    secretKey = generateSecretKey();
    console.log("Nueva clave secreta:", secretKey);
    intentos = 7;
    gui.attempts.innerHTML = 'Intentos restantes: 7';
    for(let i=1; i<=4; i++){
        gui['digit'+i].innerHTML = '*';
        gui['digit'+i].style.color = 'gray';
    }
    gui.digits.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('used');
    });
}

//-- Event listeners para botones dígitos
gui.digits.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!crono.timer) {
            crono.start();
        }

        intentos--;
        gui.attempts.innerHTML = 'Intentos restantes: ' + intentos;
        btn.disabled = true;
        btn.classList.add('used');

        let digit = parseInt(btn.value);
        let acertado = false;
        for(let i=0; i<4; i++){
            if(secretKey[i] === digit){
                gui['digit'+(i+1)].innerHTML = digit;
                gui['digit'+(i+1)].style.color = 'green';
                acertado = true;
            }
        }

        if (allDigitsRevealed()) {
            endGameWin();
            return;
        }
        if (intentos <= 0) {
            endGameLose();
            return;
        }

        console.log("Pulsado:", digit, "Acierto:", acertado);
    });
});