#!/usr/bin/env bash
set -euo pipefail

EMSDK_VER=${EMSDK_VER:-3.1.18}
WORKDIR=${WORKDIR:-"$(pwd)/_cvc5_build"}
SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$SITE_ROOT/assets/cvc5"
INITIAL_MEMORY_MB=${INITIAL_MEMORY_MB:-256}
MAXIMUM_MEMORY_MB=${MAXIMUM_MEMORY_MB:-}
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
  echo "[!] MEMORY64=1: wasm64 is experimental in browsers and may require flags." >&2
fi
WASM_FLAGS=(
  "-s MODULARIZE"
  "-s ALLOW_MEMORY_GROWTH=1"
  "-s INITIAL_MEMORY=$((INITIAL_MEMORY_MB * 1024 * 1024))"
)

if [[ "$MEMORY64" == "1" ]]; then
  WASM_FLAGS+=("-s MEMORY64=1")
  WASM_FLAGS+=("-s WASM_BIGINT=1")
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
