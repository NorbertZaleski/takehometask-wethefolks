'use strict';

const clickTag = window.clickTag || 'https://example.com/landing';
const DEBUG = new URLSearchParams(location.search).has('debug');
const W = 360, H = 640;
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

//setting up stage and canvas
const stage = document.getElementById('stage');
const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');

//rendering imgs at 50% of their pixel size
function halve(img) {
  img.style.width = img.naturalWidth / 2 + 'px';
  img.style.height = img.naturalHeight / 2 + 'px';
}

document.querySelectorAll('img.half').forEach(img => {
  img.complete ? halve(img) : img.addEventListener('load', () => halve(img));
});