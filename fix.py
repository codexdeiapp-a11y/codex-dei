content = open('index.html').read()
content = content.replace(
    '.modal-bg.open{display:flex}',
    '.modal-bg.open{display:flex !important;z-index:9999 !important}'
)
content = content.replace(
    '.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:200;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px)}',
    '.modal-bg{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:none;align-items:center;justify-content:center;backdrop-filter:blur(8px)}'
)
open('index.html', 'w').write(content)
print('Done')
