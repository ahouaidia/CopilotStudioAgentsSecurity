/* ============================================================
   Copilot Studio Agents Security — Workshop
   Interactive JS: WebGL Shader, Scroll Reveal, Nav Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroShader();
  initScrollReveal();
  initNavScroll();
  initHubDiagram();
  initHubParticles();
});

/* -------------------------------------------------------
   WEBGL ENERGY SHADER — Cybersecurity plasma/lightning
   Inspired by 21st.dev Hero Odyssey fbm noise shader
------------------------------------------------------- */
function initHeroShader() {
  const canvas = document.getElementById('hero-shader');
  if (!canvas) return;

  const gl = canvas.getContext('webgl');
  if (!gl) return; // Graceful fallback — CSS glows still visible

  function resize() {
    canvas.width = canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2);
    canvas.height = canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 2);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vertSrc = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;

  // Fragment shader: fbm noise → plasma energy tendrils
  const fragSrc = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    mat2 rot(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      float a = hash12(i);
      float b = hash12(i + vec2(1.0, 0.0));
      float c = hash12(i + vec2(0.0, 1.0));
      float d = hash12(i + vec2(1.0, 1.0));
      vec2 t = smoothstep(0.0, 1.0, f);
      return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 8; i++) {
        v += a * noise(p);
        p = rot(0.45) * p * 2.0;
        a *= 0.5;
      }
      return v;
    }

    // HSV to RGB
    vec3 hsv(float h, float s, float v) {
      vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
      return v * mix(vec3(1.0), rgb, s);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      uv = 2.0 * uv - 1.0;
      uv.x *= iResolution.x / iResolution.y;

      // Soft flowing nebula — visible but not stormy
      float t = iTime * 0.18;
      float n1 = fbm(uv * 0.9 + t);
      float n2 = fbm(uv * 0.7 - t * 0.6 + 5.0);
      float n3 = fbm(uv * 1.1 + vec2(t * 0.4, -t * 0.3) + 10.0);

      // Visible but soft color channels
      vec3 purple = hsv(0.78, 0.55, 0.35) * n1;
      vec3 cyan   = hsv(0.55, 0.45, 0.22) * n2;
      vec3 gold   = hsv(0.12, 0.45, 0.14) * n3;

      vec3 col = purple + cyan + gold;

      // Vignette — fade edges to black
      float vig = 1.0 - 0.4 * length(uv * 0.65);
      col *= max(vig, 0.0);

      // Tone map
      col = col / (1.0 + col);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(vertSrc, gl.VERTEX_SHADER);
  const fs = compile(fragSrc, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'iResolution');
  const uTime = gl.getUniformLocation(prog, 'iTime');

  const t0 = performance.now();

  function render() {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  render();
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

/* -------------------------------------------------------
   HUB DIAGRAM — Attack surface toggle & node interactions
------------------------------------------------------- */
function initHubDiagram() {
  const hub = document.getElementById('agent-hub');
  const btn = document.getElementById('btn-show-attacks');
  if (!hub || !btn) return;

  let revealed = false;

  btn.addEventListener('click', () => {
    revealed = !revealed;
    hub.classList.toggle('attacks-revealed', revealed);
    btn.classList.toggle('active', revealed);
    btn.querySelector('span').textContent = revealed
      ? 'Hide Attack Surfaces'
      : 'Reveal All Attack Surfaces';
  });

  // Mobile: toggle individual nodes on click/tap
  hub.querySelectorAll('.hub-node').forEach((node) => {
    node.addEventListener('click', (e) => {
      // Only on touch/mobile — on desktop, hover handles it
      if (window.innerWidth >= 1024) return;
      e.stopPropagation();
      node.classList.toggle('mobile-active');
    });
  });

  // Close mobile-active nodes on outside click
  document.addEventListener('click', () => {
    hub.querySelectorAll('.hub-node.mobile-active').forEach((n) => {
      n.classList.remove('mobile-active');
    });
  });
}

/* -------------------------------------------------------
   HUB PARTICLES — Connected network animation background
   Ported from Oversharing-Public hero particles
------------------------------------------------------- */
function initHubParticles() {
  const container = document.getElementById('hub-particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLORS = {
    gold:      { r: 130, g: 108, b: 46 },
    blue:      { r: 18,  g: 140, b: 184 },
    turquoise: { r: 0,   g: 144, b: 134 },
    pink:      { r: 178, g: 50,  b: 100 },
  };

  const NODE_COUNT = 45;
  const CONNECTION_DIST = 160;
  const PACKET_SPEED = 0.6;
  const EDGE_MARGIN = 50;

  let width, height, dpr;
  let nodes = [];
  let packets = [];
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
    const palette = [COLORS.gold, COLORS.blue, COLORS.turquoise];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const isSecure = Math.random() < 0.12;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      baseSize: isSecure ? 3 : (Math.random() * 1.6 + 0.8),
      color: color,
      isSecure: isSecure,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function createPacket(fromNode, toNode) {
    return {
      from: fromNode,
      to: toNode,
      progress: 0,
      speed: PACKET_SPEED + Math.random() * 0.3,
      color: COLORS.blue,
    };
  }

  function drawHex(cx, cy, r, alpha, c) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.1})`;
    ctx.fill();
  }

  function drawNode(node) {
    const a = edgeAlpha(node.x, node.y);
    if (a <= 0) return;
    const pulseScale = 1 + 0.15 * Math.sin(time * 0.02 + node.pulse);
    const size = node.baseSize * pulseScale;
    const c = node.color;

    if (node.isSecure) {
      drawHex(node.x, node.y, size * 2, a, c);
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${a * 0.7})`;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${a * 0.45})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const strength = 1 - dist / CONNECTION_DIST;
          const a = Math.min(edgeAlpha(nodes[i].x, nodes[i].y), edgeAlpha(nodes[j].x, nodes[j].y)) * strength;
          if (a < 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${COLORS.gold.r}, ${COLORS.gold.g}, ${COLORS.gold.b}, ${a * 0.2})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function spawnPackets() {
    if (Math.random() > 0.025 || packets.length > 15) return;
    for (let attempt = 0; attempt < 5; attempt++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST) {
        packets.push(createPacket(a, b));
        break;
      }
    }
  }

  function updateAndDrawPackets() {
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed * 0.015;
      if (p.progress >= 1) { packets.splice(i, 1); continue; }
      const x = p.from.x + (p.to.x - p.from.x) * p.progress;
      const y = p.from.y + (p.to.y - p.from.y) * p.progress;
      const a = edgeAlpha(x, y);
      if (a <= 0) continue;
      const pa = a * (1 - Math.abs(p.progress - 0.5) * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLORS.blue.r}, ${COLORS.blue.g}, ${COLORS.blue.b}, ${pa * 0.8})`;
      ctx.fill();
    }
  }

  function updateNodes() {
    for (const node of nodes) {
      node.vx *= 0.985;
      node.vy *= 0.985;
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -20) node.x = width + 20;
      else if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      else if (node.y > height + 20) node.y = -20;
    }
  }

  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);
    updateNodes();
    drawConnections();
    for (const node of nodes) drawNode(node);
    spawnPackets();
    updateAndDrawPackets();
    animationId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, createNode);
    packets = [];
    animate();
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animationId);
      init();
    }, 200);
  });

  init();
}
