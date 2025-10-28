(function(){
  const ui = {
    input: null,
    output: null,
    stats: null,
    runBtn: null,
    stopBtn: null,
    loadBtn: null,
    options: {},
    status: null,
    loader: null,
  };

  let ModuleFactory = null; // function to create a Module instance or promise-returning thunk
  let busy = false;

  function qs(id){ return document.getElementById(id); }
  function setStatus(msg){ if (ui.status) ui.status.textContent = msg || ''; }
  function appendOut(el, text){ el.textContent += text + "\n"; }
  function clear(el){ el.textContent = ''; }

  async function loadScript(src){
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = ()=> resolve();
      s.onerror = ()=> reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureCVC5Factory(){
    if (ModuleFactory) return ModuleFactory;
    // Attempt to load from assets/cvc5/cvc5.js
    const path = (window.__CVC5_JS_PATH__) || (window.__baseurl__ || '') + '/assets/cvc5/cvc5.js';
    try {
      // Prepare a global Module for non-modularized builds so we can capture IO
      // We use indirection via globals so per-run we can swap buffers.
      if (!window.__CVC5_OUT) window.__CVC5_OUT = [];
      if (!window.__CVC5_ERR) window.__CVC5_ERR = [];
      if (typeof window.Module === 'undefined') {
        window.Module = {
          noInitialRun: true,
          print: (txt)=> { (window.__CVC5_OUT || []).push(String(txt)); },
          printErr: (txt)=> { (window.__CVC5_ERR || []).push(String(txt)); },
          locateFile: (p)=> {
            if (p.endsWith('.wasm')) return (window.__CVC5_WASM_PATH__) || (window.__baseurl__ || '') + '/assets/cvc5/cvc5.wasm';
            return p;
          }
        };
      }
      await loadScript(path);
      // Case 1: MODULARIZE=true -> Module is a factory function
      if (typeof Module === 'function') { ModuleFactory = Module; return ModuleFactory; }
      // Case 2: Emscripten Promise export (Module is a Promise)
      if (Module && typeof Module === 'object' && typeof Module.then === 'function') {
        ModuleFactory = () => Module; // ignore per-call opts; IO is wired via globals above
        return ModuleFactory;
      }
      // Case 3: Global Module object (legacy)
      if (Module && typeof Module === 'object') {
        ModuleFactory = () => (Module.ready && typeof Module.ready.then === 'function') ? Module.ready.then(()=>Module) : Promise.resolve(Module);
        return ModuleFactory;
      }
    } catch (e){ console.warn(e); }
    throw new Error('cvc5.js not found. Place cvc5.js and cvc5.wasm under assets/cvc5/.');
  }

  function buildArgs(opts){
    const args = [];
    // language
    if (opts.lang && opts.lang !== 'auto') args.push('--lang=' + opts.lang);
    // logic
    if (opts.logic) args.push('--lang-exp', '--parse-only=false', '--logic=' + opts.logic);
    // produce models / unsats
    if (opts.models) args.push('--produce-models');
    if (opts.unsat) args.push('--produce-unsat-cores');
    // incremental
    if (opts.incr) args.push('--incremental');
    // time limit per query (ms)
    if (opts.tlimit && opts.tlimit > 0) args.push('--tlimit-per=' + parseInt(opts.tlimit,10));
    // random seed
    if (opts.seed) args.push('--seed=' + parseInt(opts.seed,10));
    // strings and bit-vectors expert flags
    if (opts.strExp) args.push('--strings-exp');
    if (opts.bvSat) args.push('--bv-sat-solver=' + opts.bvSat);
    // any extra flags
    if (opts.extra) {
      try {
        const extra = opts.extra.split(/\s+/).filter(Boolean);
        args.push(...extra);
      } catch {}
    }
    // input file path will be appended by the caller
    return args;
  }

  async function runCVC5(inputText, opts){
    const start = performance.now();
    clear(ui.output); clear(ui.stats);
    setStatus('Preparing...');
    // We support two shapes:
    // 1) Modularized factory (ModuleFactory is a function) -> instantiate with arguments and let it auto-run
    // 2) Non-modularized Promise Module -> reload the script with fresh Module options and let it auto-run

    const out = [];
    const err = [];
    window.__CVC5_OUT = out;
    window.__CVC5_ERR = err;

    // Prepare stdin fallback via prompt: supply entire input once, then EOF
    const originalPrompt = window.prompt;
    let served = false;
    window.prompt = () => {
      if (served) return '';
      served = true;
      return inputText;
    };

    const args = buildArgs(opts);
    // Default to stdin to avoid relying on FS exposure
    args.push('-');

    function locateFile(p){
      if (p.endsWith('.wasm')) return (window.__CVC5_WASM_PATH__) || (window.__baseurl__ || '') + '/assets/cvc5/cvc5.wasm';
      return p;
    }

    function finish(code){
      const dt = (performance.now() - start).toFixed(1);
      appendOut(ui.output, out.join('\n'));
      if (err.length) appendOut(ui.output, '\n[stderr]\n' + err.join('\n'));
      ui.stats.textContent = 'Exit code: ' + code + '\nTime: ' + dt + ' ms\nArgs: ' + JSON.stringify(args);
      // Restore prompt and UI state
      window.prompt = originalPrompt;
      setStatus('Ready');
      busy = false;
      ui.runBtn.disabled = false;
      return { code, out, err, dt, args };
    }

    const factory = await ensureCVC5Factory();
    setStatus('Solving...');

    return new Promise((resolve, reject)=>{
      const baseurl = (window.__baseurl__ || '');
      const srcBase = (window.__CVC5_JS_PATH__) || (baseurl + '/assets/cvc5/cvc5.js');
      if (typeof factory === 'function') {
        // Modularized: create a fresh instance configured to auto-run with our args
        try {
          factory({
            noInitialRun: false,
            noExitRuntime: false,
            arguments: args,
            print: (txt)=> out.push(String(txt)),
            printErr: (txt)=> err.push(String(txt)),
            locateFile,
            onExit: (code)=> resolve(finish(code ?? 0)),
          }).catch((e)=>{
            appendOut(ui.output, 'Exception: ' + e.message);
            resolve(finish(-1));
          });
        } catch(e){
          appendOut(ui.output, 'Exception: ' + e.message);
          resolve(finish(-1));
        }
      } else {
        // Non-modularized: reload the script with fresh Module options and let it auto-run
        try {
          window.Module = {
            noInitialRun: false,
            noExitRuntime: false,
            arguments: args,
            print: (txt)=> out.push(String(txt)),
            printErr: (txt)=> err.push(String(txt)),
            locateFile,
            onExit: (code)=> resolve(finish(code ?? 0)),
          };
          // Cache-bust to force reload and new run
          const s = document.createElement('script');
          s.src = srcBase + (srcBase.includes('?') ? '&' : '?') + 'run=' + Date.now();
          s.async = true;
          s.onerror = ()=>{
            appendOut(ui.output, 'Failed to load cvc5.js');
            resolve(finish(-1));
          };
          document.head.appendChild(s);
        } catch(e){
          appendOut(ui.output, 'Exception: ' + e.message);
          resolve(finish(-1));
        }
      }
    });
  }

  function getOptions(){
    return {
      lang: qs('cvc5-lang').value, // auto|smt2|sygus2
      logic: qs('cvc5-logic').value.trim(),
      models: qs('cvc5-models').checked,
      unsat: qs('cvc5-unsat').checked,
      incr: qs('cvc5-incremental').checked,
      tlimit: parseInt(qs('cvc5-timeout').value, 10) || 0,
      seed: parseInt(qs('cvc5-seed').value, 10) || 0,
      strExp: qs('cvc5-strings-exp').checked,
      bvSat: qs('cvc5-bv-sat').value,
      extra: qs('cvc5-extra').value.trim(),
    };
  }

  function loadExample(kind){
    const SMT_EX = `(set-logic QF_BV)
(declare-fun a () (_ BitVec 8))
(declare-fun b () (_ BitVec 8))
(assert (= (bvadd a b) #x2a))
(check-sat)
(get-model)`;
    const SY_EX = `(set-logic LIA)
(synth-fun f ((x Int) (y Int)) Int
  ((Start Int (x y 0 1 (+ Start Start) (- Start) (ite StartBool Start Start)))
   (StartBool Bool ((<= Start Start) (= Start Start)))) )
(constraint (= (f 0 0) 0))
(constraint (= (f 1 0) 1))
(constraint (= (f 0 1) 1))
(check-synth)`;
    ui.input.value = (kind === 'sygus') ? SY_EX : SMT_EX;
    if (kind === 'sygus') qs('cvc5-lang').value = 'sygus2';
  }

  function wire(){
    ui.input = qs('cvc5-input');
    ui.output = qs('cvc5-output');
    ui.stats = qs('cvc5-stats');
    ui.runBtn = qs('cvc5-run');
    ui.stopBtn = qs('cvc5-stop');
    ui.loadBtn = qs('cvc5-load');
    ui.status = qs('cvc5-status');

    // baseurl from Jekyll
    try { window.__baseurl__ = document.querySelector('link[rel="icon"]').href.replace(/\/assets.*$/, ''); } catch {}

    ui.runBtn.addEventListener('click', async ()=>{
      if (busy) return; busy = true; ui.runBtn.disabled = true; setStatus('Loading cvc5...');
      const text = ui.input.value;
      const opts = getOptions();
      await runCVC5(text, opts);
    });
    ui.loadBtn.addEventListener('click', ()=>{
      const k = qs('cvc5-example').value;
      loadExample(k);
    });
    // file upload
    const up = qs('cvc5-file');
    up.addEventListener('change', async ()=>{
      const f = up.files && up.files[0]; if (!f) return;
      const text = await f.text(); ui.input.value = text;
    });
    // download output
    qs('cvc5-dl-out').addEventListener('click', ()=>{
      const blob = new Blob([ui.output.textContent || ''], {type:'text/plain'});
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='cvc5-output.txt'; a.click();
    });
    // clear
    qs('cvc5-clear').addEventListener('click', ()=>{ ui.input.value=''; clear(ui.output); clear(ui.stats); });

    setStatus('Ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
