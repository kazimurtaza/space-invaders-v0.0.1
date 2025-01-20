const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gameWidth = 400;
    const gameHeight = 300;
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    // Player
    const player = {
      x: gameWidth / 2 - 10,
      y: gameHeight - 30,
      width: 20,
      height: 10,
      speed: 5,
      color: 'blue',
    };
    // Aliens
    let aliens = [];
    const alienRows = 3;
    const alienCols = 5;
    const alienWidth = 20;
    const alienHeight = 10;
    let alienSpeed = 1;
    let alienDirection = 1;
    const alienColor = 'red';
    // Bullets
    const bullets = [];
    const bulletSpeed = 5;
    const bulletColor = 'yellow';
    // Explosions
    const explosionPatterns = [
      "*", "**", "***", "**", "*",
    ];
    let explosions = [];
    // Game state
    let score = 0;
    let gameOver = false;
    let level = 1;
    // Burst fire variables
    let burstFire = false;
    const burstBullets = 3;
    const burstAngle = 15 * Math.PI / 180;
    // Initialize aliens
    function initAliens() {
      aliens = [];
      for (let row = 0; row < alienRows; row++) {
        for (let col = 0; col < alienCols; col++) {
          aliens.push({
            x: col * (alienWidth + 10) + 10,
            y: row * (alienHeight + 10) + 20,
            width: alienWidth,
            height: alienHeight,
          });
        }
      }
    }
    // Initialize game
    initAliens();
    // Game loop
    function gameLoop() {
      if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Score: ' + score, gameWidth / 2, gameHeight / 2);
        return;
      }
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      drawPlayer();
      drawAliens();
      updateAliens();
      drawBullets();
      updateBullets();
      checkCollisions();
      updateExplosions();
      drawExplosions();
      drawScore();
      requestAnimationFrame(gameLoop);
    }
    // Draw functions
    function drawPlayer() {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    function drawAliens() {
      ctx.fillStyle = alienColor;
      aliens.forEach(alien => ctx.fillRect(alien.x, alien.y, alien.width, alien.height));
    }
    function drawBullets() {
      ctx.fillStyle = bulletColor;
      bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, 2, 5));
    }
    function drawAsciiExplosion(x, y, pattern, frame) {
      ctx.fillStyle = 'orange';
      ctx.font = '12px monospace';
      const lines = pattern[frame];
      if (lines) {
        const lineHeight = 12;
        ctx.fillText(lines, x, y);
      }
    }
    function drawScore() {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Score: ' + score, 10, 20);
      ctx.fillText('Level: ' + level, gameWidth - 70, 20);
    }
    // Update functions
    function updateAliens() {
      if (aliens.length === 0) {
        level++;
        alienSpeed += 0.5;
        if (level % 3 === 0) {
          burstFire = true;
        }
        initAliens();
        return;
      }
      aliens.forEach(alien => {
        alien.x += alienSpeed * alienDirection;
      });
      if (aliens[0].x <= 0 || aliens[aliens.length - 1].x + alienWidth >= gameWidth) {
        alienDirection *= -1;
        aliens.forEach(alien => alien.y += 10);
      }
      if (aliens[0].y + alienHeight > player.y) {
        gameOver = true;
      }
    }
    function updateBullets() {
      bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > gameWidth) {
          bullets.splice(index, 1);
        }
      });
    }
    function updateExplosions() {
      explosions = explosions.filter(explosion => explosion.frame < explosion.pattern.length);
      explosions.forEach(explosion => explosion.frame++);
    }
    // Collision detection
    function checkCollisions() {
      bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
          if (
            bullet.x < alien.x + alien.width &&
            bullet.x + 2 > alien.x &&
            bullet.y < alien.y + alien.height &&
            bullet.y + 5 > alien.y
          ) {
            bullets.splice(bulletIndex, 1);
            aliens.splice(alienIndex, 1);
            score++;
            const patternIndex = Math.floor(Math.random() * explosionPatterns.length);
            explosions.push({ x: alien.x, y: alien.y, pattern: explosionPatterns[patternIndex], frame: 0 });
          }
        });
      });
    }
    // Draw explosions
    function drawExplosions() {
      ctx.fillStyle = 'orange';
      explosions.forEach(explosion => drawAsciiExplosion(explosion.x, explosion.y, explosion.pattern, explosion.frame));
    }
    // Event listeners
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' && player.x > 0) {
        player.x -= player.speed;
      } else if (event.key === 'ArrowRight' && player.x < gameWidth - player.width) {
        player.x += player.speed;
      } else if (event.key === ' ') {
        if (burstFire) {
          for (let i = 0; i < burstBullets; i++) {
            const angle = -burstAngle / 2 + i * burstAngle / (burstBullets - 1);
            const vx = Math.sin(angle) * bulletSpeed;
            const vy = -Math.cos(angle) * bulletSpeed;
            bullets.push({
              x: player.x + player.width / 2,
              y: player.y,
              vx: vx,
              vy: vy,
            });
          }
        } else {
          bullets.push({
            x: player.x + player.width / 2,
            y: player.y,
            vx: 0,
            vy: -bulletSpeed,
          });
        }
      }
    });
    gameLoop();