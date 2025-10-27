(function(){
  const doc = document;
  const body = doc.body;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Runtime tunables
  let laserMode = 'sweep';
  let rainbowSpeed = 1.0; // multiplier for rainbow hue rotation
  let activeTab = 'themes';

  // Lights mode: default off; persist in localStorage
  const KEY = 'lights-mode';
  function applyMode(mode){
    body.classList.toggle('lights-on', mode === 'on');
    body.classList.toggle('lights-off', mode !== 'on');
    const btn = doc.getElementById('cp-lights');
    if (btn) btn.setAttribute('aria-pressed', String(mode === 'on'));
  }
  const saved = localStorage.getItem(KEY) || 'off';
  applyMode(saved);
  const toggle = doc.getElementById('cp-lights');
  if (toggle){
    toggle.addEventListener('click', function(){
      const next = body.classList.contains('lights-on') ? 'off' : 'on';
      localStorage.setItem(KEY, next);
      applyMode(next);
    });
  }

  // Control Panel wiring
  const CP = {
    theme: doc.getElementById('cp-theme'),
    a1: doc.getElementById('cp-accent1'),
    a2: doc.getElementById('cp-accent2'),
    a3: doc.getElementById('cp-accent3'),
    grid: doc.getElementById('cp-grid'),
    scan: doc.getElementById('cp-scan'),
    laser: doc.getElementById('cp-laser-mode'),
    rainbow: doc.getElementById('cp-rainbow-speed'),
    secLaser: doc.getElementById('cp-section-laser'),
    secRainbow: doc.getElementById('cp-section-rainbow'),
  bgColor: doc.getElementById('cp-bg-color'),
  bgBright: doc.getElementById('cp-bg-brightness'),
    presetBlue: doc.getElementById('cp-preset-blue'),
    presetViolet: doc.getElementById('cp-preset-violet'),
    presetMiami: doc.getElementById('cp-preset-miami'),
    presetAlien: doc.getElementById('cp-preset-alien'),
    presetAmber: doc.getElementById('cp-preset-amber'),
    presetSynth: doc.getElementById('cp-preset-synth'),
    presetRog: doc.getElementById('cp-preset-rog'),
    presetTealPurple: doc.getElementById('cp-preset-tealpurple'),
    reset: doc.getElementById('cp-reset'),
    tabs: Array.from(doc.querySelectorAll('.tab-button')),
    panes: Array.from(doc.querySelectorAll('.tab-pane')),
  };
  const STORE = 'cp-state-v1';
  const TAB_STORE = 'cp-tab-v1';
  function detectTheme(){
    for (const c of body.classList) if (c.startsWith('theme-')) return c.slice(6);
    return 'neon';
  }
  function state(){
    return {
      theme: detectTheme(),
      a1: getVar('--neon-blue'), a2: getVar('--neon-green'), a3: getVar('--neon-pink'),
      grid: parseInt(getVar('--grid-size') || '40', 10),
      scan: !body.classList.contains('scan-off'),
      laser: laserMode,
      rainbow: rainbowSpeed,
      bg: getVar('--bg-base') || '#05060a',
      bgl: parseInt((getVar('--bg-lighten') || '0%').replace('%',''), 10) || 0
    };
  }
  function load(){
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; }
  }
  function save(s){ localStorage.setItem(STORE, JSON.stringify(s)); }
  function setVar(name, val){ doc.documentElement.style.setProperty(name, val); }
  function getVar(name){ return getComputedStyle(doc.documentElement).getPropertyValue(name).trim(); }
  function applyTheme(theme){
    const classes = ['theme-neon','theme-matrix','theme-rainbow','theme-laser','theme-amber','theme-synthwave','theme-rog','theme-win98','theme-amiga','theme-mac'];
    for(const c of classes) body.classList.remove(c);
    body.classList.add('theme-' + (theme || 'neon'));
  }
  function setHidden(el, hidden){ if (!el) return; el.classList.toggle('is-hidden', !!hidden); }
  function updateCPVisibility(theme){
    const t = theme || detectTheme();
    setHidden(CP.secLaser, t !== 'laser');
    setHidden(CP.secRainbow, t !== 'rainbow');
  }
  function applyTab(tab){
    activeTab = tab || 'themes';
    for(const b of CP.tabs){
      const sel = (b.dataset.tab === activeTab);
      b.setAttribute('aria-selected', String(sel));
    }
    for(const p of CP.panes){
      const show = (p.dataset.tabPanel === activeTab);
      p.classList.toggle('is-hidden', !show);
      p.setAttribute('aria-hidden', String(!show));
    }
    try{ localStorage.setItem(TAB_STORE, activeTab); } catch{}
  }
  function apply(s){
    // theme
    applyTheme(s.theme);
    if (CP.theme) CP.theme.value = s.theme;
    updateCPVisibility(s.theme);
    // colors
    if (s.a1) setVar('--neon-blue', s.a1);
    if (s.a2) setVar('--neon-green', s.a2);
    if (s.a3) setVar('--neon-pink', s.a3);
    if (CP.a1) CP.a1.value = s.a1 || '#00ffff';
    if (CP.a2) CP.a2.value = s.a2 || '#00ff88';
    if (CP.a3) CP.a3.value = s.a3 || '#ff00ff';
    // grid
    const g = (s.grid && Number.isFinite(s.grid)) ? s.grid : 40;
    setVar('--grid-size', g + 'px');
    if (CP.grid) CP.grid.value = g;
    // scanlines
    body.classList.toggle('scan-off', s.scan === false);
    if (CP.scan) CP.scan.checked = (s.scan !== false);
    // laser mode
    laserMode = s.laser || 'sweep';
    if (CP.laser) CP.laser.value = laserMode;
    // rainbow speed
    rainbowSpeed = (typeof s.rainbow === 'number' && s.rainbow > 0) ? s.rainbow : 1.0;
    if (CP.rainbow) CP.rainbow.value = String(rainbowSpeed);
    // background
    if (s.bg) setVar('--bg-base', s.bg);
    const bgl = (typeof s.bgl === 'number' && s.bgl >= 0) ? s.bgl : 0;
    setVar('--bg-lighten', bgl + '%');
    if (CP.bgColor) CP.bgColor.value = s.bg || '#05060a';
    if (CP.bgBright) CP.bgBright.value = String(bgl);
  }
  const s0 = Object.assign({ theme: 'neon', a1:'#00ffff', a2:'#00ff88', a3:'#ff00ff', grid:40, scan:true, laser:'sweep', rainbow:1.0, bg:'#05060a', bgl:0 }, load());
  apply(s0);
  try{ activeTab = localStorage.getItem(TAB_STORE) || 'themes'; } catch{}
  applyTab(activeTab);
  function update(part){ const ns = Object.assign({}, state(), part); apply(ns); save(ns); }
  CP.theme && CP.theme.addEventListener('change', e => update({ theme: e.target.value }));
  CP.a1 && CP.a1.addEventListener('input', e => update({ a1: e.target.value }));
  CP.a2 && CP.a2.addEventListener('input', e => update({ a2: e.target.value }));
  CP.a3 && CP.a3.addEventListener('input', e => update({ a3: e.target.value }));
  CP.grid && CP.grid.addEventListener('input', e => update({ grid: parseInt(e.target.value,10) }));
  CP.scan && CP.scan.addEventListener('change', e => update({ scan: e.target.checked }));
  CP.laser && CP.laser.addEventListener('change', e => update({ laser: e.target.value }));
  CP.rainbow && CP.rainbow.addEventListener('input', e => update({ rainbow: parseFloat(e.target.value) }));
  CP.bgColor && CP.bgColor.addEventListener('input', e => update({ bg: e.target.value }));
  CP.bgBright && CP.bgBright.addEventListener('input', e => update({ bgl: parseInt(e.target.value,10) }));
  CP.presetBlue && CP.presetBlue.addEventListener('click', () => update({ a1:'#00ffff', a2:'#00ff88', a3:'#ff00ff' }));
  CP.presetViolet && CP.presetViolet.addEventListener('click', () => update({ a1:'#9b8cff', a2:'#ff7de9', a3:'#ff00ff' }));
  CP.presetMiami && CP.presetMiami.addEventListener('click', () => update({ a1:'#00e5ff', a2:'#ff00a8', a3:'#ff8a00' }));
  CP.presetAlien && CP.presetAlien.addEventListener('click', () => update({ a1:'#39ff14', a2:'#0ff', a3:'#a1ff0a' }));
  CP.presetAmber && CP.presetAmber.addEventListener('click', () => update({ theme:'amber', a1:'#ffbf3b', a2:'#ffb347', a3:'#ff8c00' }));
  CP.presetSynth && CP.presetSynth.addEventListener('click', () => update({ theme:'synthwave', a1:'#00eaff', a2:'#2af598', a3:'#ff3cac' }));
  CP.presetRog && CP.presetRog.addEventListener('click', () => update({ theme:'rog', a1:'#ff1133', a2:'#00e5ff', a3:'#ff2255' }));
  CP.presetTealPurple && CP.presetTealPurple.addEventListener('click', () => update({ a1:'#00ffd1', a2:'#7a00ff', a3:'#cc66ff' }));
  CP.reset && CP.reset.addEventListener('click', () => { localStorage.removeItem(STORE); apply({ theme:'neon', a1:'#00ffff', a2:'#00ff88', a3:'#ff00ff', grid:40, scan:true }); save(state()); });
  for (const b of CP.tabs){ b.addEventListener('click', () => applyTab(b.dataset.tab)); }

  // Matrix canvas animation (Anime Matrix theme)
  const canvas = doc.getElementById('matrix-canvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  let cw=0,ch=0, dpr=1, cols=0, rows=0;
  function resize(){
    if (!canvas || !ctx) return;
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    cw = canvas.clientWidth = window.innerWidth;
    ch = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(cw * dpr);
    canvas.height = Math.floor(ch * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cell = 10; // pixel size
    cols = Math.ceil(cw / cell);
    rows = Math.ceil(ch / cell);
  }
  resize(); window.addEventListener('resize', resize);

  function drawMatrix(now){
    if (!canvas || !ctx || !body.classList.contains('theme-matrix')) return;
    const strong = body.classList.contains('lights-on');
    const cell = 10;
    ctx.clearRect(0,0,cw,ch);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0,0,cw,ch);
    // draw dots
    for (let y=0; y<rows; y++){
      for (let x=0; x<cols; x++){
        // simple wave/random activation
        const v = (Math.sin((x+now/80)*0.5)+Math.cos((y+now/120)*0.7)) * 0.5 + Math.random()*0.3;
        if (v > 0.6){
          const a = strong ? 0.9 : 0.5;
          ctx.fillStyle = `rgba(0,255,136,${a})`;
          ctx.fillRect(x*cell+2, y*cell+2, 2, 2);
        }
      }
    }
  }

  // Laser canvas animation
  const lcanvas = doc.getElementById('laser-canvas');
  const lctx = lcanvas && lcanvas.getContext ? lcanvas.getContext('2d') : null;
  let lw=0, lh=0, ldpr=1;
  function resizeLaser(){
    if (!lcanvas || !lctx) return;
    ldpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    lw = lcanvas.clientWidth = window.innerWidth;
    lh = lcanvas.clientHeight = window.innerHeight;
    lcanvas.width = Math.floor(lw * ldpr);
    lcanvas.height = Math.floor(lh * ldpr);
    lctx.setTransform(ldpr,0,0,ldpr,0,0);
  }
  resizeLaser(); window.addEventListener('resize', resizeLaser);

  function drawLaser(now){
    if (!lcanvas || !lctx || !body.classList.contains('theme-laser')) return;
    const strong = body.classList.contains('lights-on');
    const base = getVar('--neon-green') || '#00ff88';
    const accent = getVar('--neon-blue') || '#00ffff';
    lctx.clearRect(0,0,lw,lh);
    // Only additive strokes, no veil
    lctx.globalCompositeOperation = 'screen';
    lctx.lineWidth = strong ? 2.2 : 1.4;
    lctx.shadowBlur = strong ? 16 : 6;
    lctx.shadowColor = base;

    const cx = lw/2, cy = lh/2;
    const t = now/1000;
    const A = Math.min(lh, lw) * (strong ? 0.25 : 0.18);

    function plot(fn, color){
      lctx.beginPath();
      lctx.strokeStyle = color;
      const steps = Math.max(400, Math.floor(lw/3));
      for(let i=0;i<=steps;i++){
        const x = (i/steps)*lw;
        const y = fn(i/steps, x, t);
        if (i===0) lctx.moveTo(x,y); else lctx.lineTo(x,y);
      }
      lctx.stroke();
    }

    switch(laserMode){
      case 'sine':
        plot((u,x,tt)=> cy + Math.sin((u*8 + tt*2))*A, base);
        break;
      case 'square':
        plot((u,x,tt)=> cy + (Math.sin((u*8 + tt*3))>0?1:-1)*A*0.7, base);
        break;
      case 'triangle':
        plot((u,x,tt)=> cy + (2/Math.PI)*Math.asin(Math.sin((u*8 + tt*3)*Math.PI))*A*0.7, base);
        break;
      case 'saw':
        plot((u,x,tt)=> cy + (2*( (u*6 + tt*2) % 1) - 1)*A*0.7, base);
        break;
      case 'lissajous': {
        // Parametric figure
        lctx.beginPath();
        lctx.strokeStyle = accent;
        const n = 800;
        for(let i=0;i<=n;i++){
          const a = i/n * Math.PI*2;
          const x = cx + Math.sin(3*a + t*2)*A;
          const y = cy + Math.sin(4*a + t*2 + Math.PI/3)*A;
          if (i===0) lctx.moveTo(x,y); else lctx.lineTo(x,y);
        }
        lctx.stroke();
        break;
      }
      case 'qam': {
        const pts = [-3,-1,1,3];
        lctx.fillStyle = base;
        for (const px of pts) for (const py of pts){
          const x = cx + px * (A/2);
          const y = cy + py * (A/2);
          lctx.beginPath();
          lctx.arc(x + Math.sin(t*2+px)*2, y + Math.cos(t*1.5+py)*2, strong?3:2, 0, Math.PI*2);
          lctx.fill();
        }
        break;
      }
      case 'eye': {
        const traces = strong ? 40 : 20;
        for (let k=0;k<traces;k++){
          const phase = (k/traces)*Math.PI*2 + t*0.5;
          plot((u,x)=> cy + Math.tanh(Math.sin((u*8 + phase))*2)*A*0.6, base);
        }
        break;
      }
      case 'fft': {
        const bars = 64;
        const bw = lw / bars;
        for(let i=0;i<bars;i++){
          const v = (Math.sin(t*3 + i*0.35)+1)/2; // 0..1
          const h = v * lh * (strong?0.6:0.4);
          lctx.fillStyle = i%2?base:accent;
          lctx.fillRect(i*bw, lh-h, bw*0.8, h);
        }
        break;
      }
      case 'sweep':
      default: {
        const w = Math.max(2, lw*0.01);
        const x = ( (now/1200) % 1) * (lw + w*2) - w;
        const grad = lctx.createLinearGradient(x, 0, x+w, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, base);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = grad;
        lctx.fillRect(x, 0, w, lh);
        break;
      }
    }

    lctx.globalCompositeOperation = 'source-over';
  }

  if (prefersReduced) return; // Respect motion preference after wiring panel

  // Glitch effect: jitter pseudo-layers on .glitch elements
  const glitchNodes = Array.from(doc.querySelectorAll('.glitch'));
  function hsl(h, s, l){ return `hsl(${(h%360+360)%360}, ${s}%, ${l}%)`; }
  function tick(){
    const t = performance.now();
    const strong = body.classList.contains('lights-on');
    for(const el of glitchNodes){
      const a = Math.sin(t/130 + el.offsetTop) * (strong ? 1.5 : 0.2);
      const b = Math.cos(t/170 + el.offsetLeft) * (strong ? 1.5 : 0.2);
      el.style.setProperty('--gx', a.toFixed(2)+'px');
      el.style.setProperty('--gy', b.toFixed(2)+'px');
      el.style.setProperty('--shadow-blue', `0 0 ${strong?10:0}px #00ffff, ${a}px ${b}px ${strong?24:0}px rgba(0,255,255,${strong?0.65:0})`);
      el.style.setProperty('--shadow-green', `${-a}px ${-b}px ${strong?8:0}px rgba(0,255,136,${strong?0.8:0})`);
    }
    // Rainbow: smoothly rotate accent hues
    if (body.classList.contains('theme-rainbow')){
      const base = (t/30) * rainbowSpeed % 360; // adjustable rotation
      setVar('--neon-blue', hsl(base+0, 100, 60));
      setVar('--neon-green', hsl(base+120, 100, 60));
      setVar('--neon-pink', hsl(base+240, 100, 60));
    }
    if (body.classList.contains('theme-matrix')){ drawMatrix(t); }
    if (body.classList.contains('theme-laser')){ drawLaser(t); }
    requestAnimationFrame(tick);
  }

  // Random flicker class toggles
  const flickerables = doc.querySelectorAll('.nav-link, .button, .card, .site-title');
  function flicker(){
    if (!body.classList.contains('lights-on')) { setTimeout(flicker, 1200); return; }
    const el = flickerables[Math.floor(Math.random()*flickerables.length)];
    if (el){
      el.classList.add('flick');
      setTimeout(()=>el.classList.remove('flick'), 120 + Math.random()*280);
    }
    setTimeout(flicker, 600 + Math.random()*1400);
  }

  // Start loops
  requestAnimationFrame(tick);
  setTimeout(flicker, 800);
})();
