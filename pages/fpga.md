---
layout: default
title: FPGA
---

## FPGA

Notes on RTL design, timing closure, HLS, and debug instrumentation.

<p>
  <a class="button" href="{{ site.baseurl }}/pages/fpga/abc">Open ABC Demo UI</a>
  <span class="meta">Runs the WebAssembly build of ABC in-browser.</span>
</p>

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
