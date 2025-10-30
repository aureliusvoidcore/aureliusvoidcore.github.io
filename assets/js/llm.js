// Simple browser LLM chat using transformers.js (CPU/WASM backend)
// Notes:
// - Defaults to a small, CPU-friendly model to keep downloads reasonable.
// - You can change model IDs in the UI. Models are fetched from Hugging Face directly.
// - All inference happens on the user's machine (browser). No server compute.

// ESM import is added from HTML via <script type="module" src=".../llm.js"></script>
// Here we dynamically import transformers.js to allow Jekyll to serve a static file.

const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6';

/**
 * Prompt templates and helpers
 */
const DEFAULT_SYSTEM_PROMPT = `You are a formal verification agent.
You can use local tools available in this browser environment:
- abc: logic synthesis/cec. Call by outputting JSON like {"reason":"<brief why>","tool":"abc","args":"cec -n net1.aig net2.aig"}.
- sygus: syntax-guided synthesis via cvc5. Call by outputting JSON like {"reason":"<brief why>","tool":"sygus","args":"(set-logic ... ) ..."} where args is a full SyGuS2 input.
When you finish, provide {"final":"...","reason":"<brief why>"}. Keep reasoning brief (1-2 sentences). If unsure, say you don't know.`;

function buildPrompt(history, userInput, mode) {
  // Keep the prompt short for small models.
  // mode: 'text2text' (e.g., T5) or 'causal' (e.g., TinyLlama/Mistral)
  const lastFew = history.slice(-4);
  const context = lastFew.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  if (mode === 'text2text') {
    // Keep it simple for instruction-tuned text2text models (e.g., T5)
    // Avoid special role tokens that can confuse smaller models.
    return `${DEFAULT_SYSTEM_PROMPT}\n\nTask: ${userInput}\nAnswer:`;
  }
  // causal LM
  return `${DEFAULT_SYSTEM_PROMPT}\n\n${context}\n\nUSER: ${userInput}\nASSISTANT:`;
}

/**
 * UI State
 */
const state = {
  pipe: null,
  modelId: 'Xenova/Phi-3-mini-4k-instruct', // strong small-chat model compatible with transformers.js
  task: 'text-generation',
  dtype: 'q4', // better balance for CPU
  generating: false,
  history: [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }],
  debug: false,
  showReasoning: false,
  engine: 'wasm',
  maxTokens: 128,
  fast: false,
};

/**
 * DOM helpers
 */
function $id(id) { return document.getElementById(id); }
function appendMessage(role, content) {
  const container = $id('llm-messages');
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.textContent = content;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function setBusy(busy) {
  state.generating = busy;
  $id('llm-send').disabled = busy;
  $id('llm-stop').disabled = !busy;
  $id('llm-model').disabled = busy;
  $id('llm-dtype').disabled = busy;
  $id('llm-task').disabled = busy;
  $id('llm-status').textContent = busy ? 'Running on CPU (WASM)…' : 'Idle (CPU/WASM)';
}

function logLine(msg) {
  if (!state.debug) return;
  const pre = $id('llm-logs');
  if (!pre) return;
  const ts = new Date().toISOString().split('T')[1].replace('Z','');
  pre.textContent += `[${ts}] ${msg}\n`;
  pre.scrollTop = pre.scrollHeight;
}

function setRawOutput(text) {
  const pre = $id('llm-raw');
  if (!pre) return;
  pre.textContent = text || '';
}

/**
 * Load transformers.js and initialize pipeline lazily
 */
async function ensurePipeline() {
  const wantedModel = $id('llm-model').value.trim();
  let wantedTask = $id('llm-task').value;
  const wantedDtype = $id('llm-dtype').value;
  const engine = ($id('llm-engine')?.value || state.engine);

  // Enforce sane task for selected model to avoid API mismatches
  if (/LaMini-Flan-T5/i.test(wantedModel)) {
    if (wantedTask !== 'text2text-generation') {
      wantedTask = 'text2text-generation';
      $id('llm-task').value = wantedTask;
    }
  } else {
    if (wantedTask !== 'text-generation') {
      wantedTask = 'text-generation';
      $id('llm-task').value = wantedTask;
    }
  }

  if (state.pipe && state.modelId === wantedModel && state.task === wantedTask && state.dtype === wantedDtype) {
    return state.pipe;
  }

  setBusy(true);
  $id('llm-status').textContent = 'Loading model… (downloads cached in browser)';
  logLine(`Loading model: ${wantedModel} [${wantedTask}, ${wantedDtype}]`);
  const t0 = performance.now();

  try {
    // dynamic ESM import
    const { pipeline, env } = await import(TRANSFORMERS_CDN);

    // Force CPU/WASM backend defaults; allow remote models
    env.allowRemoteModels = true;
    env.useBrowserCache = true;
    // Configure ONNX Runtime Web behavior
    const coi = (typeof crossOriginIsolated !== 'undefined') ? crossOriginIsolated : false;
    env.backends = env.backends || {};
    env.backends.onnx = env.backends.onnx || {};
    env.backends.onnx.wasm = env.backends.onnx.wasm || {};
    env.backends.onnx.wasm.simd = true;
    env.backends.onnx.wasm.proxy = 'none';
    // Without cross-origin isolation (typical on GitHub Pages), avoid multithreading to prevent Aborted()
    env.backends.onnx.wasm.numThreads = coi ? Math.max(2, Math.min(4, (navigator.hardwareConcurrency || 4))) : 1;
    if (!coi) logLine('crossOriginIsolated=false: using single-threaded WASM. Consider WebGPU engine for speed.');

    // Build pipeline
    const device = (engine === 'webgpu' && 'gpu' in navigator) ? 'webgpu' : 'wasm';
    if (engine === 'webgpu' && device !== 'webgpu') {
      logLine('WebGPU not available; falling back to WASM.');
    }
    const pipe = await pipeline(wantedTask, wantedModel, {
      device,
      dtype: wantedDtype,
      quantized: wantedDtype && wantedDtype.startsWith('q') ? true : undefined,
    });

    state.pipe = pipe;
    state.modelId = wantedModel;
    state.task = wantedTask;
    state.dtype = wantedDtype;
  state.engine = engine;
    $id('llm-status').textContent = `Loaded: ${wantedModel} [${wantedTask}, ${wantedDtype}]`;
    const dt = ((performance.now() - t0)/1000).toFixed(2);
    logLine(`Model loaded in ${dt}s`);
    return pipe;
  } catch (err) {
    console.error(err);
    const msg = String(err?.message || err);
    logLine(`Load error: ${msg}`);
    async function tryFallbackChain(primaryList) {
      for (const mid of primaryList) {
        if (!mid || mid === wantedModel) continue;
        try {
          $id('llm-model').value = mid;
          const { pipeline: pX } = await import(TRANSFORMERS_CDN);
          const pipeX = await pX(wantedTask, mid, { dtype: wantedDtype, quantized: wantedDtype?.startsWith('q') || undefined });
          state.pipe = pipeX;
          state.modelId = mid;
          state.task = wantedTask;
          state.dtype = wantedDtype;
          $id('llm-status').textContent = `Loaded fallback: ${mid} [${wantedTask}, ${wantedDtype}]`;
          logLine(`Fallback succeeded: ${mid}`);
          return pipeX;
        } catch (eX) {
          console.warn('Fallback attempt failed for', mid, eX);
          logLine(`Fallback failed: ${mid} -> ${String(eX?.message || eX)}`);
        }
      }
      throw err;
    }
    if (msg.includes('Unauthorized') || msg.includes('401')) {
      $id('llm-status').textContent = 'This model is gated or private on Hugging Face (401). Please choose a public model.';
      const chain = wantedTask === 'text2text-generation'
        ? ['Xenova/LaMini-Flan-T5-248M']
        : ['Xenova/Phi-3-mini-4k-instruct', 'Xenova/Qwen2.5-Coder-1.5B-Instruct', 'Xenova/LaMini-Flan-T5-248M'];
      return await tryFallbackChain(chain);
    } else if (msg.includes('Not Found') || msg.includes('404')) {
      $id('llm-status').textContent = 'Model files not found (404). The model may not be available for transformers.js.';
      const chain = wantedTask === 'text2text-generation'
        ? ['Xenova/LaMini-Flan-T5-248M']
        : ['Xenova/Phi-3-mini-4k-instruct', 'Xenova/Qwen2.5-Coder-1.5B-Instruct', 'Xenova/LaMini-Flan-T5-248M'];
      return await tryFallbackChain(chain);
    } else if (msg.includes('Unsupported model type')) {
      $id('llm-status').textContent = 'Unsupported architecture for this task. Switching to a supported small public model…';
      const chain = wantedTask === 'text2text-generation'
        ? ['Xenova/LaMini-Flan-T5-248M']
        : ['Xenova/Phi-3-mini-4k-instruct', 'Xenova/Qwen2.5-Coder-1.5B-Instruct', 'Xenova/LaMini-Flan-T5-248M'];
      return await tryFallbackChain(chain);
    } else {
      $id('llm-status').textContent = 'Failed to load model.';
    }
    throw err;
  } finally {
    setBusy(false);
  }
}

// Agent: try to parse a JSON object in text and return parsed or null
function tryParseFirstJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    return obj && typeof obj === 'object' ? obj : null;
  } catch { return null; }
}

async function generateOnce(input) {
  const pipe = await ensurePipeline();
  const isText2Text = state.task === 'text2text-generation';
  const genOpts = {
    max_new_tokens: Math.max(32, Math.min(1024, Number($id('llm-max-tokens')?.value || state.maxTokens))),
    temperature: 0.1, // more deterministic for tool calling
    repetition_penalty: 1.05,
    top_k: state.fast ? 10 : 40,
    top_p: state.fast ? 0.7 : 0.9,
    do_sample: false,
  };

  setBusy(true);
  try {
    const t0 = performance.now();
    // Prefer chat-style messages for modern instruct models (e.g., Phi-3)
    if (!isText2Text) {
      const messages = state.history.concat([{ role: 'user', content: input }]);
      const out = await pipe(messages, genOpts);
      // For chat models, generated_text is an array of messages
      const last = Array.isArray(out) ? out[0]?.generated_text?.at(-1) : null;
      const text = (last && last.content) ? last.content : (Array.isArray(out) ? out[0]?.generated_text ?? '' : String(out));
      setRawOutput(typeof out === 'string' ? out : JSON.stringify(out, null, 2));
      const dt = ((performance.now() - t0)/1000).toFixed(2);
      logLine(`Generation finished in ${dt}s (chat)`);
      return (text || '').trim();
    }
    // Text2Text fallback
    const mode = 'text2text';
    const prompt = buildPrompt(state.history, input, mode);
    const out = await pipe(prompt, genOpts);
    const text = Array.isArray(out) ? out[0]?.generated_text ?? '' : String(out);
    setRawOutput(typeof out === 'string' ? out : JSON.stringify(out, null, 2));
    const dt = ((performance.now() - t0)/1000).toFixed(2);
    logLine(`Generation finished in ${dt}s (text2text)`);
    return text.trim();
  } finally {
    setBusy(false);
  }
}

async function onSend() {
  const inputEl = $id('llm-input');
  const text = inputEl.value.trim();
  if (!text || state.generating) return;

  state.history.push({ role: 'user', content: text });
  appendMessage('user', text);
  inputEl.value = '';

  appendMessage('assistant', '…');
  const container = $id('llm-messages');
  const lastAssistant = container.lastElementChild;

  try {
    let reply = await generateOnce(text);
    // Agent step: look for tool call JSON
    let toolObj = tryParseFirstJSON(reply);
    if (toolObj && toolObj.tool && typeof toolObj.tool === 'string') {
      if (state.showReasoning && toolObj.reason) {
        appendMessage('assistant', `(reason) ${String(toolObj.reason)}`);
      }
      const tool = toolObj.tool.toLowerCase();
      const args = String(toolObj.args || '').trim();
      const toolResult = await runTool(tool, args);
      // Append tool result and ask model to finalize
      state.history.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);
      const follow = `Tool Result (from ${tool}):\n${toolResult || '(no output)'}\nPlease provide a final concise answer as {"final": "..."}.`;
      state.history.push({ role: 'user', content: follow });
      appendMessage('user', follow);
      const finalReply = await generateOnce('Provide final answer.');
      reply = finalReply || reply;
      // Try to parse final with reason/final
      const finObj = tryParseFirstJSON(reply);
      if (finObj) {
        if (state.showReasoning && finObj.reason) appendMessage('assistant', `(reason) ${String(finObj.reason)}`);
        if (finObj.final) reply = String(finObj.final);
      }
    }
    state.history.push({ role: 'assistant', content: reply });
    lastAssistant.textContent = reply || '(no output)';
  } catch (err) {
    lastAssistant.textContent = 'Error during generation (see console).';
    logLine(`Generation error: ${String(err?.message || err)}`);
  }
}

function onStop() {
  // Simple logical cancel: we can ignore the next result; no true abort for WASM compute.
  // For a full abort, transformers.js would need cooperative cancellation support.
  $id('llm-status').textContent = 'Cancel requested (will stop after current token batch).';
}

function installUI() {
  // Pre-fill defaults
  $id('llm-model').value = state.modelId;
  $id('llm-task').value = state.task;
  $id('llm-dtype').value = state.dtype;
  $id('llm-engine') && ($id('llm-engine').value = state.engine);
  $id('llm-max-tokens') && ($id('llm-max-tokens').value = String(state.maxTokens));
  $id('llm-fast') && ($id('llm-fast').checked = state.fast);
  $id('llm-debug') && ($id('llm-debug').checked = state.debug);
  $id('llm-show-reasoning') && ($id('llm-show-reasoning').checked = state.showReasoning);

  $id('llm-send').addEventListener('click', onSend);
  $id('llm-stop').addEventListener('click', onStop);
  $id('llm-input').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSend();
    }
  });
  $id('llm-debug')?.addEventListener('change', (e) => {
    state.debug = !!e.target.checked;
    logLine(`Debug ${state.debug ? 'enabled' : 'disabled'}`);
  });
  $id('llm-show-reasoning')?.addEventListener('change', (e) => {
    state.showReasoning = !!e.target.checked;
    logLine(`Show reasoning ${state.showReasoning ? 'enabled' : 'disabled'}`);
  });
  $id('llm-engine')?.addEventListener('change', () => { state.engine = $id('llm-engine').value; state.pipe = null; });
  $id('llm-max-tokens')?.addEventListener('change', () => { state.maxTokens = Number($id('llm-max-tokens').value) || 128; });
  $id('llm-fast')?.addEventListener('change', (e) => { state.fast = !!e.target.checked; });

  // Auto-adjust task based on known models to reduce user errors
  $id('llm-model').addEventListener('change', () => {
    const m = $id('llm-model').value;
    if (m.includes('LaMini-Flan-T5')) {
      $id('llm-task').value = 'text2text-generation';
    } else if (/phi-3/i.test(m)) {
      $id('llm-task').value = 'text-generation';
    } else if (/qwen2\.5/i.test(m)) {
      $id('llm-task').value = 'text-generation';
    }
  });

  // Preload in background to reduce first-token latency
  setTimeout(() => { ensurePipeline().catch(()=>{}); }, 0);
}

// --- Tool Integration ---
let abcWrapper = null;
let cvc5Ready = false;

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

async function ensureABC() {
  if (abcWrapper) return abcWrapper;
  await loadScript('/abc_build/abc.js');
  await loadScript('/abc_build/abc-wrapper.js');
  if (!window.ABCWrapper || typeof createABCModule === 'undefined') {
    throw new Error('ABC wasm not available');
  }
  const w = new window.ABCWrapper();
  await w.initialize();
  abcWrapper = w;
  return abcWrapper;
}

async function runTool(tool, args) {
  try {
    if (tool === 'abc') {
      const w = await ensureABC();
      const res = w.executeCommand(args || 'help');
      return (res && (res.output || res.error)) || '';
    }
    if (tool === 'sygus') {
      const out = await runSyGuS(args || '');
      return out || '';
    }
    return `Unknown tool: ${tool}`;
  } catch (e) {
    return `Tool error (${tool}): ${e.message}`;
  }
}

async function ensureCVC5() {
  if (cvc5Ready) return;
  // No-op; we load on each run with provided Module options.
  cvc5Ready = true;
}

async function runSyGuS(source) {
  await ensureCVC5();
  const base = '/assets/cvc5/cvc5.js';
  const wasm = '/assets/cvc5/cvc5.wasm';
  const out = [];
  const err = [];
  const outChars = [];
  const errChars = [];
  const enc = new TextEncoder();
  const bytes = enc.encode(source.endsWith('\n') ? source : (source + '\n'));
  let idx = 0;
  function stdin(){ if (idx >= bytes.length) return null; return bytes[idx++]; }
  function locateFile(p){ if (p.endsWith('.wasm')) return wasm; return p; }

  await loadScript(base);
  // Handle different Emscripten export shapes
  if (typeof window.Module === 'function') {
    await window.Module({
      noInitialRun: false,
      noExitRuntime: false,
      arguments: ['--lang=sygus2', '--stats', '-'],
      print: (t)=> out.push(String(t)),
      printErr: (t)=> err.push(String(t)),
      stdin,
      stdout: (ch)=> outChars.push(ch & 0xff),
      stderr: (ch)=> errChars.push(ch & 0xff),
      locateFile,
    });
  } else if (window.Module && typeof window.Module.then === 'function') {
    const M = await window.Module;
    if (M && M.callMain) {
      M.FS.init(stdin, (ch)=>outChars.push(ch & 0xff), (ch)=>errChars.push(ch & 0xff));
      M.callMain(['--lang=sygus2', '--stats', '-']);
    }
  } else if (window.Module && typeof window.Module === 'object') {
    // Recreate Module config and load script again for a fresh run
    window.Module = {
      noInitialRun: false,
      noExitRuntime: false,
      arguments: ['--lang=sygus2', '--stats', '-'],
      print: (t)=> out.push(String(t)),
      printErr: (t)=> err.push(String(t)),
      stdin,
      stdout: (ch)=> outChars.push(ch & 0xff),
      stderr: (ch)=> errChars.push(ch & 0xff),
      locateFile,
    };
    await loadScript(base + '?r=' + Date.now());
  }
  // Merge stdout
  const text = (outChars.length ? new TextDecoder().decode(new Uint8Array(outChars)) : out.join('\n'));
  const errText = (errChars.length ? new TextDecoder().decode(new Uint8Array(errChars)) : err.join('\n'));
  const isError = /^(\(error\b|Parse Error:|Error:|\[abort\]|fatal|exception)/mi.test(errText);
  return [text, (isError ? ('\n' + errText) : '')].join('');
}

// Init when DOM ready
document.addEventListener('DOMContentLoaded', installUI);
