/* V1 landing page behaviour (loads after landing.js and tracks.js).
   Small stand-ins for the staging build's Stimulus controllers: grants ticker,
   "How a community foundation works" scroll story, film controls, hide-on-scroll
   header, and the "Tell us which one sounds like you" doors. */
(function(){
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Doors: same destinations as the full prototype ---------- */
  window.v1Door = function(){
    var pick = document.querySelector('input[name="door"]:checked');
    var v = pick ? pick.value : 'community';
    if (v === 'community') beginRegistration('community');
    else if (v === 'advisor') beginRegistration('advisor');
    else if (v === 'nonprofit') openPopup('nonprofit');
    else openPopup('login');
  };

  /* ---------- 2026 grants ticker (light theme) ---------- */
  var HUES = ['hue-orange','hue-aqua','hue-red','hue-pink','hue-blue'];
  var track = document.getElementById('v1Ticker');
  if (track && typeof TICKER_GRANTS !== 'undefined'){
    var items = TICKER_GRANTS.map(function(g, i){
      return '<li class="flex items-baseline gap-2 whitespace-nowrap px-6 py-4 text-sm">'
        + '<span class="ticker__square ' + HUES[i % HUES.length] + ' mr-2 self-center" aria-hidden="true"></span>'
        + '<span>' + g[1] + '</span><span class="font-bold text-mid-green">' + g[0] + '</span></li>';
    }).join('');
    track.innerHTML = '<ul class="flex flex-none">' + items + '</ul>'
      + '<ul class="flex flex-none motion-reduce:hidden" aria-hidden="true">' + items + '</ul>';
    /* ~40px a second, whatever the list length */
    requestAnimationFrame(function(){
      var w = track.firstChild.getBoundingClientRect().width;
      track.style.setProperty('--ticker-duration', Math.max(30, w / 40) + 's');
    });
  }

  /* ---------- Film controls (hero + campaign section share the file) ---------- */
  var ICON = {
    pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14"/><path d="M16 5v14"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4.5v15a.5.5 0 0 0 .76.43l12.5-7.5a.5.5 0 0 0 0-.86L6.76 4.07A.5.5 0 0 0 6 4.5z"/></svg>',
    muted:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>',
    sound:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5.5a9.5 9.5 0 0 1 0 13"/></svg>'
  };
  document.querySelectorAll('[data-film]').forEach(function(box){
    var v = box.querySelector('video'), playBtn = box.querySelector('[data-film-play]'), sndBtn = box.querySelector('[data-film-sound]');
    if (!v) return;
    if (REDUCED){ v.removeAttribute('autoplay'); v.pause(); }
    function sync(){
      if (playBtn){ playBtn.innerHTML = v.paused ? ICON.play : ICON.pause; playBtn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video'); }
      if (sndBtn){ sndBtn.innerHTML = v.muted ? ICON.muted : ICON.sound; sndBtn.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off'); }
    }
    ['play','pause','volumechange'].forEach(function(e){ v.addEventListener(e, sync); });
    /* No film file yet: hide the controls, the poster image stands in. */
    function noFilm(){ [playBtn, sndBtn].forEach(function(b){ if (b) b.hidden = true; }); }
    v.addEventListener('error', noFilm, true);
    if (v.error || v.networkState === 3) noFilm();   /* failed before this script ran */
    if (playBtn) playBtn.addEventListener('click', function(){ if (v.paused) v.play(); else v.pause(); });
    if (sndBtn) sndBtn.addEventListener('click', function(){ v.muted = !v.muted; if (!v.muted && v.paused) v.play(); });
    sync();
  });

  /* ---------- Scroll story: chapters reveal, the line fills as you scroll ---------- */
  var story = document.getElementById('v1Story');
  if (story){
    var chapters = Array.prototype.slice.call(story.querySelectorAll('.story__chapter'));
    if (!REDUCED) story.classList.add('is-ready');
    function layout(){
      /* The line runs node-centre to node-centre: trim the first chapter's top and the last one's bottom. */
      chapters.forEach(function(c, i){
        var node = c.querySelector('.story__node'), cr = c.getBoundingClientRect(), nr = node.getBoundingClientRect();
        var mid = nr.top + nr.height / 2 - cr.top;
        c.style.setProperty('--line-start', i === 0 ? mid + 'px' : '0px');
        c.style.setProperty('--line-end', i === chapters.length - 1 ? (cr.height - mid) + 'px' : '0px');
      });
      fill();
    }
    function fill(){
      var target = window.innerHeight * 0.6;
      chapters.forEach(function(c){
        var r = c.getBoundingClientRect();
        var f = REDUCED ? 1 : Math.min(1, Math.max(0, (target - r.top) / r.height));
        c.style.setProperty('--fill', f.toFixed(3));
        var node = c.querySelector('.story__node').getBoundingClientRect();
        c.classList.toggle('is-reached', REDUCED || node.top + node.height / 2 < target);
        if (r.top < window.innerHeight * 0.8) c.classList.add('is-visible');   /* reveal once, stays revealed */
      });
    }
    window.addEventListener('scroll', fill, { passive: true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    layout();
  }

  /* ---------- Header hides on scroll down, returns on scroll up ---------- */
  var header = document.getElementById('siteHeader'), lastY = window.scrollY;
  if (header){
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      header.classList.toggle('site-header--hidden', y > lastY && y > 120);
      lastY = y;
    }, { passive: true });
    header.addEventListener('focusin', function(){ header.classList.remove('site-header--hidden'); });
  }
})();
