// ═══ CODEX DEI — AUTH JS ═══
var currentUser = null;
var userToken = null;

// Init session on load
window.addEventListener('DOMContentLoaded', function() {
  var stored = localStorage.getItem('sb_session');
  if (stored) {
    try {
      var s = JSON.parse(stored);
      if (s.access_token && s.expires_at > Date.now()/1000) {
        userToken = s.access_token;
        currentUser = s.user;
        localStorage.setItem('sb_token', userToken);
        onLoggedIn();
      }
    } catch(e) {}
  }
  updateUserBar();
});

function openAuth() {
  var modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'flex';
}

function closeAuth() {
  var modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthTab(tab) {
  var login = document.getElementById('tabLogin');
  var reg = document.getElementById('tabRegister');
  var loginForm = document.getElementById('authLoginForm');
  var regForm = document.getElementById('authRegForm');
  if (tab === 'login') {
    if (login) { login.style.borderBottomColor = 'var(--gold2)'; login.style.color = 'var(--gold2)'; }
    if (reg) { reg.style.borderBottomColor = 'transparent'; reg.style.color = 'var(--text3)'; }
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
  } else {
    if (reg) { reg.style.borderBottomColor = 'var(--gold2)'; reg.style.color = 'var(--gold2)'; }
    if (login) { login.style.borderBottomColor = 'transparent'; login.style.color = 'var(--text3)'; }
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
  }
}

async function doLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pwd = document.getElementById('loginPwd').value;
  var err = document.getElementById('loginErr');
  var ok = document.getElementById('loginOk');
  if (!email || !pwd) { showMsg(err, 'Remplissez tous les champs.'); return; }
  try {
    var r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    var data = await r.json();
    if (data.error) { showMsg(err, 'Email ou mot de passe incorrect.'); return; }
    saveSession(data);
    closeAuth();
    onLoggedIn();
  } catch(e) { showMsg(err, 'Erreur de connexion.'); }
}

async function doRegister() {
  var name = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim();
  var pwd = document.getElementById('regPwd').value;
  var err = document.getElementById('regErr');
  var ok = document.getElementById('regOk');
  if (!email || !pwd) { showMsg(err, 'Remplissez tous les champs.'); return; }
  if (pwd.length < 6) { showMsg(err, 'Mot de passe minimum 6 caractères.'); return; }
  try {
    var r = await fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd, data: { name: name || 'Ami de la Parole' } })
    });
    var data = await r.json();
    if (data.error) { showMsg(err, 'Erreur inscription : ' + data.error_description); return; }
    if (data.access_token) {
      saveSession(data);
      closeAuth();
      onLoggedIn();
    } else {
      showMsg(ok, '✓ Compte créé ! Vérifiez votre email.');
    }
  } catch(e) { showMsg(err, 'Erreur de connexion.'); }
}

async function doMagicLink() {
  var email = document.getElementById('loginEmail').value.trim();
  var ok = document.getElementById('loginOk');
  var err = document.getElementById('loginErr');
  if (!email) { showMsg(err, 'Entrez votre email.'); return; }
  try {
    await fetch(SUPABASE_URL + '/auth/v1/magiclink', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    showMsg(ok, '✓ Lien envoyé ! Vérifiez votre boîte mail.');
  } catch(e) {}
}

function doLogout() {
  localStorage.removeItem('sb_session');
  localStorage.removeItem('sb_token');
  currentUser = null;
  userToken = null;
  updateUserBar();
  if (typeof onLoggedOut === 'function') onLoggedOut();
  else window.location.reload();
}

function saveSession(data) {
  userToken = data.access_token;
  currentUser = data.user;
  localStorage.setItem('sb_token', userToken);
  localStorage.setItem('sb_session', JSON.stringify({
    access_token: data.access_token,
    user: data.user,
    expires_at: Date.now()/1000 + (data.expires_in || 3600)
  }));
}

function onLoggedIn() {
  updateUserBar();
  if (typeof onUserLoggedIn === 'function') onUserLoggedIn();
}

function updateUserBar() {
  var guest = document.getElementById('guestBar');
  var logged = document.getElementById('loggedBar');
  var avatar = document.getElementById('userAvatar');
  if (currentUser) {
    var name = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '?';
    if (guest) guest.style.display = 'none';
    if (logged) logged.style.display = 'flex';
    if (avatar) { avatar.textContent = name[0].toUpperCase(); avatar.title = name; }
  } else {
    if (guest) guest.style.display = 'block';
    if (logged) logged.style.display = 'none';
  }
}

function showMsg(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// User DB helper
async function userDb(table, method, body, filters) {
  if (!userToken) return null;
  var url = SUPABASE_URL + '/rest/v1/' + table + (filters ? '?' + filters : '');
  var opts = {
    method: method || 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + userToken,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    }
  };
  if (body) opts.body = JSON.stringify(body);
  var r = await fetch(url, opts);
  if (!r.ok) throw new Error(await r.text());
  return method === 'DELETE' ? null : r.json();
}
