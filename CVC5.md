### 1. Compile CVC5 to WebAssembly
To generate WASM-compatible files, you will need the Emscripten SDK (version 3.1.18 or later) and CVC5's source code from its GitHub repository (https://github.com/cvc5/cvc5).

- **Prerequisites**:
  - Install Emscripten: Clone the repository (`git clone https://github.com/emscripten-core/emsdk.git`), install a compatible version (e.g., `./emsdk install 3.1.18`), activate it (`./emsdk activate 3.1.18`), and source the environment (`source ./emsdk_env.sh`).
  - Ensure platform-specific dependencies for Emscripten are met (refer to Emscripten's documentation for details).
  - Clone CVC5's source: `git clone https://github.com/cvc5/cvc5.git`.

- **Configuration and Build (with memory growth)**:
  Use CVC5's configuration script with WASM-specific flags. For a web-usable build, select the `JS` or `HTML` mode to include JavaScript glue code for browser integration. To avoid out-of-memory (OOM) aborts on larger problems, enable memory growth and increase the initial heap size.
  ```
  cd cvc5
  ./configure.sh \
    --static --static-binary --auto-download \
    --wasm=JS \
    --wasm-flags='-s MODULARIZE -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=268435456' \
    --name=build-wasm
  cd build-wasm
  make -j$(nproc)  # Adjust for your system's thread count
  ```
  - `--wasm=JS`: Produces a `.wasm` file and `.js` glue for web or Node.js use.
  - `--wasm=HTML`: Additionally generates an `.html` file for a basic executable demo.
  - `--wasm-flags`: Customize Emscripten settings:
    - `-s MODULARIZE` for cleaner integration.
    - `-s ALLOW_MEMORY_GROWTH=1` to allow the heap to grow at runtime.
    - `-s INITIAL_MEMORY=268435456` (256MB) to start with a larger heap; increase for big SyGuS problems.
    - Optional: `-s MAXIMUM_MEMORY=2147483648` (2GB) to cap growth; omit to use Emscripten defaults.
  - The output files (e.g., `cvc5.wasm`, `cvc5.js`, and optionally `cvc5.html`) will be in the `build-wasm/bin` directory.

This process statically links dependencies and results in files suitable for browser execution. Note that WASM builds may incur performance overhead compared to native compilations due to emulation.

### 2. Develop or Upload an Interface
To interact with the WASM module, you need a web interface:
- Use the generated `.js` file to load the WASM module in a browser. For example, create an `index.html` file that includes:
  ```html
  <!DOCTYPE html>
  <html>
  <head>
      <title>CVC5 WASM Interface</title>
  </head>
  <body>
      <textarea id="input" placeholder="Enter SMT-LIB input"></textarea>
      <button onclick="runCVC5()">Run</button>
      <pre id="output"></pre>
      <script src="cvc5.js"></script>
      <script>
          function runCVC5() {
              Module().then((instance) => {
                  // Use instance to call CVC5 with input from textarea
                  // Example: Pass input as command-line args or stdin simulation
                  const result = instance.callMain(['--input-file']);  // Adapt based on your needs
                  document.getElementById('output').textContent = result;
              });
          }
      </script>
  </body>
  </html>
  ```
  This is a basic example; adapt it to handle SMT-LIB inputs and outputs via Emscripten's API bindings or simulated stdin/stdout.
- If you prefer a more advanced interface, consider using libraries like Embind (part of Emscripten) to expose CVC5's C++ API directly to JavaScript during compilation.
- Upload these files (WASM, JS, HTML, and any additional assets) to a GitHub repository.

### 3. Host on GitHub Pages
GitHub Pages allows free hosting of static sites from a repository, making it ideal for WASM applications.
- Create a new GitHub repository (or use an existing one).
- Add the compiled files to the repository's root or a `docs/` folder.
- Enable GitHub Pages:
  - Go to the repository's Settings > Pages.
  - Under "Source," select the branch (e.g., `main`) and folder (e.g., `/ (root)` or `/docs`).
  - Save the changes. Your site will be available at `https://<username>.github.io/<repo-name>/`.
- Access the interface by visiting the Pages URL in a browser. Users can then input SMT problems and receive results directly, as the WASM module executes client-side.

### Example and Considerations
### 4. Build via GitHub Actions (recommended)
If you prefer not to install Emscripten locally, this repository includes a workflow to build cvc5 to WebAssembly in CI and open a PR with the artifacts:

- Workflow file: `.github/workflows/build-cvc5-wasm.yml`
- Triggers: manual (workflow_dispatch) or when this document/workflow is changed
- Output: `cvc5.js` and `cvc5.wasm` uploaded as an artifact and proposed into `assets/cvc5/` via an automatic Pull Request

Steps:
1. In GitHub, go to Actions → Build cvc5 WebAssembly → Run workflow.
2. Wait for the `build` job to complete. It uploads an artifact named `cvc5-wasm`.
3. The `create-pr` job will open a Pull Request adding `assets/cvc5/cvc5.js` and `assets/cvc5/cvc5.wasm` to this site. Merge it.
4. Open the interface at `/pages/formal-verification/cvc5` and click Run.

Notes:
- The workflow pins Emscripten 3.1.18 and should include memory flags similar to local builds: `-s MODULARIZE -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=268435456` (adjust as needed).
- You can adjust flags in the workflow if you need a different configuration.

An existing demonstration of this approach is CVC5's official online app at https://cvc5.github.io/app, which is hosted on GitHub Pages and likely utilizes a WASM build for browser-based execution. You can inspect its source or fork the CVC5 repository to adapt it.

- **Limitations**: WASM execution in browsers is sandboxed, so features requiring file system access or external dependencies may need adaptation (e.g., simulate inputs via JavaScript). Performance may vary based on problem complexity and browser resources.
- **Memory considerations**: If you see `[abort]` or OOM in the Errors panel, rebuild with memory growth enabled and a larger initial heap. Browsers typically cap wasm32 heaps around 2–4GB. Start with 256–512MB initial memory and allow growth.
**Memory limits and 16GB requests**

- Browser WebAssembly (wasm32) has a hard architectural limit of 4GiB linear memory, and most browsers enforce practical limits between 2–4GiB. Building with 16GiB is not possible on wasm32.
- The Emscripten flag `-s MEMORY64=1` (wasm64) enables >4GiB address space, but support in browsers is experimental and gated behind flags; most users cannot run wasm64 yet.
- For workloads that truly require >4GiB:
  - Prefer running the native cvc5 binary on your machine or a server.
  - Or run the CLI behind an API and use the browser UI as a thin client.
  - If you control a bleeding-edge environment, you can experiment with `MEMORY64=1` in the build script and a browser with wasm64 enabled.
- **Testing**: Verify the WASM module locally using a simple HTTP server (e.g., `python -m http.server`) before deploying.
- **Updates**: If you modify CVC5's source or interface, recompile and redeploy to GitHub.

This method ensures CVC5 can be used interactively via GitHub-hosted pages. If you encounter issues during compilation or require further customization, consult CVC5's documentation or Emscripten's guides for additional support.
