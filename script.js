const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gameWidth = 400;
    const gameHeight = 300;
    canvas.width = gameWidth;
    canvas.height = gameHeight;

    const player = {
      x: gameWidth / 2 - 10,
      y: gameHeight - 30,
      width: 20,
      height: 10,
      speed: 5,
      color: 'blue',
      invincible: false,
    };

    let aliens = [];
    const alienRows = 3;
    const alienCols = 5;
    const alienWidth = 20;
    const alienHeight = 10;
    let alienSpeed = 1;
    let alienDirection = 1;
    const alienColor = 'red';

    let bullets = [];
    const bulletSpeed = 5;
    const bulletColor = 'yellow';

    const explosionPatterns = ["*", "**", "***", "**", "*"];
    let explosions = [];

    let powerUps = [];

    let score = 0;
    let gameOver = false;
    let level = 1;
    let highScore = localStorage.getItem('highScore') || 0;

    let burstFire = false;
    const burstBullets = 3;
    const burstAngle = 15 * Math.PI / 180;

    class Alien {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = alienWidth;
        this.height = alienHeight;
        this.type = type;
      }

      update() {
        const speed = this.type === 'fast' ? alienSpeed * 2 : alienSpeed;
        this.x += speed * alienDirection;
        this.y += (Math.random() - 0.5) * alienSpeed;
        this.x = Math.max(0, Math.min(gameWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(gameHeight - this.height, this.y));
      }
    }

    class PowerUp {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = Math.random() < 0.5 ? 'speed' : 'invincibility';
        this.width = 10;
        this.height = 10;
      }

      update() {
        this.y += 1;
      }
    }

    function initAliens() {
      aliens = [];
      for (let row = 0; row < alienRows; row++) {
        for (let col = 0; col < alienCols; col++) {
          aliens.push(new Alien(col * (alienWidth + 10) + 10, row * (alienHeight + 10) + 20, 'normal'));
        }
      }
    }

    initAliens();

    function gameLoop() {
      if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Score: ' + score, gameWidth / 2, gameHeight / 2);
        updateHighScore(score);
        return;
      }

      ctx.clearRect(0, 0, gameWidth, gameHeight);

      drawPlayer();
      drawAliens();
      drawPowerUps();
      updateAliens();
      updateBullets(); // The updateBullets function should be called before drawBullets
      drawBullets();
      checkCollisions();
      updateExplosions();
      drawExplosions();
      drawScore();
      updatePowerUps();

      requestAnimationFrame(gameLoop);
    }

    // ... (drawPlayer, drawAliens, drawBullets, drawAsciiExplosion, drawScore, drawPowerUps remain the same)

    function updateAliens() {
      // ... (This function remains the same)
    }

    function updateBullets() {
      bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.y >= 0 && bullet.x >= 0 && bullet.x <= gameWidth;
      });
    }

    function updateExplosions() {
      // ... (This function remains the same)
    }

    function updatePowerUps() {
      // ... (This function remains the same)
    }

    function checkCollision(a, b) {
      // ... (This function remains the same)
    }

    function checkCollisions() {
      // ... (This function remains the same)
    }

    function drawExplosions() {
      // ... (This function remains the same)
    }

    document.addEventListener('keydown', event => {
      // ... (This event listener remains the same)
    });

    function updateHighScore(score) {
      // ... (This function remains the same)
    }

    gameLoop();
