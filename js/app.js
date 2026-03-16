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
  initRiskList();
  initSpectrum();
  initPlaybook();
  initDataFlow();
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

  // Click on node → open panel (desktop only: ≥1024, not during simulation)
  nodes.forEach((node) => {
    node.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) return; // mobile uses tap-to-reveal
      // Block detail panel during attack chain simulation
      const hubContainer = document.getElementById('hub-container');
      if (hubContainer && hubContainer.classList.contains('chain-mode')) return;
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
  const scenarioPanel = document.getElementById('hub-scenario-panel');
  const scenarioCloseBtn = document.getElementById('hub-scenario-close');
  const scenarioSteps = document.querySelectorAll('.hub-scenario-step');
  if (!btn || !container || !labelsContainer) return;

  // Close button on scenario panel — stops simulation, resets everything, returns to Architecture view
  if (scenarioCloseBtn) {
    scenarioCloseBtn.addEventListener('click', () => {
      running = false;
      cleanup();
      closeScenarioPanel();
      btn.classList.remove('running');
      btn.querySelector('span').textContent = 'Simulate Attack';
      // Switch back to Architecture view
      if (window._setLensMode) window._setLensMode('architecture');
    });
  }

  // ── Realistic scenario: Malicious instruction injection in event-triggered workflow
  // Reference: Microsoft Security Blog — Runtime Risk, Real-Time Defense (Jan 2026)
  const CHAIN_STEPS = [
    {
      node: 'topics',
      line: 'topics',
      label: '1. Poisoned Email',
      desc: 'Attacker sends crafted invoice email to invoice@contoso.com with hidden instructions',
      position: { left: '50%', top: '13%' },
      delay: 0,
    },
    {
      node: null, // orchestrator
      line: null,
      label: '2. Plan Hijacked',
      desc: 'Generative orchestrator interprets injected instructions as legitimate task steps',
      position: { left: '50%', top: '44%' },
      delay: 1500,
    },
    {
      node: 'knowledge',
      line: 'knowledge',
      label: '3. Sensitive Data Queried',
      desc: 'Knowledge base searched for confidential finance records per attacker instructions',
      position: { left: '66.5%', top: '71%' },
      delay: 3000,
    },
    {
      node: null, // orchestrator again
      line: null,
      label: '4. Exfil Planned',
      desc: 'Orchestrator chains knowledge results into outbound email action',
      position: { left: '50%', top: '44%' },
      delay: 4500,
    },
    {
      node: 'tools',
      line: 'tools',
      label: '5. Data Exfiltrated',
      desc: 'Email tool sends sensitive data to attacker@evil.com',
      position: { left: '77%', top: '34%' },
      delay: 6000,
    },
  ];

  const TOTAL_DURATION = 8000;
  let running = false;

  function cleanup() {
    running = false;
    btn.classList.remove('running');
    btn.querySelector('span').textContent = 'Simulate Attack';
    labelsContainer.innerHTML = '';
    progress.classList.remove('active');
    progressFill.style.width = '0%';
    progressText.textContent = '';
    container.classList.remove('chain-mode');
    container.querySelectorAll('.chain-active').forEach((el) => el.classList.remove('chain-active'));
    container.querySelectorAll('.chain-line-active').forEach((el) => el.classList.remove('chain-line-active'));
    // Reset scenario step highlights
    scenarioSteps.forEach((s) => {
      s.classList.remove('step-active', 'step-done');
    });
  }

  function closeScenarioPanel() {
    if (scenarioPanel) {
      scenarioPanel.classList.remove('open');
      scenarioPanel.setAttribute('aria-hidden', 'true');
    }
  }

  function openScenarioPanel() {
    if (scenarioPanel) {
      scenarioPanel.classList.add('open');
      scenarioPanel.setAttribute('aria-hidden', 'false');
      if (window.lucide) lucide.createIcons({ nodes: [scenarioPanel] });
    }
  }

  function highlightScenarioStep(stepIndex) {
    scenarioSteps.forEach((s, i) => {
      if (i < stepIndex) {
        s.classList.remove('step-active');
        s.classList.add('step-done');
      } else if (i === stepIndex) {
        s.classList.add('step-active');
        s.classList.remove('step-done');
      } else {
        s.classList.remove('step-active', 'step-done');
      }
    });
  }

  function showSummary() {
    summaryCard.innerHTML = `
      <div class="hub-chain-summary-title">Attack Chain Complete</div>
      <div style="font-size:0.62rem;color:rgba(255,255,255,0.4);margin-bottom:12px;line-height:1.5">
        Without runtime protection, the attacker exfiltrated sensitive finance data
        using only a crafted email — no credential theft required.
      </div>
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
      closeScenarioPanel();
      cleanup();
    });
  }

  btn.addEventListener('click', () => {
    // Handle "Reset" state (simulation finished but not cleaned up)
    if (!running && btn.querySelector('span').textContent === 'Reset') {
      cleanup();
      closeScenarioPanel();
      if (window._setLensMode) window._setLensMode('architecture');
      return;
    }
    if (running) {
      // Allow stopping mid-simulation
      running = false;
      summaryCard.classList.remove('visible');
      closeScenarioPanel();
      cleanup();
      if (window._setLensMode) window._setLensMode('architecture');
      return;
    }
    running = true;
    btn.classList.add('running');
    btn.querySelector('span').textContent = 'Stop Simulation';

    // Close detail panel if open
    const panel = document.getElementById('hub-detail-panel');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    // Open scenario panel
    openScenarioPanel();

    // Use chain mode (nodes light up individually)
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

        // Highlight scenario panel step
        highlightScenarioStep(i);

        // Highlight the node + its connection line
        if (step.node) {
          const nodeEl = container.querySelector(`.hub-node[data-component="${step.node}"]`);
          if (nodeEl) nodeEl.classList.add('chain-active');
          if (step.line) {
            const line = container.querySelector(`.hub-line[data-target="${step.line}"]`);
            if (line) line.classList.add('chain-line-active');
          }
        } else {
          const center = container.querySelector('.hub-center');
          if (center) center.classList.add('chain-active');
        }

        // Create floating label
        const label = document.createElement('div');
        label.className = 'hub-chain-label';
        if (step.isRootCause) label.classList.add('root-cause');
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

    // Finish simulation after chain completes
    setTimeout(() => {
      if (!running) return;
      // Mark all scenario steps as done
      scenarioSteps.forEach((s) => {
        s.classList.remove('step-active');
        s.classList.add('step-done');
      });
      // Reset button so user can stop/reset
      btn.classList.remove('running');
      btn.querySelector('span').textContent = 'Reset';
      running = false;
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

/* -------------------------------------------------------
   TOP 10 RISKS — Accordion expand/collapse
------------------------------------------------------- */
function initRiskList() {
  const items = document.querySelectorAll('.risk-item');
  if (!items.length) return;

  items.forEach((item) => {
    const header = item.querySelector('.risk-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      items.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.risk-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Staggered reveal animation
  const riskObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Array.from(items).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('risk-visible');
        }, idx * 80);
        riskObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  items.forEach((item) => riskObserver.observe(item));

  // Re-init Lucide icons for risk section
  if (window.lucide) lucide.createIcons();
}

/* -------------------------------------------------------
   SPECTRUM — Scroll-triggered animation
------------------------------------------------------- */
function initSpectrum() {
  const container = document.querySelector('.spectrum-container');
  if (!container) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        container.classList.add('spectrum-animated');
        startThreatCycle();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(container);
}

function startThreatCycle() {
  const threats = document.querySelectorAll('.spectrum-threat');
  if (!threats.length) return;

  // Fixed positions spread across the bar (% of container width)
  const positions = [
    { left: '2%' },
    { left: '25%' },
    { left: '48%' },
    { left: '68%' }
  ];

  // Stagger offsets so labels overlap in time
  const VISIBLE_DURATION = 2200;
  const STAGGER = 900;
  const FADE_OUT = 600;

  function animateOne(idx) {
    const el = threats[idx];
    const pos = positions[idx];

    // Position
    el.style.left = pos.left;

    // Fade in
    el.classList.remove('threat-out');
    el.classList.add('threat-in');

    // Fade out after visible duration
    setTimeout(() => {
      el.classList.remove('threat-in');
      el.classList.add('threat-out');
    }, VISIBLE_DURATION);
  }

  function runWave() {
    threats.forEach((t, i) => {
      setTimeout(() => animateOne(i), i * STAGGER);
    });
  }

  // Full cycle = last stagger + visible + fade out + pause
  const CYCLE = (threats.length - 1) * STAGGER + VISIBLE_DURATION + FADE_OUT + 600;

  // Start after bar animation
  setTimeout(() => {
    runWave();
    setInterval(runWave, CYCLE);
  }, 1200);
}

/* -------------------------------------------------------
   PLAYBOOK — Flip cards + staggered reveal
------------------------------------------------------- */
function initPlaybook() {
  const cards = document.querySelectorAll('.playbook-card-wrapper');
  if (!cards.length) return;

  // Click to expand/collapse detail panel
  cards.forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('is-open');

      // Close all others
      cards.forEach((other) => {
        if (other !== wrapper) other.classList.remove('is-open');
      });

      // Toggle current
      wrapper.classList.toggle('is-open', !isOpen);

      // Sync reveal-all button state
      if (revealBtn) {
        const label = revealBtn.querySelector('span');
        const allOpen = Array.from(cards).every(c => c.classList.contains('is-open'));
        revealBtn.classList.toggle('is-active', allOpen);
        if (label) label.textContent = allOpen ? 'Collapse All' : 'Reveal All';
      }
    });
  });

  // Reveal-all button
  const revealBtn = document.getElementById('playbook-reveal-all');
  if (revealBtn) {
    revealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const allOpen = Array.from(cards).every(c => c.classList.contains('is-open'));
      const label = revealBtn.querySelector('span');

      if (allOpen) {
        cards.forEach(c => c.classList.remove('is-open'));
        revealBtn.classList.remove('is-active');
        if (label) label.textContent = 'Reveal All';
      } else {
        cards.forEach((c, i) => {
          setTimeout(() => c.classList.add('is-open'), i * 80);
        });
        revealBtn.classList.add('is-active');
        if (label) label.textContent = 'Collapse All';
      }
    });
  }

  // Staggered reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('playbook-visible');
        }, idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  cards.forEach((card) => observer.observe(card));

  // Re-init Lucide icons for playbook section
  if (window.lucide) lucide.createIcons();
}

/* -------------------------------------------------------
   DATA FLOW DIAGRAM — Cytoscape Interactive Graph
   Adapted from DFDReviewQueue.jsx Cytoscape patterns
------------------------------------------------------- */
function initDataFlow() {
  const container = document.getElementById('dataflow-cy');
  if (!container) return;

  // ── Verify all required libraries ──
  const libs = {
    cytoscape: window.cytoscape,
    dagre:     window.dagre,
    'cytoscape-dagre': window.cytoscapeDagre
  };
  const missing = Object.entries(libs).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.warn('[DataFlow] Missing libraries:', missing.join(', '));
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:60px 20px;font-size:14px;">' +
      'Data flow diagram requires: ' + missing.join(', ') + '</p>';
    return;
  }

  // Register dagre layout (safe even if auto-registered at load time)
  try { cytoscape.use(cytoscapeDagre); } catch (_) { /* already registered */ }

  // ── Node positions matching the reference diagram ──
  // Two rows: top = orchestration + external, bottom = main flow
  // X increases left→right, Y: top row ≈ 100, bottom row ≈ 300, End below synth ≈ 400
  const positions = {
    start:  { x:  60, y: 300 },
    prompt: { x: 260, y: 300 },
    intent: { x: 460, y: 300 },
    match:  { x: 660, y: 300 },
    run:    { x: 860, y: 300 },
    synth:  { x: 1060, y: 300 },
    end:    { x: 1060, y: 430 },
    orch:   { x: 380, y: 110 },
    tool:   { x: 760, y: 110 },
    data:   { x: 1080, y: 110 },
    // Hidden tool sub-nodes (above tool)
    'api-plugin':     { x: 500, y: -60 },
    'mcp-server':     { x: 660, y: -60 },
    'agent-to-agent': { x: 820, y: -60 },
    // Hidden data sub-nodes (above data)
    'semantic-index':    { x: 1080, y: -60 },
    'structured-db':     { x: 1240, y: -60 },
    'custom-semantic':   { x: 1400, y: -60 }
  };

  // ── Node & Edge Data Model ──
  const nodes = [
    { id: 'start',   label: 'Start',   type: 'terminal', nodeType: 'start', icon: 'play' },
    { id: 'prompt',  label: 'Initial prompt\n/ Trigger', type: 'step', step: 1, icon: 'message-square', risk: 'medium',
      threat: 'Prompt injection', desc: 'User prompts enter as raw, untrusted data. Malicious inputs can manipulate agent behavior.' },
    { id: 'intent',  label: 'Assess\nintent', type: 'step', step: 2, icon: 'scan-search', risk: 'high',
      threat: 'Intent manipulation', desc: 'The orchestrator classifies user intent. Adversarial prompts can trick intent detection into wrong pathways.' },
    { id: 'match',   label: 'Match content\nto response logic', type: 'step', step: 3, icon: 'route', risk: 'high',
      threat: 'Logic bypass', desc: 'Content is routed to the correct response handler. Misrouting can expose unauthorized capabilities.' },
    { id: 'run',     label: 'Run response\nlogic', type: 'step', step: 4, icon: 'zap', risk: 'high',
      threat: 'Unauthorized actions', desc: 'Grounding data is fetched and actions are invoked. Overprivileged connectors can leak data or trigger unintended operations.' },
    { id: 'synth',   label: 'Synthesize\nanswer', type: 'step', step: 5, icon: 'bot', risk: 'medium',
      threat: 'Data leakage', desc: 'The final response is assembled. Sensitive data from grounding sources can leak into conversational output.' },
    { id: 'end',     label: 'End',     type: 'terminal', nodeType: 'end', icon: 'square' },
    // Orchestration layer nodes
    { id: 'orch',    label: 'Language model or\nlogical code flow', type: 'orchestration', icon: 'brain' },
    { id: 'tool',    label: 'Tool use', type: 'external', icon: 'wrench',
      threat: 'Tool abuse', desc: 'External tool invocations cross trust boundaries. Unvalidated tool calls can execute with excessive permissions.' },
    { id: 'data',    label: 'Data',    type: 'external', icon: 'database',
      threat: 'Data exfiltration', desc: 'External data sources contain sensitive information. Insufficient access controls can expose data beyond the user\'s authorization scope.' },
    // Tool sub-nodes (hidden initially)
    { id: 'api-plugin',     label: 'API plugin',       type: 'tool-child', icon: 'plug', parent: 'tools-boundary' },
    { id: 'mcp-server',     label: 'MCP server',       type: 'tool-child', icon: 'server', parent: 'tools-boundary' },
    { id: 'agent-to-agent', label: 'Agent-to-agent',   type: 'tool-child', icon: 'users', parent: 'tools-boundary' },
    // Data sub-nodes (hidden initially)
    { id: 'semantic-index',  label: 'Microsoft\nSemantic Index', type: 'data-child', icon: 'search', parent: 'data-sources-boundary' },
    { id: 'structured-db',   label: 'Structured\nDatabase',      type: 'data-child', icon: 'table', parent: 'data-sources-boundary' },
    { id: 'custom-semantic',  label: 'Custom\nSemantic Index',   type: 'data-child', icon: 'file-search', parent: 'data-sources-boundary' }
  ];

  const edges = [
    { id: 'e-start-prompt',  source: 'start',  target: 'prompt', label: 'User input' },
    { id: 'e-prompt-intent', source: 'prompt', target: 'intent', label: 'Raw prompt' },
    { id: 'e-intent-match',  source: 'intent', target: 'match',  label: 'Classified intent' },
    { id: 'e-match-run',     source: 'match',  target: 'run',    label: 'Response handler' },
    { id: 'e-run-synth',     source: 'run',    target: 'synth',  label: 'Grounded data' },
    { id: 'e-synth-end',     source: 'synth',  target: 'end',    label: 'Response' },
    // Orchestration ↔ steps (vertical bidirectional)
    { id: 'e-orch-prompt',   source: 'orch',   target: 'prompt', label: '', edgeType: 'orch' },
    { id: 'e-orch-intent',   source: 'orch',   target: 'intent', label: '', edgeType: 'orch' },
    // Match → Orchestration (unidirectional)
    { id: 'e-match-orch',    source: 'match',  target: 'orch',   label: '', edgeType: 'orch-uni' },
    // Orchestration → external services (horizontal top row)
    { id: 'e-orch-tool',     source: 'orch',   target: 'tool',   label: 'API calls', edgeType: 'toprow' },
    { id: 'e-tool-data',     source: 'tool',   target: 'data',   label: 'Query',     edgeType: 'toprow' },
    // Tool ↓ run (curved downward)
    { id: 'e-data-match',    source: 'data',   target: 'match',  label: 'Results', edgeType: 'tool-down' },
    // Run ↰ match (curved feedback going left)
    { id: 'e-run-match',     source: 'run',    target: 'match',  label: 'Re-evaluate', edgeType: 'feedback' },
    // Tool → sub-nodes (hidden initially)
    { id: 'e-tool-api',     source: 'tool', target: 'api-plugin',     label: '', edgeType: 'tool-child' },
    { id: 'e-tool-mcp',     source: 'tool', target: 'mcp-server',     label: '', edgeType: 'tool-child' },
    { id: 'e-tool-agent',   source: 'tool', target: 'agent-to-agent', label: '', edgeType: 'tool-child' },
    // Data → sub-nodes (hidden initially)
    { id: 'e-data-sem',     source: 'data', target: 'semantic-index',  label: '', edgeType: 'data-child' },
    { id: 'e-data-db',      source: 'data', target: 'structured-db',   label: '', edgeType: 'data-child' },
    { id: 'e-data-custom',  source: 'data', target: 'custom-semantic', label: '', edgeType: 'data-child' }
  ];

  // ── Build Cytoscape Elements ──
  const elements = [];

  // Compound parent node for boundary
  elements.push({
    group: 'nodes',
    data: { id: 'boundary', label: 'Copilot Boundary', type: 'boundary' }
  });

  // Compound parent for tools boundary (hidden initially)
  elements.push({
    group: 'nodes',
    data: { id: 'tools-boundary', label: 'Actions and Tools', type: 'tools-boundary' }
  });

  // Compound parent for data sources boundary (hidden initially)
  elements.push({
    group: 'nodes',
    data: { id: 'data-sources-boundary', label: 'Data Sources', type: 'data-sources-boundary' }
  });

  nodes.forEach(n => {
    const nodeData = {
      id: n.id,
      label: n.label,
      type: n.type,
      nodeType: n.nodeType || n.type,
      icon: n.icon || '',
      step: n.step || 0,
      risk: n.risk || 'none',
      threat: n.threat || '',
      desc: n.desc || '',
      sub: n.sub || ''
    };
    // Only step nodes belong inside the Copilot Boundary
    const boundaryNodes = ['prompt', 'intent', 'match', 'run', 'synth'];
    if (boundaryNodes.includes(n.id)) {
      nodeData.parent = 'boundary';
    }
    // Tool-child nodes belong inside Tools boundary
    if (n.type === 'tool-child') {
      nodeData.parent = 'tools-boundary';
    }
    // Data-child nodes belong inside Data Sources boundary
    if (n.type === 'data-child') {
      nodeData.parent = 'data-sources-boundary';
    }
    elements.push({
      group: 'nodes',
      data: nodeData,
      position: positions[n.id] || { x: 0, y: 0 }
    });
  });

  edges.forEach(e => {
    elements.push({
      group: 'edges',
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        edgeType: e.edgeType || 'main'
      }
    });
  });

  // ── Cytoscape Styles ──
  const styles = [
    {
      selector: 'core',
      style: {
        'active-bg-color': '#1e293b',
        'active-bg-opacity': 0.3,
        'active-bg-size': 20,
        'selection-box-color': 'rgba(59, 130, 246, 0.1)',
        'selection-box-border-color': '#3b82f6',
        'selection-box-border-width': 1
      }
    },
    // All nodes transparent — HTML labels handle visuals
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'background-color': 'transparent',
        'background-opacity': 0,
        'border-width': 0,
        'label': '',
        'width': 140,
        'height': 90,
        'overlay-padding': 15
      }
    },
    // Boundary container
    {
      selector: 'node[type="boundary"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#0E141B',
        'background-opacity': 0.5,
        'border-width': 1.5,
        'border-style': 'dashed',
        'border-color': 'rgba(157, 131, 62, 0.3)',
        'border-dash-pattern': [8, 6],
        'padding': '40px',
        'label': 'Copilot Boundary',
        'color': 'rgba(157, 131, 62, 0.6)',
        'font-size': '13px',
        'font-weight': '600',
        'font-family': 'Montserrat, sans-serif',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': -20,
        'text-transform': 'uppercase',
        'min-width': '100px',
        'min-height': '100px'
      }
    },
    // Tools boundary container (hidden initially)
    {
      selector: 'node[type="tools-boundary"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#0E141B',
        'background-opacity': 0.5,
        'border-width': 1.5,
        'border-style': 'dashed',
        'border-color': 'rgba(123, 94, 167, 0.3)',
        'border-dash-pattern': [8, 6],
        'padding': '40px',
        'label': 'Actions and Tools',
        'color': 'rgba(123, 94, 167, 0.6)',
        'font-size': '13px',
        'font-weight': '600',
        'font-family': 'Montserrat, sans-serif',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': -20,
        'text-transform': 'uppercase',
        'min-width': '100px',
        'min-height': '100px',
        'display': 'none'
      }
    },
    // Tool child nodes
    {
      selector: 'node[type="tool-child"]',
      style: {
        'width': 130,
        'height': 80,
        'display': 'none'
      }
    },
    // Tool child edges (hidden initially)
    {
      selector: 'edge[edgeType="tool-child"]',
      style: {
        'width': 2,
        'line-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 4],
        'source-endpoint': '0 -50%',
        'target-endpoint': '0 50%',
        'display': 'none'
      }
    },
    // Data sources boundary (hidden initially)
    {
      selector: 'node[type="data-sources-boundary"]',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#0E141B',
        'background-opacity': 0.5,
        'border-width': 1.5,
        'border-style': 'dashed',
        'border-color': 'rgba(123, 94, 167, 0.3)',
        'border-dash-pattern': [8, 6],
        'padding': '40px',
        'label': 'Data Sources',
        'color': 'rgba(123, 94, 167, 0.6)',
        'font-size': '13px',
        'font-weight': '600',
        'font-family': 'Montserrat, sans-serif',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': -20,
        'text-transform': 'uppercase',
        'min-width': '100px',
        'min-height': '100px',
        'display': 'none'
      }
    },
    // Data child nodes
    {
      selector: 'node[type="data-child"]',
      style: {
        'width': 130,
        'height': 80,
        'display': 'none'
      }
    },
    // Data child edges (hidden initially)
    {
      selector: 'edge[edgeType="data-child"]',
      style: {
        'width': 2,
        'line-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 4],
        'source-endpoint': '0 -50%',
        'target-endpoint': '0 50%',
        'display': 'none'
      }
    },
    {
      selector: 'node[nodeType="start"], node[nodeType="end"]',
      style: { 'width': 56, 'height': 56 }
    },
    {
      selector: 'node[type="orchestration"]',
      style: { 'width': 210, 'height': 90 }
    },
    {
      selector: 'node[type="external"]',
      style: { 'width': 140, 'height': 90 }
    },
    // Main flow edges — white animated dashes
    {
      selector: 'edge[edgeType="main"]',
      style: {
        'width': 1.5,
        'line-color': 'rgba(255, 255, 255, 0.6)',
        'target-arrow-color': 'rgba(255, 255, 255, 0.6)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [8, 5],
        'line-dash-offset': 0,
        'label': '',
        'source-distance-from-node': 8,
        'target-distance-from-node': 8
      }
    },
    // Orchestration edges — purple dashed bidirectional (vertical)
    {
      selector: 'edge[edgeType="orch"]',
      style: {
        'width': 2,
        'line-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-shape': 'triangle',
        'source-arrow-shape': 'triangle',
        'source-arrow-color': 'rgba(123, 94, 167, 0.5)',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 4],
        'label': '',
        'source-distance-from-node': 5,
        'target-distance-from-node': 5,
        'source-endpoint': '0 50%',
        'target-endpoint': '0 -50%'
      }
    },
    // Orchestration edge — purple dashed unidirectional (match → orch)
    {
      selector: 'edge[edgeType="orch-uni"]',
      style: {
        'width': 2,
        'line-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-color': 'rgba(123, 94, 167, 0.5)',
        'target-arrow-shape': 'triangle',
        'source-arrow-shape': 'none',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 4],
        'label': '',
        'source-distance-from-node': 5,
        'target-distance-from-node': 5,
        'source-endpoint': '0 -50%',
        'target-endpoint': '0 50%'
      }
    },
    // Top-row horizontal edges (orch→tool, tool→data)
    {
      selector: 'edge[edgeType="toprow"]',
      style: {
        'width': 2.5,
        'line-color': 'rgba(255, 255, 255, 0.5)',
        'target-arrow-color': 'rgba(255, 255, 255, 0.5)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1,
        'curve-style': 'bezier',
        'line-style': 'dashed',
        'line-dash-pattern': [7, 4],
        'line-dash-offset': 0,
        'label': 'data(label)',
        'color': '#fbbf24',
        'font-size': '9px',
        'font-weight': '600',
        'text-background-color': 'rgba(14, 20, 27, 0.92)',
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-rotation': 'autorotate',
        'source-distance-from-node': 6,
        'target-distance-from-node': 6
      }
    },
    // Tool ↓ run (curved downward from top row to bottom row)
    {
      selector: 'edge[edgeType="tool-down"]',
      style: {
        'width': 2,
        'line-color': 'rgba(22, 171, 224, 0.5)',
        'target-arrow-color': 'rgba(22, 171, 224, 0.5)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1,
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [-50],
        'control-point-weights': [0.5],
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
        'line-dash-offset': 0,
        'label': 'data(label)',
        'color': 'rgba(22, 171, 224, 0.7)',
        'font-size': '9px',
        'font-weight': '600',
        'text-background-color': 'rgba(14, 20, 27, 0.92)',
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-rotation': 'autorotate',
        'source-distance-from-node': 0,
        'source-endpoint': '0% 50%',
        'target-distance-from-node': 0,
        'target-endpoint': '0% -50%'
      }
    },
    // Feedback edges — run→match (curved going backward/left)
    {
      selector: 'edge[edgeType="feedback"]',
      style: {
        'width': 2,
        'line-color': 'rgba(217, 61, 122, 0.5)',
        'target-arrow-color': 'rgba(217, 61, 122, 0.5)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1,
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [-120],
        'control-point-weights': [0.5],
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
        'line-dash-offset': 0,
        'label': 'data(label)',
        'color': 'rgba(217, 61, 122, 0.7)',
        'font-size': '9px',
        'font-weight': '600',
        'text-background-color': 'rgba(14, 20, 27, 0.92)',
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-rotation': 'autorotate',
        'source-distance-from-node': 0,
        'source-endpoint': '0% 50%',
        'target-distance-from-node': 0,
        'target-endpoint': '0% 50%'
      }
    },
    // Selected node
    {
      selector: 'node:selected',
      style: {
        'border-width': 0,
        'overlay-color': '#fbbf24',
        'overlay-opacity': 0.08
      }
    },
    // Selected edge
    {
      selector: 'edge:selected',
      style: {
        'width': 5,
        'line-color': '#fbbf24',
        'target-arrow-color': '#fbbf24'
      }
    },
    // Dimmed elements
    {
      selector: '.dimmed',
      style: {
        'opacity': 0.12,
        'transition-property': 'opacity',
        'transition-duration': '0.3s'
      }
    },
    // Highlighted edges
    {
      selector: '.highlighted',
      style: {
        'width': 5,
        'line-color': '#00D9FF',
        'target-arrow-color': '#00D9FF',
        'source-arrow-color': '#00D9FF',
        'opacity': 1,
        'z-index': 999,
        'transition-property': 'width, line-color, opacity',
        'transition-duration': '0.3s'
      }
    }
  ];

  // ── Initialize Cytoscape ──
  const cy = cytoscape({
    container: container,
    elements: elements,
    style: styles,
    layout: { name: 'preset' },
    minZoom: 0.4,
    maxZoom: 2.5,
    userPanningEnabled: true,
    userZoomingEnabled: true,
    boxSelectionEnabled: false
  });

  // ── Apply preset layout and fit ──
  cy.ready(() => {
    cy.fit(40);

    // Start all visible elements hidden (tool/data-child elements stay display:none)
    const visibleElements = cy.elements().filter(el =>
      el.data('type') !== 'tools-boundary' &&
      el.data('type') !== 'tool-child' &&
      el.data('edgeType') !== 'tool-child' &&
      el.data('type') !== 'data-sources-boundary' &&
      el.data('type') !== 'data-child' &&
      el.data('edgeType') !== 'data-child'
    );
    visibleElements.style('opacity', 0);

    // Staggered entrance: boundary first, then nodes left→right, then edges
    const boundary = cy.nodes('[type="boundary"]');
    const childNodes = visibleElements.nodes().filter(n => n.data('type') !== 'boundary');
    const sortedNodes = childNodes.sort((a, b) => a.position('x') - b.position('x'));

    // 1. Fade in boundary
    boundary.animate({ style: { opacity: 1 } }, { duration: 400, easing: 'ease-out' });

    // 2. Stagger nodes with slide-up effect
    sortedNodes.forEach((node, i) => {
      const origY = node.position('y');
      node.position('y', origY + 30);
      setTimeout(() => {
        node.animate(
          { position: { y: origY }, style: { opacity: 1 } },
          { duration: 500, easing: 'ease-out' }
        );
      }, 200 + i * 80);
    });

    // 3. Fade in edges after nodes (excluding tool-child edges)
    const edgeDelay = 200 + sortedNodes.length * 80 + 200;
    setTimeout(() => {
      cy.edges().filter(e => e.data('edgeType') !== 'tool-child' && e.data('edgeType') !== 'data-child').animate({ style: { opacity: 1 } }, { duration: 600, easing: 'ease-out' });
    }, edgeDelay);

    // 4. Apply HTML labels once first node starts animating
    setTimeout(() => {
      applyHTMLLabels(cy);
    }, 200);
  });

  // ── HTML Node Labels ──
  function applyHTMLLabels(cy) {
    // Remove any existing labels
    container.querySelectorAll('.cy-df-html-label').forEach(el => el.remove());

    cy.nodes().forEach(node => {
      const d = node.data();
      // Skip boundary parent nodes and tool-child nodes (handled by toggle)
      if (d.type === 'boundary' || d.type === 'tools-boundary' || d.type === 'tool-child' || d.type === 'data-sources-boundary' || d.type === 'data-child') return;
      const pos = node.renderedPosition();
      const zoom = cy.zoom();

      const typeClass = d.nodeType === 'start' ? 'type-start' :
                        d.nodeType === 'end' ? 'type-end' :
                        d.type === 'orchestration' ? 'type-orch' :
                        d.type === 'external' ? 'type-external' : '';

      const riskClass = d.risk === 'high' ? 'risk-high' :
                        d.risk === 'medium' ? 'risk-medium' : '';

      const isTerminal = d.nodeType === 'start' || d.nodeType === 'end';

      let badgeHTML = '';
      let shieldHTML = riskClass ? `<div class="cy-df-shield ${riskClass}"><i data-lucide="shield-alert" class="w-3 h-3"></i></div>` : '';
      let subHTML = d.sub ? `<div class="cy-df-sublabel">${d.sub}</div>` : '';
      let labelHTML = isTerminal ? '' : `<div class="cy-df-label">${d.label.replace(/\n/g, '<br>')}</div>`;
      let iconSize = isTerminal ? 'w-5 h-5' : 'w-5 h-5';

      const label = document.createElement('div');
      label.className = 'cy-df-html-label';
      label.dataset.nodeId = d.id;
      label.innerHTML = `
        <div class="cy-df-node">
          <div class="cy-df-node-box ${typeClass}">
            ${badgeHTML}
            ${shieldHTML}
            <div class="cy-df-icon"><i data-lucide="${d.icon}" class="${iconSize}"></i></div>
            ${labelHTML}
            ${subHTML}
          </div>
        </div>
      `;

      label.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 15;
        transform: translate(-50%, -50%);
        left: ${pos.x}px;
        top: ${pos.y}px;
        opacity: 0;
        transition: opacity 0.5s ease;
      `;

      container.appendChild(label);

      // Stagger label fade-in matching Cytoscape node order (left→right by x)
      const sortOrder = ['start','prompt','orch','intent','match','tool','run','data','synth','end'];
      const nodeIdx = sortOrder.indexOf(d.id);
      const delay = 200 + Math.max(0, nodeIdx) * 80;
      setTimeout(() => { label.style.opacity = '1'; }, delay);
    });

    // Render Lucide icons inside the newly added HTML labels
    if (window.lucide) lucide.createIcons();
  }

  // Update label positions on viewport change
  function updateLabelPositions() {
    cy.nodes().forEach(node => {
      const pos = node.renderedPosition();
      const label = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
      if (label) {
        label.style.left = pos.x + 'px';
        label.style.top = pos.y + 'px';
        label.style.transform = `translate(-50%, -50%) scale(${Math.min(cy.zoom(), 1.5)})`;
      }
    });
  }

  cy.on('pan zoom resize', updateLabelPositions);

  // Update individual label when a node is dragged
  cy.on('position', 'node', (evt) => {
    const node = evt.target;
    const pos = node.renderedPosition();
    const label = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
    if (label) {
      label.style.left = pos.x + 'px';
      label.style.top = pos.y + 'px';
      label.style.transform = `translate(-50%, -50%) scale(${Math.min(cy.zoom(), 1.5)})`;
    }
  });

  cy.on('layoutstop', () => {
    updateLabelPositions();
    cy.fit(50);
  });

  // ── Edge Animation — flowing dashed lines ──
  let lastAnimTime = performance.now();
  let dashOffset = 0;
  const DASH_SPEED = 25;
  let animFrameId = null;

  function animateEdges() {
    if (cy && !cy.destroyed()) {
      const now = performance.now();
      const dt = (now - lastAnimTime) / 1000;
      lastAnimTime = now;
      dashOffset = (dashOffset + DASH_SPEED * dt) % 13;
      cy.edges().forEach(edge => {
        edge.style('line-dash-offset', -dashOffset);
      });
      animFrameId = requestAnimationFrame(animateEdges);
    }
  }
  animFrameId = requestAnimationFrame(animateEdges);

  // ── Selection Highlight & Dim ──
  function clearHighlight() {
    cy.elements().removeClass('dimmed highlighted');
    container.querySelectorAll('.cy-df-node.dimmed').forEach(el => el.classList.remove('dimmed'));
  }

  function highlightConnected(el) {
    clearHighlight();
    let connected;
    if (el.isNode()) {
      connected = el.connectedEdges().connectedNodes().union(el).union(el.connectedEdges());
    } else {
      connected = el.source().union(el.target()).union(el);
    }
    cy.elements().difference(connected).addClass('dimmed');
    connected.edges().addClass('highlighted');

    // Dim HTML labels for unconnected nodes
    cy.nodes().forEach(n => {
      const label = container.querySelector(`.cy-df-html-label[data-node-id="${n.data('id')}"]`);
      if (label) {
        const nodeDiv = label.querySelector('.cy-df-node');
        if (nodeDiv) {
          if (connected.contains(n)) {
            nodeDiv.classList.remove('dimmed');
          } else {
            nodeDiv.classList.add('dimmed');
          }
        }
      }
    });
  }

  // ── Tooltip ──
  const tooltip = document.getElementById('dataflow-tooltip');

  function showTooltip(nodeData, event) {
    if (!tooltip || !nodeData.threat) return;

    const riskColor = nodeData.risk === 'high' ? '#EF4444' : nodeData.risk === 'medium' ? '#F59E0B' : '#22C55E';
    const riskLabel = (nodeData.risk || 'low').charAt(0).toUpperCase() + (nodeData.risk || 'low').slice(1);

    tooltip.innerHTML = `
      <div class="dataflow-tooltip-title"><i data-lucide="${nodeData.icon}" class="w-4 h-4" style="display:inline-block;vertical-align:middle;margin-right:6px;"></i>${nodeData.label.replace(/\n/g, ' ')}</div>
      <div class="dataflow-tooltip-row">
        <span style="color: ${riskColor};">●</span>
        <span class="label">Risk Level:</span>
        <span class="value" style="color: ${riskColor};">${riskLabel}</span>
      </div>
      <div class="dataflow-tooltip-row">
        <span style="color: #F59E0B;">⚠</span>
        <span class="label">Primary Threat:</span>
        <span class="value" style="color: #fbbf24;">${nodeData.threat}</span>
      </div>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(100,116,139,0.2); font-size: 11px; color: #94a3b8; line-height: 1.5;">
        ${nodeData.desc}
      </div>
    `;

    const wrapperRect = document.getElementById('dataflow-wrapper').getBoundingClientRect();
    const x = event.renderedPosition.x + 20;
    const y = event.renderedPosition.y - 10;

    tooltip.style.left = Math.min(x, wrapperRect.width - 360) + 'px';
    tooltip.style.top = Math.max(y, 10) + 'px';
    tooltip.classList.add('is-visible');
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('is-visible');
  }

  // ── Event Handlers ──
  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    highlightConnected(node);
    // Mark selected HTML label
    container.querySelectorAll('.cy-df-node-box.selected').forEach(el => el.classList.remove('selected'));
    const label = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
    if (label) {
      const box = label.querySelector('.cy-df-node-box');
      if (box) box.classList.add('selected');
    }
  });

  cy.on('tap', (evt) => {
    if (evt.target === cy) {
      clearHighlight();
      container.querySelectorAll('.cy-df-node-box.selected').forEach(el => el.classList.remove('selected'));
      hideTooltip();
    }
  });

  cy.on('mouseover', 'node', (evt) => {
    const node = evt.target;
    const d = node.data();
    showTooltip(d, evt);
    // Add hover class to HTML label
    const lbl = container.querySelector(`.cy-df-html-label[data-node-id="${d.id}"]`);
    if (lbl) { const box = lbl.querySelector('.cy-df-node-box'); if (box) box.classList.add('hovered'); }
    // Hover edge highlight
    node.connectedEdges().forEach(e => {
      if (!e.hasClass('highlighted')) {
        e.style({ 'width': e.data('edgeType') === 'main' ? 2.5 : 3 });
      }
    });
  });

  cy.on('mouseout', 'node', (evt) => {
    const node = evt.target;
    hideTooltip();
    // Remove hover class from HTML label
    const lbl = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
    if (lbl) { const box = lbl.querySelector('.cy-df-node-box'); if (box) box.classList.remove('hovered'); }
    node.connectedEdges().forEach(e => {
      if (!e.hasClass('highlighted')) {
        const w = e.data('edgeType') === 'main' ? 1.5 : 2;
        e.style({ 'width': w });
      }
    });
  });

  // ── Zoom Controls ──
  const zoomIn = document.getElementById('df-zoom-in');
  const zoomOut = document.getElementById('df-zoom-out');
  const fitBtn = document.getElementById('df-fit');

  if (zoomIn) zoomIn.addEventListener('click', () => cy.animate({ zoom: cy.zoom() * 1.3, duration: 200 }));
  if (zoomOut) zoomOut.addEventListener('click', () => cy.animate({ zoom: cy.zoom() / 1.3, duration: 200 }));
  if (fitBtn) fitBtn.addEventListener('click', () => cy.animate({ fit: { padding: 50 }, duration: 300 }));

  // ── Tools Toggle ──
  const toolsToggle = document.getElementById('df-tools-toggle');
  let toolsVisible = false;

  if (toolsToggle) {
    toolsToggle.addEventListener('click', () => {
      toolsVisible = !toolsVisible;
      toolsToggle.classList.toggle('active', toolsVisible);

      const toolsBoundary = cy.nodes('[type="tools-boundary"]');
      const toolChildNodes = cy.nodes('[type="tool-child"]');
      const toolChildEdges = cy.edges('[edgeType="tool-child"]');

      if (toolsVisible) {
        // Show boundary
        toolsBoundary.style('display', 'element');
        toolsBoundary.style('opacity', 0);
        toolsBoundary.animate({ style: { opacity: 1 } }, { duration: 400, easing: 'ease-out' });

        // Show child nodes with stagger
        toolChildNodes.style('display', 'element');
        toolChildNodes.forEach((node, i) => {
          node.style('opacity', 0);
          const origY = node.position('y');
          node.position('y', origY + 30);
          setTimeout(() => {
            node.animate(
              { position: { y: origY }, style: { opacity: 1 } },
              { duration: 400, easing: 'ease-out' }
            );
          }, 100 + i * 100);
        });

        // Show edges after nodes
        setTimeout(() => {
          toolChildEdges.style('display', 'element');
          toolChildEdges.style('opacity', 0);
          toolChildEdges.animate({ style: { opacity: 1 } }, { duration: 400, easing: 'ease-out' });
        }, 100 + toolChildNodes.length * 100 + 100);

        // Create HTML labels for tool-child nodes
        setTimeout(() => {
          toolChildNodes.forEach(node => {
            const existing = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
            if (existing) existing.remove();
          });
          applyToolChildLabels(cy);
        }, 100);

        // Fit to show all
        setTimeout(() => {
          cy.animate({ fit: { padding: 50 }, duration: 400 });
        }, 100 + toolChildNodes.length * 100 + 300);
      } else {
        // Hide with animation
        toolChildEdges.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          toolChildEdges.style('display', 'none');
        }});
        toolChildNodes.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          toolChildNodes.style('display', 'none');
        }});
        toolsBoundary.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          toolsBoundary.style('display', 'none');
        }});

        // Remove HTML labels for tool-child nodes
        toolChildNodes.forEach(node => {
          const label = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
          if (label) label.remove();
        });

        // Fit back
        setTimeout(() => {
          cy.animate({ fit: { padding: 50 }, duration: 400 });
        }, 400);
      }
    });
  }

  // Create HTML labels specifically for tool-child nodes
  function applyToolChildLabels(cy) {
    cy.nodes('[type="tool-child"]').forEach(node => {
      const d = node.data();
      const pos = node.renderedPosition();

      const label = document.createElement('div');
      label.className = 'cy-df-html-label';
      label.dataset.nodeId = d.id;
      label.innerHTML = `
        <div class="cy-df-node">
          <div class="cy-df-node-box type-tool-child">
            <div class="cy-df-icon"><i data-lucide="${d.icon}" class="w-5 h-5"></i></div>
            <div class="cy-df-label">${d.label}</div>
          </div>
        </div>
      `;
      label.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 15;
        transform: translate(-50%, -50%);
        left: ${pos.x}px;
        top: ${pos.y}px;
        opacity: 0;
        transition: opacity 0.4s ease;
      `;
      container.appendChild(label);
      setTimeout(() => { label.style.opacity = '1'; }, 50);
    });
    if (window.lucide) lucide.createIcons();
  }

  // ── Data Sources Toggle ──
  const dataToggle = document.getElementById('df-data-toggle');
  let dataVisible = false;

  if (dataToggle) {
    dataToggle.addEventListener('click', () => {
      dataVisible = !dataVisible;
      dataToggle.classList.toggle('active', dataVisible);

      const dataBoundary = cy.nodes('[type="data-sources-boundary"]');
      const dataChildNodes = cy.nodes('[type="data-child"]');
      const dataChildEdges = cy.edges('[edgeType="data-child"]');

      if (dataVisible) {
        dataBoundary.style('display', 'element');
        dataBoundary.style('opacity', 0);
        dataBoundary.animate({ style: { opacity: 1 } }, { duration: 400, easing: 'ease-out' });

        dataChildNodes.style('display', 'element');
        dataChildNodes.forEach((node, i) => {
          node.style('opacity', 0);
          const origY = node.position('y');
          node.position('y', origY + 30);
          setTimeout(() => {
            node.animate(
              { position: { y: origY }, style: { opacity: 1 } },
              { duration: 400, easing: 'ease-out' }
            );
          }, 100 + i * 100);
        });

        setTimeout(() => {
          dataChildEdges.style('display', 'element');
          dataChildEdges.style('opacity', 0);
          dataChildEdges.animate({ style: { opacity: 1 } }, { duration: 400, easing: 'ease-out' });
        }, 100 + dataChildNodes.length * 100 + 100);

        setTimeout(() => {
          dataChildNodes.forEach(node => {
            const existing = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
            if (existing) existing.remove();
          });
          applyDataChildLabels(cy);
        }, 100);

        setTimeout(() => {
          cy.animate({ fit: { padding: 50 }, duration: 400 });
        }, 100 + dataChildNodes.length * 100 + 300);
      } else {
        dataChildEdges.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          dataChildEdges.style('display', 'none');
        }});
        dataChildNodes.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          dataChildNodes.style('display', 'none');
        }});
        dataBoundary.animate({ style: { opacity: 0 } }, { duration: 300, easing: 'ease-in', complete: () => {
          dataBoundary.style('display', 'none');
        }});

        dataChildNodes.forEach(node => {
          const label = container.querySelector(`.cy-df-html-label[data-node-id="${node.data('id')}"]`);
          if (label) label.remove();
        });

        setTimeout(() => {
          cy.animate({ fit: { padding: 50 }, duration: 400 });
        }, 400);
      }
    });
  }

  function applyDataChildLabels(cy) {
    cy.nodes('[type="data-child"]').forEach(node => {
      const d = node.data();
      const pos = node.renderedPosition();

      const label = document.createElement('div');
      label.className = 'cy-df-html-label';
      label.dataset.nodeId = d.id;
      label.innerHTML = `
        <div class="cy-df-node">
          <div class="cy-df-node-box type-data-child">
            <div class="cy-df-icon"><i data-lucide="${d.icon}" class="w-5 h-5"></i></div>
            <div class="cy-df-label">${d.label.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      `;
      label.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 15;
        transform: translate(-50%, -50%);
        left: ${pos.x}px;
        top: ${pos.y}px;
        opacity: 0;
        transition: opacity 0.4s ease;
      `;
      container.appendChild(label);
      setTimeout(() => { label.style.opacity = '1'; }, 50);
    });
    if (window.lucide) lucide.createIcons();
  }

  // ── Start animation when in view, stop when not ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!animFrameId) {
          lastAnimTime = performance.now();
          animFrameId = requestAnimationFrame(animateEdges);
        }
      } else {
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(container);

  // Re-init Lucide icons
  if (window.lucide) lucide.createIcons();
}
