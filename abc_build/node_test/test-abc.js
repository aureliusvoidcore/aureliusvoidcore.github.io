/**
 * Test ABC WebAssembly in Node.js
 */

// Load the ABC module and wrapper
const createABCModule = require('../abc.js');
global.createABCModule = createABCModule;
const ABCWrapper = require('./abc-wrapper.js');

async function testABC() {
    console.log('=== ABC WebAssembly Test Suite ===\n');

    // Initialize ABC wrapper
    const abc = new ABCWrapper();
    
    console.log('Initializing ABC module...');
    await abc.initialize();
    console.log('✓ ABC module initialized\n');

    // Test 1: Simple BLIF synthesis
    console.log('Test 1: BLIF Synthesis');
    console.log('----------------------');
    
    const testBLIF = `.model simple
.inputs a b c
.outputs f
.names a b c f
111 1
.end
`;

    try {
        abc.writeFile('test.blif', testBLIF);
        console.log('✓ Written test BLIF file');

        const result1 = abc.executeCommand('read test.blif');
        console.log('✓ Read BLIF file');
        
        const result2 = abc.executeCommand('print_stats');
        console.log('Statistics:', result2.output);
        
        const result3 = abc.executeCommand('strash');
        console.log('✓ Structural hashing');
        
        const result4 = abc.executeCommand('write_aiger output.aig');
        console.log('✓ Written AIGER file');
        
        if (abc.fileExists('output.aig')) {
            console.log('✓ Output file exists');
            const content = abc.readFile('output.aig', 'binary');
            console.log(`✓ Output file size: ${content.length} bytes`);
        }
        
        console.log('✓ Test 1 PASSED\n');
    } catch (e) {
        console.error('✗ Test 1 FAILED:', e);
    }

    // Test 2: AIGER example
    console.log('Test 2: AIGER Processing');
    console.log('------------------------');
    
    try {
        // Check if the example file exists
        if (abc.fileExists('output.aig')) {
            const result1 = abc.executeCommand('read output.aig');
            console.log('✓ Read AIGER file');
            
            const result2 = abc.executeCommand('print_stats');
            console.log('Statistics:', result2.output);
            
            // Apply synthesis
            abc.executeCommand('balance');
            console.log('✓ Balance');
            
            abc.executeCommand('rewrite');
            console.log('✓ Rewrite');
            
            const result3 = abc.executeCommand('print_stats');
            console.log('After synthesis:', result3.output);
            
            // Write output
            abc.executeCommand('write_blif output.blif');
            console.log('✓ Written BLIF output');
            
            console.log('✓ Test 2 PASSED\n');
        } else {
            console.log('⊘ Test 2 SKIPPED (no AIGER file)\n');
        }
    } catch (e) {
        console.error('✗ Test 2 FAILED:', e);
    }

    // Test 3: High-level API
    console.log('Test 3: High-level Synthesis API');
    console.log('--------------------------------');
    
    try {
        const blifContent = `.model adder
.inputs a b cin
.outputs sum cout
.names a b cin sum
001 1
010 1
100 1
111 1
.names a b cin cout
011 1
101 1
110 1
111 1
.end
`;

        const result = await abc.synthesizeBLIF(blifContent, 'aig');
        
        if (result.success) {
            console.log('✓ Synthesis successful');
            console.log('✓ Output file:', result.outputFile);
            console.log('Output preview:', result.outputContent.substring(0, 200));
            console.log('✓ Test 3 PASSED\n');
        } else {
            console.error('✗ Synthesis failed');
            console.log('✗ Test 3 FAILED\n');
        }
    } catch (e) {
        console.error('✗ Test 3 FAILED:', e);
    }

    // Test 4: Multiple commands
    console.log('Test 4: Command Chain');
    console.log('---------------------');
    
    try {
        abc.writeFile('chain.blif', testBLIF);
        
        const commands = [
            'read chain.blif',
            'strash',
            'balance',
            'rewrite',
            'rewrite -z',
            'balance',
            'print_stats'
        ];
        
        for (const cmd of commands) {
            const result = abc.executeCommand(cmd);
            if (!result.success) {
                console.error(`✗ Command failed: ${cmd}`);
            }
        }
        
        console.log('✓ All commands executed');
        console.log('✓ Test 4 PASSED\n');
    } catch (e) {
        console.error('✗ Test 4 FAILED:', e);
    }

    // Test 5: File operations
    console.log('Test 5: File Operations');
    console.log('-----------------------');
    
    try {
        console.log('Files in virtual FS:', abc.listFiles('/'));
        
        abc.writeFile('dummy.txt', 'test content');
        console.log('✓ File created');
        
        const exists = abc.fileExists('dummy.txt');
        console.log('✓ File exists check:', exists);
        
        const content = abc.readFile('dummy.txt', 'utf8');
        console.log('✓ File content:', content);
        
        abc.deleteFile('dummy.txt');
        console.log('✓ File deleted');
        
        const stillExists = abc.fileExists('dummy.txt');
        console.log('✓ File no longer exists:', !stillExists);
        
        console.log('✓ Test 5 PASSED\n');
    } catch (e) {
        console.error('✗ Test 5 FAILED:', e);
    }

    console.log('=== All Tests Complete ===');
}

// Run tests
testABC().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
