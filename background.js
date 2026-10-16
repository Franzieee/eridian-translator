
(() => {
  const canvas = document.getElementById("astrophageCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame;
  let lastFrame = 0;

  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  const PARTICLE_COUNT = 2000;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from(
      { length: PARTICLE_COUNT },
      () => createParticle(true)
    );

    mouse.x = mouse.targetX = width / 2;
    mouse.y = mouse.targetY = height / 2;

    draw(0);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle(randomPosition = false) {
    return {
      x: randomPosition ? random(0, width) : random(-20, width + 20),
      y: randomPosition ? random(0, height) : random(-20, height + 20),
      radius: random(0.5, 2.2),
      alpha: random(0.2, 0.85),
      speed: random(0.08, 0.38),
      drift: random(-0.16, 0.16),
      phase: random(0, Math.PI * 2),
      red: Math.random() > 0.72 ? 255 : Math.round(random(100, 210))
    };
  }

  function drawParticle(particle, time) {
    const parallaxX = (mouse.x - width / 2) * particle.speed * 0.5;
    const parallaxY = (mouse.y - height / 2) * particle.speed * 0.5;

    const x = particle.x + parallaxX;
    const y = particle.y + parallaxY;

    const pulse = reducedMotion.matches
      ? 0.65
      : 0.72 + Math.sin(time * 0.0008 + particle.phase) * 0.28;

    const alpha = Math.max(0.08, particle.alpha * pulse);

    // Soft red halo around each particle.
    const glowRadius = particle.radius * 7;
    const glow = ctx.createRadialGradient(
      x, y, 0,
      x, y, glowRadius
    );

    glow.addColorStop(0, `rgba(255, 35, 45, ${alpha * 0.32})`);
    glow.addColorStop(1, "rgba(255, 15, 30, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bright Astrophage-like core.
    ctx.fillStyle = `rgba(255, ${particle.red > 220 ? 105 : 35}, 45, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // Dark space base.
    ctx.fillStyle = "#090204";
    ctx.fillRect(0, 0, width, height);

    // Deep crimson nebulae.
    const centerX = width * 0.5 - (mouse.x - width / 2) * 0.035;
    const centerY = height * 0.42 - (mouse.y - height / 2) * 0.035;
    const radius = Math.max(width, height) * 0.72;

    const nebula = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );

    nebula.addColorStop(0, "rgba(130, 0, 18, 0.42)");
    nebula.addColorStop(0.42, "rgba(75, 0, 12, 0.24)");
    nebula.addColorStop(1, "rgba(8, 0, 3, 0)");

    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);

    // A second haze gives the background more depth.
    const haze = ctx.createRadialGradient(
      width * 0.12 + (mouse.x - width / 2) * 0.025,
      height * 0.85 + (mouse.y - height / 2) * 0.025,
      0,
      width * 0.12,
      height * 0.85,
      Math.max(width, height) * 0.55
    );

    haze.addColorStop(0, "rgba(95, 0, 18, 0.22)");
    haze.addColorStop(1, "rgba(5, 0, 2, 0)");

    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);

    for (const particle of particles) {
      drawParticle(particle, time);

      if (!reducedMotion.matches) {
        particle.x += particle.drift;
        particle.y -= particle.speed * 0.18;

        if (particle.x < -25) particle.x = width + 25;
        if (particle.x > width + 25) particle.x = -25;
        if (particle.y < -25) particle.y = height + 25;
      }
    }
  }

  function animate(time) {
    if (reducedMotion.matches) {
      draw(0);
      animationFrame = null;
      return;
    }

    // Cap rendering at about 30 frames per second.
    if (time - lastFrame >= 1000 / 30) {
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      draw(time);
      lastFrame = time;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", event => {
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY;
  }, { passive: true });

  window.addEventListener("resize", resize);

  reducedMotion.addEventListener?.("change", () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (reducedMotion.matches) {
      draw(0);
    } else {
      lastFrame = 0;
      animationFrame = requestAnimationFrame(animate);
    }
  });

  resize();

  if (!reducedMotion.matches) {
    animationFrame = requestAnimationFrame(animate);
  }
})();
