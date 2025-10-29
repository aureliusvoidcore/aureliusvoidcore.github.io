const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const M = await createABCModule({ print: t=>console.log(t), printErr: t=>console.error('[err]', t) });
  const src = fs.readFileSync(path.join(__dirname, 'dup_safe.blif'), 'utf8');
  M.FS.writeFile('dup_safe.blif', src);
  M.callMain(['-c', 'read_blif dup_safe.blif; strash; print_stats; balance; rewrite; rewrite -z; balance; print_stats; write_aiger out_basic.aig']);
  const ok = M.FS.readFile('out_basic.aig');
  console.log('Wrote out_basic.aig', ok.length, 'bytes');
})().catch(e=>{ console.error('Fatal', e); process.exit(1); });