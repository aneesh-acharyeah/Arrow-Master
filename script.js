(() => {
  // Get elements
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const shootButton = document.getElementById('shootButton');
  const scoreDisplay = document.getElementById('score');
  const windDisplay = document.getElementById('wind');

  // Resize canvas responsively
  function resize() {
    const maxWidth = 900;
    const w = Math.min(window.innerWidth - 40, maxWidth);
    const h = w * 0.75;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener('resize', resize);
  resize();

  // Game state
  let score = 0;
  let windSpeed = Math.floor(Math.random() * 21) - 10; // -10 to +10 km/h
  windDisplay.textContent = windSpeed;

  // Arrow
  const arrow = {
    x: 100,
    y: canvas.height - 50,
    width: 5,
    height: 20,
    angle: 45,
    isShooting: false,
    velocityX: 0,
    velocityY: 0,
  };

  // Target
  const target = {
    x: canvas.width - 150,
    y: canvas.height - 100,
    radius: 50,
  };

  // Gravity and physics
  const gravity = 0.2;

  // Update wind every 3 seconds
  setInterval(() => {
    windSpeed = Math.floor(Math.random() * 21) - 10;
    windDisplay.textContent = windSpeed;
  }, 3000);

  // Input: Change angle with keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && arrow.angle < 90) {
      arrow.angle += 5;
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && arrow.angle > 0) {
      arrow.angle -= 5;
      e.preventDefault();
    }
  });

  // Shoot arrow
  function shootArrow() {
    if (!arrow.isShooting) {
      arrow.isShooting = true;
      const angleRad = (arrow.angle * Math.PI) / 180;
      arrow.velocityX = Math.cos(angleRad) * 12;
      arrow.velocityY = -Math.sin(angleRad) * 12;
    }
  }

  shootButton.addEventListener('click', shootArrow);

  // Reset arrow after miss or hit
  function resetArrow() {
    arrow.x = 100;
    arrow.y = canvas.height - 50;
    arrow.isShooting = false;
    arrow.velocityX = 0;
    arrow.velocityY = 0;
  }

  // Draw arrow with rotation
  function drawArrow() {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate((Math.PI / 180) * arrow.angle);
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-arrow.width / 2, -arrow.height / 2, arrow.width, arrow.height);
    // Feather tip
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(-arrow.width / 2, -arrow.height / 2 - 8, arrow.width, 6);
    ctx.restore();
  }

  // Draw target with rings
  function drawTarget() {
    const { x, y, radius } = target;

    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ccc';
    ctx.fill();
    ctx.stroke();

    // Middle ring
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.66, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9800';
    ctx.fill();

    // Inner ring (bullseye)
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.33, 0, Math.PI * 2);
    ctx.fillStyle = '#f44336';
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // Check collision and scoring
  function checkHit() {
    const dx = arrow.x - target.x;
    const dy = arrow.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < target.radius) {
      let points = 0;
      if (distance < target.radius * 0.33) {
        points = 50; // Bullseye!
      } else if (distance < target.radius * 0.66) {
        points = 20;
      } else {
        points = 10;
      }
      score += points;
      scoreDisplay.textContent = score;
      showFeedback(`+${points}!`, target.x, target.y - 40);
      resetArrow();
      return true;
    }
    return false;
  }

  // Visual feedback text (floating + fade)
  const feedbacks = [];
  function showFeedback(text, x, y) {
    feedbacks.push({ text, x, y, life: 60 });
  }

  function updateFeedback() {
    for (let i = feedbacks.length - 1; i >= 0; i--) {
      const f = feedbacks[i];
      f.y -= 1;
      f.life--;
      if (f.life <= 0) feedbacks.splice(i, 1);
    }
  }

  function drawFeedback() {
    feedbacks.forEach(f => {
      const alpha = f.life / 60;
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.textAlign = 'left';
  }

  // Main update function
  function updateArrow() {
    if (arrow.isShooting) {
      arrow.x += arrow.velocityX;
      arrow.y += arrow.velocityY;

      // Apply gravity
      arrow.velocityY += gravity;

      // Apply wind effect (horizontal only)
      arrow.velocityX += windSpeed * 0.01;

      // Check hit
      if (checkHit()) return;

      // Reset if out of bounds
      if (
        arrow.x < -20 ||
        arrow.x > canvas.width + 20 ||
        arrow.y > canvas.height + 20
      ) {
        resetArrow();
      }
    }
  }

  // Render loop
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#87CEEB');
    bg.addColorStop(1, '#E0E0E0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw game objects
    drawTarget();
    drawArrow();
    updateFeedback();
    drawFeedback();

    // Update physics
    updateArrow();
  }

  // Game loop
  function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
  }

  // Start the game
  gameLoop();
})();
