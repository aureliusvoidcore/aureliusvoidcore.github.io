---
layout: default
title: FPGA Tools
permalink: /fpga/
---

<div class="page-content">
  <div class="lux-pre rev-blur">HARDWARE SYNTHESIS</div>
  <h2 class="lux-h1 rev-blur" style="--lux-del: 0.1s;">FPGA TOOLCHAIN</h2>

  <div class="grid rev-blur" style="--lux-del: 0.2s;">
    <div class="card">
      <div class="lux-pre" style="font-size: 0.8rem; margin-bottom: 2rem; color: var(--lux-cyber);">VERILOG -> AIGER</div>
      <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 1.5rem; margin-bottom: 1rem;">ABC WASM Wrapper</h3>
      <p style="color: #aaa; margin-bottom: 2rem; line-height: 1.6;">
        Convert sequential and combinational logic architectures to AIG graphs completely in the client-side browser using the compiled Berkeley ABC pipeline.
      </p>
      <a href="{{ site.baseurl }}/fpga/abc" class="button"><span>INITIALIZE ENGINE</span></a>
    </div>

    <div class="card">
      <div class="lux-pre" style="font-size: 0.8rem; margin-bottom: 2rem; color: var(--lux-gold);">CHISEL -> FIRRTL</div>
      <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 1.5rem; margin-bottom: 1rem;">Chisel Forge</h3>
      <p style="color: #aaa; margin-bottom: 2rem; line-height: 1.6;">
        Scala-based HDL server interface for hardware generators. Compiles object-oriented hardware constructs into low-level Verilog for deployment.
      </p>
      <a href="{{ site.baseurl }}/chisel_forge/" class="button" style="--button-color: var(--lux-gold);"><span>CONNECT TARGET</span></a>
    </div>

    <div class="card" style="border-color: rgba(255, 30, 60, 0.2);">
      <div class="lux-pre" style="font-size: 0.8rem; margin-bottom: 2rem; color: var(--lux-crimson);">YOSYS + NEXTPNR</div>
      <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 1.5rem; margin-bottom: 1rem;">Open Source Synthesis</h3>
      <p style="color: #aaa; margin-bottom: 2rem; line-height: 1.6;">
        Fully open-source bitstream generation for ICE40, ECP5, and Nexus FPGAs. Complete flow from Verilog up to place & route. [System Offline]
      </p>
      <a href="#" class="button" style="background: transparent; color: var(--lux-crimson); border-color: var(--lux-crimson);"><span>OFFLINE</span></a>
    </div>
  </div>
</div>
