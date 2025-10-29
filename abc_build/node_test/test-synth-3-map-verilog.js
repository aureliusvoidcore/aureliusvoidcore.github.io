const createABCModule = require('../abc.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const M = await createABCModule({ print: t=>console.log(t), printErr: t=>console.error('[err]', t) });
  const src = fs.readFileSync(path.join(__dirname, 'pdr_extreme.blif'), 'utf8');
  M.FS.writeFile('pdr_extreme.blif', src);
  M.callMain(['-c', 'read_blif pdr_extreme.blif; strash; print_stats; write_aiger tmp.aig; read_aiger tmp.aig; strash; if -K 6; print_stats; write_verilog out_mapped.v']);
  const ok = M.FS.readFile('out_mapped.v', { encoding: 'utf8' });
  console.log('Wrote out_mapped.v', ok.length, 'chars');
})().catch(e=>{ console.error('Fatal', e); process.exit(1); });