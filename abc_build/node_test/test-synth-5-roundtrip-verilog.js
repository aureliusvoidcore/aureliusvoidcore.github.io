const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const M = await createABCModule({ print: t=>console.log(t), printErr: t=>console.error('[err]', t) });
  const src = fs.readFileSync(path.join(__dirname, 'dup_safe_complex.blif'), 'utf8');
  M.FS.writeFile('dup_safe_complex.blif', src);
  const cmd = 'read_blif dup_safe_complex.blif; strash; write_aiger roundtrip.aig; read_aiger roundtrip.aig; strash; print_stats; balance; rewrite; print_stats; write_verilog out_roundtrip.v';
  M.callMain(['-c', cmd]);
  const v = M.FS.readFile('out_roundtrip.v', { encoding: 'utf8' });
  console.log('Wrote out_roundtrip.v', v.length, 'chars');
})().catch(e=>{ console.error('Fatal', e); process.exit(1); });