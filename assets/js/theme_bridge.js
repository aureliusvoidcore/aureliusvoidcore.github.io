(function(){
  const root = document.documentElement;
  const themes = [
    'minimal','alien-xmas','neon','matrix','rainbow','laser','amber','synthwave','rog','win98','amiga','mac','doom'
  ];

  function safeParse(json){
    try{ return JSON.parse(json || '{}') || {}; }catch{ return {}; }
  }

  function loadState(){
    // Prefer newest, fall back to older keys.
    return (
      safeParse(localStorage.getItem('cp-state-v2')) ||
      safeParse(localStorage.getItem('cp-state-v1')) ||
      {}
    );
  }

  function setVar(name, val){
    if (val == null) return;
    root.style.setProperty(name, String(val));
  }

  function applyThemeClass(theme){
    const t = themes.includes(theme) ? theme : 'minimal';
    for (const name of themes){
      root.classList.remove('theme-' + name);
      if (document.body) document.body.classList.remove('theme-' + name);
    }
    root.classList.add('theme-' + t);
    if (document.body) document.body.classList.add('theme-' + t);

    // Keep CRT background off for minimal.
    if (t === 'minimal'){
      root.classList.remove('crt-bg');
      if (document.body) document.body.classList.remove('crt-bg');
    } else {
      if (document.body) document.body.classList.add('crt-bg');
    }
  }

  function applyStateToVars(s){
    // Mirror the main site behavior for consistency
    if (s.a1) setVar('--neon-blue', s.a1);
    if (s.a2) setVar('--neon-green', s.a2);
    if (s.a3) setVar('--neon-pink', s.a3);
    if (s.bg) setVar('--bg-base', s.bg);
    if (typeof s.bgl === 'number') setVar('--bg-lighten', s.bgl + '%');
    if (typeof s.grid === 'number') setVar('--grid-size', s.grid + 'px');
  }

  function run(){
    const s = loadState();
    const theme = s.theme || 'minimal';
    applyThemeClass(theme);
    applyStateToVars(s);
  }

  // Apply ASAP, and again once body exists.
  run();
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, { once: true });
  }
})();
