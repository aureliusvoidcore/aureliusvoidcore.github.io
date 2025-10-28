#!/usr/bin/env bash
set -euo pipefail

# Build cvc5 WebAssembly locally and copy artifacts into assets/cvc5/
# Requires: git, cmake, python3, build-essential (make), curl
# This script will download Emscripten SDK and cvc5 sources into a temp folder.

EMSDK_VER=${EMSDK_VER:-3.1.18}
WORKDIR=${WORKDIR:-"$(pwd)/_cvc5_build"}
SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$SITE_ROOT/assets/cvc5"
INITIAL_MEMORY_MB=${INITIAL_MEMORY_MB:-256}
# Empty means let Emscripten choose default (wasm32 practical limits are ~2–4GiB depending on browser)
MAXIMUM_MEMORY_MB=${MAXIMUM_MEMORY_MB:-}
# Experimental: wasm64 via -sMEMORY64=1 (not broadly supported in browsers)
MEMORY64=${MEMORY64:-0}
SKIP_WASM_OPT=${SKIP_WASM_OPT:-1}

mkdir -p "$WORKDIR" "$ASSETS_DIR"
cd "$WORKDIR"

if [[ ! -d emsdk ]]; then
  echo "[+] Cloning Emscripten SDK $EMSDK_VER..."
  git clone https://github.com/emscripten-core/emsdk.git
fi

pushd emsdk >/dev/null
./emsdk install "$EMSDK_VER"
./emsdk activate "$EMSDK_VER"
source ./emsdk_env.sh
popd >/dev/null

if [[ ! -d cvc5 ]]; then
  echo "[+] Cloning cvc5..."
  git clone --depth=1 https://github.com/cvc5/cvc5.git
fi

pushd cvc5 >/dev/null
BUILD_DIR=build-wasm
# Validate and adjust memory settings for target
if [[ "$MEMORY64" != "1" ]]; then
  # wasm32: cap at 4096 MB (4GiB)
  if [[ -n "$MAXIMUM_MEMORY_MB" ]] && (( MAXIMUM_MEMORY_MB > 4096 )); then
    echo "[!] MAXIMUM_MEMORY_MB=${MAXIMUM_MEMORY_MB} exceeds wasm32 4GiB limit; clamping to 4096 MB" >&2
    MAXIMUM_MEMORY_MB=4096
  fi
  if (( INITIAL_MEMORY_MB > 4096 )); then
    echo "[!] INITIAL_MEMORY_MB=${INITIAL_MEMORY_MB} exceeds wasm32 4GiB limit; clamping to 4096 MB" >&2
    INITIAL_MEMORY_MB=4096
  fi
  if [[ -n "$MAXIMUM_MEMORY_MB" ]] && (( INITIAL_MEMORY_MB > MAXIMUM_MEMORY_MB )); then
    echo "[!] INITIAL_MEMORY_MB (${INITIAL_MEMORY_MB}) > MAXIMUM_MEMORY_MB (${MAXIMUM_MEMORY_MB}); setting initial to maximum" >&2
    INITIAL_MEMORY_MB=${MAXIMUM_MEMORY_MB}
  fi
else
  echo "[!] MEMORY64=1 enabled: compiling with -sMEMORY64=1 (wasm64). Browser support is experimental and may require flags." >&2
  if [[ "$USE_PTHREADS" == "1" ]]; then
    echo "[!] Note: Emscripten currently does not support pthreads with wasm64 in stable toolchains. cvc5 requires Threads when setitimer is unavailable, so this configuration will likely fail. Consider wasm32 (<=4GiB) or native build." >&2
  fi
fi
# Compose wasm flags: enable modularization + memory growth and sizing
WASM_FLAGS=(
  "-s MODULARIZE"
  "-s ALLOW_MEMORY_GROWTH=1"
  "-s INITIAL_MEMORY=$((INITIAL_MEMORY_MB * 1024 * 1024))"
)

if [[ "$MEMORY64" == "1" ]]; then
  WASM_FLAGS+=("-s MEMORY64=1")
  # JS BigInt interop is required for 64-bit integers when targeting wasm64
  WASM_FLAGS+=("-s WASM_BIGINT=1")
  # Do NOT force pthreads on wasm64; it is not supported in stable Emscripten
fi

if [[ -n "${MAXIMUM_MEMORY_MB}" ]]; then
  WASM_FLAGS+=("-s MAXIMUM_MEMORY=$((MAXIMUM_MEMORY_MB * 1024 * 1024))")
fi

echo "[+] Using Emscripten flags: ${WASM_FLAGS[*]}"
./configure.sh \
  --static --static-binary \
  --auto-download \
  --no-poly --no-glpk --no-cryptominisat --no-kissat \
  --wasm=JS --wasm-flags="${WASM_FLAGS[*]}" \
  -DHAVE_SETITIMER=1 \
  --name="$BUILD_DIR"
cd "$BUILD_DIR"
if [[ "$SKIP_WASM_OPT" == "1" ]]; then
  echo "[+] Skipping wasm-opt post-processing (EMCC_SKIP_WASM_OPT=1) to reduce host memory usage during link"
  EMCC_SKIP_WASM_OPT=1 make -j"${MAKE_JOBS:-$(nproc || echo 4)}"
else
  make -j"${MAKE_JOBS:-$(nproc || echo 4)}"
fi

if [[ ! -f bin/cvc5.js || ! -f bin/cvc5.wasm ]]; then
  echo "[!] Build finished but artifacts not found in bin/" >&2
  exit 2
fi

cp -v bin/cvc5.js bin/cvc5.wasm "$ASSETS_DIR/"
echo "[✓] Copied artifacts to $ASSETS_DIR"

popd >/dev/null

echo "[✓] Done. Test UI at: /pages/formal-verification/cvc5"
