/**
 * Lightweight, zero-dependency celebration and micro-rewards engine
 * Uses pure HTML5 Canvas particle physics for high-FPS, zero-bundle-bloat confetti
 */

export const triggerConfetti = (originY = 0.4) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6', '#8b5cf6'];
  const particleCount = 70;
  const particles = [];

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * originY;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * Math.PI) - (Math.PI / 2); // Spread upwards
    const speed = 7 + Math.random() * 9;
    particles.push({
      x: startX + (Math.random() * 80 - 40),
      y: startY,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(Math.random() * Math.PI) * speed - 3,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      alpha: 1,
      decay: 0.015 + Math.random() * 0.015,
      shape: Math.random() > 0.3 ? 'rect' : 'circle'
    });
  }

  let animationFrameId;
  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeParticles = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Air resistance
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        activeParticles++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        }

        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
    }
  };

  animationFrameId = requestAnimationFrame(render);

  // Safety cleanup after 3.5s in case tab loses focus
  setTimeout(() => {
    if (canvas.parentNode) {
      cancelAnimationFrame(animationFrameId);
      document.body.removeChild(canvas);
    }
  }, 3500);
};

/**
 * Check if daily habit 100% completion celebration should trigger
 */
export const checkAndCelebrateHabits = (todayStr, isAllDone) => {
  if (!isAllDone || !todayStr) return false;
  const key = `pulse_celebrated_habits_${todayStr}`;
  if (localStorage.getItem(key)) return false;

  localStorage.setItem(key, 'true');
  triggerConfetti(0.4);
  return true;
};

/**
 * Check if all priority tasks cleared celebration should trigger
 */
export const checkAndCelebrateTasks = (todayStr, isAllDone) => {
  if (!isAllDone || !todayStr) return false;
  const key = `pulse_celebrated_tasks_${todayStr}`;
  if (localStorage.getItem(key)) return false;

  localStorage.setItem(key, 'true');
  triggerConfetti(0.5);
  return true;
};
