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
  initStatCounters();
  initDataFlowParticles();
  initConnectionTooltips();
  initDetailPanel();
  initLensToggle();
  initAttackChainSimulation();
});

/* -------------------------------------------------------
   STAT COUNTERS — Animate on scroll into view
------------------------------------------------------- */
function initStatCounters() {
  const container = document.getElementById('hub-stats');
  if (!container) return;

  const nums = container.querySelectorAll('.hub-stat-num');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        nums.forEach((el) => {
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target, 800);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* -------------------------------------------------------
   DETAIL PANEL — Click-to-expand deep-dive for each node
------------------------------------------------------- */
function initDetailPanel() {
  const panel = document.getElementById('hub-detail-panel');
  const body  = document.getElementById('hub-detail-body');
  const closeBtn = document.getElementById('hub-detail-close');
  const nodes = document.querySelectorAll('.hub-node');
  if (!panel || !body || !closeBtn) return;

  const COMPONENT_DATA = {
    topics: {
      icon: 'route', color: '#16ABE0', bgClass: 'bg-brand-blue/20',
      label: 'Conversation Layer',
      title: 'Topics',
      desc: 'Topics are modular conversation flows triggered by user phrases, keywords, or system events. Each topic is a directed graph of nodes — questions, conditions, actions, and message nodes — that define the agent\'s behavior for a specific intent.',
      attacks: [
        { name: 'Prompt injection', severity: 'critical', owasp: 'LLM01', example: 'Attacker crafts input that hijacks topic routing to trigger unintended flows.' },
        { name: 'Unsafe orchestration', severity: 'high', owasp: 'LLM06', example: 'Chained topic calls execute privileged actions without user confirmation.' },
        { name: 'System prompt leakage', severity: 'medium', owasp: 'LLM07', example: 'Crafted prompts extract topic instructions, revealing business logic.' },
      ],
      mitigations: [
        'Enable topic-level input validation and sanitization',
        'Use "Require user confirmation" nodes before sensitive actions',
        'Restrict topic chaining depth and monitor recursive calls',
      ],
    },
    tools: {
      icon: 'wrench', color: '#D93D7A', bgClass: 'bg-brand-pink/20',
      label: 'Execution Layer',
      title: 'Tools',
      desc: 'Tools include Power Platform connector actions, AI Builder models, custom HTTP endpoints, and generative answers. They give the agent the ability to read/write data and perform real-world operations at runtime.',
      attacks: [
        { name: 'Privilege escalation', severity: 'high', owasp: 'LLM06', example: 'Agent\'s service account has broader permissions than any individual user should.' },
        { name: 'Data exfiltration', severity: 'high', owasp: 'LLM02', example: 'Manipulated agent calls a connector to send sensitive data to an external endpoint.' },
        { name: 'Governance bypass', severity: 'medium', owasp: null, example: 'Unmanaged custom connectors bypass DLP policies enforced on standard connectors.' },
      ],
      mitigations: [
        'Apply least privilege to all connector service accounts',
        'Enforce DLP policies across all connector types including custom',
        'Audit and monitor all tool invocations in real-time',
      ],
    },
    knowledge: {
      icon: 'database', color: '#00B0A3', bgClass: 'bg-brand-turquoise/20',
      label: 'Data Layer',
      title: 'Knowledge Sources',
      desc: 'Knowledge sources ground the agent\'s responses in enterprise data — SharePoint, Dataverse, uploaded files, public websites, and custom data via AI Search. The agent uses RAG (Retrieval-Augmented Generation) to fetch and incorporate this context.',
      attacks: [
        { name: 'Sensitive info exposure', severity: 'critical', owasp: 'LLM02', example: 'Agent retrieves confidential HR data because SharePoint permissions are overly broad.' },
        { name: 'Indirect prompt injection', severity: 'critical', owasp: 'LLM01', example: 'Malicious instructions hidden in indexed documents get executed by the agent.' },
        { name: 'Data oversharing', severity: 'high', owasp: null, example: 'Agent summarizes content the current user wouldn\'t normally have access to view.' },
      ],
      mitigations: [
        'Enforce SharePoint/Dataverse permission trimming in search results',
        'Scan indexed content for hidden prompt injection payloads',
        'Restrict knowledge source scope to minimum required datasets',
      ],
    },
    identity: {
      icon: 'shield-check', color: '#7B5EA7', bgClass: 'bg-brand-purple/20',
      label: 'Auth Layer',
      title: 'Identity & Access',
      desc: 'Identity governs who can interact with the agent and what data/actions are accessible. This includes Entra ID authentication, OAuth connections for connectors, and the delegated permission model that determines the agent\'s runtime capabilities.',
      attacks: [
        { name: 'Token theft & replay', severity: 'high', owasp: null, example: 'Stolen OAuth tokens allow attacker to impersonate user in agent context.' },
        { name: 'Over-privileged permissions', severity: 'high', owasp: 'LLM06', example: 'Agent granted admin-level API permissions when read-only would suffice.' },
        { name: 'Auth bypass', severity: 'critical', owasp: null, example: 'Agent published without authentication allows anonymous access to internal data.' },
      ],
      mitigations: [
        'Require Entra ID authentication for all production agents',
        'Use delegated permissions over application permissions where possible',
        'Implement conditional access policies for agent endpoints',
      ],
    },
    llm: {
      icon: 'cpu', color: '#9D833E', bgClass: 'bg-brand-gold/20',
      label: 'Model Layer',
      title: 'LLM Model',
      desc: 'The underlying large language model (GPT-4o or similar) powers the agent\'s reasoning, response generation, safety filtering, and content moderation. It processes system prompts, user inputs, and retrieved context to produce outputs.',
      attacks: [
        { name: 'Jailbreak & guardrail bypass', severity: 'critical', owasp: 'LLM01', example: 'Adversarial prompts trick the model into ignoring safety instructions and content filters.' },
        { name: 'Hallucination exploitation', severity: 'high', owasp: 'LLM09', example: 'Attacker relies on model fabricating false but convincing data to mislead users.' },
        { name: 'Model poisoning', severity: 'high', owasp: 'LLM04', example: 'Compromised fine-tuning data introduces biased or malicious behavior patterns.' },
      ],
      mitigations: [
        'Use Azure AI Content Safety filters and custom blocklists',
        'Implement output validation and fact-checking against known sources',
        'Monitor for anomalous generation patterns and jailbreak attempts',
      ],
    },
  };

  function renderPanel(componentId) {
    const data = COMPONENT_DATA[componentId];
    if (!data) return;

    const attacksHtml = data.attacks.map((a) => `
      <div class="detail-attack-item">
        <span>${a.name}</span>
        <span class="detail-badge detail-badge-${a.severity}">${a.severity}</span>
      </div>
      <div style="font-size:0.62rem;color:rgba(255,255,255,0.35);padding:0 0 8px;line-height:1.5">${a.example}</div>
    `).join('');

    const mitigationsHtml = data.mitigations.map((m) => `
      <div class="detail-mitigation">
        <div class="detail-mitigation-dot"></div>
        <span>${m}</span>
      </div>
    `).join('');

    const owaspTags = data.attacks
      .filter((a) => a.owasp)
      .map((a) => a.owasp)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .map((code) => `<span class="detail-owasp">${code}</span>`)
      .join('');

    body.innerHTML = `
      <div class="detail-icon" style="background:${data.color}20">
        <i data-lucide="${data.icon}" style="width:22px;height:22px;color:${data.color}" stroke-width="2"></i>
      </div>
      <div class="detail-label" style="color:${data.color}">${data.label}</div>
      <div class="detail-title">${data.title}</div>
      <div class="detail-desc">${data.desc}</div>

      <div class="detail-section-title">Attack Vectors</div>
      ${attacksHtml}

      <div class="detail-section-title">Recommended Mitigations</div>
      ${mitigationsHtml}

      ${owaspTags ? `<div class="detail-section-title">OWASP LLM Top 10 Mapping</div><div style="display:flex;flex-wrap:wrap;gap:4px">${owaspTags}</div>` : ''}
    `;

    // Re-initialize Lucide for the new icon
    if (window.lucide) lucide.createIcons({ nodes: [body] });
  }

  function openPanel(componentId) {
    renderPanel(componentId);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  // Click on node → open panel (desktop only: ≥1024)
  nodes.forEach((node) => {
    node.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) return; // mobile uses tap-to-reveal
      e.stopPropagation();
      const id = node.dataset.component;
      if (panel.classList.contains('open') && body.dataset.current === id) {
        closePanel();
        body.dataset.current = '';
      } else {
        openPanel(id);
        body.dataset.current = id;
      }
    });
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
    body.dataset.current = '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !e.target.closest('.hub-node')) {
      closePanel();
      body.dataset.current = '';
    }
  });

  // Escape key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
      body.dataset.current = '';
    }
  });
}

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
   HUB DIAGRAM — Node tap interactions (mobile)
------------------------------------------------------- */
function initHubDiagram() {
  const hub = document.getElementById('agent-hub');
  if (!hub) return;

  // Mobile: toggle individual nodes on click/tap
  hub.querySelectorAll('.hub-node').forEach((node) => {
    node.addEventListener('click', (e) => {
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
   SECURITY LENS TOGGLE — Architecture vs Threat View
------------------------------------------------------- */
function initLensToggle() {
  const container = document.getElementById('hub-container');
  const toggle = document.getElementById('hub-lens-toggle');
  if (!container || !toggle) return;

  const btns = toggle.querySelectorAll('.hub-lens-btn');

  function setMode(mode) {
    btns.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));

    if (mode === 'threat') {
      container.classList.add('threat-mode');
      // Turn flow particles red
      if (window._flowParticles) {
        window._flowParticles.forEach((p) => {
          p.el.setAttribute('fill', '#ef4444');
        });
      }
    } else {
      container.classList.remove('threat-mode');
      // Restore original flow particle colors
      if (window._flowParticles) {
        window._flowParticles.forEach((p) => {
          p.el.setAttribute('fill', p.baseColor);
        });
      }
    }
  }

  // Expose for external use (attack chain simulation)
  window._setLensMode = setMode;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
}

/* -------------------------------------------------------
   ATTACK CHAIN SIMULATION — Scripted multi-step demo
------------------------------------------------------- */
function initAttackChainSimulation() {
  const btn = document.getElementById('btn-simulate-attack');
  const container = document.getElementById('hub-container');
  const labelsContainer = document.getElementById('hub-chain-labels');
  const progress = document.getElementById('hub-chain-progress');
  const progressFill = document.getElementById('hub-chain-progress-fill');
  const progressText = document.getElementById('hub-chain-progress-text');
  const summaryCard = document.getElementById('hub-chain-summary');
  if (!btn || !container || !labelsContainer) return;

  const CHAIN_STEPS = [
    {
      node: 'topics',
      label: '1. Prompt Injection',
      desc: 'Malicious input hijacks topic routing',
      position: { left: '50%', top: '13%' },
      delay: 0,
    },
    {
      node: null, // orchestrator
      label: '2. Orchestrator Compromised',
      desc: 'LLM processes injected instructions as legitimate',
      position: { left: '50%', top: '44%' },
      delay: 1200,
    },
    {
      node: 'tools',
      label: '3. Privilege Escalation',
      desc: 'Agent invokes connector with elevated permissions',
      position: { left: '77%', top: '34%' },
      delay: 2400,
    },
    {
      node: 'knowledge',
      label: '4. Data Exfiltration',
      desc: 'Sensitive data retrieved via oversharing RAG results',
      position: { left: '66.5%', top: '71%' },
      delay: 3600,
    },
    {
      node: 'identity',
      label: '5. Auth Context Abused',
      desc: 'Delegated token permissions exceeded intended scope',
      position: { left: '33.5%', top: '71%' },
      delay: 4800,
    },
  ];

  const TOTAL_DURATION = 6500;
  let running = false;

  function cleanup() {
    running = false;
    btn.classList.remove('running');
    labelsContainer.innerHTML = '';
    progress.classList.remove('active');
    progressFill.style.width = '0%';
    progressText.textContent = '';
    container.classList.remove('chain-mode');
    container.querySelectorAll('.chain-active').forEach((el) => el.classList.remove('chain-active'));
    container.querySelectorAll('.chain-line-active').forEach((el) => el.classList.remove('chain-line-active'));
  }

  function showSummary() {
    summaryCard.innerHTML = `
      <div class="hub-chain-summary-title">Attack Chain Complete</div>
      ${CHAIN_STEPS.map((s, i) => `
        <div class="hub-chain-summary-item">
          <div class="hub-chain-summary-step">${i + 1}</div>
          <span>${s.desc}</span>
        </div>
      `).join('')}
      <button class="hub-chain-summary-close" id="chain-summary-close">Close</button>
    `;
    summaryCard.classList.add('visible');
    document.getElementById('chain-summary-close').addEventListener('click', () => {
      summaryCard.classList.remove('visible');
      cleanup();
    });
  }

  btn.addEventListener('click', () => {
    if (running) return;
    running = true;
    btn.classList.add('running');

    // Close detail panel if open
    const panel = document.getElementById('hub-detail-panel');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    // Use chain mode (not full threat view) so nodes light up individually
    container.classList.add('chain-mode');

    // Start progress bar
    progress.classList.add('active');

    // Animate progress bar smoothly
    let startTime = performance.now();
    function tickProgress(now) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      progressFill.style.width = pct + '%';
      if (pct < 100 && running) requestAnimationFrame(tickProgress);
    }
    requestAnimationFrame(tickProgress);

    // Step through chain
    CHAIN_STEPS.forEach((step, i) => {
      setTimeout(() => {
        if (!running) return;

        // Update progress text
        progressText.textContent = step.label;

        // Highlight the node + its connection line
        if (step.node) {
          const nodeEl = container.querySelector(`.hub-node[data-component="${step.node}"]`);
          if (nodeEl) nodeEl.classList.add('chain-active');
          const line = container.querySelector(`.hub-line[data-target="${step.node}"]`);
          if (line) line.classList.add('chain-line-active');
        } else {
          const center = container.querySelector('.hub-center');
          if (center) center.classList.add('chain-active');
        }

        // Create floating label
        const label = document.createElement('div');
        label.className = 'hub-chain-label';
        label.textContent = step.label;
        label.style.left = step.position.left;
        label.style.top = step.position.top;
        label.style.transform = `translate(-50%, -100%) scale(0.7) translateY(8px)`;
        labelsContainer.appendChild(label);

        // Trigger animation
        requestAnimationFrame(() => {
          label.classList.add('visible');
          label.style.transform = 'translate(-50%, -100%) scale(1) translateY(0)';
        });

      }, step.delay);
    });

    // Show summary after chain completes
    setTimeout(() => {
      if (!running) return;
      showSummary();
    }, TOTAL_DURATION);
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

/* -------------------------------------------------------
   DATA FLOW PARTICLES — Animated dots along SVG lines
------------------------------------------------------- */
function initDataFlowParticles() {
  const svgEl = document.querySelector('.hub-lines');
  if (!svgEl) return;

  const lines = [
    { target: 'topics',    x1: 500, y1: 425, x2: 500, y2: 145, color: '#16ABE0' },
    { target: 'tools',     x1: 500, y1: 425, x2: 766, y2: 338, color: '#D93D7A' },
    { target: 'knowledge', x1: 500, y1: 425, x2: 665, y2: 655, color: '#00B0A3' },
    { target: 'identity',  x1: 500, y1: 425, x2: 335, y2: 655, color: '#7B5EA7' },
    { target: 'llm',       x1: 500, y1: 425, x2: 234, y2: 338, color: '#9D833E' },
  ];

  const PARTICLES_PER_LINE = 3;
  const particles = [];

  // Create SVG circle elements for each particle
  lines.forEach((line) => {
    for (let i = 0; i < PARTICLES_PER_LINE; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', line.color);
      circle.setAttribute('opacity', '0');
      circle.classList.add('flow-particle');
      circle.dataset.target = line.target;
      svgEl.appendChild(circle);

      particles.push({
        el: circle,
        line: line,
        progress: i / PARTICLES_PER_LINE,        // staggered start
        speed: 0.003 + Math.random() * 0.001,     // ~3-4s per traversal
        direction: i % 2 === 0 ? 1 : -1,          // bi-directional
        baseColor: line.color,
      });
    }
  });

  // Store particles globally for threat mode access
  window._flowParticles = particles;

  function animate() {
    for (const p of particles) {
      p.progress += p.speed * p.direction;

      // Wrap around
      if (p.progress > 1) p.progress -= 1;
      if (p.progress < 0) p.progress += 1;

      const t = p.progress;
      const x = p.line.x1 + (p.line.x2 - p.line.x1) * t;
      const y = p.line.y1 + (p.line.y2 - p.line.y1) * t;

      // Fade in/out near endpoints
      const edgeFade = Math.min(t, 1 - t) * 4;
      const opacity = Math.min(edgeFade, 0.7);

      p.el.setAttribute('cx', x);
      p.el.setAttribute('cy', y);
      p.el.setAttribute('opacity', opacity);
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------
   CONNECTION TOOLTIPS — Hover on SVG line hit areas
------------------------------------------------------- */
function initConnectionTooltips() {
  const hubContainer = document.getElementById('hub-container');
  const tooltip = document.getElementById('hub-line-tooltip');
  const hits = document.querySelectorAll('.hub-line-hit');
  if (!hubContainer || !tooltip || !hits.length) return;

  hits.forEach((hit) => {
    hit.addEventListener('mouseenter', (e) => {
      const text = hit.dataset.tooltip;
      if (!text) return;
      tooltip.textContent = text;
      tooltip.classList.add('visible');

      // Highlight the corresponding real line
      const target = hit.dataset.target;
      const realLine = document.querySelector(`.hub-line[data-target="${target}"]`);
      if (realLine) {
        realLine.style.strokeWidth = '3';
        realLine.style.filter = 'drop-shadow(0 0 6px rgba(157, 131, 62, 0.4))';
      }
    });

    hit.addEventListener('mousemove', (e) => {
      const rect = hubContainer.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 10;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    });

    hit.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
      const target = hit.dataset.target;
      const realLine = document.querySelector(`.hub-line[data-target="${target}"]`);
      if (realLine) {
        realLine.style.strokeWidth = '';
        realLine.style.filter = '';
      }
    });
  });
}
