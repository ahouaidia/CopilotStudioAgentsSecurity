/* ============================================================
   Copilot Studio Agents Security — Workshop
   Interactive JS: Particles, Scroll Reveal, Nav Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollReveal();
  initNavScroll();
});

/* -------------------------------------------------------
   DATA FLOW NETWORK — Canvas-based security mesh
------------------------------------------------------- */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLORS = {
    gold:      { r: 130, g: 108, b: 46  },
    blue:      { r: 18,  g: 140, b: 184  },
    turquoise: { r: 0,   g: 144, b: 134  },
    purple:    { r: 123, g: 94,  b: 167  },
  };

  const NODE_COUNT = 50;
  const CONNECTION_DIST = 170;
  const EDGE_MARGIN = 60;

  let width, height, dpr;
  let nodes = [];
  let animationId;
  let time = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.offsetWidth;
    height = container.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function edgeAlpha(x, y) {
    let a = 1;
    if (x < EDGE_MARGIN) a *= x / EDGE_MARGIN;
    else if (x > width - EDGE_MARGIN) a *= (width - x) / EDGE_MARGIN;
    if (y < EDGE_MARGIN) a *= y / EDGE_MARGIN;
    else if (y > height - EDGE_MARGIN) a *= (height - y) / EDGE_MARGIN;
    return Math.max(0, a);
  }

  function createNode() {
    const palette = [COLORS.gold, COLORS.blue, COLORS.turquoise, COLORS.purple];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const isShield = Math.random() < 0.1;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      baseSize: isShield ? 3.2 : (Math.random() * 1.8 + 1),
      color,
      isShield,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function drawHex(cx, cy, r, alpha, color) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha * 0.25})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animate() {
    time += 0.005;
    ctx.clearRect(0, 0, width, height);

    // Update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12 *
            edgeAlpha(nodes[i].x, nodes[i].y) *
            edgeAlpha(nodes[j].x, nodes[j].y);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(130,108,46,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const ea = edgeAlpha(n.x, n.y);
      const pulse = 1 + 0.25 * Math.sin(time * 3 + n.pulse);
      const size = n.baseSize * pulse;
      const alpha = ea * 0.6;

      if (n.isShield) {
        drawHex(n.x, n.y, size * 2.5, ea, n.color);
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color.r},${n.color.g},${n.color.b},${alpha})`;
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, createNode);
    animate();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    resize();
    nodes = Array.from({ length: NODE_COUNT }, createNode);
    animate();
  });

  init();
}

/* -------------------------------------------------------
   SCROLL REVEAL — IntersectionObserver-based
------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------
   NAV SCROLL — Switch nav style on scroll
------------------------------------------------------- */
function initNavScroll() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  });
}
