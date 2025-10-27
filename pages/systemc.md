---
layout: default
title: SystemC
---

## SystemC Models

Transaction-level modeling (TLM) and cycle-accurate models for complex subsystems.

```cpp
#include <systemc>
using namespace sc_core;

SC_MODULE(alu) {
  sc_in<bool> clk;
  sc_in<int>  a, b; sc_out<int> y;
  void proc(){ while(true){ wait(); y = a.read() + b.read(); }}
  SC_CTOR(alu){ SC_THREAD(proc); sensitive << clk.pos(); }
};
```
