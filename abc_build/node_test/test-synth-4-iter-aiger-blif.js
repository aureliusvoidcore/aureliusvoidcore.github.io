const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const M = await createABCModule({ print: t=>console.log(t), printErr: t=>console.error('[err]', t) });
  const src = fs.readFileSync(path.join(__dirname, 'dup_safe.blif'), 'utf8');
  M.FS.writeFile('dup_safe.blif', src);
  const cmd = 'read_blif dup_safe.blif; strash; print_stats; refactor; balance; rewrite; rewrite -z; balance; refactor; print_stats; write_aiger out_iter.aig; write_blif out_iter.blif';
  M.callMain(['-c', cmd]);
  const a = M.FS.readFile('out_iter.aig');
  const b = M.FS.readFile('out_iter.blif', { encoding: 'utf8' });
  console.log('Wrote out_iter.aig', a.length, 'bytes; out_iter.blif', b.length, 'chars');
})().catch(e=>{ console.error('Fatal', e); process.exit(1); });