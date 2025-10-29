# ABC WebAssembly - Web Integration Guide

This guide explains how to integrate ABC WebAssembly into a web application.

## Overview

ABC has been compiled to WebAssembly and provides:
- Full ABC command-line functionality
- Sequential logic synthesis
- Formal verification (PDR, BMC, CEC)
- AIGER/BLIF/Verilog file support
- Virtual filesystem for file I/O

## Files Required

### Essential Files
- **abc.js** (73 KB) - JavaScript loader and glue code
- **abc.wasm** (12 MB) - WebAssembly binary with ABC engine

### Optional Files
- **abc-wrapper.js** - High-level JavaScript API wrapper
- **index.html** - Example web interface

## Basic Integration

### 1. Include ABC Module

```html
<!DOCTYPE html>
<html>
<head>
    <title>ABC WebAssembly</title>
</head>
<body>
    <h1>ABC Formal Verification</h1>
    <div id="output"></div>
    
    <script src="abc.js"></script>
    <script src="your-app.js"></script>
</body>
</html>
```

### 2. Initialize ABC Module

```javascript
// your-app.js
let abcModule = null;

async function initABC() {
    abcModule = await createABCModule({
        print: (text) => {
            console.log(text);
            document.getElementById('output').innerHTML += text + '\n';
        },
        printErr: (text) => {
            console.error(text);
        }
    });
    
    console.log('ABC Module loaded successfully');
    return abcModule;
}

// Initialize on page load
initABC().then(() => {
    console.log('Ready to execute ABC commands');
});
```

### 3. Execute ABC Commands

```javascript
function runABCCommand(command) {
    if (!abcModule) {
        console.error('ABC module not initialized');
        return;
    }
    
    // Execute command
    abcModule.callMain(['-c', command]);
}

// Example usage
runABCCommand('help');
runABCCommand('read_truth 1000; print_stats');
```

## Working with Files

### Upload and Process Files

```javascript
function uploadAIGERFile(fileContent, filename) {
    // Write file to virtual filesystem
    abcModule.FS.writeFile(filename, new Uint8Array(fileContent));
    
    // Process file
    runABCCommand(`read_aiger ${filename}; print_stats`);
}

// Handle file input
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        uploadAIGERFile(event.target.result, file.name);
    };
    
    reader.readAsArrayBuffer(file);
});
```

### Download Results

```javascript
function downloadAIGERFile(filename) {
    try {
        // Read from virtual filesystem
        const fileData = abcModule.FS.readFile(filename);
        
        // Create download
        const blob = new Blob([fileData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('File not found:', filename);
    }
}

// Example: optimize and download
function optimizeCircuit() {
    runABCCommand('read_aiger input.aig');
    runABCCommand('strash; balance; rewrite');
    runABCCommand('write_aiger output.aig');
    downloadAIGERFile('output.aig');
}
```

## Advanced Integration

### Using the High-Level Wrapper

```javascript
// Load wrapper (if using abc-wrapper.js)
const ABC = new ABCWrapper();

async function runVerification() {
    await ABC.initialize();
    
    // Upload circuit
    ABC.writeFile('circuit.aig', aigerFileData);
    
    // Synthesize
    const result = await ABC.synthesizeAIGER('circuit.aig');
    console.log('Optimization result:', result);
    
    // Verify
    const verifyResult = await ABC.verifyProperty('circuit.aig', 'pdr');
    console.log('Verification:', verifyResult.proved ? 'PROVED' : 'FAILED');
    
    // Download result
    const output = ABC.readFile('output.aig');
    downloadFile(output, 'optimized.aig');
}
```

### Building an Interactive UI

```html
<div class="abc-interface">
    <div class="controls">
        <button onclick="uploadFile()">Upload AIGER</button>
        <button onclick="runSynthesis()">Optimize</button>
        <button onclick="runPDR()">Verify (PDR)</button>
        <button onclick="downloadResult()">Download</button>
    </div>
    
    <div class="editor">
        <textarea id="commands" placeholder="Enter ABC commands..."></textarea>
        <button onclick="executeCommands()">Execute</button>
    </div>
    
    <div class="output">
        <pre id="console-output"></pre>
    </div>
</div>
```

```javascript
function executeCommands() {
    const commands = document.getElementById('commands').value;
    const output = document.getElementById('console-output');
    output.textContent = '';
    
    abcModule.print = (text) => {
        output.textContent += text + '\n';
    };
    
    runABCCommand(commands);
}

function runSynthesis() {
    const commands = `
        read_aiger input.aig;
        strash;
        print_stats;
        balance;
        print_stats;
        rewrite;
        print_stats;
        write_aiger optimized.aig
    `;
    executeCommands(commands);
}

function runPDR() {
    const commands = `
        read_aiger circuit.aig;
        pdr -v
    `;
    executeCommands(commands);
}
```

## Common Use Cases

### 1. Circuit Optimization

```javascript
async function optimizeCircuit(inputFile) {
    await initABC();
    
    // Upload
    abcModule.FS.writeFile('input.aig', inputFile);
    
    // Optimize
    runABCCommand('read_aiger input.aig; strash');
    runABCCommand('balance; rewrite; rewrite -z');
    runABCCommand('refactor; print_stats');
    runABCCommand('write_aiger output.aig');
    
    // Download
    const result = abcModule.FS.readFile('output.aig');
    return result;
}
```

### 2. Formal Verification

```javascript
async function verifyProperty(circuitFile) {
    await initABC();
    
    abcModule.FS.writeFile('circuit.aig', circuitFile);
    
    let proved = false;
    abcModule.print = (text) => {
        if (text.includes('Property proved')) {
            proved = true;
        }
        console.log(text);
    };
    
    runABCCommand('read_aiger circuit.aig; pdr -v');
    
    return { proved, output: console.log };
}
```

### 3. Equivalence Checking

```javascript
async function checkEquivalence(file1, file2) {
    await initABC();
    
    abcModule.FS.writeFile('spec.aig', file1);
    abcModule.FS.writeFile('impl.aig', file2);
    
    let equivalent = false;
    abcModule.print = (text) => {
        if (text.includes('Networks are equivalent')) {
            equivalent = true;
        }
    };
    
    runABCCommand('read_aiger spec.aig; &get; &cec impl.aig');
    
    return equivalent;
}
```

### 4. Format Conversion

```javascript
async function convertToVerilog(aigerFile) {
    await initABC();
    
    abcModule.FS.writeFile('input.aig', aigerFile);
    runABCCommand('read_aiger input.aig; write_verilog output.v');
    
    const verilog = abcModule.FS.readFile('output.v', { encoding: 'utf8' });
    return verilog;
}
```

## Performance Considerations
## Verified Synthesis Recipes (BLIF/AIGER)

The following recipes were validated against the WebAssembly build in this repo. Each one produces an artifact you can download (AIGER/BLIF/Verilog). See `abc_build/node_test/test-synth-*.js` for runnable Node versions.

1) BLIF → AIGER (basic optimization)

```
read_blif dup_safe.blif; strash; print_stats;
balance; rewrite; rewrite -z; balance; print_stats;
write_aiger out_basic.aig
```

2) BLIF → Technology‑independent optimization → BLIF

```
read_blif dup_safe_complex.blif; strash; print_stats;
balance; rewrite; refactor; rewrite -z; balance; print_stats;
write_blif out_resyn.blif
```

3) BLIF → AIGER → LUT‑6 mapping → Verilog

```
read_blif pdr_extreme.blif; strash; print_stats;
write_aiger tmp.aig; read_aiger tmp.aig; strash;
if -K 6; print_stats; write_verilog out_mapped.v
```

4) BLIF → Refactor/Rewrite iteration → AIGER + BLIF

```
read_blif dup_safe.blif; strash; print_stats;
refactor; balance; rewrite; rewrite -z; balance; refactor; print_stats;
write_aiger out_iter.aig; write_blif out_iter.blif
```

5) AIGER round‑trip + optimization → Verilog

```
read_blif dup_safe_complex.blif; strash; write_aiger roundtrip.aig;
read_aiger roundtrip.aig; strash; print_stats;
balance; rewrite; print_stats; write_verilog out_roundtrip.v
```

Tip: If a macro like `resyn` is unavailable, prefer explicit sequences (balance/rewrite/refactor) as shown.

## Critical WASM integration requirements (browser)

When calling ABC through WebAssembly in the browser, keep these essentials in mind to avoid Empty network and missing artifacts:

- Batch commands in one invocation. Each call to `callMain(['-c', ...])` starts a fresh ABC session. If you run `read_*` and later run `strash` in a second call, the network will be empty. Solution: join related steps with semicolons and execute once.

    Wrong (state resets each call):

    ```javascript
    runABCCommand('read_blif input.blif');  // new process
    runABCCommand('strash');                // new process → Empty network
    runABCCommand('write_aiger out.aig');   // new process
    ```

    Right (single process, state persists):

    ```javascript
    runABCCommand('read_blif input.blif; strash; balance; rewrite; write_aiger out.aig');
    ```

- Use format‑aware readers. Prefer `read_blif`, `read_aiger`, or `read_verilog` over generic `read`. This is critical in the browser UI and avoids silent no‑ops on some inputs.

    ```javascript
    const readCmd = fmt === 'blif'    ? `read_blif ${file}`
                             : fmt === 'aiger'   ? `read_aiger ${file}`
                             : fmt === 'verilog' ? `read_verilog ${file}`
                             :                     `read ${file}`;
    runABCCommand(`${readCmd}; strash; print_stats`);
    ```

- Write binary AIGER as Uint8Array. If uploading `.aig` from a file input, read it as ArrayBuffer and pass a `Uint8Array` to `FS.writeFile`. Text AIGER or BLIF/Verilog can be written as strings.

    ```javascript
    // Binary AIGER
    const bytes = new Uint8Array(arrayBuffer);
    abcModule.FS.writeFile('input.aig', bytes);
    // Text BLIF
    abcModule.FS.writeFile('input.blif', blifText);
    ```

- Always strash before TI ops. Many flows assume an AIG in memory; call `strash` after `read_*` before `balance/rewrite/refactor/cec`.

- If you need interactive “single button” commands while preserving state, use a checkpoint strategy: write and read a current network file between invocations.

    ```javascript
    // One-time batch: load and create checkpoint
    runABCCommand('read_blif input.blif; strash; write_aiger current.aig');

    // Later quick action (new process):
    runABCCommand('read_aiger current.aig; balance; write_aiger current.aig');

    // Export when ready
    runABCCommand('read_aiger current.aig; write_verilog out.v');
    ```

Symptoms and fixes:
- “Error: Empty network.” → Combine steps into a single `-c` pipeline or use the checkpoint pattern.
- “Cannot open input file ...” → Ensure the file was produced within the same pipeline or exists in the virtual FS.
- “No change after read” → Switch from `read` to `read_blif/read_aiger/read_verilog`.

### Memory Management

ABC WebAssembly has:
- Initial memory: 512 MB
- Maximum memory: 2 GB (with growth enabled)
- Best practice: Process one circuit at a time
- For batch processing: Reload module between large operations

```javascript
async function processBatch(circuits) {
    for (const circuit of circuits) {
        // Process one circuit
        await processCircuit(circuit);
        
        // For large batches, consider reloading module
        if (circuits.length > 10) {
            await initABC(); // Reload fresh instance
        }
    }
}
```

### Optimization Tips

1. **Use Web Workers** for long-running operations
```javascript
// worker.js
importScripts('abc.js');

let abcModule = null;

self.onmessage = async (e) => {
    if (e.data.type === 'init') {
        abcModule = await createABCModule();
        self.postMessage({ type: 'ready' });
    } else if (e.data.type === 'command') {
        abcModule.callMain(['-c', e.data.command]);
        self.postMessage({ type: 'done' });
    }
};
```

2. **Stream output** for large results
```javascript
let outputBuffer = [];
abcModule.print = (text) => {
    outputBuffer.push(text);
    if (outputBuffer.length > 100) {
        flushOutput();
    }
};

function flushOutput() {
    document.getElementById('output').innerHTML += outputBuffer.join('\n');
    outputBuffer = [];
}
```

3. **Cache module instance** - don't reinitialize unnecessarily

## Error Handling

```javascript
async function safeExecute(command) {
    try {
        if (!abcModule) {
            throw new Error('ABC module not initialized');
        }
        
        runABCCommand(command);
        return { success: true };
    } catch (error) {
        console.error('ABC execution error:', error);
        return { success: false, error: error.message };
    }
}
```

## Supported Commands

ABC provides 500+ commands. Key commands for web integration:

### File I/O
- `read_aiger <file>` - Read AIGER file
- `read_blif <file>` - Read BLIF file
- `write_aiger <file>` - Write AIGER file
- `write_verilog <file>` - Write Verilog file

### Synthesis
- `strash` - Structural hashing (required before most operations)
- `balance` - Balance AIG
- `rewrite` - Rewrite nodes
- `refactor` - Refactor logic
- `if -K 6` - Technology mapping (LUT-6)

### Verification
- `pdr` - Property directed reachability (IC3)
- `bmc3` - Bounded model checking
- `&cec <file>` - Combinational equivalence checking
- `sat` - SAT solver

### Analysis
- `print_stats` - Show circuit statistics
- `print_level` - Show level distribution

## Browser Compatibility

ABC WebAssembly requires:
- WebAssembly support (all modern browsers)
- JavaScript ES6+ features
- Sufficient memory (recommend 2GB+ system RAM)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Example: Complete Integration

See `index.html` for a complete working example with:
- File upload/download
- Command execution
- Real-time output display
- Syntax highlighting
- Error handling

## Troubleshooting

### Module fails to load
- Check abc.js and abc.wasm are in same directory
- Verify CORS headers if serving from different domain
- Check browser console for errors

### Commands fail silently
- Ensure `strash` is called after `read_*` commands
- Check file exists in virtual FS before reading
- Verify command syntax with `help <command>`

### Memory errors
- Reduce circuit size or batch size
- Reload module between large operations
- Consider using Web Worker for isolation

### Slow performance
- Use Web Worker to avoid blocking UI
- Optimize commands (avoid redundant operations)
- Process files client-side before upload

## Next Steps

1. Review example in `index.html`
2. Test with node tests in `node_test/` directory
3. Read ABC documentation for command reference
4. Check browser console for debugging

## Support

For ABC command documentation:
- Run `help` in ABC for command list
- Run `help <command>` for specific command help
- Berkeley ABC documentation: https://people.eecs.berkeley.edu/~alanmi/abc/

For WebAssembly issues:
- Check browser compatibility
- Verify files are served correctly
- Review console errors
- Test with node tests first
