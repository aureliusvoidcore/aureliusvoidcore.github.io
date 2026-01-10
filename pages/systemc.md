---
layout: default
title: SystemC
---

## SystemC Models

Modeling notes and patterns that connect high-level SystemC to verification.

### What it is
<ul>
	<li><b>TLM</b>: fast architectural exploration and integration models.</li>
	<li><b>Cycle-accurate</b>: when you need timing/handshake fidelity.</li>
	<li><b>Bridges</b>: co-simulation and “golden model” comparisons.</li>
</ul>

### Connections to verification
<ul>
	<li>SystemC models help you define assumptions and interfaces before you drop to RTL.</li>
	<li>Once the RTL exists, use <a href="{{ site.baseurl }}/pages/formal-verification">Formal Verification</a> tools to check properties and extract traces.</li>
</ul>
