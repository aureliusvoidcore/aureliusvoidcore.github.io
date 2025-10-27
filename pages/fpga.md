---
layout: default
title: FPGA
---

## FPGA

Notes on RTL design, timing closure, HLS, and debug instrumentation.

### RTL sample

```verilog
module blink #(parameter N=24)(
  input  wire clk,
  output reg  led
);
  reg [N-1:0] ctr;
  always @(posedge clk) begin
    ctr <= ctr + 1'b1;
    if (&ctr) led <= ~led;
  end
endmodule
```
