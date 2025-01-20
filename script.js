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
      updateBullets();
      drawBullets();
      checkCollisions();
      updateExplosions();
      drawExplosions();
      drawScore();
      updatePowerUps();

      requestAnimationFrame(gameLoop);
    }

    function drawPlayer() {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawAliens() {
      aliens.forEach(alien => {
        ctx.fillStyle = alienColor;
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
      });
    }

    function drawBullets() {
      ctx.fillStyle = bulletColor;
      bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
    }

    function drawAsciiExplosion(x, y, pattern, frame) {
      ctx.fillStyle = 'orange';
      ctx.font = '12px monospace';
      const lines = pattern[frame];
      if (lines) {
        ctx.fillText(lines, x, y);
      }
    }

    function drawScore() {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Score: ' + score, 10, 20);
      ctx.fillText('Level: ' + level, gameWidth - 70, 20);
      ctx.fillText('High Score: ' + highScore, gameWidth / 2 - 60, 20);
    }

    function drawPowerUps() {
      powerUps.forEach(powerUp => {
        ctx.fillStyle = 'green';
        ctx.fillRect(powerUp.x, powerUp.y, 10, 10);
      });
    }

    function updateAliens() {
      if (aliens.length === 0) {
        level++;
        alienSpeed += 0.5;
        if (level % 3 === 0) {
          burstFire = true;
        }

        if (Math.random() < 0.3) {
          powerUps.push(new PowerUp(Math.random() * gameWidth, Math.random() * gameHeight / 2));
        }

        initAliens();
        return;
      }

      aliens.forEach(alien => {
        alien.update();
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
      bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.y >= 0 && bullet.x >= 0 && bullet.x <= gameWidth;
      });
    }

    function updateExplosions() {
      explosions = explosions.filter(explosion => explosion.frame < explosion.pattern.length);
      explosions.forEach(explosion => explosion.frame++);
    }

    function updatePowerUps() {
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.update();

        if (checkCollision(player, powerUp)) {
          if (powerUp.type === 'speed') {
            player.speed *= 2;
            setTimeout(() => player.speed /= 2, 5000);
          } else if (powerUp.type === 'invincibility') {
            player.invincible = true;
            player.color = 'gold';
            setTimeout(() => {
              player.invincible = false;
              player.color = 'blue';
            }, 5000);
          }

          powerUps.splice(i, 1);
        }
      }
    }

    function checkCollision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    function checkCollisions() {
      bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
          if (checkCollision(bullet, alien)) {
            bullets.splice(bulletIndex, 1);
            aliens.splice(alienIndex, 1);
            score++;

            const patternIndex = Math.floor(Math.random() * explosionPatterns.length);
            explosions.push({ x: alien.x, y: alien.y, pattern: explosionPatterns[patternIndex], frame: 0 });
          }
        });
      });

      if (!player.invincible) {
        aliens.forEach((alien, alienIndex) => {
          if (checkCollision(player, alien)) {
            gameOver = true;
          }
        });
      }
    }

    function drawExplosions() {
      ctx.fillStyle = 'orange';
      explosions.forEach(explosion => drawAsciiExplosion(explosion.x, explosion.y, explosion.pattern, explosion.frame));
    }

    document.addEventListener('keydown', event => {
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
            bullets.push({ x: player.x + player.width / 2, y: player.y, vx: vx, vy: vy, width: 2, height: 5 });
          }
        } else {
          bullets.push({ x: player.x + player.width / 2, y: player.y, vx: 0, vy: -bulletSpeed, width: 2, height: 5 });
        }
      }
    });

    function updateHighScore(score) {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
    }

    gameLoop();
