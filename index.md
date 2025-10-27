---
layout: default
title: Home
---

<section class="hero card">
  <h2 class="glitch" data-text="Alien Cybernetics & Formal Methods">Alien Cybernetics & Formal Methods</h2>
  <p>Verification. FPGA. SystemC. Mathematics. Strange attractors. Synthwave logic. Welcome to the lab.</p>
  <p>
    <a class="button" href="{{ site.baseurl }}/pages/formal-verification">Formal Verification</a>
    <a class="button" href="{{ site.baseurl }}/pages/fpga">FPGA</a>
    <a class="button" href="{{ site.baseurl }}/pages/systemc">SystemC</a>
  </p>
</section>

<h2>Domains</h2>
<div class="grid">
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/formal-verification">Formal Verification</a></h3>
    <p>Model checking, SAT/SMT, property-driven design, and proof engineering.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/fpga">FPGA</a></h3>
    <p>RTL, timing closure, high-level synthesis, and on-chip instrumentation.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/systemc">SystemC</a></h3>
    <p>TLM, cycle-accurate models, and co-simulation bridges for alien IP.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/pages/mathematics">Mathematics</a></h3>
    <p>Category theory, algebraic constructs, and applied probability for hardware.</p>
  </div>
  <div class="card">
    <h3><a href="{{ site.baseurl }}/blog">Blog</a></h3>
    <p>Lab notes, walkthroughs, and deep dives in Markdown.</p>
  </div>
 </div>

<h2>Recent Blog Entries</h2>
<ul>
  {% for post in site.posts limit:10 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> — {{ post.date | date: "%B %d, %Y" }}
    </li>
  {% endfor %}
  {% if site.posts == empty %}
    <li>No posts yet. Create one in <code>_posts/YYYY-MM-DD-title.md</code>.</li>
  {% endif %}
</ul>
