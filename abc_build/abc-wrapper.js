/**
 * ABC WebAssembly Wrapper
 * Provides a high-level API for using ABC synthesis tool in browser/Node.js
 */

class ABCWrapper {
    constructor() {
        this.module = null;
        this.ready = false;
        this.outputBuffer = [];
        this.errorBuffer = [];
    }

    /**
     * Initialize the ABC module
     * @param {Object} moduleOverrides - Optional overrides for Emscripten module
     * @returns {Promise<void>}
     */
    async initialize(moduleOverrides = {}) {
        if (this.ready) {
            console.warn('ABC module already initialized');
            return;
        }

        // Default module configuration
        const defaultConfig = {
            print: (text) => {
                console.log(text);
                this.outputBuffer.push(text);
            },
            printErr: (text) => {
                console.error(text);
                this.errorBuffer.push(text);
            },
            noInitialRun: true,
            locateFile: (path, prefix) => {
                // Adjust this path based on your file structure
                if (path.endsWith('.wasm')) {
                    return prefix + path;
                }
                return prefix + path;
            }
        };

        const config = { ...defaultConfig, ...moduleOverrides };

        // Load the ABC module
        if (typeof createABCModule !== 'undefined') {
            this.module = await createABCModule(config);
        } else {
            throw new Error('ABC module not found. Make sure abc.js is loaded.');
        }

        this.ready = true;
        console.log('ABC WebAssembly module initialized successfully');
    }

    /**
     * Write a file to the virtual file system
     * @param {string} filename - Name of the file
     * @param {string|Uint8Array} content - File content
     */
    writeFile(filename, content) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        try {
            this.module.FS.writeFile(filename, content);
            console.log(`File written: ${filename}`);
        } catch (e) {
            console.error(`Error writing file ${filename}:`, e);
            throw e;
        }
    }

    /**
     * Read a file from the virtual file system
     * @param {string} filename - Name of the file
     * @returns {Uint8Array|string} File content
     */
    readFile(filename, encoding = 'utf8') {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        try {
            return this.module.FS.readFile(filename, { encoding });
        } catch (e) {
            console.error(`Error reading file ${filename}:`, e);
            throw e;
        }
    }

    /**
     * Check if a file exists in the virtual file system
     * @param {string} filename - Name of the file
     * @returns {boolean}
     */
    fileExists(filename) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        try {
            this.module.FS.stat(filename);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * List files in the virtual file system
     * @param {string} path - Directory path (default: '/')
     * @returns {Array<string>}
     */
    listFiles(path = '/') {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        try {
            return this.module.FS.readdir(path).filter(f => f !== '.' && f !== '..');
        } catch (e) {
            console.error(`Error listing files in ${path}:`, e);
            throw e;
        }
    }

    /**
     * Delete a file from the virtual file system
     * @param {string} filename - Name of the file
     */
    deleteFile(filename) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        try {
            this.module.FS.unlink(filename);
            console.log(`File deleted: ${filename}`);
        } catch (e) {
            console.error(`Error deleting file ${filename}:`, e);
            throw e;
        }
    }

    /**
     * Execute ABC command
     * @param {string} command - ABC command to execute
     * @returns {Object} Result with output and error
     */
    executeCommand(command) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        this.outputBuffer = [];
        this.errorBuffer = [];

        try {
            // Split command into arguments
            const args = ['-c', command];
            
            // Call main with arguments
            const result = this.module.callMain(args);
            
            return {
                exitCode: result,
                output: this.outputBuffer.join('\n'),
                error: this.errorBuffer.join('\n'),
                success: result === 0
            };
        } catch (e) {
            console.error('Error executing command:', e);
            return {
                exitCode: -1,
                output: this.outputBuffer.join('\n'),
                error: this.errorBuffer.join('\n') + '\n' + e.message,
                success: false
            };
        }
    }

    /**
     * Run a synthesis workflow
     * @param {string} inputFile - Input file (AIGER, BLIF, Verilog)
     * @param {string} outputFile - Output file
     * @param {Array<string>} commands - Sequence of ABC commands
     * @returns {Object} Result with output
     */
    async runSynthesis(inputFile, outputFile, commands = []) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        const results = [];

        // Read input file
        const readCmd = `read ${inputFile}`;
        results.push(this.executeCommand(readCmd));

        // Execute synthesis commands
        for (const cmd of commands) {
            results.push(this.executeCommand(cmd));
        }

        // Write output file
        const writeCmd = `write ${outputFile}`;
        results.push(this.executeCommand(writeCmd));

        const allSuccess = results.every(r => r.success);
        
        return {
            success: allSuccess,
            results: results,
            outputFile: allSuccess && this.fileExists(outputFile) ? outputFile : null
        };
    }

    /**
     * Synthesize AIGER file
     * @param {string|Uint8Array} aigerContent - AIGER file content
     * @param {string} outputFormat - Output format ('aig', 'blif', 'verilog')
     * @param {Array<string>} synthCommands - Custom synthesis commands (optional)
     * @returns {Object} Result with synthesized content
     */
    async synthesizeAIGER(aigerContent, outputFormat = 'blif', synthCommands = null) {
        const inputFile = 'input.aig';
        const outputExt = outputFormat === 'verilog' ? 'v' : outputFormat;
        const outputFile = `output.${outputExt}`;

        // Write input file
        this.writeFile(inputFile, aigerContent);

        // Default synthesis commands
        const defaultCommands = [
            'strash',      // Structural hashing
            'balance',     // Balance AIG
            'rewrite',     // Technology-independent rewriting
            'rewrite -z',  // Zero-cost rewriting
            'balance',
            'rewrite',
            'balance'
        ];

        const commands = synthCommands || defaultCommands;
        const result = await this.runSynthesis(inputFile, outputFile, commands);

        if (result.success && result.outputFile) {
            result.outputContent = this.readFile(result.outputFile, 'utf8');
        }

        return result;
    }

    /**
     * Synthesize BLIF file
     * @param {string} blifContent - BLIF file content
     * @param {string} outputFormat - Output format ('aig', 'blif', 'verilog')
     * @param {Array<string>} synthCommands - Custom synthesis commands (optional)
     * @returns {Object} Result with synthesized content
     */
    async synthesizeBLIF(blifContent, outputFormat = 'aig', synthCommands = null) {
        const inputFile = 'input.blif';
        const outputExt = outputFormat === 'verilog' ? 'v' : outputFormat;
        const outputFile = `output.${outputExt}`;

        // Write input file
        this.writeFile(inputFile, blifContent);

        // Default synthesis commands
        const defaultCommands = [
            'strash',
            'balance',
            'rewrite',
            'balance'
        ];

        const commands = synthCommands || defaultCommands;
        const result = await this.runSynthesis(inputFile, outputFile, commands);

        if (result.success && result.outputFile) {
            result.outputContent = this.readFile(result.outputFile, 'utf8');
        }

        return result;
    }

    /**
     * Verify equivalence of two circuits
     * @param {string} file1 - First circuit file
     * @param {string} file2 - Second circuit file
     * @returns {Object} Verification result
     */
    verifyEquivalence(file1, file2) {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        const results = [];
        
        // Read first circuit
        results.push(this.executeCommand(`read ${file1}`));
        
        // Store it
        results.push(this.executeCommand('strash'));
        results.push(this.executeCommand('write_aiger temp1.aig'));
        
        // Read second circuit
        results.push(this.executeCommand(`read ${file2}`));
        results.push(this.executeCommand('strash'));
        
        // Compare
        results.push(this.executeCommand('cec temp1.aig'));
        
        const lastResult = results[results.length - 1];
        const isEquivalent = lastResult.output.includes('Networks are equivalent');
        
        return {
            success: results.every(r => r.success),
            equivalent: isEquivalent,
            output: lastResult.output,
            results: results
        };
    }

    /**
     * Get statistics about current network
     * @returns {Object} Network statistics
     */
    getStatistics() {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        const result = this.executeCommand('print_stats');
        return {
            success: result.success,
            stats: result.output
        };
    }

    /**
     * Reset the ABC module (clear all networks)
     */
    reset() {
        if (!this.ready) {
            throw new Error('ABC module not initialized');
        }

        this.executeCommand('empty');
        console.log('ABC module reset');
    }

    /**
     * Get the underlying Emscripten module
     * @returns {Object} Emscripten module
     */
    getModule() {
        return this.module;
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ABCWrapper;
}
if (typeof window !== 'undefined') {
    window.ABCWrapper = ABCWrapper;
}
