# ABC WebAssembly - Node.js Tests

This directory contains test suites for ABC WebAssembly functionality.

## Test Files

### Basic Tests

**test-simple.js** - Basic functionality test
- Module loading
- Help command
- AIGER file loading (i10.aig)
- Truth table generation
- Basic synthesis commands

**test-cec.js** - Combinational Equivalence Checking
- Demonstrates CEC name mismatch issue
- Shows correct solutions: miter+sat, &cec, self-cec
- Tests equivalence checking workflows

### PDR (Property Directed Reachability) Tests

**test-pdr-basic.js** - Basic PDR safety property
- 10 latches, 2^10 states
- Simple toggle flip-flops
- Tests PDR with and without preprocessing
- Fast execution (<1 second)

**test-pdr-large.js** - Large PDR stress test
- 88 latches, 2^88 states (309 octillion)
- 20-level parity tree logic
- Tests production-scale formal verification
- Execution time: 0.1-2 seconds typical

## Running Tests

```bash
cd node_test

# Run individual tests
node test-simple.js
node test-cec.js
node test-pdr-basic.js
node test-pdr-large.js

# Run all tests
for test in test-*.js; do echo "Running $test"; node "$test"; echo; done
```

## Test Data Files

- **dup_safe.blif** - 10-latch toggle FF circuit for basic PDR test
- **pdr_extreme.blif** - 88-latch circuit for large PDR test

These BLIF files define sequential circuits with safety properties.

## Expected Results

All tests should pass with output indicating:
- Module loads successfully
- Commands execute without errors
- PDR proves properties (shows "Property proved")
- CEC demonstrates correct equivalence checking
- Synthesis reduces circuit size

## Troubleshooting

If tests fail:

1. **Module not found**: Ensure abc.js is in parent directory (../abc.js)
2. **AIGER file not found**: i10.aig should be in ../../src/i10.aig
3. **BLIF file not found**: Ensure .blif files are in node_test directory
4. **Memory errors**: Large PDR test may need more heap space
5. **Timeout**: Large PDR test may take 30-120s on slower systems

## Integration Notes

These tests demonstrate:
- How to load the ABC module
- How to execute ABC commands via callMain()
- How to use the virtual filesystem (FS)
- How to read/write files
- How to capture output

See WEB_INTEGRATION.md in parent directory for web usage.
