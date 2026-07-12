/* ============================================================
   ClaraVista — Limpiador de Parabrisas · Lógica de la landing
   HTML5 + CSS + JavaScript Vanilla (sin librerías)
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.PRODUCT_CONFIG;
  const CITIES = window.PY_CITIES || [];
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const fmt = (n) => 'Gs. ' + Number(n).toLocaleString('es-PY');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  /* ---------- estado ---------- */
  const state = {
    qty: 1,
    stock: CFG.urgency.stockStart,
    viewers: rand(CFG.urgency.viewersMin, CFG.urgency.viewersMax),
    offer: CFG.urgency.offerClaimedStart,
    formStarted: false,
    submitting: false
  };

  /* ---------- feature flags (config + overrides locales) ---------- */
  const FKEY = 'cv_features';
  let features = Object.assign({}, CFG.features);
  try {
    const saved = JSON.parse(localStorage.getItem(FKEY) || '{}');
    features = Object.assign(features, saved);
  } catch (e) {}

  function applyFeatures() {
    $$('[data-f]').forEach((el) => {
      const key = el.getAttribute('data-f');
      if (key in features) el.style.display = features[key] ? '' : 'none';
    });
    document.body.classList.toggle('has-sticky', !!features.stickyMobileBar);
  }

  function setFeature(key, val) {
    features[key] = val;
    try {
      const saved = JSON.parse(localStorage.getItem(FKEY) || '{}');
      saved[key] = val;
      localStorage.setItem(FKEY, JSON.stringify(saved));
    } catch (e) {}
    applyFeatures();
  }

  /* ---------- precios en el DOM ---------- */
  function paintStaticPrices() {
    const price = fmt(CFG.price), old = fmt(CFG.oldPrice);
    $('#heroNow').textContent = price;
    $('#heroOld').textContent = old;
    $('#midPrice').textContent = price;
    $('#finalPrice').textContent = price;
    $('#smPrice').textContent = price;
    $('#sumUnit').textContent = price;
  }

  /* ---------- lazy load de imágenes + skeleton ---------- */
  function initLazy() {
    const load = (img) => {
      if (img.dataset.loaded || !img.dataset.src) return;
      img.dataset.loaded = '1';
      img.src = img.dataset.src;
      const done = () => { const sk = img.closest('.skeleton'); if (sk) sk.classList.remove('skeleton'); };
      img.addEventListener('load', () => { img.classList.add('loaded'); done(); }, { once: true });
      img.addEventListener('error', done, { once: true });
    };
    const check = () => {
      const margin = 400;
      $$('img.lazy-img').forEach((img) => {
        if (img.dataset.loaded) return;
        const r = img.getBoundingClientRect();
        if (r.top < window.innerHeight + margin && r.bottom > -margin) load(img);
      });
    };
    let ticking = false;
    const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { check(); ticking = false; }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // fallback total: si algo queda sin cargar, cargalo tras load de la página
    window.addEventListener('load', () => setTimeout(() => $$('img.lazy-img').forEach(load), 1200));
    window.__loadLazyIn = (root) => $$('img.lazy-img', root).forEach(load);
    check();
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const d = e.target.getAttribute('data-delay') || 0;
          e.target.style.transitionDelay = d + 'ms';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- hero thumbnails ---------- */
  function initHeroThumbs() {
    const heroImg = $('.hero-frame img');
    $$('.hero-thumb').forEach((t) => {
      t.addEventListener('click', () => {
        const idx = parseInt(t.getAttribute('data-gallery'));
        const src = GALLERY[idx];
        if (src) {
          heroImg.src = src;
          heroImg.dataset.loaded = '1';
          $$('.hero-thumb').forEach((el, k) => el.classList.toggle('active', k === idx));
        }
      });
    });
  }

  /* ---------- header scrolled ---------- */
  function initHeader() {
    const h = $('#header');
    const on = () => h.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', on, { passive: true });
    on();
  }

  /* ---------- galería + lightbox ---------- */
  const GALLERY = CFG.images.gallery;
  let galIdx = 0;

  function initGallery() {
    const main = $('#galleryImg');
    const thumbs = $('#thumbs');
    GALLERY.forEach((src, i) => {
      const t = document.createElement('div');
      t.className = 'thumb' + (i === 0 ? ' active' : '');
      t.innerHTML = '<img src="' + src + '" alt="Miniatura ' + (i + 1) + '">';
      t.addEventListener('click', () => selectGallery(i));
      thumbs.appendChild(t);
    });
    function selectGallery(i) {
      galIdx = i;
      main.src = GALLERY[i];
      main.dataset.loaded = '1';
      $$('.thumb', thumbs).forEach((el, k) => el.classList.toggle('active', k === i));
    }
    window.__selectGallery = selectGallery;

    const openLb = () => openLightbox(galIdx);
    $('#galleryMain').addEventListener('click', openLb);
    $('#galleryMain').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
  }

  function initLightbox() {
    const lb = $('#lightbox'), img = $('#lbImg'), thumbs = $('#lbThumbs');
    GALLERY.forEach((src, i) => {
      const t = document.createElement('img');
      t.src = src; t.alt = 'Miniatura ' + (i + 1);
      t.addEventListener('click', () => setLb(i));
      thumbs.appendChild(t);
    });
    function setLb(i) {
      galIdx = clamp(i, 0, GALLERY.length - 1);
      img.src = GALLERY[galIdx];
      $$('img', thumbs).forEach((el, k) => el.classList.toggle('active', k === galIdx));
    }
    window.__setLb = setLb;
    const close = () => { lb.classList.remove('show'); document.body.classList.remove('no-scroll'); };
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => setLb((galIdx - 1 + GALLERY.length) % GALLERY.length));
    $('#lbNext').addEventListener('click', () => setLb((galIdx + 1) % GALLERY.length));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') setLb((galIdx - 1 + GALLERY.length) % GALLERY.length);
      if (e.key === 'ArrowRight') setLb((galIdx + 1) % GALLERY.length);
    });
    // swipe
    let sx = 0;
    img.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) setLb((galIdx + (dx < 0 ? 1 : -1) + GALLERY.length) % GALLERY.length);
    });
  }

  function openLightbox(i) {
    $('#lightbox').classList.add('show');
    document.body.classList.add('no-scroll');
    window.__setLb(i);
  }

  /* ---------- antes / después ---------- */
  function initBeforeAfter() {
    const ba = $('#ba'), reveal = $('#baReveal'), handle = $('#baHandle');
    let pos = 50;
    const set = (x) => {
      pos = clamp(x, 2, 98);
      reveal.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      handle.style.left = pos + '%';
    };
    set(50);
    const move = (e) => {
      const r = ba.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      set(((cx - r.left) / r.width) * 100);
    };
    const start = (e) => {
      move(e);
      const mv = (ev) => move(ev);
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
    };
    ba.addEventListener('pointerdown', start);
  }

  /* ---------- testimonios ---------- */
  const TESTIMONIALS = [
    { n: 'Carlos Giménez', c: 'Asunción', ini: 'CG', bg: '#1e3a8a', t: 'Manejo Uber todas las noches y las luces de los otros autos me encandilaban muchísimo. Con esto el parabrisas quedó impecable, ahora veo perfecto de noche. Lo mejor que compré para mi auto.' },
    { n: 'Fernando López', c: 'Luque', ini: 'FL', bg: '#b91c1c', t: 'Increíble. Tenía una película grasosa que ni el limpiaparabrisas sacaba. En cinco minutos el vidrio quedó como nuevo. Cuando llueve el agua se desliza sola.' },
    { n: 'María Ayala', c: 'San Lorenzo', ini: 'MA', bg: '#0e7490', t: 'Lo compré para el auto de la familia. Súper fácil de usar y el resultado es inmediato. Los reflejos molestos desaparecieron. Recomendadísimo.' },
    { n: 'Rodrigo Núñez', c: 'Capiatá', ini: 'RN', bg: '#4338ca', t: 'Soy taxista y paso todo el día manejando. La visibilidad mejoró un montón, sobre todo bajo lluvia. Llegó rápido y pagué al recibir. Todo perfecto.' },
    { n: 'Lucía Benítez', c: 'Fernando de la Mora', ini: 'LB', bg: '#be123c', t: 'Pensé que era exagerado pero realmente funciona. El vidrio quedó cristalino, sin manchas de agua ni grasa. Ahora manejo mucho más tranquila de noche.' },
    { n: 'Diego Rojas', c: 'Encarnación', ini: 'DR', bg: '#1d4ed8', t: 'La diferencia de antes y después es enorme. El parabrisas estaba siempre opaco y ya no. Muy buena calidad, se siente premium. Volvería a comprar.' },
    { n: 'Patricia Duarte', c: 'Ciudad del Este', ini: 'PD', bg: '#9333ea', t: 'Excelente atención y envío gratis hasta CDE. El producto cumple lo que promete: adiós película aceitosa y hola visibilidad clara.' },
    { n: 'Miguel Fretes', c: 'Mariano Roque Alonso', ini: 'MF', bg: '#0f766e', t: 'Manejo con la familia todos los fines de semana y la seguridad es lo primero. Ahora veo nítido bajo cualquier condición. Vale cada guaraní.' }
  ];
  function renderTestimonials() {
    const g = $('#testiGrid');
    g.innerHTML = TESTIMONIALS.map((t) => (
      '<div class="testi-card">' +
        '<div class="stars">★★★★★</div>' +
        '<p>"' + t.t + '"</p>' +
        '<div class="testi-foot">' +
          '<div class="avatar" style="background:' + t.bg + '">' + t.ini + '</div>' +
          '<div><div class="nm">' + t.n + '</div><div class="ct">📍 ' + t.c + '</div></div>' +
        '</div>' +
      '</div>'
    )).join('');
  }

  /* ---------- FAQ ---------- */
  const FAQS = [
    { q: '¿Sirve para cualquier vehículo?', a: 'Sí. Funciona en autos, camionetas, SUV y motos. Es seguro para parabrisas, ventanas laterales, vidrio trasero y espejos retrovisores de cualquier marca.' },
    { q: '¿Cuánto dura el producto?', a: 'Con un uso normal rinde varios meses. El cepillo es reutilizable y su almohadilla mantiene el rendimiento durante cientos de aplicaciones.' },
    { q: '¿Hace rayones en el vidrio?', a: 'No. La almohadilla es de material suave especialmente diseñado para limpiar sin rayar ni dañar el vidrio ni los tratamientos del parabrisas.' },
    { q: '¿Puedo usarlo varias veces?', a: 'Sí, es 100% reutilizable. Solo enjuagás la almohadilla después de cada uso y queda listo para la próxima limpieza.' },
    { q: '¿Tiene garantía?', a: 'Sí. Contás con garantía de satisfacción. Si el producto llega con algún defecto, lo reemplazamos sin costo.' },
    { q: '¿Cómo pago?', a: 'Pagás en efectivo cuando recibís el producto en tu casa (pago contra entrega). No necesitás pagar nada por adelantado.' },
    { q: '¿Dónde hacen envíos?', a: 'Hacemos envíos con delivery GRATIS en Asunción y Central. Para otras localidades consultanos y coordinamos.' }
  ];
  function renderFaq() {
    const f = $('#faq');
    f.innerHTML = FAQS.map((it, i) => (
      '<div class="faq-item" data-i="' + i + '">' +
        '<div class="faq-q"><div class="q">' + it.q + '</div><div class="faq-icon">+</div></div>' +
        '<div class="faq-a"><p>' + it.a + '</p></div>' +
      '</div>'
    )).join('');
    $$('.faq-item', f).forEach((item) => {
      item.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.faq-item', f).forEach((el) => el.classList.remove('open'));
        if (!open) item.classList.add('open');
      });
    });
  }

  /* ---------- cantidad + resumen ---------- */
  function updateSummary() {
    const total = CFG.price * state.qty;
    $('#qtyVal').textContent = state.qty;
    $('#sumQty').textContent = state.qty;
    $('#sumTotal').textContent = fmt(total);
  }
  function bumpQty() {
    const el = $('#qtyVal');
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 200);
  }
  function initQty() {
    $('#qtyInc').addEventListener('click', () => { state.qty = clamp(state.qty + 1, 1, 9); bumpQty(); updateSummary(); });
    $('#qtyDec').addEventListener('click', () => { state.qty = clamp(state.qty - 1, 1, 9); bumpQty(); updateSummary(); });
    updateSummary();
  }

  /* ---------- countdown (reinicia cada día) ---------- */
  function initCountdown() {
    const H = $('#cdH'), M = $('#cdM'), S = $('#cdS');
    const pad = (v) => String(v).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      const end = new Date(); end.setHours(23, 59, 59, 999);
      if (end < now) end.setDate(end.getDate() + 1);
      let d = Math.max(0, Math.floor((end - now) / 1000));
      H.textContent = pad(Math.floor(d / 3600));
      M.textContent = pad(Math.floor((d % 3600) / 60));
      S.textContent = pad(d % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- stock dinámico ---------- */
  function paintStock() {
    $('#stockNum').textContent = state.stock;
    const pct = clamp(Math.round((state.stock / (CFG.urgency.stockStart + 4)) * 100), 14, 100);
    $('#stockBar').style.width = pct + '%';
  }
  function initStock() {
    paintStock();
    if (!features.stockDecay) return;
    const step = () => {
      if (state.stock > CFG.urgency.stockMin && Math.random() < 0.65) {
        state.stock -= 1;
        paintStock();
      }
      setTimeout(step, rand(22000, 55000));
    };
    setTimeout(step, rand(18000, 30000));
  }

  /* ---------- oferta del día ---------- */
  function initOffer() {
    const pctEl = $('#offerPct'), bar = $('#offerBar');
    pctEl.textContent = state.offer; bar.style.width = state.offer + '%';
    if (!features.offerProgress) return;
    const step = () => {
      if (state.offer < 96 && Math.random() < 0.6) {
        state.offer += 1;
        pctEl.textContent = state.offer;
        bar.style.width = state.offer + '%';
      }
      setTimeout(step, rand(30000, 70000));
    };
    setTimeout(step, rand(20000, 40000));
  }

  /* ---------- personas viendo ---------- */
  function initViewers() {
    const el = $('#viewersCount');
    el.textContent = state.viewers;
    if (!features.liveViewers) return;
    setInterval(() => {
      state.viewers = clamp(state.viewers + rand(-2, 2), CFG.urgency.viewersMin, CFG.urgency.viewersMax);
      el.textContent = state.viewers;
    }, rand(5000, 9000));
  }

  /* ---------- prueba social bottom-left (compras + beneficios) ---------- */
  const FIRST_NAMES = ['Carlos', 'Ana', 'Pedro', 'María', 'Jorge', 'Lucía', 'Diego', 'Sofía', 'Miguel', 'Patricia', 'Rodrigo', 'Fernando', 'Gabriela', 'Javier', 'Laura', 'Andrés', 'Cristina', 'Roberto', 'Verónica', 'Hugo'];
  const BENEFITS = ['Pago contra entrega', 'Delivery gratis en Asunción y Central', 'Garantía de calidad'];
  let socialLock = false;

  function showRecentToast() {
    const t = $('#recentToast');
    const name = FIRST_NAMES[rand(0, FIRST_NAMES.length - 1)];
    const city = CITIES[rand(0, CITIES.length - 1)];
    $('#rtName').textContent = name + ' de ' + city;
    $('#rtTime').textContent = 'hace ' + rand(2, 12) + ' minutos';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 5200);
  }
  function showBenefit() {
    const b = $('#floatBenefit');
    $('#fbText').textContent = BENEFITS[rand(0, BENEFITS.length - 1)];
    b.classList.add('show');
    setTimeout(() => b.classList.remove('show'), 4200);
  }
  function initSocialProof() {
    const tick = () => {
      if (!socialLock) {
        const canPurchase = features.recentPurchases;
        const canBenefit = features.floatingBenefits;
        if (canPurchase || canBenefit) {
          socialLock = true;
          const pickBenefit = canBenefit && (!canPurchase || Math.random() < 0.35);
          if (pickBenefit) showBenefit(); else showRecentToast();
          setTimeout(() => { socialLock = false; }, 6000);
        }
      }
      setTimeout(tick, rand(11000, 18000));
    };
    setTimeout(tick, 6000);
  }

  /* ---------- sticky mobile + back to top ---------- */
  function initScrollUI() {
    const sticky = $('#stickyMobile');
    const top = $('#backToTop');
    const pedido = $('#pedido');
    const onScroll = () => {
      const y = window.scrollY;
      const nearForm = pedido.getBoundingClientRect().top < window.innerHeight * 0.9;
      if (features.stickyMobileBar) sticky.classList.toggle('show', y > 620 && !nearForm && window.innerWidth <= 640);
      if (features.backToTop) top.classList.toggle('show', y > 800);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  /* ---------- checkout modal ---------- */
  function openCheckout() {
    $('#checkoutModal').classList.add('show');
    document.body.classList.add('no-scroll');
    if (window.__loadLazyIn) window.__loadLazyIn($('#checkoutModal'));
    track('begin_checkout');
    setTimeout(() => { const f = $('input[name="nombre"]'); if (f) f.focus({ preventScroll: true }); }, 250);
  }
  function closeCheckout() {
    $('#checkoutModal').classList.remove('show');
    if (!$('#success').classList.contains('show') && !$('#mapModal').classList.contains('show')) {
      document.body.classList.remove('no-scroll');
    }
  }
  function initCTAs() {
    $$('[data-cta]').forEach((b) => b.addEventListener('click', () => {
      track('click_cta', { location: b.getAttribute('data-cta') });
      openCheckout();
    }));
    $('#checkoutClose').addEventListener('click', closeCheckout);
    $('#checkoutModal').addEventListener('click', (e) => { if (e.target.id === 'checkoutModal') closeCheckout(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#checkoutModal').classList.contains('show') && !$('#mapModal').classList.contains('show')) closeCheckout();
    });
  }

  /* ---------- toast validación ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = '⚠️ ' + msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  }

  /* ---------- validación de formulario ---------- */
  function isPhone(v) {
    const c = v.replace(/[\s\-()]/g, '');
    return /^(?:\+595|0)?\d{8,10}$/.test(c);
  }
  const VALIDATORS = {
    nombre: (v) => v.trim().length >= 3,
    telefono: (v) => isPhone(v),
    ciudad: (v) => v.trim().length >= 3,
    direccion: (v) => v.trim().length >= 4
  };
  function validateField(name, force) {
    const wrap = $('.field[data-field="' + name + '"]');
    if (!wrap) return true;
    const input = $('input', wrap);
    const val = input.value;
    if (name === 'referencia') return true;
    const ok = VALIDATORS[name] ? VALIDATORS[name](val) : val.trim().length > 0;
    wrap.classList.toggle('ok', ok);
    wrap.classList.toggle('err', !ok && (force || val.length > 0));
    return ok;
  }
  function initForm() {
    $$('.field input').forEach((input) => {
      const name = input.name;
      input.addEventListener('input', () => {
        if (!state.formStarted) { state.formStarted = true; track('form_started'); }
        if ($('.field[data-field="' + name + '"]').classList.contains('err')) validateField(name);
      });
      input.addEventListener('blur', () => { if (input.value) validateField(name); });
    });
  }

  /* ---------- selector de ubicación en el mapa (estilo Bolso, con Leaflet) ---------- */
  let leafMap = null, leafMarker = null, selectedMapLink = '';
  function mapsUrl(lat, lng) { return 'https://www.google.com/maps?q=' + lat.toFixed(6) + ',' + lng.toFixed(6); }
  function setMapLink(link) {
    selectedMapLink = link;
    const linkInput = $('#mapLinkInput'), open = $('#mapOpenLink');
    if (linkInput) linkInput.value = link;
    if (open) open.href = link || 'https://www.google.com/maps';
  }
  function moveMap(lat, lng, zoom) {
    setMapLink(mapsUrl(lat, lng));
    if (!leafMap) return;
    leafMap.setView([lat, lng], zoom || leafMap.getZoom());
    if (!leafMarker) {
      leafMarker = L.marker([lat, lng], { draggable: true }).addTo(leafMap);
      leafMarker.on('dragend', () => { const p = leafMarker.getLatLng(); moveMap(p.lat, p.lng, leafMap.getZoom()); });
    } else {
      leafMarker.setLatLng([lat, lng]);
    }
  }
  function initMapInstance() {
    if (leafMap || typeof L === 'undefined') return;
    const def = [-25.2637, -57.5759]; // Asunción
    leafMap = L.map('mapPicker', { zoomControl: true }).setView(def, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(leafMap);
    leafMap.on('click', (e) => moveMap(e.latlng.lat, e.latlng.lng, leafMap.getZoom()));
    moveMap(def[0], def[1], 13);
  }
  function openMapModal() {
    const m = $('#mapModal');
    m.classList.add('show');
    document.body.classList.add('no-scroll');
    initMapInstance();
    setTimeout(() => { if (leafMap) leafMap.invalidateSize(); }, 120);
  }
  function closeMapModal() {
    $('#mapModal').classList.remove('show');
    if ($('#checkoutModal').classList.contains('show')) return; // el checkout sigue abierto
    document.body.classList.remove('no-scroll');
  }
  async function searchMapLocation() {
    const q = ($('#mapSearch').value || '').trim();
    const err = $('#mapError');
    if (!q) { err.textContent = 'Escribí una dirección o lugar para buscar.'; return; }
    err.textContent = 'Buscando ubicación…';
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q + ', Paraguay'));
      const data = await res.json();
      if (!data.length) { err.textContent = 'No encontramos esa dirección. Probá con otra referencia.'; return; }
      moveMap(Number(data[0].lat), Number(data[0].lon), 17);
      err.textContent = 'Tocá el mapa o arrastrá el pin para ajustar la ubicación exacta.';
    } catch (e) {
      err.textContent = 'No se pudo buscar. Tocá directamente el mapa para marcar la ubicación.';
    }
  }
  function initMapPicker() {
    $$('[data-open-map]').forEach((b) => b.addEventListener('click', openMapModal));
    $$('[data-close-map]').forEach((b) => b.addEventListener('click', closeMapModal));
    $('#mapModal').addEventListener('click', (e) => { if (e.target.id === 'mapModal') closeMapModal(); });
    $('#mapSearchButton').addEventListener('click', searchMapLocation);
    $('#mapSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchMapLocation(); } });
    $('#mapLinkInput').addEventListener('input', (e) => setMapLink(e.target.value.trim()));
    $('#mapConfirm').addEventListener('click', () => {
      const link = ($('#mapLinkInput').value || '').trim() || selectedMapLink;
      $('#mapsInput').value = link;
      closeMapModal();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#mapModal').classList.contains('show')) closeMapModal(); });
  }

  function collectForm() {
    const g = (n) => ($('input[name="' + n + '"]') || {}).value || '';
    return {
      nombre: g('nombre').trim(),
      telefono: g('telefono').trim(),
      ciudad: g('ciudad').trim(),
      direccion: g('direccion').trim(),
      referencia: g('referencia').trim(),
      map: g('map').trim()
    };
  }

  function validateAll() {
    const fields = ['nombre', 'telefono', 'ciudad', 'direccion'];
    let firstBad = null;
    fields.forEach((f) => { if (!validateField(f, true) && !firstBad) firstBad = f; });
    if (firstBad) {
      const el = $('.field[data-field="' + firstBad + '"] input');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.focus({ preventScroll: true }), 300);
    }
    return !firstBad;
  }

  /* ---------- envío del pedido a Supabase (un solo paso) ---------- */
  function orderNumber() {
    return '#PY' + Date.now().toString().slice(-6) + rand(10, 99);
  }
  async function saveOrder(order) {
    const r = await fetch(CFG.supabaseUrl + '/rest/v1/' + CFG.supabaseTable, {
      method: 'POST',
      headers: {
        apikey: CFG.supabaseAnonKey,
        Authorization: 'Bearer ' + CFG.supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(order)
    });
    if (!r.ok) throw new Error(await r.text().catch(() => 'error'));
  }

  // Al tocar "CONFIRMAR PEDIDO": valida, guarda el pedido y muestra el resumen final.
  async function confirmAndSubmit() {
    if (state.submitting) return;
    if (!validateAll()) {
      toast('Completá nombre, teléfono, ciudad y dirección');
      return;
    }
    const data = collectForm();
    const btn = $('#openConfirm');
    const total = CFG.price * state.qty;
    const id = orderNumber();
    const refParts = ['Cantidad: ' + state.qty];
    if (data.referencia) refParts.push('Referencia: ' + data.referencia);
    refParts.push('Pago contra entrega');

    const order = {
      id: id,
      producto: CFG.name,
      precio: CFG.price,
      cantidad: state.qty,
      subtotal: total,
      ganancia: 0,
      nombre: data.nombre,
      telefono: data.telefono,
      correo: 'No informado',
      ci: 'No informado',
      departamento: '',
      ciudad: data.ciudad,
      direccion: data.direccion,
      referencia: refParts.join(' | '),
      ubicacion_maps: data.map || 'No informado',
      estado: 'Pendiente',
      origen: CFG.origin,
      created_at: new Date().toISOString()
    };

    track('form_submitted');
    state.submitting = true;
    btn.classList.add('loading');
    btn.disabled = true;
    try {
      await saveOrder(order);
    } catch (e) {
      console.error(e);
      state.submitting = false;
      btn.classList.remove('loading');
      btn.disabled = false;
      toast('No se pudo enviar el pedido. Revisá tu conexión e intentá de nuevo.');
      return;
    }
    state.submitting = false;
    btn.classList.remove('loading');
    btn.disabled = false;
    $('#checkoutModal').classList.remove('show');
    showSuccess(order);
    track('purchase', { transaction_id: id, value: total, quantity: state.qty });
  }

  /* ---------- pantalla de éxito ---------- */
  function showSuccess(order) {
    $('#successOrderNum').textContent = order.id;
    $('#successQty').textContent = order.cantidad;
    $('#successTotal').textContent = fmt(order.subtotal);
    $('#successPhone').textContent = order.telefono;
    const s = $('#success');
    s.classList.add('show');
    s.scrollTop = 0;
    document.body.classList.add('no-scroll');
  }
  function initConfirmFlow() {
    $('#openConfirm').addEventListener('click', confirmAndSubmit);
    $('#backHome').addEventListener('click', () => {
      $('#success').classList.remove('show');
      document.body.classList.remove('no-scroll');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // reset del formulario
      $('#orderForm').reset();
      const mi = $('#mapsInput'); if (mi) mi.value = '';
      selectedMapLink = '';
      $$('.field').forEach((f) => f.classList.remove('ok', 'err'));
      state.qty = 1; updateSummary();
      state.formStarted = false;
    });
  }

  /* ---------- panel de configuración ---------- */
  const FEATURE_LABELS = {
    announcementBar: 'Barra de anuncios',
    stockCounter: 'Contador de stock',
    stockDecay: 'Stock que baja solo',
    liveViewers: 'Personas viendo',
    recentPurchases: 'Compras recientes',
    offerProgress: 'Barra "oferta del día"',
    countdown: 'Temporizador de oferta',
    stickyMobileBar: 'Barra fija mobile',
    floatingBenefits: 'Beneficios flotantes',
    backToTop: 'Botón volver arriba'
  };
  function initConfigPanel() {
    const rows = $('#cpRows');
    rows.innerHTML = Object.keys(FEATURE_LABELS).map((k) => (
      '<div class="cp-row"><label for="cp_' + k + '">' + FEATURE_LABELS[k] + '</label>' +
      '<span class="switch"><input type="checkbox" id="cp_' + k + '" ' + (features[k] ? 'checked' : '') + '><span class="sl"></span></span></div>'
    )).join('');
    Object.keys(FEATURE_LABELS).forEach((k) => {
      $('#cp_' + k).addEventListener('change', (e) => {
        setFeature(k, e.target.checked);
        // reflejar cambios que requieren repintar
        paintStock(); updateSummary();
      });
    });
    const panel = $('#configPanel'), cog = $('#cpCog');
    const openP = () => panel.classList.add('show');
    const closeP = () => panel.classList.remove('show');
    cog.addEventListener('click', openP);
    $('#cpClose').addEventListener('click', closeP);
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); panel.classList.toggle('show'); }
    });
    const params = new URLSearchParams(location.search);
    if (params.get('config') === '1') { cog.classList.add('show'); openP(); }
    // el engranaje siempre disponible con el atajo; lo mostramos si hay override guardado
    try { if (Object.keys(JSON.parse(localStorage.getItem(FKEY) || '{}')).length) cog.classList.add('show'); } catch (e) {}
  }

  /* ============================================================
     ANALYTICS — eventos para dataLayer / gtag + scroll depth
     ============================================================ */
  function track(event, params) {
    params = params || {};
    const payload = Object.assign({
      event: event,
      product: CFG.name,
      value: CFG.price * state.qty,
      currency: CFG.currency
    }, params);
    if (window.dataLayer) window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') window.gtag('event', event, payload);
    if (window.VisitorTracker && typeof window.VisitorTracker.trackEcommerce === 'function') {
      window.VisitorTracker.trackEcommerce(event, {
        productName: CFG.name, productPrice: CFG.price, revenue: payload.value
      });
    }
    
    // Tracking para Meta Pixel
    if (typeof window.fbq === 'function') {
      const metaParams = {
        content_name: CFG.name,
        content_type: 'product',
        value: payload.value || CFG.price,
        currency: CFG.currency
      };
      
      if (event === 'view_content') {
        window.fbq('track', 'ViewContent', metaParams);
      } else if (event === 'begin_checkout') {
        metaParams.quantity = state.qty;
        window.fbq('track', 'InitiateCheckout', metaParams);
      } else if (event === 'form_submitted') {
        metaParams.quantity = state.qty;
        window.fbq('track', 'Lead', metaParams);
      } else if (event === 'purchase') {
        metaParams.quantity = params.quantity || state.qty;
        if (params.transaction_id) {
          window.fbq('track', 'Purchase', metaParams, { eventID: params.transaction_id });
        } else {
          window.fbq('track', 'Purchase', metaParams);
        }
      }
    }
    
    // console para depurar sin analytics conectado
    if (params.__debug) console.log('[track]', event, payload);
  }
  function initScrollDepth() {
    const marks = [25, 50, 75, 100];
    const fired = new Set();
    const on = () => {
      const h = document.documentElement;
      const pct = ((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100;
      marks.forEach((m) => { if (pct >= m && !fired.has(m)) { fired.add(m); track('scroll_depth', { depth: m }); } });
    };
    window.addEventListener('scroll', on, { passive: true });
  }

  /* ============================================================
     VISITOR TRACKING — Supabase edge function (track-visitor)
     ============================================================ */
  function initVisitorTracking() {
    const SUPABASE_URL = CFG.supabaseUrl, SUPABASE_KEY = CFG.supabaseAnonKey;
    const TRACK_URL = SUPABASE_URL + '/functions/v1/track-visitor';
    let sessionId = sessionStorage.getItem('lp_session_id') || 'sess_' + Math.random().toString(36).slice(2, 15) + '_' + Date.now().toString(36);
    sessionStorage.setItem('lp_session_id', sessionId);
    let hb = null;

    function send(event, extra) {
      if (!SUPABASE_URL || !SUPABASE_KEY) return;
      fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
        body: JSON.stringify(Object.assign({
          event: event, sessionId: sessionId, pageUrl: location.href, pageTitle: document.title,
          referrer: document.referrer, userAgent: navigator.userAgent, landingPage: CFG.origin
        }, extra || {})),
        keepalive: true
      }).catch(() => {});
    }
    window.VisitorTracker = {
      trackEcommerce: (event, data) => send('ecommerce_' + event, data)
    };
    send('pageview');
    hb = setInterval(() => { if (!document.hidden) send('heartbeat'); }, 15000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) send('hidden'); else send('visible'); });
    window.addEventListener('pagehide', () => { clearInterval(hb); send('leave'); });
  }

  /* ---------- Meta Pixel Helper & Init ---------- */
  function isConfigured(value) {
    return Boolean(value) && !/^(PEGAR_AQUI|G-XXXX|TU_|YOUR_|XXXX)/i.test(value);
  }

  function initMetaPixel() {
    if (!isConfigured(CFG.metaPixelId)) return;
    if (window.fbq) return; // ya inicializado desde el <head>; esto queda solo como respaldo
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CFG.metaPixelId);
    window.fbq('track', 'PageView');
  }

  /* ---------- init ---------- */
  function init() {
    paintStaticPrices();
    applyFeatures();
    initLazy();
    initReveal();
    initHeader();
    initHeroThumbs();
    initGallery();
    initLightbox();
    initBeforeAfter();
    renderTestimonials();
    renderFaq();
    initQty();
    initCountdown();
    initStock();
    initOffer();
    initViewers();
    initSocialProof();
    initScrollUI();
    initCTAs();
    initForm();
    initMapPicker();
    initConfirmFlow();
    initConfigPanel();
    initScrollDepth();
    initVisitorTracking();
    initMetaPixel();
    track('view_content');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
