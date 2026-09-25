// ============ DinoLab — самодельная версия (JS-движение) ============
(function () {
    const dino = document.getElementById('dino');
    const cactus = document.getElementById('cactus');
    const game = document.getElementById('game');
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayText = document.getElementById('overlayText');
    const startBtn = document.getElementById('startBtn');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');

    // ---------- Состояние игры ----------
    let isRunning = false;
    let isGameOver = false;
    let score = 0;

    // Позиция кактуса в пикселях (от левого края поля)
    let cactusX = 0;

    // Скорость в пикселях за секунду
    let speed = 240;        // стартовая скорость
    const maxSpeed = 500;   // максимальная скорость
    const speedStep = 20;   // на сколько ускоряемся каждые 4 сек

    // Время последнего кадра
    let lastTime = 0;
    let rafId = null;
    let scoreTimerId = null;
    let speedTimerId = null;

    // ---------- Рекорд ----------
    let best = Number(localStorage.getItem('dinolab-custom-best') || 0);
    bestEl.textContent = best;

    // ---------- Утилиты ----------
    function setScore(v) {
        score = v;
        scoreEl.textContent = v;
    }

    function setBest(v) {
        best = v;
        localStorage.setItem('dinolab-custom-best', v);
        bestEl.textContent = v;
    }

    function getFieldWidth() {
        return game.clientWidth;
    }

    // ---------- Прыжок ----------
    function jump() {
        if (!isRunning || isGameOver) return;
        if (!dino.classList.contains('jump')) {
            dino.classList.add('jump');
            setTimeout(() => dino.classList.remove('jump'), 600);
        }
    }

    // ---------- Игровой цикл ----------
    function loop(timestamp) {
        if (!isRunning) return;

        if (!lastTime) lastTime = timestamp;
        const deltaMs = timestamp - lastTime;
        lastTime = timestamp;

        // Двигаем кактус: пиксели в секунду * секунды
        const deltaSec = deltaMs / 1000;
        cactusX -= speed * deltaSec;

        // Если кактус уехал за левый край — заворачиваем его направо
        if (cactusX < -40) {
            cactusX = getFieldWidth() + Math.random() * 200; // небольшая задержка
        }

        // Применяем позицию через transform
        cactus.style.transform = `translateX(${cactusX}px)`;

        // Проверка коллизии
        checkCollision();

        rafId = requestAnimationFrame(loop);
    }

    // ---------- Коллизия ----------
    function checkCollision() {
        if (!isRunning || isGameOver) return;

        const dinoRect = dino.getBoundingClientRect();
        const cactusRect = cactus.getBoundingClientRect();
        const pad = 4;

        const overlap =
            dinoRect.right - pad > cactusRect.left + pad &&
            dinoRect.left + pad < cactusRect.right - pad &&
            dinoRect.bottom - pad > cactusRect.top + pad;

        if (overlap) {
            gameOver();
        }
    }

    // ---------- Game Over ----------
    function gameOver() {
        if (isGameOver) return;
        isGameOver = true;
        isRunning = false;

        cancelAnimationFrame(rafId);
        clearInterval(scoreTimerId);
        clearInterval(speedTimerId);

        if (score > best) {
            setBest(score);
        }

        overlayTitle.textContent = 'GAME OVER';
        overlayText.textContent = `Счёт: ${score}. Рекорд: ${best}.`;
        startBtn.textContent = '↻ Заново';
        overlay.classList.remove('hidden');
    }

    // ---------- Старт / рестарт ----------
    function start() {
        isGameOver = false;
        isRunning = true;
        setScore(0);

        // Сброс скорости и позиции
        speed = 240;
        cactusX = getFieldWidth() + 50; // за правым краем
        cactus.style.transform = `translateX(${cactusX}px)`;

        lastTime = 0;
        rafId = requestAnimationFrame(loop);

        overlay.classList.add('hidden');

        // Счёт: +1 каждые 150 мс
        clearInterval(scoreTimerId);
        scoreTimerId = setInterval(() => {
            if (isRunning) setScore(score + 1);
        }, 150);

        // Ускорение: каждые 4 секунды
        clearInterval(speedTimerId);
        speedTimerId = setInterval(() => {
            if (!isRunning) return;
            if (speed < maxSpeed) {
                speed += speedStep;
            }
        }, 4000);
    }

    // ---------- Управление ----------
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (!isRunning) {
                start();
            } else {
                jump();
            }
        }
    });

    game.addEventListener('click', () => {
        if (!isRunning) {
            start();
        } else {
            jump();
        }
    });

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        start();
    });

    // ---------- Пауза при переключении вкладки ----------
    document.addEventListener('visibilitychange', () => {
        if (!isRunning) return;
        if (document.hidden) {
            isRunning = false;
            cancelAnimationFrame(rafId);
        } else {
            isRunning = true;
            lastTime = 0;
            rafId = requestAnimationFrame(loop);
        }
    });
})();
