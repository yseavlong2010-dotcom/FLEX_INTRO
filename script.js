/* =========================================================
   PREMIUM LUXURY AI INTRO
   File: script.js

   Chức năng:
   - Vẽ bão ký tự bằng HTML Canvas.
   - Ký tự xoáy hỗn loạn như data storm.
   - Hội tụ thành chữ ChatGPT.
   - Giữ chữ phát sáng.
   - Tan rã và lặp lại liền mạch.

   Không dùng thư viện ngoài.
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     LẤY CANVAS
  ========================================================= */

  const canvas = document.getElementById("stormCanvas");

  if (!canvas) {
    console.error("Không tìm thấy canvas có id='stormCanvas'.");
    return;
  }

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  if (!ctx) {
    console.error("Trình duyệt không hỗ trợ Canvas 2D.");
    return;
  }

  /* =========================================================
     CẤU HÌNH CHÍNH
     Bạn có thể chỉnh phần này nếu muốn đổi hiệu ứng.
  ========================================================= */

  const CONFIG = {
    // Tên AI sẽ tự lấy từ body data-ai-name trong index.html
    aiName: document.body?.dataset?.aiName?.trim() || "ChatGPT",

    // Số lượng particle chữ
    particleCount: 1200,

    // Giới hạn DPR để canvas nét nhưng không quá lag
    maxDpr: 2,

    // Ký tự dùng trong data storm
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}<>/*#$@AI01",

    // Màu mặc định, sẽ được theme ghi đè bên dưới
    mainColor: "#00f5ff",
    glowColor: "#ffffff",
    backgroundColor: "#020617",

    // Font chữ particle
    particleFont:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',

    // Font chữ dùng để lấy điểm tạo hình tên AI
    titleFont:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    titleFontWeight: 900,

    // Kích thước particle
    particleMinSize: 9,
    particleMaxSize: 18,

    // Độ mờ nền mỗi frame, càng thấp trail càng dài
    trailAlpha: 0.18,

    // Độ nén trục Y của vòng xoáy
    vortexYScale: 0.62,

    // Khoảng cách lấy mẫu điểm chữ
    targetSampleStep: 6,

    // Thời lượng từng pha
    stormDuration: 3200,
    formDuration: 3200,
    holdDuration: 2100,
    disperseDuration: 3100,

    // Hiệu ứng glow
    stormGlow: 7,
    formGlow: 13,
    holdGlow: 20,

    // Resize debounce
    resizeDelay: 160
  };

  /* =========================================================
     THEME TỰ ĐỘNG THEO TÊN AI
     Hiện index.html đang để ChatGPT.
     Sau này đổi data-ai-name thì màu tự đổi theo.
  ========================================================= */

  const THEMES = {
    chatgpt: {
      label: "CYAN PLATINUM",
      mainColor: "#00f5ff",
      glowColor: "#f8fafc",
      backgroundColor: "#020617"
    },
    claude: {
      label: "AMBER SILK",
      mainColor: "#ffb86b",
      glowColor: "#fff7ed",
      backgroundColor: "#120805"
    },
    gemini: {
      label: "VIOLET AURORA",
      mainColor: "#a78bfa",
      glowColor: "#e0e7ff",
      backgroundColor: "#08051a"
    },
    grok: {
      label: "CRIMSON MONO",
      mainColor: "#ff3b3b",
      glowColor: "#ffffff",
      backgroundColor: "#030303"
    },
    copilot: {
      label: "BLUE VIOLET",
      mainColor: "#60a5fa",
      glowColor: "#dbeafe",
      backgroundColor: "#020617"
    },
    deepseek: {
      label: "DEEP SILVER",
      mainColor: "#38bdf8",
      glowColor: "#e2e8f0",
      backgroundColor: "#020617"
    }
  };

  const theme = getThemeForAI(CONFIG.aiName);
  Object.assign(CONFIG, theme);

  /* =========================================================
     STATE
  ========================================================= */

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    centerX: 0,
    centerY: 0,
    fontSize: 120,
    targetPoints: [],
    particles: [],
    startTime: performance.now(),
    rafId: null,
    resizeTimer: null,
    running: false,
    currentPhase: "storm"
  };

  const ui = {
    title: document.getElementById("aiTitle"),
    subtitle: document.getElementById("aiSubtitle"),
    preloader: document.getElementById("preloader"),
    systemValues: document.querySelectorAll(".system-panel__value")
  };

  /* =========================================================
     KHỞI ĐỘNG
  ========================================================= */

  syncStaticUI();
  applyThemeToCSS();
  resizeCanvas(true);
  hidePreloader();
  startAnimation();

  // Nếu font load xong sau, dựng lại điểm chữ cho chuẩn hơn
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(() => {
        buildTargetPoints();
        assignParticleTargets();
      })
      .catch(() => {
        // Không cần làm gì nếu trình duyệt không xử lý được document.fonts
      });
  }

  window.addEventListener("resize", handleResize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  /* =========================================================
     UI
  ========================================================= */

  function syncStaticUI() {
    document.title = `${CONFIG.aiName} — Premium Luxury AI Intro`;
    document.body.dataset.aiName = CONFIG.aiName;
    document.body.dataset.palette = CONFIG.label.toLowerCase().replace(/\s+/g, "-");

    if (ui.title) {
      ui.title.textContent = CONFIG.aiName;
      ui.title.style.opacity = "0";
    }

    if (ui.subtitle) {
      ui.subtitle.textContent = "DATA STORM REVEAL SEQUENCE";
    }

    if (ui.systemValues.length >= 3) {
      ui.systemValues[0].textContent = CONFIG.aiName;
      ui.systemValues[1].textContent = CONFIG.label;
      ui.systemValues[2].textContent = "LUXURY STORM";
    }
  }

  function updateDynamicUI(phase) {
    if (!ui.title) return;

    let opacity = 0;

    if (phase.name === "storm") {
      opacity = 0.04;
    }

    if (phase.name === "form") {
      opacity = smoothstep((phase.progress - 0.68) / 0.32);
    }

    if (phase.name === "hold") {
      opacity = 1;
    }

    if (phase.name === "disperse") {
      opacity = 1 - smoothstep(phase.progress / 0.72);
    }

    ui.title.style.opacity = clamp(opacity, 0, 1).toFixed(3);

    if (!ui.subtitle) return;

    if (state.currentPhase !== phase.name) {
      state.currentPhase = phase.name;

      const subtitleMap = {
        storm: "DATA STORM INITIALIZING",
        form: "NEURAL PARTICLES CONVERGING",
        hold: "PREMIUM AI SIGNATURE LOCKED",
        disperse: "DATA STORM RECYCLING"
      };

      ui.subtitle.textContent = subtitleMap[phase.name] || "DATA STORM REVEAL SEQUENCE";
    }
  }

  function applyThemeToCSS() {
    const root = document.documentElement;

    root.style.setProperty("--cyan", CONFIG.mainColor);
    root.style.setProperty("--cyan-soft", CONFIG.glowColor);
    root.style.setProperty("--platinum", CONFIG.glowColor);
    root.style.setProperty("--bg-deep", CONFIG.backgroundColor);
    root.style.setProperty("--shadow-cyan", rgbaFromHex(CONFIG.mainColor, 0.45));
  }

  function hidePreloader() {
    if (!ui.preloader) return;

    window.setTimeout(() => {
      ui.preloader.classList.add("is-hidden");
    }, 450);
  }

  /* =========================================================
     CANVAS SIZE
  ========================================================= */

  function handleResize() {
    window.clearTimeout(state.resizeTimer);

    state.resizeTimer = window.setTimeout(() => {
      resizeCanvas(false);
    }, CONFIG.resizeDelay);
  }

  function resizeCanvas(resetParticles = false) {
    state.width = Math.max(320, Math.floor(window.innerWidth));
    state.height = Math.max(320, Math.floor(window.innerHeight));
    state.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);

    state.centerX = state.width / 2;
    state.centerY = state.height / 2;

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);

    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    paintSolidBackground();
    buildTargetPoints();
    ensureParticles(resetParticles);
  }

  function paintSolidBackground() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = CONFIG.backgroundColor;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();
  }

  /* =========================================================
     TẠO ĐIỂM MỤC TIÊU TỪ CHỮ ChatGPT
  ========================================================= */

  function buildTargetPoints() {
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

    if (!offCtx) {
      state.targetPoints = createFallbackTargetPoints(getEffectiveParticleCount());
      return;
    }

    offscreen.width = state.width;
    offscreen.height = state.height;

    const fontSize = getResponsiveFontSize(offCtx);
    state.fontSize = fontSize;

    offCtx.clearRect(0, 0, state.width, state.height);
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillStyle = "#ffffff";
    offCtx.font = `${CONFIG.titleFontWeight} ${fontSize}px ${CONFIG.titleFont}`;

    const textMetrics = offCtx.measureText(CONFIG.aiName);
    const textWidth = Math.ceil(textMetrics.width);

    const ascent = Math.ceil(textMetrics.actualBoundingBoxAscent || fontSize * 0.74);
    const descent = Math.ceil(textMetrics.actualBoundingBoxDescent || fontSize * 0.22);
    const textHeight = ascent + descent;

    const textX = state.centerX;
    const textY = state.centerY;

    offCtx.fillText(CONFIG.aiName, textX, textY);

    const padding = Math.ceil(fontSize * 0.2);

    const boxX = clamp(
      Math.floor(textX - textWidth / 2 - padding),
      0,
      state.width - 1
    );

    const boxY = clamp(
      Math.floor(textY - textHeight / 2 - padding),
      0,
      state.height - 1
    );

    const boxWidth = clamp(
      Math.ceil(textWidth + padding * 2),
      1,
      state.width - boxX
    );

    const boxHeight = clamp(
      Math.ceil(textHeight + padding * 2),
      1,
      state.height - boxY
    );

    const imageData = offCtx.getImageData(boxX, boxY, boxWidth, boxHeight);

    const desiredCount = getEffectiveParticleCount();
    const baseStep = state.width < 560 ? 4 : CONFIG.targetSampleStep;

    let points = [];

    for (let step = baseStep; step >= 3; step -= 1) {
      points = sampleTextPixels(imageData, boxX, boxY, boxWidth, boxHeight, step);

      if (points.length >= desiredCount * 0.86 || step === 3) {
        break;
      }
    }

    if (!points.length) {
      points = createFallbackTargetPoints(desiredCount);
    }

    state.targetPoints = prepareTargetPoints(points, desiredCount);
  }

  function getResponsiveFontSize(measureCtx) {
    const minSize = state.width < 560 ? 58 : 76;
    const maxSize = Math.min(state.width * 0.18, state.height * 0.24, 190);

    let size = Math.max(minSize, maxSize);

    while (size > minSize) {
      measureCtx.font = `${CONFIG.titleFontWeight} ${size}px ${CONFIG.titleFont}`;
      const width = measureCtx.measureText(CONFIG.aiName).width;

      if (width <= state.width * 0.78) {
        break;
      }

      size -= 4;
    }

    return Math.round(size);
  }

  function sampleTextPixels(imageData, originX, originY, width, height, step) {
    const points = [];
    const data = imageData.data;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alphaIndex = (y * width + x) * 4 + 3;
        const alpha = data[alphaIndex];

        if (alpha > 88) {
          points.push({
            x: originX + x,
            y: originY + y
          });
        }
      }
    }

    return points;
  }

  function prepareTargetPoints(points, desiredCount) {
    const shuffled = shuffle(points.slice());

    if (shuffled.length > desiredCount * 1.45) {
      return shuffled.slice(0, Math.ceil(desiredCount * 1.45));
    }

    return shuffled;
  }

  function createFallbackTargetPoints(count) {
    const points = [];
    const radiusX = Math.min(state.width * 0.26, 280);
    const radiusY = Math.min(state.height * 0.08, 90);

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;

      points.push({
        x: state.centerX + Math.cos(angle) * radiusX,
        y: state.centerY + Math.sin(angle) * radiusY
      });
    }

    return points;
  }

  /* =========================================================
     PARTICLES
  ========================================================= */

  function ensureParticles(reset = false) {
    const desiredCount = getEffectiveParticleCount();

    if (reset) {
      state.particles = [];
    }

    while (state.particles.length < desiredCount) {
      state.particles.push(createParticle(state.particles.length));
    }

    if (state.particles.length > desiredCount) {
      state.particles.length = desiredCount;
    }

    assignParticleTargets();
  }

  function createParticle(index) {
    const maxRadius = Math.hypot(state.width, state.height) * 0.55;
    const minRadius = Math.min(state.width, state.height) * 0.08;

    const angle = random(0, Math.PI * 2);
    const radius = random(minRadius, maxRadius);

    const particle = {
      index,
      x: state.centerX + Math.cos(angle) * radius,
      y: state.centerY + Math.sin(angle) * radius,

      tx: state.centerX,
      ty: state.centerY,

      angle,
      radius,
      phase: random(0, Math.PI * 2),

      orbitSpeed: random(0.55, 1.45) * randomSign(),
      radialSpeed: random(0.65, 1.6),
      radialAmp: random(10, 58),
      drift: random(6, 28),

      size: random(CONFIG.particleMinSize, CONFIG.particleMaxSize),
      alpha: random(0.38, 0.92),

      char: randomChar(),
      lockedChar: "A",
      nextCharSwap: performance.now() + random(80, 480),

      scatterAngle: random(0, Math.PI * 2),
      scatterDistance: random(maxRadius * 0.25, maxRadius)
    };

    return particle;
  }

  function assignParticleTargets() {
    const points = state.targetPoints.length
      ? shuffle(state.targetPoints.slice())
      : createFallbackTargetPoints(state.particles.length);

    const aiChars = CONFIG.aiName.replace(/\s+/g, "") || "AI";

    state.particles.forEach((particle, index) => {
      const point = points[index % points.length];

      particle.tx = point.x + random(-0.8, 0.8);
      particle.ty = point.y + random(-0.8, 0.8);
      particle.lockedChar = aiChars[index % aiChars.length];

      particle.scatterAngle = random(0, Math.PI * 2);
      particle.scatterDistance = random(
        Math.min(state.width, state.height) * 0.18,
        Math.hypot(state.width, state.height) * 0.54
      );
    });
  }

  function getEffectiveParticleCount() {
    if (state.width < 520) {
      return Math.round(CONFIG.particleCount * 0.52);
    }

    if (state.width < 900) {
      return Math.round(CONFIG.particleCount * 0.72);
    }

    return CONFIG.particleCount;
  }

  /* =========================================================
     ANIMATION LOOP
  ========================================================= */

  function startAnimation() {
    if (state.running) return;

    state.running = true;
    state.rafId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    state.running = false;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  function animate(now) {
    if (!state.running) return;

    const phase = getCurrentPhase(now);

    drawFrame(now, phase);
    updateDynamicUI(phase);

    state.rafId = requestAnimationFrame(animate);
  }

  function getCurrentPhase(now) {
    const totalDuration =
      CONFIG.stormDuration +
      CONFIG.formDuration +
      CONFIG.holdDuration +
      CONFIG.disperseDuration;

    let elapsed = (now - state.startTime) % totalDuration;

    if (elapsed < CONFIG.stormDuration) {
      return {
        name: "storm",
        progress: elapsed / CONFIG.stormDuration
      };
    }

    elapsed -= CONFIG.stormDuration;

    if (elapsed < CONFIG.formDuration) {
      return {
        name: "form",
        progress: elapsed / CONFIG.formDuration
      };
    }

    elapsed -= CONFIG.formDuration;

    if (elapsed < CONFIG.holdDuration) {
      return {
        name: "hold",
        progress: elapsed / CONFIG.holdDuration
      };
    }

    elapsed -= CONFIG.holdDuration;

    return {
      name: "disperse",
      progress: elapsed / CONFIG.disperseDuration
    };
  }

  function drawFrame(now, phase) {
    drawTrailBackground();
    drawEnergyCore(now, phase);
    drawParticles(now, phase);
  }

  function drawTrailBackground() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = rgbaFromHex(CONFIG.backgroundColor, CONFIG.trailAlpha);
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();
  }

  function drawEnergyCore(now, phase) {
    const time = now * 0.001;
    const pulse = 0.5 + Math.sin(time * 2.4) * 0.5;

    const phaseBoost =
      phase.name === "hold"
        ? 1
        : phase.name === "form"
          ? 0.72
          : 0.48;

    const radius = Math.min(state.width, state.height) * (0.22 + pulse * 0.04);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const gradient = ctx.createRadialGradient(
      state.centerX,
      state.centerY,
      0,
      state.centerX,
      state.centerY,
      radius * 2.2
    );

    gradient.addColorStop(0, rgbaFromHex(CONFIG.mainColor, 0.2 * phaseBoost));
    gradient.addColorStop(0.36, rgbaFromHex(CONFIG.mainColor, 0.08 * phaseBoost));
    gradient.addColorStop(1, rgbaFromHex(CONFIG.mainColor, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    // Vòng năng lượng mờ phía sau chữ
    ctx.translate(state.centerX, state.centerY);
    ctx.rotate(time * 0.2);

    for (let i = 0; i < 3; i += 1) {
      const ringRadius = radius * (0.86 + i * 0.28);
      const alpha = (0.22 - i * 0.045) * phaseBoost;

      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        ringRadius * 1.72,
        ringRadius * 0.38,
        i * 0.42,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = rgbaFromHex(CONFIG.mainColor, alpha);
      ctx.lineWidth = 1;
      ctx.shadowColor = CONFIG.mainColor;
      ctx.shadowBlur = 18;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawParticles(now, phase) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const particle of state.particles) {
      const render = getParticleRenderState(particle, now, phase);

      ctx.globalAlpha = render.alpha;
      ctx.font = `${render.size}px ${CONFIG.particleFont}`;
      ctx.fillStyle = render.color;
      ctx.shadowColor = render.shadowColor;
      ctx.shadowBlur = render.glow;

      ctx.fillText(render.char, render.x, render.y);
    }

    ctx.restore();
  }

  function getParticleRenderState(particle, now, phase) {
    const storm = getStormPosition(particle, now);
    const target = getTargetPosition(particle, now);

    let x = storm.x;
    let y = storm.y;
    let size = particle.size;
    let alpha = particle.alpha;
    let glow = CONFIG.stormGlow;
    let char = getAnimatedChar(particle, now, false);

    if (phase.name === "storm") {
      const pulse = 0.72 + Math.sin(now * 0.003 + particle.phase) * 0.18;

      x = storm.x;
      y = storm.y;
      size = particle.size * pulse;
      alpha = particle.alpha * 0.76;
      glow = CONFIG.stormGlow;
      char = getAnimatedChar(particle, now, false);
    }

    if (phase.name === "form") {
      const ease = easeInOutCubic(phase.progress);
      const microChaos = (1 - ease) * 18;

      x = lerp(storm.x, target.x, ease);
      y = lerp(storm.y, target.y, ease);

      x += Math.sin(now * 0.006 + particle.phase) * microChaos;
      y += Math.cos(now * 0.005 + particle.phase) * microChaos;

      size = lerp(particle.size, particle.size * 0.82, ease);
      alpha = lerp(particle.alpha * 0.6, 0.94, ease);
      glow = lerp(CONFIG.stormGlow, CONFIG.formGlow, ease);
      char = ease > 0.7 ? particle.lockedChar : getAnimatedChar(particle, now, false);
    }

    if (phase.name === "hold") {
      const pulse = 0.96 + Math.sin(now * 0.004 + particle.phase) * 0.04;

      x = target.x + Math.sin(now * 0.003 + particle.phase) * 1.15;
      y = target.y + Math.cos(now * 0.003 + particle.phase) * 1.15;

      size = particle.size * 0.82 * pulse;
      alpha = 0.92;
      glow = CONFIG.holdGlow;
      char = particle.lockedChar;
    }

    if (phase.name === "disperse") {
      const ease = easeInOutCubic(phase.progress);

      x = lerp(target.x, storm.x, ease);
      y = lerp(target.y, storm.y, ease);

      size = lerp(particle.size * 0.82, particle.size, ease);
      alpha = lerp(0.92, particle.alpha * 0.7, ease);
      glow = lerp(CONFIG.holdGlow, CONFIG.stormGlow, ease);
      char = ease < 0.42 ? particle.lockedChar : getAnimatedChar(particle, now, false);
    }

    return {
      x,
      y,
      size,
      alpha: clamp(alpha, 0, 1),
      glow,
      char,
      color: rgbaFromHex(CONFIG.glowColor, 0.9),
      shadowColor: rgbaFromHex(CONFIG.mainColor, 0.95)
    };
  }

  function getStormPosition(particle, now) {
    const time = now * 0.001;

    const angle =
      particle.angle +
      time * particle.orbitSpeed +
      Math.sin(time * 0.7 + particle.phase) * 0.36;

    const radius =
      particle.radius +
      Math.sin(time * particle.radialSpeed + particle.phase) * particle.radialAmp;

    const driftX = Math.sin(time * 1.45 + particle.phase) * particle.drift;
    const driftY = Math.cos(time * 1.15 + particle.phase) * particle.drift;

    return {
      x: state.centerX + Math.cos(angle) * radius + driftX,
      y: state.centerY + Math.sin(angle) * radius * CONFIG.vortexYScale + driftY
    };
  }

  function getTargetPosition(particle, now) {
    const time = now * 0.001;

    return {
      x: particle.tx + Math.sin(time * 2 + particle.phase) * 0.35,
      y: particle.ty + Math.cos(time * 2 + particle.phase) * 0.35
    };
  }

  function getAnimatedChar(particle, now, locked) {
    if (locked) return particle.lockedChar;

    if (now >= particle.nextCharSwap) {
      particle.char = randomChar();
      particle.nextCharSwap = now + random(70, 260);
    }

    return particle.char;
  }

  /* =========================================================
     THEME HELPER
  ========================================================= */

  function getThemeForAI(aiName) {
    const name = String(aiName || "").toLowerCase();

    if (name.includes("claude")) return THEMES.claude;
    if (name.includes("gemini")) return THEMES.gemini;
    if (name.includes("grok")) return THEMES.grok;
    if (name.includes("copilot")) return THEMES.copilot;
    if (name.includes("deepseek")) return THEMES.deepseek;
    if (name.includes("gpt") || name.includes("chatgpt")) return THEMES.chatgpt;

    return THEMES.chatgpt;
  }

  /* =========================================================
     UTILS
  ========================================================= */

  function randomChar() {
    return CONFIG.chars[Math.floor(Math.random() * CONFIG.chars.length)];
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomSign() {
    return Math.random() > 0.5 ? 1 : -1;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(t) {
    const x = clamp(t, 0, 1);

    return x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  function hexToRgb(hex) {
    let clean = String(hex).replace("#", "").trim();

    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const number = Number.parseInt(clean, 16);

    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255
    };
  }

  function rgbaFromHex(hex, alpha = 1) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
})();
