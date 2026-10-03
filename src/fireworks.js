const COLORS = ['#ffd54f', '#ffe082', '#ff8a65', '#ff5252', '#fff8e1', '#ffab40'];
const GRAVITY = 0.04;
const FRICTION = 0.985;

export function launchFireworks(canvas, durationMs = 5000) {
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  let start;
  let nextBurst;

  function burst() {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const y = window.innerHeight * (0.15 + Math.random() * 0.35);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        color,
      });
    }
  }

  return new Promise((resolve) => {
    function frame(t) {
      start ??= t;
      nextBurst ??= t;
      const elapsed = t - start;
      if (elapsed < durationMs && t >= nextBurst) {
        burst();
        nextBurst = t + 350 + Math.random() * 400;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= FRICTION;
        p.vy = p.vy * FRICTION + GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < durationMs || particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        window.removeEventListener('resize', resize);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}
