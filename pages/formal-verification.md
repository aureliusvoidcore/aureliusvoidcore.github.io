---
layout: default
title: Formal Verification
---

## Formal Verification

This section collects property specifications, model checking workflows, and SAT/SMT encodings.

### Tools

- CVC5 Web (WASM): <a class="button" href="{{ site.baseurl }}/pages/formal-verification/cvc5">Open Advanced Interface</a>
 - ABC Web (WASM): <a class="button" href="{{ site.baseurl }}/pages/formal-verification/abc">Open Formal Harness (PDR/BMC/CEC)</a>
 - ABC Demo UI: <a class="button" href="{{ site.baseurl }}/abc_build/" target="_blank" rel="noopener">Open abc_build demo</a>

### Property example (SVA)

```systemverilog
// Assume-Guarantee sketch
property safe_handshake;
  @(posedge clk) disable iff (!rst_n)
    req |=> ##[1:3] gnt;
endproperty
assert property (safe_handshake);
```

### SMT snippet (Z3)

```smt2
(set-logic QF_BV)
(declare-fun a () (_ BitVec 8))
(declare-fun b () (_ BitVec 8))
(assert (= (bvadd a b) #x2a))
(check-sat)
(get-model)
```
