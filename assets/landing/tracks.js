/* ============================================================
   LANDING — site wiring that sits on top of landing.js
   Loads after landing.js (uses SITE, tcfGo, POPUPS, openPopup).
   · Non-profit Partner door (Grantee Portal · org fund · help form)
   · index.html#join deep link
   · idle-time prefetch of the next page
   Page-to-page navigation itself lives in landing.js → SITE NAVIGATION.
   ============================================================ */

/* ============================================================
   CONFIG — paste the live Grantee Portal address here. While
   blank, the "Grantee Portal" choice shows the Coming-soon window.
   ============================================================ */
var GRANTEE_PORTAL_URL = '';

/* ============================================================
   NON-PROFIT PARTNERS — one door, three destinations
   ============================================================ */
var NP_ARROW = '<svg class="p-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M8 7h9v9"/></svg>';
function npCell(kick, color, title, sub, onclick, meta){
  return '<button class="pop-cell" style="min-height:96px;" onclick="' + onclick + '">' + NP_ARROW
    + '<div class="pc-kick" style="color:' + color + ';">' + kick + '</div>'
    + '<div class="pc-title" style="font-size:18px;">' + title + '</div>'
    + '<div class="pc-sub">' + sub + '</div>'
    + (meta ? '<div class="pc-sub" style="font-family:var(--f-ledger);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-top:8px;">' + meta + '</div>' : '')
    + '</button>';
}
POPUPS.nonprofit = {k:'Nonprofit Partners', t:'What are you looking for?', h:function(){
  return '<div class="pop-pad"><p class="lede">Are you looking to access the <b>Grantee Portal</b>, your <b>organizational fund account</b>, or something else?</p></div>'
    + '<div class="pop-grid" style="grid-template-columns:1fr;">'
    + npCell('Grants', 'var(--moss)', 'Grantee Portal', 'Apply for a grant, submit a report, or check on an application.', 'openGranteePortal()', GRANTEE_PORTAL_URL ? 'Opens the Grantee Portal ↗' : 'Grantee Portal · opens separately ↗')
    + npCell('Your fund', 'var(--forest)', 'Org Fund Account', 'Balances, fiscal-year statements, distributions, and your QR code to give.', 'openOrgFund()', 'Sign in to the Giving Portal →')
    + npCell('Anything else', 'var(--emberDeep,#D3591B)', 'Something else', 'Starting a fund, a partnership, a program question — or not sure where to start.', "openPopup('nonprofitother',true)", 'Talk with our team →')
    + '</div>'
    + '<div class="pop-pad" style="padding-top:16px;"><p style="font-size:11.5px;color:var(--ink-3);">Grant applications and reporting live in the Grantee Portal. Organizational fund balances and statements live in the Giving Portal.</p></div>';
}};
POPUPS.nonprofitother = {k:'Nonprofit Partners', t:'How can we help?', h:function(){
  var topics = ['Becoming a grantee','Starting an organizational fund','A question for a program officer','Partnership or media','Something else'];
  return '<div class="pop-pad"><p class="lede">Tell us a little about what you need and the right person on our team will get back to you.</p>'
    + '<div class="f-row" style="margin-top:16px;"><label>What’s this about?</label><div class="chip-row" id="npTopic">' + topics.map(function(t,i){ return '<button class="chip' + (i===0?' sel':'') + '" onclick="chipPick(this)">' + t + '</button>'; }).join('') + '</div></div>'
    + '<div class="f-row"><label for="npOrg">Organization</label><input id="npOrg" placeholder="Your nonprofit’s name"></div>'
    + '<div class="f-row"><label for="npEmail">Your email</label><input id="npEmail" type="email" placeholder="you@yourorg.org"></div>'
    + '<div class="f-row"><label for="npMsg">Message (optional)</label><textarea id="npMsg" style="width:100%;min-height:96px;padding:13px 15px;border:1px solid var(--line-2);border-radius:13px;background:var(--paper);font:inherit;font-size:16px;resize:vertical;line-height:1.5;" placeholder="A sentence or two is plenty."></textarea></div>'
    + '<button class="btn btn-accent btn-block btn-lg" onclick="submitNonprofitHelp()">Send to our team</button>'
    + '<div class="facts" style="margin-top:18px;"><div class="fr"><span class="fk">Phone</span><span class="fv">216.861.3810</span></div><div class="fr"><span class="fk">Email</span><span class="fv">hello@clevefdn.org</span></div></div></div>';
}};
function openGranteePortal(){
  if (GRANTEE_PORTAL_URL){ window.open(GRANTEE_PORTAL_URL, '_blank', 'noopener'); closePopup(); }
  else openPopup('granteeholding', true);
}
/* Org fund holders go to the same sign-in, with their organizational fund
   (id "eac") pre-selected — portal/init.js reads ?fund= */
function openOrgFund(){ tcfGo(SITE.portal + '?signin=1&fund=eac'); }
/* PROTOTYPE: nothing is sent — the toast only simulates a hand-off to the team. */
function submitNonprofitHelp(){
  var email = (document.getElementById('npEmail').value || '').trim();
  if (email.indexOf('@') < 0){ showToast('Add an email so we can reply.'); return; }
  var topic = (document.querySelector('#npTopic .chip.sel') || {}).textContent || 'General';
  closePopup();
  showToast('Thanks — our team will reply about “' + topic + '” within two business days.');
}

/* deep link from other pages: index.html#join opens "Join the Community" */
if (location.hash === '#join') setTimeout(function(){ hideGreeter(true); openPopup('register'); }, 400);

/* speed: once the landing page is idle, quietly warm the cache for the next page */
(function(){
  /* Pages, the intro, the logo and a font only. Scripts and stylesheets are loaded with a
     ?v= fingerprint (scripts/stamp-assets.js), so prefetching their bare addresses would
     download copies the pages never use. */
  var urls = [SITE.portal, SITE.community, SITE.advisors,
              'assets/intro/welcome.html', 'assets/img/tcf-logo@2x.png', 'assets/fonts/paralucent-condensed-heavy.woff2'];
  function warm(){ urls.forEach(function(u){ var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l); }); }
  if ('requestIdleCallback' in window) requestIdleCallback(warm, {timeout: 4000}); else setTimeout(warm, 2500);
})();
