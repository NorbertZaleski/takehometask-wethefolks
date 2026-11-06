'use strict';

const clickTag = window.clickTag || 'https://example.com/landing';
const DEBUG = new URLSearchParams(location.search).has('debug');
console.log('DEBUG =', DEBUG);

//rendering imgs at 50% of their pixel size
function halve(img) {
  img.style.width = img.naturalWidth / 2 + 'px';
  img.style.height = img.naturalHeight / 2 + 'px';
}

document.querySelectorAll('img.half').forEach(img => {
  img.complete ? halve(img) : img.addEventListener('load', () => halve(img));
});

const CONFIG = {
    //hit circle radius
    playerX: 75, playerSize: 36, playerHit: 15,
    //gravity parameters
    gravity: 1100, jump: -330, maxFall: 480,
    //playfield
    top: 72, bottom: 580,
    // difficulty ramp changes from 120 to 175
    speed0: 120, speed1: 175,
    firstX: 560, gap: 200, readyTime: 0.8,
    //hitbox collisions
    hitScale: { bac: 0.6, txt: 0.7 }
};
const ASSETS = 'assets/';
const SOUND = {
    music: ASSETS + 'Funny Game Loop.mp3',
    crash: ASSETS + 'Cartoon Crash Boing.mp3',
    fail: ASSETS + 'Fail.mp3',
    win_applause: ASSETS + 'Applause.mp3',
    win_celebrate: ASSETS + 'Celebrative Happy Woohoo Cheer 2.mp3',
};

//canvas
const W = 360, H = 640;
const stage = document.getElementById('stage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

//showscreen for changing active screen
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('show'));
  if (id) document.getElementById(id).classList.add('show');
}

//frame mask
const frameImg = loadImg('assets/border.png');

const maskCanvas = document.createElement('canvas');
maskCanvas.width = W;
maskCanvas.height = H;
const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
let maskData = null;
let maskReady = false;

function buildFrameMask() {
  maskCtx.clearRect(0, 0, W, H);
  const iw = frameImg.naturalWidth;
  const ih = frameImg.naturalHeight;
  const drawW = W;
  const drawH = ih * (W / iw);
  const drawY = H - drawH;
  maskCtx.drawImage(frameImg, 0, drawY, drawW, drawH);
  maskData = maskCtx.getImageData(0, 0, W, H).data;
  maskReady = true;

  if (DEBUG) console.log('frame mask ready, drawH =', drawH);
}

frameImg.complete && frameImg.naturalWidth
  ? buildFrameMask()
  : frameImg.addEventListener('load', buildFrameMask);

//return true if circle hits frame
function circleHitsMask(cx, cy, r, alphaThreshold = 32) {
  if (!maskReady) return false;

  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(W - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(H - 1, Math.ceil(cy + r));
  const r2 = r * r;

  for (let y = y0; y <= y1; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      if (dx * dx + dy2 > r2) continue;
      const a = maskData[(y * W + x) * 4 + 3];
      if (a > alphaThreshold) return true;
    }
  }
  return false;
}

//images
function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}
const playerImg = loadImg('assets/player.png');
const ready = img => img.complete && img.naturalWidth > 0;

const bgImg = loadImg(`assets/gameplay.png`);
let scrollX = 0;
const bgWidth = ()=> bgImg.naturalWidth * (H / bgImg.naturalHeight);

//player & movement
const START_Y = ((CONFIG.top + CONFIG.bottom) / 2) - 45;
const player = {
  y: START_Y,
  vy: 0,
  w: CONFIG.playerSize,
  h: CONFIG.playerSize
};

let started = false;
let crashed = false;
let inputLock = 0;
let firstInput = true; 
 
function onInput() {
  if (crashed) {
    if (performance.now() > inputLock) resetGame();
    return;
  }
  if (!started) {
    started = true;
    showScreen(null);
  }
  if (firstInput) {
    firstInput = false;
    return;
  }
  player.vy = CONFIG.jump;
}
addEventListener('pointerdown', onInput);
addEventListener('keydown', e => {
  if (e.code === 'Space') onInput();
});
 
function crash() {
  crashed = true;
  inputLock = performance.now() + 400;
  showScreen('fail');
}
 
function resetGame() {
  started = false;
  crashed = false;
  firstInput = false;
  scrollX = 0;
  player.y = START_Y;
  player.vy = 0;
  obstacles = [];
  showScreen('start');
}

//obstacles
const OBSTACLE_NAMES = [
  ...Array.from({ length: 6 }, (_, i) => 'bac' + (i + 1)),
  ...Array.from({ length: 9 }, (_, i) => 'txt' + (i + 1))
];
const obstacleImgs = {};
OBSTACLE_NAMES.forEach(n => { obstacleImgs[n] = loadImg(ASSETS + n + '.png'); });
const obstaclesReady = () => OBSTACLE_NAMES.every(n => ready(obstacleImgs[n]));
 
let obstacles = [];

const obstacleW = o => o.img.naturalWidth / 2;
const obstacleH = o => o.img.naturalHeight / 2;
 
function spawnObstacles() {
  const names = shuffle([...OBSTACLE_NAMES]);
  const levelW = ready(bgImg) ? bgWidth() : 2528;
  const lastX = levelW - 160;
  const step = Math.min(CONFIG.gap, (lastX - CONFIG.firstX) / (names.length - 1));
 
  obstacles = names.map((name, i) => {
    const img = obstacleImgs[name];
    const h = img.naturalHeight / 2;
    return {
      name,
      type: name.slice(0, 3),
      img,
      x: CONFIG.firstX + i * step,
      y: rand(CONFIG.top + 10, floorY - h - 10)
    };
  });
}

//helpers
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

//collisions
const frame = document.querySelector('.frame');
let floorY = CONFIG.bottom;

function updateFloor() {
  if (frame && frame.offsetHeight && frame.offsetHeight < H * 0.5) {
    floorY = H - frame.offsetHeight;
  } else {
    floorY = CONFIG.bottom;
  }
}

function getPlayerCircle() {
  return { cx: CONFIG.playerX, cy: player.y, r: CONFIG.playerHit };
}
 
function getObstacleRect(o) {
  const s = CONFIG.hitScale[o.type] ?? 1;
  const fullW = obstacleW(o), fullH = obstacleH(o);
  const w = fullW * s, h = fullH * s;
  return { x: o.x + (fullW - w) / 2, y: o.y + (fullH - h) / 2, w, h };
}
 
function circleHitsRect(c, r) {
  const nx = Math.max(r.x, Math.min(c.cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(c.cy, r.y + r.h));
  const dx = c.cx - nx, dy = c.cy - ny;
  return dx * dx + dy * dy < c.r * c.r;
}

function checkCollisions() {
  const c = getPlayerCircle();
  //collision with frame
  if (circleHitsMask(c.cx, c.cy, c.r)) return true;

  //collision with playfield
  if (c.cy - c.r < CONFIG.top || c.cy + c.r > floorY) return true;

  //collision with obstacles
  const world = { cx: c.cx + scrollX, cy: c.cy, r: c.r };
  return obstacles.some(o => circleHitsRect(world, getObstacleRect(o)));
}

//update
function update(dt) {
  if (!obstacles.length && obstaclesReady()) spawnObstacles();
  if (!started || crashed) return;

  if (ready(bgImg)) {
    const maxScroll = bgWidth() - W;
    const speed = lerp(CONFIG.speed0, CONFIG.speed1, scrollX / maxScroll);
    scrollX = Math.min(scrollX + speed * dt, maxScroll); 
  }

  player.vy = Math.min(player.vy + CONFIG.gravity * dt, CONFIG.maxFall);
  player.y += player.vy * dt;

  if (checkCollisions()) crash();
}

//render
function drawObstacles() {
  obstacles.forEach(o => {
    const x = o.x - scrollX;
    const w = obstacleW(o), h = obstacleH(o);
    if (x > W || x + w < 0) return;
    ctx.drawImage(o.img, x, o.y, w, h);
  });
}

function drawDebugObstacles() {
  obstacles.forEach(o => {
    const x = o.x - scrollX;
    if (x > W || x + obstacleW(o) < 0) return;
    ctx.strokeStyle = 'rgba(255,0,0,0.3)';
    ctx.strokeRect(x, o.y, obstacleW(o), obstacleH(o));
 
    const r = getObstacleRect(o);
    ctx.strokeStyle = o.type === 'bac' ? 'red' : 'orange';
    ctx.strokeRect(r.x - scrollX, r.y, r.w, r.h);
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  if (ready(bgImg)) ctx.drawImage(bgImg, -scrollX, 0, bgWidth(), H);

  drawObstacles();

  const s = CONFIG.playerSize;
  ctx.drawImage(playerImg, CONFIG.playerX - s / 2, player.y - s / 2, s, s);
 
  if (DEBUG) {
    drawDebugObstacles();
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(CONFIG.playerX, player.y, CONFIG.playerHit, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'cyan';
    ctx.beginPath();
    ctx.moveTo(0, floorY); ctx.lineTo(W, floorY);
    ctx.moveTo(0, CONFIG.top); ctx.lineTo(W, CONFIG.top);
    ctx.stroke();
  }
}

//game loop
let last = performance.now();
 
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
 
  update(dt);
  render();
 
  requestAnimationFrame(loop);
}
 
requestAnimationFrame(loop);