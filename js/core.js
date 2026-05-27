// ═══ CODEX DEI — CORE JS ═══
// Variables globales
const SUPABASE_URL = 'https://ctttpbbsirawljldvutt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dHRwYmJzaXJhd2xqbGR2dXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTYwNDUsImV4cCI6MjA5NTE5MjA0NX0.VAZQ0_2bprIH6P0kQjK2QROk_NdHgbLk0JmpoDZzH98';
const API_ENDPOINT = '/api/claude';

// Thème
function initTheme() {
  const t = localStorage.getItem('codex_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('codex_theme', t);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
}

// Supabase fetch
async function sbFetch(table, method = 'GET', body = null, filters = '') {
  const token = localStorage.getItem('sb_token') || SUPABASE_KEY;
  const url = SUPABASE_URL + '/rest/v1/' + table + (filters ? '?' + filters : '');
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return method === 'DELETE' ? null : r.json();
}

// Claude API
const SYS = `Tu es le CODEX DEI, encyclopédie biblique exhaustive. Expert en exégèse (AT/NT), langues bibliques (hébreu, araméen, grec koinè), gématrie, symbolisme, sciences (biologie, physique, astronomie, mathématiques), traditions juive et chrétienne, prophéties, archéologie biblique. Règles : TOUJOURS citer références bibliques précises (Livre ch:v). Structurer avec ### pour sections. Mettre **gras** les points importants. Répondre en français avec profondeur et élégance.`;

const LOADING_VERSES = [
  "Au commencement était la Parole…",
  "Je suis le chemin, la vérité, la vie.",
  "Cherchez et vous trouverez…",
  "L'Éternel est mon berger…",
  "Dieu est lumière."
];

async function callClaude(prompt, targetId, title) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const lv = LOADING_VERSES[Math.floor(Math.random() * LOADING_VERSES.length)];
  target.innerHTML = `<div class="loading-state"><div class="loader"></div><div style="color:var(--text3);font-style:italic">L'IA explore les Écritures…</div><div class="loading-verse">"${lv}"</div></div>`;
  target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const r = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: SYS,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.content.map(b => b.text || '').join('');
    target.innerHTML = formatResult(raw, title);
  } catch (e) {
    target.innerHTML = `<div class="error-state">❌ ${e.message}</div>`;
  }
}

function formatResult(text, title) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/###\s(.+)/g, '<h3>$1</h3>')
    .replace(/##\s(.+)/g, '<h3>$1</h3>')
    .replace(/^[-•]\s(.+)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent('Codex Dei : ' + title);
  return `<div class="ai-result">
    <div class="result-header">
      <span style="color:var(--gold)">✦</span>
      <span class="result-label">${title}</span>
    </div>
    <div class="result-body">${html}</div>
    <div class="result-actions">
      <a class="share-btn share-wa" href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank">📱 WhatsApp</a>
      <a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank">📘 Facebook</a>
      <button class="share-btn share-copy" onclick="copyText(this)">📋 Copier</button>
      <button class="share-btn" onclick="window.print()">🖨️</button>
      <button class="fav-btn" onclick="saveFav('${title}', this)">⭐ Sauvegarder</button>
    </div>
  </div>`;
}

function copyText(btn) {
  const text = btn.closest('.ai-result').querySelector('.result-body').innerText;
  navigator.clipboard.writeText(text);
  btn.textContent = '✓ Copié !';
  setTimeout(() => btn.textContent = '📋 Copier', 2000);
}

// Favoris
function saveFav(title, btn) {
  const content = btn.closest('.ai-result').querySelector('.result-body').innerText.substring(0, 200) + '…';
  let favs = JSON.parse(localStorage.getItem('codex_favs') || '[]');
  favs.unshift({ title, content, date: new Date().toLocaleDateString('fr-FR'), id: Date.now() });
  if (favs.length > 50) favs.pop();
  localStorage.setItem('codex_favs', JSON.stringify(favs));
  btn.textContent = '✓ Sauvegardé';
  btn.style.color = 'var(--gold2)';
}

// Calendrier liturgique
function getEaster(year) {
  var a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,
      f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,
      i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
      month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return new Date(year, month-1, day);
}

function getLiturgicalDay() {
  var now = new Date(), year = now.getFullYear(), easter = getEaster(year);
  function diff(d){var r=new Date(easter);r.setDate(r.getDate()+d);return r;}
  function sameDay(a,b){return a.getDate()===b.getDate()&&a.getMonth()===b.getMonth();}
  function inRange(d,s,e){return d>=s&&d<=e;}

  var fixed=[
    {d:1,m:1,emoji:"🎆",label:"Nouvel An",t:"Grace et paix vous soient donnees.",r:"Romains 1:7"},
    {d:6,m:1,emoji:"⭐",label:"Epiphanie",t:"Des mages d Orient arriverent en disant : Ou est le roi des Juifs ?",r:"Matthieu 2:1"},
    {d:2,m:2,emoji:"🕯️",label:"Chandeleur",t:"Mes yeux ont vu ton salut prepare devant tous les peuples.",r:"Luc 2:30"},
    {d:25,m:3,emoji:"🕊️",label:"Annonciation",t:"Tu concevras et enfanteras un fils, et tu lui donneras le nom de Jesus.",r:"Luc 1:31"},
    {d:15,m:8,emoji:"👑",label:"Assomption",t:"Desormais tous les ages me diront bienheureuse.",r:"Luc 1:48"},
    {d:1,m:11,emoji:"✨",label:"Toussaint",t:"Heureux les purs de coeur, car ils verront Dieu.",r:"Matthieu 5:8"},
    {d:25,m:12,emoji:"🎄",label:"Noel",t:"Un enfant nous est ne, un fils nous a ete donne.",r:"Esaie 9:5"},
    {d:24,m:12,emoji:"⭐",label:"Veille de Noel",t:"Voici, la vierge concevra et enfantera un fils nomme Emmanuel.",r:"Matthieu 1:23"},
  ];

  var mobile=[
    {delta:-46,emoji:"✝️",label:"Mercredi des Cendres",t:"Revenez a moi de tout votre coeur.",r:"Joel 2:12"},
    {delta:-7,emoji:"🌿",label:"Dimanche des Rameaux",t:"Hosanna ! Beni soit celui qui vient au nom du Seigneur !",r:"Matthieu 21:9"},
    {delta:-3,emoji:"🍷",label:"Jeudi Saint",t:"Faites ceci en memoire de moi.",r:"Luc 22:19"},
    {delta:-2,emoji:"✝️",label:"Vendredi Saint",t:"Dieu a tant aime le monde qu il a donne son Fils unique.",r:"Jean 3:16"},
    {delta:0,emoji:"🌅",label:"Paques",t:"Il n est pas ici, il est ressuscite !",r:"Matthieu 28:6"},
    {delta:39,emoji:"☁️",label:"Ascension",t:"Il fut eleve, et une nuee le deroba a leurs regards.",r:"Actes 1:9"},
    {delta:49,emoji:"🔥",label:"Pentecote",t:"Ils furent tous remplis du Saint-Esprit.",r:"Actes 2:4"},
    {delta:56,emoji:"✦",label:"Sainte Trinite",t:"Allez, baptisez-les au nom du Pere, du Fils et du Saint-Esprit.",r:"Matthieu 28:19"},
  ];

  for (var i=0;i<fixed.length;i++) {
    if (now.getDate()===fixed[i].d && now.getMonth()===fixed[i].m-1)
      return {label:fixed[i].label,t:fixed[i].t,r:fixed[i].r,emoji:fixed[i].emoji,isFeast:true};
  }
  for (var j=0;j<mobile.length;j++) {
    if (sameDay(now, diff(mobile[j].delta)))
      return {label:mobile[j].label,t:mobile[j].t,r:mobile[j].r,emoji:mobile[j].emoji,isFeast:true};
  }

  var christmas=new Date(year,11,25), ashWed=diff(-46), pentecost=diff(49);
  var advent1=new Date(christmas); advent1.setDate(christmas.getDate()-((christmas.getDay()+21)%7+21));

  if (inRange(now,advent1,christmas)) {
    var w=Math.min(Math.floor((now-advent1)/(7*86400000)),3);
    var av=[
      {t:"Preparez le chemin du Seigneur.",r:"Matthieu 3:3"},
      {t:"Voici, une vierge sera enceinte.",r:"Esaie 7:14"},
      {t:"Rejouis-toi, fille de Sion !",r:"Zacharie 9:9"},
      {t:"Une bonne nouvelle pour tout le peuple.",r:"Luc 2:10"},
    ];
    return {label:"Avent - Semaine "+(w+1),t:av[w].t,r:av[w].r,emoji:"⭐",isFeast:false};
  }
  if (inRange(now,ashWed,easter)) {
    return {label:"Temps du Careme",t:"L homme ne vivra pas de pain seulement.",r:"Matthieu 4:4",emoji:"✝️",isFeast:false};
  }
  if (inRange(now,easter,pentecost)) {
    return {label:"Temps Pascal",t:"Il est ressuscite ! La paix soit avec vous.",r:"Jean 20:19",emoji:"🌅",isFeast:false};
  }

  var ord=[
    {t:"L Eternel est mon berger : je ne manquerai de rien.",r:"Psaume 23:1",emoji:"🌿"},
    {t:"Tu aimeras le Seigneur ton Dieu de tout ton coeur.",r:"Matthieu 22:37",emoji:"❤️"},
    {t:"Tout concourt au bien de ceux qui aiment Dieu.",r:"Romains 8:28",emoji:"✨"},
    {t:"Ne crains pas, car je suis avec toi.",r:"Esaie 41:10",emoji:"🙏"},
    {t:"La foi, c est la certitude des choses qu on espere.",r:"Hebreux 11:1",emoji:"⭐"},
    {t:"Heureux les artisans de paix.",r:"Matthieu 5:9",emoji:"🕊️"},
    {t:"Je puis tout en Christ qui me fortifie.",r:"Philippiens 4:13",emoji:"💪"},
    {t:"Dieu est amour.",r:"1 Jean 4:16",emoji:"❤️"},
    {t:"Cherchez d abord le royaume de Dieu.",r:"Matthieu 6:33",emoji:"👑"},
    {t:"Car Dieu a tant aime le monde.",r:"Jean 3:16",emoji:"✝️"},
    {t:"Que la paix de Dieu garde vos coeurs.",r:"Philippiens 4:7",emoji:"☮️"},
    {t:"L Eternel est ma lumiere et mon salut.",r:"Psaume 27:1",emoji:"☀️"},
  ];
  var idx=(now.getDate()+now.getMonth())%ord.length;
  return {label:"Temps Ordinaire",t:ord[idx].t,r:ord[idx].r,emoji:ord[idx].emoji,isFeast:false};
}

// Freemium
var FREE_LIMIT = 10;

function isPremium() {
  return localStorage.getItem('codex_premium') === 'true';
}

function getTodaySearches() {
  var today = new Date().toDateString();
  if (localStorage.getItem('codex_search_date') !== today) {
    localStorage.setItem('codex_search_date', today);
    localStorage.setItem('codex_daily', '0');
    return 0;
  }
  return parseInt(localStorage.getItem('codex_daily') || '0');
}

function checkSearchLimit() {
  if (isPremium()) return true;
  var count = getTodaySearches();
  if (count >= FREE_LIMIT) {
    showLimitOverlay();
    return false;
  }
  localStorage.setItem('codex_daily', (count + 1).toString());
  updateSearchCounter(count + 1);
  return true;
}

function updateSearchCounter(count) {
  var el = document.getElementById('counterText');
  var fill = document.getElementById('counterFill');
  var remaining = Math.max(0, FREE_LIMIT - count);
  if (el) el.textContent = remaining + '/' + FREE_LIMIT + ' 🔍';
  if (fill) fill.style.width = (remaining / FREE_LIMIT * 100) + '%';
  if (remaining <= 3 && remaining > 0) {
    var banner = document.getElementById('upgradeBanner');
    if (banner) banner.classList.add('show');
  }
}

function showLimitOverlay() {
  var el = document.getElementById('limitOverlay');
  if (el) el.style.display = 'flex';
}

function closeLimitOverlay() {
  var el = document.getElementById('limitOverlay');
  if (el) el.style.display = 'none';
}

// Init on load
window.addEventListener('DOMContentLoaded', function() {
  initTheme();
  updateSearchCounter(getTodaySearches());
  // Verset du jour
  var vdj = getLiturgicalDay();
  var vdjText = document.getElementById('vdjText');
  var vdjRef = document.getElementById('vdjRef');
  var vdjLabel = document.getElementById('vdjLabel');
  if (vdjText) vdjText.textContent = '"' + vdj.t + '"';
  if (vdjRef) vdjRef.textContent = vdj.r;
  if (vdjLabel) vdjLabel.textContent = vdj.emoji + ' ' + vdj.label.toUpperCase();
});
