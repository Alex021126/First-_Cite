const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const immersiveBtn = document.getElementById("immersive-btn");
const orientationNote = document.getElementById("orientation-note");

const WORLD = { width: 960, height: 600 };
const POINTER = { x: 0, y: 0, active: false, id: null };
const PAD = { x: 108, y: WORLD.height - 108, r: 74, knob: 28 };
const PULSE_BTN = { x: WORLD.width - 108, y: WORLD.height - 108, r: 54 };

let lastFrame = 0;
let animationFrame = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function makePlayer() {
  return {
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    vx: 0,
    vy: 0,
    radius: 16,
    speed: 280,
    hp: 3,
    invulnerable: 0,
    pulseCooldown: 0,
    trail: []
  };
}

const state = {
  mode: "start",
  timeLeft: 75,
  score: 0,
  targetScore: 12,
  combo: 0,
  comboTimer: 0,
  slowTime: 0,
  spawnTimer: 0,
  message: "Collect 12 shards and survive the storm.",
  player: makePlayer(),
  hazards: [],
  shards: [],
  particles: [],
  touchMoveId: null,
  touchMoveVector: { x: 0, y: 0, strength: 0 },
  targetPoint: null,
  keys: Object.create(null)
};

function resizeCanvas() {
  const maxWidth = window.innerWidth - (window.innerWidth < 720 ? 16 : 32);
  const maxHeight = window.innerHeight - (window.innerWidth < 720 ? 16 : 32);
  const upscaleCap = window.innerWidth < 720 ? 1 : 1.28;
  const scale = Math.min(maxWidth / WORLD.width, maxHeight / WORLD.height, upscaleCap);
  canvas.width = WORLD.width;
  canvas.height = WORLD.height;
  canvas.style.width = `${WORLD.width * scale}px`;
  canvas.style.height = `${WORLD.height * scale}px`;
}

function isPhoneSized() {
  return Math.min(window.innerWidth, window.innerHeight) < 820;
}

function shouldSuggestLandscape() {
  return isPhoneSized() && window.innerHeight > window.innerWidth;
}

function fullscreenElementActive() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement;
}

async function requestAnyFullscreen(target) {
  const node = target || canvas;
  const root = document.documentElement;

  if (node.requestFullscreen) {
    return node.requestFullscreen();
  }
  if (root.requestFullscreen) {
    return root.requestFullscreen();
  }
  if (node.webkitRequestFullscreen) {
    return node.webkitRequestFullscreen();
  }
  if (node.webkitEnterFullscreen) {
    return node.webkitEnterFullscreen();
  }
  if (root.webkitRequestFullscreen) {
    return root.webkitRequestFullscreen();
  }
  return Promise.reject(new Error("fullscreen unsupported"));
}

async function exitAnyFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  }
  if (document.webkitCancelFullScreen) {
    return document.webkitCancelFullScreen();
  }
  return Promise.resolve();
}

async function requestLandscapeMode() {
  try {
    if (!fullscreenElementActive()) {
      await requestAnyFullscreen(canvas);
    }
  } catch {}

  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch {}

  updateOrientationUI();
}

function updateOrientationUI() {
  if (immersiveBtn) {
    immersiveBtn.textContent = fullscreenElementActive() ? "Exit Full" : "Fullscreen";
  }

  if (!orientationNote) {
    return;
  }

  if (shouldSuggestLandscape()) {
    orientationNote.textContent = "Rotate your phone or tap Fullscreen for the widest arena view.";
    orientationNote.classList.add("visible");
  } else {
    orientationNote.classList.remove("visible");
  }
}

function roundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function overlayMetrics() {
  const compact = window.innerWidth < 720;
  return compact
    ? {
        x: 150,
        y: 118,
        width: 660,
        height: 312,
        buttonX: 330,
        buttonY: 352,
        buttonWidth: 280,
        buttonHeight: 54
      }
    : {
        x: 210,
        y: 126,
        width: 540,
        height: 286,
        buttonX: 360,
        buttonY: 340,
        buttonWidth: 240,
        buttonHeight: 52
      };
}

function resetGame() {
  state.mode = "playing";
  state.timeLeft = 75;
  state.score = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.slowTime = 0;
  state.spawnTimer = 12;
  state.message = "Storm live. Grab shards and pulse away drones.";
  state.player = makePlayer();
  state.hazards = [];
  state.shards = [];
  state.particles = [];
  state.touchMoveVector = { x: 0, y: 0, strength: 0 };
  state.targetPoint = null;

  for (let i = 0; i < 5; i += 1) {
    state.hazards.push(spawnHazard(true));
  }
  for (let i = 0; i < 3; i += 1) {
    state.shards.push(spawnShard());
  }
}

function spawnHazard(initial = false) {
  const edge = randInt(0, 3);
  const hazard = {
    x: edge === 0 ? rand(40, WORLD.width - 40) : edge === 1 ? WORLD.width + 30 : edge === 2 ? rand(40, WORLD.width - 40) : -30,
    y: edge === 0 ? -30 : edge === 1 ? rand(40, WORLD.height - 40) : edge === 2 ? WORLD.height + 30 : rand(40, WORLD.height - 40),
    vx: rand(-100, 100),
    vy: rand(-100, 100),
    radius: rand(18, 34),
    hue: randInt(10, 40)
  };
  if (initial) {
    hazard.x = rand(80, WORLD.width - 80);
    hazard.y = rand(80, WORLD.height - 80);
  }
  if (Math.hypot(hazard.vx, hazard.vy) < 90) {
    const dir = normalize(rand(-1, 1), rand(-1, 1));
    hazard.vx = dir.x * rand(90, 150);
    hazard.vy = dir.y * rand(90, 150);
  }
  return hazard;
}

function spawnShard() {
  let shard;
  do {
    shard = {
      x: rand(90, WORLD.width - 90),
      y: rand(90, WORLD.height - 130),
      radius: 11,
      angle: rand(0, Math.PI * 2),
      hue: randInt(160, 190)
    };
  } while (distance(shard, state.player) < 120);
  return shard;
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-120, 120),
      vy: rand(-120, 120),
      life: rand(0.4, 0.9),
      size: rand(2, 6),
      color
    });
  }
}

function activatePulse() {
  if (state.mode !== "playing" || state.player.pulseCooldown > 0) {
    return false;
  }
  state.player.pulseCooldown = 4;
  state.slowTime = 1.25;
  state.message = "Pulse fired. Drones pushed back.";
  addParticles(state.player.x, state.player.y, "rgba(142, 255, 233, 0.9)", 24);

  for (const hazard of state.hazards) {
    const dx = hazard.x - state.player.x;
    const dy = hazard.y - state.player.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < 240) {
      const push = (240 - dist) * 4.5;
      hazard.vx += (dx / dist) * push;
      hazard.vy += (dy / dist) * push;
    }
  }
  return true;
}

function setModePause(paused) {
  if (state.mode === "playing" && paused) {
    state.mode = "paused";
    state.message = "Paused";
  } else if (state.mode === "paused" && !paused) {
    state.mode = "playing";
    state.message = "Back in the storm.";
  }
}

function handleActionButton(x, y) {
  if (Math.hypot(x - PULSE_BTN.x, y - PULSE_BTN.y) <= PULSE_BTN.r) {
    activatePulse();
    return true;
  }
  return false;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = WORLD.width / rect.width;
  const scaleY = WORLD.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function beginPointerControl(event) {
  const point = canvasPoint(event);
  POINTER.x = point.x;
  POINTER.y = point.y;
  POINTER.active = true;

  if (state.mode === "start" || state.mode === "gameover" || state.mode === "win") {
    if (event.pointerType === "touch") {
      requestLandscapeMode();
    }
    resetGame();
    return;
  }

  if (state.mode === "paused") {
    setModePause(false);
    return;
  }

  if (handleActionButton(point.x, point.y)) {
    return;
  }

  const withinPad = Math.hypot(point.x - PAD.x, point.y - PAD.y) <= PAD.r + 20;
  if (event.pointerType === "touch" && withinPad && state.touchMoveId === null) {
    state.touchMoveId = event.pointerId;
    updateTouchVector(point);
    return;
  }

  state.targetPoint = point;
  POINTER.id = event.pointerId;
}

function updateTouchVector(point) {
  const dx = point.x - PAD.x;
  const dy = point.y - PAD.y;
  const magnitude = Math.min(Math.hypot(dx, dy), PAD.r);
  const direction = magnitude === 0 ? { x: 0, y: 0 } : normalize(dx, dy);
  state.touchMoveVector = {
    x: direction.x,
    y: direction.y,
    strength: magnitude / PAD.r
  };
}

function movePointerControl(event) {
  const point = canvasPoint(event);
  POINTER.x = point.x;
  POINTER.y = point.y;

  if (event.pointerId === state.touchMoveId) {
    updateTouchVector(point);
    return;
  }

  if (event.pointerId === POINTER.id) {
    state.targetPoint = point;
  }
}

function endPointerControl(event) {
  if (event.pointerId === state.touchMoveId) {
    state.touchMoveId = null;
    state.touchMoveVector = { x: 0, y: 0, strength: 0 };
  }

  if (event.pointerId === POINTER.id) {
    POINTER.id = null;
    state.targetPoint = null;
  }

  POINTER.active = false;
}

function keyboardVector() {
  const x = (pressed("ArrowRight", "arrowright") || pressed("KeyD", "d") ? 1 : 0) - (pressed("ArrowLeft", "arrowleft") || pressed("KeyA", "a") ? 1 : 0);
  const y = (pressed("ArrowDown", "arrowdown") || pressed("KeyS", "s") ? 1 : 0) - (pressed("ArrowUp", "arrowup") || pressed("KeyW", "w") ? 1 : 0);
  if (!x && !y) {
    return { x: 0, y: 0, strength: 0 };
  }
  const unit = normalize(x, y);
  return { x: unit.x, y: unit.y, strength: 1 };
}

function desiredMovement() {
  const keyMove = keyboardVector();
  if (keyMove.strength > 0) {
    return keyMove;
  }
  if (state.touchMoveVector.strength > 0) {
    return state.touchMoveVector;
  }
  if (state.targetPoint) {
    const dx = state.targetPoint.x - state.player.x;
    const dy = state.targetPoint.y - state.player.y;
    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 12) {
      const unit = normalize(dx, dy);
      return {
        x: unit.x,
        y: unit.y,
        strength: clamp(magnitude / 160, 0.25, 1)
      };
    }
  }
  return { x: 0, y: 0, strength: 0 };
}

function collectShard(index) {
  const shard = state.shards[index];
  const fastPickup = state.comboTimer > 0;
  state.combo = fastPickup ? state.combo + 1 : 1;
  state.comboTimer = 3;
  state.score += 1;
  state.message = fastPickup ? `Combo x${state.combo}` : "Shard secured.";
  addParticles(shard.x, shard.y, "rgba(115, 248, 247, 0.95)", 14);
  state.shards.splice(index, 1);
  state.shards.push(spawnShard());
  if (state.score >= state.targetScore) {
    state.mode = "win";
    state.message = "Run complete.";
  }
}

function hitPlayer(hazard) {
  if (state.player.invulnerable > 0) {
    return;
  }
  state.player.hp -= 1;
  state.player.invulnerable = 1.5;
  const away = normalize(state.player.x - hazard.x, state.player.y - hazard.y);
  state.player.vx += away.x * 280;
  state.player.vy += away.y * 280;
  state.message = state.player.hp > 0 ? "Hull breach. Keep moving." : "Runner lost.";
  addParticles(state.player.x, state.player.y, "rgba(255, 146, 120, 0.9)", 20);
  if (state.player.hp <= 0) {
    state.mode = "gameover";
  }
}

function update(dt) {
  const step = state.slowTime > 0 ? dt * 0.45 : dt;

  if (state.mode !== "playing") {
    updateParticles(dt);
    render();
    return;
  }

  state.timeLeft -= dt;
  state.comboTimer = Math.max(0, state.comboTimer - dt);
  state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
  state.player.pulseCooldown = Math.max(0, state.player.pulseCooldown - dt);
  state.slowTime = Math.max(0, state.slowTime - dt);
  state.spawnTimer -= dt;
  if (state.comboTimer === 0) {
    state.combo = 0;
  }

  if (state.spawnTimer <= 0) {
    state.spawnTimer = clamp(13 - state.score * 0.45, 6.5, 13);
    state.hazards.push(spawnHazard());
  }

  const move = desiredMovement();
  const targetVx = move.x * state.player.speed * move.strength;
  const targetVy = move.y * state.player.speed * move.strength;
  state.player.vx = lerp(state.player.vx, targetVx, 0.18);
  state.player.vy = lerp(state.player.vy, targetVy, 0.18);
  state.player.x += state.player.vx * step;
  state.player.y += state.player.vy * step;
  state.player.x = clamp(state.player.x, 24, WORLD.width - 24);
  state.player.y = clamp(state.player.y, 24, WORLD.height - 24);
  state.player.trail.push({ x: state.player.x, y: state.player.y, life: 0.45 });
  if (state.player.trail.length > 18) {
    state.player.trail.shift();
  }

  for (const echo of state.player.trail) {
    echo.life -= dt;
  }
  state.player.trail = state.player.trail.filter((echo) => echo.life > 0);

  for (const hazard of state.hazards) {
    hazard.x += hazard.vx * step;
    hazard.y += hazard.vy * step;

    if (hazard.x < hazard.radius || hazard.x > WORLD.width - hazard.radius) {
      hazard.vx *= -1;
      hazard.x = clamp(hazard.x, hazard.radius, WORLD.width - hazard.radius);
    }
    if (hazard.y < hazard.radius || hazard.y > WORLD.height - hazard.radius) {
      hazard.vy *= -1;
      hazard.y = clamp(hazard.y, hazard.radius, WORLD.height - hazard.radius);
    }

    const drift = normalize(state.player.x - hazard.x, state.player.y - hazard.y);
    hazard.vx += drift.x * 6 * dt;
    hazard.vy += drift.y * 6 * dt;
    const maxSpeed = 170 + state.score * 7;
    const speed = Math.hypot(hazard.vx, hazard.vy);
    if (speed > maxSpeed) {
      hazard.vx = (hazard.vx / speed) * maxSpeed;
      hazard.vy = (hazard.vy / speed) * maxSpeed;
    }

    if (Math.hypot(hazard.x - state.player.x, hazard.y - state.player.y) < hazard.radius + state.player.radius) {
      hitPlayer(hazard);
    }
  }

  for (let i = state.shards.length - 1; i >= 0; i -= 1) {
    const shard = state.shards[i];
    shard.angle += dt * 3;
    if (Math.hypot(shard.x - state.player.x, shard.y - state.player.y) < shard.radius + state.player.radius + 4) {
      collectShard(i);
    }
  }

  updateParticles(dt);

  if (state.timeLeft <= 0 && state.mode === "playing") {
    state.mode = state.score >= state.targetScore ? "win" : "gameover";
    state.message = state.mode === "win" ? "Run complete." : "Storm closed in.";
  }

  render();
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, "#17304d");
  gradient.addColorStop(1, "#0a1320");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const glow = ctx.createRadialGradient(WORLD.width * 0.5, WORLD.height * 0.2, 50, WORLD.width * 0.5, WORLD.height * 0.2, 340);
  glow.addColorStop(0, "rgba(105, 186, 255, 0.18)");
  glow.addColorStop(1, "rgba(105, 186, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const trailGlow = ctx.createRadialGradient(WORLD.width * 0.84, WORLD.height * 0.72, 10, WORLD.width * 0.84, WORLD.height * 0.72, 220);
  trailGlow.addColorStop(0, "rgba(117, 255, 219, 0.13)");
  trailGlow.addColorStop(1, "rgba(117, 255, 219, 0)");
  ctx.fillStyle = trailGlow;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = "rgba(158, 214, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 40; x < WORLD.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD.height);
    ctx.stroke();
  }
  for (let y = 40; y < WORLD.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD.width, y);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i += 1) {
    const px = (i * 97) % WORLD.width;
    const py = (i * 53) % WORLD.height;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(px, py, 2, 2);
  }

  ctx.strokeStyle = "rgba(126, 214, 255, 0.1)";
  ctx.lineWidth = 2;
  roundedRect(12, 12, WORLD.width - 24, WORLD.height - 24, 26);
  ctx.stroke();
}

function drawHud() {
  roundedRect(20, 18, 214, 88, 20);
  const leftHud = ctx.createLinearGradient(20, 18, 234, 106);
  leftHud.addColorStop(0, "rgba(6, 18, 32, 0.82)");
  leftHud.addColorStop(1, "rgba(9, 28, 45, 0.58)");
  ctx.fillStyle = leftHud;
  ctx.fill();
  roundedRect(WORLD.width - 244, 18, 224, 88, 20);
  const rightHud = ctx.createLinearGradient(WORLD.width - 244, 18, WORLD.width - 20, 106);
  rightHud.addColorStop(0, "rgba(6, 18, 32, 0.8)");
  rightHud.addColorStop(1, "rgba(9, 28, 45, 0.56)");
  ctx.fillStyle = rightHud;
  ctx.fill();

  ctx.fillStyle = "#f6f0dd";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.fillText(`Shards ${state.score}/${state.targetScore}`, 36, 46);
  ctx.fillText(`Time ${Math.ceil(state.timeLeft)}`, 36, 72);
  ctx.fillText(`HP ${state.player.hp}`, 36, 98);

  ctx.textAlign = "right";
  ctx.fillText(`Pulse ${state.player.pulseCooldown > 0 ? state.player.pulseCooldown.toFixed(1) + "s" : "READY"}`, WORLD.width - 34, 46);
  ctx.fillText(`Combo ${state.combo > 1 ? "x" + state.combo : "-"}`, WORLD.width - 34, 72);
  ctx.fillText(state.slowTime > 0 ? "Slow field live" : "Pulse clears space", WORLD.width - 34, 98);
  ctx.textAlign = "left";

  if (state.message) {
    roundedRect(276, WORLD.height - 54, 408, 34, 16);
    ctx.fillStyle = "rgba(7, 16, 25, 0.58)";
    ctx.fill();
    ctx.fillStyle = "#d9f8ff";
    ctx.font = "15px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(state.message, WORLD.width / 2, WORLD.height - 31);
    ctx.textAlign = "left";
  }
}

function drawPlayer() {
  for (const echo of state.player.trail) {
    ctx.globalAlpha = echo.life / 0.45 * 0.32;
    ctx.fillStyle = "#8ef2ff";
    ctx.beginPath();
    ctx.arc(echo.x, echo.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(state.player.x, state.player.y);
  const angle = Math.atan2(state.player.vy || 0.001, state.player.vx || 1);
  ctx.rotate(angle);
  ctx.fillStyle = state.player.invulnerable > 0 ? "#ffd0b0" : "#f4f1e9";
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, -11);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#56daf2";
  ctx.beginPath();
  ctx.arc(-12, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (state.player.pulseCooldown > 3.6) {
    ctx.strokeStyle = "rgba(143, 255, 230, 0.45)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 54 + (4 - state.player.pulseCooldown) * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHazards() {
  for (const hazard of state.hazards) {
    const gradient = ctx.createRadialGradient(hazard.x - 6, hazard.y - 8, 4, hazard.x, hazard.y, hazard.radius);
    gradient.addColorStop(0, `hsla(${hazard.hue}, 88%, 68%, 0.95)`);
    gradient.addColorStop(1, `hsla(${hazard.hue}, 88%, 34%, 0.82)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 216, 186, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawShards() {
  for (const shard of state.shards) {
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.angle);
    ctx.strokeStyle = `hsla(${shard.hue}, 95%, 74%, 0.95)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = clamp(particle.life, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTouchControls() {
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2);
  ctx.stroke();

  const knobX = PAD.x + state.touchMoveVector.x * PAD.r * state.touchMoveVector.strength;
  const knobY = PAD.y + state.touchMoveVector.y * PAD.r * state.touchMoveVector.strength;
  ctx.fillStyle = "rgba(133, 227, 255, 0.22)";
  ctx.beginPath();
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(173, 242, 255, 0.72)";
  ctx.beginPath();
  ctx.arc(knobX, knobY, PAD.knob, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = state.player.pulseCooldown > 0 ? "rgba(255, 200, 160, 0.2)" : "rgba(129, 255, 223, 0.24)";
  ctx.beginPath();
  ctx.arc(PULSE_BTN.x, PULSE_BTN.y, PULSE_BTN.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.beginPath();
  ctx.arc(PULSE_BTN.x, PULSE_BTN.y, PULSE_BTN.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f6f0dd";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("PULSE", PULSE_BTN.x, PULSE_BTN.y + 6);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

function drawOverlay(title, subtitle, buttonLabel) {
  const overlay = overlayMetrics();

  roundedRect(overlay.x, overlay.y, overlay.width, overlay.height, 24);
  const panelGradient = ctx.createLinearGradient(overlay.x, overlay.y, overlay.x + overlay.width, overlay.y + overlay.height);
  panelGradient.addColorStop(0, "rgba(4, 10, 18, 0.78)");
  panelGradient.addColorStop(1, "rgba(6, 20, 34, 0.68)");
  ctx.fillStyle = panelGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(155, 224, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#7be9fb";
  ctx.textAlign = "center";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText("SURVIVAL RUN", WORLD.width / 2, overlay.y + 38);

  ctx.fillStyle = "#f6f0dd";
  ctx.font = "bold 44px Trebuchet MS";
  ctx.fillText(title, WORLD.width / 2, overlay.y + 96);
  ctx.font = "20px Trebuchet MS";
  ctx.fillStyle = "#d1e8ff";
  ctx.fillText(subtitle, WORLD.width / 2, overlay.y + 132);

  const badges = [
    { label: "MOVE", text: "WASD / drag pad" },
    { label: "PULSE", text: "Space / right button" },
    { label: "GOAL", text: "Collect 12 shards" }
  ];
  const badgeY = overlay.y + 168;
  badges.forEach((badge, index) => {
    const badgeWidth = 148;
    const gap = 14;
    const totalWidth = badgeWidth * badges.length + gap * (badges.length - 1);
    const x = WORLD.width / 2 - totalWidth / 2 + index * (badgeWidth + gap);
    roundedRect(x, badgeY, badgeWidth, 58, 16);
    ctx.fillStyle = "rgba(19, 41, 67, 0.76)";
    ctx.fill();
    ctx.fillStyle = "#8ef3df";
    ctx.font = "bold 13px Trebuchet MS";
    ctx.fillText(badge.label, x + badgeWidth / 2, badgeY + 21);
    ctx.fillStyle = "#f0f5ff";
    ctx.font = "15px Trebuchet MS";
    ctx.fillText(badge.text, x + badgeWidth / 2, badgeY + 42);
  });

  ctx.fillStyle = "#8ef3df";
  ctx.font = "bold 20px Trebuchet MS";
  ctx.fillText(buttonLabel, WORLD.width / 2, overlay.buttonY + 34);
  ctx.textAlign = "left";

  if (shouldSuggestLandscape()) {
    ctx.fillStyle = "rgba(217, 248, 255, 0.78)";
    ctx.font = "15px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Best on mobile in fullscreen landscape.", WORLD.width / 2, overlay.y + overlay.height - 18);
    ctx.textAlign = "left";
  }
}

function render() {
  drawBackground();
  drawShards();
  drawHazards();
  drawParticles();
  drawPlayer();

  if (state.mode !== "start") {
    drawHud();
  }

  if (state.mode === "playing" || state.mode === "paused") {
    drawTouchControls();
  }

  if (state.mode === "start") {
    drawOverlay("Pulse Runner", "A compact survival run built for desktop and mobile.", "Tap Anywhere");
  } else if (state.mode === "paused") {
    drawOverlay("Paused", "Tap or press P to resume.", "Resume");
  } else if (state.mode === "gameover") {
    drawOverlay("Run Failed", "Storm took the lane. Tap anywhere to try again.", "Tap Anywhere");
  } else if (state.mode === "win") {
    drawOverlay("Run Complete", "All shards secured before the storm closed in. Tap anywhere to play again.", "Tap Anywhere");
  }
}

function frame(timestamp) {
  if (!lastFrame) {
    lastFrame = timestamp;
  }
  const delta = clamp((timestamp - lastFrame) / 1000, 0, 0.033);
  lastFrame = timestamp;
  update(delta);
  animationFrame = requestAnimationFrame(frame);
}

function toggleFullscreen() {
  if (fullscreenElementActive()) {
    exitAnyFullscreen().catch(() => {});
    return;
  }
  requestAnyFullscreen(canvas).catch(() => {});
}

function pressed(code, key) {
  return Boolean(state.keys[code] || state.keys[key]);
}

function normalizeKeyName(key) {
  return typeof key === "string" ? key.toLowerCase() : key;
}

function setKeyState(event, nextState) {
  const key = normalizeKeyName(event.key);
  state.keys[key] = nextState;
  state.keys[event.code] = nextState;
}

function renderGameToText() {
  return JSON.stringify({
    coordinateSystem: "origin top-left; +x right; +y down",
    mode: state.mode,
    timer: Number(state.timeLeft.toFixed(2)),
    score: state.score,
    targetScore: state.targetScore,
    combo: state.combo,
    message: state.message,
    player: {
      x: Number(state.player.x.toFixed(1)),
      y: Number(state.player.y.toFixed(1)),
      vx: Number(state.player.vx.toFixed(1)),
      vy: Number(state.player.vy.toFixed(1)),
      hp: state.player.hp,
      pulseCooldown: Number(state.player.pulseCooldown.toFixed(2)),
      invulnerable: Number(state.player.invulnerable.toFixed(2))
    },
    hazards: state.hazards.slice(0, 8).map((hazard) => ({
      x: Number(hazard.x.toFixed(1)),
      y: Number(hazard.y.toFixed(1)),
      radius: Number(hazard.radius.toFixed(1)),
      speed: Number(Math.hypot(hazard.vx, hazard.vy).toFixed(1))
    })),
    shards: state.shards.map((shard) => ({
      x: Number(shard.x.toFixed(1)),
      y: Number(shard.y.toFixed(1))
    })),
    controls: {
      keyboard: "WASD/arrows to move, space to pulse, p to pause, f for fullscreen",
      touch: "drag left pad to move, tap pulse button to pulse"
    },
    orientationHint: shouldSuggestLandscape()
  });
}

function advanceTime(ms) {
  const stepMs = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / stepMs));
  for (let i = 0; i < steps; i += 1) {
    update(1 / 60);
  }
}

window.render_game_to_text = renderGameToText;
window.advanceTime = advanceTime;

window.addEventListener("resize", resizeCanvas);
document.addEventListener("fullscreenchange", resizeCanvas);
document.addEventListener("fullscreenchange", updateOrientationUI);
window.addEventListener("orientationchange", updateOrientationUI);
window.addEventListener("resize", updateOrientationUI);

immersiveBtn?.addEventListener("click", async () => {
  if (fullscreenElementActive()) {
    try {
      await exitAnyFullscreen();
    } catch {}
    updateOrientationUI();
    return;
  }
  requestLandscapeMode();
});

window.addEventListener("keydown", (event) => {
  const key = normalizeKeyName(event.key);
  setKeyState(event, true);

  if (key === " " || key === "spacebar") {
    event.preventDefault();
    if (state.mode === "start" || state.mode === "gameover" || state.mode === "win") {
      resetGame();
    } else {
      activatePulse();
    }
  }
  if (key === "enter" && (state.mode === "start" || state.mode === "gameover" || state.mode === "win")) {
    resetGame();
  }
  if (key === "p" && !event.repeat) {
    if (state.mode === "playing") {
      setModePause(true);
    } else if (state.mode === "paused") {
      setModePause(false);
    }
  }
  if (key === "f") {
    toggleFullscreen();
  }
  if (key === "escape" && document.fullscreenElement) {
    exitAnyFullscreen().catch(() => {});
  }
});

window.addEventListener("keyup", (event) => {
  setKeyState(event, false);
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  beginPointerControl(event);
});
canvas.addEventListener("pointermove", movePointerControl);
canvas.addEventListener("pointerup", endPointerControl);
canvas.addEventListener("pointercancel", endPointerControl);

resizeCanvas();
updateOrientationUI();
render();
animationFrame = requestAnimationFrame(frame);
