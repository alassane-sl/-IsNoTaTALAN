document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let fontSize = Math.max(25, Math.floor(window.innerWidth / 120));
  let columns = 0;
  let drops = [];
  let rainSpeed = parseFloat(localStorage.getItem('matrixSpeed')) || 1.5;

  // Canvas sizing
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    fontSize = Math.max(25, Math.floor(window.innerWidth / 120));
    ctx.font = fontSize + 'px monospace';
    columns = Math.floor(width / fontSize) + 1;
    drops = new Array(columns).fill(1);
  }

  // Animation
  function drawMatrix() {
    ctx.fillStyle = '#0008050f';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff78e6';
    ctx.textBaseline = 'top';

    for (let i = 0; i < columns; i++) {
      const text = Math.random() < 0.5 ? '0' : '1';
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.985) {
        drops[i] = 0;
      }

      drops[i] += rainSpeed;
    }

    requestAnimationFrame(drawMatrix);
  }

  // Init
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(drawMatrix);
});
