var clickTag = 'https://www.example.com/';

(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tl;

  function has(sel) { return document.querySelector(sel); }
  function add(sel, from, to, pos) { if (has(sel)) tl.fromTo(sel, from, to, pos); }

  function build() {
    tl = gsap.timeline({ paused: true });

    add('.veil', { opacity: .6 }, { opacity: 0, duration: 1.9, ease: 'power1.out' }, 0);

    if (has('.logo')) gsap.set('.logo', { transformOrigin: '160px 125px' });
    if (has('.box'))  gsap.set('.box',  { transformOrigin: '160px 85px' });
    add('.logo', { opacity: 0, scale: .8 },       { opacity: 1, scale: 1, duration: .9, ease: 'expo.out' }, .5);
    add('.left .prod',  { opacity: 0, x: -120, y: 820, rotation: -16 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.9, ease: 'expo.out' }, .9);
    add('.right .prod', { opacity: 0, x: 380,  y: 70,  rotation: 9 },   { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.8, ease: 'expo.out' }, 1.3);
    add('.box',  { opacity: 0, scaleY: .25 },     { opacity: 1, scaleY: 1, duration: .8, ease: 'expo.out' }, 2.7);
    add('.copy', { opacity: 0, y: 16 },           { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }, 3.1);
    add('.cta',  { opacity: 0, scale: .7 },       { opacity: 1, scale: 1, duration: .7, ease: 'back.out(2)' }, 3.75);

    if (has('.cta img')) {
      tl.fromTo('.cta img', { scale: 1 },
        { scale: 1.045, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 17 }, 5.2);
    }

    add('.h1', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' }, 1.0);
    add('.h2', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' }, 1.45);
    add('.h3', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' }, 1.9);
  }

  window.fireplace = {
    play: function () {
      if (reduce) return;
      if (!tl) build();
      tl.restart();
    },
    debug: function (on) { document.documentElement.classList.toggle('dbg', !!on); }
  };
})();

(function () {
  var de = document.documentElement;
  var framed = window.parent !== window;
  var started = false;
  var ready = {};
  var ids = ['left', 'top', 'right'];
  var T;

  de.className = 'js';

  function win(p) { return document.getElementById('f-' + p).contentWindow; }

  function startAll() {
    clearTimeout(T);
    ids.forEach(function (p) { win(p).postMessage({ type: 'fireplace:start' }, '*'); });
  }

  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (e.source === window.parent) {
      if (d.type === 'fireplace:start') { started = true; fireplace.play(); }
      if (d.type === 'fireplace:debug') fireplace.debug(d.on);
    } else if (d.type === 'fireplace:ready' && document.getElementById('replay')) {
      ready[d.part] = 1;
      if (ids.every(function (p) { return ready[p]; })) startAll();
    }
  });

  window.addEventListener('load', function () {
    var parts = document.querySelectorAll('.part');

    if (document.getElementById('replay')) {
      var wrap = document.getElementById('wrap'), stage = document.getElementById('stage');
      T = setTimeout(startAll, 3500);
      document.getElementById('replay').onclick = startAll;
      document.getElementById('dbg').onchange = function () {
        var on = this.checked;
        ids.forEach(function (p) { win(p).postMessage({ type: 'fireplace:debug', on: on }, '*'); });
      };
      var fit = function () {
        var s = Math.min(1, (innerWidth - 20) / 1680);
        stage.style.transform = 'scale(' + s + ')';
        wrap.style.width = 1680 * s + 'px';
        wrap.style.height = 975 * s + 'px';
      };
      addEventListener('resize', fit); fit();
      return;
    }

    for (var i = 0; i < parts.length; i++) parts[i].href = clickTag;
    if (/[?&]debug=1/.test(location.search)) fireplace.debug(true);

    if (framed) {
      var name = 'part';
      ['left', 'top', 'right'].forEach(function (n) { if (parts[0] && parts[0].classList.contains(n)) name = n; });
      parent.postMessage({ type: 'fireplace:ready', part: name }, '*');
      setTimeout(function () { if (!started) fireplace.play(); }, 4000);
    } else {
      fireplace.play();
    }
  });
})();