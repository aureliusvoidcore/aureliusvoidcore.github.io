/**
 * ABC WebAssembly - Synthesis Suite (Verified Examples)
 * Demonstrates 5+ distinct BLIF/AIGER synthesis flows and format conversions.
 */

const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const Module = await createABCModule({
    print: (t) => process.stdout.write(t + '\n'),
    printErr: (t) => process.stderr.write('[err] ' + t + '\n'),
    noInitialRun: true
  });

  // Helper to write a host file into the virtual FS (if exists)
  function preload(hostPath, vfsName) {
    const full = path.join(__dirname, hostPath);
    const data = fs.readFileSync(full, 'utf8');
    Module.FS.writeFile(vfsName, data);
    console.log(`[preload] ${full} -> ${vfsName}`);
  }

  // Helper to assert file exists in FS
  function assertFile(name) {
    try { Module.FS.stat(name); return true; } catch { throw new Error(`Expected file not found: ${name}`); }
  }

  // Flow runner
  function run(commands, title) {
    console.log('\n' + '='.repeat(70));
    console.log(title);
    console.log('='.repeat(70));
    Module.callMain(['-c', commands]);
  }

  // Preload test BLIF designs from repo
  preload('dup_safe.blif', 'dup_safe.blif');
  preload('dup_safe_complex.blif', 'dup_safe_complex.blif');
  preload('pdr_extreme.blif', 'pdr_extreme.blif');

  // 1) BLIF -> AIGER with basic optimization
  run([
    'read_blif dup_safe.blif',
    'strash',
    'print_stats',
    'balance; rewrite; rewrite -z; balance',
    'print_stats',
    'write_aiger out_basic.aig'
  ].join('; '), 'FLOW 1: BLIF dup_safe -> optimize -> AIGER');
  assertFile('out_basic.aig');
  console.log('[ok] out_basic.aig written');

  // 2) BLIF -> explicit TI optimization sequence -> BLIF
  run([
    'read_blif dup_safe_complex.blif',
    'strash',
    'print_stats',
    'balance; rewrite; refactor; rewrite -z; balance',
    'print_stats',
    'write_blif out_resyn.blif'
  ].join('; '), 'FLOW 2: BLIF dup_safe_complex -> TI optimize -> BLIF');
  assertFile('out_resyn.blif');
  console.log('[ok] out_resyn.blif written');

  // 3) BLIF -> AIGER -> LUT-6 mapping -> Verilog
  preload('pdr_extreme.blif', 'pdr_extreme.blif');
  run([
    'read_blif pdr_extreme.blif',
    'strash',
    'print_stats',
    'write_aiger tmp_extreme.aig',
    'read_aiger tmp_extreme.aig',
    'strash',
    'if -K 6',
    'print_stats',
    'write_verilog out_mapped.v'
  ].join('; '), 'FLOW 3: BLIF pdr_extreme -> AIGER -> LUT-6 map -> Verilog');
  assertFile('out_mapped.v');
  console.log('[ok] out_mapped.v written');

  // 4) BLIF -> refactor+rewrite loop -> AIGER & BLIF
  preload('dup_safe.blif', 'dup_safe.blif');
  try {
    const dbg = Module.FS.readFile('dup_safe.blif', { encoding: 'utf8' });
    console.log(`[debug] dup_safe.blif length=${dbg.length}`);
  } catch (e) { console.log('[debug] dup_safe.blif missing before FLOW 4'); }
  run([
    'read /dup_safe.blif',
    'strash',
    'print_stats',
    'refactor; balance; rewrite; rewrite -z; balance; refactor',
    'print_stats',
    'write_aiger out_iter.aig; write_blif out_iter.blif'
  ].join('; '), 'FLOW 4: BLIF dup_safe -> refactor/rewrite iterations -> AIGER+BLIF');
  assertFile('out_iter.aig');
  assertFile('out_iter.blif');
  console.log('[ok] out_iter.aig and out_iter.blif written');

  // 5) AIGER round-trip + analysis (generated from BLIF)
  preload('dup_safe_complex.blif', 'dup_safe_complex.blif');
  run([
    'read /dup_safe_complex.blif',
    'strash',
    'write_aiger roundtrip.aig',
    'read_aiger roundtrip.aig',
    'strash; print_stats',
    'balance; rewrite; print_stats',
    'write_verilog out_roundtrip.v'
  ].join('; '), 'FLOW 5: AIGER round-trip + stats + Verilog');
  assertFile('out_roundtrip.v');
  console.log('[ok] out_roundtrip.v written');

  // 6) Optional: technology independent script (dch; dc2)
  run([
    'read_blif pdr_extreme.blif',
    'strash',
    'print_stats',
    'dch; dc2; balance; rewrite',
    'print_stats',
    'write_aiger out_dch_dc2.aig'
  ].join('; '), 'FLOW 6: dch/dc2 pipeline -> AIGER');
  assertFile('out_dch_dc2.aig');
  console.log('[ok] out_dch_dc2.aig written');

  console.log('\nAll synthesis flows completed successfully.');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
