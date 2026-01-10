---
layout: default
title: Home
---

<section class="hero card">
  <h2 class="glitch" data-text="Welcome to the lab">Welcome to the lab</h2>
  <p>A practical computer science lab: hardware, architecture, and software — with formal methods as instrumentation.</p>
  <p class="meta">This site is systems-first: tools you can run, artifacts you can inspect, and a consistent interface for reasoning.</p>
  <p>
    <a class="button" href="{{ site.baseurl }}/pages/formal-verification">Model Checking Tools</a>
    <a class="button" href="{{ site.baseurl }}/chisel_forge/index.html">Open Hardware IDE</a>
  </p>
</section>

<section class="card">
  <h2>Choose your console</h2>
  <div class="grid">
    <div class="card">
      <h3>Model checking of circuits</h3>
      <p>EBMC/HW-CBMC on Verilog/SystemVerilog/VHDL with BMC, k‑induction, and IC3, plus trace/VCD artifacts.</p>
      <p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/hwcbmc">Open HW-CBMC</a></p>
    </div>
    <div class="card">
      <h3>AIG / structural</h3>
      <p>PDR/BMC/CEC workflows on BLIF/AIGER/Verilog with artifact export.</p>
      <p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/abc">Open ABC Harness</a></p>
    </div>
    <div class="card">
      <h3>SMT / SyGuS</h3>
      <p>Word-level constraints, witnesses, and synthesis-driven examples (SMT-LIB/SyGuS).</p>
      <p><a class="button" href="{{ site.baseurl }}/pages/formal-verification/cvc5">Open CVC5</a></p>
    </div>
  </div>
</section>

<section class="card">
  <h2>Quick links</h2>
  <ul>
    <li><b>Formal Verification (WASM)</b>: ABC (PDR/BMC/CEC), CVC5 (SMT/SyGuS), HW-CBMC/EBMC (BMC/k‑induction/IC3).</li>
    <li><b>Hardware IDE</b>: browser IDE for building, inspecting, and iterating on hardware artifacts.</li>
  </ul>
  <p>
    <a class="button" href="{{ site.baseurl }}/pages/formal-verification">Open Formal Verification Hub</a>
    <a class="button" href="{{ site.baseurl }}/pages/fpga">FPGA</a>
  </p>
</section>

<h2>Areas</h2>
<div class="grid">
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/formal-verification">Formal Verification</a></h3>
    <p>In-browser model checking and SMT as instruments for real systems.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/fpga">FPGA</a></h3>
    <p>RTL implementation and verification-driven design notes.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/mathematics">Mathematics</a></h3>
    <p>Math foundations used by the tools and methods.</p>
  </div>
</div>


