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
    playerX: 90, playerSize: 36, playerHit: 10,
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

//images
function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}
const playerImg = loadImg('assets/player.png');
const ready = img => img.complete && img.naturalWidth > 0;

 //player & movement
const player = {
  y: (CONFIG.top + CONFIG.bottom) / 2,
  vy: 0,
  w: CONFIG.playerSize,
  h: CONFIG.playerSize
};
 
function jump() {
  started = true;
  player.vy = CONFIG.jump;
}
addEventListener('pointerdown', jump);
addEventListener('keydown', e => {
  if (e.code === 'Space') jump();
});

let started = false;

//update
function update(dt) {
  if (!started) return;
  player.vy = Math.min(player.vy + CONFIG.gravity * dt, CONFIG.maxFall);
  player.y += player.vy * dt;
}

//render
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  const s = CONFIG.playerSize;
  ctx.drawImage(playerImg, CONFIG.playerX - s / 2, player.y - s / 2, s, s);
 
  if (DEBUG) {
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(CONFIG.playerX, player.y, CONFIG.playerHit, 0, Math.PI * 2);
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