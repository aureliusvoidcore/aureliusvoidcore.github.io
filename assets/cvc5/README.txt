Place the WebAssembly build artifacts for cvc5 here:

- cvc5.js
- cvc5.wasm

How to build (summary):
1) Install Emscripten 3.1.18 or newer and activate its environment.
2) Clone cvc5: git clone https://github.com/cvc5/cvc5 && cd cvc5
3) Configure for WASM (with memory growth enabled):
   ./configure.sh \
     --static --static-binary --auto-download \
     --wasm=JS \
     --wasm-flags='-s MODULARIZE -s ALLOW_MEMORY_GROWTH=1 -s INITIAL_MEMORY=268435456' \
     --name=build-wasm
   # Optional: cap memory to a maximum (bytes). Example for 2GB:
   #   --wasm-flags='... -s MAXIMUM_MEMORY=2147483648'
4) Build:
   cd build-wasm && make -j$(nproc)
5) Copy artifacts:
   cp bin/cvc5.js /path/to/site/assets/cvc5/
   cp bin/cvc5.wasm /path/to/site/assets/cvc5/

Notes:
- The UI loads cvc5.js from /assets/cvc5/cvc5.js and resolves cvc5.wasm automatically via locateFile().
- You can override paths by setting window.__CVC5_JS_PATH__ and window.__CVC5_WASM_PATH__ before the UI script loads.
- In the UI, choose language SMT-LIB v2 or SyGuS v2, set logic, timeouts, and extra flags as needed, then click Run.
 - For larger SyGuS problems, enable memory growth and increase initial memory to avoid OOM: use -s ALLOW_MEMORY_GROWTH=1 and a larger -s INITIAL_MEMORY (e.g., 256–1024MB). Browsers typically cap maximum memory around 2–4GB for wasm32; 16GB is not possible unless targeting experimental wasm64 (MEMORY64=1) in bleeding-edge browsers.
