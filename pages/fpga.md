---
layout: default
title: FPGA
---

## FPGA

FPGA work here focuses on implementation plus verification artifacts.

### What exists on this site (implemented)
<p>
  <a class="button" href="{{ site.baseurl }}/pages/fpga/abc">ABC WebAssembly Demo</a>
  <span class="meta">Interactive ABC build for synthesis/commands in-browser.</span>
</p>

### Connections to model checking
<ul>
  <li><b>Before synthesis</b>: check RTL assertions and generate waveforms via <a href="{{ site.baseurl }}/pages/formal-verification/hwcbmc">HW-CBMC</a>.</li>
  <li><b>After transforms</b>: run structural workflows (PDR/BMC/CEC) via <a href="{{ site.baseurl }}/pages/formal-verification/abc">ABC harness</a>.</li>
  <li><b>Data-path corner cases</b>: encode constraints and ask for witnesses via <a href="{{ site.baseurl }}/pages/formal-verification/cvc5">CVC5</a>.</li>
</ul>

<p class="meta">This page is intentionally conservative: it lists only what is already implemented and runnable.</p>
