content = open('index.html').read()

# Fix 1: loggedBar has display:none twice
content = content.replace(
    'style="display:none;align-items:center;gap:8px;display:none"',
    'style="display:none;align-items:center;gap:8px"'
)

# Fix 2: Force modal to always work
content = content.replace(
    '.modal-bg.open{display:flex !important;z-index:9999 !important}',
    '.modal-bg.open{display:flex;z-index:9999}'
)
content = content.replace(
    '.modal-bg.open{display:flex}',
    '.modal-bg.open{display:flex;z-index:9999}'
)

# Fix 3: Make modal higher than everything
content = content.replace(
    '.modal{background:var(--bg2);border:1px solid var(--border);padding:32px;width:100%;max-width:420px;position:relative;animation:fadeS .3s ease}',
    '.modal{background:var(--bg2);border:1px solid var(--border);padding:32px;width:90%;max-width:420px;position:relative;animation:fadeS .3s ease;z-index:10000}'
)

open('index.html', 'w').write(content)
print('Fixed:', content.count('display:none;align-items:center;gap:8px"'))
