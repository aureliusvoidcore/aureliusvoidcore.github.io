// ── VALHALLA CORE DRIVER ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // 1. Mouse Spotlight with Inertia
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let tx = mx, ty = my;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  
  function renderLight() {
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    document.documentElement.style.setProperty('--mx', `${mx}px`);
    document.documentElement.style.setProperty('--my', `${my}px`);
    requestAnimationFrame(renderLight);
  }
  requestAnimationFrame(renderLight);

  // 2. Cinematic Blur Reveals
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('is-revealed');
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rev-blur').forEach(el => io.observe(el));

  // 3. Nav scroll frost
  const nav = document.getElementById('lux-nav');
  window.addEventListener('scroll', () => {
    if(nav) nav.classList.toggle('is-scrolled', window.scrollY > 50);
  }, {passive:true});

  // 4. Sticky Glass Stack Physics
  const stackBase = document.querySelector('.lux-glass-stack');
  const wrappers = document.querySelectorAll('.lux-plate-wrap');
  if (wrappers.length > 0 && stackBase) {
    stackBase.style.height = `${wrappers.length * 100}vh`;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          wrappers.forEach((wrap, i) => {
            const plate = wrap.querySelector('.lux-plate');
            if(!plate) return;
            const rect = wrap.getBoundingClientRect();
            
            // If rect.top <= 0, the wrap is sticking to the top, and we are scrolling past it.
            if (rect.top <= 0) {
              let progress = Math.abs(rect.top) / window.innerHeight;
              progress = Math.max(0, Math.min(progress, 1));
              
              const scale = 1 - (0.08 * progress);
              const filter = `blur(${progress * 12}px)`;
              const brightness = 1 - (0.7 * progress); // darkens up to 70%
              
              plate.style.transform = `scale(${scale})`;
              plate.style.filter = `${filter} brightness(${brightness})`;
            } else {
              plate.style.transform = `scale(1)`;
              plate.style.filter = `blur(0px) brightness(1)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, {passive: true});
  }

  // 5. Button Physics Wrap to support the luxury fill hover
  document.querySelectorAll('.button').forEach(btn => {
    // only wrap if we haven't
    if (btn.childNodes.length === 1 && btn.childNodes[0].nodeType === 3) {
      const span = document.createElement('span');
      span.textContent = btn.textContent;
      btn.textContent = '';
      btn.appendChild(span);
    }
  });
});
