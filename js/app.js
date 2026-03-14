/* ============================================================
   Copilot Studio Agents Security — Workshop
   Interactive JS: WebGL Shader, Scroll Reveal, Nav Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroShader();
  initScrollReveal();
  initNavScroll();
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

      // Two crossing energy beams
      vec2 uv1 = uv + 2.0 * fbm(uv * 1.5 + 0.5 * iTime) - 1.0;
      vec2 uv2 = uv * rot(0.8) + 2.0 * fbm(uv * 1.2 - 0.4 * iTime + 3.0) - 1.0;

      float d1 = abs(uv1.x);
      float d2 = abs(uv2.x);

      // Purple beam (hue ~270)
      vec3 col1 = hsv(0.78, 0.7, 0.8) * pow(0.025 / d1, 1.2);
      // Cyan/blue beam (hue ~200)
      vec3 col2 = hsv(0.55, 0.6, 0.7) * pow(0.018 / d2, 1.1);

      // Subtle gold ambient
      vec3 ambient = hsv(0.12, 0.5, 0.08) * fbm(uv * 0.8 + iTime * 0.1);

      vec3 col = col1 + col2 + ambient;

      // Vignette
      float vig = 1.0 - 0.4 * length(uv * 0.6);
      col *= vig;

      // Tone map
      col = col / (1.0 + col);
      col = pow(col, vec3(0.9));

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
