---
layout: default
title: Chisel assertions for formal verification
permalink: /pages/formal-verification/chisel-assertions
---

# Chisel assertions for formal verification

Chisel is well-suited for expressing design intent because the same source that defines your RTL can also define *properties* that are carried into the generated SystemVerilog for formal tools.

On this site, the typical flow is to use the ChiselForge IDE, elaborate a module that contains properties, and then run hardware model checking to either produce a counterexample trace or attempt a proof.

## Where to run it

- Open ChiselForge: [/chisel_forge/dist/](/chisel_forge/dist/)
- Pick a module that has properties (for example, `PWMLEDAXI` in the included examples)
- Run verification (HW-CBMC)
- If a trace is generated, open it in the built-in waveform viewer

## Notes

- Not every example module includes formal properties. If a verification run produces no properties (or no trace), try another module with properties or add properties to your own design.
- The Files tab shows both locally persisted verification artifacts and (when running with the Node backend) backend-generated artifacts under the Chisel `generated/` directory.
