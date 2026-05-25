content = open('index.html').read()

# Check how many authModal we have
print("authModal count:", content.count('id="authModal"'))

# Remove all existing auth modals
import re
content = re.sub(r'<!-- AUTH MODAL -->.*?</div>\s*\n\s*\n', '', content, flags=re.DOTALL)
print("After cleanup:", content.count('id="authModal"'))

# Add ONE clean modal right after <body> opening
new_modal = """
<div id="authModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:none;align-items:center;justify-content:center">
  <div style="background:#141009;border:1px solid #d4a017;padding:32px;width:90%;max-width:400px;position:relative;max-height:90vh;overflow-y:auto">
    <button onclick="document.getElementById('authModal').style.display='none'" style="position:absolute;top:12px;right:16px;background:transparent;border:none;color:#6a5838;font-size:1.3rem;cursor:pointer">✕</button>
    <div style="text-align:center;font-size:2rem;margin-bottom:10px">✦</div>
    <div style="display:flex;gap:2px;margin-bottom:20px;border-bottom:1px solid rgba(184,134,11,0.2)">
      <button id="tabLogin" onclick="document.getElementById('authLogin').style.display='block';document.getElementById('authRegister').style.display='none'" style="flex:1;background:transparent;border:none;border-bottom:2px solid #d4a017;color:#d4a017;padding:8px;font-family:serif;font-size:.95rem;cursor:pointer">Se connecter</button>
      <button id="tabReg" onclick="document.getElementById('authRegister').style.display='block';document.getElementById('authLogin').style.display='none'" style="flex:1;background:transparent;border:none;border-bottom:2px solid transparent;color:#6a5838;padding:8px;font-family:serif;font-size:.95rem;cursor:pointer">Créer un compte</button>
    </div>
    <div id="authLogin">
      <div style="font-family:Cinzel,serif;color:#d4a017;font-size:1.1rem;text-align:center;margin-bottom:6px">Bon retour</div>
      <p style="color:#6a5838;font-style:italic;font-size:.9rem;text-align:center;margin-bottom:16px">Retrouvez vos études et favoris</p>
      <input id="loginEmail" type="email" placeholder="Email" style="width:100%;background:#0c0a07;border:1px solid rgba(184,134,11,0.3);color:#e8dcc8;font-size:1rem;padding:11px 14px;outline:none;margin-bottom:10px;box-sizing:border-box">
      <input id="loginPwd" type="password" placeholder="Mot de passe" style="width:100%;background:#0c0a07;border:1px solid rgba(184,134,11,0.3);color:#e8dcc8;font-size:1rem;padding:11px 14px;outline:none;margin-bottom:10px;box-sizing:border-box" onkeydown="if(event.key==='Enter')doLogin()">
      <div id="loginErr" style="color:#e08070;font-size:.85rem;margin-bottom:8px;display:none"></div>
      <div id="loginOk" style="color:#d4a017;font-size:.85rem;margin-bottom:8px;display:none"></div>
      <button onclick="doLogin()" style="width:100%;background:linear-gradient(135deg,#8b6914,#d4a017);color:#0c0a07;border:none;padding:13px;font-family:Cinzel,serif;font-size:.9rem;font-weight:600;letter-spacing:2px;cursor:pointer;margin-bottom:8px">✦ Se connecter ✦</button>
      <button onclick="doMagicLink()" style="width:100%;background:transparent;border:1px solid rgba(184,134,11,0.3);color:#a89878;padding:11px;font-family:serif;font-size:.9rem;cursor:pointer">📧 Lien magique par email</button>
    </div>
    <div id="authRegister" style="display:none">
      <div style="font-family:Cinzel,serif;color:#d4a017;font-size:1.1rem;text-align:center;margin-bottom:6px">Créer un compte</div>
      <p style="color:#6a5838;font-style:italic;font-size:.9rem;text-align:center;margin-bottom:16px">Votre espace biblique personnel</p>
      <input id="regName" type="text" placeholder="Votre prénom" style="width:100%;background:#0c0a07;border:1px solid rgba(184,134,11,0.3);color:#e8dcc8;font-size:1rem;padding:11px 14px;outline:none;margin-bottom:10px;box-sizing:border-box">
      <input id="regEmail" type="email" placeholder="Email" style="width:100%;background:#0c0a07;border:1px solid rgba(184,134,11,0.3);color:#e8dcc8;font-size:1rem;padding:11px 14px;outline:none;margin-bottom:10px;box-sizing:border-box">
      <input id="regPwd" type="password" placeholder="Mot de passe (min. 6 caractères)" style="width:100%;background:#0c0a07;border:1px solid rgba(184,134,11,0.3);color:#e8dcc8;font-size:1rem;padding:11px 14px;outline:none;margin-bottom:10px;box-sizing:border-box" onkeydown="if(event.key==='Enter')doRegister()">
      <div id="regErr" style="color:#e08070;font-size:.85rem;margin-bottom:8px;display:none"></div>
      <div id="regOk" style="color:#d4a017;font-size:.85rem;margin-bottom:8px;display:none"></div>
      <button onclick="doRegister()" style="width:100%;background:linear-gradient(135deg,#8b6914,#d4a017);color:#0c0a07;border:none;padding:13px;font-family:Cinzel,serif;font-size:.9rem;font-weight:600;letter-spacing:2px;cursor:pointer">✦ Créer mon compte ✦</button>
    </div>
  </div>
</div>
"""

content = content.replace('<div class="bg-canvas"></div>', new_modal + '\n<div class="bg-canvas"></div>', 1)

# Fix openAuth to use inline style
content = content.replace(
    "function openAuth() { \n  const m = document.getElementById('authModal');\n  if(m) m.classList.add('open'); \n}",
    "function openAuth() { var m=document.getElementById('authModal'); if(m){m.style.display='flex';} }"
)
content = content.replace(
    "function closeAuth() { document.getElementById('authModal').classList.remove('open'); }",
    "function closeAuth() { var m=document.getElementById('authModal'); if(m) m.style.display='none'; }"
)

open('index.html', 'w').write(content)
print("Final authModal count:", content.count('id="authModal"'))
print("openAuth fixed:", "m.style.display='flex'" in content)
