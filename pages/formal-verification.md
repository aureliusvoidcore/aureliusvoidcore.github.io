---
layout: default
title: Formal Verification
---

## Formal Verification

In-browser model checking and SMT consoles.

Everything here runs locally in your browser (WebAssembly): you provide an input, select an engine, and collect artifacts (trace/VCD/model/logs).

<p>
	<a class="button" href="{{ site.baseurl }}/pages/formal-verification/how-to-verify">How to (formally) verify</a>
	<a class="button" href="{{ site.baseurl }}/chisel_forge/index.html">Open ChiselForge</a>
</p>

---

## Experiment Tools

The three tools cover three “levels” of reasoning:

- **HW-CBMC**: RTL + SVA (fast bounded bugs and traces)
- **ABC**: AIG-level model checking / equivalence (good for scalability and structural workflows)
- **CVC5**: word-level SMT (good for arithmetic/data-path reasoning and constraint solving)

### Three consoles (pick one)

<div class="grid">
	<div class="card">
		<h3>HW-CBMC / EBMC (RTL)</h3>
		<p><b>What it is</b>: hardware model checking on Verilog/SystemVerilog/VHDL, with traces and waveforms.</p>
		<p><b>What you give it</b>: HDL text + (optional) property selection/expression + engine parameters.</p>
		<p><b>What you get</b>: counterexample trace, optional VCD, and console output.</p>
		<p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/hwcbmc">Open HW-CBMC</a></p>
	</div>
	<div class="card">
		<h3>ABC (AIG / structural)</h3>
		<p><b>What it is</b>: synthesis + verification toolbox; here used for PDR/IC3, BMC3, and CEC.</p>
		<p><b>What you give it</b>: BLIF / AIGER / Verilog.</p>
		<p><b>What you get</b>: proof/refutation + logs + downloadable artifacts from the in-memory FS.</p>
		<p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/abc">Open ABC Harness</a></p>
	</div>
	<div class="card">
		<h3>CVC5 (SMT / word-level)</h3>
		<p><b>What it is</b>: SMT + SyGuS solver for bit-vectors, arrays, arithmetic, synthesis.</p>
		<p><b>What you give it</b>: SMT-LIB v2.6 or SyGuS v2 text.</p>
		<p><b>What you get</b>: <code>sat</code> with a model (witness) or <code>unsat</code> (no witness under constraints) + stats/logs.</p>
		<p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/cvc5">Open CVC5</a></p>
	</div>
</div>

