
/* ============================================================
   MERGE LAYER — wires the Giving Portal chrome (immersive hero,
   dock, ticker, scroll choreography) onto the prospect portal's
   feature set. Loads after both original scripts.
   ============================================================ */
var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- views that run an immersive full-bleed hero ---------- */
var HERO_VIEWS = { home:true, impactmap:true };

/* ---------- navigation: keep v8 behaviour, add the new chrome ---------- */
var _baseNavigate = window.navigate;
window.navigate = function(view, closeDrawerAfter){
  _baseNavigate(view, closeDrawerAfter);

  document.querySelectorAll('.dock-item').forEach(function(n){ n.classList.remove('active'); });
  var d = document.querySelector('.dock-item[data-view="' + view + '"]');
  if (d) d.classList.add('active');

  document.querySelectorAll('.dr-item').forEach(function(n){ n.classList.remove('active'); });
  var dr = document.querySelector('.dr-item[data-view="' + view + '"]');
  if (dr) dr.classList.add('active');

  document.body.classList.toggle('hero-view', !!HERO_VIEWS[view]);
  document.body.classList.remove('scrolled');
  replayReveals(document.getElementById('view-' + view));
};

window.addEventListener('scroll', function(){
  document.body.classList.toggle('scrolled', window.scrollY > 14);
}, { passive:true });

/* ---------- 2025 grants ticker ---------- */
var TICKER_GRANTS = [
  ['$50,000','Greater Cleveland Food Bank'],
  ['$25,000','Rainey Institute'],
  ['$100,000','College Now Greater Cleveland'],
  ['$75,000','Greater Cleveland Habitat for Humanity'],
  ['$40,000','Cleveland Public Theatre'],
  ['$25,000','Seeds of Literacy'],
  ['$60,000','MAGNET — Manufacturing Talent Pipeline'],
  ['$35,000','Cleveland Water Alliance'],
  ['$45,000','Youth Opportunities Unlimited'],
  ['$30,000','Providence House'],
  ['$20,000','Julia de Burgos Cultural Arts Center'],
  ['$55,000','CHN Housing Partners']
];
function buildTicker(){
  var track = document.getElementById('tkTrack');
  if (!track) return;
  var seq = TICKER_GRANTS.map(function(g){
    return '<span class="tk-item"><span class="amt">' + g[0] + '</span><span class="sep">\u2192</span><span class="org">' + g[1] + '</span><span class="sep">\u00b7</span></span>';
  }).join('');
  track.innerHTML = seq + seq; /* duplicated for a seamless -50% loop */
  if (REDUCE) track.style.animation = 'none';
}

/* ---------- scroll-choreographed reveals ---------- */
var revealIO = null;
function initReveals(){
  if (REDUCE || !('IntersectionObserver' in window)) return;
  revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('inview'); revealIO.unobserve(e.target); }
    });
  }, { rootMargin:'0px 0px -8% 0px', threshold:.08 });
  markReveals(document);
}
function markReveals(scope){
  if (!revealIO) return;
  scope.querySelectorAll('.sect-rail, .pgrid > *, .mods, .card, .band').forEach(function(el, i){
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.setProperty('--d', Math.min(i * 0.035, 0.28) + 's');
    revealIO.observe(el);
  });
}
function replayReveals(scope){
  if (!scope || !revealIO) return;
  markReveals(scope);
}

/* ---------- cursor-reactive hero guilloché ---------- */
function initParallax(){
  if (REDUCE || !window.matchMedia('(hover:hover) and (min-width:900px)').matches) return;
  document.querySelectorAll('.hero').forEach(function(hero){
    var g = hero.querySelector('.guilloche');
    if (!g) return;
    var raf = null, tx = 0, ty = 0;
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * -18;
      ty = ((e.clientY - r.top) / r.height - .5) * -14;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('mouseleave', function(){
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    function apply(){
      g.classList.add('tracking');
      g.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(1.03)';
      raf = null;
    }
  });
}

/* ============================================================
   HOME STORY PANELS  →  the matching post in the News Feed
   The three featured stories live in the feed itself, so the
   home row and the feed never drift apart.
   ============================================================ */
if (typeof NF_POSTS !== 'undefined') {
  NF_POSTS.unshift(
    { id:101, name:'Cleveland Foundation', initials:'CF', color:'var(--tcf-primary)', type:'news', time:'2d ago', likes:41,
      img:'../assets/img/stories/summer-job.jpg', alt:'Two young people rebuilding an engine in a workshop',
      body:'Connect people to prosperity \u2014 a summer job on Euclid Avenue turned into a career. Our workforce grantees placed 1,180 young people in paid roles last year, and two-thirds were still employed twelve months later.',
      action:function(){ navigate('impact'); } },
    { id:102, name:'Cleveland Foundation', initials:'CF', color:'var(--tcf-primary)', type:'news', time:'4d ago', likes:27,
      img:'../assets/img/stories/hough-homeowners.jpg', alt:'A homeowner pointing down the street while neighbors look on, in front of a new house',
      body:'Vibrant neighborhoods \u2014 Hough\u2019s newest homeowners built more than houses. Twelve families closed on homes built with neighborhood labor, and the block club that organized the effort is now advising three other wards.',
      action:function(){ navigate('impactmap'); } },
    { id:103, name:'Cleveland Foundation', initials:'CF', color:'var(--tcf-primary)', type:'news', time:'1w ago', likes:35,
      img:'../assets/img/stories/midline.jpg', alt:'Two men talking inside a large former industrial building',
      body:'Grow our region \u2014 see how the Midline is redefining the future with good jobs.',
      action:function(){ navigate('impactmap'); } }
  );
}

/* V1: "From the field" — the three featured stories as a carousel of square cards, the same
   size as the home tiles (two across on phones, four across on desktop), ending with an
   "Open the News Feed" card. Titles come from STORY_TITLES; the full text lives in the feed. */
var STORY_TITLES = {
  101:{ tag:'Connect people to prosperity', title:'A summer job became a career on Euclid Avenue' },
  102:{ tag:'Vibrant neighborhoods', title:'Hough\u2019s newest homeowners built more than houses' },
  103:{ tag:'Grow our region', title:'See how the Midline is redefining the future with good jobs' }
};
function renderHomeFeedCards(){
  var host = document.getElementById('homeFeedCards');
  if (!host || typeof NF_POSTS === 'undefined') return;
  host.innerHTML = [101, 102, 103].map(function(id){
    var p = NF_POSTS.filter(function(x){ return x.id === id; })[0], t = STORY_TITLES[id];
    if (!p || !t) return '';
    return '<button type="button" class="v1-story" onclick="openFeedStory(' + id + ')">'
      + '<span class="v1-story__img" style="background-image:url(' + p.img + ')" role="img" aria-label="' + (p.alt || '') + '"></span>'
      + '<span class="v1-story__body"><span class="v1-story__tag">' + t.tag + '</span>'
      + '<span class="v1-story__title">' + t.title + '</span>'
      + '<span class="v1-story__foot"><span>\u2665 ' + p.likes + '</span><span>Read more \u2192</span></span></span>'
      + '</button>';
  }).join('')
  + '<button type="button" class="v1-story v1-story--cta" onclick="navigate(\'newsfeed\',false)">'
  + '<span class="v1-story__body"><span class="v1-story__title">Open the News Feed</span>'
  + '<span class="v1-story__sub">Stories from the foundation and why your neighbors give.</span>'
  + '<span class="v1-story__foot"><span>2 new this week</span><span>\u2192</span></span></span></button>';
}
renderHomeFeedCards();

/* Carousel controls: arrows page by what's visible; dots show the page; hidden when nothing scrolls. */
function initCarousel(root){
  var track = root.querySelector('.v1-carousel__track'), dots = root.querySelector('[data-dots]');
  var prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
  function pages(){ return track.clientWidth ? Math.max(1, Math.round(track.scrollWidth / track.clientWidth)) : 1; }
  function page(){ return track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0; }
  function sync(){
    var n = pages(), i = Math.min(page(), n - 1);
    root.classList.toggle('is-static', n < 2);
    dots.innerHTML = n < 2 ? '' : Array.apply(null, Array(n)).map(function(_, k){
      return '<button type="button" class="' + (k === i ? 'on' : '') + '" aria-label="Page ' + (k + 1) + ' of ' + n + '" data-page="' + k + '"></button>';
    }).join('');
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  }
  function go(dir){ track.scrollBy({ left: dir * track.clientWidth, behavior: REDUCE ? 'auto' : 'smooth' }); }
  prev.addEventListener('click', function(){ go(-1); });
  next.addEventListener('click', function(){ go(1); });
  dots.addEventListener('click', function(e){ var b = e.target.closest('[data-page]'); if (b) track.scrollTo({ left: +b.dataset.page * track.clientWidth, behavior: REDUCE ? 'auto' : 'smooth' }); });
  track.addEventListener('keydown', function(e){ if (e.key === 'ArrowRight'){ e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); } });
  var t; track.addEventListener('scroll', function(){ clearTimeout(t); t = setTimeout(sync, 60); }, { passive: true });
  window.addEventListener('resize', sync);
  sync();
  /* the home view can be hidden at load (intro): recheck whenever the track changes size */
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(track);
}
document.querySelectorAll('[data-carousel]').forEach(initCarousel);

/* tag each rendered post so the home panels can jump straight to it */
var _baseRenderNewsFeed = window.renderNewsFeed;
window.renderNewsFeed = function(){
  _baseRenderNewsFeed();
  var wrap = document.getElementById('nfFeed');
  if (!wrap || typeof NF_POSTS === 'undefined') return;
  var posts = wrap.querySelectorAll('.nf-post');
  var offset = posts.length - NF_POSTS.length; /* the user's own "why" post sits first */
  NF_POSTS.forEach(function(p, i){
    var el = posts[i + offset];
    if (el) el.id = 'nf-post-' + p.id;
  });
};

function openFeedStory(id){
  navigate('newsfeed', false);
  setTimeout(function(){
    var el = document.getElementById('nf-post-' + id);
    if (!el) return;
    el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block:'center' });
    el.classList.remove('nf-flash');
    void el.offsetWidth;
    el.classList.add('nf-flash');
  }, 90);
}

/* ============================================================
   OPENING ANIMATIC — plays once on load, skippable.
   The animation itself is assets/intro/welcome.html in an iframe; it posts
   {tcf:'intro-done'} when finished (handled in assets/js/tcf-bridge.js).
   ============================================================ */
var introEl = document.getElementById('intro');

function playIntro(){
  if (REDUCE || !introEl){ document.documentElement.classList.remove('intro-pending'); return; }
  introEl.classList.remove('done','skip','play');
  void introEl.offsetWidth;            /* restart the whole timeline */
  document.body.classList.add('intro-on');
  window.scrollTo({ top:0, behavior:'instant' });
  introEl.classList.add('play');
}
function skipIntro(){
  if (!introEl) return;
  introEl.classList.add('skip');
}
function finishIntro(){
  document.documentElement.classList.remove('intro-pending');
  introEl.classList.remove('play','skip');
  introEl.classList.add('done');
  document.body.classList.remove('intro-on');
  /* hand off: replay the home choreography as the curtain lifts */
  navigate('home', false);
}
if (introEl){
  introEl.addEventListener('animationend', function(e){
    if (e.target === introEl && e.animationName === 'introLift') finishIntro();
  });
  playIntro();
}

/* ---------- Grow Your City tile → straight to the badge grid ---------- */
function openGardenBadges(){
  navigate('garden', false);
  setTimeout(function(){
    var grid = document.getElementById('gardenBadgeGrid');
    if (!grid) return;
    grid.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block:'start' });
  }, 120);
}

/* ---------- boot ---------- */
buildTicker();
initReveals();
initParallax();
if (typeof updateGardenModuleUI === 'function') updateGardenModuleUI();

