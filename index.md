---
layout: default
title: Home
---

<section class="lux-hero">
  <div class="lux-pre rev-blur">THE PINNACLE OF FORMAL METHODS</div>
  <h1 class="lux-h1 rev-blur" style="transition-delay: 0.1s">VOIDCORE</h1>
  <p class="lux-sub rev-blur" style="transition-delay: 0.2s">A zero-cloud, WebAssembly-native formal methods laboratory. Uncompromising precision. Absolute local control.</p>
  <a href="{{ site.baseurl }}/pages/formal-verification" class="lux-btn rev-blur" style="transition-delay: 0.3s">Initialize Lab</a>
</section>

<section class="lux-metrics">
  <div class="metric-grid">
    <div class="metric-col rev-blur">
      <div class="metric-val">03</div>
      <div class="metric-lbl">WASM NATIVE ENGINES</div>
    </div>
    <div class="metric-col rev-blur" style="transition-delay: 0.1s">
      <div class="metric-val">00</div>
      <div class="metric-lbl">CLOUD DEPENDENCIES</div>
    </div>
    <div class="metric-col rev-blur" style="transition-delay: 0.2s">
      <div class="metric-val">100<span style="font-size:0.5em">%</span></div>
      <div class="metric-lbl">LOCAL EXECUTION</div>
    </div>
  </div>
</section>

<section class="lux-stack-sec">
  <div class="lux-stack-title rev-blur">
    <div class="lux-pre">RUNTIME ARCHITECTURE</div>
    <h2>ACTIVE ENGINES</h2>
  </div>

  <div class="lux-glass-stack">
    
    <div class="lux-plate-wrap">
      <div class="lux-plate">
        <div class="plate-col">
          <div class="plate-num">01. PROCESSOR</div>
          <h3 class="plate-title">ABC SOLVER</h3>
          <p class="plate-desc">Combinational equivalence checking and network optimization via And-Inverter Graphs. Complete hardware synthesis and formal proof flows running silently in your browser.</p>
          <a href="{{ site.baseurl }}/pages/formal-verification-abc" class="lux-btn">ENGAGE ABC</a>
        </div>
        <div class="plate-col">
          <div class="plate-img-stub">
            <div class="plate-placeholder-code">
  module proof_target(
    input clk,
    input reset,
    output valid
  );
  // verifying AIG netlist
  assert property (valid);
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lux-plate-wrap">
      <div class="lux-plate">
        <div class="plate-col">
          <div class="plate-num">02. PROCESSOR</div>
          <h3 class="plate-title">CVC5 PROVER</h3>
          <p class="plate-desc">Satisfiability Modulo Theories solving for bit-vectors, arrays, and arithmetic. Full SMTLIB 2.6 compliance mapped entirely to local V8 compilation.</p>
          <a href="{{ site.baseurl }}/pages/formal-verification-cvc5" class="lux-btn">ENGAGE CVC5</a>
        </div>
        <div class="plate-col">
          <div class="plate-img-stub">
            <div class="plate-placeholder-code">
  (set-logic QF_BV)
  (declare-fun x () (_ BitVec 32))
  (assert (= (bvulor x x) #x00000000))
  (check-sat)
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lux-plate-wrap">
      <div class="lux-plate">
        <div class="plate-col">
          <div class="plate-num">03. PROCESSOR</div>
          <h3 class="plate-title">HW-CBMC</h3>
          <p class="plate-desc">Bounded model checking for SystemC and ANSI-C hardware descriptions. Automatic loop unrolling driving verified property certificates without server telemetry.</p>
          <a href="{{ site.baseurl }}/pages/formal-verification-hwcbmc" class="lux-btn">ENGAGE HW-CBMC</a>
        </div>
        <div class="plate-col">
          <div class="plate-img-stub">
            <div class="plate-placeholder-code">
  void __CPROVER_assume(bool);
  void __CPROVER_assert(bool, char*);
  
  // Checking invariants bounded bounds
  __CPROVER_assert(state == VALID);
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
