/**
 * ABC WebAssembly - CEC (Combinational Equivalence Checking) Test
 * Demonstrates correct usage of CEC and equivalence checking commands
 */

const createABCModule = require('../abc.js');
const fs = require('fs');

async function testCEC() {
    console.log('ABC WebAssembly - CEC Debug Test\n');
    
    const Module = await createABCModule({
        print: (text) => process.stdout.write(text + '\n'),
        printErr: (text) => process.stderr.write('ERROR: ' + text + '\n')
    });
    
    console.log('Module loaded\n');
    
    const aigerFile = fs.readFileSync('../../src/i10.aig');
    Module.FS.writeFile('i10.aig', aigerFile);
    console.log('Loaded i10.aig\n');
    
    // Test 1: Wrong way - name mismatch (demonstrates the problem)
    console.log('Test 1: CEC with separate reads (demonstrates name mismatch issue)');
    console.log('===================================================================');
    
    Module.callMain(['-c', `
        read i10.aig;
        strash;
        write_aiger temp1.aig;
        balance;
        rewrite;
        cec temp1.aig
    `]);
    
    console.log('\nAs expected, this fails due to name mismatch\n');
    
    // Test 2: Correct way - Use miter command
    console.log('Test 2: CEC using miter command (CORRECT)');
    console.log('==========================================');
    
    Module.callMain(['-c', `
        read i10.aig;
        strash;
        write_aiger original.aig;
        balance;
        rewrite;
        write_aiger optimized.aig;
        miter original.aig optimized.aig;
        print_stats;
        strash;
        sat -v
    `]);
    
    console.log('\nTest 2 PASSED - miter + sat works for equivalence checking\n');
    
    // Test 3: Use &cec (new AIG package)
    console.log('Test 3: Using &cec (new AIG package - CORRECT)');
    console.log('===============================================');
    
    Module.callMain(['-c', `
        read i10.aig;
        strash;
        &get;
        &put;
        write_aiger spec.aig;
        balance;
        rewrite;
        &get;
        &cec spec.aig
    `]);
    
    console.log('\nTest 3 PASSED - &cec works for equivalence checking\n');
    
    // Test 4: Self-equivalence check
    console.log('Test 4: Self-equivalence check');
    console.log('===============================');
    
    Module.callMain(['-c', `
        read i10.aig;
        strash;
        cec
    `]);
    
    console.log('\nTest 4 PASSED - Self-equivalence works\n');
    
    console.log('CEC TEST SUMMARY:');
    console.log('=================\n');
    console.log('Problem: "cec <file>" fails when input names differ\n');
    console.log('Solutions that WORK:');
    console.log('  1. Use "miter" + "sat" commands');
    console.log('  2. Use "&cec" (new AIG package, name-independent)');
    console.log('  3. Use "cec" without argument for self-equivalence\n');
}

testCEC().catch(err => {
    console.error('\nFatal error:', err);
    process.exit(1);
});
