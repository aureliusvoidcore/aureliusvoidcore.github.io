const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const M = await createABCModule({ print: t=>console.log(t), printErr: t=>console.error('[err]', t) });
  const src = fs.readFileSync(path.join(__dirname, 'dup_safe_complex.blif'), 'utf8');
  M.FS.writeFile('dup_safe_complex.blif', src);
  M.callMain(['-c', 'read_blif dup_safe_complex.blif; strash; print_stats; balance; rewrite; refactor; rewrite -z; balance; print_stats; write_blif out_resyn.blif']);
  const ok = M.FS.readFile('out_resyn.blif', { encoding: 'utf8' });
  console.log('Wrote out_resyn.blif', ok.length, 'chars');
})().catch(e=>{ console.error('Fatal', e); process.exit(1); });