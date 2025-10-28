#!/usr/bin/env bash
set -euo pipefail

# Build cvc5 WebAssembly locally and copy artifacts into assets/cvc5/
# Requires: git, cmake, python3, build-essential (make), curl
# This script will download Emscripten SDK and cvc5 sources into a temp folder.

EMSDK_VER=${EMSDK_VER:-3.1.18}
WORKDIR=${WORKDIR:-"$(pwd)/_cvc5_build"}
SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$SITE_ROOT/assets/cvc5"

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
./configure.sh \
  --static --static-binary \
  --auto-download \
  --no-poly --no-glpk --no-cryptominisat --no-kissat \
  --wasm=JS --wasm-flags='-s MODULARIZE' \
  --name="$BUILD_DIR"
cd "$BUILD_DIR"
make -j4

if [[ ! -f bin/cvc5.js || ! -f bin/cvc5.wasm ]]; then
  echo "[!] Build finished but artifacts not found in bin/" >&2
  exit 2
fi

cp -v bin/cvc5.js bin/cvc5.wasm "$ASSETS_DIR/"
echo "[✓] Copied artifacts to $ASSETS_DIR"

popd >/dev/null

echo "[✓] Done. Test UI at: /pages/formal-verification/cvc5"
