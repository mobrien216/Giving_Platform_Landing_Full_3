/* ============================================================
   GIVING APP — shared by community/ and advisors/
   One script for both experiences. Advisor-only modules live in
   assets/advisors/ (estate-checklist.js → initEstateView/initFaqView,
   gift-planner.js) and are only loaded by advisors/index.html, so
   every hook into them below is guarded with typeof.
   Load order: map-and-grants.js → app.js → extras.js → (advisor
   modules) → tcf-bridge.js. extras.js and tcf-bridge.js each wrap
   navigate(); keep that order.
   ============================================================ */

/* escape text before it goes into innerHTML (names, typed answers) */
function escHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function initialsOf(name){
  return name ? escHtml(name.split(/\s+/).map(function(p){ return p[0]; }).join('').slice(0,2).toUpperCase()) : 'YOU';
}

/* Open a Donor Advised Fund: every "Open a DAF" button goes to the Foundation's online
   flow (open/), the same one the portal's sign-in page links to. ?from= tells the flow which
   app sent the person, so their persona (community member or advisor) carries into the
   Account Holder portal when they finish. */
function openDAF(){
  var app = location.pathname.indexOf('/advisors/') > -1 ? 'advisors' : 'community';
  location.href = '../open/?from=' + app;
}

/* ============================================================
   APP STATE
   ============================================================ */
var appState = { isDonor: false, fundName: '', donorName: '' };

/* ============================================================
   NAVIGATION
   ============================================================ */
var _ltPending = false;
var _inited = {};

function navigate(view, closeDrawerAfter) {
  if (closeDrawerAfter === undefined) closeDrawerAfter = true;
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  var target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');
  /* active state for .dock-item / .dr-item is set in extras.js */
  if (view === 'calculator') { setTimeout(calcRender, 60); }
  if (view === 'vision' && !_inited.vision) { _inited.vision = true; setTimeout(vRenderCard, 60); }
  if (view === 'garden') { setTimeout(renderGardenView, 30); }
  if (view === 'legends') { setTimeout(initLegendsView, 30); }
  if (view === 'history') { setTimeout(initHistoryView, 30); }
  /* advisor-only modules (assets/advisors/estate-checklist.js) */
  if (view === 'estate' && typeof initEstateView === 'function') { setTimeout(initEstateView, 30); }
  if (view === 'faq' && typeof initFaqView === 'function') { setTimeout(initFaqView, 30); }
  if (view === 'newsfeed') { setTimeout(renderNewsFeed, 30); }
  if (view === 'givinghistory') { setTimeout(initGivingHistoryView, 30); }
  if (view === 'impactmap' && !_inited.impactmap) { _inited.impactmap = true; setTimeout(function() { if (window.__impactMapInit) window.__impactMapInit(); }, 60); }
  if (view === 'performance' && appState.isDonor) { setTimeout(function() { drawPerfChart(null,'YTD'); }, 60); }
  if (view === 'learning') {
    if (!_ltPending) { showLtIndex(); }
    _ltPending = false;
  }
  if (closeDrawerAfter) closeDrawer();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showLtIndex() {
  var idx = document.getElementById('lt-index');
  var det = document.getElementById('lt-detail');
  var rdr = document.getElementById('lt-reader');
  if (idx) idx.style.display = 'block';
  if (det) det.style.display = 'none';
  if (rdr) rdr.style.display = 'none';
}

/* ============================================================
   DRAWER
   ============================================================ */
function toggleDrawer() {
  document.getElementById('drawer').classList.toggle('open');
  document.getElementById('drawerBackdrop').classList.toggle('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('open');
}

/* ============================================================
   TOAST
   ============================================================ */
var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3500);
}

/* ============================================================
   YOUR CLEVELAND GARDEN — Land Florals badge system
   Swap the "story" copy below for the real Land Floral narratives
   before this ships — these are placeholder pairings.
   ============================================================ */
var GARDEN_BADGES = [
  {
    id:'volunteer', plant:'Black-Eyed Susan', desc:'Volunteer Locally',
    colors:['var(--tcf-aqua)','var(--tcf-orange)','var(--tcf-primary)'],
    verify:'selfreport',
    howto:'Spend time volunteering at any organization in the city this month, then tell us where. This one\u2019s on the honor system \u2014 no proof needed.',
    fieldLabel:'Organization name', placeholder:'e.g. Ohio City Farm, Boys & Girls Club\u2026',
    story:'Black-Eyed Susans are one of the first wildflowers to take root in overlooked, disturbed ground \u2014 vacant lots, roadsides, the corners of the city everyone else drives past. We paired it with volunteering because showing up for the parts of Cleveland that need it most is exactly what this flower already does on its own. [Swap in the real Land Floral story for Black-Eyed Susan.]'
  },
  {
    id:'event', plant:'Elm', desc:'Attend an Event',
    colors:['var(--tcf-blue)','var(--tcf-primary)','var(--tcf-aqua)'],
    verify:'selfreport',
    howto:'Go to a festival, open house, town hall, block party, or school board meeting \u2014 anything where the community gathers. Tell us what you attended.',
    fieldLabel:'Event name', placeholder:'e.g. West Side Market Block Party\u2026',
    story:'American elms once arched over Cleveland\u2019s main streets and town squares \u2014 the shade neighbors gathered under. It\u2019s a natural match for showing up wherever the community comes together. [Swap in the real Land Floral story for Elm.]'
  },
  {
    id:'gift', plant:'Oak', desc:'Make a Gift',
    colors:['var(--tcf-orange)','var(--tcf-mid-green)','var(--tcf-orange)'],
    verify:'auto',
    howto:'Make a gift of any amount, anywhere on the platform. This badge unlocks automatically \u2014 nothing else to do.',
    story:'Mighty oaks grow from little acorns. A gift of any size, given time, becomes something lasting \u2014 the same idea behind every fund at the Cleveland Foundation. [Swap in the real Land Floral story for Oak.]'
  },
  {
    id:'why', plant:'Foxglove', desc:'Share Your Why',
    colors:['var(--tcf-orange)','var(--tcf-pink)','var(--tcf-primary)'],
    verify:'post',
    howto:'Post a short reflection on what moved you to get involved in your community. It\u2019ll appear on the Stories &amp; Impact feed.',
    fieldLabel:'Your why', placeholder:'Share a short reflection\u2026',
    story:'Foxglove has long been tied to matters of the heart. We paired it with sharing your \u201cwhy\u201d because that\u2019s the most personal, heart-driven check-in of the six. [Swap in the real Land Floral story for Foxglove.]'
  },
  {
    id:'refer', plant:'Milkweed', desc:'Refer a Friend',
    colors:['var(--tcf-orange)','var(--tcf-aqua)','var(--tcf-primary)'],
    verify:'share',
    howto:'Use the share button below to invite a friend. We\u2019ll unlock this as soon as the share sheet opens.',
    story:'Milkweed is the one plant monarch butterflies depend on at every stop of their migration \u2014 without it, the journey can\u2019t continue. Referring a friend makes you that same kind of waypoint for someone else\u2019s giving journey. [Swap in the real Land Floral story for Milkweed.]'
  },
  {
    id:'localbiz', plant:'Walnut', desc:'Support Local Business',
    colors:['var(--tcf-aqua)','var(--tcf-primary)','var(--tcf-orange)'],
    verify:'selfreport',
    howto:'Shop or grab a bite at a locally owned business in the city this month, then tell us where.',
    fieldLabel:'Business name', placeholder:'e.g. Rising Star Coffee, East 66th\u2026',
    story:'Walnut trees quietly shape everything that grows around them, and their wood has always been prized in local craft \u2014 it felt right for supporting the small businesses that anchor Cleveland\u2019s neighborhoods. [Swap in the real Land Floral story for Walnut.]'
  }
];

var gardenState = {};

function gmMosaic(colors, size) {
  var n = 6, seed = 0, joined = colors.join(''), i;
  for (i = 0; i < joined.length; i++) seed += joined.charCodeAt(i);
  var cells = '';
  for (i = 0; i < n * n; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    var idx = Math.floor((seed / 233280) * colors.length);
    var round = (seed % 5 === 0);
    cells += '<div class="cell" style="background:' + colors[idx] + ';border-radius:' + (round ? '50%' : '2px') + '"></div>';
  }
  return '<div class="' + (size >= 64 ? 'gm-mosaic' : 'mosaic') + '">' + cells + '</div>';
}

function gardenUnlockedCount() {
  return GARDEN_BADGES.filter(function(b) { return gardenState[b.id] && gardenState[b.id].unlocked; }).length;
}

function updateGardenModuleUI() {
  var count = gardenUnlockedCount();
  var sub = document.getElementById('gardenModuleSub');
  if (sub) sub.textContent = count === 0 ? 'Collect Land Florals as you show up for the city.' : (count + ' of 6 collected \u2014 keep going.');
  var dots = document.getElementById('gardenMiniDots');
  if (dots) dots.innerHTML = GARDEN_BADGES.map(function(b) {
    return '<span class="' + ((gardenState[b.id] && gardenState[b.id].unlocked) ? 'done' : '') + '"></span>';
  }).join('');
}

function renderGardenView() {
  var count = gardenUnlockedCount();
  document.getElementById('gardenHeroCount').textContent = count + ' of 6 planted';
  document.getElementById('gardenHeroBar').style.width = (count / 6 * 100) + '%';
  var grid = document.getElementById('gardenBadgeGrid');
  grid.innerHTML = GARDEN_BADGES.map(function(b) {
    var unlocked = gardenState[b.id] && gardenState[b.id].unlocked;
    var mosaic = unlocked ? gmMosaic(b.colors, 56) : ('<div class="mosaic locked">' + ('<div class="cell"></div>').repeat(36) + '</div>');
    return '<div class="badge-card ' + (unlocked ? 'unlocked' : 'locked') + '" onclick="openGardenModal(\'' + b.id + '\')">' + mosaic +
      '<div class="badge-desc">' + b.desc + '</div>' +
      '<div class="badge-name">' + b.plant + '</div>' +
      '<div class="badge-state">' + (unlocked ? 'Collected' : '\uD83D\uDD12 Locked') + '</div></div>';
  }).join('');
  updateGardenModuleUI();
}

function openGardenModal(id) {
  var b = GARDEN_BADGES.filter(function(x) { return x.id === id; })[0];
  var unlocked = gardenState[b.id] && gardenState[b.id].unlocked;
  document.getElementById('gmTitle').textContent = b.plant;

  var actionHTML = '';
  if (!unlocked) {
    if (b.verify === 'selfreport' || b.verify === 'post') {
      actionHTML =
        '<div class="gm-section"><div class="gm-label">How to Unlock</div><div class="gm-howto-box">' + b.howto + '</div></div>' +
        '<input type="text" class="gm-input" id="gmInput" placeholder="' + b.placeholder + '">' +
        '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="submitGardenSelfReport(\'' + b.id + '\')">' + (b.verify === 'post' ? 'Post &amp; Collect' : 'Tell Us &amp; Collect') + '</button>' +
        '<div class="gm-verify-tag">\u2713 Self-reported \u2014 trust based, no proof required.</div>';
    } else if (b.verify === 'auto') {
      actionHTML =
        '<div class="gm-section"><div class="gm-label">How to Unlock</div><div class="gm-howto-box">' + b.howto + '</div></div>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:12px;" onclick="closeGardenModal();navigate(\'contributions\')">Go Make a Gift</button>' +
        '<div class="gm-verify-tag">\u2713 Auto-detected from your giving history.</div>' +
        '<button class="btn btn-accent btn-block" style="margin-top:8px;" onclick="gardenUnlock(\'' + b.id + '\')">Demo: simulate a gift</button>';
    } else if (b.verify === 'share') {
      actionHTML =
        '<div class="gm-section"><div class="gm-label">How to Unlock</div><div class="gm-howto-box">' + b.howto + '</div></div>' +
        '<button class="btn btn-accent btn-block" style="margin-top:12px;" onclick="submitGardenShare(\'' + b.id + '\')">Share the App</button>' +
        '<div class="gm-verify-tag">\u2713 Confirmed when you use the share button.</div>';
    }
  } else {
    var detail = gardenState[b.id].detail;
    actionHTML = '<div class="gm-done">\u2713 Collected' + (detail ? ' \u2014 \u201c' + escHtml(detail) + '\u201d' : '') + '</div>';
  }

  document.getElementById('gmBody').innerHTML =
    '<div class="gm-top">' + gmMosaic(b.colors, 64) +
    '<div><span class="gm-status ' + (unlocked ? 'unlocked' : 'locked') + '">' + (unlocked ? 'COLLECTED' : 'NOT YET COLLECTED') + '</span></div></div>' +
    actionHTML +
    '<div class="gm-section"><div class="gm-label" style="color:var(--tcf-orange);">Why This Pairing</div><div class="gm-story-box">' + b.story + '</div></div>';

  document.getElementById('gardenModal').classList.add('open');
}
function closeGardenModal() { document.getElementById('gardenModal').classList.remove('open'); }

var pendingShare = null;
function openShareModal(ctx) { pendingShare = ctx || null; document.getElementById('shareModal').classList.add('open'); }
function closeShareModal() { document.getElementById('shareModal').classList.remove('open'); }
function shareVia(method) {
  var url = window.location.href;
  var subject = (pendingShare && pendingShare.subject) || 'Check out the Cleveland Foundation Giving Portal';
  var text = (pendingShare && pendingShare.text) || 'Check out the Cleveland Foundation Giving Portal:';
  var body = text + ' ' + url;
  if (method === 'text') {
    window.location.href = 'sms:?body=' + encodeURIComponent(body);
  } else if (method === 'email') {
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  } else if (method === 'copy') {
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard.');
  }
  closeShareModal();
}

function gardenUnlock(id, detail) {
  gardenState[id] = { unlocked: true, detail: detail || null };
  renderGardenView();
  closeGardenModal();
  if (gardenUnlockedCount() === 6) {
    setTimeout(function() { showToast('\uD83C\uDF33 Your garden has bloomed \u2014 your Cleveland Foundation gift is on its way!'); }, 300);
  } else {
    showToast('Collected! ' + gardenUnlockedCount() + ' of 6 Land Florals planted.');
  }
}
function submitGardenSelfReport(id) {
  var input = document.getElementById('gmInput');
  var val = input.value.trim();
  if (!val) { input.style.borderColor = 'var(--tcf-red)'; return; }
  gardenUnlock(id, val);
}
function submitGardenShare(id) {
  var shareData = { title: 'Cleveland Foundation Giving Portal', text: 'I\u2019m taking part in Grow Your City with the Cleveland Foundation \u2014 come check out the Giving Portal.', url: window.location.href };
  if (navigator.share) {
    navigator.share(shareData).then(function() { gardenUnlock(id); }).catch(function() {});
  } else {
    if (navigator.clipboard) navigator.clipboard.writeText(shareData.url);
    showToast('Link copied \u2014 in production this opens the native share sheet.');
    gardenUnlock(id);
  }
}

/* ============================================================
   LOCAL LEGENDS
   ============================================================ */
const LEGENDS = [
  {id:1, name:"Frederick Harris Goff", years:"1858–1923", cat:"Business & Philanthropy", color:"green",
    quote:"Why not pool the good will of an entire city into one enduring trust?",
    story:"In 1914, banker and lawyer Frederick Goff had a radical idea: instead of letting charitable dollars sit locked in outdated wills, why not pool them into one flexible, permanent trust guided by the living community? That idea became the Cleveland Foundation — the world's first community foundation — a model now used by more than 1,700 community foundations across the globe.",
    legacy:"Every gift to the Cleveland Foundation today carries forward the trust Fred Goff built more than a century ago."},
  {id:2, name:"John D. Rockefeller", years:"1839–1937", cat:"Business & Philanthropy", color:"green",
    quote:"Cleveland made me. Standard Oil made Cleveland.",
    story:"Rockefeller built Standard Oil on Cleveland's docks and rail lines starting in 1870, turning a modest lake port into an industrial powerhouse that employed generations of families. The fortune he built here also seeded a lifelong practice of large-scale philanthropy that became a model for American giving.",
    legacy:"His giving helped establish the idea that great wealth carries a great responsibility to the community that made it possible."},
  {id:3, name:"Amasa Stone", years:"1818–1883", cat:"Business & Philanthropy", color:"green",
    quote:"A railroad man who built more than bridges.",
    story:"A railroad and bridge-building magnate, Amasa Stone's fortune funded the move of Case School of Applied Science and Western Reserve's Adelbert College to Cleveland — planting the seeds of what is now University Circle, still the city's hub of education, medicine, and culture.",
    legacy:"One gift, made a century and a half ago, is still educating Clevelanders today."},
  {id:4, name:"Charles F. Brush", years:"1849–1929", cat:"Business & Science", color:"aqua",
    quote:"Lighting a city, one arc lamp at a time.",
    story:"In 1879, Brush lit Cleveland's Public Square with his own arc-light invention, making it one of the first electrically lit cities in the world. His engineering company later became part of General Electric, and his estate helped fund scientific research in Cleveland for decades.",
    legacy:"A single invention changed how an entire city lived after dark — and his estate kept giving long after."},
  {id:5, name:"Garrett A. Morgan", years:"1877–1963", cat:"Business & Invention", color:"orange",
    quote:"An inventor who also built a community.",
    story:"A Black inventor and entrepreneur, Morgan patented the three-position traffic signal and a safety hood that became a forerunner of the modern gas mask — using it himself to help rescue trapped workers after a 1916 tunnel explosion. He built a successful business while becoming an early leader of Cleveland's Black community.",
    legacy:"His inventions still shape every intersection you drive through today."},
  {id:6, name:"Cyrus Eaton", years:"1883–1979", cat:"Business & Philanthropy", color:"green",
    quote:"A Cleveland fortune, spent on world peace.",
    story:"A self-made Cleveland financier, Eaton used his industrial fortune to fund the Pugwash Conferences, bringing scientists together across Cold War lines to push for nuclear disarmament — proof that a Cleveland businessman's generosity could shape world peace.",
    legacy:"His giving reached far beyond Cleveland, all the way to the world stage."},
  {id:7, name:"Peter B. Lewis", years:"1933–2013", cat:"Business & Philanthropy", color:"green",
    quote:"Betting big on his hometown's culture.",
    story:"Lewis built Progressive Insurance into a national leader, then became one of Cleveland's boldest philanthropists — reshaping the Cleveland Museum of Art and betting big on the city's cultural future with transformative gifts most donors wouldn't dare make.",
    legacy:"His gifts prove that ambitious giving can change a skyline, not just a balance sheet."},
  {id:8, name:"Morton L. Mandel", years:"1921–2019", cat:"Business & Philanthropy", color:"green",
    quote:"Three brothers, one lasting commitment.",
    story:"With brothers Jack and Joseph, Mandel built Premier Industrial into a national company — then poured that success into the Mandel Foundation, becoming one of the most consistent and far-reaching philanthropic forces in Cleveland's history.",
    legacy:"A family business became a family legacy of giving that still shapes Cleveland today."},
  {id:9, name:"Jeptha H. Wade", years:"1811–1890", cat:"Business & Philanthropy", color:"green",
    quote:"One gift of land, enjoyed by generations.",
    story:"A founder of Western Union, Wade's gift of land created Wade Park — today home to the Cleveland Museum of Art and Cleveland Botanical Garden — turning one family's generosity into a permanent gift for every Clevelander.",
    legacy:"Millions of visits later, his single gift is still giving."},
  {id:10, name:"Dan Gilbert", years:"b. 1962", cat:"Business & Philanthropy", color:"orange",
    quote:"Betting his fortune on downtown's comeback.",
    story:"The founder of Rocket Companies poured hundreds of millions of dollars into rebuilding downtown Cleveland block by block, while co-owning the Cavaliers through their historic 2016 championship — betting his fortune on his hometown's comeback.",
    legacy:"A downtown skyline, rebuilt one investment at a time."},
  {id:11, name:"Carl B. Stokes", years:"1927–1996", cat:"Civil Rights & Politics", color:"pink",
    quote:"A seat at the head of the table.",
    story:"In 1967, Carl Stokes was elected the first Black mayor of a major American city — a milestone that reshaped what was possible in urban politics nationwide, and gave Cleveland's Black community a seat at the head of the table.",
    legacy:"A city hall door, opened for the first time, that has stayed open ever since."},
  {id:12, name:"Louis Stokes", years:"1925–2015", cat:"Civil Rights & Politics", color:"pink",
    quote:"Fifteen terms, one relentless purpose.",
    story:"Ohio's first Black member of Congress, Louis Stokes spent 15 terms fighting for civil rights, healthcare access, and fair representation — carrying his brother Carl's legacy of public service to Washington for nearly three decades.",
    legacy:"Decades of service, still felt in the policies that protect Clevelanders today."},
  {id:13, name:"Jane Edna Hunter", years:"1882–1971", cat:"Civil Rights & Social Work", color:"pink",
    quote:"A safe place to land, and a chance to rise.",
    story:"Arriving in Cleveland with almost nothing, Hunter founded the Phillis Wheatley Association to give Black women migrating north safe housing, job training, and a community — a lifeline that helped shape generations of Cleveland families.",
    legacy:"An institution built from nothing, still lifting people up today."},
  {id:14, name:"Charles W. Chesnutt", years:"1858–1932", cat:"Civil Rights & Literature", color:"pink",
    quote:"A lawyer by day, a truth-teller by night.",
    story:"A Cleveland lawyer by day, Chesnutt became one of the first commercially successful African American novelists, using fiction to confront America's racial injustices at a time when few publishers would take the risk.",
    legacy:"Stories that took a real risk to tell — and are still read for their honesty today."},
  {id:15, name:"John Malvin", years:"1795–1880", cat:"Civil Rights", color:"pink",
    quote:"Fighting for freedoms decades before they were won.",
    story:"An early Cleveland abolitionist, Malvin organized against slavery and fought for Black Ohioans' right to education and citizenship decades before the Civil War — laying groundwork for the civil rights movement that would follow a century later.",
    legacy:"A fight for justice that started generations before it was won."},
  {id:16, name:"Lucy Stanton Day Sessions", years:"1831–1910", cat:"Civil Rights & Education", color:"pink",
    quote:"Education and activism, hand in hand.",
    story:"Believed to be the first Black woman to complete a four-year college course, Stanton returned to Cleveland to teach, organize, and advocate — proving that education and activism could go hand in hand.",
    legacy:"A first that opened the door for every student who followed."},
  {id:17, name:"William O. Walker", years:"1896–1981", cat:"Civil Rights & Journalism", color:"pink",
    quote:"A press that gave a community its voice.",
    story:"As editor of the Call & Post for decades, Walker used the press to build Black political power in Cleveland, holding leaders accountable and giving voice to a community too often overlooked by the city's other papers.",
    legacy:"Decades of reporting that made sure Cleveland's Black community was heard."},
  {id:18, name:"Eliza Bryant", years:"1827–1907", cat:"Civil Rights & Social Work", color:"pink",
    quote:"Dignity, for those the city too often forgot.",
    story:"Bryant founded what became the Eliza Bryant Center, one of the nation's oldest homes for elderly African Americans — ensuring that Cleveland's Black elders would be cared for with dignity when few institutions would take them in.",
    legacy:"A home she built is still caring for Cleveland's elders today."},
  {id:19, name:"Fannie Lewis", years:"1926–2008", cat:"Civil Rights & Politics", color:"pink",
    quote:"Rebuilding a neighborhood, block by block.",
    story:"Cleveland's longest-serving female City Council member, Lewis fought fiercely for the Hough neighborhood's revival after decades of disinvestment, proving that one determined advocate could rebuild a community block by block.",
    legacy:"Proof that showing up, decade after decade, changes a neighborhood for good."},
  {id:20, name:"Stephanie Tubbs Jones", years:"1949–2008", cat:"Civil Rights & Politics", color:"pink",
    quote:"A relentless focus on the people she served.",
    story:"The first Black woman elected to Congress from Ohio, Tubbs Jones represented Cleveland with a relentless focus on healthcare, education, and civil rights until her sudden passing in office.",
    legacy:"A first that reshaped who gets to represent Cleveland in Washington."},
  {id:21, name:"Tom L. Johnson", years:"1854–1911", cat:"Politics", color:"blue",
    quote:"The best-governed city in America.",
    story:"As mayor from 1901 to 1909, Johnson took on Cleveland's streetcar monopolies and pushed for fair taxation and public ownership of utilities — reforms so effective that muckraker Lincoln Steffens called him \"the best mayor of the best-governed city in America.\"",
    legacy:"Reforms from a century ago that still shape how Cleveland runs its own utilities."},
  {id:22, name:"Newton D. Baker", years:"1871–1937", cat:"Politics", color:"blue",
    quote:"A reformer's spirit, carried to Washington.",
    story:"A reform-minded Cleveland mayor, Baker went on to serve as U.S. Secretary of War during World War I, carrying the city's progressive spirit onto the national stage during one of the country's most consequential moments.",
    legacy:"A hometown reformer who helped lead the country through a world war."},
  {id:23, name:"James A. Garfield", years:"1831–1881", cat:"Politics", color:"blue",
    quote:"From a canal-boat driver to the presidency.",
    story:"Raised and educated in the Western Reserve, Garfield rose from a canal-boat driver to the 20th President of the United States — a Northeast Ohio story of ambition and public service cut short by an assassin's bullet.",
    legacy:"A reminder that this region has always produced people who reach for more."},
  {id:24, name:"George V. Voinovich", years:"1936–2016", cat:"Politics", color:"blue",
    quote:"Restoring a city's credit — and its confidence.",
    story:"Elected mayor as Cleveland teetered near a second financial default, Voinovich helped restore the city's credit and confidence — a turnaround that launched him to the governorship and U.S. Senate.",
    legacy:"A financial comeback that gave Cleveland its footing back."},
  {id:25, name:"Dennis Kucinich", years:"b. 1946", cat:"Politics", color:"blue",
    quote:"Refusing to sell what belonged to the people.",
    story:"At 31, Kucinich became Cleveland's youngest big-city mayor, famously refusing to sell the city's public power system even at great political cost — a decision now credited with saving Clevelanders money for generations.",
    legacy:"A stand that still saves Cleveland households money on their electric bill."},
  {id:26, name:"Michael R. White", years:"b. 1951", cat:"Politics", color:"blue",
    quote:"Twelve years, one rebuilt downtown.",
    story:"Over twelve years as mayor, White drove a wave of downtown redevelopment — including the Gateway sports and entertainment district — reshaping Cleveland's skyline and its sense of possibility.",
    legacy:"A downtown many Clevelanders now take for granted, built on his watch."},
  {id:27, name:"Florence Ellinwood Allen", years:"1884–1966", cat:"Civil Rights & Law", color:"pink",
    quote:"Breaking a barrier that had stood for the nation's entire history.",
    story:"A leading voice for women's suffrage, Allen went on to become the first woman to serve as chief judge of a U.S. federal appeals court — breaking barriers in law that had stood for the nation's entire history.",
    legacy:"A first on the bench that opened the door for every woman judge who followed."},
  {id:28, name:"Frank Lausche", years:"1895–1990", cat:"Politics", color:"blue",
    quote:"Decades of trust, earned one term at a time.",
    story:"Rising from Cleveland mayor to Ohio governor and U.S. senator, Lausche's decades of public trust made him one of the most enduring political figures Ohio has ever produced.",
    legacy:"Trust built over decades, from City Hall to the U.S. Senate."},
  {id:29, name:"George Washington Crile", years:"1864–1943", cat:"Medicine", color:"aqua",
    quote:"A transfusion that changed what surgery could survive.",
    story:"A co-founder of the Cleveland Clinic, Crile performed one of the world's first successful direct blood transfusions and pioneered treatments for surgical shock — discoveries that would go on to save countless lives far beyond Cleveland.",
    legacy:"A discovery made in Cleveland that still saves lives in operating rooms everywhere."},
  {id:30, name:"Harvey Cushing", years:"1869–1939", cat:"Medicine", color:"aqua",
    quote:"The father of modern neurosurgery.",
    story:"Born and trained in Cleveland, Cushing is widely regarded as the father of modern neurosurgery, developing techniques still used in operating rooms around the world today.",
    legacy:"Surgical techniques from a Cleveland-trained mind, still used worldwide."},
  {id:31, name:"Donald A. Glaser", years:"1926–2013", cat:"Science", color:"aqua",
    quote:"A tool that let scientists see the invisible.",
    story:"A Cleveland-born physicist, Glaser won the Nobel Prize for inventing the bubble chamber — a tool that let scientists literally see subatomic particles for the first time, unlocking decades of physics discovery.",
    legacy:"A Cleveland idea that helped physicists see the building blocks of everything."},
  {id:32, name:"Frederick C. Robbins", years:"1916–2003", cat:"Medicine", color:"aqua",
    quote:"A breakthrough that helped end a disease families feared.",
    story:"Working at Case Western Reserve, Robbins helped grow poliovirus in tissue culture — a Nobel Prize-winning breakthrough that made the polio vaccine possible and helped end a disease that once terrified American families.",
    legacy:"Research done here helped free a generation of children from fear."},
  {id:33, name:"Jim Lovell", years:"b. 1928", cat:"Science & Exploration", color:"aqua",
    quote:"A safe return that became a legend.",
    story:"Born in Cleveland, Lovell commanded NASA's Apollo 13 mission, whose crew's safe return from a near-catastrophic accident became one of the most celebrated feats in the history of American spaceflight.",
    legacy:"A Cleveland-born commander who brought his crew home against the odds."},
  {id:34, name:"Albert A. Michelson & Edward W. Morley", years:"1852–1931 / 1838–1923", cat:"Science", color:"aqua",
    quote:"An experiment that pointed toward relativity.",
    story:"In 1887, working at what's now Case Western Reserve, these two scientists ran the famous Michelson-Morley experiment — a result so unexpected it helped point the way toward Einstein's theory of relativity.",
    legacy:"A surprising result from a Cleveland lab that helped rewrite modern physics."},
  {id:35, name:"Langston Hughes", years:"1901–1967", cat:"Literature", color:"orange",
    quote:"A voice found in a Cleveland classroom.",
    story:"Hughes found his voice as a writer while attending Cleveland's Central High School, going on to become one of the defining poets of the Harlem Renaissance and American literature.",
    legacy:"A poet's voice, first found here, that still speaks to readers everywhere."},
  {id:36, name:"Harvey Pekar", years:"1939–2010", cat:"Literature & Comics", color:"orange",
    quote:"The everyday, made extraordinary.",
    story:"A Cleveland file clerk with no artistic training, Pekar turned the everyday grit of working-class life into \"American Splendor,\" one of the most acclaimed and honest comic series ever created.",
    legacy:"Proof that Cleveland's ordinary streets held extraordinary stories worth telling."},
  {id:37, name:"Jerry Siegel & Joe Shuster", years:"1914–1996 / 1914–1992", cat:"Comics & Culture", color:"orange",
    quote:"A hero dreamed up in a Glenville bedroom.",
    story:"Two Glenville High School classmates dreamed up a hero who could leap tall buildings — and gave the world Superman, launching an entire genre of American storytelling from a bedroom in Cleveland.",
    legacy:"An entire genre of American storytelling, born from two Cleveland teenagers."},
  {id:38, name:"Dorothy Fuldheim", years:"1893–1989", cat:"Journalism", color:"orange",
    quote:"Nearly five decades of hard-hitting truth.",
    story:"Fuldheim became one of the first women in America to anchor a daily televised newscast, delivering hard-hitting commentary from Cleveland for nearly five decades and paving the way for women in broadcast journalism.",
    legacy:"A door she opened on-air that every woman in broadcast news walked through next."},
  {id:39, name:"Adella Prentiss Hughes", years:"1869–1950", cat:"Arts & Music", color:"orange",
    quote:"A city that decided it deserved a great orchestra.",
    story:"Hughes organized the concerts that grew into the Cleveland Orchestra in 1918, founding one of the world's great symphony orchestras and establishing Cleveland as a serious cultural capital.",
    legacy:"A concert series that grew into a world-class orchestra Clevelanders still fill seats for."},
  {id:40, name:"George Szell", years:"1897–1970", cat:"Music", color:"orange",
    quote:"Twenty-four years of exacting brilliance.",
    story:"Over 24 exacting years as music director, Szell built the Cleveland Orchestra's sound and reputation into one of the finest in the world — a legacy still heard in Severance Hall today.",
    legacy:"A sound he shaped decades ago, still filling Severance Hall today."},
  {id:41, name:"Toni Morrison", years:"1931–2019", cat:"Literature", color:"orange",
    quote:"A Nobel voice, shaped by this region.",
    story:"Raised in nearby Lorain and shaped by the Greater Cleveland region, Morrison became the first African American woman to win the Nobel Prize in Literature, writing novels that changed how America understood its own history.",
    legacy:"A regional upbringing that produced one of literature's most essential voices."},
  {id:42, name:"Bill Watterson", years:"b. 1958", cat:"Comics & Culture", color:"orange",
    quote:"Walking away rather than compromise the work.",
    story:"Raised in Chagrin Falls, Watterson created \"Calvin and Hobbes\" — then famously walked away at the height of its fame rather than compromise it, leaving behind one of the most beloved comic strips in American history.",
    legacy:"A body of work protected on principle, still beloved decades later."},
  {id:43, name:"Alan Freed", years:"1921–1965", cat:"Music & Media", color:"orange",
    quote:"The night rock and roll got its name.",
    story:"A Cleveland radio DJ, Freed popularized the phrase \"rock and roll\" and hosted the Moondog Coronation Ball in 1952 — widely considered the first rock concert ever — a legacy that helped bring the Rock &amp; Roll Hall of Fame to Cleveland's shores.",
    legacy:"A radio show that helped earn Cleveland its place as the home of rock and roll."},
  {id:44, name:"Bob Hope", years:"1903–2003", cat:"Entertainment", color:"orange",
    quote:"A Cleveland kid who spent his career giving back.",
    story:"Raised in Cleveland, Hope became one of the 20th century's most beloved entertainers, spending decades of his career performing for American troops around the world.",
    legacy:"A career spent making people laugh, especially the ones far from home."},
  {id:45, name:"Halle Berry", years:"b. 1966", cat:"Entertainment", color:"orange",
    quote:"A door in Hollywood, opened for the first time.",
    story:"Raised in Cleveland, Berry became the first woman of color to win the Academy Award for Best Actress, opening doors in Hollywood that had stayed closed for generations.",
    legacy:"A first that changed who gets to stand on that stage."},
  {id:46, name:"Paul Newman", years:"1925–2008", cat:"Entertainment & Philanthropy", color:"orange",
    quote:"Giving away every dollar of profit, on principle.",
    story:"Born in Shaker Heights, Newman parlayed his Hollywood career into Newman's Own, a food company that gives away 100% of its profits to charity, and co-founded camps that let seriously ill children just be kids.",
    legacy:"A grocery-aisle idea that has quietly funded charity for decades."},
  {id:47, name:"Bone Thugs-n-Harmony", years:"formed 1990s", cat:"Music", color:"orange",
    quote:"Putting Cleveland's sound on the map.",
    story:"This Cleveland hip-hop group pioneered a fast, melodic rap style in the 1990s that influenced a generation of artists — putting the city's sound on the national map.",
    legacy:"A distinct Cleveland sound that still echoes through hip-hop today."},
  {id:48, name:"Jesse Owens", years:"1913–1980", cat:"Sports", color:"blue",
    quote:"Four gold medals, one defiant answer.",
    story:"Training at Cleveland's East Technical High School, Owens went on to win four gold medals at the 1936 Berlin Olympics — a defiant answer to Nazi ideology delivered on the world's biggest stage.",
    legacy:"A performance on the world's biggest stage that started on a Cleveland track."},
  {id:49, name:"Jim Brown", years:"1936–2023", cat:"Sports & Civil Rights", color:"blue",
    quote:"Using his platform for more than the game.",
    story:"Widely considered the greatest running back in NFL history, Brown used his platform as a Cleveland Browns star to become one of the era's most outspoken civil rights and social activists.",
    legacy:"A legend on the field who used his voice off it, too."},
  {id:50, name:"Larry Doby", years:"1923–2003", cat:"Sports & Civil Rights", color:"blue",
    quote:"Breaking a barrier with far less recognition.",
    story:"In 1947, Doby broke the American League's color barrier with the Cleveland Indians, facing down the same hostility Jackie Robinson endured — with far less recognition — to open the game to Black players.",
    legacy:"A barrier broken in Cleveland that opened the door for every Black player who followed."},
  {id:51, name:"LeBron James", years:"b. 1984", cat:"Sports & Philanthropy", color:"blue",
    quote:"A championship, then a school.",
    story:"The Akron-born superstar delivered Cleveland its first major sports championship in 52 years in 2016, then poured his resources into founding the I Promise School, giving struggling Akron-area kids a shot at a better future.",
    legacy:"A title that ended a 52-year drought — and a school still changing kids' futures."},
  {id:52, name:"Jim Thome", years:"b. 1970", cat:"Sports", color:"blue",
    quote:"A franchise icon, remembered for his humility.",
    story:"A Hall of Fame slugger for the Cleveland Indians, Thome became a beloved franchise icon known as much for his humility and community ties as for his towering home runs.",
    legacy:"A hometown hero whose reputation off the field matched his power on it."}
];

const LGD_COLORS = { green:"#164430", orange:"#EE7331", aqua:"#19B9A9", blue:"#1A8DA9", pink:"#C0629A" };
var currentLegendId = null;

function lgdInitials(name){
  return name.split(/[\s&]+/).filter(function(w){ return w.length>0 && w[0]===w[0].toUpperCase(); })
    .slice(0,2).map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
}
function lgdIsoWeek(date){
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  var firstThursday = new Date(Date.UTC(d.getUTCFullYear(),0,4));
  var diff = d - firstThursday;
  return 1 + Math.round(diff / (7*24*60*60*1000));
}
function lgdWeeklyIndex(){
  return lgdIsoWeek(new Date()) % LEGENDS.length;
}
function renderLegendCard(id){
  var l = LEGENDS.filter(function(x){ return x.id === id; })[0];
  if (!l) return;
  currentLegendId = id;
  document.getElementById('lgdHero').style.background = 'var(--green)';
  document.getElementById('lgdAvatar').textContent = lgdInitials(l.name);
  document.getElementById('lgdTag').textContent = l.cat;
  document.getElementById('lgdYears').textContent = l.years;
  document.getElementById('lgdName').textContent = l.name;
  document.getElementById('lgdQuote').innerHTML = '\u201C' + l.quote + '\u201D';
  document.getElementById('lgdStory').textContent = l.story;
  document.getElementById('lgdLegacy').textContent = l.legacy;
}
function renderLgdChipGrid(){
  var grid = document.getElementById('lgdChipGrid');
  grid.innerHTML = LEGENDS.map(function(l){
    return '<button class="lgd-chip" onclick="renderLegendCard(' + l.id + ');closeLgdBrowse();window.scrollTo({top:0,behavior:\'smooth\'});">' +
      '<span class="lgd-chip-dot" style="background:' + LGD_COLORS[l.color] + '">' + lgdInitials(l.name) + '</span>' +
      '<span><span class="lgd-chip-name">' + l.name + '</span><span class="lgd-chip-cat">' + l.cat + '</span></span>' +
    '</button>';
  }).join('');
}
function toggleLgdBrowse(){
  var grid = document.getElementById('lgdChipGrid');
  var btn = document.getElementById('lgdBrowseToggle');
  var open = grid.classList.toggle('open');
  btn.textContent = open ? 'Hide legends \u2191' : 'Browse all 52 \u2193';
}
function closeLgdBrowse(){
  document.getElementById('lgdChipGrid').classList.remove('open');
  document.getElementById('lgdBrowseToggle').textContent = 'Browse all 52 \u2193';
}
function initLegendsView(){
  renderLegendCard(LEGENDS[lgdWeeklyIndex()].id);
  renderLgdChipGrid();
}
function openGiveModal(){
  document.getElementById('give-modal').classList.add('open');
  document.getElementById('modal-body-select').style.display = 'block';
  document.getElementById('modal-confirm').style.display = 'none';
}
function closeGiveModal(){ document.getElementById('give-modal').classList.remove('open'); }
function confirmGive(){
  document.getElementById('modal-body-select').style.display = 'none';
  document.getElementById('modal-confirm').style.display = 'block';
}

/* ============================================================
   CLEVELAND HISTORY QUIZ
   ============================================================
   NOTE FOR MAINTAINERS: this feature started as a week-of-year "This
   Week in Cleveland History" quiz (hence the "hw" prefix still used on
   older helper functions/vars: HW_STORE, hwStep, hwAnswer, hwAlertBtn,
   hwCurrentWeekIndex, etc.). It was later redesigned to ask one question
   per YEAR (1974–2025) instead — see HIST_QUIZ below, where each item's
   `wk` field is what maps it onto a calendar week (wk 0 -> the 1st week
   of the year -> the 1974 question, wk 51 -> the last week -> 2025).
   Newer code added for that redesign (leaderboard, sharing) uses an
   "hq" prefix (Historical Quiz) instead — so both prefixes are correct
   and intentional, not a typo. `idx` and `wk` are always equal today
   (one question per week, in chronological order), but they're kept as
   separate fields/lookups (hqQuestionForWeek) in case that 1:1 mapping
   ever needs to change (e.g. re-ordering weeks without reordering years).
   localStorage key: tcf_hist_quiz_v1 (answers persist indefinitely,
   there's no per-year reset — unlike the old weekly-history version).
   ============================================================ */
const HIST_QUIZ = [{"idx": 0, "wk": 0, "y": 1914, "cat": "tcf", "diff": "Easy", "q": "In 1914, Cleveland invented a brand-new way for everyday people to give back — one pool of gifts, from many neighbors, that would help the city forever. What was it?", "options": ["America’s first public library", "The country’s first food bank", "The world’s first community foundation", "The first Red Cross chapter"], "correct": 2, "reveal": "Cleveland banker Frederick Goff had a simple idea: a permanent “savings account” for the whole community, so anyone — not just the very rich — could leave something behind for needs no one could predict yet. He called it the Cleveland Foundation. Newspapers across the country wrote about it within weeks, and today communities all over the world have one."}, {"idx": 1, "wk": 1, "y": 1963, "cat": "tcf", "diff": "Easy", "q": "In 1963, Ohio’s first public two-year college got its start in Cleveland. So many people wanted in that the line to apply wrapped around the block. What’s the school called?", "options": ["Cuyahoga Community College (Tri-C)", "Cleveland State University", "Lakeland Community College", "Case Western Reserve University"], "correct": 0, "reveal": "The state law that allowed community colleges didn’t include money to plan one, so the Cleveland Foundation stepped in with early planning grants to help get Tri-C off the ground. More than 900,000 students have walked through its doors since."}, {"idx": 2, "wk": 2, "y": 1973, "cat": "tcf", "diff": "Easy", "q": "In the early 1970s, some of downtown Cleveland’s grand old theaters sat empty and were about to be torn down. What were they going to be replaced with?", "options": ["A highway interchange", "An indoor shopping mall", "A new office tower", "Parking lots"], "correct": 3, "reveal": "Volunteers from the Junior League of Cleveland led a campaign to save them, and the Cleveland Foundation backed the effort starting in 1973. The restored Ohio, Palace and State Theatres grew into Playhouse Square — the largest performing arts center in the country outside New York City."}, {"idx": 3, "wk": 3, "y": 1974, "cat": "sports", "diff": "Easy", "q": "On June 4, 1974, a Cleveland Indians promotion at Municipal Stadium got so far out of hand that umpires forfeited the game to the Texas Rangers. What was the promotion?", "options": ["Free Fireworks Night", "Ten Cent Beer Night", "Nickel Hot Dog Night", "Bat Day"], "correct": 1, "reveal": "Roughly 25,000 people showed up for unlimited 10-cent beers. Fans streamed onto the field in the ninth inning with the game tied, and the Rangers and Indians ended up swinging bats side by side to protect each other. It remains one of the most infamous nights in American sports."}, {"idx": 4, "wk": 4, "y": 1975, "cat": "equity", "diff": "Medium", "q": "Frank Robinson made national history with the Cleveland Indians in April 1975. What did he become?", "options": ["The American League's first designated hitter", "The first player-owner in MLB history", "The first player to manage from the dugout in uniform", "Major League Baseball's first Black manager"], "correct": 3, "reveal": "Robinson was hired as player-manager and homered in his first at-bat on Opening Day at Municipal Stadium. Cleveland broke a color barrier in the manager's office 28 years after Larry Doby broke the American League's playing barrier — also in a Cleveland uniform."}, {"idx": 5, "wk": 5, "y": 1976, "cat": "sports", "diff": "Medium", "q": "The Cavaliers' first playoff run in franchise history, capped by a seven-game series win over the Washington Bullets, is remembered by what nickname?", "options": ["The Miracle of Richfield", "Believeland '76", "The Coliseum Comeback", "The Bicentennial Run"], "correct": 0, "reveal": "The Cavs played in Richfield, about 25 miles south of downtown, and fans rushed the floor after the clincher. Center Jim Chones broke his foot before the conference finals, and Cleveland lost to Boston — a “what if” fans argued about for decades."}, {"idx": 6, "wk": 6, "y": 1977, "cat": "politics", "diff": "Medium", "q": "In 1977 Cleveland elected a 31-year-old mayor — the youngest person to lead a major American city at the time — who was nicknamed “the Boy Mayor.” Who was he?", "options": ["Dennis Kucinich", "Ralph Perk", "George Voinovich", "Michael R. White"], "correct": 0, "reveal": "Kucinich refused to sell the city-owned electric utility, Muny Light, to private interests. That fight helped trigger the events of the following year — and he survived a recall election by fewer than 300 votes."}, {"idx": 7, "wk": 7, "y": 1978, "cat": "politics", "diff": "Medium", "q": "On December 15, 1978, Cleveland became the first major American city since the Great Depression to do what?", "options": ["File for federal bankruptcy protection", "Have its budget taken over by the state", "Dissolve its elected school board", "Default on its financial obligations"], "correct": 3, "reveal": "Note the wording — Cleveland defaulted, it did not declare bankruptcy. The city could not repay roughly $15 million in short-term notes. It took until 1987 to fully climb out, and the stigma shaped how outsiders talked about Cleveland for a generation."}, {"idx": 8, "wk": 8, "y": 1979, "cat": "equity", "diff": "Medium", "q": "On September 10, 1979, Cleveland public schools began what, under an order from U.S. District Judge Frank J. Battisti?", "options": ["Court-ordered crosstown busing to desegregate the schools", "Year-round school calendars", "Open enrollment across district lines", "Mandatory school uniforms"], "correct": 0, "reveal": "Battisti ruled in 1976 that the district had maintained unconstitutional segregation. Cleveland's first day of busing was tense but peaceful, partly because of a multi-year public education campaign funded by more than $1 million from the Cleveland Foundation, plus grassroots groups like WELCOME."}, {"idx": 9, "wk": 9, "y": 1980, "cat": "politics", "diff": "Medium", "q": "Cleveland hosted the only presidential debate of the 1980 campaign, held October 28 at Public Hall. Which two candidates faced off?", "options": ["Jimmy Carter and Ronald Reagan", "Gerald Ford and Jimmy Carter", "Ronald Reagan and Walter Mondale", "George H.W. Bush and Michael Dukakis"], "correct": 0, "reveal": "This is the debate where Reagan asked the country, “Are you better off than you were four years ago?” He won the election a week later. Cleveland's 1980 census also landed that year: the city had fallen to 573,822 people, down from a peak of nearly 915,000 in 1950."}, {"idx": 10, "wk": 10, "y": 1981, "cat": "sports", "diff": "Medium", "q": "On May 15, 1981, Indians pitcher Len Barker did something against the Toronto Blue Jays that has happened fewer than 25 times in MLB history. What was it?", "options": ["Threw a perfect game", "Recorded an unassisted triple play", "Hit for the cycle as a pitcher", "Struck out 20 batters"], "correct": 0, "reveal": "It was a cold, drizzly Friday night and only a few thousand fans were in the stands at Municipal Stadium to see 27 up, 27 down. Cleveland City Council also shrank from 33 members to 21 that year."}, {"idx": 11, "wk": 11, "y": 1982, "cat": "arts", "diff": "Hard", "q": "On June 17, 1982, what Cleveland institution published its final edition, leaving the Plain Dealer as the city's only major daily newspaper?", "options": ["The Cleveland Leader", "The Cleveland Press", "The Cleveland News", "The Call & Post"], "correct": 1, "reveal": "The Press had been a dominant civic voice since 1878, and under longtime editor Louis Seltzer it could make or break a politician. That same year the Cleveland Foundation made the country's first community-foundation program-related investment, buying the Bulkley complex to keep the Playhouse Square restoration alive."}, {"idx": 12, "wk": 12, "y": 1983, "cat": "tcf", "diff": "Medium", "q": "In 1983, the Cleveland Foundation urged City Hall to start planning a public education campaign about a new disease that U.S. health officials had named just a year earlier. What was it?", "options": ["Lead poisoning", "AIDS", "Tuberculosis", "Measles"], "correct": 1, "reveal": "While some cities were slow to respond, the Cleveland Foundation encouraged City Hall to act early and later funded the city’s first AIDS awareness campaign. Cleveland’s approach became the model for a national partnership that helped cities across the country fight the disease."}, {"idx": 13, "wk": 13, "y": 1984, "cat": "tcf", "diff": "Medium", "q": "In 1984 Steven A. Minter became chief executive of the Cleveland Foundation. What made his appointment a national first?", "options": ["He was the first African American to lead a major community foundation in the United States", "He was the first leader recruited from outside Ohio", "He was the first former mayor to lead a foundation", "He was the youngest person ever to lead a major foundation"], "correct": 0, "reveal": "Minter, a Cleveland-area native, had served as the number-two official at the U.S. Department of Education under President Carter. He led the foundation until 2003, through the era that produced Gateway, the Rock Hall, and the neighborhood development system the city still relies on."}, {"idx": 14, "wk": 14, "y": 1985, "cat": "tcf", "diff": "Medium", "q": "By the mid-1980s, Northeast Ohio’s economy had stalled. In 1985 the Cleveland Foundation made a new top priority to help turn things around. What was it?", "options": ["Building a new airport", "Bringing the Olympics to Cleveland", "Creating jobs and helping businesses grow", "Moving City Hall to the lakefront"], "correct": 2, "reveal": "Job and business creation has been a top priority ever since — supporting entrepreneurs, manufacturers and new industries like biotechnology. Fun fact: that same year, a local couple opened the Foundation’s very first fund that let a family recommend its own grants to causes they care about — a way of giving that many families use today."}, {"idx": 15, "wk": 15, "y": 1986, "cat": "arts", "diff": "Easy", "q": "On September 27, 1986, Cleveland set a world record with a United Way fundraiser that went spectacularly sideways. What was released over Public Square?", "options": ["About 1.5 million balloons", "50,000 paper lanterns", "A million rose petals", "10,000 doves"], "correct": 0, "reveal": "Balloonfest '86 looked glorious for about 30 seconds. Then weather pushed the balloons back down over the city and Lake Erie — grounding a runway at Burke Lakefront Airport and hampering a Coast Guard search for two missing boaters. 1986 was also the year Cleveland was chosen as the site of the Rock and Roll Hall of Fame."}, {"idx": 16, "wk": 16, "y": 1987, "cat": "sports", "diff": "Easy", "q": "In the January 1987 AFC Championship Game at Municipal Stadium, which quarterback led a 98-yard march in the closing minutes to tie the game and send it to overtime — a sequence Clevelanders simply call “The Drive”?", "options": ["Jim Kelly", "John Elway", "Boomer Esiason", "Dan Marino"], "correct": 1, "reveal": "Denver won in overtime and went to the Super Bowl. The next January, Earnest Byner fumbled at the Denver goal line in another AFC title game — “The Fumble.” On a brighter note, 1987 was also the year Cleveland finally emerged from default."}, {"idx": 17, "wk": 17, "y": 1988, "cat": "arts", "diff": "Medium", "q": "Which now-legendary band was formed in Cleveland in 1988 by a studio assistant and janitor who recorded his first demos for free during off-hours?", "options": ["The Black Keys", "Nine Inch Nails", "Devo", "Filter"], "correct": 1, "reveal": "Trent Reznor was working at Right Track Studio when owner Bart Koster let him use the room between bookings. Reznor played nearly everything himself. *Pretty Hate Machine* followed in 1989, and NIN became one of the most influential acts of the era."}, {"idx": 18, "wk": 18, "y": 1989, "cat": "politics", "diff": "Medium", "q": "In 1989, Cleveland voters elected Michael R. White in a bruising race against City Council President George Forbes. What was significant about White's tenure?", "options": ["He became Cleveland's second African American mayor and served three terms, the longest run to that point", "He was the first mayor to be recalled", "He was the first mayor who had never held elected office", "He was the first Republican elected mayor since 1941"], "correct": 0, "reveal": "White was a state senator from Glenville when he won. Over 1990–2002 he presided over Gateway, the Rock Hall, the Browns' departure and replacement, and a downtown building boom. Carl Stokes, elected in 1967, had been the first."}, {"idx": 19, "wk": 19, "y": 1990, "cat": "citybuilding", "diff": "Medium", "q": "What downtown project formally opened on March 29, 1990, converting the old rail concourse beneath Terminal Tower into a shopping and entertainment center?", "options": ["The Flats East Bank", "Tower City Center", "The Galleria at Erieview", "The Avenue at Playhouse Square"], "correct": 1, "reveal": "Tower City reopened Public Square as a destination and gave the Rapid a genuine downtown hub. Also in 1990, Cuyahoga County voters approved a “sin tax” on cigarettes and alcohol to finance the Gateway complex."}, {"idx": 20, "wk": 20, "y": 1991, "cat": "citybuilding", "diff": "Medium", "q": "In 1991 a new skyscraper topped off at roughly 948 feet, becoming the tallest building in Ohio — a title it still holds. What is it?", "options": ["Terminal Tower", "The Sherwin-Williams headquarters tower", "200 Public Square (the BP Building)", "Key Tower"], "correct": 3, "reveal": "Designed by César Pelli and originally called Society Center, it was briefly the tallest building between New York and Chicago. Terminal Tower had held the Ohio crown since 1930."}, {"idx": 21, "wk": 21, "y": 1992, "cat": "arts", "diff": "Hard", "q": "In 1992 the Cleveland Orchestra achieved a first for any American orchestra. What was it?", "options": ["It became the first American orchestra to establish a residency at Austria's Salzburg Festival", "It was the first to tour China", "It was the first to broadcast a full season live on television", "It was the first to record a complete Beethoven cycle digitally"], "correct": 0, "reveal": "Under music director Christoph von Dohányi, the orchestra performed regularly at Salzburg from 1990 to 1996 — evidence for the claim that the city punches far above its weight culturally. (The Mark Price–Brad Daugherty–Larry Nance Cavs also won 57 games and reached the Eastern Conference Finals that year.)"}, {"idx": 22, "wk": 22, "y": 1993, "cat": "tcf", "diff": "Easy", "q": "Thanks to one retired dentist’s gift in 1993, people driving into Cleveland on I-71 at night started seeing something new glowing on the skyline. What was it?", "options": ["A giant lighted billboard", "Church steeples, lit up at night", "Floodlit murals in the Flats", "A lighted welcome arch over the highway"], "correct": 1, "reveal": "Dr. Ray Erickson thought the city’s church spires were beautiful and hated that no one could enjoy them after dark. He left his life savings to the Cleveland Foundation to light them up. The “Beacon of Hope” program started in Tremont, and by 2014 seventeen churches were glowing thanks to his gift."}, {"idx": 23, "wk": 23, "y": 1994, "cat": "tcf", "diff": "Medium", "q": "When Cleveland’s new downtown ballpark and arena opened in 1994, the Cleveland Foundation helped pay for something fans walked past on game day. What was it?", "options": ["The ballpark’s scoreboard", "The teams’ new uniforms", "The stadium lights", "The public plazas and outdoor art"], "correct": 3, "reveal": "The Foundation wanted the spaces around the Gateway sports complex to be as exciting as the games. An art competition drew 125 entries, and the winners — like the “Sports Stacks” sculpture and the “Who’s on First?” benches — became instant fan favorites."}, {"idx": 24, "wk": 24, "y": 1995, "cat": "arts", "diff": "Medium", "q": "The Rock and Roll Hall of Fame and Museum opened on Cleveland's lakefront in September 1995. Who designed its glass-pyramid building?", "options": ["Frank Gehry", "Zaha Hadid", "I.M. Pei", "Philip Johnson"], "correct": 2, "reveal": "Cleveland beat out Memphis, New York, and others for the Hall, leaning on DJ Alan Freed's role in popularizing the phrase “rock and roll” and a national call-in poll. 1995 was double-edged: the Indians reached their first World Series since 1954, and in November Art Modell announced he was moving the Browns to Baltimore."}, {"idx": 25, "wk": 25, "y": 1996, "cat": "arts", "diff": "Medium", "q": "Cleveland rap group Bone Thugs-n-Harmony won a Grammy in 1996 for which song?", "options": ["“1st of tha Month”", "“Thuggish Ruggish Bone”", "“Tha Crossroads”", "“Notorious Thugs”"], "correct": 2, "reveal": "The tribute to Eazy-E spent eight weeks at number one on the Billboard Hot 100. The group came out of Cleveland's East Side. 1996 was also Cleveland's bicentennial — and the year the NFL deal was struck that let Cleveland keep the Browns name, colors, and records."}, {"idx": 26, "wk": 26, "y": 1997, "cat": "sports", "diff": "Medium", "q": "The Indians won the American League pennant in 1997 but lost Game 7 of the World Series in extra innings. To whom?", "options": ["Florida Marlins", "Arizona Diamondbacks", "Atlanta Braves", "New York Yankees"], "correct": 0, "reveal": "Cleveland was three outs from a title in the ninth inning of Game 7 in Miami. The Marlins tied it, then won in the 11th. It is still, for a lot of Clevelanders, the one that hurts most."}, {"idx": 27, "wk": 27, "y": 1998, "cat": "equity", "diff": "Medium", "q": "In 1998, Stephanie Tubbs Jones won election to Congress from Ohio's 11th District, succeeding the retiring Louis Stokes. What first did she achieve?", "options": ["First sitting judge elected to Congress from Ohio", "First Cleveland native elected to Congress", "First woman to represent Cuyahoga County", "First African American woman elected to Congress from Ohio"], "correct": 3, "reveal": "A Glenville native and Collinwood High and Case Western Reserve graduate, Tubbs Jones had already been the first African American to serve as Cuyahoga County Prosecutor. She served in Congress until her death in 2008."}, {"idx": 28, "wk": 28, "y": 1999, "cat": "sports", "diff": "Easy", "q": "The expansion Browns returned to the field in September 1999. Where had the original franchise relocated after the 1995 season?", "options": ["Indianapolis", "Houston", "St. Louis", "Baltimore"], "correct": 3, "reveal": "The 1996 settlement was unprecedented: the players and owner went to Baltimore as the Ravens, but the Browns name, colors, and record book legally stayed in Cleveland, held in trust until a new team took the field. The return opener was a 43–0 loss to the Steelers."}, {"idx": 29, "wk": 29, "y": 2000, "cat": "arts", "diff": "Medium", "q": "In January 2000, what Cleveland landmark reopened after a two-year, $36 million restoration and expansion?", "options": ["The Palace Theatre", "The Cleveland Museum of Art", "The main branch of Cleveland Public Library", "Severance Hall"], "correct": 3, "reveal": "Severance, home of the Cleveland Orchestra since 1931, got its Art Deco detailing restored, a new stage shell, and modernized backstage space. Critics promptly re-crowned it one of the most beautiful concert halls in America."}, {"idx": 30, "wk": 30, "y": 2001, "cat": "politics", "diff": "Medium", "q": "Cleveland voters elected Jane Campbell in 2001. What was her distinction?", "options": ["First mayor to serve only one term", "First mayor from the West Side in a century", "First mayor previously elected to county office", "First woman elected mayor of Cleveland"], "correct": 3, "reveal": "Campbell had been a state representative and a Cuyahoga County commissioner. She took office in January 2002 and served one term before losing to Frank Jackson in 2005."}, {"idx": 31, "wk": 31, "y": 2002, "cat": "tcf", "diff": "Medium", "q": "In 2002 the Cleveland Foundation started giving small grants for neighborhood projects — with a twist. Who decides which projects win?", "options": ["A committee of neighborhood residents", "City Council", "Local business leaders", "Cleveland Foundation staff"], "correct": 0, "reveal": "The program, Neighborhood Connections, puts the decision in the hands of neighbors. Grants of $500 to $5,000 have funded everything from craft classes to bringing back beekeeping — about 1,800 resident-led projects in its first 11 years."}, {"idx": 32, "wk": 32, "y": 2003, "cat": "sports", "diff": "Easy", "q": "With the number one pick in the 2003 NBA Draft, the Cavaliers selected LeBron James out of which high school?", "options": ["Shaker Heights", "Cleveland Glenville", "Garfield Heights", "Akron St. Vincent–St. Mary"], "correct": 3, "reveal": "The Cavs had won the lottery with the worst record in the league, and the hometown kid landed in their lap. That August, Cleveland also went dark in the Northeast blackout, one of the largest power failures in North American history."}, {"idx": 33, "wk": 33, "y": 2004, "cat": "politics", "diff": "Medium", "q": "What national political event did Case Western Reserve University host in October 2004?", "options": ["A presidential debate", "The vice-presidential debate between Dick Cheney and John Edwards", "The Democratic National Convention", "A Supreme Court confirmation hearing"], "correct": 1, "reveal": "Ohio was the decisive state in the 2004 election, and Cuyahoga County was the state's biggest Democratic vote bank. Campaigns treated Cleveland as a must-visit stop — a pattern that has repeated in nearly every presidential cycle since."}, {"idx": 34, "wk": 34, "y": 2005, "cat": "politics", "diff": "Medium", "q": "Frank G. Jackson was elected mayor in 2005. What record did he eventually set?", "options": ["Youngest mayor since Dennis Kucinich", "First mayor to serve five terms", "Longest-serving mayor in Cleveland history, at four terms", "First sitting mayor to be elected governor"], "correct": 2, "reveal": "Jackson, a Central neighborhood native and City Council president, served from 2006 to 2021 — 16 years. He was the first sitting council member elected mayor since 1867."}, {"idx": 35, "wk": 35, "y": 2006, "cat": "politics", "diff": "Hard", "q": "A 2006 Ohio law barred cities like Cleveland from requiring what of their municipal employees?", "options": ["Holding an Ohio driver's license", "Submitting to random drug testing", "Living inside the city limits", "Membership in a union"], "correct": 2, "reveal": "Residency requirements had kept thousands of police officers, firefighters, and city workers — and their property taxes and school enrollments — inside Cleveland. The Ohio Supreme Court upheld the law in 2009. Its effect on the city's population is still argued about today."}, {"idx": 36, "wk": 36, "y": 2007, "cat": "tcf", "diff": "Hard", "q": "The Cleveland Foundation started in 1914 with one idea and grew one gift at a time. By 2007, how much had Clevelanders built up in the savings that fund its grants every year?", "options": ["About $218 million", "About $2.18 billion", "About $21.8 billion", "About $980 million"], "correct": 1, "reveal": "That’s a long way from 1925, when the Foundation had $400,000 and could give out $15,000 in grants. Because the money is invested and only a portion is spent each year, gifts made generations ago are still helping Cleveland today."}, {"idx": 37, "wk": 37, "y": 2008, "cat": "citybuilding", "diff": "Medium", "q": "In October 2008, RTA opened the HealthLine, a bus rapid transit route running along which street?", "options": ["Detroit Avenue", "Euclid Avenue", "Carnegie Avenue", "Superior Avenue"], "correct": 1, "reveal": "The roughly $200 million project rebuilt Euclid Avenue from Public Square to University Circle with dedicated bus lanes and new streetscape. It became a national model for BRT and helped unlock a wave of MidTown and Health-Tech Corridor investment. That summer, the FBI raided county offices, opening the Cuyahoga County corruption scandal."}, {"idx": 38, "wk": 38, "y": 2009, "cat": "politics", "diff": "Hard", "q": "In November 2009, after a sweeping federal corruption investigation, Cuyahoga County voters approved a new charter. What did it replace the three county commissioners with?", "options": ["A state-appointed county manager", "An elected county executive and an 11-member county council", "A merged city-county government", "A regional authority covering five counties"], "correct": 1, "reveal": "Issue 6 was the biggest overhaul of county government in more than 150 years, passed while officials including commissioner Jimmy Dimora and auditor Frank Russo were under federal investigation. The new structure took effect in January 2011."}, {"idx": 39, "wk": 39, "y": 2010, "cat": "tcf", "diff": "Easy", "q": "In May 2010, about 10,000 people packed Cleveland’s St. Clair-Superior neighborhood for the very first edition of what event?", "options": ["A lakefront kite festival", "A citywide food truck rally", "A neighborhood jazz festival", "The Cleveland Asian Festival"], "correct": 3, "reveal": "A small $5,000 grant from the Cleveland Foundation helped launch the festival, with performances, food and shopping for Asian Pacific-American Heritage Month. It grew fast — to more than 30,000 people in 2011 and 50,000 in 2012."}, {"idx": 40, "wk": 40, "y": 2011, "cat": "tcf", "diff": "Medium", "q": "Starting in 2011, the Cleveland Foundation and partners created a $4 million fund of “microloans.” Who were these small loans mainly meant to help?", "options": ["College students paying tuition", "First-time homebuyers", "Small-business owners who couldn’t get a regular bank loan", "Large factories expanding overseas"], "correct": 2, "reveal": "A study found local entrepreneurs — especially women, immigrants and people of color — were missing out on about $38 million in small loans. Fun fact: one early borrower was former Cleveland Browns player Al “Bubba” Baker, who used his loan to start selling his signature barbecue ribs locally."}, {"idx": 41, "wk": 41, "y": 2012, "cat": "citybuilding", "diff": "Medium", "q": "In May 2012, Ohio's first casino opened in downtown Cleveland inside which landmark building?", "options": ["Terminal Tower", "The Higbee Building on Public Square", "The Arcade", "Public Auditorium"], "correct": 1, "reveal": "The old Higbee's department store — the one from *A Christmas Story* — became the Horseshoe Casino, now JACK Cleveland Casino. It was the first of four casinos authorized by Ohio voters in 2009."}, {"idx": 42, "wk": 42, "y": 2013, "cat": "citybuilding", "diff": "Medium", "q": "In June 2013, who took over day-to-day management of Cleveland's lakefront parks, including Edgewater, Euclid Beach, Villa Angela, and Gordon Park?", "options": ["The Cleveland-Cuyahoga County Port Authority", "The City of Cleveland's parks department", "Cleveland Metroparks", "The Ohio Department of Natural Resources"], "correct": 2, "reveal": "The state had run them since 1978 and had deferred millions in maintenance. Cleveland kept ownership; the Metroparks took a 99-year lease at a dollar a year. Within a few years Edgewater had a new beach house, a playground, and a summer concert series."}, {"idx": 43, "wk": 43, "y": 2014, "cat": "sports", "diff": "Medium", "q": "In July 2014, LeBron James announced his return to Cleveland in a first-person essay published where?", "options": ["The Players' Tribune", "Sports Illustrated", "On his own Instagram account", "The Plain Dealer"], "correct": 1, "reveal": "The essay, titled “I'm Coming Home,” framed the return as a commitment to Northeast Ohio. 2014 was a heavy year for the city: Cleveland hosted Gay Games 9 in August, and in November a Cleveland police officer shot and killed 12-year-old Tamir Rice at Cudell Recreation Center."}, {"idx": 44, "wk": 44, "y": 2015, "cat": "equity", "diff": "Medium", "q": "In 2015 the City of Cleveland entered a federal consent decree with the U.S. Department of Justice. What did it cover?", "options": ["Airport contracting practices", "The school district", "Reform of the Cleveland Division of Police", "Sewer overflows into Lake Erie"], "correct": 2, "reveal": "The Justice Department had found a pattern and practice of excessive force. The decree mandated new use-of-force policies, crisis intervention training, and civilian oversight, following years of organizing after the killing of Tamir Rice in 2014."}, {"idx": 45, "wk": 45, "y": 2016, "cat": "sports", "diff": "Easy", "q": "The Cavaliers won the 2016 NBA Finals after trailing the Golden State Warriors 3–1. Whose chase-down rejection in Game 7 is known in Cleveland simply as “The Block”?", "options": ["LeBron James", "Tristan Thompson", "Kevin Love", "Iman Shumpert"], "correct": 0, "reveal": "Golden State had won an NBA-record 73 games. No team had ever come back from 3–1 in the Finals. The win ended a 52-year championship drought for Cleveland's major pro teams, and an estimated 1.3 million people turned out for the parade."}, {"idx": 46, "wk": 46, "y": 2017, "cat": "sports", "diff": "Medium", "q": "In late summer 2017 the Indians set an American League record with how many consecutive wins?", "options": ["18", "26", "20", "22"], "correct": 3, "reveal": "The streak ran from late August into mid-September and captured national attention. Cleveland won the AL Central by a wide margin — then lost the division series to the Yankees after going up 2–0."}, {"idx": 47, "wk": 47, "y": 2020, "cat": "politics", "diff": "Medium", "q": "In September 2020, Cleveland hosted the first presidential debate between Donald Trump and Joe Biden. At what venue?", "options": ["The Health Education Campus shared by Case Western Reserve University and the Cleveland Clinic", "Cleveland State University's Wolstein Center", "John Carroll University", "Public Auditorium"], "correct": 0, "reveal": "The debate moved to Cleveland on short notice after Notre Dame withdrew, and it was held under heavy pandemic protocols. 2020 was also the year Ohio's first COVID-19 cases were confirmed in Cuyahoga County, and the year George Floyd protests filled downtown streets."}, {"idx": 48, "wk": 48, "y": 2022, "cat": "politics", "diff": "Medium", "q": "Justin Bibb took the oath of office in January 2022. What was notable about him?", "options": ["He was the first mayor born outside Cleveland", "He had previously served as county executive", "At 34 he was the city's second-youngest mayor and its first millennial mayor", "He had spent 20 years on City Council first"], "correct": 2, "reveal": "Bibb grew up in Mount Pleasant on the southeast side and was sworn in just after midnight at the East 131st Street library branch he used as a kid. He is Cleveland's fourth African American mayor."}, {"idx": 49, "wk": 49, "y": 2023, "cat": "tcf", "diff": "Medium", "q": "In 2023, the Cleveland Foundation — the world's first community foundation — moved its headquarters out of Playhouse Square. Which neighborhood did it move to?", "options": ["University Circle", "Tremont", "MidTown", "Ohio City"], "correct": 2, "reveal": "The new building sits at East 66th and Euclid, deliberately placed as an anchor investment in MidTown and Hough rather than downtown. It was the foundation's first move out of the central business district in more than a century. Lillian Kuri was also named president and CEO that year."}, {"idx": 50, "wk": 50, "y": 2024, "cat": "other", "diff": "Easy", "q": "On April 8, 2024, Cleveland sat squarely in the path of totality for what?", "options": ["A visible aurora borealis", "A lunar eclipse", "A meteor shower", "A total solar eclipse"], "correct": 3, "reveal": "Cleveland got nearly four minutes of darkness in the middle of the afternoon, and hundreds of thousands of visitors came for it — the first total solar eclipse visible from the city in more than 200 years. Cleveland also hosted the NCAA Women's Final Four that April."}, {"idx": 51, "wk": 51, "y": 2025, "cat": "equity", "diff": "Medium", "q": "CentroVilla25 opened on West 25th Street in the Clark-Fulton neighborhood in spring 2025. What is it?", "options": ["A soccer stadium", "A Latino marketplace, food hall, and small-business incubator", "A performing arts venue", "A regional transit center"], "correct": 1, "reveal": "The roughly $12 million adaptive reuse of a vacant warehouse was led by the Northeast Ohio Hispanic Center for Economic Development and was decades in the making. It gives Cleveland's fastest-growing community a permanent commercial and cultural anchor."}];
const HIST_CAT_LABEL = {"tcf": "Cleveland Foundation", "sports": "Sports", "politics": "Civic Life", "equity": "Equity & Community", "arts": "Arts & Culture", "citybuilding": "City Building", "other": "Cleveland"};
var currentHistIdx = null;
var hwAnswerLocked = false;

function hqCatLabel(cat){ return HIST_CAT_LABEL[cat] || 'Cleveland'; }

/* ---------- Weekly cadence: each quiz item (wk 0\u201351) maps 1:1 onto a week of the calendar year, so week 1 of the year surfaces 1974, week 2 surfaces 1975, ... week 52 surfaces 2025. This lets us default to "this week's" question and notify people weekly. ---------- */
const HW_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HW_MONTH_LEN = [31,28,31,30,31,30,31,31,30,31,30,31];
const HW_TOTAL_WEEKS = 52;
function hwDoyFromMonthDay(m0,d){ var n=d; for (var i=0;i<m0;i++) n+=HW_MONTH_LEN[i]; return n; }
function hwMonthDayFromDoy(doy){ var remaining=doy; for (var i=0;i<12;i++){ if (remaining<=HW_MONTH_LEN[i]) return [i,remaining]; remaining-=HW_MONTH_LEN[i]; } return [11,31]; }
function hwWeekIndexFromDoy(doy){ return Math.min(Math.floor((doy-1)/7), HW_TOTAL_WEEKS-1); }
function hwWeekRangeDoy(weekIndex){ var start=weekIndex*7+1; var end=(weekIndex===HW_TOTAL_WEEKS-1)?365:start+6; return [start,end]; }
function hwWeekIndexFromDate(date){ var m0=date.getMonth(), d=date.getDate(); if (m0===1 && d===29) d=28; return hwWeekIndexFromDoy(hwDoyFromMonthDay(m0,d)); }
function hwCurrentWeekIndex(){ return hwWeekIndexFromDate(new Date()); }
function hwWeekDateLabel(weekIndex){
  var r = hwWeekRangeDoy(weekIndex);
  var md1 = hwMonthDayFromDoy(r[0]), md2 = hwMonthDayFromDoy(r[1]);
  return md1[0]===md2[0]
    ? HW_MONTHS[md1[0]] + ' ' + md1[1] + '\u2013' + md2[1]
    : HW_MONTHS[md1[0]] + ' ' + md1[1] + ' \u2013 ' + HW_MONTHS[md2[0]] + ' ' + md2[1];
}
function hqQuestionForWeek(weekIndex){
  for (var i=0;i<HIST_QUIZ.length;i++){ if (HIST_QUIZ[i].wk === weekIndex) return HIST_QUIZ[i]; }
  return null;
}

/* ---------- Score persistence (localStorage) ---------- */
function hwStoreKey(){ return 'tcf_hist_quiz_v2'; }
function hwLoadStore(){
  try {
    var raw = window.localStorage.getItem(hwStoreKey());
    if (raw){
      var parsed = JSON.parse(raw);
      if (parsed && parsed.answers) return parsed;
    }
  } catch(e){}
  return { answers: {} };
}
function hwSaveStore(store){
  try { window.localStorage.setItem(hwStoreKey(), JSON.stringify(store)); } catch(e){}
}
var HW_STORE = hwLoadStore();

function hqIsAnswered(idx){ return !!HW_STORE.answers[idx]; }
function hqRecordAnswer(idx, chosenIndex, wasCorrect){
  HW_STORE.answers[idx] = { chosen: chosenIndex, correct: wasCorrect };
  hwSaveStore(HW_STORE);
  hqUpdateScoreUI();
  hqRenderLeaderboard();
}
function hqScoreStats(){
  var answered = Object.keys(HW_STORE.answers).length;
  var correct = 0;
  for (var k in HW_STORE.answers){ if (HW_STORE.answers[k].correct) correct++; }
  var pct = answered ? Math.round((correct/answered)*100) : 0;
  return { answered: answered, correct: correct, pct: pct };
}
function hqUpdateScoreUI(){
  var s = hqScoreStats();
  var elC = document.getElementById('hwScoreCorrect');
  var elT = document.getElementById('hwScoreTotal');
  var elA = document.getElementById('hwScoreAnswered');
  if (elC) elC.textContent = s.correct;
  if (elT) elT.textContent = HIST_QUIZ.length;
  if (elA) elA.textContent = s.answered;
}

/* ---------- Rendering ---------- */
function renderHistYear(idx){
  currentHistIdx = idx;
  hwAnswerLocked = false;
  var q = HIST_QUIZ[idx];
  if (!q) return;
  document.getElementById('hwRange').textContent = hwWeekDateLabel(q.wk);
  document.getElementById('hwYearLine').textContent = 'This week: Cleveland, ' + q.y;

  var wrap = document.getElementById('hwCardsWrap');
  var countEl = document.getElementById('hwCount');
  var already = HW_STORE.answers[idx];
  countEl.textContent = already ? 'You\u2019ve already answered this week\u2019s question.' : 'What happened in Cleveland this year?';

  var catLabel = hqCatLabel(q.cat);
  var optionsHtml = q.options.map(function(opt, i){
    var stateClass = '';
    if (already){
      if (i === q.correct) stateClass = ' hw-opt-correct';
      else if (i === already.chosen) stateClass = ' hw-opt-incorrect';
      else stateClass = ' hw-opt-disabled';
    }
    return '<button class="hw-opt' + stateClass + '" ' + (already ? 'disabled' : 'onclick="hwAnswer(' + i + ')"') + '>' +
      '<span class="hw-opt-text">' + opt + '</span>' +
    '</button>';
  }).join('');

  var revealHtml = '';
  if (already){
    revealHtml = '<div class="hw-reveal">' +
      '<div class="hw-reveal-verdict' + (already.correct ? ' is-correct' : ' is-incorrect') + '">' + (already.correct ? '\u2713 You got it!' : '\u2717 Not quite') + '</div>' +
      '<div class="hw-event-desc">' + q.reveal + '</div>' +
    '</div>';
  }

  wrap.innerHTML =
    '<div class="hw-event-card hw-quiz-card">' +
      '<span class="hw-event-cat hw-quiz-catbadge">' + catLabel + '</span>' +
      '<span class="hw-diff-badge">' + q.diff + '</span>' +
      '<div class="hw-quiz-prompt">' + q.q + '</div>' +
      '<div class="hw-opts">' + optionsHtml + '</div>' +
      revealHtml +
    '</div>';
}
function hwAnswer(choiceIndex){
  if (hwAnswerLocked || currentHistIdx === null) return;
  var q = HIST_QUIZ[currentHistIdx];
  if (!q) return;
  hwAnswerLocked = true;
  var wasCorrect = (choiceIndex === q.correct);
  hqRecordAnswer(currentHistIdx, choiceIndex, wasCorrect);
  renderHistYear(currentHistIdx);
  showToast(wasCorrect ? 'Correct! Nice work.' : 'Not quite \u2014 see the answer below.');
}
function hwStep(dir){
  if (currentHistIdx === null) return;
  var next = currentHistIdx + dir;
  if (next < 0) next = HIST_QUIZ.length - 1;
  if (next >= HIST_QUIZ.length) next = 0;
  renderHistYear(next);
}
function hwSurprise(){
  var unanswered = [];
  for (var i=0;i<HIST_QUIZ.length;i++){ if (!hqIsAnswered(i)) unanswered.push(i); }
  var pool = unanswered.length ? unanswered : HIST_QUIZ.map(function(q){ return q.idx; });
  renderHistYear(pool[Math.floor(Math.random()*pool.length)]);
}

/* ---------- Leaderboard (mock peers + live "You" row) ---------- */
const HQ_LB_MOCK = [
  {name:'Priya K.', initials:'PK', color:'var(--tcf-pink)', answered:52, correct:47},
  {name:'Sofia G.', initials:'SG', color:'var(--tcf-mid-green)', answered:52, correct:44},
  {name:'Angela R.', initials:'AR', color:'var(--tcf-blue)', answered:15, correct:14},
  {name:'Kevin B.', initials:'KB', color:'var(--tcf-aqua)', answered:6, correct:6},
  {name:'Maria S.', initials:'MS', color:'var(--tcf-orange)', answered:45, correct:39},
  {name:'Latoya P.', initials:'LP', color:'var(--tcf-pink)', answered:38, correct:29},
  {name:'James T.', initials:'JT', color:'var(--tcf-blue)', answered:30, correct:24},
  {name:'DeShawn W.', initials:'DW', color:'var(--tcf-orange)', answered:22, correct:15},
  {name:'Tom H.', initials:'TH', color:'var(--tcf-aqua)', answered:12, correct:9},
  {name:'Mike O.', initials:'MO', color:'var(--tcf-mid-green)', answered:8, correct:5}
];
var hqLbSort = 'accuracy';
var HQ_LB_MIN_ANSWERED = 5;

function hqSetLeaderboardSort(mode){
  hqLbSort = mode;
  var a = document.getElementById('hqLbSortAccuracy'), s = document.getElementById('hqLbSortScore');
  if (a) a.classList.toggle('active', mode==='accuracy');
  if (s) s.classList.toggle('active', mode==='score');
  hqRenderLeaderboard();
}
function hqRenderLeaderboard(){
  var wrap = document.getElementById('hqLeaderboardList');
  if (!wrap) return;
  var stats = hqScoreStats();
  var rows = HQ_LB_MOCK.map(function(u){
    return { name:u.name, initials:u.initials, color:u.color, answered:u.answered, correct:u.correct, pct:Math.round((u.correct/u.answered)*100), isYou:false };
  });
  var youQualifies = stats.answered >= HQ_LB_MIN_ANSWERED;
  if (youQualifies){
    rows.push({ name:'You', initials:'YOU', color:'var(--tcf-primary)', answered:stats.answered, correct:stats.correct, pct:stats.pct, isYou:true });
  }
  rows.sort(function(a,b){
    if (hqLbSort === 'score') return b.correct - a.correct || b.pct - a.pct;
    return b.pct - a.pct || b.correct - a.correct;
  });

  var youRank = -1;
  rows.forEach(function(r,i){ if (r.isYou) youRank = i; });

  function rowHtml(r, rank){
    var statMain = hqLbSort === 'score' ? (r.correct + ' correct') : (r.pct + '%');
    var statSub = hqLbSort === 'score' ? (r.pct + '% accuracy') : (r.correct + ' correct');
    return '<div class="hq-lb-row' + (r.isYou ? ' is-you' : '') + '">' +
      '<div class="hq-lb-rank">' + rank + '</div>' +
      '<div class="nf-avatar" style="background:' + r.color + ';width:30px;height:30px;font-size:11px;">' + r.initials + '</div>' +
      '<div class="hq-lb-name">' + r.name + (r.isYou ? '<span class="you-tag">You</span>' : '') + '</div>' +
      '<div><div class="hq-lb-stat">' + statMain + '</div><div class="hq-lb-stat-sub">' + statSub + '</div></div>' +
    '</div>';
  }

  var TOP_N = 8;
  var html = rows.slice(0, TOP_N).map(function(r,i){ return rowHtml(r, i+1); }).join('');
  if (youQualifies && youRank >= TOP_N){
    html += '<div class="hq-lb-ellipsis">\u22ef</div>' + rowHtml(rows[youRank], youRank+1);
  }
  if (!youQualifies){
    var remaining = HQ_LB_MIN_ANSWERED - stats.answered;
    html += '<div class="hq-lb-locked">Answer ' + remaining + ' more question' + (remaining===1?'':'s') + ' to join the leaderboard.</div>';
  }
  wrap.innerHTML = html;
}

/* ---------- Sharing ---------- */
function hqShareScore(){
  var s = hqScoreStats();
  if (s.answered < 1){ showToast('Answer a question first, then share your score!'); return; }
  var body = 'I\u2019ve scored ' + s.correct + '/' + s.answered + ' (' + s.pct + '%) on the Cleveland History Quiz. Think you know Cleveland better? Give it a shot:';
  if (typeof NF_POSTS !== 'undefined'){
    var youInitials = initialsOf(appState.donorName);
    NF_POSTS.unshift({
      id: Date.now(), name:'You', initials: youInitials, color:'var(--tcf-orange)', type:'quiz', time:'Just now', likes:0,
      body: body,
      action: function(){ navigate('history'); }
    });
    if (typeof renderNewsFeed === 'function') renderNewsFeed();
  }
  showToast('Shared to your News Feed!');
}
function hqShareQuiz(){
  openShareModal({ subject:'Cleveland History Quiz', text:'Think you know Cleveland history? Test your knowledge of when major events happened across our city on the Giving Portal:' });
}

function initHistoryView(){
  hqUpdateScoreUI();
  hqRenderLeaderboard();
  if (currentHistIdx !== null) { renderHistYear(currentHistIdx); return; }
  var wk = hwCurrentWeekIndex();
  var q = hqQuestionForWeek(wk);
  renderHistYear(q ? q.idx : 0);
}


/* ============================================================
   NEWS FEED — pairs with the Garden's "Share Your Why" badge
   ============================================================ */
const NF_POSTS = [
  { id:1, name:'Maria S.', initials:'MS', color:'var(--tcf-aqua)', type:'why', time:'2h ago', likes:14,
    body:'My grandmother came to Cleveland with nothing and this city gave her a chance. Giving back through my fund is how I say thank you.' },
  { id:2, name:'Cleveland Foundation', initials:'CF', color:'var(--tcf-primary)', type:'news', time:'Yesterday', likes:32,
    body:'This week\u2019s Local Legend: Frederick Goff, the banker who founded the world\u2019s first community foundation right here in Cleveland in 1914.',
    action:function(){ navigate('legends'); } },
  { id:3, name:'James T.', initials:'JT', color:'var(--tcf-blue)', type:'why', time:'3d ago', likes:9,
    body:'I volunteer at the West Side Market food drive every month. Watching neighbors help neighbors is why I keep showing up.' },
  { id:5, name:'Priya K.', initials:'PK', color:'var(--tcf-pink)', type:'why', time:'5d ago', likes:18,
    body:'Cleveland gave my parents a home when they had nowhere else to go. Every gift I make is a small way of returning the favor.' }
];
var nfLiked = {};
var nfConnected = {};

function renderNewsFeed(){
  var wrap = document.getElementById('nfFeed');
  var html = '';

  if (gardenState.why && gardenState.why.unlocked && gardenState.why.detail){
    var youInitials = initialsOf(appState.donorName);
    html += '<div class="nf-post nf-you-post">' +
      '<div class="nf-post-top">' +
        '<div class="nf-avatar" style="background:var(--tcf-orange);">' + youInitials + '</div>' +
        '<div><div class="nf-post-name">You</div><div class="nf-post-meta">Shared from Grow Your City</div></div>' +
        '<div class="nf-post-badge">Your Why</div>' +
      '</div>' +
      '<div class="nf-post-body">\u201C' + escHtml(gardenState.why.detail) + '\u201D</div>' +
    '</div>';
  }

  html += NF_POSTS.map(function(p){
    var liked = nfLiked[p.id];
    var connected = nfConnected[p.id];
    var badge = p.type === 'news' ? '<div class="nf-post-badge news">Cleveland Foundation</div>' : (p.type === 'quiz' ? '<div class="nf-post-badge quiz">Quiz Score</div>' : '<div class="nf-post-badge">Why I Give</div>');
    var connectBtn = (p.type === 'news' || p.type === 'quiz') ? '' : '<button class="' + (connected?'connected':'') + '" onclick="nfConnect(' + p.id + ')">' + (connected?'\u2713 Connected':'Connect') + '</button>';
    var readMoreBtn = p.action ? '<button onclick="nfOpen(' + p.id + ')">Read more \u2192</button>' : '';
    return '<div class="nf-post">' +
      '<div class="nf-post-top">' +
        '<div class="nf-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
        '<div><div class="nf-post-name">' + p.name + '</div><div class="nf-post-meta">' + p.time + '</div></div>' +
        badge +
      '</div>' +
      (p.img ? '<img class="nf-post-img" src="' + p.img + '" alt="' + (p.alt || '') + '" loading="lazy">' : '') +
      '<div class="nf-post-body">' + p.body + '</div>' +
      '<div class="nf-post-actions">' +
        '<button class="' + (liked?'liked':'') + '" onclick="nfLike(' + p.id + ')">\u2665 ' + (p.likes + (liked?1:0)) + '</button>' +
        connectBtn + readMoreBtn +
      '</div>' +
    '</div>';
  }).join('');

  wrap.innerHTML = html;
}
function nfLike(id){ nfLiked[id] = !nfLiked[id]; renderNewsFeed(); }
function nfConnect(id){
  nfConnected[id] = !nfConnected[id];
  var post = NF_POSTS.filter(function(p){ return p.id === id; })[0];
  if (nfConnected[id] && post) showToast('Connection request sent to ' + post.name + '.');
  renderNewsFeed();
}
function nfOpen(id){
  var post = NF_POSTS.filter(function(p){ return p.id === id; })[0];
  if (post && post.action) post.action();
}

/* ============================================================
   FEATURE ALERTS — prototype toggle; in production this would
   read/write a real preference in Account Settings.
   ============================================================ */
var featureAlerts = {};
function toggleAlert(feature, btn){
  featureAlerts[feature] = !featureAlerts[feature];
  var on = featureAlerts[feature];
  btn.classList.toggle('on', on);
  var labelId = feature === 'legends' ? 'lgdAlertLabel' : 'hwAlertLabel';
  var defaultLabel = feature === 'legends' ? 'Get notified of new Legends' : 'Get weekly quiz alerts';
  var label = document.getElementById(labelId);
  if (label) label.textContent = on ? 'You\u2019ll be notified \u2014 manage in Account Settings' : defaultLabel;
  showToast(on ? 'Alerts turned on.' : 'Alerts turned off.');
}

/* ============================================================
   YOUR GIVING HISTORY
   ============================================================ */
const GH_RECURRING = [
  { name:'$500 / month', meta:'Next charge: Jul 1, 2026', mark:'alt-4' }
];
const GH_GIFTS = [
  { fund:'Greatest Needs Fund', amount:500, date:'Jun 1, 2026', method:'Recurring \u2014 Chase Bank \u2022\u2022\u2022\u2022 4471', mark:'alt-4' },
  { fund:'Arts & Culture Fund', amount:1000, date:'May 12, 2026', method:'One-time \u2014 Visa \u2022\u2022\u2022\u2022 8821', mark:'alt-2' },
  { fund:'Greatest Needs Fund', amount:500, date:'May 1, 2026', method:'Recurring \u2014 Chase Bank \u2022\u2022\u2022\u2022 4471', mark:'alt-4' },
  { fund:'Youth & Education Fund', amount:250, date:'Mar 22, 2026', method:'One-time \u2014 Chase Bank \u2022\u2022\u2022\u2022 4471', mark:'alt-3' },
  { fund:'Greatest Needs Fund', amount:500, date:'Apr 1, 2026', method:'Recurring \u2014 Chase Bank \u2022\u2022\u2022\u2022 4471', mark:'alt-4' },
  { fund:'Local Legends \u2014 Fund a Legacy', amount:100, date:'Feb 9, 2026', method:'One-time \u2014 Visa \u2022\u2022\u2022\u2022 8821', mark:'alt-1' }
];
function ghFmt(n){ return '$' + n.toLocaleString('en-US'); }
function initGivingHistoryView(){
  document.getElementById('ghLifetimeTotal').textContent = ghFmt(GH_GIFTS.reduce(function(sum,g){ return sum + g.amount; }, 0));
  document.getElementById('ghGiftCount').textContent = GH_GIFTS.length;

  document.getElementById('ghRecurringList').innerHTML = GH_RECURRING.length ? GH_RECURRING.map(function(r){
    return '<div class="row"><div class="org-mark ' + r.mark + '">$</div><div class="info"><div class="name">' + r.name + '</div><div class="meta">' + r.meta + '</div></div><button class="btn btn-ghost btn-sm" onclick="navigate(\'contributions\')">Manage</button></div>';
  }).join('') : '<div class="row"><div class="info"><div class="meta">No recurring donations on your account.</div></div></div>';

  document.getElementById('ghGiftList').innerHTML = GH_GIFTS.slice().sort(function(a, b){ return ghTime(b) - ghTime(a); }).map(function(g){
    return '<div class="row"><div class="org-mark ' + g.mark + '">$</div><div class="info"><div class="name">' + g.fund + ' \u2014 ' + ghFmt(g.amount) + '</div><div class="meta">' + g.date + ' \u00b7 ' + g.method + '</div></div></div>';
  }).join('');
}

/* V1: "Your giving history" on the home page — newest first, with the date and amount of each gift. */
function ghTime(g){ return new Date(g.date).getTime() || 0; }
function renderHomeGivingHistory(){
  var list = document.getElementById('homeGhList');
  if (!list) return;
  var gifts = GH_GIFTS.slice().sort(function(a, b){ return ghTime(b) - ghTime(a); });
  var total = gifts.reduce(function(sum, g){ return sum + g.amount; }, 0);
  var meta = document.getElementById('homeGhMeta');
  if (meta) meta.textContent = gifts.length + ' gifts · ' + ghFmt(total) + ' lifetime';
  list.innerHTML = gifts.slice(0, 5).map(function(g){
    return '<div class="row"><div class="org-mark ' + g.mark + '">$</div><div class="info"><div class="name">' + g.fund + '</div>'
      + '<div class="meta">' + g.date + ' · ' + g.method.split(' — ')[0] + '</div></div>'
      + '<div class="name" style="margin-left:auto;font-variant-numeric:tabular-nums;">' + ghFmt(g.amount) + '</div></div>';
  }).join('');
}
renderHomeGivingHistory();

/* V1: rows with fewer than four tiles keep the grid's tile size; mark them so empty cells stay white. */
function fitHomeGrids(){
  document.querySelectorAll('#prospectTiles, #openDafModule').forEach(function(el){
    var g = el.id === 'openDafModule' ? el.parentElement : el;
    var n = Array.prototype.filter.call(g.children, function(c){ return !c.classList.contains('panel-wide') && c.style.display !== 'none'; }).length;
    if (n > 0 && n < 4) g.classList.add('pg-short');
  });
}
fitHomeGrids();

/* ============================================================
   SUBTABS
   ============================================================ */
function switchSubtab(btn, contentId) {
  var prefix = contentId.split('-')[0];
  var view = btn.closest('.view');
  view.querySelectorAll('[id^="' + prefix + '-"]').forEach(function(el) { el.style.display = 'none'; });
  var target = document.getElementById(contentId);
  if (target) target.style.display = 'block';
  btn.closest('.subtabs').querySelectorAll('.subtab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

/* ============================================================
   ROUND-UPS (spare-change giving)
   Prototype only: no real Plaid session is opened here. connectRoundups()
   simulates what a successful Plaid Link callback would do — in production
   this is where you'd call Plaid Link, then POST the public_token to the
   BFF to exchange it for an access_token and start listening for
   /transactions/sync webhooks to compute round-up amounts.
   ============================================================ */
var roundupsState = { connected: false, active: true, fund: 'Greatest Needs Fund' };

function contribHandlePaymentMethodChange(sel) {
  if (sel.value !== 'roundups') return;
  var tabBtn = document.getElementById('contribRoundupsTabBtn');
  if (tabBtn) switchSubtab(tabBtn, 'contrib-roundups');
  sel.selectedIndex = 0; // Round-Ups isn't a "pick and contribute $X now" method, so reset the one-time selector
}

function connectRoundups() {
  var fundSel = document.getElementById('roundupsFund');
  roundupsState.connected = true;
  roundupsState.active = true;
  roundupsState.fund = fundSel ? fundSel.value : roundupsState.fund;

  document.getElementById('roundupsNotConnected').style.display = 'none';
  document.getElementById('roundupsConnected').style.display = 'block';
  var fundDisplay = document.getElementById('roundupsFundDisplay');
  if (fundDisplay) fundDisplay.textContent = roundupsState.fund;
  var methodMeta = document.getElementById('roundupsMethodMeta');
  if (methodMeta) methodMeta.textContent = 'Demo active · ' + roundupsState.fund;

  showToast('Demo only — no account was connected. In production this step would hand off to Plaid Link.');
}

function toggleRoundups(checkbox) {
  roundupsState.active = checkbox.checked;
  var methodMeta = document.getElementById('roundupsMethodMeta');
  if (methodMeta) methodMeta.textContent = (checkbox.checked ? 'Demo active · ' : 'Paused · ') + roundupsState.fund;
  showToast(checkbox.checked ? 'Round-Up Giving turned on.' : 'Round-Up Giving paused.');
}

/* ============================================================
   CART
   ============================================================ */
var cart = [];

function addToCart(name, amount) {
  if (!amount) amount = 1000;
  cart.push({ name: name, amount: amount });
  renderCart();
  showToast(name + ' added to grant cart (' + cart.length + ' total)');
  var cntBtns = document.querySelectorAll('#cartCountBtn');
  cntBtns.forEach(function(b) { b.textContent = cart.length; });
}

function renderCart() {
  var body = document.getElementById('cartBody');
  var total = cart.reduce(function(s,i) { return s + i.amount; }, 0);
  document.getElementById('cartTotal').textContent = '$' + total.toLocaleString();
  document.getElementById('cartSubtitle').textContent = cart.length + ' grant' + (cart.length !== 1 ? 's' : '');
  var cntBtns = document.querySelectorAll('#cartCountBtn');
  cntBtns.forEach(function(b) { b.textContent = cart.length; });
  if (!cart.length) { body.innerHTML = '<div class="cart-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" stroke-width="1.5"><path d="M3 3h2l3 12h12l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg><div style="margin-top:12px;">Your cart is empty</div></div>'; return; }
  var colors = ['var(--tcf-aqua)','var(--tcf-pink)','var(--tcf-orange)','var(--tcf-blue)','var(--tcf-mid-green)'];
  body.innerHTML = cart.map(function(item, i) {
    var initials = item.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0,2).toUpperCase();
    return '<div class="cart-item"><div class="org-mark cart-item" style="background:' + colors[i % colors.length] + ';color:#fff;width:38px;height:38px;border-radius:8px;font-size:12px;flex-shrink:0;">' + initials + '</div><div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + item.name + '</div><div style="font-size:13px;color:var(--ink-faint);">General Operating</div><button class="remove-btn" onclick="removeCart(' + i + ')">Remove</button></div><div class="amount">$' + item.amount.toLocaleString() + '</div></div>';
  }).join('');
}

function removeCart(i) { cart.splice(i, 1); renderCart(); }

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartBackdrop').classList.toggle('open');
}

function submitCart() {
  if (!cart.length) { showToast('Add some grants first.'); return; }
  var total = cart.reduce(function(s,i) { return s+i.amount; }, 0);
  var count = cart.length;
  cart = []; renderCart();
  toggleCart();
  showToast('✓ ' + count + ' grant' + (count>1?'s':'') + ' submitted · $' + total.toLocaleString() + ' total');
}

/* ============================================================
   LEGACY MODAL
   ============================================================ */
function showLegacyModal() {
  document.getElementById('legacyModal').classList.add('open');
  closeDrawer();
}
function closeLegacyModal() { document.getElementById('legacyModal').classList.remove('open'); }

/* ============================================================
   PIN SYSTEM
   ============================================================ */
var PIN_DETAILS = {
  'psp': { kind:'Integration', title:'Payment Service Provider', body:'<p>Hosted payment form (PSP-SDK). No card data touches Foundation infrastructure — PCI compliance via tokenization. Webhook fires <code>ContributionSettled</code> event → BFF → Ren iPhi mutation creates TransactionID with idempotency key.</p><div class="label">Supported Methods</div><p>ACH, Wire, Card (Visa/MC/Amex), Appreciated Securities (manual), PLAID bank link (Phase 2).</p>' },
  'plaid': { kind:'Integration (Planned)', title:'Plaid — Round-Ups', body:'<p>Not yet built. This screen is a UI placeholder for the intended flow: Plaid Link opens to authenticate the donor\'s bank, we exchange the public_token for an access_token server-side, then subscribe to <code>/transactions/sync</code> webhooks. Each posted transaction is rounded up to the nearest dollar; round-ups accrue in a ledger and sweep to the PSP as a single ACH contribution on a weekly cron.</p><div class="label">Open questions before build</div><p>Sweep cadence and minimum threshold, how to handle refunds/disputes on already-swept transactions, and whether round-ups count toward the same annual receipt as other contributions.</p>' },
  'ren-iphi-balance': { kind:'Integration', title:'Ren iPhi — Fund Balance', body:'<p>GraphQL query <code>fundBalance(fundId)</code> returns real-time NAV. Cached in Redis (5-min TTL). Circuit breaker fires after 3 failures → stale cache with banner.</p><div class="label">Auth</div><p>Service account JWT, fund-scoped RBAC. Donor can only read their own funds.</p>' },
  'ren-iphi-grants': { kind:'Integration', title:'Ren iPhi — Grant History', body:'<p>GraphQL query <code>grantHistory(fundId, page, limit)</code>. Returns DistributionID, TransactionID, status (Entered/Approved/Posted), grantee EIN, amount, date.</p>' },
  'salesforce-advisor': { kind:'Integration', title:'Salesforce CRM', body:'<p>Advisor assignment read from SF Contact object. Activity log writes: <code>Task</code> record on message send. Opportunity updated on DAF open.</p>' },
  'candid': { kind:'Integration', title:'Candid (GuideStar)', body:'<p>Nonprofit search API. Validates 501(c)(3) status, returns EIN, name, mission. Caches lookups 24h. Grantee must be 501(c)(3) in good standing.</p>' },
  'legal-config': { kind:'Config', title:'Legal Document CMS', body:'<p>Instrument of Transfer template versioned in headless CMS. Fund name and donor name interpolated server-side before rendering. Signed PDF stored in Object Storage and returned to donor.</p>' },
  'docusign': { kind:'Integration', title:'DocuSign / eSign', body:'<p>In production, DocuSign Embedded Signing captures legally binding signature. This prototype simulates the canvas-based capture. Signed document envelope stored with audit trail per ESIGN Act.</p>' },
  'idp': { kind:'Setup', title:'Identity Provider — Entra External ID', body:'<p>Microsoft Entra External ID handles authentication. MFA (TOTP) enforced. Step-up auth required for contributions &gt;$500 and grant submissions. Session JWT 8h TTL, refresh token 30 days.</p>' },
  'step-up': { kind:'Security', title:'Step-up Authentication', body:'<p>Additional MFA challenge required for financial operations: contributions &gt;$500, grant batch submissions, payment method changes. TOTP or push notification via Entra.</p>' },
  'mfa-policy': { kind:'Security', title:'MFA Policy', body:'<p>TOTP primary method. Backup: SMS (degraded). Step-up triggers: financial ops, settings changes, new device login. 6-role RBAC: Owner, Advisor, Viewer, Family, Staff, Admin.</p>' },
  'grant-event': { kind:'Event', title:'GrantBatchSubmitted Event', body:'<p>Cart submission fires <code>GrantBatchSubmitted</code> event on the bus. Durable workflow: validate EINs → write to Ren iPhi (Entered) → await Approved webhook → await Posted webhook → notify donor.</p>' },
  'contrib-event': { kind:'Event', title:'ContributionSettled Event', body:'<p>PSP webhook → BFF validates signature → fires <code>ContributionSettled</code> → Ren iPhi mutation creates TransactionID → email receipt → update fund balance cache.</p>' },
  'favorites-config': { kind:'Config', title:'Favorites & Preferences', body:'<p>Stored in Portal DB (Postgres). Synced to Salesforce as custom Contact fields. Max 50 favorites per fund advisor.</p>' }
};

document.querySelectorAll('.ipin').forEach(function(pin) {
  pin.addEventListener('click', function() {
    var id = pin.dataset.pin;
    if (!id || !PIN_DETAILS[id]) return;
    var d = PIN_DETAILS[id];
    document.getElementById('pinKind').textContent = d.kind;
    document.getElementById('pinTitle').textContent = d.title;
    document.getElementById('pinBody').innerHTML = d.body;
    document.getElementById('pinModal').classList.add('open');
  });
});

function closePin() { document.getElementById('pinModal').classList.remove('open'); }

function togglePins() {
  document.body.classList.toggle('pins-hidden');
  document.getElementById('pinToggle').style.opacity = document.body.classList.contains('pins-hidden') ? '0.4' : '1';
}

/* ============================================================
   PERFORMANCE CHART
   ============================================================ */
function drawPerfChart(btn, range) {
  if (btn) {
    document.querySelectorAll('.perf-ranges button').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
  }
  var canvas = document.getElementById('perfCanvas');
  if (!canvas) return;
  canvas.width = canvas.parentElement.offsetWidth || 340;
  canvas.height = 200;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, 200);
  var pts = [10000];
  var n = range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 52 : 12;
  for (var i = 1; i <= n; i++) { pts.push(pts[pts.length-1] * (1 + (Math.random()-0.42)*0.02)); }
  var minV = Math.min.apply(null,pts)*0.99, maxV = Math.max.apply(null,pts)*1.01;
  var W = canvas.width, H = 170, pl = 8, pr = 8, pt = 10, pb = 20;
  var cw = W-pl-pr, ch = H-pt-pb;
  function xp(i) { return pl + (i/(pts.length-1))*cw; }
  function yp(v) { return pt + ch - ((v-minV)/(maxV-minV))*ch; }
  var grad = ctx.createLinearGradient(0,pt,0,pt+ch);
  grad.addColorStop(0,'rgba(8,108,67,.3)'); grad.addColorStop(1,'rgba(8,108,67,0)');
  ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(xp(0),yp(pts[0]));
  pts.forEach(function(v,i){ctx.lineTo(xp(i),yp(v));});
  ctx.lineTo(xp(pts.length-1),yp(minV)); ctx.lineTo(xp(0),yp(minV)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#086C43'; ctx.lineWidth=2; ctx.beginPath();
  pts.forEach(function(v,i){i===0?ctx.moveTo(xp(i),yp(v)):ctx.lineTo(xp(i),yp(v));});
  ctx.stroke();
  var lp = pts[pts.length-1];
  ctx.fillStyle='#086C43'; ctx.beginPath(); ctx.arc(xp(pts.length-1),yp(lp),5,0,6.28); ctx.fill();
}

/* ============================================================
   IMPACT CALCULATOR
   ============================================================ */
var CALC_ICONS = {
  education:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z"/></svg>',
  food:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2"/><path d="M5 11v11"/><path d="M13 2c-2 0-3 3-3 6 0 2 1 3 3 3v11"/></svg>',
  housing:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  arts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.5-1.5-.5-2.3c0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/></svg>',
  health:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-8.5C.7 9 2.2 5.5 5.6 5c2-.3 3.6.8 4.4 2.2C10.8 5.8 12.4 4.7 14.4 5c3.4.5 4.9 4 3.1 7.5C15 16.65 12 21 12 21Z"/></svg>',
  environment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c8 0 14-6 14-14V4h-3C8 4 3 9 3 16v5h2Z"/><path d="M5 21c3-6 7-10 13-13"/></svg>'
};
var CALC_AREAS = [
  {id:'education',name:'Education',unitLabel:'Learning Hours',unitCost:12,color:'#1A8DA9',programDesc:'after-school programs'},
  {id:'food',name:'Food',unitLabel:'Meals',unitCost:0.50,color:'#EE7331',programDesc:'food security programs'},
  {id:'housing',name:'Housing',unitLabel:'Shelter Nights',unitCost:28,color:'#086C43',programDesc:'housing stability'},
  {id:'arts',name:'Arts',unitLabel:'Residencies',unitCost:800,color:'#C0629A',programDesc:'arts programs'},
  {id:'health',name:'Health',unitLabel:'Patient Visits',unitCost:45,color:'#CC1E4B',programDesc:'community health'},
  {id:'environment',name:'Environment',unitLabel:'Acres',unitCost:1200,color:'#19B9A9',programDesc:'conservation'}
];
var calcState = { areaId:'food', mode:'onetime', gift:500, years:10, rate:6 };
var CALC_CHART_COLOR = '#086C43';

function calcFvLump(pv,r,y){if(!r||!y)return pv;var rm=r/100/12,n=y*12;return pv*Math.pow(1+rm,n);}
function calcFvAnnuity(m,r,y){if(!r)return m*y*12;var rm=r/100/12,n=y*12;return m*((Math.pow(1+rm,n)-1)/rm);}
function calcFmt$(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n);}
function calcFmtN(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1000)return(n/1000).toFixed(1)+'K';return Math.round(n).toLocaleString();}

function calcRender() {
  var area = CALC_AREAS.find(function(a){return a.id===calcState.areaId;});
  var g=calcState.gift, y=calcState.years, r=calcState.rate, c=area.unitCost;
  var simple, invested;
  if (calcState.mode==='onetime') { simple=g; invested=calcFvLump(g,r,y); }
  else { simple=g*y*12; invested=calcFvAnnuity(g,r,y); }
  var simpleUnits=Math.floor(simple/c), investedUnits=Math.floor(invested/c);

  /* Step 1: dollar-growth cards (no area dependency) */
  var mc = '';
  [
    {label:calcState.mode==='onetime'?'Gift Today':'Total Contributed', amount:simple, best:false},
    {label:'With '+y+'-Year Growth', amount:invested, best:true}
  ].forEach(function(card){
    mc += '<div class="calc-money-card'+(card.best?' best':'')+'"><div><div class="cmc-label">'+card.label+'</div><div class="cmc-amount">'+calcFmt$(card.amount)+'</div></div></div>';
  });
  document.getElementById('calcMoneyCards').innerHTML = mc;
  calcDrawChart();

  /* Step 2: impact-area picker */
  var gh = '';
  CALC_AREAS.forEach(function(a) {
    var active = a.id===calcState.areaId;
    gh += '<button class="calc-area-btn'+(active?' active':'')+'" onclick="calcSelectArea(\'' + a.id + '\')" style="' + (active ? ('border-color:'+a.color+';background:'+a.color+'26;') : '') + '">' +
      '<div class="calc-area-icon" style="' + (active ? ('color:'+a.color+';') : '') + '">' + (CALC_ICONS[a.id]||'') + '</div>' +
      '<div class="calc-area-name" style="' + (active ? ('color:'+a.color+';') : '') + '">' + a.name + '</div>' +
    '</button>';
  });
  document.getElementById('calcAreaGrid').innerHTML = gh;

  /* Step 2: impact-unit cards, using the same gift figures from step 1 */
  var ic = '';
  [
    {label:calcState.mode==='onetime'?'Gift Today':'Total Contributed', units:simpleUnits, best:false},
    {label:'With '+y+'-Year Growth', units:investedUnits, best:true}
  ].forEach(function(card){
    ic += '<div class="calc-money-card'+(card.best?' best':'')+'"><div style="flex:1;"><div class="cmc-label">'+card.label+'</div><div class="cmc-units-n" style="color:'+area.color+';">'+calcFmtN(card.units)+'</div><div class="cmc-units-label">'+area.unitLabel+'</div></div></div>';
  });
  document.getElementById('calcImpactCards').innerHTML = ic;

  var diff=invested-simple, pct=simple>0?Math.round((diff/simple)*100):0;
  document.getElementById('calcExplanation').innerHTML='Over <strong>'+y+' years</strong>, your '+(calcState.mode==='onetime'?calcFmt$(g)+' gift':calcFmt$(g)+'/mo')+' grows from <strong>'+calcFmt$(simple)+'</strong> to <strong style="color:var(--tcf-mid-green);">'+calcFmt$(invested)+'</strong> — a <strong>+'+pct+'%</strong> increase, funding an additional <strong style="color:'+area.color+';">'+calcFmtN(Math.max(0,investedUnits-simpleUnits))+' '+area.unitLabel.toLowerCase()+'</strong> in Cleveland\'s '+area.programDesc+'.';
}

function calcDrawChart() {
  var canvas = document.getElementById('mobileCalcChart'); if(!canvas) return;
  var color = CALC_CHART_COLOR;
  canvas.width = canvas.parentElement.offsetWidth || 340; canvas.height = 160;
  var ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,160);
  var g=calcState.gift, y=calcState.years, r=calcState.rate, pts=[];
  for(var i=0;i<=y;i++){var ni=calcState.mode==='onetime'?g:g*i*12;var inv=calcState.mode==='onetime'?calcFvLump(g,r,i):(i===0?0:calcFvAnnuity(g,r,i));pts.push({n:ni,v:inv});}
  var maxV=pts[pts.length-1].v||1;
  var W=canvas.width,H=160,pl=8,pr=8,pt=8,pb=22,cw=W-pl-pr,ch=H-pt-pb;
  function xp(i){return pl+(i/(pts.length-1))*cw;}
  function yp(v){return pt+ch-(v/maxV)*ch;}
  ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();pts.forEach(function(p,i){i===0?ctx.moveTo(xp(i),yp(p.n)):ctx.lineTo(xp(i),yp(p.n));});ctx.stroke();ctx.setLineDash([]);
  var grad=ctx.createLinearGradient(0,pt,0,pt+ch);grad.addColorStop(0,color+'55');grad.addColorStop(1,color+'00');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(xp(0),yp(0));pts.forEach(function(p,i){ctx.lineTo(xp(i),yp(p.v));});ctx.lineTo(xp(pts.length-1),yp(0));ctx.closePath();ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();pts.forEach(function(p,i){i===0?ctx.moveTo(xp(i),yp(p.v)):ctx.lineTo(xp(i),yp(p.v));});ctx.stroke();
  var lp=pts[pts.length-1];ctx.fillStyle=color;ctx.beginPath();ctx.arc(xp(pts.length-1),yp(lp.v),5,0,6.28);ctx.fill();
}

function calcSelectArea(id){calcState.areaId=id;calcRender();}
function calcSetMode(mode){
  calcState.mode=mode;
  document.getElementById('calcModeOnetime').classList.toggle('active', mode==='onetime');
  document.getElementById('calcModeMonthly').classList.toggle('active', mode==='monthly');
  document.getElementById('calcGiftLabel').textContent=mode==='monthly'?'Monthly Gift':'Gift Amount';
  var s=document.getElementById('calcGiftSlider');
  if(mode==='monthly'){s.max=1000;if(calcState.gift>1000){calcState.gift=100;s.value=100;}}else{s.max=10000;}
  document.getElementById('calcGiftDisplay').textContent=mode==='monthly'?'$'+calcState.gift+'/mo':'$'+calcState.gift.toLocaleString();
  calcRender();
}
function calcOnGift(v){calcState.gift=parseInt(v);document.getElementById('calcGiftDisplay').textContent=calcState.mode==='monthly'?'$'+v+'/mo':'$'+parseInt(v).toLocaleString();calcRender();}
function calcOnYears(v){calcState.years=parseInt(v);document.getElementById('calcYearsDisplay').textContent=v+' year'+(parseInt(v)>1?'s':'');calcRender();}
function calcOnRate(v){calcState.rate=parseFloat(v);document.getElementById('calcRateDisplay').textContent=v+'%';calcRender();}

/* ============================================================
   VISION 2040
   ============================================================ */
var V_CARDS=[
  {bg:'var(--green)',deco:'🏗️',scenario:'Economic Vision',headline:'"Cleveland becomes a top-5 U.S. city for economic mobility by 2040."',body:'Cleveland sits at a crossroads. With bold investment in workforce development, entrepreneurship, and equitable hiring, it could become a national model for economic revival.',tags:['Jobs','Equity','Workforce'],q:'What most drives economic mobility?',opts:['Job training programs','Entrepreneurship support','Equitable hiring practices','Affordable housing'],type:'pragmatist'},
  {bg:'var(--green)',deco:'🎓',scenario:'Education Vision',headline:'"Every Cleveland child reads at grade level by 2040."',body:'Third-grade reading predicts high school graduation, college attendance, and lifetime earnings. Closing this gap is the single highest-leverage investment Cleveland can make.',tags:['Literacy','Schools','Equity'],q:'What most improves educational outcomes?',opts:['Early childhood programs','Teacher support & pay','After-school resources','Family engagement'],type:'builder'},
  {bg:'var(--green)',deco:'💧',scenario:'Environment Vision',headline:'"Lake Erie becomes the most protected Great Lake by 2040."',body:'Cleveland sits at the center of 21% of the world\'s fresh surface water. A bold conservation agenda could define Cleveland\'s global brand.',tags:['Lake Erie','Conservation','Water'],q:'How should Cleveland lead on water?',opts:['Stronger regulation','More restoration funding','Public education','Regional partnerships'],type:'steward'},
  {bg:'var(--green)',deco:'🎨',scenario:'Culture Vision',headline:'"Cleveland becomes a top-10 global arts destination by 2040."',body:'The Cleveland Orchestra. The Rock Hall. World-class museums. The opportunity is to make them accessible to all, not just some.',tags:['Arts','Culture','Tourism'],q:'What unlocks Cleveland\'s cultural potential?',opts:['More public investment','Better marketing','Arts in neighborhoods','Building artist livability'],type:'connector'},
  {bg:'var(--green)',deco:'🌆',scenario:'Population Vision',headline:'"Cleveland grows to 500,000 residents by 2040."',body:'For the first time in decades, Cleveland\'s population decline has leveled off. Bold investment could reverse a 70-year trend.',tags:['Population','Housing','Growth'],q:'What brings people to — and keeps them in — Cleveland?',opts:['Affordable housing','Career opportunities','Neighborhood safety','Culture & lifestyle'],type:'builder'},
  {bg:'var(--green)',deco:'❤️',scenario:'Health Vision',headline:'"Cleveland eliminates its maternal mortality gap by 2040."',body:'Black mothers in Cuyahoga County die at rates 3–4x higher than white mothers. Targeted investment in doula networks and prenatal care can close this gap.',tags:['Health','Equity','Maternal Care'],q:'What most closes health gaps?',opts:['Community health workers','Equitable care access','Preventive programs','Research & data'],type:'connector'}
];
var vBuilderProfiles = {
  pragmatist:{name:'The Pragmatist',desc:'You focus on what works — evidence-based, action-oriented, results-driven.',vision:'"The best plan is the one that gets done."'},
  connector:{name:'The Connector',desc:'You believe Cleveland\'s strength is in its people. You focus on relationships and equity.',vision:'"A rising tide lifts every boat — but only if everyone\'s in the water."'},
  builder:{name:'The City Builder',desc:'You think long-term. Great cities are built over generations through consistent investment.',vision:'"Build the city you want your grandchildren to inherit."'},
  steward:{name:'The Steward',desc:'You believe Cleveland\'s greatest asset is its natural and cultural inheritance.',vision:'"We didn\'t inherit this city — we borrowed it from the future."'}
};
var vCurrent=0, vTally={};

function vBuildDots(){
  var row=document.getElementById('vDotRow'); if(!row)return;
  row.innerHTML=V_CARDS.map(function(_,i){return '<div onclick="vJump('+i+')" style="width:'+(i===vCurrent?'20px':'7px')+';height:7px;border-radius:4px;background:'+(i===vCurrent?'var(--tcf-orange)':'var(--border-strong)')+';cursor:pointer;transition:all .3s;"></div>';}).join('');
}
function vRenderCard(){
  var card=V_CARDS[vCurrent];
  var inner=document.getElementById('vCardInner'); if(!inner)return;
  document.getElementById('vCard').style.background=card.bg;
  inner.innerHTML='<div style="font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.88);margin-bottom:auto;">Vision '+(vCurrent+1)+' of '+V_CARDS.length+'</div><div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:12px;">'+card.scenario+'</div><div style="font-size:clamp(17px,4vw,22px);font-weight:700;line-height:1.2;color:#fff;margin-bottom:12px;letter-spacing:-.01em;">'+card.headline+'</div><div style="font-size:14px;line-height:1.6;color:rgba(255,255,255,.92);">'+card.body+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:16px;">'+card.tags.map(function(t){return'<span style="font-size:11px;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.9);font-weight:600;">'+t+'</span>';}).join('')+'</div><div style="position:absolute;right:-20px;bottom:-20px;font-size:100px;opacity:.06;">'+card.deco+'</div>';
  var refl=document.getElementById('vReflection'); if(refl) refl.style.display='block';
  document.getElementById('vReflQ').textContent=card.q;
  var opts=document.getElementById('vReflOpts');
  opts.innerHTML=card.opts.map(function(o,i){return'<button onclick="vPickReflection('+i+',\''+card.type+'\')" style="background:var(--surface-2);border:1.5px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;text-align:left;color:var(--ink);font-family:inherit;font-size:13.5px;font-weight:600;line-height:1.3;" id="vOpt'+i+'">'+o+'</button>';}).join('');
  var fin=document.getElementById('vFinal'); if(fin)fin.style.display='none';
  var prev=document.getElementById('vPrevBtn'); if(prev)prev.disabled=vCurrent===0;
  var next=document.getElementById('vNextBtn'); if(next)next.disabled=vCurrent===V_CARDS.length-1;
  vBuildDots();
}
function vPickReflection(idx,type){
  document.querySelectorAll('[id^="vOpt"]').forEach(function(b,i){b.style.background=i===idx?'rgba(238,115,49,.15)':'var(--surface-2)';b.style.borderColor=i===idx?'var(--tcf-orange)':'var(--border)';b.style.color=i===idx?'var(--tcf-orange)':'var(--ink)';});
  vTally[type]=(vTally[type]||0)+1;
  setTimeout(function(){if(vCurrent<V_CARDS.length-1){vGoCard(1);}else{vShowFinal();}},600);
}
function vSkip(){if(vCurrent<V_CARDS.length-1){vGoCard(1);}else{vShowFinal();}}
function vGoCard(dir){var next=vCurrent+dir;if(next<0||next>=V_CARDS.length)return;vCurrent=next;vRenderCard();}
function vJump(idx){vCurrent=idx;vRenderCard();}
function vShowFinal(){
  var refl=document.getElementById('vReflection');if(refl)refl.style.display='none';
  var fin=document.getElementById('vFinal');if(!fin)return;fin.style.display='block';
  var entries=Object.entries(vTally);var profileKey=entries.length?entries.sort(function(a,b){return b[1]-a[1];})[0][0]:'builder';
  var profile=vBuilderProfiles[profileKey];
  document.getElementById('vBuilderType').textContent=profile.name;
  document.getElementById('vBuilderDesc').textContent=profile.desc;
  document.getElementById('vBuilderVision').textContent=profile.vision;
}
function vReset(){vCurrent=0;vTally={};vRenderCard();var fin=document.getElementById('vFinal');if(fin)fin.style.display='none';}

/* ============================================================
   LEARNING TRACKS
   ============================================================ */
var LEARNING_TRACKS = {
  engagement:{title:'Community Engagement',eyebrow:'Community Engagement',color:'var(--tcf-mid-green)',description:'How philanthropy shapes and responds to the communities it serves.',totalMinutes:'~18',courses:[
    {title:'What Does It Mean to Give Locally?',tag:'Community Engagement · 5 min',body:'<p style="margin-bottom:14px;">Giving locally is different from giving to national organizations. When you give through a community foundation like The Cleveland Foundation, your dollars stay close — funding programs designed by and for Cleveland residents.</p><p style="margin-bottom:14px;">Local philanthropy builds on existing community relationships. It means supporting organizations that have earned the trust of the neighborhoods they serve over decades.</p><p>The Cleveland Foundation has been a steward of local giving since 1914 — longer than any other community foundation in the world.</p>'},
    {title:'Listening Before Giving: The Donor\'s Role in Community',tag:'Community Engagement · 7 min',body:'<p style="margin-bottom:14px;">The most effective philanthropists share a habit: they listen before they give. That means engaging with community members, nonprofit leaders, and program staff not as recipients of charity, but as experts in their own lives.</p><p style="margin-bottom:14px;">Trust-based philanthropy emphasizes multi-year general operating support, minimal reporting requirements, and honest two-way communication between donors and grantees.</p><p>The Cleveland Foundation facilitates connections between donors and nonprofits — helping you engage as a partner, not just a check-writer.</p>'},
    {title:'Measuring What Matters: Impact Beyond Numbers',tag:'Community Engagement · 6 min',body:'<p style="margin-bottom:14px;">How do you know if your giving is working? The instinct is to count things — meals served, students tutored, families housed. Numbers matter, but they can also mislead.</p><p style="margin-bottom:14px;">Effective impact measurement asks not just "how many?" but "how much change?" It looks at outcomes over time, not just outputs in a given year.</p><p>Asking hard questions about impact is an act of respect for the community, not a vote of no confidence in nonprofits.</p>'}
  ]},
  estate:{title:'Estate Planning',eyebrow:'Estate Planning',color:'var(--tcf-orange)',description:'A gift in your will or estate plan can be the most powerful philanthropic act of your lifetime.',totalMinutes:'~25',courses:[
    {title:'The Basics of a Charitable Bequest',tag:'Estate Planning · 8 min',body:'<p style="margin-bottom:14px;">A charitable bequest is a gift you make through your will or living trust. It\'s one of the simplest ways to leave a lasting philanthropic legacy — and it costs you nothing during your lifetime.</p><p style="margin-bottom:14px;">Bequests can take many forms. A specific bequest names a dollar amount or particular asset. A residual bequest leaves a percentage of what remains after other gifts.</p><p>The Cleveland Foundation can work with you and your estate attorney to structure a bequest that reflects your values.</p>'},
    {title:'Giving Appreciated Assets: Stocks, Property & More',tag:'Estate Planning · 9 min',body:'<p style="margin-bottom:14px;">One of the most tax-efficient philanthropic strategies is donating appreciated assets — stocks, real estate, or other investments that have grown in value.</p><p style="margin-bottom:14px;">If you donate the asset directly to a Donor Advised Fund, the organization sells it and no capital gains tax is owed. The full value goes to work philanthropically.</p><p>Your financial advisor and a TCF philanthropic advisor can model the difference for your specific situation.</p>'},
    {title:'Writing a Legacy Statement: Why Your Values Matter',tag:'Estate Planning · 8 min',body:'<p style="margin-bottom:14px;">A legacy statement is a written expression of why you give, what you hope your philanthropy achieves, and what you want future generations to understand about your intentions.</p><p style="margin-bottom:14px;">Legacy statements aren\'t legal documents — they\'re personal ones. They\'re written for family members, for the organizations you support, and for yourself.</p><p>The Cleveland Foundation can guide you through the process and ensure your intentions are honored long after you\'re gone.</p>'}
  ]},
  endowments:{title:'Endowments',eyebrow:'Endowments',color:'var(--tcf-blue)',description:'An endowment is a gift that keeps giving — permanently. The principal is invested and protected while earnings fund causes in perpetuity.',totalMinutes:'~20',courses:[
    {title:'What Is an Endowment, Exactly?',tag:'Endowments · 5 min',body:'<p style="margin-bottom:14px;">An endowment is a pool of invested assets whose principal is never spent. Instead, a portion of the investment earnings — typically 4–5% per year — is distributed to fund programs or operations.</p><p style="margin-bottom:14px;">Think of it like a river fed by a spring. The spring (your original gift) never runs dry. The river (annual distributions) keeps flowing forever.</p><p>The Cleveland Foundation manages over $3 billion in endowed assets on behalf of thousands of donors.</p>'},
    {title:'How Endowment Earnings Are Calculated',tag:'Endowments · 5 min',body:'<p style="margin-bottom:14px;">Most endowments use a spending policy — a formula that determines how much can be distributed each year. A common approach is the 5% rule.</p><p style="margin-bottom:14px;">If you establish a $100,000 endowment, you might expect roughly $4,000–$5,000 in annual distributions. Over 20 years, that\'s $80,000–$100,000 in grants while the principal remains intact.</p><p>The Cleveland Foundation\'s investment committee oversees a diversified portfolio with a long track record of returns.</p>'},
    {title:'Named Endowments: Creating a Living Legacy',tag:'Endowments · 5 min',body:'<p style="margin-bottom:14px;">A named endowment allows you to attach your name to a permanent fund that supports a cause you care about, forever.</p><p style="margin-bottom:14px;">Named funds are often used to honor a life well-lived. Families establish them in memory of a parent, spouse, or child. Alumni establish them to honor a mentor.</p><p>Once established, a named endowment is listed in Cleveland Foundation annual reports — a permanent record of your commitment.</p>'},
    {title:'Building an Endowment Over Time',tag:'Endowments · 5 min',body:'<p style="margin-bottom:14px;">You don\'t have to give a large lump sum to create a meaningful endowment. Many donors build their funds incrementally — making annual contributions that accumulate alongside investment growth.</p><p style="margin-bottom:14px;">A Donor Advised Fund at the Cleveland Foundation can serve as a bridge: make contributions when it\'s tax-advantageous, then transfer funds to an endowment when you\'re ready.</p><p>TCF philanthropic advisors can model different funding timelines and show you exactly how your endowment would grow.</p>'}
  ]},
  foundations:{title:'Community Foundations',eyebrow:'Community Foundations',color:'var(--tcf-aqua)',description:'Community foundations are unique philanthropic institutions — neither purely private nor purely public.',totalMinutes:'~12',courses:[
    {title:'What Is a Community Foundation?',tag:'Community Foundations · 3 min',body:'<p style="margin-bottom:14px;">A community foundation is a publicly supported charitable organization that serves a specific geographic region. It pools charitable gifts from many donors, manages them, and distributes grants to local nonprofits.</p><p style="margin-bottom:14px;">The Cleveland Foundation, established in 1914, was the world\'s first community foundation. Today there are over 900 across the United States.</p><p>Community foundations are not middlemen — they are active partners in community change.</p>'},
    {title:'Community Foundations vs. Private Foundations',tag:'Community Foundations · 4 min',body:'<p style="margin-bottom:14px;">A private foundation gives you maximum control. You set the strategy, hire staff, select grantees yourself. The trade-off: significant startup costs, ongoing administrative burden, and a 5% annual payout requirement.</p><p style="margin-bottom:14px;">A community foundation DAF trades some control for simplicity, expertise, and efficiency. TCF handles investments, compliance, grantee vetting, and reporting. You focus on the giving.</p><p>For most donors, a DAF at a community foundation is the more practical and often more impactful choice.</p>'},
    {title:'The Cleveland Foundation\'s Role in Greater Cleveland',tag:'Community Foundations · 3 min',body:'<p style="margin-bottom:14px;">The Cleveland Foundation is more than a grant-making institution. Over 110 years, it has become one of the most trusted civic institutions in Greater Cleveland.</p><p style="margin-bottom:14px;">TCF has played a catalytic role in some of the region\'s most significant transformations: the revitalization of University Circle, development of the Health-Tech Corridor, and workforce development initiatives connecting thousands to careers.</p><p>When you give through TCF, you\'re connecting to a network of philanthropists and civic leaders working on problems too complex for any single donor to solve alone.</p>'},
    {title:'How Community Foundations Invest for the Long Term',tag:'Community Foundations · 2 min',body:'<p style="margin-bottom:14px;">TCF manages its endowment through a diversified portfolio overseen by a professional investment committee and advised by top-tier investment consultants.</p><p style="margin-bottom:14px;">Donors at the Cleveland Foundation benefit from this institutional scale even at modest fund sizes. A $25,000 DAF at TCF is invested in the same portfolio as a $25 million endowment.</p><p>Over a multi-decade time horizon, that difference in investment performance can meaningfully increase the total philanthropic impact of your giving.</p>'}
  ]}
};

var currentTrackId = null;

function openLearningTrack(trackId) {
  var track = LEARNING_TRACKS[trackId];
  if (!track) return;
  currentTrackId = trackId;

  // Prep DOM before navigating
  document.getElementById('lt-index').style.display = 'none';
  document.getElementById('lt-detail').style.display = 'block';
  document.getElementById('lt-reader').style.display = 'none';
  document.getElementById('lt-eyebrow').textContent = track.eyebrow;
  document.getElementById('lt-title').textContent = track.title;
  document.getElementById('lt-description').textContent = track.description;
  document.getElementById('lt-course-count').textContent = track.courses.length;
  document.getElementById('lt-time').textContent = track.totalMinutes;
  document.getElementById('lt-intro-card').style.borderLeft = '4px solid ' + track.color;

  var container = document.getElementById('lt-courses');
  container.innerHTML = track.courses.map(function(course, i) {
    return '<div class="lt-course-card" data-idx="' + i + '" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;margin-bottom:12px;cursor:pointer;display:flex;gap:14px;align-items:flex-start;box-shadow:var(--shadow-sm);"><div style="width:36px;height:36px;border-radius:8px;background:' + track.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--font-head);font-weight:700;color:#fff;font-size:14px;">' + (i+1) + '</div><div style="flex:1;min-width:0;"><div style="font-weight:700;color:var(--tcf-primary);font-size:15px;margin-bottom:4px;line-height:1.3;">' + course.title + '</div><div style="font-size:12px;color:var(--ink-faint);">' + course.tag + '</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" stroke-width="2.5" style="flex-shrink:0;margin-top:4px;"><path d="M9 18l6-6-6-6"/></svg></div>';
  }).join('');

  container.querySelectorAll('.lt-course-card').forEach(function(card) {
    card.addEventListener('click', function() { openCourse(parseInt(card.dataset.idx, 10)); });
  });

  _ltPending = true;
  navigate('learning');
}

function closeLearningTrack() {
  currentTrackId = null;
  showLtIndex();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function openCourse(index) {
  var track = LEARNING_TRACKS[currentTrackId];
  if (!track) return;
  var course = track.courses[index];
  if (!course) return;
  document.getElementById('lt-detail').style.display = 'none';
  document.getElementById('lt-reader').style.display = 'block';
  document.getElementById('lt-reader-track-label').textContent = track.title;
  document.getElementById('lt-reader-tag').textContent = course.tag;
  document.getElementById('lt-reader-title').textContent = course.title;
  document.getElementById('lt-reader-body').innerHTML = course.body;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closeCourse() {
  document.getElementById('lt-reader').style.display = 'none';
  document.getElementById('lt-detail').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ============================================================
   INIT
   ============================================================ */
renderCart();
updateGardenModuleUI();

