content = open('index.html').read()

# Move auth modal BEFORE the script tag
# Extract the auth modal HTML
modal_html = '''
<!-- AUTH MODAL -->
<div class="modal-bg" id="authModal">
  <div class="modal">
    <button class="modal-close" onclick="closeAuth()">✕</button>
    <div style="text-align:center;font-size:2rem;margin-bottom:10px">✦</div>
    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchAuthTab(\'login\',this)">Se connecter</button>
      <button class="modal-tab" onclick="switchAuthTab(\'register\',this)">Créer un compte</button>
    </div>
    <div id="authLogin">
      <h2>Bon retour</h2>
      <p>Retrouvez vos études, notes et favoris</p>
      <input class="modal-input" type="email" id="loginEmail" placeholder="Email">
      <input class="modal-input" type="password" id="loginPwd" placeholder="Mot de passe" onkeydown="if(event.key===\'Enter\')doLogin()">
      <div class="modal-err" id="loginErr"></div>
      <div class="modal-ok" id="loginOk"></div>
      <button class="modal-btn" onclick="doLogin()">✦ Se connecter ✦</button>
      <button class="modal-btn secondary" onclick="doMagicLink()">📧 Connexion par email magique</button>
    </div>
    <div id="authRegister" style="display:none">
      <h2>Rejoindre Codex Dei</h2>
      <p>Créez votre espace biblique personnel</p>
      <input class="modal-input" type="text" id="regName" placeholder="Votre prénom">
      <input class="modal-input" type="email" id="regEmail" placeholder="Email">
      <input class="modal-input" type="password" id="regPwd" placeholder="Mot de passe (min. 6 caractères)" onkeydown="if(event.key===\'Enter\')doRegister()">
      <div class="modal-err" id="regErr"></div>
      <div class="modal-ok" id="regOk"></div>
      <button class="modal-btn" onclick="doRegister()">✦ Créer mon compte ✦</button>
    </div>
  </div>
</div>'''

# Place modal right after <body>
content = content.replace('<div class="bg-canvas"></div>', modal_html + '\n<div class="bg-canvas"></div>', 1)

open('index.html', 'w').write(content)
print('Done - modal moved to top of body')
print('authModal count:', content.count('id="authModal"'))
