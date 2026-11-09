/* V1: the 17 Fields of Interest (supplied 11-09-2026). Registration, profile and giving plan all use this list. */
var INTERESTS_V1 = ['Agriculture, Fishing & Forestry','Arts & Culture','Community & Economic Development','Education','Environment','Health','Human Services','Information & Communications','International Human Rights','International Relations','Philanthropy','Public Affairs','Public Safety & Disaster Management','Religion','Science','Social Sciences','Sports & Recreation'];
/* ============================================================
   CORE — utilities, profile store, simulated CRM/ERP sync,
   fund data engine, navigation shell
   ============================================================ */
'use strict';

/* ---------- utilities ---------- */
var $ = function(s, r){ return (r||document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
/* jsq: quote a value for a JS string literal that sits INSIDE an HTML attribute
   (onclick="fn('…')"). Besides \ and ', it hex-escapes characters that could close
   the attribute or start markup, so stored values can't break out. */
function jsq(s){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\x22').replace(/</g,'\\x3c').replace(/&/g,'\\x26').replace(/\r?\n/g,'\\n'); }
var SESSION_KEY = 'tcf_portal_session';   /* "signed in" flag: sessionStorage, or localStorage with "Keep me signed in" */
var USD0 = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
var USD2 = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
function money(n, cents){ return (cents?USD2:USD0).format(Math.round((n||0)*100)/100); }
function moneyK(n){ var a=Math.abs(n), s=n<0?'-':''; if(a>=1e6) return s+'$'+(a/1e6).toFixed(a>=1e7?1:2).replace(/\.?0+$/,'')+'M'; if(a>=1e3) return s+'$'+(a/1e3).toFixed(a>=1e5?0:1).replace(/\.0$/,'')+'K'; return s+'$'+Math.round(a); }
function signed(n){ return (n>=0?'+':'−')+money(Math.abs(n)); }
function pct(n, d){ return (n>=0?'+':'−')+Math.abs(n*100).toFixed(d==null?1:d)+'%'; }
function initials(name){ return String(name).split(/\s+/).filter(Boolean).map(function(p){return p[0];}).join('').slice(0,2).toUpperCase(); }
function hash(s){ var h=2166136261; s=String(s); for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function gauss(r){ var u=0,v=0; while(!u)u=r(); while(!v)v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
var MS = 864e5;
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function parseYmd(s){ var p=String(s).split('-'); return new Date(+p[0],(+p[1]||1)-1,+p[2]||1); }
function addDays(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function fdate(d, style){ d = d instanceof Date ? d : parseYmd(d);
  if(style==='short') return MON[d.getMonth()]+' '+d.getDate();
  if(style==='my') return MON[d.getMonth()]+' '+d.getFullYear();
  return MON[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }
function ago(ts){ var s=(Date.now()-ts)/1000; if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago'; if(s<86400) return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; }
var TODAY = (function(){ var d=new Date(); d.setHours(0,0,0,0); return d; })();
function quarterEnd(d){ var q=Math.floor(d.getMonth()/3); return new Date(d.getFullYear(), q*3+3, 0); }

/* ---------- icons (stroke set) ---------- */
var IP = {
  menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  chev:'<path d="M9 6l6 6-6 6"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  cart:'<path d="M3 4h2.5l2.2 11h10.6l2-8H6.4"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
  fund:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 14.5h2"/>',
  chart:'<path d="M4 19V5M4 19h16"/><path d="M7 15l4-5 3 3 5-6"/>',
  pie:'<path d="M12 3v9h9"/><path d="M20.5 15A9 9 0 1 1 9 3.5"/>',
  grant:'<path d="M12 21s-7-4.4-9.2-9A5 5 0 0 1 12 6.6 5 5 0 0 1 21.2 12C19 16.6 12 21 12 21z"/>',
  history:'<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 12h1M11.5 12h1M15 12h1M8 16h1M11.5 16h1M15 16h1"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-4M14 18v3"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  feed:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9h10M7 13h10M7 17h6"/>',
  map:'<path d="M9 4l-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5V14"/><path d="M12 17.2v.1"/>',
  flower:'<circle cx="12" cy="9" r="2.4"/><path d="M12 6.6c0-3 3.5-3 3.5-.3 2.7 0 2.7 3.4.1 3.8 1.6 2.3-1.3 4.2-3 2.3M12 6.6c0-3-3.5-3-3.5-.3-2.7 0-2.7 3.4-.1 3.8-1.6 2.3 1.3 4.2 3 2.3"/><path d="M12 11.5V21M12 17c-2.5 0-4-1.5-4.5-3.5M12 18.5c2.2 0 3.6-1.2 4-3"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  face:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16a4 4 0 0 0 5 0"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  heart:'<path d="M12 20s-7-4.4-9-8.6A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9 5.4C19 15.6 12 20 12 20z"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  arrowUR:'<path d="M7 17L17 7M8 7h9v9"/>',
  sync:'<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  bank:'<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  card:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
  stock:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wire:'<path d="M4 12h16M14 6l6 6-6 6"/><path d="M4 6v12"/>',
  shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  print:'<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
  pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
function ic(name, size, sw){ size=size||20; return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.8)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IP[name]||'')+'</svg>'; }
function guilloche(cx, cy, stroke){ var c=''; for(var r=60;r<=300;r+=40){ c+='<circle cx="'+(cx||150)+'" cy="'+(cy||330)+'" r="'+r+'"/>'; } return '<svg class="gate-guilloche" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="'+(stroke||'#19B9A9')+'" stroke-width=".6" opacity=".5">'+c+'</g></svg>'; }
function pin(sys, dark){ var m={ri:['Ren iPhi',''],sf:['Salesforce','sf'],cd:['Candid','cd'],pp:['Portal profile','']}[sys]||[sys,'']; return '<span class="pin '+m[1]+(dark?' dark':'')+'">'+m[0]+'</span>'; }

/* ============================================================
   PROFILE STORE — everything a signed-in person does is saved
   to their authenticated profile. In this prototype that is the
   browser's local storage; each change is also written to a
   simulated sync queue that shows where it would land in
   Salesforce (CRM) or Ren iPhi (ERP).
   ============================================================ */
var STORE_KEY = 'tcf-v1-donor-portal-profile';   /* V1 has its own key: Full_2 shares this browser origin on GitHub Pages */
function defaultState(){
  return {
    v:1, signedIn:false, keep:true, fundId:'wff',
    profile:{ first:'Taylor', last:'Williams', email:'taylor@williams.example', phone:'(216) 555-0142',
      street:'1200 Example Ave', city:'Cleveland Heights', st:'OH', zip:'44118',
      interests:['Community & Economic Development','Arts & Culture','Human Services'],
      comms:{ grantPosted:true, receipts:true, push:false, stories:true, newsletter:true } },
    settings:{ pins:true, fyStart:{ eac:7 } },
    cart:[], grants:[], contribs:[], favorites:['Greater Cleveland Food Bank'],
    garden:{}, quiz:{}, feed:{ posts:[], likes:{}, connects:{} },
    family:{}, rebalance:{}, scenarios:[], messages:[], calls:[],
    notifRead:0, sync:[], seenOnboard:false,
    /* account: 'demo' = the Williams demo funds; 'new' = someone who just opened a fund online
       (they see only their own). persona: 'community' | 'advisor' | null, from registration.
       myFunds: funds opened through the online flow (open/). */
    account:'demo', persona:null, myFunds:[]
  };
}
var S = (function(){ try{ var raw=localStorage.getItem(STORE_KEY); if(raw){ var o=JSON.parse(raw); var d=defaultState(); for(var k in d) if(!(k in o)) o[k]=d[k]; return o; } }catch(e){} return defaultState(); })();
// anything left "queued" from a closed session has since landed
S.sync.forEach(function(e){ e.st='synced'; });
/* quiz v2 (Cleveland Foundation questions added): answers to the old set no longer line up */
if(S.quizVer!==2){ S.quiz={}; S.quizVer=2; try{ localStorage.setItem(STORE_KEY, JSON.stringify(S)); }catch(e){} }
function save(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(S)); }catch(e){} }

var SYS = { sf:'Salesforce', ri:'Ren iPhi' };
function logSync(sys, obj, text){
  var e = { id:Date.now()+Math.random(), t:Date.now(), sys:sys, obj:obj, text:text, st:'queued' };
  S.sync.unshift(e); S.sync = S.sync.slice(0,80); save();
  setTimeout(function(){ e.st='synced'; save(); var el=document.getElementById('sy-'+String(e.id).replace('.','')); if(el){ el.textContent='Synced'; el.className='status st-posted'; } }, 1400);
}
/* Reset demo = start fresh: clear every saved piece of the demo, then reload the portal at a
   one-time address (?fresh=<time>). The browser has never seen that address, so it must fetch
   the newest page from the server — and with it the newest ?v=-stamped scripts. GitHub Pages
   otherwise lets a browser reuse a saved page for up to 10 minutes after a deploy.
   init.js removes ?fresh= from the address bar and shows the "Demo reset" message. */
var FRESH_KEY = 'tcf_portal_fresh';   /* this tab's fresh token; also used for the plan frame (VIEWS.plan) */
function resetDemo(){
  try{ localStorage.removeItem(STORE_KEY); localStorage.removeItem(PLAN_STATE_KEY); localStorage.removeItem(PLAN_SUMMARY_KEY); localStorage.removeItem(PLAN_CONTEXT_KEY); localStorage.removeItem('tcf-images-inspire-v1'); }catch(e){}   // last key: Images that Inspire's in-progress picks
  LAST_PLAN = null;
  S = defaultState(); S.signedIn = true; save();
  FUND_CACHE = {}; closeSheet();
  var t = Date.now();
  try{ sessionStorage.setItem(SESSION_KEY,'1'); sessionStorage.setItem(FRESH_KEY, String(t)); sessionStorage.setItem('tcf_portal_reset_toast','1'); }catch(e){}
  location.replace(location.pathname + '?fresh=' + t + '#/home');
}

/* ============================================================
   FUNDS — fictional accounts for the prototype.
   Every balance is built day by day from contributions, grants,
   fees and investment return, so any date range reconciles.
   ============================================================ */
var POOLS = {
  growth:      { name:'Growth Pool',               color:'#EE7331', mu:.085, vol:.16, code:'GRW', ytd:.071, y1:.112, y5:.094 },
  balanced:    { name:'Balanced Pool',             color:'#19B9A9', mu:.065, vol:.10, code:'BAL', ytd:.052, y1:.083, y5:.068 },
  sri:         { name:'Social Impact Pool',        color:'#C0629A', mu:.075, vol:.14, code:'SIP', ytd:.061, y1:.097, y5:.079 },
  conservative:{ name:'Conservative Pool',         color:'#1A8DA9', mu:.04,  vol:.05, code:'CON', ytd:.031, y1:.048, y5:.041 },
  cash:        { name:'Cash Reserve',              color:'var(--mid)', mu:.02,  vol:.005,code:'CSH', ytd:.018, y1:.039, y5:.021 }
};
var MODELS = [
  { id:'conservative', name:'Conservative', mix:{ conservative:55, balanced:25, cash:20 }, avg:'4.8%', risk:'Lower risk' },
  { id:'balanced',     name:'Balanced',     mix:{ growth:30, balanced:45, conservative:20, cash:5 }, avg:'6.4%', risk:'Medium risk' },
  { id:'growth',       name:'Growth',       mix:{ growth:65, sri:20, balanced:10, cash:5 }, avg:'8.2%', risk:'Higher risk' }
];
var FUNDS = [
  { id:'wff', name:'Williams Family Fund', type:'daf', typeLabel:'Donor advised fund', no:'DAF-40218', inception:'2019-03-15', seed:26,
    color:'#EE7331', pools:{ growth:55, balanced:25, conservative:15, cash:5 },
    people:[ {n:'Taylor Williams', r:'Primary advisor', e:'taylor@williams.example', you:true}, {n:'Jordan Williams', r:'Joint advisor', e:'jordan@williams.example'}, {n:'Avery Williams-Park', r:'View & recommend', e:'avery@williams.example'} ],
    focus:['Community & Economic Development','Arts & Culture','Human Services'] },
  { id:'wng', name:'Williams Next Generation Fund', type:'daf', typeLabel:'Donor advised fund', no:'DAF-51877', inception:'2023-11-01', seed:23,
    color:'#C0629A', pools:{ sri:70, balanced:25, cash:5 },
    people:[ {n:'Taylor Williams', r:'Primary advisor', e:'taylor@williams.example', you:true}, {n:'Avery Williams-Park', r:'Joint advisor', e:'avery@williams.example'} ],
    focus:['Education','Environment'] },
  { id:'eac', name:'Eastside Arts Collective Endowment Fund', type:'org', typeLabel:'Organizational endowment fund', no:'ORG-10934', inception:'2016-07-01', seed:2,
    org:'Eastside Arts Collective', color:'#19B9A9', spending:.045, pools:{ growth:60, balanced:30, cash:10 },
    people:[ {n:'Taylor Williams', r:'Board treasurer · Authorized signer', e:'taylor@williams.example', you:true}, {n:'Renée Okafor', r:'Executive director · Authorized signer', e:'renee@eastsidearts.example'}, {n:'Marcus Bell', r:'Finance manager · View only', e:'marcus@eastsidearts.example'} ],
    focus:['Arts & Culture'] }
];
/* Which funds this account holder sees. A new account (opened online) has only its own
   funds; the demo account has the Williams funds plus any it opened online. */
var DEMO_FUNDS = FUNDS.slice();
function applyAccount(){
  var list = (S.account==='new' ? [] : DEMO_FUNDS).concat(S.myFunds || []);
  FUNDS.length = 0; list.forEach(function(f){ FUNDS.push(f); });
  if(!FUNDS.some(function(f){ return f.id===S.fundId; })) S.fundId = FUNDS[0].id;
}
applyAccount();
function fundById(id){ return FUNDS.filter(function(f){return f.id===id;})[0] || FUNDS[0]; }
function F(){ return fundById(S.fundId); }
function isOrg(){ return F().type==='org'; }
function fyStart(f){ f=f||F(); return (S.settings.fyStart && S.settings.fyStart[f.id]) || (f.type==='org'?7:1); }

/* grantee universe = organizations from the Foundation's mapped grants (v13 data) */
var ORGS = (function(){
  var seen={}, out=[];
  (typeof GRANTS!=='undefined'?GRANTS:[]).forEach(function(g){ if(!g.org||seen[g.org]) return; seen[g.org]=1;
    var h=hash(g.org); out.push({ name:g.org, program:g.program||'Community', pillar:g.pillar, hood:g.neighborhood, url:g.orgUrl, color:g.color||'#086C43',
      seal:['Platinum','Gold','Gold','Silver'][h%4], mission:g.grantName }); });
  return out;
})();
function orgByName(n){ return ORGS.filter(function(o){return o.name===n;})[0] || { name:n, program:'Community', color:'#086C43', seal:'Gold', mission:'' }; }

/* calendar-year market backdrop for a diversified portfolio (illustrative, scaled by each fund's risk) */
var MKT = {2016:.08,2017:.15,2018:-.05,2019:.18,2020:.13,2021:.14,2022:-.15,2023:.14,2024:.11,2025:.09,2026:.07};
var FUND_CACHE = {};
function build(f){
  if(FUND_CACHE[f.id]) return FUND_CACHE[f.id];
  var r = rng(f.seed*7919+13), start = parseYmd(f.inception), N = Math.round((TODAY-start)/MS)+1;
  var V=new Float64Array(N), CC=new Float64Array(N), CG=new Float64Array(N), CF=new Float64Array(N), CR=new Float64Array(N);
  var mu=0, vol=0; Object.keys(f.pools).forEach(function(k){ var w=f.pools[k]/100; mu+=w*POOLS[k].mu; vol+=w*POOLS[k].vol; });
  var beta = vol/.16, ev=[], v=0, cc=0, cg=0, cf=0, cr=0, qVals=[];
  var orgPool = ORGS.filter(function(o,i){ return (hash(o.name+f.id)%5)<2; });
  if(!orgPool.length) orgPool = ORGS.slice(0,40);
  var favs = orgPool.slice(0,8);
  for(var i=0;i<N;i++){
    var d = new Date(start.getTime()+i*MS); d.setHours(0,0,0,0);
    var m=d.getMonth(), dd=d.getDate(), y=d.getFullYear(), shock=0;
    var t = d.getTime();
    if(t>=+new Date(2020,1,20) && t<=+new Date(2020,2,23)) shock=-.011*beta;
    else if(t>+new Date(2020,2,23) && t<=+new Date(2020,7,31)) shock=.0021*beta;
    var yr = (MKT[y]!=null?MKT[y]:mu);
    var ret = i===0 ? 0 : Math.log(1+yr*beta)/365 + shock + gauss(r)*vol*.3/Math.sqrt(365);
    var gain = v*ret; v += gain; cr += gain;
    function contrib(amt, method, note){ amt=Math.round(amt); v+=amt; cc+=amt; ev.push({i:i, d:ymd(d), k:'contrib', amt:amt, method:method, note:note||''}); }
    function grant(amt, org, purpose){ amt=Math.round(amt/50)*50; if(amt<=0 || amt>v*.4) return; var pending = (N-1-i) < 7;
      var st = pending ? ((N-1-i) < 3 ? 'Entered' : 'Approved') : 'Posted';
      if(!pending){ v-=amt; cg+=amt; }
      ev.push({i:i, d:ymd(d), k:'grant', amt:amt, org:org, purpose:purpose, status:st}); }
    function fee(rate){ var a=Math.round(v*rate*100)/100; v-=a; cf+=a; ev.push({i:i, d:ymd(d), k:'fee', amt:a}); }
    if(f.id==='wff'){
      if(i===0) contrib(100000,'Securities','Gift of appreciated stock to open the fund');
      if(y===2021 && m===10 && dd===8) contrib(45000,'Securities','Gift of appreciated stock');
      if(m===11 && dd===12) contrib(15000+Math.round(r()*15)*1000,'Bank transfer (ACH)','Year-end gift');
      if(y>=2024 && dd===1) contrib(1000,'Bank transfer (ACH)','Recurring monthly gift');
      if(i===N-3) grant(2500,'Greater Cleveland Food Bank','General operating support');
      if(i===N-5) grant(5000,favs[1].name,'Program support');
      if((m===2||m===5||m===8) && dd===15 && r()<.7) contrib(2500+Math.round(r()*10)*500,'Bank transfer (ACH)','Quarterly gift');
      if(i>20 && r() < (m===11?.08:.028)) { var useFav=r()<.55, pool=useFav?favs:orgPool, o=pool[Math.floor(r()*pool.length)]; grant(500+r()*4500, o.name, r()<.7?'General operating support':'Program support'); }
    } else if(f.id==='wng'){
      if(i===0) contrib(25000,'Bank transfer (ACH)','Opening gift');
      if(i>0 && dd===1) contrib(500,'Bank transfer (ACH)','Recurring monthly gift');
      if(m===11 && dd===10) contrib(5000,'Credit card','Year-end gift');
      if(i===N-4) grant(750,orgPool[2].name,'General operating support');
      if(i>30 && r()<.022){ var o2=orgPool[Math.floor(r()*orgPool.length)]; grant(250+r()*1750, o2.name, 'General operating support'); }
    } else if(f.opening){
      /* opened online today: just the opening gift, no invented history */
      if(i===0) contrib(f.opening.amt, f.opening.method, 'Opening gift');
    } else {
      if(i===0) contrib(600000,'Bank transfer (wire)','Founding endowment gift');
      if(y===2019 && m===4 && dd===14) contrib(250000,'Bequest','Estate gift — Harlan family bequest');
      if(y===2024 && m===8 && dd===20) contrib(120000,'Bank transfer (wire)','Capital campaign endowment match');
      if(i>0 && r()<.33) contrib(40+r()*r()*1600,'Online / QR code','Community gift');
      if(m===10 && dd===16) contrib(20000+Math.round(r()*25)*1000,'Check','Annual gala proceeds');
      if(dd===15 && (m===0||m===3||m===6||m===9) && i>60){
        var avg = qVals.length ? qVals.slice(-12).reduce(function(a,b){return a+b;},0)/Math.min(12,qVals.length) : v;
        grant(avg*f.spending/4, f.org, 'Quarterly spending-policy distribution');
      }
    }
    var lastDay = new Date(y, m+1, 0).getDate();
    if(dd===lastDay && (m===2||m===5||m===8||m===11)){ fee(f.type==='org'?.002:.0025); qVals.push(v); }
    V[i]=v; CC[i]=cc; CG[i]=cg; CF[i]=cf; CR[i]=cr;
  }
  var c = { f:f, N:N, start:start, V:V, CC:CC, CG:CG, CF:CF, CR:CR, ev:ev, orgs:orgPool, favs:favs };
  FUND_CACHE[f.id] = c; return c;
}
/* the person's own actions in this session layer on top of the base series (today) */
function overlay(f){
  var add=0, out=0;
  S.contribs.forEach(function(c){ if(c.fund===f.id && contribStatus(c)==='Posted') add+=c.amt; });
  S.grants.forEach(function(g){ if(g.fund===f.id && grantStatus(g)==='Posted') out+=g.amt; });
  return { add:add, out:out };
}
function grantStatus(g){ var m=(Date.now()-g.t)/60000; return m<2?'Entered':(m<6?'Approved':'Posted'); }
function contribStatus(c){ if(c.method==='Credit card' || c.method==='Bank transfer (ACH)') return 'Posted'; return 'Pending'; }
function series(f){
  f=f||F(); var b=build(f), o=overlay(f), L=b.N-1;
  return {
    b:b, N:b.N, start:b.start,
    V:function(i){ return i<0?0:b.V[i] + (i===L?o.add-o.out:0); },
    CC:function(i){ return i<0?0:b.CC[i] + (i===L?o.add:0); },
    CG:function(i){ return i<0?0:b.CG[i] + (i===L?o.out:0); },
    CF:function(i){ return i<0?0:b.CF[i]; },
    CR:function(i){ return i<0?0:b.CR[i]; },
    date:function(i){ return new Date(b.start.getTime()+i*MS); },
    idx:function(d){ return Math.max(0, Math.min(L, Math.round((d-b.start)/MS))); }
  };
}
function balance(f){ var s=series(f); return s.V(s.N-1); }
function pendingOut(f){ f=f||F(); var p=0; S.grants.forEach(function(g){ if(g.fund===f.id && grantStatus(g)!=='Posted') p+=g.amt; }); build(f).ev.forEach(function(e){ if(e.k==='grant' && e.status!=='Posted') p+=e.amt; }); return p; }
function available(f){ f=f||F(); return Math.max(0, balance(f) - pendingOut(f) - cartTotal(f)); }
function cartTotal(f){ f=f||F(); return S.cart.filter(function(c){return c.fund===f.id;}).reduce(function(a,c){return a+c.amt;},0); }
function periodStats(s, a, b){
  var start=s.V(a-1), end=s.V(b), contrib=s.CC(b)-s.CC(a-1), grants=s.CG(b)-s.CG(a-1), fees=s.CF(b)-s.CF(a-1), ret=s.CR(b)-s.CR(a-1);
  /* time-weighted return: chains each day's investment gain on the prior day's balance,
     so contributions and grants don't distort the percentage */
  var tw=1; for(var i=Math.max(1,a); i<=b; i++){ var pv=s.V(i-1); if(pv>0) tw*=1+(s.CR(i)-s.CR(i-1))/pv; }
  var days=b-a+1, ann = days>400 ? Math.pow(tw, 365/days)-1 : null;
  return { start:start, end:end, contrib:contrib, grants:grants, fees:fees, ret:ret, retPct:tw-1, ann:ann, days:days, a:a, b:b };
}
/* named ranges → [a,b] day indexes */
function rangeIdx(s, key, custom){
  var L=s.N-1, a=0, b=L, t=TODAY;
  if(key==='30D') a=L-29; else if(key==='60D') a=L-59; else if(key==='90D') a=L-89;
  else if(key==='YTD') a=s.idx(new Date(t.getFullYear(),0,1));
  else if(key==='FYTD'){ var fm=fyStart(s.b.f)-1, y=t.getMonth()>=fm?t.getFullYear():t.getFullYear()-1; a=s.idx(new Date(y,fm,1)); }
  else if(key==='1Y') a=L-364; else if(key==='3Y') a=L-(365*3-1);
  else if(key==='CUSTOM' && custom){ a=s.idx(parseYmd(custom.from)); b=s.idx(parseYmd(custom.to)); if(a>b){ var x=a; a=b; b=x; } }
  return [Math.max(0,a), Math.max(0,b)];
}
function rangeLabel(key, custom){
  return ({'30D':'past 30 days','60D':'past 60 days','90D':'past 90 days','YTD':'year to date','FYTD':'fiscal year to date','1Y':'past 12 months','3Y':'past 3 years','ALL':'since inception','CUSTOM': custom?fdate(custom.from)+' – '+fdate(custom.to):'custom range'})[key] || key;
}
function fyLabel(y, f){ var fm=fyStart(f); if(fm===1) return String(y); return 'FY'+String(y).slice(2); }
function fyBounds(y, f){ var fm=fyStart(f)-1; if(fm===0) return [new Date(y,0,1), new Date(y,11,31)]; return [new Date(y-1,fm,1), new Date(y,fm,0)]; }

/* ============================================================
   SHELL — navigation, drawer, tabs, sheets, toast
   ============================================================ */
var ROUTE = 'signin', PARAMS = null, HIST = [];
var NAV = [
  { sec:'Account' },
  { id:'home',        label:'Dashboard',              icon:'home' },
  { id:'funds',       label:'My funds',               icon:'fund' },
  { id:'performance', label:'Fund performance',       icon:'chart' },
  { id:'allocation',  label:'Allocation & modeling',  orgLabel:'Investment allocation', icon:'pie' },
  { id:'grants',      label:'Recommend a grant',      orgLabel:'Request a grant', icon:'grant' },
  { id:'cart',        label:'Grant cart',             icon:'cart', count:function(){ return S.cart.filter(function(c){return c.fund===S.fundId;}).length; } },
  { id:'history',     label:'Grant history',          icon:'history' },
  { id:'contribute',  label:'Contribute to your fund', orgLabel:'Contribute to the fund', icon:'plus' },
  { id:'qr',          label:'QR code to give',        icon:'qr', orgOnly:true },
  { id:'statements',  label:'Statements & tax',       orgLabel:'Statements & reporting', icon:'doc' },
  { id:'documents',   label:'Fund documents',         icon:'folder' },
  { id:'endow',       label:'Endowment calculator',   icon:'calc' },
  { id:'family',      label:'Family access',          orgLabel:'Authorized users', icon:'users' },
  { id:'advisor',     label:'My advisor',             icon:'chat' },
  { id:'givingplan',  label:'My giving plan',         icon:'layers' },
  { id:'profile',     label:'My profile & settings',  icon:'user' },
  { sec:'Engage', engage:true },
  { id:'engage',      label:'Engagement home',        icon:'spark' },
  { id:'feed',        label:'News feed',              icon:'feed' },
  { id:'map',         label:'Impact map',             icon:'map' },
  { id:'legends',     label:'Local Legends',          icon:'star', dafOnly:true },
  /* V1: History quiz and Grow Your City are not in the first release (views kept, unlinked). */
  { id:'impact',      label:'Impact calculator',      icon:'calc', dafOnly:true },
  /* persona tools: the engagement features from the person's registration app, shown
     inside the portal (tool: [app folder, view]). Visible only for that persona. */
  /* V1: the advisor app keeps only the FAQ; the community app's Learn, Members and Vision cards are not in V1. */
  { id:'faq',         label:'Advisor FAQ',            icon:'quiz',   persona:'advisor',   tool:['advisors','faq'] }
];
/* feature gates follow the product feature map: org fund holders do not see
   Portfolio Modeling, the History Quiz, Local Legends or the Impact Calculator.
   Persona tools show only for the persona the account holder registered as. */
function allowed(id){
  var n = NAV.filter(function(x){return x.id===id;})[0];
  if(!n) return true;
  if(n.dafOnly && isOrg()) return false;
  if(n.orgOnly && !isOrg()) return false;
  if(n.persona && n.persona!==S.persona) return false;
  return true;
}
var TABS = [ {id:'performance',label:'Fund',icon:'fund'}, {id:'grants',label:'Grants',icon:'grant'}, {id:'home'}, {id:'engage',label:'Impact',icon:'spark'}, {id:'profile',label:'Account',icon:'user'} ];
var VIEWS = {};
/* each persona tool is its own route (#/giftplanner …): the registration app's view in a frame */
NAV.filter(function(n){ return n.tool; }).forEach(function(n){
  VIEWS[n.id] = function(){
    return pageHead('Engage', n.label)+
      '<div class="plan-host"><iframe class="plan-frame" title="'+esc(n.label)+'" src="../'+n.tool[0]+'/?embed=1#/'+n.tool[1]+'"></iframe></div>';
  };
});

function go(route, params, replace){
  /* the cart is a sheet, not a page: open it over the dashboard, never over sign-in */
  if(route==='cart'){
    if(!S.signedIn) return go('signin', params, replace);
    if(!ROUTE || ROUTE==='signin') go('home', null, true);
    openCart(); return;
  }
  if(!S.signedIn && route!=='signin') route='signin';
  if(!allowed(route)) route='home';
  /* a settings page is a step inside My profile, and a card page one inside My giving plan: Back returns to the hub */
  var sub = function(p){ return (p && (p.tab||p.page)) || ''; };
  var subPage = route===ROUTE && (route==='profile' || route==='givingplan') && sub(PARAMS)!==sub(params);
  if(!replace && ROUTE && (ROUTE!==route || subPage) && ROUTE!=='signin') HIST.push([ROUTE,PARAMS]);
  if(HIST.length>30) HIST.shift();
  ROUTE=route; PARAMS=params||null;
  closeDrawer(); closeSheet();
  render();
  syncHash(replace);
  window.scrollTo(0,0);
}
/* site build: mirror the current module in the address bar (#/grants, #/map …) */
function syncHash(replace){
  if(!window.HASH_ROUTES || ROUTE==='signin') return;
  var h='#/'+ROUTE; if(location.hash===h) return;
  try{ history[replace?'replaceState':'pushState'](null,'',h); }catch(e){ location.hash=h; }
}
/* VIEWS also holds render hooks (home_after, map_after, performance_range …); those are not routes */
function isRoute(r){ return r==='cart' || (!!VIEWS[r] && !/_(after|range)$/.test(r)); }
function routeFromHash(){ var r=(location.hash||'').replace(/^#\/?/,'').split('?')[0]; return (r && isRoute(r)) ? r : ''; }
window.addEventListener('popstate', function(){
  if(!window.HASH_ROUTES || !S.signedIn) return;
  var r=routeFromHash()||'home'; if(r===ROUTE) return;
  if(!allowed(r)) r='home';
  ROUTE=r; PARAMS=null; closeDrawer(); closeSheet(); render(); window.scrollTo(0,0);
});
/* With no history (arrived by a direct link), a giving-plan card goes up to My giving plan, a settings page to My profile, everything else to the dashboard */
function back(){
  var h=HIST.pop(); if(h){ ROUTE=h[0]; PARAMS=h[1]; render(); syncHash(true); window.scrollTo(0,0); return; }
  var sub=PARAMS && (PARAMS.tab||PARAMS.page);
  go(ROUTE==='plan'||(ROUTE==='givingplan'&&sub) ? 'givingplan' : ROUTE==='profile'&&sub ? 'profile' : 'home', null, true);
}
function render(){
  var app=$('#app');
  document.body.classList.toggle('pins-on', !!S.settings.pins);
  document.body.classList.toggle('signin-on', ROUTE==='signin');
  /* pages shown in a frame (the five-year plan, persona tools) need the full width */
  document.body.classList.toggle('frame-on', ROUTE==='plan' || NAV.some(function(n){ return n.tool && n.id===ROUTE; }));
  if(ROUTE==='signin'){ app.innerHTML = VIEWS.signin(); $('#chrome').hidden=true; return; }
  $('#chrome').hidden=false;
  var v = VIEWS[ROUTE] || VIEWS.home, html;
  try{ html = v(PARAMS); }catch(e){ console.error(e); html = '<div class="pad" style="padding-top:30px"><div class="empty"><b>This screen didn\u2019t load</b>'+esc(e.message)+'<div class="gap-s"></div><button class="btn btn-accent btn-sm" onclick="go(\'home\',null,true)">Back to dashboard</button></div></div>'; }
  app.innerHTML = '<main class="main view" id="view">'+html+'</main>';
  try{ renderChrome(); }catch(e){ console.error(e); }
  try{ if(VIEWS[ROUTE+'_after']) VIEWS[ROUTE+'_after'](PARAMS); }catch(e){ console.error(e); }
}
function renderChrome(){
  var cartN = S.cart.filter(function(c){return c.fund===S.fundId;}).length;
  var cc=$('#cartCount'); cc.textContent=cartN||''; cc.setAttribute('data-n',cartN);
  var nn=$('#notifCount'); var un=notifs().filter(function(n){return n.t>S.notifRead;}).length; nn.textContent=un||''; nn.setAttribute('data-n',un);
  // tabs
  $('#tabs').innerHTML = TABS.map(function(t){
    var sel = ROUTE===t.id || (t.id==='engage' && ['feed','map','legends','impact'].indexOf(ROUTE)>-1) || (t.id==='grants' && ROUTE==='history') || (t.id==='performance' && (ROUTE==='allocation'||ROUTE==='funds'));
    if(t.id==='home') return '<div><button class="tab-home'+(ROUTE==='home'?' sel':'')+'" onclick="go(\'home\')" aria-label="Dashboard">'+ic('home',24,2)+'</button></div>';
    return '<button class="tab'+(sel?' sel':'')+'" onclick="go(\''+t.id+'\')">'+ic(t.icon,22)+'<span>'+t.label+'</span></button>';
  }).join('');
  // drawer
  var f=F();
  $('#drWho').innerHTML = '<span class="avatar round">'+initials(S.profile.first+' '+S.profile.last)+'</span><div style="min-width:0"><div class="n">'+esc(S.profile.first+' '+S.profile.last)+'</div><div class="f">'+esc(f.name)+'</div></div>';
  $('#drList').innerHTML = NAV.map(function(n){
    if(n.sec) return '<div class="dr-sec'+(n.engage?' engage':'')+'">'+n.sec+'</div>';
    if(!allowed(n.id)) return '';
    var c = n.count ? n.count() : 0;
    return '<button class="dr-item'+(ROUTE===n.id||(n.id==='givingplan'&&ROUTE==='plan')?' sel':'')+'" onclick="go(\''+n.id+'\')">'+ic(n.icon,19)+'<span>'+esc(isOrg()&&n.orgLabel?n.orgLabel:n.label)+'</span>'+(c?'<span class="dc">'+c+'</span>':'')+'</button>';
  }).join('');
}
function toggleDrawer(){ $('#drawer').classList.toggle('open'); $('#drawerScrim').classList.toggle('open'); }
function closeDrawer(){ var d=$('#drawer'); if(d){ d.classList.remove('open'); $('#drawerScrim').classList.remove('open'); } }

var toastT;
function toast(msg){ var t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); }, 3400); }

var SHEET_ON_CLOSE = null;
function openSheet(o){
  $('#sheetKick').textContent = o.kick||''; $('#sheetKick').hidden = !o.kick;
  $('#sheetTitle').textContent = o.title||'';
  $('#sheetBody').innerHTML = '<div class="pop-pad">'+(o.body||'')+'</div>';
  var ft=$('#sheetFoot'); ft.innerHTML = o.foot||''; ft.hidden = !o.foot;
  $('#sheet').classList.toggle('wide', !!o.wide);
  $('#scrim').classList.add('open'); $('#sheetBody').scrollTop=0;
  SHEET_ON_CLOSE = o.onClose||null;
  document.body.style.overflow='hidden';
  if(o.after) setTimeout(o.after, 20);
}
function closeSheet(){ var s=$('#scrim'); if(!s||!s.classList.contains('open')) return; s.classList.remove('open'); document.body.style.overflow=''; if(SHEET_ON_CLOSE){ var f=SHEET_ON_CLOSE; SHEET_ON_CLOSE=null; f(); } }

/* page chrome helpers */
function pageHead(kick, title, opts){ opts=opts||{};
  return '<div class="page-head">'+(opts.noBack?'':'<button class="back" onclick="back()" aria-label="Back">'+ic('back',18,2.2)+'</button>')+
    '<div class="ph-main"><div class="ph-kick">'+esc(kick)+'</div><h1>'+esc(title)+'</h1></div>'+(opts.right||'')+'</div>'+
    (opts.lede?'<p class="page-lede">'+opts.lede+'</p>':''); }
function rail(kick, title, meta){ return '<div class="sect-rail"><div class="sr-main"><div class="sr-kick">'+esc(kick)+'</div><h2>'+esc(title)+'</h2></div><div class="sr-lead"></div><div class="sr-meta">'+(meta||'')+'</div></div>'; }
function fundSwitch(){
  var f=F();
  return '<div class="fundbar-switch"><button class="fund-pill" onclick="openFundSwitcher()" aria-label="Switch fund"><span class="fp-spine" style="background:'+f.color+'"></span><span class="fp-main"><span class="fp-t" style="display:block">'+esc(f.name)+'</span><span class="fp-k" style="display:block">'+esc(f.typeLabel)+' · '+f.no+'</span></span>'+ic('down',18,2)+'</button></div>';
}
function openFundSwitcher(){
  var groups=[['daf','Donor advised funds'],['org','Organizational funds']];
  var body = groups.map(function(g){
    var fs=FUNDS.filter(function(f){return f.type===g[0];});
    return '<div class="card-k" style="margin-top:6px">'+g[1]+'</div>'+fs.map(function(f){
      return '<button class="ff-row" onclick="switchFund(\''+f.id+'\')" style="'+(f.id===S.fundId?'border-color:var(--ember);box-shadow:0 0 0 3px rgba(238,115,49,.14)':'')+'"><span class="ffr-spine" style="background:'+f.color+'"></span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(f.name)+'</span><span class="ffr-meta" style="display:block">'+esc(f.no)+' · since '+fdate(f.inception,'my')+'</span></span><span class="ffr-amt">'+moneyK(balance(f))+'<span class="s">'+(f.id===S.fundId?'Viewing':'Balance')+'</span></span></button>';
    }).join('');
  }).join('<div class="gap-s"></div>');
  body += '<p class="tiny" style="margin-top:10px">Organizational funds see the same account tools as donor advised funds, with fiscal-year reporting and a QR code for community gifts. Some engagement features are turned off for organizational funds.</p>';
  openSheet({ kick:'Your accounts', title:'Switch fund', body:body, foot:'<button class="btn btn-quiet" onclick="closeSheet();go(\'contribute\',{openNew:1})">'+ic('plus',18)+'Open a new fund</button>' });
}
function switchFund(id){
  S.fundId=id; save(); closeSheet();
  logSync('sf','Portal Session','Switched active fund to '+fundById(id).name);
  toast('Now viewing '+fundById(id).name+'.');
  if(!allowed(ROUTE)) ROUTE='home';
  render(); window.scrollTo(0,0);
}

/* notifications */
function notifs(){
  var f=F(), base=TODAY.getTime(), list=[];
  var b=build(f); var lastG=b.ev.filter(function(e){return e.k==='grant' && e.status==='Posted';}).slice(-1)[0];
  if(lastG) list.push({t:base-86400000*2, i:'check', title:(f.type==='org'?'Distribution posted':'Grant posted'), body:money(lastG.amt)+' to '+lastG.org+' was paid on '+fdate(lastG.d)+'.', go:'history'});
  var q=Math.floor(TODAY.getMonth()/3); list.push({t:base-86400000*6, i:'doc', title:'Statement ready', body:'Your Q'+(q===0?4:q)+' statement is ready to download.', go:'statements'});
  if(!isOrg()){ 
    list.push({t:base-86400000*3, i:'star', title:'Local Legend of the week', body:'Meet this week\u2019s legend.', go:'legends'}); }
  S.grants.forEach(function(g){ if(g.fund===f.id) list.push({t:g.t+1000, i:'grant', title:'Grant '+grantStatus(g).toLowerCase(), body:money(g.amt)+' to '+g.org+'.', go:'history'}); });
  return list.sort(function(a,b){return b.t-a.t;});
}
function openNotifs(){
  var n=notifs();
  var body = n.length ? n.map(function(x){ return '<button class="ff-row" onclick="closeSheet();go(\''+x.go+'\')"><span class="avatar" style="background:var(--well);color:var(--forest)">'+ic(x.i,18)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(x.title)+(x.t>S.notifRead?' <span class="live ember" style="margin-left:4px"></span>':'')+'</span><span class="ffr-sub" style="display:block">'+esc(x.body)+'</span></span></button>'; }).join('') : '<div class="empty"><b>You\u2019re all caught up</b>New activity on your fund shows up here.</div>';
  S.notifRead=Date.now(); save();
  openSheet({ kick:'Activity', title:'Notifications', body:body, onClose:renderChrome });
}

function signOut(){
  S.signedIn=false; save(); logSync('sf','Portal Session','Signed out');
  HIST=[]; ROUTE='signin';
  try{ sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); }catch(e){}
  if(window.SITE_HOME){ location.href = window.SITE_HOME; return; }
  render();
}

/* logo: the shared logo file (--logo in tcf-v3.css); fall back to type if it's missing */
function applyLogo(){
  if(getComputedStyle(document.documentElement).getPropertyValue('--logo').trim()) return;   /* site build: shared logo file */
  document.documentElement.classList.add('no-logo');
}
function logo(cls, dark){
  if(document.documentElement.classList.contains('no-logo')) return '<span class="brand-logo text '+(cls||'')+(dark?' on-dark':'')+'">Cleveland Foundation</span>';
  return '<span class="brand-logo '+(cls||'')+(dark?' on-dark':'')+'" role="img" aria-label="The Cleveland Foundation"></span>';
}

document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeSheet(); closeDrawer(); } });

/* ============================================================
   ACCOUNT MANAGEMENT — part 1
   charts · sign in · dashboard · performance · allocation
   ============================================================ */

/* ---------- performance area chart (contributed vs appreciation) ---------- */
var CHARTS = {};
function perfChart(id, s, a, b, opts){
  opts=opts||{};
  var el=document.getElementById(id); if(!el) return;
  var W=Math.max(280, Math.round(el.clientWidth||340)), H=opts.h||Math.round(Math.min(230, Math.max(170, W*.46)));
  var padL=4, padR=44, padT=10, padB=22, iw=W-padL-padR, ih=H-padT-padB;
  var n=b-a+1, step=Math.max(1, Math.ceil(n/170)), pts=[];
  for(var i=a;i<=b;i+=step) pts.push(i); if(pts[pts.length-1]!==b) pts.push(b);
  var data=pts.map(function(i){ var v=s.V(i), net=s.CC(i)-s.CG(i)-s.CF(i); return {i:i, v:v, net:net, lo:Math.min(Math.max(net,0),v)}; });
  var mx=0, mn=Infinity; data.forEach(function(d){ mx=Math.max(mx,d.v,d.net); mn=Math.min(mn,d.v,d.lo); });
  var y0 = (opts.zero || a===0) ? 0 : Math.max(0, mn-(mx-mn)*.35), y1 = mx+(mx-y0)*.06; if(y1<=y0) y1=y0+1;
  function X(k){ return padL + (pts.length<2?0:(k/(pts.length-1))*iw); }
  function Y(v){ return padT + ih - ((Math.max(v,y0)-y0)/(y1-y0))*ih; }
  var base=padT+ih;
  function area(key){ var p='M'+X(0)+','+base; data.forEach(function(d,k){ p+='L'+X(k).toFixed(1)+','+Y(d[key]).toFixed(1); }); return p+'L'+X(data.length-1)+','+base+'Z'; }
  function line(key){ return data.map(function(d,k){ return (k?'L':'M')+X(k).toFixed(1)+','+Y(d[key]).toFixed(1); }).join(''); }
  var light=!!opts.light, c1=light?'#19B9A9':'#19B9A9', c2=light?'#EE7331':'#EE7331';
  var grid='', ax='';
  for(var g=0; g<=3; g++){ var gv=y0+(y1-y0)*g/3, gy=Y(gv); grid+='<line class="grid" x1="'+padL+'" x2="'+(padL+iw)+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'"/>'; ax+='<text class="ax" x="'+(W-2)+'" y="'+(gy+3).toFixed(1)+'" text-anchor="end">'+moneyK(gv)+'</text>'; }
  var nx=Math.min(5, Math.max(2, Math.floor(iw/80)));
  for(var t=0;t<nx;t++){ var k=Math.round(t*(data.length-1)/(nx-1)), d=s.date(data[k].i); var lab = n>120 ? MON[d.getMonth()]+' \u2019'+String(d.getFullYear()).slice(2) : MON[d.getMonth()]+' '+d.getDate();
    ax+='<text class="ax" x="'+X(k).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(t===0?'start':t===nx-1?'end':'middle')+'">'+lab+'</text>'; }
  // grant markers along the baseline
  var marks=''; if(opts.marks!==false){ s.b.ev.forEach(function(e){ if(e.k==='grant' && e.status==='Posted' && e.i>=a && e.i<=b){ var k=(e.i-a)/(b-a||1)*(data.length-1); marks+='<rect x="'+(X(k)-1).toFixed(1)+'" y="'+(base-5)+'" width="2" height="5" rx="1" fill="var(--pink)" opacity=".9"/>'; } }); }
  var gid='g'+id;
  var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Fund value over time, split into net contributions and investment growth">'+
    '<defs><linearGradient id="'+gid+'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c2+'" stop-opacity=".95"/><stop offset="1" stop-color="'+c2+'" stop-opacity=".55"/></linearGradient>'+
    '<linearGradient id="'+gid+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c1+'" stop-opacity=".95"/><stop offset="1" stop-color="'+c1+'" stop-opacity=".45"/></linearGradient></defs>'+
    grid+'<path d="'+area('v')+'" fill="url(#'+gid+'a)"/><path d="'+area('lo')+'" fill="url(#'+gid+'b)"/>'+
    '<path d="'+line('net')+'" fill="none" stroke="'+(light?'var(--mid)':'#A6EFE6')+'" stroke-width="1" stroke-dasharray="3 3" opacity=".8"/>'+
    '<path d="'+line('v')+'" fill="none" stroke="'+(light?'#164430':'#fff')+'" stroke-width="1.6"/>'+marks+ax+
    '<line id="'+id+'X" x1="0" x2="0" y1="'+padT+'" y2="'+base+'" stroke="'+(light?'#164430':'#fff')+'" stroke-width="1" opacity="0"/>'+
    '<circle id="'+id+'D" r="4.5" fill="#EE7331" stroke="#fff" stroke-width="2" opacity="0"/>'+
    '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent" id="'+id+'H" style="cursor:crosshair"/></svg><div class="tip" id="'+id+'T"></div>';
  el.innerHTML=svg;
  CHARTS[id]={s:s,a:a,b:b,opts:opts};
  var hit=document.getElementById(id+'H'), tip=document.getElementById(id+'T'), xl=document.getElementById(id+'X'), dot=document.getElementById(id+'D');
  function move(ev){
    var r=el.getBoundingClientRect(), px=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)*(W/r.width);
    var k=Math.round((px-padL)/iw*(data.length-1)); k=Math.max(0,Math.min(data.length-1,k)); var d=data[k];
    var x=X(k); xl.setAttribute('x1',x); xl.setAttribute('x2',x); xl.setAttribute('opacity','.5');
    dot.setAttribute('cx',x); dot.setAttribute('cy',Y(d.v)); dot.setAttribute('opacity','1');
    var gr=d.v-d.net;
    tip.innerHTML='<div class="tp-d">'+fdate(s.date(d.i))+'</div><div class="tp-r"><span>Fund value</span><b>'+money(d.v)+'</b></div><div class="tp-r"><span><i class="sw" style="background:'+c1+'"></i>Net contributed</span><b>'+money(d.net)+'</b></div><div class="tp-r"><span><i class="sw" style="background:'+c2+'"></i>Growth</span><b>'+signed(gr)+'</b></div>';
    var left=(x/W)*r.width; left=Math.max(80, Math.min(r.width-80, left)); tip.style.left=left+'px'; tip.style.top=(-8-tip.offsetHeight*0)+'px'; tip.classList.add('on');
    tip.style.transform='translate(-50%,-100%)';
    if(opts.onScrub) opts.onScrub(d);
  }
  function leave(){ tip.classList.remove('on'); xl.setAttribute('opacity','0'); dot.setAttribute('opacity','0'); if(opts.onScrub) opts.onScrub(null); }
  hit.addEventListener('mousemove',move); hit.addEventListener('mouseleave',leave);
  hit.addEventListener('touchstart',move,{passive:true}); hit.addEventListener('touchmove',move,{passive:true}); hit.addEventListener('touchend',leave);
}
window.addEventListener('resize', function(){ clearTimeout(window.__rz); window.__rz=setTimeout(function(){ Object.keys(CHARTS).forEach(function(id){ var c=CHARTS[id]; if(document.getElementById(id)) perfChart(id,c.s,c.a,c.b,c.opts); }); },150); });

function lineChart(id, seriesList, opts){
  opts=opts||{}; var el=document.getElementById(id); if(!el) return;
  var W=Math.max(280, Math.round(el.clientWidth||340)), H=opts.h||200, padL=4, padR=46, padT=10, padB=22, iw=W-padL-padR, ih=H-padT-padB;
  var mx=0, len=0; seriesList.forEach(function(sr){ sr.values.forEach(function(v){ mx=Math.max(mx,v); }); len=Math.max(len,sr.values.length); });
  mx*=1.08; if(!mx) mx=1;
  function X(k){ return padL+(k/(len-1||1))*iw; } function Y(v){ return padT+ih-(v/mx)*ih; }
  var out='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opts.label||'Projection chart')+'">';
  for(var g=0; g<=3; g++){ var gv=mx*g/3; out+='<line x1="'+padL+'" x2="'+(padL+iw)+'" y1="'+Y(gv)+'" y2="'+Y(gv)+'" stroke="var(--gray3)"/><text class="ax" x="'+(W-2)+'" y="'+(Y(gv)+3)+'" text-anchor="end" style="fill:var(--mid)">'+moneyK(gv)+'</text>'; }
  (opts.xLabels||[]).forEach(function(l){ out+='<text class="ax" style="fill:var(--mid)" x="'+X(l.k)+'" y="'+(H-6)+'" text-anchor="'+(l.k===0?'start':l.k>=len-1?'end':'middle')+'">'+esc(l.t)+'</text>'; });
  seriesList.forEach(function(sr){
    var p=sr.values.map(function(v,k){ return (k?'L':'M')+X(k).toFixed(1)+','+Y(v).toFixed(1); }).join('');
    if(sr.fill) out+='<path d="'+p+'L'+X(sr.values.length-1)+','+(padT+ih)+'L'+X(0)+','+(padT+ih)+'Z" fill="'+sr.color+'" opacity=".16"/>';
    out+='<path d="'+p+'" fill="none" stroke="'+sr.color+'" stroke-width="'+(sr.w||2)+'" '+(sr.dash?'stroke-dasharray="4 4"':'')+'/>';
  });
  el.innerHTML=out+'</svg>';
}
function donut(mix, size, label, sub){
  size=size||132; var r=size/2-12, c=2*Math.PI*r, off=0, segs='';
  Object.keys(mix).forEach(function(k){ var p=mix[k]/100; if(!p) return; segs+='<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+POOLS[k].color+'" stroke-width="18" stroke-dasharray="'+(c*p-2).toFixed(2)+' '+c.toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>'; off+=c*p; });
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" role="img" aria-label="Allocation donut">'+segs+
    (label?'<text x="50%" y="48%" text-anchor="middle" style="font-family:var(--f-display);font-weight:800;font-size:15px;fill:var(--forest)">'+esc(label)+'</text><text x="50%" y="62%" text-anchor="middle" style="font-family:var(--f-ledger);font-size:8.5px;letter-spacing:.12em;fill:var(--ink-3)">'+esc(sub||'')+'</text>':'')+'</svg>';
}
function allocLegend(mix){ return '<div class="alloc-leg">'+Object.keys(mix).filter(function(k){return mix[k]>0;}).map(function(k){ return '<div class="al"><i class="sw" style="background:'+POOLS[k].color+'"></i>'+POOLS[k].name+'<b>'+mix[k]+'%</b></div>'; }).join('')+'</div>'; }

/* ---------- the vault (balance + chart block), shared by dashboard & performance ---------- */
var PERF = { range:'1Y', custom:null };
function vaultHTML(full){
  var f=F(), org=f.type==='org';
  var keys = ['30D','60D','90D','YTD'].concat(fyStart()!==1?['FYTD']:[]).concat(['1Y','ALL','CUSTOM']);
  var labels={'30D':'30D','60D':'60D','90D':'90D','YTD':'YTD','FYTD':'FYTD','1Y':'1Y','ALL':'All','CUSTOM':'Custom'};
  if(PERF.range==='FYTD' && fyStart()===1) PERF.range='YTD';
  var cust = PERF.custom || { from: ymd(addDays(TODAY,-180)), to: ymd(TODAY) };
  return '<section class="vault rise" aria-label="Fund balance and performance">'+guilloche(260,320)+
    '<div class="v-top"><div><div class="v-fund">'+esc(f.name)+'</div><div class="v-type">'+esc(f.typeLabel)+' · '+f.no+(f.status==='agreement'?' · Agreement to sign':'')+'</div></div>'+pin('ri',true)+'</div>'+
    '<div class="v-bal" id="vBal"></div>'+
    '<div class="v-asof"><span class="v-chg" id="vChg"></span><span id="vAsof"></span></div>'+
    '<div class="range-row"><div class="ranges" role="tablist" aria-label="Date range">'+keys.map(function(k){ return '<button class="rng'+(PERF.range===k?' sel':'')+'" onclick="setRange(\''+k+'\')">'+labels[k]+'</button>'; }).join('')+'</div></div>'+
    '<div class="custom-range'+(PERF.range==='CUSTOM'?' on':'')+'" id="custRange"><div><label for="cFrom">From</label><input type="date" id="cFrom" value="'+cust.from+'" min="'+f.inception+'" max="'+ymd(TODAY)+'"></div><div><label for="cTo">To</label><input type="date" id="cTo" value="'+cust.to+'" min="'+f.inception+'" max="'+ymd(TODAY)+'"></div><button class="btn btn-accent btn-sm" onclick="applyCustom()">Apply</button></div>'+
    '<div class="chart" id="vChart"></div>'+
    '<div style="display:flex;gap:14px;margin-top:8px;font-size:11px;color:var(--gray2);flex-wrap:wrap"><span><i class="sw" style="background:var(--aqua)"></i>Net contributed</span><span><i class="sw" style="background:var(--ember)"></i>Investment growth</span><span><i class="sw" style="background:var(--magenta-lt);width:3px"></i>'+(org?'Distributions':'Grants paid')+'</span></div>'+
    '<div class="v-stats" id="vStats"></div>'+
    (full?'':'<div class="v-actions">'+(org
      ? '<button class="btn btn-accent" onclick="openGrantForm(\''+jsq(f.org)+'\')">'+ic('grant',18)+'Request a grant</button><button class="btn btn-onhero" onclick="go(\'contribute\')">'+ic('plus',18)+'Contribute</button>'
      : '<button class="btn btn-accent" onclick="go(\'grants\')">'+ic('grant',18)+'Recommend a grant</button><button class="btn btn-onhero" onclick="go(\'contribute\')">'+ic('plus',18)+'Contribute</button>')+'</div>')+
  '</section>';
}
function setRange(k){ PERF.range=k; if(k==='CUSTOM' && !PERF.custom) PERF.custom={from:ymd(addDays(TODAY,-180)), to:ymd(TODAY)}; $$('.vault .rng').forEach(function(b){ b.classList.toggle('sel', b.textContent===({'ALL':'All','CUSTOM':'Custom'}[k]||k)); }); var cr=$('#custRange'); if(cr) cr.classList.toggle('on',k==='CUSTOM'); vaultUpdate(); if(VIEWS[ROUTE+'_range']) VIEWS[ROUTE+'_range'](); }
function applyCustom(){ var a=$('#cFrom').value, b=$('#cTo').value; if(!a||!b){ toast('Choose both a start and an end date.'); return; } PERF.custom={from:a,to:b}; PERF.range='CUSTOM'; vaultUpdate(); if(VIEWS[ROUTE+'_range']) VIEWS[ROUTE+'_range'](); logSync('sf','Portal Activity','Viewed performance for a custom range'); }
function curRange(){ var s=series(); var r=rangeIdx(s, PERF.range, PERF.custom); return {s:s, a:r[0], b:r[1], p:periodStats(s,r[0],r[1])}; }
function balHTML(v){ var t=money(v,true), parts=t.split('.'); return parts[0]+'<span class="c">.'+parts[1]+'</span>'; }
function vaultUpdate(){
  var r=curRange(), p=r.p, org=isOrg();
  var bal=$('#vBal'); if(!bal) return;
  function head(d){
    if(d){ bal.innerHTML=balHTML(d.v); $('#vAsof').textContent='on '+fdate(r.s.date(d.i)); $('#vChg').textContent=''; return; }
    bal.innerHTML=balHTML(p.end);
    var ch=$('#vChg'); ch.textContent=pct(p.retPct)+(p.ann!=null?' ('+pct(p.ann)+'/yr)':''); ch.className='v-chg'+(p.retPct<0?' neg':'');
    $('#vAsof').textContent=rangeLabel(PERF.range,PERF.custom)+(r.b===r.s.N-1?' · as of '+fdate(TODAY,'short'):' · balance on '+fdate(r.s.date(r.b)));
  }
  head(null);
  $('#vStats').innerHTML='<div><div class="k">Contributions</div><div class="v">'+moneyK(p.contrib)+'</div></div><div><div class="k">Growth</div><div class="v">'+(p.ret>=0?'+':'')+moneyK(p.ret)+'</div></div><div><div class="k">'+(org?'Distributions':'Grants out')+'</div><div class="v">'+moneyK(p.grants)+'</div></div>';
  perfChart('vChart', r.s, r.a, r.b, { onScrub:head });
}

/* ============ SIGN IN ============ */
VIEWS.signin = function(){
  return '<div class="signin"><div class="si-band">'+guilloche(300,340)+logo('',true)+
    '<h1>Welcome<br>back.</h1><p>Sign in to see your balance, recommend a grant, and watch your dollars at work in the community.</p>'+
    '<div class="si-rule"><span style="background:var(--moss)"></span><span style="background:var(--ember)"></span><span style="background:var(--aqua)"></span><span style="background:var(--p-well)"></span><span style="background:var(--p-neigh)"></span></div></div>'+
    '<div class="si-form" role="form" aria-label="Sign in" onkeydown="if(event.key===\'Enter\'){event.preventDefault();doSignIn();}">'+
      '<div class="f-row"><label for="siEmail">Email</label><div class="input-ic">'+ic('mail',18)+'<input id="siEmail" type="email" autocomplete="username" value="'+esc(S.profile.email)+'"></div></div>'+
      '<div class="f-row"><label for="siPw">Password</label><div class="input-ic">'+ic('lock',18)+'<input id="siPw" type="password" autocomplete="current-password" value="Cleveland1914"></div></div>'+
      '<div class="row" style="justify-content:space-between;margin:4px 0 18px"><label class="check"><input type="checkbox" id="siKeep" '+(S.keep?'checked':'')+'> Keep me signed in</label><button type="button" class="link" style="color:var(--mid)" onclick="toast(\'A reset link would be sent through Microsoft Entra ID.\')">Forgot password</button></div>'+
      '<button class="btn btn-accent btn-lg btn-block" type="button" id="siBtn" onclick="doSignIn()">Sign in</button>'+
      '<div class="si-or">or</div>'+
      '<button type="button" class="btn btn-quiet btn-lg btn-block" onclick="doSignIn(true)">'+ic('face',20)+'Sign in with a passkey</button>'+
      '<p class="tiny center" style="margin-top:18px">Secured with Microsoft Entra External ID and multi-factor authentication.<br>New to the Foundation? <a class="link" style="color:var(--mid);padding:0" href="'+OPEN_FLOW+'?from=signin">Open a Donor Advised Fund</a></p>'+
      '<div class="wire" style="margin-top:16px"><div class="fr"><span class="fk">Demo email</span><span class="fv">taylor@williams.example</span></div><div class="fr"><span class="fk">Demo password</span><span class="fv">Cleveland1914</span></div><p class="tiny" style="margin-top:6px">Already filled in — just tap Sign in. Any email and password will work. All names and balances are fictional.</p></div>'+
    '</div></div>';
};
function doSignIn(passkey){
  var keep=$('#siKeep'), em=$('#siEmail');
  S.keep = keep ? keep.checked : true; S.signedIn=true;
  /* demo: any credentials work, so the entered email isn't checked */
  save();
  try{ logSync('sf','Login History', passkey?'Signed in with a passkey':'Signed in with email and MFA'); }catch(e){}
  /* "Keep me signed in" survives closing the browser; otherwise it lasts for this tab session */
  try{ (S.keep ? localStorage : sessionStorage).setItem(SESSION_KEY,'1'); }catch(e){}
  var dest = window.PENDING_ROUTE || 'home'; window.PENDING_ROUTE = null;
  go(dest,null,true);
  toast('Signed in. Welcome back, '+S.profile.first+'.');
}

/* ============ DASHBOARD ============ */
function curFYEnd(f){ var fm=fyStart(f)-1; return (fm>0 && TODAY.getMonth()>=fm) ? TODAY.getFullYear()+1 : TODAY.getFullYear(); }
function greeting(){ var h=new Date().getHours(); return h<12?'Good morning':(h<17?'Good afternoon':'Good evening'); }
VIEWS.home = function(){
  var f=F(), org=f.type==='org', s=series(), L=s.N-1;
  var yr=periodStats(s, ...rangeIdx(s, org?'FYTD':'YTD'));
  var cartN=S.cart.filter(function(c){return c.fund===f.id;}).length;
  var html = '<div class="fundbar rise"><div class="fb-hi"><div class="fb-greet">'+greeting()+'</div><div class="fb-name">'+esc(S.profile.first)+'.</div></div>'+
      '<button class="btn btn-quiet btn-sm" onclick="go(\'advisor\')" aria-label="Message your advisor">'+ic('chat',16)+'Advisor</button></div>'+
    fundSwitch()+ agreementCard(f) + vaultHTML(false) + '<div class="gap-m"></div>';
  // quick panels — connected grid; a data row (colored top edges, see tcf-v3-site.css → Labels)
  html += '<div class="pgrid g4 data">'+
    panel('statements','Reporting', org?'Statements':'Statements & tax', org?'Monthly, quarterly and fiscal-year reports.':'Quarterly statements and tax receipts.', 'doc', 'var(--gray2)','var(--blue)', org?'FY starts '+MONTHS[fyStart()-1]:'Next: Q'+(Math.floor(TODAY.getMonth()/3)+1)+' on '+fdate(quarterEnd(TODAY),'short'))+
    '<button class="panel" style="--pk:var(--mid)" onclick="openCart()"><div class="p-kick">Dollars out</div><span class="p-arrow">'+ic('arrowUR',18,2.2)+'</span><div class="t-icon" style="background:var(--gray2);color:var(--mid)">'+ic('cart',22)+'</div><div class="p-label">Grant cart</div><div class="p-sub">'+(cartN?cartN+' ready to submit · '+money(cartTotal()):'Queue several grants and submit once.')+'</div><div class="p-count">Available '+moneyK(available())+'</div></button>'+
    (org ? panel('qr','Community gifts','QR code to give','Let supporters give to the fund in seconds.','qr','var(--gray2)','var(--moss)','Print · Share · Download')
         : panel('allocation','Investments','Allocation','See your pools and model a rebalance.','pie','var(--gray2)','var(--pink)', Object.keys(f.pools).length+' pools · '+(S.rebalance[f.id]?'Change requested':'Rebalance anytime')))+
    panel('documents','On file','Fund documents','Agreements, policies and fee schedule.','folder','var(--well)','var(--forest)','6 documents')+
  '</div>';
  // year at a glance
  html += rail(org?'Fiscal year to date':'This year', org?fyLabel(curFYEnd())+' at a glance':TODAY.getFullYear()+' at a glance', '<button onclick="go(\'statements\')">Full statement</button>');
  html += '<div class="pad" style="padding-top:14px"><div class="facts">'+
    '<div class="fr"><span class="fk">Beginning balance</span><span class="fv">'+money(yr.start)+'</span></div>'+
    '<div class="fr"><span class="fk">Contributions'+(org?'':' · deductible')+'</span><span class="fv pos">+'+money(yr.contrib)+'</span></div>'+
    '<div class="fr"><span class="fk">'+(org?'Distributions':'Grants paid')+'</span><span class="fv neg">−'+money(yr.grants)+'</span></div>'+
    '<div class="fr"><span class="fk">Administrative fees</span><span class="fv neg">−'+money(yr.fees)+'</span></div>'+
    '<div class="fr"><span class="fk">Investment return</span><span class="fv '+(yr.ret>=0?'pos':'neg')+'">'+signed(yr.ret)+' ('+pct(yr.retPct)+')</span></div>'+
    '<div class="fr total"><span class="fk">Balance today</span><span class="fv">'+money(yr.end)+'</span></div></div></div>';
  // grants in motion
  var recent = allGrants(f).slice(0,3);
  html += '<div class="gap-m"></div>'+rail('Dollars out', org?'Grants & distributions':'Grants in motion', '<button onclick="go(\'history\')">All grants</button>');
  html += '<div class="list" style="padding-top:14px">'+(recent.length?recent.map(grantRow).join(''):'<div class="empty"><b>No grants yet</b>Recommend your first grant to see it move from entered to paid.</div>')+'</div>';
  // engagement
  html += '<div class="gap-m"></div>' + (window.ENG ? ENG.homeModules() : '');
  // advisor
  html += '<div class="gap-m"></div><div class="pad"><div class="card row" style="gap:14px"><span class="avatar round" style="background:var(--moss)">JR</span><div style="flex:1;min-width:0"><div style="font-weight:700;color:var(--forest)">Jordan Reyes</div><div class="tiny">Senior philanthropic advisor '+pin('sf')+'</div></div><button class="btn btn-quiet btn-sm" onclick="openMessage()">Message</button></div></div>';
  html += syncFoot();
  return html;
};
VIEWS.home_after = function(){ vaultUpdate(); if(window.ENG && ENG.homeAfter) ENG.homeAfter(); };
function panel(route, kick, label, sub, icon, bg, fg, count){
  return '<button class="panel" style="--pk:'+fg+'" onclick="go(\''+route+'\')"><div class="p-kick">'+esc(kick)+'</div>'+'<span class="p-arrow">'+ic('arrowUR',18,2.2)+'</span>'+'<div class="t-icon" style="background:'+bg+';color:'+fg+'">'+ic(icon,22)+'</div><div class="p-label">'+esc(label)+'</div><div class="p-sub">'+esc(sub)+'</div>'+(count?'<div class="p-count">'+esc(count)+'</div>':'')+'</button>';
}
function syncFoot(){
  var last=S.sync[0];
  return '<div class="foot-note"><span class="live" style="margin-right:6px;vertical-align:-1px"></span>Profile saved'+(last?' · last sync '+ago(last.t):'')+'<br>Fund data from Ren iPhi · Profile & activity to Salesforce<br><button class="link" style="padding:6px 0" onclick="go(\'profile\',{tab:\'sync\'})">View sync activity</button></div>';
}

/* ============ PERFORMANCE ============ */
var BAL_GRAN = 'month';
VIEWS.performance = function(){
  var f=F(), org=isOrg();
  return pageHead('Investments','Fund performance',{lede:org?'Track the fund as an asset on your balance sheet: pick any window — including your fiscal year — and every figure below reconciles to the penny.':'See what you have contributed and what the market has added on top. Choose any date range.'})+
    fundSwitch()+vaultHTML(true)+'<div class="gap-m"></div>'+
    rail('Reconciliation','What changed', '<span id="recRange"></span>')+
    '<div class="pad" style="padding-top:14px" id="recon"></div>'+
    '<div class="gap-m"></div>'+rail('Balance by period', org?'Balance sheet view':'Period-end balances', '<button onclick="exportBalances()">Export CSV</button>')+
    '<div class="pad" style="padding-top:14px"><div class="seg" id="granSeg">'+[['month','Monthly'],['quarter','Quarterly'],['year','Calendar year'],['fy','Fiscal year']].map(function(g){return '<button class="'+(BAL_GRAN===g[0]?'sel':'')+'" onclick="setGran(\''+g[0]+'\')">'+g[1]+'</button>';}).join('')+'</div><div class="gap-s"></div><div id="balTbl"></div>'+
    '<p class="tiny" style="margin-top:10px">Returns are time-weighted, so contributions and grants don\u2019t distort the percentage. Periods over a year also show an annualized rate. Figures are illustrative for this prototype.</p></div>'+
    '<div class="gap-m"></div><div class="pgrid">'+panel('allocation','Investments',org?'Allocation':'Allocation & modeling',org?'Your pools and how they performed.':'Rebalance or model future returns.','pie','var(--gray2)','var(--pink)')+panel('statements','Reporting','Statements','Download any month, quarter or year.','doc','var(--gray2)','var(--blue)')+'</div>';
};
VIEWS.performance_after = function(){ vaultUpdate(); VIEWS.performance_range(); renderBalTable(); };
VIEWS.performance_range = function(){
  var r=curRange(), p=r.p, org=isOrg(); var el=$('#recon'); if(!el) return;
  $('#recRange').textContent=rangeLabel(PERF.range,PERF.custom);
  el.innerHTML = reconFacts(p, r.s, org) + '<div class="row wrap" style="margin-top:12px"><button class="btn btn-quiet btn-sm" onclick="printStatement('+r.a+','+r.b+')">'+ic('download',16)+'Download this period</button><button class="btn btn-quiet btn-sm" onclick="exportTx('+r.a+','+r.b+')">'+ic('doc',16)+'Transactions CSV</button></div>';
};
function reconFacts(p, s, org){
  return '<div class="facts">'+
    '<div class="fr"><span class="fk">Beginning · '+fdate(s.date(Math.max(0,p.a-1)),'short')+(p.a===0?' (opened)':'')+'</span><span class="fv">'+money(p.start,true)+'</span></div>'+
    '<div class="fr"><span class="fk">Contributions</span><span class="fv pos">+'+money(p.contrib,true)+'</span></div>'+
    '<div class="fr"><span class="fk">'+(org?'Distributions':'Grants paid')+'</span><span class="fv neg">−'+money(p.grants,true)+'</span></div>'+
    '<div class="fr"><span class="fk">Administrative fees</span><span class="fv neg">−'+money(p.fees,true)+'</span></div>'+
    '<div class="fr"><span class="fk">Investment return</span><span class="fv '+(p.ret>=0?'pos':'neg')+'">'+(p.ret>=0?'+':'−')+money(Math.abs(p.ret),true)+'</span></div>'+
    '<div class="fr total"><span class="fk">Ending · '+fdate(s.date(p.b),'short')+'</span><span class="fv">'+money(p.end,true)+'</span></div>'+
    '<div class="fr"><span class="fk">Time-weighted return</span><span class="fv">'+pct(p.retPct,2)+(p.ann!=null?' · '+pct(p.ann,2)+' annualized':'')+'</span></div></div>';
}
function setGran(g){ BAL_GRAN=g; $$('#granSeg button').forEach(function(b,i){ b.classList.toggle('sel',['month','quarter','year','fy'][i]===g); }); renderBalTable(); }
function periods(s, gran, f){
  f=f||F(); var out=[], start=s.start, end=TODAY, y, m;
  if(gran==='month'){ for(y=end.getFullYear(), m=end.getMonth(); out.length<24; m--){ if(m<0){m=11;y--;} var a=new Date(y,m,1), b=new Date(y,m+1,0); if(b<start) break; out.push({label:MON[m]+' '+y, a:a<start?start:a, b:b>end?end:b, open:b>end}); } }
  else if(gran==='quarter'){ var q=Math.floor(end.getMonth()/3); for(y=end.getFullYear(); out.length<16; q--){ if(q<0){q=3;y--;} var a2=new Date(y,q*3,1), b2=new Date(y,q*3+3,0); if(b2<start) break; out.push({label:'Q'+(q+1)+' '+y, a:a2<start?start:a2, b:b2>end?end:b2, open:b2>end}); } }
  else if(gran==='year'){ for(y=end.getFullYear(); y>=start.getFullYear(); y--){ var a3=new Date(y,0,1), b3=new Date(y,11,31); out.push({label:String(y), a:a3<start?start:a3, b:b3>end?end:b3, open:b3>end}); } }
  else { var fm=fyStart(f)-1; var fy = end.getMonth()>=fm && fm>0 ? end.getFullYear()+1 : end.getFullYear(); for(; out.length<12; fy--){ var bb=fyBounds(fy,f); if(bb[1]<start) break; out.push({label:fm===0?String(fy):'FY'+String(fy).slice(2)+' ('+MON[bb[0].getMonth()]+' '+bb[0].getFullYear()+'–'+MON[bb[1].getMonth()]+' '+bb[1].getFullYear()+')', a:bb[0]<start?start:bb[0], b:bb[1]>end?end:bb[1], open:bb[1]>end}); } }
  return out.map(function(pr){ var p=periodStats(s, s.idx(pr.a), s.idx(pr.b)); p.label=pr.label; p.open=pr.open; return p; });
}
function renderBalTable(){
  var el=$('#balTbl'); if(!el) return; var s=series(), org=isOrg(), rows=periods(s,BAL_GRAN);
  el.innerHTML='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Period</th><th>Beginning</th><th>Contributions</th><th>'+(org?'Distributions':'Grants')+'</th><th>Fees</th><th>Return</th><th>Ending balance</th></tr></thead><tbody>'+
    rows.map(function(p){ return '<tr><td class="b">'+esc(p.label)+(p.open?' <span class="status st-entered" style="margin-left:6px">To date</span>':'')+'</td><td>'+money(p.start)+'</td><td class="pos">'+money(p.contrib)+'</td><td class="neg">'+money(p.grants)+'</td><td class="neg">'+money(p.fees)+'</td><td class="'+(p.ret>=0?'pos':'neg')+'">'+signed(p.ret)+' <span class="tiny">'+pct(p.retPct)+'</span></td><td class="b">'+money(p.end)+'</td></tr>'; }).join('')+'</tbody></table></div>';
}
function exportBalances(){ var s=series(), rows=periods(s,BAL_GRAN), f=F();
  var csv=[['Fund','Period','Beginning balance','Contributions',isOrg()?'Distributions':'Grants','Fees','Investment return','Return %','Ending balance']].concat(rows.map(function(p){ return [f.name,p.label,p.start.toFixed(2),p.contrib.toFixed(2),p.grants.toFixed(2),p.fees.toFixed(2),p.ret.toFixed(2),(p.retPct*100).toFixed(2),p.end.toFixed(2)]; }));
  downloadCSV(f.no+'-balances-'+BAL_GRAN+'.csv', csv); logSync('sf','Portal Activity','Exported '+BAL_GRAN+' balances');
}
function exportTx(a,b){ var s=series(), f=F(); var rows=[['Date','Type','Description','Amount']];
  s.b.ev.forEach(function(e){ if(e.i<a||e.i>b) return; rows.push([e.d, e.k==='contrib'?'Contribution':e.k==='grant'?(isOrg()?'Distribution':'Grant'):'Fee', e.k==='contrib'?e.method+(e.note?' — '+e.note:''):e.k==='grant'?e.org+' ('+e.status+')':'Administrative fee', (e.k==='contrib'?1:-1)*e.amt]); });
  S.contribs.concat(S.grants).forEach(function(x){ if(x.fund!==f.id) return; rows.push([ymd(new Date(x.t)), x.org?'Grant':'Contribution', x.org?x.org+' (submitted in portal)':x.method+' (submitted in portal)', (x.org?-1:1)*x.amt]); });
  downloadCSV(f.no+'-transactions.csv', rows);
}
function downloadCSV(name, rows){
  var csv=rows.map(function(r){ return r.map(function(c){ c=String(c); return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c; }).join(','); }).join('\n');
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },200);
  toast('Downloaded '+name+'.');
}

/* ============ ALLOCATION & MODELING ============ */
var REB = null, MODEL = { years:10, contrib:10000, grants:12000 };
VIEWS.allocation = function(){
  var f=F(), org=isOrg(), req=S.rebalance[f.id];
  var html = pageHead('Investments', org?'Investment allocation':'Allocation & modeling', {lede: org?'How the fund is invested today, and how each pool has performed.':'How your fund is invested today. Pick a model or build a custom mix — changes are batched and applied at quarter-end.'})+fundSwitch();
  html += '<div class="pad"><div class="card"><div class="card-k">Current allocation '+pin('ri')+'</div><div class="alloc">'+donut(f.pools,132,moneyK(balance()),'NOW')+allocLegend(f.pools)+'</div></div></div>';
  html += '<div class="gap-m"></div>'+rail('Pool performance','How the pools did','Illustrative')+'<div class="pad" style="padding-top:14px"><div class="tbl-wrap"><table class="tbl" style="min-width:420px"><thead><tr><th>Pool</th><th>Your share</th><th>YTD</th><th>1 year</th><th>5 yr avg</th></tr></thead><tbody>'+
    Object.keys(POOLS).map(function(k){ var P=POOLS[k]; return '<tr><td class="b"><i class="sw" style="background:'+P.color+'"></i>'+P.name+'</td><td>'+(f.pools[k]||0)+'%</td><td class="pos">'+pct(P.ytd)+'</td><td class="pos">'+pct(P.y1)+'</td><td>'+pct(P.y5)+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
  if(org){
    html += '<div class="gap-m"></div><div class="pad"><div class="card"><div class="card-k">Changing the allocation</div><p class="muted" style="font-size:14px">Allocation changes for organizational funds are coordinated with your philanthropic advisor and your board\u2019s investment guidance.</p><div class="gap-s"></div><button class="btn btn-quiet btn-sm" onclick="openMessage(\'Allocation question for '+jsq(f.name)+'\')">'+ic('chat',16)+'Ask your advisor</button></div></div>';
    return html;
  }
  if(!REB) REB = { model: req?req.model:null, mix: Object.assign({}, req?req.mix:f.pools) };
  html += '<div class="gap-m"></div>'+rail('Rebalance','How should we invest it?', req?'<span class="live ember"></span>Requested':'Quarter-end '+fdate(quarterEnd(TODAY),'short'));
  html += '<div class="pad" style="padding-top:14px">'+(req?'<div class="card" style="border-color:var(--ember);margin-bottom:12px"><div class="card-k">Change requested '+pin('ri')+'</div><p style="font-size:14px">Your request to move to <b>'+esc(req.label)+'</b> will be applied on <b>'+fdate(quarterEnd(TODAY))+'</b>. You can change it until then.</p></div>':'')+
    MODELS.map(function(m){ return '<button class="model'+(REB.model===m.id?' sel':'')+'" onclick="pickModel(\''+m.id+'\')">'+donut(m.mix,64)+'<div><div class="m-t">'+m.name+'</div><div class="m-s">'+m.avg+' 10-yr avg · '+m.risk+'</div></div></button>'; }).join('')+
    '<button class="model'+(REB.model==='custom'?' sel':'')+'" onclick="pickModel(\'custom\')" style="border-style:dashed"><span class="avatar" style="background:var(--well);color:var(--forest)">'+ic('settings',20)+'</span><div><div class="m-t">Custom mix</div><div class="m-s">Set each pool yourself</div></div></button>'+
    '<div id="custMix"></div>'+
    '<div class="gap-s"></div><button class="btn btn-accent btn-block btn-lg" id="rebBtn" onclick="submitRebalance()">'+(req?'Update request':'Request this change')+'</button>'+
    '<p class="tiny" style="margin-top:8px">Requests are batched with all donors and applied at quarter-end. This does not move money today.</p></div>';
  html += '<div class="gap-m"></div>'+rail('Portfolio modeling','Model my returns','Projection');
  html += '<div class="pad" style="padding-top:14px"><div class="card">'+
    sliderRow('mYears','Years ahead',MODEL.years,1,30,1,yrsFmt)+
    sliderRow('mContrib','Added each year',MODEL.contrib,0,100000,1000,money)+
    sliderRow('mGrants','Granted each year',MODEL.grants,0,100000,1000,money)+
    '<div class="chart on-light" id="modelChart" style="margin-top:10px"></div>'+
    '<div id="modelOut" style="margin-top:10px"></div>'+
    '<div class="row wrap" style="margin-top:12px"><button class="btn btn-quiet btn-sm" onclick="saveScenario()">'+ic('check',16)+'Save scenario</button></div>'+
    '<div id="scenarios" style="margin-top:12px"></div>'+
    '<p class="tiny" style="margin-top:10px">Projections are hypothetical and are not investment advice. Past performance doesn\u2019t guarantee future results. Talk with your advisor about your plan.</p></div></div>';
  return html;
};
VIEWS.allocation_after = function(){ if(isOrg()) return; renderCustMix(); runModel(); ['mYears','mContrib','mGrants'].forEach(function(id){ var el=$('#'+id); if(el) el.addEventListener('input', function(){ MODEL={years:+$('#mYears').value, contrib:+$('#mContrib').value, grants:+$('#mGrants').value}; runModel(); }); }); };
function sliderRow(id,label,val,min,max,step,fmt){ return '<div class="slider-row"><div class="sl-top"><span>'+label+'</span><b id="'+id+'V">'+fmt(val)+'</b></div><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" oninput="document.getElementById(\''+id+'V\').textContent=('+fmt.name+')(+this.value)"></div>'; }
function yrsFmt(v){ return v+' yrs'; }
function pickModel(id){ REB.model=id; if(id!=='custom') REB.mix=Object.assign({}, MODELS.filter(function(m){return m.id===id;})[0].mix); $$('.model').forEach(function(b,i){ b.classList.toggle('sel', (MODELS[i]?MODELS[i].id:'custom')===id); }); renderCustMix(); }
function renderCustMix(){
  var el=$('#custMix'); if(!el) return;
  if(REB.model!=='custom'){ el.innerHTML=''; updateRebBtn(); return; }
  el.innerHTML='<div class="card" style="margin-bottom:6px">'+Object.keys(POOLS).map(function(k){ return '<div class="slider-row"><div class="sl-top"><span><i class="sw" style="background:'+POOLS[k].color+'"></i>'+POOLS[k].name+'</span><b id="mx'+k+'">'+(REB.mix[k]||0)+'%</b></div><input type="range" min="0" max="100" step="5" value="'+(REB.mix[k]||0)+'" oninput="REB.mix[\''+k+'\']=+this.value;document.getElementById(\'mx'+k+'\').textContent=this.value+\'%\';updateRebBtn()"></div>'; }).join('')+
    '<div class="sl-top" style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px"><span>Total</span><b id="mixTot" class="ledger"></b></div><div class="total-bar" id="mixBar"><span></span></div></div>';
  updateRebBtn();
}
function mixTotal(){ return Object.keys(REB.mix).reduce(function(a,k){return a+(REB.mix[k]||0);},0); }
function updateRebBtn(){ var t=mixTotal(), b=$('#rebBtn'); if(b) b.disabled = !REB.model || t!==100; var tt=$('#mixTot'); if(tt){ tt.textContent=t+'%'+(t!==100?' — must equal 100%':''); var bar=$('#mixBar'); bar.classList.toggle('over',t>100); bar.firstChild.style.width=Math.min(100,t)+'%'; } }
function submitRebalance(){
  var f=F(); if(mixTotal()!==100) return;
  var label = REB.model==='custom'?'a custom mix':MODELS.filter(function(m){return m.id===REB.model;})[0].name+' model';
  S.rebalance[f.id]={ model:REB.model, mix:Object.assign({},REB.mix), label:label, t:Date.now() }; save();
  logSync('ri','Reallocation Request','Requested '+label+' for '+f.name+' (applies '+fdate(quarterEnd(TODAY))+')');
  openSheet({kick:'Request received', title:'Rebalance requested', body:'<div class="center"><div class="done-mark">'+ic('check',30,2.4)+'</div><p class="lede" style="margin:0 auto">Your move to the <b>'+esc(label)+'</b> will be applied at quarter-end, <b>'+fdate(quarterEnd(TODAY))+'</b>. A confirmation is on its way to '+esc(S.profile.email)+'.</p></div>', foot:'<button class="btn btn-primary" onclick="closeSheet();render()">Done</button>'});
}
function runModel(){
  var start=balance(), yrs=MODEL.years, rates=[.048,.064,.082], names=['Conservative','Balanced','Growth'], colors=['#1A8DA9','#19B9A9','#EE7331'];
  var list=rates.map(function(r,i){ var v=start, vals=[v]; for(var y=1;y<=yrs;y++){ v=v*(1+r)+MODEL.contrib-MODEL.grants; if(v<0) v=0; vals.push(v); } return {values:vals, color:colors[i], name:names[i], w:i===1?2.6:1.8}; });
  lineChart('modelChart', list, {h:190, label:'Projected fund value by model', xLabels:[{k:0,t:'Today'},{k:yrs,t:(TODAY.getFullYear()+yrs)+''}]});
  $('#modelOut').innerHTML='<div class="facts">'+list.map(function(l){ return '<div class="fr"><span class="fk"><i class="sw" style="background:'+l.color+'"></i>'+l.name+'</span><span class="fv">'+money(l.values[yrs])+'</span></div>'; }).join('')+'<div class="fr"><span class="fk">Total granted</span><span class="fv">'+money(MODEL.grants*yrs)+'</span></div></div>';
  window.__lastModel=list;
  renderScenarios();
}
function saveScenario(){ var l=window.__lastModel; if(!l) return; S.scenarios.unshift({t:Date.now(), fund:S.fundId, years:MODEL.years, contrib:MODEL.contrib, grants:MODEL.grants, bal:l[1].values[MODEL.years]}); S.scenarios=S.scenarios.slice(0,6); save(); logSync('sf','Portal Activity','Saved a modeling scenario'); renderScenarios(); toast('Scenario saved to your profile.'); }
function renderScenarios(){ var el=$('#scenarios'); if(!el) return; var mine=S.scenarios.filter(function(x){return x.fund===S.fundId;});
  el.innerHTML = mine.length ? '<div class="card-k">Saved scenarios</div>'+mine.map(function(x){ return '<div class="ff-row" style="margin-bottom:6px"><div class="ffr-main"><div class="ffr-name">'+x.years+' years · +'+moneyK(x.contrib)+' / −'+moneyK(x.grants)+' a year</div><div class="ffr-meta">Saved '+fdate(new Date(x.t))+' · balanced model</div></div><div class="ffr-amt">'+moneyK(x.bal)+'</div></div>'; }).join('') : ''; }

/* ============================================================
   ACCOUNT MANAGEMENT — part 2
   grants (Candid search, cart, history) · contribute · QR ·
   statements & tax · fund documents
   ============================================================ */

/* ---------- grant data helpers ---------- */
function allGrants(f){
  f=f||F();
  var mine = S.grants.filter(function(g){return g.fund===f.id;}).map(function(g){ return {d:ymd(new Date(g.t)), t:g.t, amt:g.amt, org:g.org, purpose:g.purpose, status:grantStatus(g), rec:g.rec, id:g.id, portal:true}; });
  var base = build(f).ev.filter(function(e){return e.k==='grant';}).map(function(e){ return {d:e.d, t:parseYmd(e.d).getTime(), amt:e.amt, org:e.org, purpose:e.purpose, status:e.status, id:'T'+(hash(e.d+e.org)%900000+100000)}; });
  return mine.concat(base).sort(function(a,b){ return b.t-a.t; });
}
function stClass(st){ return {Posted:'st-posted',Approved:'st-approved',Entered:'st-entered',Pending:'st-entered',Queued:'st-queued'}[st]||'st-queued'; }
function grantRow(g){
  var o=orgByName(g.org), step={Entered:1,Approved:2,Posted:3}[g.status]||3;
  return '<button class="ff-row" onclick="openGrantDetail(\''+jsq(g.id)+'\')"><span class="avatar" style="background:'+o.color+'">'+initials(g.org)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(g.org)+'</span><span class="ffr-meta" style="display:block">'+fdate(g.d)+' · '+esc(g.purpose||'Grant')+'</span>'+
    (g.status!=='Posted'?'<span class="steps"><span class="done"></span><span class="'+(step>=2?'done':'on')+'"></span><span class="'+(step>=3?'done':(step===2?'on':''))+'"></span></span>':'')+
    '</span><span class="ffr-end" style="flex-direction:column;align-items:flex-end;gap:6px"><span class="ffr-amt">'+money(g.amt)+'</span><span class="status '+stClass(g.status)+'">'+g.status+'</span></span></button>';
}
function openGrantDetail(id){
  var g=allGrants().filter(function(x){return x.id===id;})[0]; if(!g) return;
  var step={Entered:1,Approved:2,Posted:3}[g.status]||3, o=orgByName(g.org);
  var tl=[['Entered','Recommendation recorded in Ren iPhi'],['Approved','Foundation due diligence complete'],['Posted','Payment sent to the organization']].map(function(x,i){ var on=i<step; return '<div class="row" style="align-items:flex-start;padding:8px 0"><span class="avatar round" style="width:26px;height:26px;background:'+(on?'var(--moss)':'var(--well)')+';color:'+(on?'#fff':'var(--ink-3)')+'">'+(on?ic('check',14,2.6):i+1)+'</span><div><div style="font-weight:600;color:var(--forest)">'+x[0]+'</div><div class="tiny">'+x[1]+'</div></div></div>'; }).join('');
  openSheet({kick:isOrg()?'Grant or distribution':'Grant', title:g.org, body:
    '<div class="facts"><div class="fr"><span class="fk">Amount</span><span class="fv">'+money(g.amt,true)+'</span></div><div class="fr"><span class="fk">Date</span><span class="fv">'+fdate(g.d)+'</span></div><div class="fr"><span class="fk">Purpose</span><span class="fv">'+esc(g.purpose||'General operating support')+'</span></div><div class="fr"><span class="fk">Recognition</span><span class="fv">'+esc(g.rec||'Use my name')+'</span></div><div class="fr"><span class="fk">Transaction ID</span><span class="fv ledger">'+esc(g.id)+'</span></div><div class="fr"><span class="fk">Fund</span><span class="fv">'+esc(F().name)+'</span></div></div>'+
    '<div class="gap-m"></div><div class="card-k">Status '+pin('ri')+'</div>'+tl,
    foot:'<button class="btn btn-quiet" onclick="closeSheet();openGrantForm(\''+jsq(g.org)+'\','+g.amt+')">Grant again</button>'+(o.url?'<a class="btn btn-quiet" href="'+esc(o.url)+'" target="_blank" rel="noopener">Visit website</a>':'')});
}

/* ---------- recommend a grant (Candid hybrid) ---------- */
var GQ = '';
VIEWS.grants = function(){
  var f=F(), org=isOrg();
  var html = pageHead('Dollars out', org?'Request a grant':'Choose a nonprofit', {lede: org?'Organizational funds usually grant to their own organization. You can also recommend a grant to another nonprofit.':'Search any registered nonprofit. Add several grants to your cart and submit them together.'})+fundSwitch();
  if(org){
    var s=series(), fyA=s.idx(fyBounds(curFYEnd())[0]), paid=periodStats(s,fyA,s.N-1).grants, policy=balance()*f.spending;
    html += '<div class="pad"><div class="calc-out">'+guilloche(250,330)+'<div class="card-k" style="color:var(--gray2)">Distribution to your organization</div><div class="co-big">'+money(Math.max(0,policy-paid))+'</div><div class="co-cap">Remaining under your '+(f.spending*100).toFixed(1)+'% spending policy this fiscal year</div>'+
      '<div class="calc-units"><div><div class="u-v">'+moneyK(policy)+'</div><div class="u-k">Policy amount</div></div><div><div class="u-v">'+moneyK(paid)+'</div><div class="u-k">Paid '+fyLabel(curFYEnd())+'</div></div><div><div class="u-v">'+moneyK(available())+'</div><div class="u-k">Fund available</div></div></div>'+
      '<div class="gap-m"></div><button class="btn btn-accent btn-block btn-lg" onclick="openGrantForm(\''+jsq(f.org)+'\')">'+ic('grant',18)+'Request a distribution</button></div>'+
      '<p class="tiny" style="margin-top:8px">Spending-policy figures are sample values for this prototype, based on the fund agreement on file.</p></div><div class="gap-m"></div>';
  }
  html += '<div class="pad"><div class="input-ic f-row" style="margin:0">'+ic('search',18)+'<input id="gSearch" type="search" placeholder="Search nonprofits by name, cause or neighborhood" value="'+esc(GQ)+'" oninput="GQ=this.value;renderOrgResults()" aria-label="Search nonprofits"></div>'+
    '<div class="row" style="margin-top:10px;justify-content:space-between"><span class="p-kick" style="--pk:var(--aqua)">Powered by Candid</span>'+pin('cd')+'</div></div>';
  var favs=S.favorites;
  if(favs.length) html += '<div class="gap-s"></div><div class="pad"><div class="chip-row scroll" style="padding-bottom:4px">'+favs.map(function(n){ return '<button class="chip" onclick="openGrantForm(\''+jsq(n)+'\')">'+ic('star',13,2)+esc(n)+'</button>'; }).join('')+'</div></div>';
  html += '<div class="gap-m"></div><div id="orgResults"></div>';
  html += '<p class="tiny pad" style="margin-top:8px">Candid seal levels shown here are sample placeholders for the prototype. Organizations listed are recent Cleveland Foundation grantees.</p>';
  return html;
};
VIEWS.grants_after = function(){ renderOrgResults(); };
function renderOrgResults(){
  var el=$('#orgResults'); if(!el) return; var f=F(), q=GQ.trim().toLowerCase();
  var list, head;
  if(q){ list=ORGS.filter(function(o){ return (o.name+' '+o.program+' '+o.hood+' '+o.pillar+' '+o.mission).toLowerCase().indexOf(q)>-1; }).slice(0,25); head=rail('Search results', list.length+' match'+(list.length===1?'':'es'), ''); }
  else {
    var focus=(f.focus||[]).concat(S.profile.interests||[]).join(' ').toLowerCase();
    var scored=ORGS.map(function(o){ var sc=0; ['housing','arts','food','education','health','environment','youth','workforce'].forEach(function(k){ if(focus.indexOf(k)>-1 && (o.program+' '+o.mission+' '+o.pillar).toLowerCase().indexOf(k)>-1) sc+=2; }); sc+=(hash(o.name)%7)/10; return {o:o,sc:sc}; }).sort(function(a,b){return b.sc-a.sc;});
    list=scored.slice(0,8).map(function(x){return x.o;});
    head=rail('Recommended for you','Aligned with your interests', '<button onclick="go(\'profile\')">Edit interests</button>');
  }
  el.innerHTML = head + '<div class="list" style="padding-top:14px">'+(list.length?list.map(orgRow).join(''):'<div class="empty"><b>No matches</b>Try a shorter name, a cause like "housing", or a neighborhood.</div>')+'</div>';
}
function orgRow(o){
  var seal=o.seal==='Platinum'?'plat':(o.seal==='Silver'?'silver':'');
  return '<button class="ff-row" onclick="openGrantForm(\''+jsq(o.name)+'\')"><span class="avatar" style="background:'+o.color+'">'+initials(o.name)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(o.name)+'</span><span class="ffr-sub" style="display:block">'+esc(o.mission)+'</span><span class="row" style="gap:8px;margin-top:6px"><span class="seal '+seal+'">'+o.seal+'</span><span class="ffr-meta" style="margin:0">'+esc(o.program)+(o.hood?' · '+esc(o.hood):'')+'</span></span></span>'+ic('chev',18)+'</button>';
}
function openGrantForm(orgName, amt, dedication){
  var f=F(), o=orgByName(orgName), own = isOrg() && orgName===f.org, fav=S.favorites.indexOf(orgName)>-1;
  amt = amt || (own?Math.round(balance()*f.spending/4/1000)*1000:1000);
  var chips = own ? [5000,10000,25000,50000] : [250,500,1000,2500,5000,10000];
  openSheet({ kick: own?'Distribution request':'Grant recommendation', title:orgName, body:
    '<div class="target" style="margin-bottom:16px"><span class="avatar" style="background:'+o.color+'">'+initials(orgName)+'</span><div style="min-width:0"><div class="tg-k">From '+esc(f.name)+'</div><div class="tg-s">Available to grant <b>'+money(available())+'</b></div></div></div>'+
    '<div class="amt-grid">'+chips.map(function(c){ return '<button type="button" class="'+(c===amt?'sel':'')+'" onclick="setGrantAmt('+c+')">'+moneyK(c)+'</button>'; }).join('')+'</div>'+
    '<div class="f-row"><label for="gAmt">Amount</label><input id="gAmt" inputmode="decimal" value="'+amt+'" oninput="$$(\'.amt-grid button\').forEach(function(b){b.classList.remove(\'sel\')})"></div>'+
    '<div class="f-row"><label for="gPurpose">Purpose</label><select id="gPurpose">'+(own?['Quarterly spending-policy distribution','Operating support','Program support','Capital project']:['General operating support','Program support','Capital campaign','Endowment','Scholarship','Event or sponsorship']).map(function(p){return '<option>'+p+'</option>';}).join('')+'</select></div>'+
    (own?'':'<div class="f-row"><label for="gRec">Recognition</label><select id="gRec" onchange="$(\'#gDedWrap\').hidden=this.value.indexOf(\'In \')!==0">'+['Use my name','Anonymous','In honor of…','In memory of…'].map(function(p){return '<option'+(dedication&&p==='In honor of…'?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>'+
      '<div class="f-row" id="gDedWrap" '+(dedication?'':'hidden')+'><label for="gDed">Name to recognize</label><input id="gDed" value="'+esc(dedication||'')+'" placeholder="Who is this gift for?"></div>')+
    '<div class="f-row"><label for="gNote">Note to the Foundation (optional)</label><input id="gNote" placeholder="Anything we should know?"></div>'+
    '<p class="tiny">Your recommendation goes to the Foundation for review before payment. You\u2019ll see it move from entered to approved to paid.</p>',
    foot:(own?'':'<button class="btn btn-quiet" onclick="toggleFav(\''+jsq(orgName)+'\',this)" aria-pressed="'+fav+'">'+ic('star',16,2)+(fav?'Saved':'Save')+'</button>')+'<button class="btn btn-accent" onclick="addToCart(\''+jsq(orgName)+'\')">'+ic('cart',18)+'Add to cart</button>' });
}
function setGrantAmt(v){ $('#gAmt').value=v; $$('.amt-grid button').forEach(function(b){ b.classList.toggle('sel', b.textContent===moneyK(v)); }); }
function toggleFav(n, btn){ var i=S.favorites.indexOf(n); if(i>-1) S.favorites.splice(i,1); else S.favorites.unshift(n); save(); logSync('sf','Favorite Organization',(i>-1?'Removed ':'Saved ')+n); if(btn) btn.innerHTML=ic('star',16,2)+(i>-1?'Save':'Saved'); }
function addToCart(orgName){
  var amt=parseFloat(String($('#gAmt').value).replace(/[^0-9.]/g,''));
  if(!amt || amt<=0){ $('#gAmt').parentNode.classList.add('err'); toast('Enter an amount to grant.'); return; }
  if(amt > available()){ toast('That\u2019s more than the '+money(available())+' available in this fund.'); return; }
  var recEl=$('#gRec'), rec=recEl?recEl.value:'Use my name'; if(rec.indexOf('In ')===0){ var d=$('#gDed').value.trim(); if(!d){ toast('Add the name you\u2019d like to recognize.'); return; } rec=rec.replace('…',' '+d); }
  S.cart.push({ id:'C'+Date.now(), fund:S.fundId, org:orgName, amt:Math.round(amt*100)/100, purpose:$('#gPurpose').value, rec:rec, note:$('#gNote').value });
  save(); logSync('sf','Grant Cart','Added '+money(amt)+' for '+orgName+' to cart');
  closeSheet(); renderChrome(); toast('Added to your grant cart.');
  if(ROUTE==='home') render();
  setTimeout(openCart, 250);
}
function openCart(){
  var f=F(), items=S.cart.filter(function(c){return c.fund===f.id;}), tot=cartTotal(f);
  var body = items.length ? items.map(function(c){ var o=orgByName(c.org); return '<div class="ff-row"><span class="avatar" style="background:'+o.color+'">'+initials(c.org)+'</span><div class="ffr-main"><div class="ffr-name">'+esc(c.org)+'</div><div class="ffr-meta">'+esc(c.purpose)+' · '+esc(c.rec)+'</div></div><div class="ffr-end"><span class="ffr-amt">'+money(c.amt)+'</span><button class="pop-close" style="width:34px;height:34px" onclick="removeCart(\''+c.id+'\')" aria-label="Remove">'+ic('x',16)+'</button></div></div>'; }).join('')+
      '<div class="facts" style="margin-top:6px"><div class="fr total"><span class="fk">Total · '+items.length+' grant'+(items.length>1?'s':'')+'</span><span class="fv">'+money(tot,true)+'</span></div><div class="fr"><span class="fk">Left to grant after</span><span class="fv">'+money(Math.max(0,balance()-pendingOut()-tot))+'</span></div></div>'+
      '<p class="tiny" style="margin-top:10px">Submitting sends one batch to Ren iPhi and one receipt email.</p>'
    : '<div class="empty"><b>Your cart is empty</b>Find a nonprofit and add a grant — you can submit several at once.</div>';
  openSheet({ kick:f.name, title:'Grant cart', body:body, foot: items.length?'<button class="btn btn-quiet" onclick="closeSheet();go(\'grants\')">Add another</button><button class="btn btn-accent" onclick="submitCart()">Submit '+money(tot)+'</button>':'<button class="btn btn-accent" onclick="closeSheet();go(\'grants\')">Find a nonprofit</button>' });
}
function removeCart(id){ S.cart=S.cart.filter(function(c){return c.id!==id;}); save(); renderChrome(); openCart(); if(ROUTE==='home') render(); }
function submitCart(){
  var f=F(), items=S.cart.filter(function(c){return c.fund===f.id;}); if(!items.length) return;
  var batch='B'+String(Date.now()).slice(-7), t=Date.now();
  items.forEach(function(c,i){ S.grants.push({ id:'P'+String(t+i).slice(-7), batch:batch, t:t+i, fund:f.id, org:c.org, amt:c.amt, purpose:c.purpose, rec:c.rec }); });
  S.cart=S.cart.filter(function(c){return c.fund!==f.id;}); save();
  logSync('ri','Grant Batch','Submitted '+items.length+' grant'+(items.length>1?'s':'')+' ('+money(items.reduce(function(a,c){return a+c.amt;},0))+') · batch '+batch);
  logSync('sf','Engagement Activity','Grant recommendations submitted from the portal');
  if(window.ENG) ENG.autoBadge('gift');
  renderChrome();
  openSheet({ kick:'Batch '+batch, title:'Grants submitted', body:'<div class="center"><div class="done-mark">'+ic('check',30,2.4)+'</div><p class="lede" style="margin:0 auto">'+items.length+' recommendation'+(items.length>1?'s are':' is')+' on the way to the Foundation. Track each one in your grant history as it moves from entered to paid.</p></div>', foot:'<button class="btn btn-quiet" onclick="closeSheet()">Close</button><button class="btn btn-primary" onclick="go(\'history\')">View history</button>' });
  if(ROUTE==='home'||ROUTE==='history') render();
}

/* ---------- grant history ---------- */
var HF = { st:'all', yr:'all' };
VIEWS.history = function(){
  var org=isOrg(), g=allGrants();
  var years=[]; g.forEach(function(x){ var y=x.d.slice(0,4); if(years.indexOf(y)<0) years.push(y); });
  var list=g.filter(function(x){ return (HF.st==='all'||(HF.st==='done'?x.status==='Posted':x.status!=='Posted')) && (HF.yr==='all'||x.d.slice(0,4)===HF.yr); });
  var tot=list.filter(function(x){return x.status==='Posted';}).reduce(function(a,x){return a+x.amt;},0);
  return pageHead('Dollars out', org?'Grants & distributions':'Grant history',{lede:'Every grant from this fund, with its status. Filter by year for your records.'})+fundSwitch()+
    '<div class="pad"><div class="seg">'+[['all','All'],['prog','In progress'],['done','Paid']].map(function(x){ return '<button class="'+(HF.st===x[0]?'sel':'')+'" onclick="HF.st=\''+x[0]+'\';render()">'+x[1]+'</button>'; }).join('')+'</div>'+
    '<div class="gap-s"></div><div class="chip-row scroll"><button class="chip'+(HF.yr==='all'?' sel':'')+'" onclick="HF.yr=\'all\';render()">All years</button>'+years.map(function(y){ return '<button class="chip'+(HF.yr===y?' sel':'')+'" onclick="HF.yr=\''+y+'\';render()">'+y+'</button>'; }).join('')+'</div></div>'+
    '<div class="gap-m"></div>'+rail(HF.yr==='all'?'All time':HF.yr, list.length+' grant'+(list.length===1?'':'s'), money(tot)+' paid')+
    '<div class="list" style="padding-top:14px">'+(list.length?list.slice(0,60).map(grantRow).join(''):'<div class="empty"><b>Nothing here yet</b>Try another filter, or recommend a grant.</div>')+'</div>'+
    '<div class="pad"><div class="row wrap"><button class="btn btn-quiet btn-sm" onclick="exportGrants()">'+ic('download',16)+'Export CSV</button><button class="btn btn-accent btn-sm" onclick="go(\'grants\')">'+ic('grant',16)+'New grant</button></div></div>';
};
function exportGrants(){ var f=F(); downloadCSV(f.no+'-grants.csv', [['Date','Organization','Purpose','Amount','Status','Transaction ID']].concat(allGrants().map(function(g){ return [g.d,g.org,g.purpose,g.amt,g.status,g.id]; }))); }

/* ============ CONTRIBUTE ============ */
var CT = { amt:2500, method:'ach', pool:null, freq:'once' };
var METHODS = [
  { id:'ach',   t:'Bank transfer', s:'Checking ••4471', icon:'bank', label:'Bank transfer (ACH)' },
  { id:'card',  t:'Card',          s:'Visa ••8821',     icon:'card', label:'Credit card' },
  { id:'stock', t:'Stock',         s:'Gift appreciated securities', icon:'stock', label:'Securities' },
  { id:'wire',  t:'Wire',          s:'Instructions by pool', icon:'wire', label:'Bank transfer (wire)' },
  { id:'check', t:'Check',         s:'Mail to the Foundation', icon:'mail', label:'Check' }
];
VIEWS.contribute = function(p){
  var f=F(), org=isOrg();
  if(p && p.openNew) setTimeout(openNewFund, 200);
  if(!CT.pool || !f.pools[CT.pool]) CT.pool=Object.keys(f.pools)[0];
  var bal=balance();
  var html = pageHead('Dollars in','How much will you add?',{lede: org?'Add to the endowment. Community supporters can also give through the fund\u2019s QR code.':'Contributions are tax-deductible the moment they land in your fund.'})+fundSwitch()+
    '<div class="pad"><div class="big-amt"><span class="cur">$</span><input id="ctAmt" inputmode="decimal" value="'+CT.amt.toLocaleString('en-US')+'" oninput="ctAmtInput(this)" aria-label="Contribution amount"></div>'+
    '<div class="chip-row" id="ctChips">'+[500,1000,2500,5000,10000,25000].map(function(c){ return '<button class="chip'+(CT.amt===c?' sel':'')+'" onclick="ctSet('+c+')">'+money(c)+'</button>'; }).join('')+'</div>'+
    '<div class="gap-m"></div><div class="target"><span class="avatar" style="background:'+f.color+'">'+ic('fund',20)+'</span><div style="min-width:0"><div class="tg-k">Adding to</div><div class="tg-t">'+esc(f.name)+'</div><div class="tg-s" id="ctProj">Current balance '+money(bal)+' → <b>'+money(bal+CT.amt)+'</b></div></div></div>'+
    '<div class="gap-m"></div><div class="f-lab">How you\u2019ll give</div><div class="method-grid">'+METHODS.map(function(m){ return '<button class="'+(CT.method===m.id?'sel':'')+'" onclick="CT.method=\''+m.id+'\';render()"><span style="color:'+(CT.method===m.id?'var(--aqua)':'var(--mid)')+'">'+ic(m.icon,20)+'</span><span class="mg-t">'+m.t+'</span><span class="mg-s">'+m.s+'</span></button>'; }).join('')+'</div>'+
    '<div class="gap-s"></div><div id="ctDetail">'+methodDetail(f)+'</div>'+
    '<div class="gap-m"></div><button class="btn btn-accent btn-block btn-lg" onclick="confirmContrib()">Continue</button>'+
    '<p class="tiny" style="margin-top:8px">'+(org?'Gifts to an organizational fund benefit the organization; donors receive a receipt from the Foundation.':'You\u2019ll get a tax receipt by email. Grants from your fund aren\u2019t separately deductible.')+'</p></div>';
  // open a new fund
  html += '<div class="gap-m"></div><div class="pgrid">'+
    '<button class="panel panel-gate" onclick="openNewFund()">'+guilloche()+'<div class="p-kick">Another account</div><div class="p-label">Open a new fund</div><div class="p-sub">Start a second fund for a child, a cause or a family legacy.</div><div class="p-count">Talk with your advisor first</div></button>'+
    (org?panel('qr','Community gifts','Share the QR code','Supporters give straight to the fund.','qr','var(--gray2)','var(--moss)'):panel('endow','Plan ahead','Endowment calculator','See what a lasting gift could produce each year.','calc','var(--gray2)','var(--mid)'))+'</div>';
  // by tax year / fiscal year
  html += '<div class="gap-m"></div>'+rail(org?'Gifts received':'For your taxes', org?'Gifts by fiscal year':'Contributions by tax year', '<button onclick="go(\'statements\',{tab:\'tax\'})">Receipts</button>')+'<div class="pad" style="padding-top:14px">'+taxYearTable(4)+'</div>';
  var mine=S.contribs.filter(function(c){return c.fund===f.id;});
  if(mine.length) html += '<div class="gap-m"></div>'+rail('This session','Your recent contributions','')+'<div class="list" style="padding-top:14px">'+mine.slice().reverse().map(function(c){ var st=contribStatus(c); return '<div class="ff-row"><span class="avatar" style="background:var(--well);color:var(--forest)">'+ic('plus',18)+'</span><div class="ffr-main"><div class="ffr-name">'+money(c.amt)+(c.freq&&c.freq!=='once'?' · '+c.freq:'')+'</div><div class="ffr-meta">'+esc(c.method)+' · '+fdate(new Date(c.t))+'</div></div><span class="status '+stClass(st)+'">'+st+'</span></div>'; }).join('')+'</div>';
  return html;
};
function ctAmtInput(el){ var v=parseFloat(el.value.replace(/[^0-9.]/g,''))||0; CT.amt=v; $$('#ctChips .chip').forEach(function(b){ b.classList.toggle('sel', b.textContent===money(v)); }); var bal=balance(); $('#ctProj').innerHTML='Current balance '+money(bal)+' → <b>'+money(bal+v)+'</b>'; }
function ctSet(v){ CT.amt=v; var el=$('#ctAmt'); el.value=v.toLocaleString('en-US'); ctAmtInput(el); }
function methodDetail(f){
  var m=CT.method;
  if(m==='ach') return '<div class="f-row"><label for="ctFreq">Frequency</label><select id="ctFreq" onchange="CT.freq=this.value">'+[['once','One time'],['Monthly','Monthly'],['Quarterly','Quarterly'],['Annually','Annually']].map(function(o){return '<option value="'+o[0]+'"'+(CT.freq===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select><div class="hint">From Checking ••4471 · <button class="link" style="padding:0;font-size:9px" onclick="toast(\'Adding a bank account opens the payment processor\u2019s secure form.\')">Add an account</button></div></div>';
  if(m==='card') return '<p class="tiny">Card gifts post right away. A processing fee may apply.</p>';
  if(m==='stock') return '<div class="wire"><div class="fr"><span class="fk">Transfer type</span><span class="fv">DTC</span></div><div class="fr"><span class="fk">Reference</span><span class="fv">'+f.no+'</span></div><p class="tiny" style="margin-top:8px">Your advisor sends the Foundation\u2019s brokerage details and a letter of authorization for your broker. Tell us what you\u2019re sending so it\u2019s credited to the right fund.</p></div>';
  if(m==='wire'){
    var P=POOLS[CT.pool];
    return '<div class="f-lab" style="margin-top:4px">Credit this wire to</div><div class="chip-row" style="margin-bottom:10px">'+Object.keys(f.pools).map(function(k){ return '<button class="chip'+(CT.pool===k?' sel':'')+'" onclick="CT.pool=\''+k+'\';$(\'#ctDetail\').innerHTML=methodDetail(F())"><span class="cd" style="background:'+POOLS[k].color+'"></span>'+POOLS[k].name+' · '+f.pools[k]+'%</button>'; }).join('')+'</div>'+
      '<div class="wire"><div class="fr"><span class="fk">Beneficiary</span><span class="fv">The Cleveland Foundation</span></div><div class="fr"><span class="fk">Custody account</span><span class="fv">'+P.name+'</span></div><div class="fr"><span class="fk">Bank / ABA</span><span class="fv">Sent by your advisor</span></div><div class="fr"><span class="fk">Account</span><span class="fv">•••• '+P.code+'</span></div><div class="fr"><span class="fk">Memo / reference</span><span class="fv">'+f.no+'-'+P.code+'</span></div></div>'+
      '<p class="tiny" style="margin-top:8px">Each investment pool has its own custody account, so wiring details change with the pool you choose. Sample details only — always confirm wiring instructions by phone with the Foundation before sending money.</p>';
  }
  return '<div class="wire"><div class="fr"><span class="fk">Payable to</span><span class="fv">The Cleveland Foundation</span></div><div class="fr"><span class="fk">Memo</span><span class="fv">'+f.no+' · '+esc(f.name)+'</span></div><div class="fr"><span class="fk">Mail to</span><span class="fv">P.O. Box #77051<br>Cleveland, OH 44194-0015</span></div></div>';
}
function confirmContrib(){
  var f=F(), amt=CT.amt; if(!amt || amt<=0){ toast('Enter an amount to contribute.'); return; }
  var m=METHODS.filter(function(x){return x.id===CT.method;})[0], freq=CT.method==='ach'?CT.freq:'once';
  openSheet({ kick:'Review', title:'Confirm your contribution', body:'<div class="facts"><div class="fr"><span class="fk">Amount</span><span class="fv">'+money(amt,true)+'</span></div><div class="fr"><span class="fk">To</span><span class="fv">'+esc(f.name)+'</span></div><div class="fr"><span class="fk">Method</span><span class="fv">'+esc(m.label)+(CT.method==='wire'?' · '+POOLS[CT.pool].name:'')+'</span></div><div class="fr"><span class="fk">Frequency</span><span class="fv">'+(freq==='once'?'One time':freq)+'</span></div><div class="fr total"><span class="fk">New balance</span><span class="fv">'+money(balance()+(['ach','card'].indexOf(CT.method)>-1?amt:0))+'</span></div></div>'+
    (['ach','card'].indexOf(CT.method)<0?'<p class="tiny" style="margin-top:10px">We\u2019ll mark this as pending until the gift arrives, then post it to your balance.</p>':''),
    foot:'<button class="btn btn-quiet" onclick="closeSheet()">Edit</button><button class="btn btn-accent" onclick="submitContrib()">Contribute '+money(amt)+'</button>' });
}
function submitContrib(){
  var f=F(), m=METHODS.filter(function(x){return x.id===CT.method;})[0];
  var c={ id:'G'+Date.now(), t:Date.now(), fund:f.id, amt:CT.amt, method:m.label, freq:CT.method==='ach'?CT.freq:'once', pool:CT.method==='wire'?CT.pool:null };
  S.contribs.push(c); save();
  logSync('ri','Contribution', money(c.amt)+' '+m.label+' to '+f.name+(c.freq!=='once'?' ('+c.freq+')':''));
  logSync('sf','Gift / Opportunity','Contribution recorded on donor profile');
  if(window.ENG) ENG.autoBadge('gift');
  var posted = contribStatus(c)==='Posted';
  openSheet({ kick:'Thank you', title: posted?'Contribution received':'Contribution pending', body:'<div class="center"><div class="done-mark">'+ic('check',30,2.4)+'</div><p class="lede" style="margin:0 auto">'+money(c.amt)+(posted?' is now in ':' will be added to ')+esc(f.name)+'. '+(isOrg()?'':'Your tax receipt is on its way to '+esc(S.profile.email)+'.')+'</p></div>',
    foot:'<button class="btn btn-quiet" onclick="printReceipt(\''+c.id+'\')">'+ic('download',16)+'Receipt</button><button class="btn btn-primary" onclick="closeSheet();go(\'home\')">Back to dashboard</button>' });
}
function taxYearTable(n){
  var f=F(), org=isOrg(), rows={}, ev=build(f).ev;
  function key(d){ if(!org) return String(d.getFullYear()); var fm=fyStart(f)-1; var y=(fm>0 && d.getMonth()>=fm)?d.getFullYear()+1:d.getFullYear(); return fyLabel(y); }
  ev.forEach(function(e){ if(e.k!=='contrib') return; var k=key(parseYmd(e.d)); rows[k]=rows[k]||{n:0,amt:0}; rows[k].n++; rows[k].amt+=e.amt; });
  S.contribs.forEach(function(c){ if(c.fund!==f.id) return; var k=key(new Date(c.t)); rows[k]=rows[k]||{n:0,amt:0}; rows[k].n++; rows[k].amt+=c.amt; });
  var keys=Object.keys(rows).sort().reverse().slice(0,n||99);
  return '<div class="facts">'+keys.map(function(k){ return '<div class="fr"><span class="fk">'+k+' · '+rows[k].n+' gift'+(rows[k].n>1?'s':'')+'</span><span class="fv row" style="gap:10px;justify-content:flex-end">'+money(rows[k].amt)+(org?'':'<button class="link" style="padding:0" onclick="printTaxLetter(\''+k+'\')">'+ic('download',14)+'</button>')+'</span></div>'; }).join('')+'</div>';
}
/* ============ OPEN A DONOR ADVISED FUND (online flow: open/index.html) ============
   Every way in uses the same flow: "Open a DAF" in the community/advisor apps, the link
   on this portal's sign-in page, and "Open another account" inside the portal.
   When the donor finishes, open/ saves a small hand-off (NEW_FUND_KEY): name, email,
   fund name, gift, payment type, allocation and persona. Never card, bank or password
   data. Then it sends them to portal/?newfund=1, where init.js calls acceptNewFund(). */
var OPEN_FLOW = '../open/', NEW_FUND_KEY = 'tcf_new_fund';
function openNewFund(){ location.href = OPEN_FLOW + '?from=portal'; }

/* the flow's investment pools → this prototype's pool set (unlisted pools count as Balanced) */
var FLOW_POOLS = { growth:'growth', balanced:'balanced', sri:'sri', mm:'cash' };
/* registration interests (landing page) → this portal's causes (INTERESTS) */
/* V1: registration uses the same 17 Fields of Interest as the portal, so labels carry over as-is. */
var REG_INTERESTS = INTERESTS_V1.map(function(f){ return [f.toLowerCase(), f]; });
function causesFromRegistration(){
  var reg=null; try{ reg=JSON.parse(localStorage.getItem('tcf_registration')||'null'); }catch(e){}
  var out=[]; ((reg && reg.interests) || []).forEach(function(label){
    var l=String(label).toLowerCase(), hit=REG_INTERESTS.filter(function(m){ return l.indexOf(m[0])===0; })[0];
    if(hit && out.indexOf(hit[1])<0) out.push(hit[1]);
  });
  return out;
}

/* Returns the new fund, or null when there's no valid hand-off. */
function acceptNewFund(){
  var h=null; try{ h=JSON.parse(localStorage.getItem(NEW_FUND_KEY)||'null'); localStorage.removeItem(NEW_FUND_KEY); }catch(e){}
  if(!h || h.v!==1 || !h.fundName || !(h.gift>0)) return null;
  var addingToMine = h.from==='portal' && S.signedIn;   /* an existing holder opening another fund */
  if(!addingToMine){
    var parts=String(h.name||'').trim().split(/\s+/), keep=S.keep;
    S = defaultState(); S.keep = keep; S.account = 'new'; S.persona = h.persona || null;
    S.profile.first = parts[0] || 'Friend'; S.profile.last = parts.slice(1).join(' ');
    S.profile.email = h.email || ''; S.profile.phone = ''; S.profile.street = ''; S.profile.city = ''; S.profile.zip = '';
    S.profile.interests = causesFromRegistration(); S.favorites = [];
  }
  var t=Date.now(), pools={};
  Object.keys(h.alloc || {flagship:100}).forEach(function(k){ var p=FLOW_POOLS[k]||'balanced'; pools[p]=(pools[p]||0)+(+h.alloc[k]||0); });
  var me=(S.profile.first+' '+S.profile.last).trim();
  var f={ id:'n'+t.toString(36), name:h.fundName, type:'daf', typeLabel:'Donor advised fund', no:'DAF-'+(60000+t%30000),
    inception:ymd(TODAY), seed:t%89+3, color:'#1A8DA9', pools:pools, focus:S.profile.interests.slice(0,2),
    people:[{n:me, r:'Primary advisor', e:S.profile.email, you:true}],
    opening:{ amt:Math.round(h.gift), method:h.method==='ach'?'Bank transfer (ACH)':'Credit card' },
    status:'agreement' };
  S.myFunds = (S.myFunds||[]).concat([f]); S.fundId = f.id; S.signedIn = true;
  FUND_CACHE = {}; applyAccount(); save();
  logSync('sf','Fund','Opened '+f.name+' online, fund agreement to sign');
  logSync('ri','Contribution','Opening gift of '+money(f.opening.amt)+' by '+f.opening.method.toLowerCase());
  return f;
}

/* Dashboard card until the fund agreement is signed (DocuSign in the live portal). */
function agreementCard(f){
  if(f.status!=='agreement') return '';
  return '<div class="pad"><div class="card agree-card"><div class="card-k">One last step</div>'+
    '<h3>Sign your fund agreement</h3><p>'+esc(f.name)+' opens as soon as your fund agreement is signed. Your opening gift of '+money(f.opening.amt)+' is already recorded.</p>'+
    '<button class="btn btn-accent" onclick="signAgreement()">'+ic('pen',16)+'Review and sign</button></div></div><div class="gap-s"></div>';
}
function signAgreement(){
  var f=F();
  openSheet({ kick:'DocuSign · simulated', title:'Sign your fund agreement', body:
    '<p class="lede">In the live portal, this opens your fund agreement in DocuSign. Here you can review the essentials and sign to see the next step.</p><div class="gap-m"></div>'+
    '<div class="facts"><div class="fr"><span class="fk">Fund</span><span class="fv">'+esc(f.name)+'</span></div>'+
    '<div class="fr"><span class="fk">Type</span><span class="fv">Donor advised fund</span></div>'+
    '<div class="fr"><span class="fk">Primary advisor</span><span class="fv">'+esc(f.people[0].n)+'</span></div>'+
    '<div class="fr"><span class="fk">Opening gift</span><span class="fv">'+money(f.opening.amt)+'</span></div></div>',
    foot:'<button class="btn btn-quiet" onclick="closeSheet()">Not now</button><button class="btn btn-accent" onclick="completeAgreement()">'+ic('pen',16)+'Sign agreement</button>' });
}
function completeAgreement(){
  var f=F(); f.status='open'; save(); closeSheet();
  logSync('sf','Fund Agreement','Signed in DocuSign: '+f.name);
  toast('Signed. '+f.name+' is now open.'); render();
}

/* ============ QR CODE (org funds) ============ */
VIEWS.qr = function(){
  var f=F(), url='https://www.clevelandfoundation.org/give/?fund='+f.no;
  var s=series(), fyA=s.idx(fyBounds(curFYEnd())[0]), qrGifts=build(f).ev.filter(function(e){ return e.k==='contrib' && e.method==='Online / QR code' && e.i>=fyA; });
  return pageHead('Community gifts','QR code to give',{lede:'Put this on programs, posters and donation tables. Every scan opens a secure gift page for '+esc(f.name)+'.'})+fundSwitch()+
    '<div class="pad"><div class="card center"><div class="qr-box" id="qrBox" aria-label="QR code for '+esc(f.name)+'"></div><div class="gap-s"></div><div class="ledger tiny" style="word-break:break-all">'+esc(url)+'</div><div class="tiny">Sample link for the prototype</div>'+
    '<div class="gap-m"></div><div class="row wrap" style="justify-content:center"><button class="btn btn-accent btn-sm" onclick="downloadQR()">'+ic('download',16)+'Download PNG</button><button class="btn btn-quiet btn-sm" onclick="printQR()">'+ic('print',16)+'Print table card</button><button class="btn btn-quiet btn-sm" onclick="copyText(\''+url+'\')">'+ic('link',16)+'Copy link</button></div></div></div>'+
    '<div class="gap-m"></div>'+rail('This fiscal year','Gifts through the QR code', pin('ri'))+
    '<div class="pad" style="padding-top:14px"><div class="facts"><div class="fr"><span class="fk">Gifts</span><span class="fv">'+qrGifts.length+'</span></div><div class="fr"><span class="fk">Total given</span><span class="fv">'+money(qrGifts.reduce(function(a,e){return a+e.amt;},0))+'</span></div><div class="fr"><span class="fk">Average gift</span><span class="fv">'+money(qrGifts.length?qrGifts.reduce(function(a,e){return a+e.amt;},0)/qrGifts.length:0)+'</span></div></div></div>';
};
VIEWS.qr_after = function(){ var box=$('#qrBox'); if(!box) return; var url='https://www.clevelandfoundation.org/give/?fund='+F().no;
  if(window.QRCode){ box.innerHTML=''; new QRCode(box,{text:url,width:360,height:360,colorDark:'#164430',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M}); }
  else box.innerHTML='<div class="tiny">QR library didn\u2019t load (offline?). The link below still works.</div>'; };
function qrDataURL(){ var c=$('#qrBox canvas'), i=$('#qrBox img'); return c?c.toDataURL('image/png'):(i?i.src:null); }
function downloadQR(){ var d=qrDataURL(); if(!d){ toast('QR code isn\u2019t ready yet.'); return; } var a=document.createElement('a'); a.href=d; a.download=F().no+'-give-qr.png'; document.body.appendChild(a); a.click(); a.remove(); logSync('sf','Portal Activity','Downloaded fund QR code'); }
function printQR(){ var d=qrDataURL(), f=F(); if(!d) return; printDoc('Give to '+f.name, '<div style="text-align:center;padding:40px"><div style="font:600 12px monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--mid)">Scan to give</div><h1 style="font-size:34px;margin:10px 0 24px">'+esc(f.name)+'</h1><img src="'+d+'" style="width:320px;height:320px"><p style="margin-top:20px;color:var(--mid)">Gifts are received by The Cleveland Foundation for '+esc(f.org)+'.</p></div>'); }
function copyText(t){ if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast('Link copied.'); },function(){ toast(t); }); else toast(t); }

/* ============ STATEMENTS & TAX ============ */
var ST = { tab:'statements', type:'quarter', sel:0 };
VIEWS.statements = function(p){
  if(p && p.tab) ST.tab=p.tab;
  var f=F(), org=isOrg(), s=series();
  var html = pageHead('Reporting', org?'Statements & reporting':'Statements & tax',{lede: org?'Build a statement for any month, quarter, calendar year or fiscal year. Your fiscal year starts in '+MONTHS[fyStart()-1]+'.':'Download quarterly statements, build one for any period, and get your tax receipts.'})+fundSwitch()+
    '<div class="pad"><div class="seg">'+[['statements','Statements'],['build','Build a statement'],['tax',org?'Gifts received':'Tax receipts']].map(function(t){ return '<button class="'+(ST.tab===t[0]?'sel':'')+'" onclick="ST.tab=\''+t[0]+'\';render()">'+t[1]+'</button>'; }).join('')+'</div></div><div class="gap-m"></div>';
  if(ST.tab==='statements'){
    var qs=periods(s,'quarter').filter(function(p){return !p.open;}).slice(0,8);
    var fys=org?periods(s,'fy').filter(function(p){return !p.open;}).slice(0,3):[];
    html += rail('Issued', 'Quarterly statements', pin('ri'))+'<div class="list" style="padding-top:14px">'+qs.map(function(p){ return stmtRow(p,'Quarterly statement'); }).join('')+'</div>';
    if(org) html += rail('Issued','Fiscal-year statements','')+'<div class="list" style="padding-top:14px">'+fys.map(function(p){ return stmtRow(p,'Fiscal-year statement'); }).join('')+'</div>';
  } else if(ST.tab==='build'){
    var list=periods(s, ST.type==='cy'?'year':ST.type).slice(0,24); if(ST.sel>=list.length) ST.sel=0; var pr=list[ST.sel];
    html += '<div class="pad"><div class="f-lab">Period type</div><div class="chip-row">'+[['month','Month'],['quarter','Quarter'],['cy','Calendar year'],['fy','Fiscal year']].map(function(t){ return '<button class="chip'+(ST.type===t[0]?' sel':'')+'" onclick="ST.type=\''+t[0]+'\';ST.sel=0;render()">'+t[1]+'</button>'; }).join('')+'</div>'+
      '<div class="gap-s"></div><div class="f-row"><label for="stSel">Period</label><select id="stSel" onchange="ST.sel=+this.value;render()">'+list.map(function(p,i){ return '<option value="'+i+'"'+(i===ST.sel?' selected':'')+'>'+esc(p.label)+(p.open?' (to date)':'')+'</option>'; }).join('')+'</select></div>'+
      (pr?reconFacts(pr, s, org):'')+'<div class="gap-s"></div><div class="row wrap">'+(pr?'<button class="btn btn-accent btn-sm" onclick="printStatement('+pr.a+','+pr.b+',\''+jsq(pr.label)+'\')">'+ic('download',16)+'Download PDF</button><button class="btn btn-quiet btn-sm" onclick="exportTx('+pr.a+','+pr.b+')">'+ic('doc',16)+'Transactions CSV</button>':'')+'</div>'+
      '<p class="tiny" style="margin-top:10px">Need a different window? Use a custom range on <button class="link" style="padding:0;font-size:9px" onclick="go(\'performance\')">Fund performance</button>.</p></div>';
  } else {
    html += rail(org?'By fiscal year':'By tax year', org?'Gifts received':'Contribution receipts', '')+'<div class="pad" style="padding-top:14px">'+taxYearTable()+'<p class="tiny" style="margin-top:10px">'+(org?'Gifts to the fund are receipted to each donor by the Foundation.':'Keep these with your tax records. Your advisor can resend any year.')+'</p></div>';
  }
  return html;
};
function stmtRow(p, kind){ return '<button class="ff-row" onclick="printStatement('+p.a+','+p.b+',\''+jsq(p.label)+'\')"><span class="avatar" style="background:var(--gray2);color:var(--blue)">'+ic('doc',18)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(p.label)+'</span><span class="ffr-meta" style="display:block">'+kind+' · PDF</span></span><span class="ffr-amt">'+money(p.end)+'<span class="s">Ending</span></span></button>'; }

/* printable documents (open the system print dialog → Save as PDF) */
function printDoc(title, inner){
  var fr=document.createElement('iframe'); fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(fr);
  var d=fr.contentWindow.document;
  d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:var(--green);margin:40px;font-size:13px}h1{font-size:24px;margin:0 0 4px;color:#164430}h2{font-size:15px;margin:26px 0 8px;color:#164430}.k{font:600 10px monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--mid)}table{width:100%;border-collapse:collapse;margin-top:8px}td,th{padding:8px 6px;border-bottom:1px solid var(--gray3);text-align:right}td:first-child,th:first-child{text-align:left}th{font:600 9px monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--mid)}.tot td{font-weight:700;background:var(--white)}.bar{height:4px;display:flex;margin:14px 0 22px}.bar span{flex:1}.foot{margin-top:30px;font-size:10px;color:var(--mid)}</style></head><body>'+
    '<div class="k">The Cleveland Foundation</div><div class="bar"><span style="background:#086C43"></span><span style="background:#EE7331"></span><span style="background:#19B9A9"></span><span style="background:var(--red)"></span></div>'+inner+'<p class="foot">Prototype document with fictional data. Generated '+fdate(new Date())+' from the donor portal.</p></body></html>');
  d.close();
  setTimeout(function(){ try{ fr.contentWindow.focus(); fr.contentWindow.print(); }catch(e){ toast('Printing is blocked in this browser.'); } setTimeout(function(){ fr.remove(); }, 2000); }, 300);
}
function printStatement(a,b,label){
  var s=series(), f=F(), p=periodStats(s,a,b), org=isOrg();
  var tx=s.b.ev.filter(function(e){ return e.i>=a && e.i<=b && e.k!=='fee'; }).slice(-40).reverse();
  printDoc(f.name+' statement', '<h1>'+esc(f.name)+'</h1><div>'+esc(f.typeLabel)+' · '+f.no+'</div><div class="k" style="margin-top:6px">Statement period · '+esc(label||fdate(s.date(a))+' – '+fdate(s.date(b)))+'</div>'+
    '<h2>Summary</h2><table><tr><td>Beginning balance</td><td>'+money(p.start,true)+'</td></tr><tr><td>Contributions</td><td>'+money(p.contrib,true)+'</td></tr><tr><td>'+(org?'Distributions':'Grants paid')+'</td><td>−'+money(p.grants,true)+'</td></tr><tr><td>Administrative fees</td><td>−'+money(p.fees,true)+'</td></tr><tr><td>Investment return</td><td>'+signed(p.ret)+'</td></tr><tr class="tot"><td>Ending balance</td><td>'+money(p.end,true)+'</td></tr><tr><td>Time-weighted return</td><td>'+pct(p.retPct,2)+'</td></tr></table>'+
    '<h2>Allocation</h2><table>'+Object.keys(f.pools).map(function(k){ return '<tr><td>'+POOLS[k].name+'</td><td>'+f.pools[k]+'%</td></tr>'; }).join('')+'</table>'+
    '<h2>Activity</h2><table><tr><th>Date</th><th>Description</th><th>Amount</th></tr>'+tx.map(function(e){ return '<tr><td>'+fdate(e.d)+'</td><td style="text-align:left">'+(e.k==='contrib'?'Contribution — '+esc(e.method):esc(e.org)+' ('+e.status+')')+'</td><td>'+(e.k==='contrib'?'':'−')+money(e.amt)+'</td></tr>'; }).join('')+'</table>');
  logSync('sf','Portal Activity','Downloaded statement '+(label||''));
}
function printTaxLetter(yr){ var f=F(), tot=0, n=0; build(f).ev.forEach(function(e){ if(e.k==='contrib' && e.d.slice(0,4)===yr){ tot+=e.amt; n++; } }); S.contribs.forEach(function(c){ if(c.fund===f.id && String(new Date(c.t).getFullYear())===yr){ tot+=c.amt; n++; } });
  printDoc('Tax receipt '+yr, '<h1>Contribution summary for '+yr+'</h1><p>Dear '+esc(S.profile.first+' '+S.profile.last)+',</p><p>Thank you for your contributions to the '+esc(f.name)+' ('+f.no+') at The Cleveland Foundation during '+yr+'.</p><table><tr><td>Number of contributions</td><td>'+n+'</td></tr><tr class="tot"><td>Total contributed</td><td>'+money(tot,true)+'</td></tr></table><p style="margin-top:20px">No goods or services were provided in exchange for these contributions. Please keep this letter for your records.</p>'); }
function printReceipt(id){ var c=S.contribs.filter(function(x){return x.id===id;})[0]; if(!c) return; printDoc('Receipt', '<h1>Contribution receipt</h1><table><tr><td>Receipt number</td><td>'+c.id+'</td></tr><tr><td>Date</td><td>'+fdate(new Date(c.t))+'</td></tr><tr><td>Fund</td><td>'+esc(fundById(c.fund).name)+'</td></tr><tr><td>Method</td><td>'+esc(c.method)+'</td></tr><tr class="tot"><td>Amount</td><td>'+money(c.amt,true)+'</td></tr></table>'); }

/* ============ FUND DOCUMENTS ============ */
function docList(){ var org=isOrg(); return [
  {id:'agree', t:'Fund agreement', s:'Signed '+fdate(F().inception), pg:6, g:'Your fund'},
  {id:'ips', t:'Investment policy statement', s:'Updated Jan 2026', pg:12, g:'Policies'},
  {id:'fees', t:'Fee schedule', s:'Effective Jul 2025', pg:2, g:'Policies'},
  org?{id:'spend', t:'Spending policy', s:'Board-adopted · 4.5% of trailing average', pg:3, g:'Policies'}:{id:'guide', t:'Grantmaking guidelines', s:'What your fund can support', pg:4, g:'Policies'},
  {id:'gift', t:'Gift acceptance policy', s:'Stock, real estate and complex gifts', pg:5, g:'Policies'},
  {id:'w9', t:'Foundation W-9', s:'For your finance or tax team', pg:1, g:'Reference'},
  {id:'ar', t:'Annual report', s:'The Foundation\u2019s year in review', pg:48, g:'Reference'}
]; }
VIEWS.documents = function(){
  var groups={}; docList().forEach(function(d){ (groups[d.g]=groups[d.g]||[]).push(d); });
  return pageHead('On file','Fund documents',{lede:'The paperwork behind your fund. Download anything you need for your records, your board or your accountant.'})+fundSwitch()+
    Object.keys(groups).map(function(g){ return rail(g, g==='Your fund'?F().name:g, pin('ri'))+'<div class="list" style="padding-top:14px">'+groups[g].map(function(d){ return '<button class="ff-row" onclick="openDoc(\''+d.id+'\')"><span class="avatar" style="background:var(--well);color:var(--forest)">'+ic('doc',18)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(d.t)+'</span><span class="ffr-meta" style="display:block">'+esc(d.s)+' · '+d.pg+' page'+(d.pg>1?'s':'')+'</span></span>'+ic('download',18)+'</button>'; }).join('')+'</div>'; }).join('')+
    '<p class="tiny pad">Documents shown are placeholders for the prototype; approved files would come from the Foundation\u2019s document system.</p>';
};
function downloadDoc(id){ var d=docList().filter(function(x){return x.id===id;})[0]; printDoc(d.t,'<h1>'+esc(d.t)+'</h1><p>'+esc(F().name)+' · '+F().no+'</p><p style="margin-top:20px">Placeholder for the approved document.</p>'); logSync('sf','Portal Activity','Downloaded '+d.t); }
function openDoc(id){ var d=docList().filter(function(x){return x.id===id;})[0];
  openSheet({ kick:'Fund document', title:d.t, body:'<div class="facts"><div class="fr"><span class="fk">Fund</span><span class="fv">'+esc(F().name)+'</span></div><div class="fr"><span class="fk">Details</span><span class="fv">'+esc(d.s)+'</span></div><div class="fr"><span class="fk">Length</span><span class="fv">'+d.pg+' pages · PDF</span></div></div><div class="gap-m"></div><div class="post-media" style="margin:0;aspect-ratio:16/9"><div class="mslot">Document preview placeholder</div></div>',
    foot:'<button class="btn btn-accent" onclick="downloadDoc(\''+d.id+'\')">'+ic('download',16)+'Download</button>' }); }

/* ============================================================
   ACCOUNT MANAGEMENT — part 3
   my funds · endowment calculator · family access · advisor ·
   my profile & settings (sync, reset demo) · architecture map
   ============================================================ */

/* ============ MY FUNDS ============ */
VIEWS.funds = function(){
  var f=F(), org=isOrg(), ps=periodStats(series(), ...rangeIdx(series(),'1Y'));
  var html = pageHead('Your accounts','My funds',{lede:'Every fund you can see or manage. Choose one to make it the fund you\u2019re working in.'});
  html += '<div class="list">'+FUNDS.map(function(x){ var sel=x.id===f.id; return '<button class="ff-row" onclick="switchFund(\''+x.id+'\')" style="'+(sel?'border-color:var(--ember);box-shadow:0 0 0 3px rgba(238,115,49,.14)':'')+'"><span class="ffr-spine" style="background:'+x.color+'"></span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(x.name)+'</span><span class="ffr-meta" style="display:block">'+esc(x.typeLabel)+' · '+x.no+'</span></span><span class="ffr-amt">'+money(balance(x))+'<span class="s">'+(sel?'Working in this fund':'Tap to switch')+'</span></span></button>'; }).join('')+'</div>';
  html += '<div class="gap-m"></div>'+rail('Fund details', f.name, pin('ri'))+'<div class="pad" style="padding-top:14px"><div class="facts">'+
    '<div class="fr"><span class="fk">Fund number</span><span class="fv ledger">'+f.no+'</span></div>'+
    '<div class="fr"><span class="fk">Type</span><span class="fv">'+esc(f.typeLabel)+'</span></div>'+
    '<div class="fr"><span class="fk">Established</span><span class="fv">'+fdate(f.inception)+'</span></div>'+
    (org?'<div class="fr"><span class="fk">Benefits</span><span class="fv">'+esc(f.org)+'</span></div><div class="fr"><span class="fk">Spending policy</span><span class="fv">'+(f.spending*100).toFixed(1)+'% (sample)</span></div>':'')+
    '<div class="fr"><span class="fk">Fiscal year</span><span class="fv">'+(fyStart()===1?'Calendar year':MONTHS[fyStart()-1]+' – '+MONTHS[(fyStart()+10)%12])+'</span></div>'+
    '<div class="fr"><span class="fk">Balance</span><span class="fv">'+money(balance(),true)+'</span></div>'+
    '<div class="fr"><span class="fk">Past 12 months</span><span class="fv">'+pct(ps.retPct)+'</span></div>'+
    '<div class="fr"><span class="fk">Invested in</span><span class="fv">'+Object.keys(f.pools).map(function(k){return POOLS[k].name+' '+f.pools[k]+'%';}).join(', ')+'</span></div></div></div>';
  html += '<div class="gap-m"></div>'+rail(org?'Authorized users':'Advisors on this fund', 'People', '<button onclick="go(\'family\')">Manage</button>')+'<div class="list" style="padding-top:14px">'+peopleFor(f).map(personRow).join('')+'</div>';
  html += '<div class="gap-m"></div><div class="pgrid">'+
    '<button class="panel panel-gate" onclick="openNewFund()">'+guilloche()+'<div class="p-kick">Another account</div><div class="p-label">Open a new fund</div><div class="p-sub">Your advisor helps you choose the right type.</div></button>'+
    (org?panel('qr','Community gifts','QR code to give','Print it, share it, download it.','qr','var(--gray2)','var(--moss)'):panel('documents','On file','Fund documents','Agreement, policies and fees.','folder','var(--well)','var(--forest)'))+'</div>';
  return html;
};

/* ============ ENDOWMENT CALCULATOR ============ */
var EN = { mode:'gift', gift:250000, need:25000, rate:4.5, ret:7, years:30, add:0 };
VIEWS.endow = function(){
  var org=isOrg();
  return pageHead('Plan ahead','Endowment calculator',{lede: org?'See how the fund could support your organization year after year, or what it would take to fund a program forever.':'See what a permanent gift could give back to the community every year — or what it takes to fund a cause you love forever.'})+
    '<div class="pad"><div class="seg">'+[['gift','What a gift produces'],['need','What a need requires']].map(function(m){ return '<button class="'+(EN.mode===m[0]?'sel':'')+'" onclick="EN.mode=\''+m[0]+'\';render()">'+m[1]+'</button>'; }).join('')+'</div><div class="gap-m"></div>'+
    '<div class="card">'+(EN.mode==='gift'
      ? enSlider('gift','Endowment gift',EN.gift,10000,5000000,10000,'money')
      : enSlider('need','Support needed each year',EN.need,1000,500000,1000,'money'))+
      enSlider('rate','Annual spending rate',EN.rate,3,6,.25,'pctv')+
      enSlider('ret','Expected long-term return',EN.ret,3,10,.25,'pctv')+
      enSlider('years','Years to show',EN.years,5,50,1,'yrsFmt')+
      (EN.mode==='gift'?enSlider('add','Added each year',EN.add,0,250000,5000,'money'):'')+'</div>'+
    '<div class="gap-m"></div><div class="calc-out" id="enOut"></div>'+
    '<div class="gap-m"></div><div class="card"><div class="card-k">Balance and support over time</div><div class="chart on-light" id="enChart"></div><div class="row" style="gap:14px;font-size:11.5px;color:var(--ink-2);margin-top:6px"><span><i class="sw" style="background:var(--forest)"></i>Endowment balance</span><span><i class="sw" style="background:var(--ember)"></i>Total support paid out</span></div></div>'+
    '<p class="tiny" style="margin-top:10px">Illustrative only, in today\u2019s dollars before inflation. Actual spending follows the fund agreement and the Foundation\u2019s spending policy. Not investment or tax advice.</p>'+
    '<div class="gap-s"></div><button class="btn btn-quiet btn-block" onclick="openMessage(\'Endowment planning\')">'+ic('chat',18)+'Talk it through with your advisor</button></div>';
};
function pctv(v){ return (+v).toFixed(2).replace(/0$/,'').replace(/\.0$/,'')+'%'; }
function enSlider(k,label,val,min,max,step,fmt){ return '<div class="slider-row"><div class="sl-top"><span>'+label+'</span><b id="en'+k+'V">'+window[fmt](val)+'</b></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" oninput="EN.'+k+'=+this.value;document.getElementById(\'en'+k+'V\').textContent='+fmt+'(+this.value);runEndow()" aria-label="'+esc(label)+'"></div>'; }
function runEndow(){
  var r=EN.rate/100, g=EN.ret/100, P = EN.mode==='gift' ? EN.gift : EN.need/r;
  var v=P, paid=0, bal=[v], cum=[0], first=P*r;
  for(var y=1;y<=EN.years;y++){ var d=v*r; paid+=d; v=v*(1+g)-d+(EN.mode==='gift'?EN.add:0); bal.push(v); cum.push(paid); }
  $('#enOut').innerHTML = guilloche(250,330)+(EN.mode==='gift'
    ? '<div class="co-big">'+money(first)+'</div><div class="co-cap">Support in the first year</div>'
    : '<div class="co-big">'+money(P)+'</div><div class="co-cap">Endowment needed to pay '+money(EN.need)+' a year</div>')+
    '<div class="calc-units"><div><div class="u-v">'+moneyK(paid)+'</div><div class="u-k">Paid out in '+EN.years+' yrs</div></div><div><div class="u-v">'+moneyK(v)+'</div><div class="u-k">Balance in year '+EN.years+'</div></div><div><div class="u-v">'+moneyK(bal[EN.years]*r)+'</div><div class="u-k">Support in year '+EN.years+'</div></div></div>';
  var xl=[{k:0,t:'Today'},{k:EN.years,t:'Year '+EN.years}];
  lineChart('enChart',[{values:bal,color:'#164430',fill:true,w:2.2},{values:cum,color:'#EE7331',w:2}],{h:200,label:'Endowment balance and cumulative support',xLabels:xl});
}
VIEWS.endow_after = function(){ runEndow(); };

/* ============ FAMILY ACCESS / AUTHORIZED USERS ============ */
var ROLES_DAF = ['Joint advisor','View & recommend','View only'];
var ROLES_ORG = ['Authorized signer','Finance · View & export','View only'];
function peopleFor(f){ return f.people.concat((S.family[f.id]||[])); }
function personRow(p, i){
  var pend = p.pending, colors=['#EE7331','#086C43','#1A8DA9','#C0629A','#19B9A9'];
  return '<div class="ff-row"><span class="avatar round" style="background:'+colors[hash(p.n)%5]+'">'+initials(p.n)+'</span><div class="ffr-main"><div class="ffr-name">'+esc(p.n)+(p.you?' <span class="tiny">(you)</span>':'')+'</div><div class="ffr-meta">'+esc(p.e)+(p.you?' · MFA on':'')+'</div></div><div class="ffr-end" style="flex-direction:column;align-items:flex-end;gap:6px"><span class="status '+(pend?'st-entered':'st-posted')+'">'+(pend?'Invite sent':esc(p.r.split(' · ').slice(-1)[0]))+'</span>'+(pend?'<button class="link" style="padding:0" onclick="resendInvite(\''+jsq(p.e)+'\')">Resend</button>':'')+'</div></div>';
}
VIEWS.family = function(){
  var f=F(), org=isOrg();
  return pageHead(org?'Multi-user access':'Multi-user access', org?'Authorized users':'Family access',{lede: org?'Staff and board members who can see or act on the fund. Roles control who can request grants and download statements.':'Invite family members to view the fund or recommend grants. Everyone signs in with their own account and multi-factor authentication.'})+fundSwitch()+
    rail('People with access', peopleFor(f).length+' people', pin('sf'))+'<div class="list" style="padding-top:14px">'+peopleFor(f).map(personRow).join('')+'</div>'+
    '<div class="pad"><button class="btn btn-accent btn-block" onclick="openInvite()">'+ic('plus',18)+'Invite someone</button></div>'+
    '<div class="gap-m"></div>'+rail('What each role can do','Roles','')+'<div class="pad" style="padding-top:14px"><div class="facts">'+
    (org?[['Authorized signer','Request grants and distributions, contribute, manage users'],['Finance · View & export','See balances, download statements and CSV exports'],['View only','See balances and grant history']]
        :[['Primary advisor','Everything, including adding people'],['Joint advisor','Recommend grants, contribute, rebalance'],['View & recommend','Suggest grants for a primary advisor to approve'],['View only','See balances and grant history']]).map(function(r){ return '<div class="fr"><span class="fk">'+r[0]+'</span><span class="fv" style="font-weight:500;color:var(--ink-2)">'+r[1]+'</span></div>'; }).join('')+'</div></div>';
};
function openInvite(){ var roles=isOrg()?ROLES_ORG:ROLES_DAF;
  openSheet({ kick:F().name, title:'Invite someone', body:'<div class="f-row"><label for="ivName">Full name</label><input id="ivName" autocomplete="off"></div><div class="f-row"><label for="ivEmail">Email</label><input id="ivEmail" type="email" autocomplete="off"></div><div class="f-row"><label for="ivRole">Role</label><select id="ivRole">'+roles.map(function(r){return '<option>'+r+'</option>';}).join('')+'</select></div><p class="tiny">They\u2019ll get an email to create a sign-in with multi-factor authentication. Access starts when they accept.</p>',
    foot:'<button class="btn btn-quiet" onclick="closeSheet()">Cancel</button><button class="btn btn-accent" onclick="sendInvite()">Send invite</button>' }); }
function sendInvite(){ var n=$('#ivName').value.trim(), e=$('#ivEmail').value.trim(); if(!n||!/\S+@\S+\.\S+/.test(e)){ toast('Add a name and a valid email.'); return; }
  var f=F(); (S.family[f.id]=S.family[f.id]||[]).push({n:n,e:e,r:$('#ivRole').value,pending:true,t:Date.now()}); save();
  logSync('sf','Contact Relationship','Invited '+n+' as '+$('#ivRole').value+' on '+f.name); closeSheet(); toast('Invite sent to '+e+'.'); render(); }
function resendInvite(e){ logSync('sf','Contact Relationship','Resent invite to '+e); toast('Invite resent to '+e+'.'); }

/* ============ MY ADVISOR ============ */
var CONVOS = [ {d:'2026-08-28', k:'Phone · 40 min', t:'Year-end giving plan and a stock gift in December'}, {d:'2026-06-12', k:'Email', t:'Question about the Q2 statement'}, {d:'2026-03-04', k:'In person', t:'Annual review and family giving goals'} ];
VIEWS.advisor = function(){
  var mine=S.messages.map(function(m){ return {d:ymd(new Date(m.t)), k:'Portal message', t:m.subject}; }).concat(S.calls.map(function(c){ return {d:ymd(new Date(c.t)), k:'Call booked · '+c.slot, t:c.topic}; }));
  return pageHead('Support','My advisor')+
    '<div class="pad"><div class="calc-out">'+guilloche(240,330)+'<div class="row" style="gap:14px"><span class="avatar round" style="width:62px;height:62px;font-size:22px;background:var(--ember)">JR</span><div><div style="font-family:var(--f-display);font-weight:800;font-size:24px;letter-spacing:-.02em">Jordan Reyes</div><div class="co-cap" style="margin-top:2px">Senior philanthropic advisor</div></div></div>'+
    '<p style="color:var(--gray2);font-size:14px;margin-top:14px;line-height:1.6">Jordan works with families and nonprofits on multi-year giving plans, complex gifts, and endowment strategy.</p>'+
    '<div class="v-actions"><button class="btn btn-accent" onclick="openMessage()">'+ic('chat',18)+'Send a message</button><button class="btn btn-onhero" onclick="openSchedule()">'+ic('cal',18)+'Book a call</button></div></div>'+
    '<p class="tiny" style="margin-top:8px">Advisor shown is fictional for the prototype. '+pin('sf')+'</p></div>'+
    '<div class="gap-m"></div>'+rail('History','Recent conversations','')+'<div class="list" style="padding-top:14px">'+mine.reverse().concat(CONVOS).map(function(c){ return '<div class="ff-row"><span class="avatar" style="background:var(--well);color:var(--forest)">'+ic('chat',18)+'</span><div class="ffr-main"><div class="ffr-name">'+esc(c.t)+'</div><div class="ffr-meta">'+fdate(c.d)+' · '+esc(c.k)+'</div></div></div>'; }).join('')+'</div>';
};
function openMessage(subject){
  openSheet({ kick:'To Jordan Reyes', title:'Send a message', body:'<div class="f-row"><label for="msgSub">Subject</label><input id="msgSub" value="'+esc(subject||'')+'" placeholder="What\u2019s on your mind?"></div><div class="f-row"><label for="msgBody">Message</label><textarea id="msgBody" placeholder="Jordan usually replies within one business day."></textarea></div><p class="tiny">Messages are secure and saved to your record. Please don\u2019t include account passwords or full bank numbers.</p>',
    foot:'<button class="btn btn-quiet" onclick="closeSheet()">Cancel</button><button class="btn btn-accent" onclick="sendMessage()">Send message</button>' });
}
function sendMessage(){ var s=$('#msgSub').value.trim(), b=$('#msgBody').value.trim(); if(!s&&!b){ toast('Write a subject or a message first.'); return; }
  S.messages.push({t:Date.now(), subject:s||b.slice(0,60), body:b, fund:S.fundId}); save(); logSync('sf','Case','Message to advisor: '+(s||b.slice(0,40)));
  closeSheet(); toast('Message sent to Jordan.'); if(ROUTE==='advisor') render(); }
function openSchedule(){
  var slots=[], d=new Date(TODAY); while(slots.length<6){ d=addDays(d,1); if(d.getDay()===0||d.getDay()===6) continue; slots.push(fdate(d,'short')+' · '+(slots.length%2?'2:00 PM':'10:30 AM')); }
  openSheet({ kick:'With Jordan Reyes', title:'Book a call', body:'<div class="f-lab">Pick a time (Eastern)</div><div class="chip-row" id="slotRow">'+slots.map(function(s,i){ return '<button class="chip'+(i===0?' sel':'')+'" onclick="$$(\'#slotRow .chip\').forEach(function(c){c.classList.remove(\'sel\')});this.classList.add(\'sel\')">'+s+'</button>'; }).join('')+'</div><div class="gap-m"></div><div class="f-row"><label for="callTopic">Topic</label><select id="callTopic"><option>Year-end giving</option><option>Gift of stock or complex assets</option><option>Rebalancing my fund</option><option>Adding family members</option><option>Opening a new fund</option><option>Something else</option></select></div>',
    foot:'<button class="btn btn-quiet" onclick="closeSheet()">Cancel</button><button class="btn btn-accent" onclick="bookCall()">Book call</button>' });
}
function bookCall(){ var sl=$('#slotRow .chip.sel').textContent, tp=$('#callTopic').value; S.calls.push({t:Date.now(), slot:sl, topic:tp}); save(); logSync('sf','Event','Call booked: '+sl+' — '+tp); closeSheet(); toast('Booked for '+sl+'. A calendar invite is on its way.'); if(ROUTE==='advisor') render(); }

/* ============ MY PROFILE (settings) and MY GIVING PLAN ============
   #/profile                  who you are, and account settings
   #/profile {tab:…}          one settings page (profile · prefs · security · sync)
   #/givingplan               the giving plan: six cards, the finished plan, interests (below)
   #/plan {step | values}     the five-year giving plan (portal/plan/), embedded
   The plan keeps its own state in this browser and publishes a small summary
   (PLAN_SUMMARY_KEY) after every change. My giving plan only reads that summary,
   so the two can evolve separately. */
var INTERESTS = INTERESTS_V1;
/* profile causes → the plan's focus-area keys (portal/plan/, QUIZ.areas) */
/* Field of Interest → closest giving-plan focus area (best judgment; program team to confirm). */
var INTEREST_AREAS = { 'Agriculture, Fishing & Forestry':'land', 'Arts & Culture':'arts', 'Community & Economic Development':'commdev',
  'Education':'education', 'Environment':'environment', 'Health':'healthaccess', 'Human Services':'hhs', 'Information & Communications':'media',
  'International Human Rights':'civil', 'International Relations':'peace', 'Philanthropy':'philanthropy', 'Public Affairs':'advocacy',
  'Public Safety & Disaster Management':'disaster', 'Religion':'religion', 'Science':'innovation', 'Social Sciences':'civic', 'Sports & Recreation':'recreation' };
var PLAN_SUMMARY_KEY = 'tcf-five-year-plan-summary', PLAN_STATE_KEY = 'tcf-five-year-plan-v2';
var SETTINGS = [
  { id:'profile',  label:'Profile details', icon:'user' },
  { id:'prefs',    label:'Preferences',     icon:'bell' },
  { id:'security', label:'Security',        icon:'shield' },
  { id:'sync',     label:'Sync & data',     icon:'sync' }
];
/* The six giving-plan cards. Any order works; this is the order they're shown in.
   `open` is where a card lands in the plan (plan sections: 1 giving goal & funding · 2 values ·
   3 investments · 4 gifts · 5 summary); `page` is a My giving plan page instead
   (#/givingplan {page}). `kick` labels the card, `pk` colors its top edge. */
var JOURNEY = [
  { k:'mission', n:'Mission, legacy & purpose', page:'mission', kick:'In your own words', icon:'pen', pk:'var(--orange)',
    d:'Your personal mission, the legacy you hope to leave, and a purpose for each fund.' },
  { k:'values',  n:'Your values',           open:{ step:2 }, kick:'What matters', icon:'heart', pk:'var(--pink)',
    d:'Start from your registration causes, then go deeper with a pick list, a quiz or the card game.' },
  { k:'contrib', n:'Contribution plan',     open:{ step:1 }, kick:'Money in', icon:'plus', pk:'var(--mid)',
    d:'How much you plan to give over five years, and how you’ll add it to your fund.' },
  { k:'orgs',    n:'Matched organizations', open:{ step:4 }, kick:'Who you’ll fund', icon:'users', pk:'var(--blue)',
    d:'Nonprofits and Foundation projects ranked by how closely they fit your values.' },
  { k:'invest',  n:'Investments',           open:{ step:3 }, kick:'How it grows', icon:'pie', pk:'var(--aqua)',
    d:'Keep the TCF Index Pool or build your own mix of pools. Tony, the portfolio assistant, can suggest one.' },
  { k:'grants',  n:'Granting plan',         open:{ step:4 }, kick:'Money out', icon:'share', pk:'var(--forest)',
    d:'How much goes to each organization, year by year, against your giving goal.' }
];
var ACTIVITIES = [
  { k:'picks', src:'pick',  n:'Quick pick list',  t:'About 2 minutes', d:'Tap the causes you care about from 64 focus areas.' },
  { k:'quiz',  src:'quiz',  n:'Values quiz',      t:'About 4 minutes', d:'Rank your choices in real Cleveland scenarios.' },
  { k:'cards', src:'cards', n:'Values card game', t:'About 8 minutes', d:'Sort value cards and say why. The most revealing of the three.' }
];
function planSummary(){ try{ var s=JSON.parse(localStorage.getItem(PLAN_SUMMARY_KEY)||'null'); return s && s.v===1 ? s : null; }catch(e){ return null; } }
function sumArr(a){ return (a||[]).reduce(function(t,v){ return t+(+v||0); },0); }
function openPlan(o){ go('plan', o||{}); }

/* Status of one step: { p: 0..1, label, detail } */
function journeyStatus(k, s){
  var P=S.profile, sec=function(i){ return (s && s.sections && s.sections[i]) || {progress:0, seen:false}; };
  var done=function(detail){ return {p:1, label:'Done', detail:detail}; };
  var part=function(p, label, detail){ return {p:p, label:label, detail:detail}; };
  var none=function(detail){ return {p:0, label:'Not started', detail:detail}; };
  if(k==='values'){
    if(s && s.values) return done('Top: '+s.values.topAreas.join(' · '));
    return P.interests.length ? part(.25,'Started',P.interests.length+' cause'+(P.interests.length===1?'':'s')+' from your registration') : none('Any activity below fills this in');
  }
  if(k==='mission'){
    var c=statementCount(), of=c.written+' of '+c.total+' written';
    if(c.written===c.total) return done(of+' · they open your five-year plan');
    return c.written ? part(c.written/c.total, of, 'Your mission and fund purpose open your five-year plan') : none('Free-form, in your own words');
  }
  if(k==='contrib'){
    var c=sec(0);
    if(c.seen && c.progress>=1) return done(money(sumArr(s.additions))+' over '+s.years[0]+'–'+s.years[s.years.length-1]);
    return c.seen ? part(.5,'In progress','Set a five-year goal') : none('A suggested plan is ready to adjust');
  }
  if(k==='orgs'){
    if(s && s.orgsChosen) return done(s.orgsChosen+' organization'+(s.orgsChosen===1?'':'s')+' chosen');
    return s && s.values ? part(.25,'Matches ready','Ranked against your values') : none('Works best after your values');
  }
  if(k==='invest'){
    var v=sec(2);
    if(v.seen && v.progress>=1) return done(s.investments.label+' · '+(+s.investments.rate).toFixed(1)+'% estimated return');
    return v.seen ? part(.5,'In progress','Your custom mix needs to reach 100%') : none('Your fund keeps its current allocation until you choose');
  }
  var g=sec(3);   // grants
  if(g.progress>=1) return done(money(sumArr(s.grants))+' planned · meets your goal');
  return g.progress>0 ? part(g.progress, Math.round(g.progress*100)+'% planned', money(sumArr(s.grants))+' of '+money(sumArr(s.goals))+' goal') : none('Spread your goal across organizations');
}
/* How complete the giving plan is: the six cards count equally */
function givingPlanPercent(s){
  return Math.round(sumArr(JOURNEY.map(function(j){ return journeyStatus(j.k, s).p; }))*100/JOURNEY.length);
}

VIEWS.profile = function(p){
  var tab = p && p.tab;
  if(tab && SETTINGS.some(function(t){ return t.id===tab; })) return settingsPage(tab);
  var P=S.profile;

  /* who you are */
  var html = pageHead('Account','My profile')+
    '<div class="pad"><div class="card prof-id"><span class="avatar round prof-av">'+initials(P.first+' '+P.last)+'</span>'+
      '<div class="prof-who"><div class="prof-name">'+esc(P.first+' '+P.last)+'</div><div class="tiny">'+esc(P.email)+'</div><div style="margin-top:6px">'+pin('sf')+'</div></div></div></div>';

  /* account & settings */
  var C=P.comms, on=Object.keys(C).filter(function(k){ return C[k]; }).length, syncN=S.sync.length;
  var sub={ profile: esc(P.first+' '+P.last)+' · '+esc(P.email),
            prefs: on+' of '+Object.keys(C).length+' notifications on · fiscal year starts in '+MONTHS[fyStart()-1],
            security: 'Multi-factor authentication is on',
            sync: 'Salesforce and Ren iPhi connected · '+syncN+' update'+(syncN===1?'':'s') };
  html += '<div class="gap-m"></div>'+rail('Account','Settings')+
    '<div class="pad" style="padding-top:14px"><div class="card flush set-list">'+SETTINGS.map(function(t){
      return '<button class="set-row" onclick="go(\'profile\',{tab:\''+t.id+'\'})"><span class="set-ic">'+ic(t.icon,18)+'</span><span class="set-main"><span class="set-n">'+t.label+'</span><span class="set-s">'+sub[t.id]+'</span></span>'+ic('chev',16,2.2)+'</button>';
    }).join('')+'</div></div>';
  return html;
};

/* ============ MY GIVING PLAN ============
   #/givingplan                   six cards to work through in any order, ideally with your
                                  advisor; how complete the plan is; the finished five-year
                                  plan; and ways to tell us what you care about
   #/givingplan {page:'mission'}  the mission, legacy & purpose card (missionPage)
   #/plan {step | values}         the other cards, inside the five-year plan (portal/plan/) */
VIEWS.givingplan = function(p){
  if(p && p.page==='mission') return missionPage();
  var P=S.profile, s=planSummary(), pct=givingPlanPercent(s);
  var done=JOURNEY.filter(function(j){ return journeyStatus(j.k, s).p>=1; }).length;

  /* how complete it is, and who to do it with */
  var html = pageHead('Account','My giving plan',{lede:'Six cards that help us, and your advisor, get to know you. Fill them out in any order, at your own pace. Most people work through them with their advisor.'})+
    '<div class="pad"><div class="card gp-top">'+
      '<div class="gp-meter"><div class="pm-top"><span>Your giving plan</span><b>'+pct+'%</b></div>'+
        '<div class="pm-bar" role="progressbar" aria-label="Giving plan complete" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span style="width:'+pct+'%"></span></div>'+
        '<div class="tiny">You’re '+pct+'% complete: '+done+' of '+JOURNEY.length+' cards done. Every card is optional.</div></div>'+
      '<div class="gp-advisor"><span class="avatar round" style="background:var(--moss)">JR</span>'+
        '<div class="gp-adv-who"><div class="gp-adv-n">Work on it with Jordan Reyes</div><div class="tiny">Senior philanthropic advisor</div></div>'+
        '<div class="gp-adv-act"><button class="btn btn-quiet btn-sm" onclick="openMessage()">'+ic('chat',16)+'Message</button><button class="btn btn-accent btn-sm" onclick="openSchedule()">'+ic('cal',16)+'Book a call</button></div></div>'+
    '</div></div>';

  /* the six cards: no numbers, any order */
  html += '<div class="gap-m"></div><div class="pgrid g3 data gp-cards">'+JOURNEY.map(function(j){
    var st=journeyStatus(j.k, s), cls=st.p>=1?'st-posted':st.p>0?'st-approved':'st-queued';
    var act=j.page ? "go('givingplan',{page:'"+j.page+"'})" : 'openPlan('+esc(JSON.stringify(Object.assign({card:j.k}, j.open)))+')';
    return '<button class="panel gp-card" style="--pk:'+j.pk+'" onclick="'+act+'"><div class="p-kick">'+esc(j.kick)+'</div>'+
      '<span class="p-arrow">'+ic('arrowUR',18,2.2)+'</span>'+
      '<div class="t-icon" style="background:var(--gray2);color:var(--forest)">'+ic(j.icon,22)+'</div>'+
      '<div class="p-label">'+esc(j.n)+'</div><div class="p-sub">'+esc(j.d)+'</div>'+
      '<div class="gp-status"><span class="status '+cls+'">'+esc(st.label)+'</span><span class="gp-know">'+esc(st.detail)+'</span></div></button>';
  }).join('')+'</div>';

  /* the finished plan */
  var years=(s&&s.years)||[], add=(s&&s.additions)||[], gr=(s&&s.grants)||[];
  var built=!!(s && (s.sections[0].seen || s.orgsChosen) && sumArr(add)+sumArr(gr)>0);
  var max=Math.max.apply(null,[1].concat(add,gr));
  html += '<div class="gap-m"></div><div class="pad"><div class="capstone">'+guilloche(270,40)+
    '<div class="cap-kick">The finished plan · optional</div><h2>Your five-year giving plan</h2>'+
    (built
      ? '<p>What you’ll add to your fund and what you’ll grant from it, '+years[0]+'–'+years[years.length-1]+'.</p>'+
        '<div class="cap-tot"><div><span>Contributions</span><b>'+money(sumArr(add))+'</b></div><div><span>Grants</span><b>'+money(sumArr(gr))+'</b></div><div><span>Invested in</span><b>'+esc(s.investments.label)+'</b></div></div>'+
        '<div class="cap-bars" role="img" aria-label="Contributions and grants by year">'+years.map(function(y,i){
          return '<div class="cb-y"><div class="cb-pair"><i class="cb-in" style="height:'+Math.round((add[i]||0)/max*100)+'%" title="'+y+' contributions '+money(add[i])+'"></i><i class="cb-out" style="height:'+Math.round((gr[i]||0)/max*100)+'%" title="'+y+' grants '+money(gr[i])+'"></i></div><span>'+y+'</span></div>';
        }).join('')+'</div><div class="cap-key"><span><i class="cb-in"></i>Contributions</span><span><i class="cb-out"></i>Grants</span></div>'+
        '<div class="cap-act"><button class="btn btn-accent" onclick="openPlan({step:5})">Open my plan</button><button class="btn btn-onhero" onclick="openPlan({step:5})">'+ic('download',16)+'Download PDF</button></div>'
      : '<p>The cards above build it for you: a year-by-year plan of what you’ll add to your fund and what you’ll grant, matched to your values. Not everyone needs one, but it makes long-range giving much easier to talk through with your advisor.</p>'+
        '<div class="cap-act"><button class="btn btn-onhero" onclick="openPlan({step:5})">See what it looks like</button></div>')+
    '</div></div>';

  /* ways to tell us what you care about */
  var src = s && s.values && s.values.source;
  html += '<div class="gap-m"></div>'+rail('Personalization','Tell us what you care about', pin('sf'))+
    '<div class="pad" style="padding-top:14px"><div class="card-k">From your registration</div><p class="tiny" style="margin-bottom:10px">Tap to change. We use these to recommend nonprofits and stories, and to pre-fill the pick list below.</p>'+
    '<div class="chip-row">'+INTERESTS.map(function(i){ var on=P.interests.indexOf(i)>-1; return '<button class="chip'+(on?' sel':'')+'" aria-pressed="'+on+'" onclick="toggleInterest(\''+jsq(i)+'\')">'+esc(i)+'</button>'; }).join('')+'</div>'+
    '<div class="gap-m"></div><div class="card-k">Go deeper · each one updates your values</div><div class="acts">'+ACTIVITIES.map(function(a){
      var did=src===a.src;
      return '<button class="act'+(did?' done':'')+'" onclick="openPlan({card:\'values\',values:\''+a.k+'\'})"><span class="act-t">'+esc(a.n)+(did?'<span class="status st-posted">Current values</span>':'')+'</span><span class="act-d">'+esc(a.d)+'</span><span class="act-m">'+esc(a.t)+ic('arrowUR',14,2.2)+'</span></button>';
    }).join('')+'</div></div>';
  return html;
};

/* One settings page. The segmented control moves between the four without stacking history. */
function settingsPage(tab){
  var cur=SETTINGS.filter(function(t){ return t.id===tab; })[0];
  return pageHead('My profile', cur.label)+
    '<div class="pad"><div class="seg">'+SETTINGS.map(function(t){ return '<button class="'+(t.id===tab?'sel':'')+'" onclick="go(\'profile\',{tab:\''+t.id+'\'},true)">'+t.label+'</button>'; }).join('')+'</div></div><div class="gap-m"></div>'+
    settingsBody(tab);
}

/* The four settings panels (unchanged from the earlier tabbed page). */
function settingsBody(tab){
  var P=S.profile, f=F(), html='';
  if(tab==='profile'){
    html += '<div class="pad"><div class="f-two"><div class="f-row"><label for="pFirst">First name</label><input id="pFirst" value="'+esc(P.first)+'"></div><div class="f-row"><label for="pLast">Last name</label><input id="pLast" value="'+esc(P.last)+'"></div></div>'+
      '<div class="f-row"><label for="pEmail">Email</label><input id="pEmail" type="email" value="'+esc(P.email)+'"></div><div class="f-row"><label for="pPhone">Phone</label><input id="pPhone" value="'+esc(P.phone)+'"></div>'+
      '<div class="f-row"><label for="pStreet">Mailing address</label><input id="pStreet" value="'+esc(P.street)+'"></div><div class="f-two"><div class="f-row"><label for="pCity">City</label><input id="pCity" value="'+esc(P.city)+'"></div><div class="f-row"><label for="pZip">ZIP</label><input id="pZip" value="'+esc(P.zip)+'"></div></div>'+
      '<button class="btn btn-accent btn-block" onclick="saveProfile()">Save changes</button></div>';
  } else if(tab==='prefs'){
    var C=P.comms;
    html += '<div class="pad"><div class="card-k">Communication '+pin('sf')+'</div><div class="facts">'+[['grantPosted','Email me when a grant is paid',''],['receipts','Contribution receipts by email',''],['push','Push notifications','On this device'],['stories','Monthly impact stories','Personalized to your causes'],['newsletter','Quarterly Foundation newsletter','']].map(function(c){ return '<div class="toggle"><div><div>'+c[1]+'</div>'+(c[2]?'<div class="tg-s">'+c[2]+'</div>':'')+'</div><button class="sw-t'+(C[c[0]]?' on':'')+'" role="switch" aria-checked="'+!!C[c[0]]+'" aria-label="'+esc(c[1])+'" onclick="toggleComm(\''+c[0]+'\')"></button></div>'; }).join('')+'</div>'+
      '<div class="gap-m"></div><div class="card-k">Reporting for '+esc(f.name)+'</div><div class="facts"><div class="toggle"><div><div>Fiscal year starts in</div><div class="tg-s">Used for fiscal-year-to-date views and statements</div></div><select id="fySel" onchange="setFY(+this.value)" style="border:1px solid var(--line-2);border-radius:10px;padding:8px 10px;background:var(--paper)">'+MONTHS.map(function(m,i){ return '<option value="'+(i+1)+'"'+(fyStart()===i+1?' selected':'')+'>'+m+'</option>'; }).join('')+'</select></div></div>'+
      '<div class="gap-m"></div><div class="card-k">Display</div><div class="facts"><div class="toggle"><div><div>Show data sources</div><div class="tg-s">Tags each module with the system it comes from</div></div><button class="sw-t'+(S.settings.pins?' on':'')+'" role="switch" aria-checked="'+!!S.settings.pins+'" aria-label="Show data sources" onclick="S.settings.pins=!S.settings.pins;save();render()"></button></div></div></div>';
  } else if(tab==='security'){
    html += '<div class="pad"><div class="card"><div class="row"><span class="avatar" style="background:var(--gray2);color:var(--moss)">'+ic('shield',20)+'</span><div><div style="font-weight:700;color:var(--forest)">Multi-factor authentication is on</div><div class="tiny">Microsoft Authenticator · managed by Microsoft Entra External ID</div></div></div><div class="row wrap" style="margin-top:12px"><button class="btn btn-quiet btn-sm" onclick="toast(\'Adding a sign-in method opens Microsoft Entra.\')">Add a method</button><button class="btn btn-quiet btn-sm" onclick="toast(\'New recovery codes would be generated in Entra.\')">Recovery codes</button><button class="btn btn-quiet btn-sm" onclick="toast(\'Passkey setup opens your device prompt.\')">Set up a passkey</button></div></div>'+
      '<div class="gap-m"></div><div class="card-k">Recent sign-ins</div><div class="facts">'+[['Today · this device','Cleveland Heights, OH'],['Yesterday · iPhone','Cleveland, OH'],[fdate(addDays(TODAY,-6),'short')+' · Chrome on Mac','Cleveland, OH']].map(function(r){ return '<div class="fr"><span class="fk">'+r[0]+'</span><span class="fv">'+r[1]+'</span></div>'; }).join('')+'</div>'+
      '<div class="gap-m"></div><button class="btn btn-quiet btn-block" onclick="signOut()">Sign out</button></div>';
  } else {
    var sf=S.sync.filter(function(e){return e.sys==='sf';}).length, ri=S.sync.filter(function(e){return e.sys==='ri';}).length;
    html += '<div class="pad"><p class="lede" style="font-size:13.5px">Everything you do here is saved to your signed-in profile and follows you to any device. Profile and engagement activity go to Salesforce; money movement goes to Ren iPhi.</p><div class="gap-s"></div>'+
      '<div class="pgrid data" style="border-radius:14px;overflow:hidden;border:1px solid var(--line)"><div class="panel" style="min-height:0;--pk:#1A8DA9"><div class="p-kick">CRM</div><div class="p-label" style="font-size:18px">Salesforce</div><div class="p-sub">Profile, preferences, interests, badges, quiz, feed, advisor contact</div><div class="p-count">'+sf+' update'+(sf===1?'':'s')+' · <span class="live" style="vertical-align:-1px"></span> connected</div></div><div class="panel" style="min-height:0;--pk:var(--moss)"><div class="p-kick">ERP</div><div class="p-label" style="font-size:18px">Ren iPhi</div><div class="p-sub">Balances, grants, contributions, rebalance requests, statements</div><div class="p-count">'+ri+' update'+(ri===1?'':'s')+' · <span class="live" style="vertical-align:-1px"></span> connected</div></div></div>'+
      '<div class="gap-m"></div><div class="card-k">Sync activity</div><div class="card flush">'+(S.sync.length?S.sync.slice(0,30).map(function(e){ return '<div class="sync-row"><span class="sy-s '+(e.sys==='sf'?'sy-sf':'sy-ri')+'">'+SYS[e.sys]+'</span><span class="sy-t"><b style="color:var(--forest);font-weight:600">'+esc(e.obj)+'</b> · '+esc(e.text)+'</span><span id="sy-'+String(e.id).replace('.','')+'" class="status '+(e.st==='synced'?'st-posted':'st-queued')+'">'+(e.st==='synced'?'Synced':'Queued')+'</span></div>'; }).join(''):'<div class="empty" style="border:none"><b>No activity yet</b>Make a grant, earn a badge or answer the quiz — each action appears here.</div>')+'</div>'+
      '<p class="tiny" style="margin-top:10px">Prototype: sync is simulated and data stays in this browser. The object names show where each action is proposed to land.</p>'+
      '<div class="gap-m"></div><div class="card" style="border-color:var(--ember)"><div class="card-k">Demo controls</div><p style="font-size:13.5px;color:var(--ink-2)">Clear every grant, gift, badge, quiz answer, post, setting and giving plan you\u2019ve made, and start fresh on the latest version of the site.</p><div class="gap-s"></div><button class="btn btn-accent btn-block" onclick="confirmReset()">Reset demo</button></div>'+
      '<div class="gap-m"></div><button class="link" onclick="go(\'architecture\')">'+ic('layers',14)+'For developers: architecture map</button></div>';
  }
  return html;
}

/* ============ MISSION, LEGACY & FUND PURPOSE (#/givingplan {page:'mission'}) ============
   A giving-plan card with its own page, opened from My giving plan.
   Free-form statements kept on the profile: a personal mission statement, a legacy
   statement, and a purpose statement for each fund this person can access
   (S.profile.mission, .legacy, .fundPurpose[fundId]). The mission statement and the
   purpose of the plan's fund open the five-year giving plan, on screen and in its PDF:
   they're handed over in PLAN_CONTEXT_KEY, read by portal/plan/index.html. */
var PLAN_CONTEXT_KEY = 'tcf-plan-context';
function statementOf(kind, fundId){ var P=S.profile; return kind==='purpose' ? ((P.fundPurpose||{})[fundId]||'') : (P[kind]||''); }
function statementCount(){
  var written = ['mission','legacy'].filter(function(k){ return statementOf(k).trim(); }).length +
    FUNDS.filter(function(f){ return statementOf('purpose', f.id).trim(); }).length;
  return { written:written, total:2+FUNDS.length };
}
function missionPage(){
  var P=S.profile, s=planSummary(), c=statementCount();
  var vals=(s && s.values && s.values.topAreas && s.values.topAreas.length) ? s.values.topAreas : P.interests;
  var area=function(id, label, prompt, val, handler, hint){
    return '<div class="f-row ms-row"><label for="'+id+'">'+esc(label)+'</label>'+(hint?'<div class="ms-hint">'+hint+'</div>':'')+
      '<textarea id="'+id+'" rows="3" placeholder="'+esc(prompt)+'" oninput="'+handler+'" onchange="statementDone(this)">'+esc(val)+'</textarea></div>';
  };
  return pageHead('My giving plan','Mission, legacy & purpose')+
    '<div class="pad"><div class="ms-panel" id="missionPanel"><div class="ms-head">'+
      '<p class="tiny">In your own words. Your mission statement and your fund’s purpose open your five-year giving plan, on screen and in the PDF.</p>'+
      '<span class="status '+(c.written===c.total?'st-posted':c.written?'st-approved':'st-queued')+'" id="msCount">'+c.written+' of '+c.total+' written</span></div>'+
    area('msMission', 'Your personal mission statement', 'Craft your personal mission statement based on your values.',
      statementOf('mission'), "setStatement('mission','',this.value)", vals.length ? 'Your values: '+esc(vals.join(' · ')) : '')+
    area('msLegacy', 'Tell us about your legacy', 'What is it most important that you’re remembered for in your life and work?',
      statementOf('legacy'), "setStatement('legacy','',this.value)")+
    FUNDS.map(function(f){
      return area('msPurpose_'+f.id, 'Create a purpose statement for the '+f.name, 'What is this fund for, and what do you hope it achieves?',
        statementOf('purpose', f.id), "setStatement('purpose','"+jsq(f.id)+"',this.value)");
    }).join('')+
    '<p class="tiny ms-saved">Saved as you type.</p></div>'+
    '<div class="gap-m"></div><button class="btn btn-accent btn-block" onclick="back()">Done</button></div>';
}
var STATEMENT_TIMER;
function setStatement(kind, fundId, value){
  var P=S.profile;
  if(kind==='purpose'){ P.fundPurpose = P.fundPurpose || {}; if(value.trim()) P.fundPurpose[fundId]=value; else delete P.fundPurpose[fundId]; }
  else P[kind]=value;
  clearTimeout(STATEMENT_TIMER);
  STATEMENT_TIMER = setTimeout(function(){
    save(); writePlanContext();
    var el=$('#msCount'), c=statementCount(); if(!el) return;
    el.textContent = c.written+' of '+c.total+' written';
    el.className = 'status '+(c.written===c.total?'st-posted':c.written?'st-approved':'st-queued');
  }, 300);
}
/* one Salesforce update per finished edit (on leaving the field), not per keystroke */
function statementDone(el){
  var what = el.id==='msMission' ? 'Personal mission statement' : el.id==='msLegacy' ? 'Legacy statement'
    : 'Fund purpose: '+fundById(el.id.replace('msPurpose_','')).name;
  logSync('sf', 'Contact', (el.value.trim() ? 'Updated ' : 'Cleared ')+what);
}
/* what the embedded plan shows at the top: the mission statement and the purpose of the fund it's for */
function writePlanContext(){
  var f=F();
  try{ localStorage.setItem(PLAN_CONTEXT_KEY, JSON.stringify({ v:1, mission:statementOf('mission'),
    fund:{ id:f.id, name:f.name, purpose:statementOf('purpose', f.id) } })); }catch(e){}
}

/* ---- the five-year giving plan, embedded (portal/plan/index.html) ---- */
VIEWS.plan = function(p){
  p=p||{};
  var q=['embed=1'];
  if(p.values) q.push('values='+encodeURIComponent(p.values));
  else if(p.step) q.push('step='+(+p.step));
  if(!isOrg()) q.push('balance='+Math.round(balance()));   // seeds a NEW plan with this fund's balance
  try{ var fresh=sessionStorage.getItem(FRESH_KEY); if(fresh) q.push('fresh='+fresh); }catch(e){}   // after Reset demo: newest plan page too
  var keys=S.profile.interests.map(function(i){ return INTEREST_AREAS[i]; }).filter(Boolean);
  if(keys.length) q.push('interests='+keys.join(','));
  writePlanContext();
  /* opened from a card: that card's name; otherwise the whole plan */
  var card=JOURNEY.filter(function(j){ return j.k===p.card; })[0];
  return pageHead('My giving plan', card ? card.n : 'Five-year giving plan')+
    '<div class="plan-host"><iframe class="plan-frame" title="Five-year giving plan" src="'+planSrc()+'&'+q.join('&')+'"></iframe></div>';
};
/* The plan page's address carries a fingerprint of its contents (portal/index.html → meta tcf-plan),
   so a new deploy loads the new plan instead of a cached copy */
function planSrc(){ var m=document.querySelector('meta[name="tcf-plan"]'), v=m && m.getAttribute('data-v-src'); return v && v.indexOf('?')>-1 ? v : 'plan/index.html?v=0'; }
/* Messages from the embedded plan (same origin only) */
var LAST_PLAN = planSummary();
window.addEventListener('message', function(e){
  if(e.origin!==location.origin || !e.data || e.data.tcf!==true) return;
  if(e.data.type==='plan-summary'){
    var s=e.data.summary, was=LAST_PLAN;
    if(s && s.values && (!was || !was.values || was.values.source!==s.values.source || was.values.topAreas.join()!==s.values.topAreas.join()))
      logSync('sf','Giving Values','Values from the '+({pick:'pick list',quiz:'values quiz',cards:'card game'}[s.values.source]||'plan')+': '+s.values.topAreas.join(', '));
    LAST_PLAN=s;
  }
  if(e.data.type==='plan-saved') logSync('sf','Giving Plan','Saved five-year giving plan');
  if(e.data.type==='plan-done' && ROUTE==='plan') back();   // Done inside a card: back to My giving plan
});

function saveProfile(){ var P=S.profile; ['First','Last','Email','Phone','Street','City','Zip'].forEach(function(k){ var el=$('#p'+k); if(el) P[k.toLowerCase()]=el.value.trim(); }); save(); logSync('sf','Contact','Updated contact details'); toast('Profile saved.'); render(); }
function toggleInterest(i){ var a=S.profile.interests, x=a.indexOf(i); if(x>-1) a.splice(x,1); else a.push(i); save(); logSync('sf','Contact Interests',(x>-1?'Removed ':'Added ')+i); render(); }
function toggleComm(k){ S.profile.comms[k]=!S.profile.comms[k]; save(); logSync('sf','Communication Preferences',k+' '+(S.profile.comms[k]?'on':'off')); render(); }
function setFY(m){ S.settings.fyStart[S.fundId]=m; save(); logSync('ri','Fund Reporting Settings','Fiscal year start set to '+MONTHS[m-1]+' for '+F().name); toast('Fiscal year now starts in '+MONTHS[m-1]+'.'); if(PERF.range==='FYTD' && m===1) PERF.range='YTD'; render(); }
function confirmReset(){ openSheet({ kick:'Demo controls', title:'Reset the demo?', body:'<p class="lede">This clears everything you\u2019ve done in the prototype — grants, contributions, badges, quiz answers, posts, invites, settings and your five-year giving plan — and returns every fund to its starting balance. The portal then reloads on the latest version of the site.</p>', foot:'<button class="btn btn-quiet" onclick="closeSheet()">Keep my changes</button><button class="btn btn-accent" onclick="resetDemo()">Reset demo</button>' }); }

/* ============ ARCHITECTURE MAP (buried: profile → sync & data) ============ */
VIEWS.architecture = function(){
  var layers=[
    ['Edge','var(--green)','Global',[['CDN + DNS','Routing and TLS'],['Web application firewall','OWASP rules + GraphQL limits'],['Bot management','Stops credential stuffing']]],
    ['Experience','#164430','Mobile-first web app',[['Progressive web app','Installable, offline shell, push'],['Design system','Landing-page tokens and components'],['Identity','Microsoft Entra External ID + MFA']]],
    ['Backend for frontend','#086C43','GraphQL',[['GraphQL server','Node.js / TypeScript'],['Authorization','Per-fund, per-role scoping'],['Event queue','Retries, ordering, audit trail']]],
    ['Systems of record','#1A8DA9','Integration',[['Ren iPhi (ERP)','Funds, balances, pools, grants, contributions, statements'],['Salesforce (CRM)','Contacts, relationships, preferences, engagement, cases'],['Candid','Nonprofit search and verification'],['Payment processor','Hosted card and bank fields, webhooks']]]
  ];
  var lands=[['Grants and distributions','Ren iPhi','Grant / Distribution'],['Contributions','Ren iPhi','Receipt / Gift'],['Rebalance requests','Ren iPhi','Reallocation Request'],['Fiscal-year settings','Ren iPhi','Fund reporting'],['Profile and preferences','Salesforce','Contact'],['Family and authorized users','Salesforce','Contact Relationship'],['Advisor messages and calls','Salesforce','Case / Event'],['Badges, quiz, legends','Salesforce','Engagement Activity'],['Feed posts and connections','Salesforce','Engagement Activity'],['Grant cart (before submit)','Salesforce','Grant Cart']];
  return pageHead('For developers','Architecture map',{lede:'Proposed technical layers behind the portal and where each account holder action is saved. For discussion with IT — not an approved design.'})+
    '<div class="pad">'+layers.map(function(l){ return '<div class="arch-layer"><div class="al-h" style="background:'+l[1]+'">'+l[0]+'<span>'+l[2]+'</span></div><div class="arch-cells">'+l[3].map(function(c){ return '<div><b>'+c[0]+'</b><span>'+c[1]+'</span></div>'; }).join('')+'</div></div>'; }).join('')+'</div>'+
    '<div class="gap-m"></div>'+rail('Data flow','Where activity lands','Proposed')+'<div class="pad" style="padding-top:14px"><div class="tbl-wrap"><table class="tbl" style="min-width:460px"><thead><tr><th>Action</th><th style="text-align:left">System</th><th style="text-align:left">Object</th></tr></thead><tbody>'+lands.map(function(r){ return '<tr><td class="b">'+r[0]+'</td><td style="text-align:left"><span class="sy-s '+(r[1]==='Salesforce'?'sy-sf':'sy-ri')+'" style="font-family:var(--f-ledger);font-size:9px;padding:3px 7px;border-radius:6px">'+r[1]+'</span></td><td style="text-align:left">'+r[2]+'</td></tr>'; }).join('')+'</tbody></table></div></div>';
};

/* ============================================================
   ENGAGE — content from tcf_giving_portal_merged_v13 rebuilt in
   the landing design system. Org funds don't see Local Legends,
   the History Quiz or the Impact Calculator (feature map).
   ============================================================ */
var ENG = {};
var BADGE_BY = {}; GARDEN_BADGES.forEach(function(b){ BADGE_BY[b.id]=b; });
function cssColor(c){ var m=/var\((--[\w-]+)\)/.exec(c||''); return m ? getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim()||'#164430' : c; }
function gardenCount(){ return GARDEN_BADGES.filter(function(b){ return S.garden[b.id] && S.garden[b.id].unlocked; }).length; }

/* Land Floral mosaic — a 6×6 bloom in each badge's three colors */
var BLOOM = ['.a..a.','abaaba','.acca.','..cc..','g.gg.g','.gggg.'];
function mosaic(b, locked){
  var cols=b.colors.map(cssColor), h=hash(b.id), cells='';
  for(var r=0;r<6;r++) for(var c=0;c<6;c++){
    var k=BLOOM[r][(h%2)?5-c:c], bg;
    if(locked) bg = k==='.' ? 'transparent' : '';
    else bg = k==='a'?cols[0]:k==='b'?cols[1]:k==='c'?cols[1]:k==='g'?cols[2]:'var(--white)';
    if(!locked && k==='.' && ((h>>(r*6+c))&7)===0) bg='#EFE7D6';
    cells+='<i'+(bg?' style="background:'+bg+'"':'')+'></i>';
  }
  return '<div class="mosaic'+(locked?' locked':'')+'" aria-hidden="true">'+cells+'</div>';
}

/* ---------- dashboard modules ---------- */
function weekIdx(){ var s=new Date(TODAY.getFullYear(),0,1); return Math.min(51, Math.floor((TODAY-s)/MS/7)); }
function legendOfWeek(){ return LEGENDS[weekIdx() % LEGENDS.length]; }
function quizOfWeek(){ var w=weekIdx(); return HIST_QUIZ.filter(function(q){return q.wk===w;})[0] || HIST_QUIZ[0]; }
ENG.homeModules = function(){
  var org=isOrg(), n=gardenCount(), lg=legendOfWeek(), q=quizOfWeek(), ans=S.quiz[q.idx];
  var html = rail('Engage','Your Cleveland','<button onclick="go(\'engage\')">See all</button>') + tickerHTML();
  html += '<div class="pgrid g4 data">'+
    (org ? panel('qr','Your fund','QR code to give','Let supporters give to '+F().org+' from a phone.','qr','var(--gray2)','var(--aqua)','Print or share')
         : panel('impact','What it buys','Impact calculator','Turn a gift into meals, nights of shelter, or acres.','calc','var(--gray2)','var(--aqua)','See your impact'))+
    (org ? panel('feed','Grantee partner','Share your story','Post an update from '+F().org+' to donors.','pen','var(--gray2)','var(--moss)','Posts as a grantee partner')
         : '<button class="panel" style="--pk:var(--mid)" onclick="go(\'legends\')"><div class="p-kick">Legend of the week</div><span class="p-arrow">'+ic('arrowUR',18,2.2)+'</span><div class="t-icon" style="background:var(--gray2);color:var(--mid);font-family:var(--f-display);font-weight:800">'+initials(lg.name)+'</div><div class="p-label">'+esc(lg.name)+'</div><div class="p-sub">'+esc(lg.cat)+' · '+esc(lg.years)+'</div></button>')+
    (org ? panel('map','Where it goes','Impact map', GRANTS.length+' Foundation grants across the region.','map','var(--gray2)','var(--blue)','Filter by pillar or neighborhood')
         : panel('feed','Community','News feed','Why people give, grantee stories and Foundation news.','feed','var(--well)','var(--pink)'))+
    (org ? panel('feed','Community','News feed','Stories from donors, grantees and the Foundation.','feed','var(--well)','var(--forest)')
         : panel('map','Where it goes','Impact map', GRANTS.length+' grants mapped across Greater Cleveland.','map','var(--gray2)','var(--blue)','Filter by pillar or neighborhood'))+
  '</div>';
  var p=feedPosts().slice(0,1)[0];
  if(p) html += '<div class="gap-m"></div><div class="pad">'+postHTML(p, true)+'</div>';
  return html;
};
ENG.homeAfter = function(){};
function tickerHTML(){
  var r=rng(hash(ymd(TODAY))), pick=[]; for(var i=0;i<14;i++) pick.push(GRANTS[Math.floor(r()*GRANTS.length)]);
  var items=pick.map(function(g){ return '<span class="tk-item"><span class="org">'+esc(g.org)+'</span><span class="sep">/</span><span class="amt">'+esc((g.pillar||'').replace('Organization ','Org. '))+'</span><span class="sep">/</span>'+esc(g.neighborhood||'Greater Cleveland')+'</span>'; }).join('');
  return '<div class="ticker" aria-hidden="true"><div class="tk-badge"><span class="live"></span>Recent grants</div><div class="tk-scroll"><div class="tk-track">'+items+items+'</div></div></div>';
}

/* ---------- engagement hub ---------- */
VIEWS.engage = function(){
  var org=isOrg(), n=gardenCount();
  var html = pageHead('Engage','Your Cleveland',{lede:'Learn the city\u2019s story, see where the Foundation\u2019s grants land, and connect with the people and nonprofits doing the work.'});
  /* V1: Grow Your City banner removed. */
  var cells=[['feed','Community','News feed', org?'Post stories as a grantee partner and connect with donors.':'Why people give, grantee stories and Foundation news.','feed','var(--well)','var(--forest)'],
    ['map','Where it goes','Impact map',GRANTS.length+' grants, mapped by pillar and neighborhood.','map','var(--gray2)','var(--blue)'],
    ['legends','Every week','Local Legends','52 Clevelanders who shaped the city.','star','var(--gray2)','var(--mid)'],


    ['impact','What it buys','Impact calculator','Turn a gift into meals, nights of shelter, or acres.','calc','var(--gray2)','var(--mid)']];
  html += '<div class="pgrid g3">'+cells.filter(function(c){ return allowed(c[0]); }).map(function(c){ return panel(c[0],c[1],c[2],c[3],c[4],c[5],c[6]); }).join('')+'</div>';
  html += tickerHTML();
  html += '<div class="gap-m"></div>'+rail('Latest','From the feed','<button onclick="go(\'feed\')">Open feed</button>')+'<div class="pad" style="padding-top:14px">'+feedPosts().slice(0,2).map(function(p){return postHTML(p,true);}).join('')+'</div>';
  return html;
};

/* ============ NEWS FEED (with Grantee Partner stories) ============ */
var PARTNER_POSTS = [
  { id:'gp1', type:'grantee', org:'Eastside Arts Collective', name:'Eastside Arts Collective', color:'#19B9A9', time:'4h ago', likes:41,
    title:'Twelve teens, one wall, a whole summer', body:'Our summer mural corps finished the Superior Avenue wall this week. Twelve teen artists learned design, scaffolding safety and how to pitch a public project. Thank you to every donor who made the stipends possible.', media:'Mural corps photo' },
  { id:'gp2', type:'grantee', org:'Buckeye Neighborhood Tool Library', name:'Buckeye Neighborhood Tool Library', color:'#EE7331', time:'2d ago', likes:27,
    title:'1,000 tools checked out', body:'We just passed 1,000 checkouts since opening in the spring. Most popular: ladders, pressure washers and the tile saw. Next up — Saturday repair clinics for first-time homeowners.', media:'Repair clinic photo' },
  { id:'gp3', type:'grantee', org:'Clark-Fulton Kitchen Collective', name:'Clark-Fulton Kitchen Collective', color:'#C0629A', time:'6d ago', likes:19,
    title:'Five new food businesses', body:'Five graduates of our shared-kitchen incubator now sell at West Side Market and two corner stores. Each started with a family recipe and a rented shift in our kitchen.', media:'Kitchen photo' }
];
function feedPosts(){
  var org=isOrg(), mine=S.feed.posts.slice().reverse();
  var lg=legendOfWeek();
  var base=[
    PARTNER_POSTS[0],
    { id:'n1', type:'news', name:'Cleveland Foundation', color:'#164430', time:'Yesterday', likes:32, body:'This week\u2019s Local Legend: '+lg.name+'. '+lg.legacy, go:'legends', dafOnly:true },
    { id:'w1', type:'why', name:NF_POSTS[0].name, color:'#19B9A9', time:'2h ago', likes:NF_POSTS[0].likes, body:NF_POSTS[0].body },
    PARTNER_POSTS[1],
    { id:'w2', type:'why', name:NF_POSTS[2].name, color:'#1A8DA9', time:'3d ago', likes:NF_POSTS[2].likes, body:NF_POSTS[2].body },
    /* V1: weekly history-quiz post removed. */
    PARTNER_POSTS[2],
    { id:'w3', type:'why', name:NF_POSTS[4].name, color:'#C0629A', time:'5d ago', likes:NF_POSTS[4].likes, body:NF_POSTS[4].body },
    { id:'n3', type:'news', name:'Cleveland Foundation', color:'#164430', time:'1w ago', likes:48, body:'Where do Foundation grants go? The impact map now shows '+GRANTS.length+' recent grants by pillar and neighborhood.', go:'map' }
  ].filter(function(p){ return !(org && p.dafOnly); });
  return mine.concat(base);
}
var FEED_F='all';
VIEWS.feed = function(){
  var org=isOrg(), f=F();
  var list=feedPosts().filter(function(p){ return FEED_F==='all' || p.type===FEED_F; });
  var html = pageHead('Community','News feed',{lede: org?'Share what the fund makes possible. Your posts appear as a grantee partner story to donors across the Foundation.':'Why people give, stories from grantee partners, and news from the Foundation.'});
  html += '<div class="pad"><div class="composer"><div class="row" style="gap:10px;margin-bottom:6px"><span class="avatar round" style="background:'+(org?f.color:'var(--ember)')+';width:34px;height:34px;font-size:12px">'+initials(org?f.org:S.profile.first+' '+S.profile.last)+'</span><div><div style="font-weight:700;font-size:13.5px;color:var(--forest)">'+esc(org?f.org:S.profile.first+' '+S.profile.last.charAt(0)+'.')+'</div><div class="tiny">'+(org?'Posting as a grantee partner':'Posting as a donor')+'</div></div></div>'+
    (org?'<input id="cmTitle" placeholder="Headline — e.g. What your support built this season" style="width:100%;border:none;border-bottom:1px solid var(--line);padding:8px 0;font-family:var(--f-display);font-weight:700;font-size:16px;color:var(--forest);background:none" aria-label="Story headline">':'')+
    '<textarea id="cmBody" placeholder="'+(org?'Tell donors what happened, who it helped, and what\u2019s next.':'Why do you give? One or two sentences is perfect.')+'" aria-label="Post text"></textarea>'+
    '<div class="cm-foot"><span class="ptype '+(org?'grantee':'')+'">'+(org?'Grantee partner story':'Why I give')+'</span>'+(org?'<button class="chip" onclick="toast(\'Photo upload would open your camera roll.\')">'+ic('plus',13,2)+'Photo</button>':'')+'<span class="spacer"></span><button class="btn btn-accent btn-sm" onclick="publishPost()">Post</button></div></div></div>';
  html += '<div class="gap-m"></div><div class="pad"><div class="chip-row scroll">'+[['all','All'],['grantee','Grantee stories'],['why','Why I give'],['news','Foundation']].filter(function(c){ return !(org && c[0]==='quiz'); }).map(function(c){ return '<button class="chip'+(FEED_F===c[0]?' sel':'')+'" onclick="FEED_F=\''+c[0]+'\';render()">'+c[1]+'</button>'; }).join('')+'</div></div><div class="gap-m"></div>';
  html += '<div class="pad">'+(list.length?list.map(function(p){return postHTML(p);}).join(''):'<div class="empty"><b>No posts here yet</b>Be the first — share something above.</div>')+'</div>';
  html += '<p class="tiny pad">Sample posts; grantee partners shown are fictional.</p>';
  return html;
};
function postHTML(p, compact){
  var liked=S.feed.likes[p.id], con=S.feed.connects[p.id], org=isOrg(), own=p.mine;
  var label={why:'Why I give', grantee:'Grantee partner', news:'Cleveland Foundation', quiz:'Quiz score'}[p.type];
  var acts='<button class="'+(liked?'on':'')+'" onclick="likePost(\''+p.id+'\')">'+ic('heart',15,2)+(p.likes+(liked?1:0))+'</button>';
  if((p.type==='why'||p.type==='grantee') && !own) acts+='<button class="'+(con?'on':'')+'" onclick="connectPost(\''+p.id+'\')">'+ic(con?'check':'users',15,2)+(con?'Connected':'Connect')+'</button>';
  if(p.type==='grantee' && !own && !(org && p.org===F().org)) acts+='<button onclick="openGrantForm(\''+jsq(p.org)+'\')">'+ic('grant',15,2)+'Recommend a grant</button>';
  if(p.go && allowed(p.go)) acts+='<button onclick="go(\''+p.go+'\')">'+ic('arrowUR',15,2)+'Open</button>';
  if(own) acts+='<button onclick="deletePost(\''+p.id+'\')">'+ic('x',15,2)+'Delete</button>';
  return '<article class="post"><div class="pt"><span class="avatar round" style="background:'+p.color+'">'+(p.type==='news'?ic('spark',18,2):initials(p.name))+'</span><div style="min-width:0"><div class="pn">'+esc(p.name)+'</div><div class="pm">'+esc(p.time||ago(p.t))+'</div></div><span class="ptype '+p.type+'">'+label+'</span></div>'+
    (p.media && !compact?'<div class="post-media"><div class="mslot">'+esc(p.media)+' · placeholder</div></div>':'')+
    '<div class="pb">'+(p.title?'<b>'+esc(p.title)+'</b>':'')+esc(p.body)+'</div><div class="pa">'+acts+'</div></article>';
}
function publishPost(){
  var org=isOrg(), f=F(), body=$('#cmBody').value.trim(), title=org?$('#cmTitle').value.trim():'';
  if(!body){ toast('Write something to post.'); return; }
  var p={ id:'u'+Date.now(), t:Date.now(), mine:true, likes:0, type:org?'grantee':'why', org:org?f.org:null, name:org?f.org:S.profile.first+' '+S.profile.last.charAt(0)+'.', color:org?f.color:'#EE7331', title:title, body:body };
  S.feed.posts.push(p); save();
  logSync('sf','Engagement Activity', org?'Grantee partner story posted by '+f.org:'"Why I give" post published');
  if(!org && !(S.garden.why && S.garden.why.unlocked)) unlockBadge('why', body);
  toast('Posted to the feed.'); render();
}
function deletePost(id){ S.feed.posts=S.feed.posts.filter(function(p){return p.id!==id;}); save(); render(); }
function likePost(id){ S.feed.likes[id]=!S.feed.likes[id]; save(); if(S.feed.likes[id]) logSync('sf','Engagement Activity','Liked a feed post'); render(); }
function connectPost(id){ S.feed.connects[id]=!S.feed.connects[id]; save(); if(S.feed.connects[id]){ logSync('sf','Connection Request','Connection request sent'); toast('Connection request sent.'); } render(); }

/* ============ IMPACT MAP ============ */
var MAPF = { pillar:null, hood:'', mine:false }, LMAP=null;
function mapGrants(){
  var mineOrgs={}; if(MAPF.mine) allGrants().forEach(function(g){ mineOrgs[g.org]=1; });
  return GRANTS.filter(function(g){ return (!MAPF.pillar||g.pillar===MAPF.pillar) && (!MAPF.hood||g.neighborhood===MAPF.hood) && (!MAPF.mine||mineOrgs[g.org]); });
}
VIEWS.map = function(){
  var hoods=NEIGH_CENTROIDS.map(function(n){return n.name;}).sort();
  return pageHead('Where it goes','Impact map',{lede:'Recent Cleveland Foundation grants across the region. Filter by impact pillar or neighborhood, then tap any grant to learn more.'})+
    '<div class="pad"><div class="chip-row scroll"><button class="chip'+(!MAPF.pillar?' sel':'')+'" onclick="MAPF.pillar=null;refreshMap()">All pillars</button>'+PILLARS.map(function(p){ return '<button class="chip'+(MAPF.pillar===p.name?' sel':'')+'" onclick="MAPF.pillar=\''+jsq(p.name)+'\';trackPillar(\''+jsq(p.name)+'\');refreshMap()"><span class="cd" style="background:'+p.color+'"></span>'+esc(p.name)+'</button>'; }).join('')+'</div>'+
    '<div class="gap-s"></div><div class="row wrap"><select id="hoodSel" onchange="MAPF.hood=this.value;refreshMap()" style="flex:1;min-width:180px;padding:10px 12px;border:1px solid var(--line-2);border-radius:12px;background:var(--paper)" aria-label="Neighborhood"><option value="">All neighborhoods</option>'+hoods.map(function(h){ return '<option'+(MAPF.hood===h?' selected':'')+'>'+esc(h)+'</option>'; }).join('')+'</select>'+
    '<button class="chip'+(MAPF.mine?' sel':'')+'" onclick="MAPF.mine=!MAPF.mine;refreshMap()">'+ic('fund',13,2)+'Orgs my fund supports</button></div></div><div class="gap-m"></div>'+
    '<div class="map-wrap"><div id="leafMap"></div><div class="map-count"><span class="live"></span><span id="mapCount"></span></div></div>'+
    '<div class="gap-m"></div>'+rail('Grants','On the map','<span id="mapListN"></span>')+'<div class="list" id="mapList" style="padding-top:14px"></div>';
};
VIEWS.map_after = function(){
  if(LMAP){ try{ LMAP.remove(); }catch(e){} }   /* release the previous map and its tile listeners */
  LMAP=null;
  if(window.L){
    try{
      LMAP=L.map('leafMap',{scrollWheelZoom:false, zoomControl:true}).setView([41.47,-81.66],10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18, attribution:'&copy; OpenStreetMap contributors'}).addTo(LMAP);
      LMAP._layer=L.layerGroup().addTo(LMAP);
    }catch(e){ LMAP=null; }
  }
  if(!LMAP) $('#leafMap').innerHTML='<div class="map-fallback">'+ic('map',28)+'<b style="color:#fff">The map needs an internet connection</b>The grant list below still works.</div>';
  refreshMap();
};
function refreshMap(){
  var list=mapGrants();
  if(ROUTE!=='map') return;
  var cnt=$('#mapCount'); if(cnt) cnt.textContent=list.length+' grant'+(list.length===1?'':'s');
  // chip selection state without a full re-render (keeps the map instance)
  $$('.chip-row.scroll .chip').forEach(function(c){ var t=c.textContent.trim(); c.classList.toggle('sel', MAPF.pillar ? t===MAPF.pillar : t==='All pillars'); });
  $$('.row.wrap .chip').forEach(function(c){ c.classList.toggle('sel', MAPF.mine); });
  if(LMAP){
    LMAP._layer.clearLayers(); var pts=[];
    list.forEach(function(g){ if(!g.lat) return; pts.push([g.lat,g.lng]);
      L.circleMarker([g.lat,g.lng],{radius:7,color:'#fff',weight:1.5,fillColor:g.color||'#086C43',fillOpacity:.9}).addTo(LMAP._layer).on('click',function(){ openMapGrant(g.id); }); });
    if(pts.length && (MAPF.pillar||MAPF.hood||MAPF.mine)) LMAP.fitBounds(pts,{padding:[30,30],maxZoom:14}); else if(!pts.length) {} else LMAP.setView([41.47,-81.66],10);
  }
  $('#mapListN').textContent=Math.min(40,list.length)+' of '+list.length;
  $('#mapList').innerHTML = list.length ? list.slice(0,40).map(function(g){ return '<button class="ff-row" onclick="openMapGrant(\''+g.id+'\')"><span class="ffr-spine" style="background:'+(g.color||'#086C43')+'"></span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(g.org)+'</span><span class="ffr-sub" style="display:block">'+esc(g.grantName)+'</span><span class="ffr-meta" style="display:block">'+esc(g.pillar)+' · '+esc(g.neighborhood||'Region')+'</span></span>'+ic('chev',18)+'</button>'; }).join('') : '<div class="empty"><b>No grants match</b>'+(MAPF.mine?'None of the organizations your fund supports appear in this grant set yet.':'Try a different pillar or neighborhood.')+'</div>';
}
function trackPillar(p){ logSync('sf','Interest Signal','Explored "'+p+'" on the impact map'); }
function openMapGrant(id){
  var g=GRANTS.filter(function(x){return x.id===id;})[0]; if(!g) return; var pl=PILLARS.filter(function(p){return p.name===g.pillar;})[0];
  openSheet({ kick:g.pillar, title:g.org, body:'<p class="lede" style="font-family:var(--f-display);font-weight:600;color:var(--forest);font-size:17px">'+esc(g.grantName)+'</p><div class="gap-s"></div>'+
    '<div class="facts"><div class="fr"><span class="fk">Pillar</span><span class="fv"><i class="sw" style="background:'+(g.color||'#086C43')+'"></i>'+esc(g.pillar)+'</span></div><div class="fr"><span class="fk">Focus</span><span class="fv">'+esc(g.focus||'—')+'</span></div><div class="fr"><span class="fk">Program area</span><span class="fv">'+esc(g.program||'—')+'</span></div><div class="fr"><span class="fk">Neighborhood</span><span class="fv">'+esc(g.neighborhood||'Region')+'</span></div><div class="fr"><span class="fk">Address</span><span class="fv">'+esc(g.address||'—')+'</span></div></div>'+
    (pl?'<p class="tiny" style="margin-top:10px">'+esc(pl.blurb)+'</p>':''),
    foot:(g.orgUrl?'<a class="btn btn-quiet" href="'+esc(g.orgUrl)+'" target="_blank" rel="noopener">Website</a>':'')+'<button class="btn btn-accent" onclick="closeSheet();openGrantForm(\''+jsq(g.org)+'\')">'+ic('grant',18)+(isOrg()?'Recommend a grant':'Recommend a grant')+'</button>' });
  logSync('sf','Interest Signal','Viewed '+g.org+' on the impact map');
}

/* ============ LOCAL LEGENDS (account holders only) ============ */
var LG_ID=null, LG_BROWSE=false;
VIEWS.legends = function(){
  var wk=legendOfWeek(), l=LEGENDS.filter(function(x){return x.id===LG_ID;})[0]||wk, i=LEGENDS.indexOf(l);
  var col=LGD_COLORS[l.color]||'#164430';
  S.legendsSeen=S.legendsSeen||{}; if(!S.legendsSeen[l.id]){ S.legendsSeen[l.id]=Date.now(); save(); logSync('sf','Engagement Activity','Read Local Legend: '+l.name); }
  return pageHead('Every week','Local Legends',{lede:'Fifty-two Clevelanders who shaped the city — one for every week of the year.'})+
    '<div class="pad"><div class="lg-hero" style="background:var(--green)">'+guilloche(240,330,'#ffffff')+
      '<div class="row" style="justify-content:space-between"><span class="lg-av">'+initials(l.name)+'</span><span class="pin dark" style="display:inline-flex">'+(l===wk?'This week':'Legend '+(i+1)+' of 52')+'</span></div>'+
      '<div class="lg-cat">'+esc(l.cat)+'</div><h2>'+esc(l.name)+'</h2><div class="lg-yrs">'+esc(l.years)+'</div><blockquote>\u201C'+esc(l.quote)+'\u201D</blockquote></div>'+
    '<div class="gap-m"></div><div class="card"><div class="card-k">Their story</div><p style="font-size:14.5px;line-height:1.7">'+esc(l.story)+'</p><div class="gap-s"></div><div class="card-k">Their legacy</div><p style="font-size:14.5px;line-height:1.7;color:var(--ink-2)">'+esc(l.legacy)+'</p></div>'+
    '<div class="gap-s"></div><div class="row wrap"><button class="btn btn-accent" style="flex:1" onclick="honorLegend('+l.id+')">'+ic('grant',18)+'Give in their honor</button><button class="btn btn-quiet" onclick="stepLegend(-1)" aria-label="Previous legend">'+ic('back',18)+'</button><button class="btn btn-quiet" onclick="stepLegend(1)" aria-label="Next legend">'+ic('chev',18)+'</button></div>'+
    '<div class="gap-m"></div><button class="btn btn-quiet btn-block" onclick="LG_BROWSE=!LG_BROWSE;render()">'+(LG_BROWSE?'Hide the list':'Browse all 52 legends')+'</button></div>'+
    (LG_BROWSE?'<div class="gap-m"></div><div class="pad"><div class="lg-grid">'+LEGENDS.map(function(x){ return '<button class="lg-chip" onclick="LG_ID='+x.id+';LG_BROWSE=false;render();window.scrollTo(0,0)"><span class="avatar" style="background:'+(LGD_COLORS[x.color]||'#164430')+'">'+initials(x.name)+'</span><span><span class="n" style="display:block">'+esc(x.name)+'</span><span class="c" style="display:block">'+esc(x.cat)+(S.legendsSeen&&S.legendsSeen[x.id]?' · read':'')+'</span></span></button>'; }).join('')+'</div></div>':'');
};
function stepLegend(d){ var cur=LEGENDS.filter(function(x){return x.id===LG_ID;})[0]||legendOfWeek(), i=(LEGENDS.indexOf(cur)+d+LEGENDS.length)%LEGENDS.length; LG_ID=LEGENDS[i].id; render(); }
function honorLegend(id){ var l=LEGENDS.filter(function(x){return x.id===id;})[0];
  openSheet({ kick:'In honor of '+l.name, title:'Give in their honor', body:'<p class="lede">Choose a nonprofit and your grant will carry a tribute to '+esc(l.name)+'. The recognition is added for you.</p><div class="gap-m"></div><div class="list" style="padding:0">'+ORGS.filter(function(o){ return (hash(o.name+l.cat)%9)===0; }).slice(0,4).map(function(o){ return '<button class="ff-row" onclick="closeSheet();setTimeout(function(){openGrantForm(\''+jsq(o.name)+'\',500,\''+jsq(l.name)+'\')},250)"><span class="avatar" style="background:'+o.color+'">'+initials(o.name)+'</span><span class="ffr-main"><span class="ffr-name" style="display:block">'+esc(o.name)+'</span><span class="ffr-meta" style="display:block">'+esc(o.program)+'</span></span>'+ic('chev',18)+'</button>'; }).join('')+'</div>',
    foot:'<button class="btn btn-quiet" onclick="closeSheet();go(\'grants\')">Search all nonprofits</button>' });
  logSync('sf','Engagement Activity','Started a tribute grant for Local Legend '+l.name);
}

/* ============ CLEVELAND HISTORY QUIZ (account holders only) ============ */
var QZ_I=null, LB_SORT='accuracy';
function quizStats(){ var a=0,c=0; Object.keys(S.quiz).forEach(function(k){ a++; if(S.quiz[k].correct) c++; }); return {answered:a, correct:c, acc:a?c/a:0}; }
VIEWS.quiz = function(){
  var wkq=quizOfWeek(); if(QZ_I===null) QZ_I=wkq.idx; var q=HIST_QUIZ[QZ_I], ans=S.quiz[q.idx], st=quizStats();
  var html = pageHead('Every week','Cleveland history quiz',{lede:'We\u2019ve helped this city thrive for more than a century, and we want you to help us see it thrive for the next 100. Test what you know about Cleveland\u2019s civic history \u2014 a new question unlocks each week, and you can go back and answer any you missed.'});
  html += '<div class="pad"><div class="card"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="card-k">'+(q.idx===wkq.idx?'This week\u2019s question':'Week '+(q.wk+1))+' · '+esc(HIST_CAT_LABEL[q.cat]||'Cleveland')+'</div><div class="qz-year">'+q.y+'</div></div><span class="status st-queued">'+esc(q.diff)+'</span></div>'+
    '<div class="qz-q">'+esc(q.q)+'</div><div class="qz-opts">'+q.options.map(function(o,i){ var cls=''; if(ans){ if(i===q.correct) cls=' right'; else if(i===ans.choice) cls=' wrong'; } return '<button class="qz-opt'+cls+'" '+(ans?'disabled':'')+' onclick="answerQuiz('+i+')"><span class="l">'+'ABCD'[i]+'</span>'+esc(o)+'</button>'; }).join('')+'</div>'+
    (ans?'<div class="qz-reveal"><b style="color:var(--forest)">'+(ans.correct?'Correct. ':'The answer: '+esc(q.options[q.correct])+'. ')+'</b>'+esc(q.reveal)+'</div>':'')+
    '<div class="row" style="margin-top:14px"><button class="btn btn-quiet btn-sm" onclick="stepQuiz(-1)" aria-label="Previous question">'+ic('back',16)+'Previous</button><span class="spacer"></span><button class="btn btn-quiet btn-sm" onclick="surpriseQuiz()">Surprise me</button><span class="spacer"></span><button class="btn btn-quiet btn-sm" onclick="stepQuiz(1)" aria-label="Next question">Next'+ic('chev',16)+'</button></div></div></div>';
  html += '<div class="gap-m"></div><div class="pad"><div class="calc-out">'+guilloche(250,330)+'<div class="card-k" style="color:var(--gray2)">Your score</div><div class="co-big">'+st.correct+' / '+st.answered+'</div><div class="co-cap">'+(st.answered?Math.round(st.acc*100)+'% correct · ':'')+(52-st.answered)+' questions left</div><div class="progress"><span style="width:'+(st.answered/52*100)+'%"></span></div>'+
    (st.answered?'<div class="gap-m"></div><button class="btn btn-onhero btn-sm" onclick="shareQuiz()">'+ic('share',16)+'Share my score to the feed</button>':'')+'</div></div>';
  var you={name:'You', initials:initials(S.profile.first+' '+S.profile.last), color:'#EE7331', answered:st.answered, correct:st.correct, you:true};
  var rows=HQ_LB_MOCK.concat(st.answered?[you]:[]).map(function(r){ return Object.assign({acc:r.answered?r.correct/r.answered:0}, r); });
  rows=rows.filter(function(r){ return LB_SORT==='score' || r.answered>=5 || r.you; }).sort(function(a,b){ return LB_SORT==='score' ? b.correct-a.correct : b.acc-a.acc || b.correct-a.correct; });
  html += '<div class="gap-m"></div>'+rail('Leaderboard','Top Clevelanders', '<button onclick="LB_SORT=LB_SORT===\'score\'?\'accuracy\':\'score\';render()">Sort: '+(LB_SORT==='score'?'most correct':'accuracy')+'</button>')+
    '<div class="pad" style="padding-top:14px"><div class="card flush">'+rows.slice(0,10).map(function(r,i){ return '<div class="lb-row'+(r.you?' you':'')+'"><span class="rk">'+(i+1)+'</span><span class="avatar" style="background:'+cssColor(r.color)+'">'+esc(r.initials)+'</span><span style="font-weight:'+(r.you?700:500)+'">'+esc(r.name)+'</span><span class="sc">'+(LB_SORT==='score'?r.correct+' correct':Math.round(r.acc*100)+'% · '+r.answered)+'</span></div>'; }).join('')+'</div><p class="tiny" style="margin-top:8px">Accuracy ranking needs at least 5 answers. Other players are sample data.</p></div>';
  return html;
};
function answerQuiz(i){ var q=HIST_QUIZ[QZ_I]; if(S.quiz[q.idx]) return; var ok=i===q.correct; S.quiz[q.idx]={choice:i, correct:ok, t:Date.now()}; save();
  logSync('sf','Engagement Activity','History quiz '+q.y+': '+(ok?'correct':'incorrect')); toast(ok?'Correct — nice work.':'Not quite. Read the reveal below.'); render(); }
function stepQuiz(d){ QZ_I=(QZ_I+d+HIST_QUIZ.length)%HIST_QUIZ.length; render(); }
function surpriseQuiz(){ var open=HIST_QUIZ.filter(function(q){return !S.quiz[q.idx];}); var pool=open.length?open:HIST_QUIZ; QZ_I=pool[Math.floor(Math.random()*pool.length)].idx; render(); }
function shareQuiz(){ var st=quizStats(); S.feed.posts.push({ id:'u'+Date.now(), t:Date.now(), mine:true, likes:0, type:'quiz', name:S.profile.first+' '+S.profile.last.charAt(0)+'.', color:'#EE7331', body:'I\u2019ve answered '+st.answered+' Cleveland history questions and got '+st.correct+' right. Think you know the city better?' }); save();
  logSync('sf','Engagement Activity','Shared quiz score to the feed'); toast('Shared to the feed.'); }

/* ============ GROW YOUR CITY (garden + badges, one feature) ============ */
VIEWS.garden = function(){
  var n=gardenCount();
  return pageHead('Badges','Grow Your City',{lede:'Every time you show up for Cleveland, you plant a Land Floral. Collect all six by volunteering, attending, giving, sharing and supporting local business.'})+
    '<div class="pad"><div class="calc-out">'+guilloche(250,330)+'<div class="co-big">'+n+' of 6 planted</div><div class="co-cap">'+(n===6?'Your garden is in full bloom':'Keep going — '+(6-n)+' to go')+'</div><div class="progress"><span style="width:'+(n/6*100)+'%"></span></div></div></div><div class="gap-m"></div>'+
    '<div class="gc-grid">'+GARDEN_BADGES.map(function(b){ var st=S.garden[b.id], on=st&&st.unlocked; return '<button class="gc-cell" onclick="openBadge(\''+b.id+'\')">'+mosaic(b,!on)+'<div><div class="p-kick" style="--pk:'+cssColor(b.colors[0])+'">'+esc(b.desc)+'</div><div class="n" style="margin-top:6px">'+esc(b.plant)+'</div><div class="d">'+(on?'Planted '+fdate(new Date(st.t),'short'):({selfreport:'Tell us to collect',auto:'Collected automatically',post:'Post to collect',share:'Share to collect'})[b.verify])+'</div></div></button>'; }).join('')+'</div>'+
    '<p class="tiny pad" style="margin-top:12px">Badges are saved to your profile '+pin('sf')+'</p>';
};
function openBadge(id){
  var b=BADGE_BY[id], st=S.garden[id], on=st&&st.unlocked, act='';
  if(!on){
    if(b.verify==='selfreport') act='<div class="f-row"><label for="bdIn">'+esc(b.fieldLabel)+'</label><input id="bdIn" placeholder="'+esc(b.placeholder)+'"></div><p class="tiny">Honor system — no proof needed.</p>';
    else if(b.verify==='post') act='<div class="f-row"><label for="bdIn">'+esc(b.fieldLabel||'Your why')+'</label><textarea id="bdIn" placeholder="'+esc(b.placeholder||'Why do you give?')+'"></textarea></div><p class="tiny">This posts to the news feed as a \u201CWhy I give\u201D story.</p>';
    else if(b.verify==='auto') act='<p class="tiny">Collected automatically the next time you contribute to your fund or submit a grant.</p>';
    else act='<p class="tiny">Share an invitation to the Foundation. Collected when you share.</p>';
  }
  var foot = on ? '<button class="btn btn-primary" onclick="closeSheet()">Close</button>'
    : b.verify==='auto' ? '<button class="btn btn-quiet" onclick="closeSheet();go(\'grants\')">Recommend a grant</button><button class="btn btn-accent" onclick="closeSheet();go(\'contribute\')">Contribute</button>'
    : b.verify==='share' ? '<button class="btn btn-accent" onclick="shareBadge(\''+id+'\')">'+ic('share',16)+'Share an invite</button>'
    : '<button class="btn btn-accent" onclick="submitBadge(\''+id+'\')">'+(b.verify==='post'?'Post & collect':'Tell us & collect')+'</button>';
  openSheet({ kick:b.desc, title:b.plant, body:'<div style="max-width:170px;margin:0 auto 18px">'+mosaic(b,!on)+'</div>'+(on?'<div class="center"><span class="status st-posted">Planted '+fdate(new Date(st.t))+'</span>'+(st.detail?'<p class="tiny" style="margin-top:8px">'+esc(st.detail)+'</p>':'')+'</div><div class="gap-m"></div>':'')+
    '<div class="card-k">How to collect</div><p style="font-size:14px;line-height:1.6;color:var(--ink-2)">'+esc(b.howto)+'</p><div class="gap-m"></div>'+act+'<div class="gap-m"></div><div class="card-k">The story</div><p style="font-size:13.5px;line-height:1.65;color:var(--ink-2)">'+esc(b.story)+'</p>', foot:foot });
}
function submitBadge(id){ var el=$('#bdIn'), v=el?el.value.trim():''; if(!v){ el.parentNode.classList.add('err'); toast('Add a quick note to collect this one.'); return; }
  if(id==='why'){ S.feed.posts.push({ id:'u'+Date.now(), t:Date.now(), mine:true, likes:0, type:'why', name:S.profile.first+' '+S.profile.last.charAt(0)+'.', color:'#EE7331', body:v }); logSync('sf','Engagement Activity','"Why I give" post published'); }
  unlockBadge(id, v); closeSheet(); }
function shareBadge(id){ var data={ title:'Cleveland Foundation', text:'I\u2019m growing my city with the Cleveland Foundation. Come see what your giving can do.', url:'https://www.clevelandfoundation.org/' };
  var done=function(){ unlockBadge(id,'Shared an invite'); closeSheet(); };
  if(navigator.share) navigator.share(data).then(done).catch(function(){}); else { if(navigator.clipboard) navigator.clipboard.writeText(data.url).catch(function(){}); toast('Invite link copied.'); done(); } }
function unlockBadge(id, detail){
  return;   /* V1: Grow Your City badges are not in the first release. */
  if(S.garden[id] && S.garden[id].unlocked) return;
  S.garden[id]={unlocked:true, t:Date.now(), detail:detail||''}; save();
  logSync('sf','Engagement Activity','Earned Land Floral badge: '+BADGE_BY[id].plant+' ('+BADGE_BY[id].desc+')');
  toast('You planted a '+BADGE_BY[id].plant+'. '+gardenCount()+' of 6 in your garden.');
  if(ROUTE==='garden'||ROUTE==='home'||ROUTE==='engage') setTimeout(render, 60);
}
ENG.autoBadge = function(id){ setTimeout(function(){ unlockBadge(id, 'Detected from your giving'); }, 900); };

/* ============ IMPACT CALCULATOR (account holders only) ============ */
var IC = { area:'food', mode:'onetime', gift:500, years:10, rate:6 };
VIEWS.impact = function(){
  return pageHead('What it buys','Impact calculator',{lede:'Choose a cause and a gift. See what it could fund today, and what it could grow into if invested in your fund first.'})+
    '<div class="pad"><div class="chip-row">'+CALC_AREAS.map(function(a){ return '<button class="chip'+(IC.area===a.id?' sel':'')+'" onclick="IC.area=\''+a.id+'\';render()"><span class="cd" style="background:'+a.color+'"></span>'+esc(a.name)+'</button>'; }).join('')+'</div>'+
    '<div class="gap-m"></div><div class="seg">'+[['onetime','One-time gift'],['monthly','Monthly gift']].map(function(m){ return '<button class="'+(IC.mode===m[0]?'sel':'')+'" onclick="IC.mode=\''+m[0]+'\';render()">'+m[1]+'</button>'; }).join('')+'</div>'+
    '<div class="gap-m"></div><div class="card">'+
      icSlider('gift', IC.mode==='monthly'?'Each month':'Gift amount', IC.gift, IC.mode==='monthly'?25:100, IC.mode==='monthly'?5000:100000, IC.mode==='monthly'?25:100, 'money')+
      icSlider('years','Invested for',IC.years,1,30,1,'yrsFmt')+icSlider('rate','Assumed annual return',IC.rate,0,10,.5,'pctv')+'</div>'+
    '<div class="gap-m"></div><div class="calc-out" id="icOut"></div>'+
    '<div class="gap-m"></div><div class="card"><div class="card-k">Growth over time</div><div class="chart on-light" id="icChart"></div></div>'+
    '<p class="tiny" style="margin-top:10px">Unit costs are sample estimates for illustration. Projections are hypothetical, not investment advice.</p>'+
    '<div class="gap-s"></div><button class="btn btn-accent btn-block" onclick="GQ=\''+jsq((CALC_AREAS.filter(function(a){return a.id===IC.area;})[0]||{}).name||'')+'\';go(\'grants\')">'+ic('grant',18)+'Find a nonprofit for this cause</button></div>';
};
function icSlider(k,label,val,min,max,step,fmt){ return '<div class="slider-row"><div class="sl-top"><span>'+label+'</span><b id="ic'+k+'V">'+window[fmt](val)+'</b></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" oninput="IC.'+k+'=+this.value;document.getElementById(\'ic'+k+'V\').textContent='+fmt+'(+this.value);runImpact()" aria-label="'+esc(label)+'"></div>'; }
function runImpact(){
  var a=CALC_AREAS.filter(function(x){return x.id===IC.area;})[0], r=IC.rate/100/12, n=IC.years*12, vals=[], contributed;
  function fv(months){ if(IC.mode==='monthly') return r? IC.gift*((Math.pow(1+r,months)-1)/r) : IC.gift*months; return IC.gift*Math.pow(1+r,months); }
  for(var y=0;y<=IC.years;y++) vals.push(fv(y*12));
  var total=fv(n); contributed = IC.mode==='monthly'?IC.gift*n:IC.gift;
  var today = (IC.mode==='monthly'?IC.gift*12:IC.gift)/a.unitCost, later=total/a.unitCost;
  function fmtN(x){ return x>=1e6?(x/1e6).toFixed(1)+'M':x>=1e4?Math.round(x/1e3)+'K':Math.round(x).toLocaleString('en-US'); }
  $('#icOut').innerHTML = guilloche(250,330)+'<div class="row" style="gap:12px"><span class="avatar" style="background:rgba(255,255,255,.12);color:'+a.color+'">'+(CALC_ICONS[a.id]||'').replace('<svg','<svg width="22" height="22"')+'</span><div class="co-cap" style="margin:0">'+esc(a.name)+' · '+esc(a.programDesc)+'</div></div>'+
    '<div class="co-big" style="margin-top:14px">'+fmtN(later)+' '+esc(a.unitLabel.toLowerCase())+'</div><div class="co-cap">Funded after '+IC.years+' years of growth</div>'+
    '<div class="calc-units"><div><div class="u-v">'+fmtN(today)+'</div><div class="u-k">'+(IC.mode==='monthly'?'Per year today':'If granted today')+'</div></div><div><div class="u-v">'+moneyK(total)+'</div><div class="u-k">Value in '+IC.years+' yrs</div></div><div><div class="u-v">'+moneyK(total-contributed)+'</div><div class="u-k">From growth</div></div></div>';
  lineChart('icChart',[{values:vals,color:a.color,fill:true,w:2.4}],{h:180,label:'Projected gift value',xLabels:[{k:0,t:'Today'},{k:IC.years,t:IC.years+' yrs'}]});
}
VIEWS.impact_after = function(){ runImpact(); };
