/* Velati v2 (demo). Todo el contenido sale de data.json. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wideMQ = matchMedia('(min-width: 900px)');
  const finePtr = matchMedia('(hover: hover) and (pointer: fine)');
  const G = () => (!reduced && window.gsap) || null;

  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('velati:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('velati:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  let D = null;

  /* ---------- WhatsApp y medición ---------- */
  const waLink = text => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`;
  const waText = key => (D.mensajes && D.mensajes[key]) || key;
  function openWa(text, origen) {
    track('whatsapp_click', { origen });
    const url = waLink(text);
    window.__lastWa = url;
    const w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
  }
  const M = { fb: false, ga: false };
  function initMedicion() {
    const m = D.medicion || {};
    const pid = String(m.meta_pixel_id || '').trim();
    const gid = String(m.ga4_id || '').trim();
    if (/^\d{5,20}$/.test(pid)) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', pid); window.fbq('track', 'PageView'); M.fb = true;
    }
    if (/^G-[A-Z0-9]{4,20}$/.test(gid)) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', gid);
      const s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gid);
      document.head.append(s); M.ga = true;
    }
  }
  function track(name, params = {}) {
    try {
      if (M.fb && window.fbq) window.fbq('track', name === 'form_submit' ? 'Lead' : name === 'add_to_cart' ? 'AddToCart' : 'Contact', params);
      if (M.ga && window.gtag) window.gtag('event', name, params);
    } catch (e) { /* la medición nunca rompe la página */ }
  }

  /* ---------- Utilidades ---------- */
  const money = n => '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
  const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const addDaysISO = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtHour = t => t.replace(/^0/, '');
  const prod = id => D.productos.find(p => p.id === id);
  const catName = id => (D.categorias.find(c => c.id === id) || {}).nombre || '';
  const haptic = () => { try { navigator.vibrate && navigator.vibrate(10); } catch (e) { /* nada */ } };
  let toastT = 0;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
  }
  function countTo(el, to) {
    const g = G();
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (!g || from === to) { el.textContent = money(to); return; }
    const o = { v: from };
    g.to(o, { v: to, duration: .45, ease: 'power2.out', onUpdate: () => { el.textContent = money(Math.round(o.v)); }, onComplete: () => { el.textContent = money(to); } });
  }

  /* ---------- Ilustraciones referenciales (respaldo sin foto) ---------- */
  const W = '#fbf6ef', V = '#6b1e33', R = '#9e2330', GD = '#c6a052', GR = '#5f7a57';
  const flame = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="6.5" fill="#f2b84b"/><ellipse cx="${x}" cy="${y + 2}" rx="1.4" ry="3" fill="#fff4cf"/>`;
  const ILLO = {
    copo: () => `<g stroke="${W}" stroke-width="4" stroke-linecap="round">${[0, 60, 120].map(a => `<path transform="rotate(${a} 50 56)" d="M50 26v60M50 34l-7-7M50 34l7-7M50 78l-7 7M50 78l7 7"/>`).join('')}</g><circle cx="50" cy="56" r="5" fill="${W}"/>${flame(50, 18)}`,
    arbol: () => `<path d="M50 20L76 78H24z" fill="${GR}"/><path d="M50 20L66 56H34z" fill="#6f8d66"/><rect x="45" y="78" width="10" height="10" fill="#8a5a3c"/><g fill="${GD}"><circle cx="42" cy="62" r="3"/><circle cx="58" cy="68" r="3"/><circle cx="52" cy="46" r="3"/></g>${flame(50, 12)}`,
    tornado: () => `<path d="M50 22c14 10 22 20 22 32 0 14-10 24-22 30-12-6-22-16-22-30 0-12 8-22 22-32z" fill="${GR}"/><path d="M34 44c10 6 22 6 32 0M30 58c12 8 28 8 40 0M34 72c10 6 22 6 32 0" stroke="${W}" stroke-width="2.4" fill="none"/>${flame(50, 14)}`,
    pina: () => `<ellipse cx="50" cy="60" rx="20" ry="26" fill="#9a6a45"/><path d="M34 48l32 26M34 64l24 18M42 38l26 22M66 48L34 74M66 64L42 82M58 38L32 60" stroke="#c9a07c" stroke-width="2"/>${flame(50, 26)}`,
    reno: () => `<rect x="34" y="44" width="32" height="40" rx="12" fill="#a47b62"/><circle cx="50" cy="44" r="14" fill="#a47b62"/><circle cx="50" cy="52" r="4" fill="${R}"/><circle cx="44" cy="42" r="2" fill="${V}"/><circle cx="56" cy="42" r="2" fill="${V}"/><path d="M40 32l-8-12M36 26l-6 2M60 32l8-12M64 26l6 2" stroke="#7a5a44" stroke-width="3" stroke-linecap="round"/>${flame(50, 18)}`,
    noel: () => `<rect x="32" y="48" width="36" height="38" rx="10" fill="${R}"/><circle cx="50" cy="44" r="13" fill="#f3d2bd"/><path d="M36 40c4-16 24-16 28 0z" fill="${R}"/><rect x="35" y="38" width="30" height="5" rx="2.5" fill="${W}"/><path d="M40 50c2 10 18 10 20 0" fill="${W}"/><rect x="44" y="66" width="12" height="10" fill="${GD}"/>${flame(50, 20)}`,
    nomo: () => `<path d="M50 18L68 60H32z" fill="${R}"/><ellipse cx="50" cy="66" rx="18" ry="20" fill="#8f9a8a"/><ellipse cx="50" cy="58" rx="6" ry="5" fill="#f3d2bd"/><path d="M38 64c4 18 20 18 24 0" fill="${W}"/>${flame(50, 10)}`,
    regalo: () => `<rect x="30" y="44" width="40" height="38" rx="4" fill="${R}"/><rect x="27" y="38" width="46" height="10" rx="3" fill="#b8323f"/><rect x="46" y="38" width="8" height="44" fill="${GD}"/><path d="M50 38c-8-12-18-6-12 0M50 38c8-12 18-6 12 0" stroke="${GD}" stroke-width="3" fill="none"/>${flame(50, 26)}`,
    caja: () => `<rect x="20" y="42" width="60" height="42" rx="5" fill="${R}"/><rect x="16" y="34" width="68" height="12" rx="4" fill="#b8323f"/><rect x="46" y="34" width="8" height="50" fill="${GD}"/><rect x="20" y="58" width="60" height="6" fill="${GD}"/><path d="M50 34c-10-14-22-6-14 0M50 34c10-14 22-6 14 0" stroke="${GD}" stroke-width="3" fill="none"/>`,
    jengibre: () => `<circle cx="50" cy="38" r="11" fill="#b77a4a"/><path d="M38 50h24l8 10-6 4-6-6v16l6 12-6 3-8-12-8 12-6-3 6-12V58l-6 6-6-4z" fill="#b77a4a"/><g fill="${W}"><circle cx="46" cy="36" r="1.6"/><circle cx="54" cy="36" r="1.6"/><circle cx="50" cy="58" r="2"/><circle cx="50" cy="66" r="2"/></g><path d="M45 42q5 4 10 0" stroke="${W}" stroke-width="1.6" fill="none"/>${flame(50, 18)}`,
    vaso: () => `<path d="M32 36h36l-4 50H36z" fill="#d8c3a0"/><path d="M33 46h34M34 58h32M35 70h30" stroke="#b9a07a" stroke-width="2"/><rect x="31" y="32" width="38" height="6" rx="2" fill="${W}"/><text x="50" y="66" text-anchor="middle" font-family="Pinyon Script, cursive" font-size="13" fill="${V}">Noel</text>${flame(50, 22)}`,
    taza: () => `<path d="M30 40h36v34a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10z" fill="${W}"/><path d="M66 48h6a8 8 0 0 1 0 16h-6" stroke="${W}" stroke-width="5" fill="none"/><path d="M36 58l4-6 4 6 4-6 4 6 4-6 4 6" stroke="${R}" stroke-width="2" fill="none"/>`,
    bouquet: t => `<path d="M38 60l12 30 12-30z" fill="${W}"/><g fill="${t || '#e4a5ae'}">${[[40, 44], [60, 44], [50, 34], [44, 56], [56, 56], [50, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g><g fill="rgba(255,255,255,.45)">${[[40, 44], [60, 44], [50, 34], [50, 48]].map(([x, y]) => `<circle cx="${x - 2}" cy="${y - 2}" r="3"/>`).join('')}</g><path d="M30 52c-4-8 2-14 8-10M70 52c4-8-2-14-8-10" stroke="${GR}" stroke-width="3" fill="none"/><rect x="40" y="70" width="20" height="5" fill="${V}"/>`
  };
  const illo = p => `<svg class="illo" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${(ILLO[p.ilustracion] || ILLO.regalo)(p.tono)}</svg>`;
  /* Arte del producto: foto si existe (con srcset), si no ilustración */
  function art(p, big) {
    const f = p.fotos && p.fotos[0];
    if (f) {
      const img = (x, cls) => `<img class="ph ${cls}" src="${x.src}"${x.src2x ? ` srcset="${x.src} 480w, ${x.src2x} 960w" sizes="${big ? '(min-width:900px) 480px, 100vw' : '(min-width:900px) 260px, 50vw'}"` : ''} alt="${(x.alt || p.nombre).replace(/"/g, '&quot;')}" loading="lazy" width="480" height="600" onload="this.classList.add('is-in')">`;
      return img(f, 'art__a') + (p.fotos[1] ? img(p.fotos[1], 'art__b') : '');
    }
    return `<span class="art__glow"></span>${illo(p)}`;
  }

  /* ---------- Carrito (estado único: catálogo + regalo) ---------- */
  const cart = Object.assign({ qty: {}, pres: 'sin-caja', para: '', msg: '', de: '' }, store.get('cart', {}));
  const saveCart = () => store.set('cart', cart);
  const sellable = p => p && p.estado !== 'proximamente' && p.precio != null;
  function lineCalc(p, q) {
    if (p.oferta && q >= p.oferta.cantidad) {
      const packs = Math.floor(q / p.oferta.cantidad);
      return { total: packs * p.oferta.precio + (q % p.oferta.cantidad) * p.precio, oferta: true };
    }
    return { total: q * p.precio, oferta: false };
  }
  function totals() {
    const lines = Object.entries(cart.qty).filter(([id, q]) => q > 0 && sellable(prod(id))).map(([id, q]) => {
      const p = prod(id);
      return { p, q, ...lineCalc(p, q) };
    });
    const pres = D.presentaciones.find(x => x.id === cart.pres) || D.presentaciones[0];
    const presP = pres.producto ? prod(pres.producto) : null;
    const n = lines.reduce((s, l) => s + l.q, 0);
    const total = lines.reduce((s, l) => s + l.total, 0) + (presP ? presP.precio : 0);
    return { lines, pres, presP, n, total };
  }
  function addToCart(id, q = 1, fromEl) {
    const p = prod(id);
    if (!sellable(p)) return;
    if (p.categoria === 'caja') {
      cart.pres = p.id;
      toast(`${p.nombre} va como caja de tu regalo 🎁`);
    } else {
      cart.qty[id] = Math.min(30, (cart.qty[id] || 0) + q);
      toast(`Agregaste ${q > 1 ? q + ' x ' : ''}${p.nombre} 💗`);
    }
    saveCart(); haptic();
    track('add_to_cart', { id });
    if (fromEl) flyToCart(fromEl);
    renderCart(true);
  }
  function setQty(id, q) {
    cart.qty[id] = Math.max(0, Math.min(30, q));
    if (!cart.qty[id]) delete cart.qty[id];
    saveCart(); renderCart(true);
  }
  function setPres(id) { cart.pres = id; saveCart(); renderCart(true); }

  /* Miniatura que vuela en arco hasta la bolsa */
  function flyToCart(fromEl) {
    const g = G();
    const targets = $$('[data-open-cart]').filter(b => b.offsetParent !== null);
    const to = targets[0];
    if (!g || !to) return bump();
    const a = fromEl.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const s = Math.min(a.width, 90);
    const ghost = h('div', { class: 'ghost', html: fromEl.innerHTML });
    Object.assign(ghost.style, { left: a.left + a.width / 2 - s / 2 + 'px', top: a.top + a.height / 2 - s / 2 + 'px', width: s + 'px', height: s + 'px' });
    document.body.append(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    g.timeline({ onComplete: () => { ghost.remove(); bump(); } })
      .to(ghost, { x: dx, duration: .7, ease: 'power1.inOut' }, 0)
      .to(ghost, { y: dy, duration: .7, ease: 'back.in(1.6)' }, 0)
      .to(ghost, { scale: .2, opacity: .6, rotate: 20, duration: .7, ease: 'power2.in' }, 0);
  }
  function bump() {
    const g = G();
    if (g) g.fromTo('.cartbtn, .dock__n', { scale: 1 }, { scale: 1.25, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  function renderCart(animate) {
    const t = totals();
    $$('[data-cart-n]').forEach(e => { e.textContent = t.n; e.classList.toggle('is-on', t.n > 0); });
    /* Paso 1: líneas */
    const ul = $('[data-clines]');
    ul.innerHTML = '';
    t.lines.forEach(l => {
      const li = h('li', { class: 'cline' },
        h('span', { class: 'cline__art', html: art(l.p) }),
        h('span', { class: 'cline__txt' },
          h('b', {}, l.p.nombre),
          h('small', {}, l.oferta ? `Oferta ${l.p.oferta.cantidad} x ${money(l.p.oferta.precio)} aplicada` : `${money(l.p.precio)} c/u`)),
        h('div', { class: 'stepper stepper--sm', role: 'group', 'aria-label': 'Cantidad de ' + l.p.nombre },
          h('button', { type: 'button', 'aria-label': 'Quitar ' + l.p.nombre, onclick: () => setQty(l.p.id, l.q - 1) }, '−'),
          h('output', {}, String(l.q)),
          h('button', { type: 'button', 'aria-label': 'Agregar ' + l.p.nombre, onclick: () => setQty(l.p.id, l.q + 1) }, '+')),
        h('b', { class: 'cline__p' }, money(l.total)));
      ul.append(li);
    });
    $('[data-cempty]').hidden = t.lines.length > 0;
    /* Paso 2: caja */
    $$('input[name="pres"]').forEach(i => { i.checked = i.value === cart.pres; });
    /* Pasos activos */
    $$('[data-ds]').forEach(li => {
      const n = li.dataset.ds;
      li.classList.toggle('is-done', (n === '1' && t.n > 0) || (n === '2' && t.n > 0) || (n === '3' && !!(cart.msg || cart.para)));
    });
    countTo($('[data-total]'), t.total);
    $('[data-total-note]').textContent = D.precios_etiqueta + '. Se confirman por WhatsApp.';
    updateCard();
    if (animate) bump();
  }
  function updateCard() {
    $('[data-card-para]').textContent = 'Para ' + (cart.para.trim() || 'alguien especial');
    $('[data-card-msg]').textContent = cart.msg.trim() || 'Tu mensaje aparece aquí mientras escribes…';
    $('[data-card-msg]').classList.toggle('is-ph', !cart.msg.trim());
    $('[data-card-de]').textContent = cart.de.trim() ? 'Con cariño, ' + cart.de.trim() : '';
  }
  function giftMessage() {
    const t = totals();
    const out = [waText('regalo_titulo'), ''];
    t.lines.forEach(l => out.push(`• ${l.q} x ${l.p.nombre}: ${money(l.total)}${l.oferta ? ` (oferta ${l.p.oferta.cantidad} x ${money(l.p.oferta.precio)})` : ''}`));
    out.push(`Presentación: ${t.pres.nombre}${t.presP ? ` (${money(t.presP.precio)})` : ''}`);
    out.push(`Total referencial: ${money(t.total)}`);
    const para = cart.para.trim(), msg = cart.msg.trim(), de = cart.de.trim();
    if (para || msg || de) {
      out.push('', 'Tarjeta:');
      if (para) out.push('Para: ' + para);
      if (msg) out.push('Mensaje: ' + msg);
      if (de) out.push('De: ' + de);
    }
    out.push('', `${D.precios_etiqueta} ✨`);
    return out.join('\n');
  }
  function miniCard(p) {
    const li = h('li', { class: 'mini' });
    const b = h('button', { type: 'button', class: 'mini__art', 'aria-label': 'Ver ' + p.nombre, html: art(p), onclick: () => openSheet(p.id) });
    li.append(b, h('span', { class: 'mini__t' }, p.nombre), h('span', { class: 'mini__p' }, money(p.precio)),
      h('button', { type: 'button', class: 'plus', 'aria-label': 'Agregar ' + p.nombre, onclick: () => addToCart(p.id, 1, b) }, '+'));
    return li;
  }

  /* ---------- Drawer ---------- */
  let lastFocus = null;
  function openDrawer(step) {
    const d = $('[data-drawer]');
    lastFocus = document.activeElement;
    d.hidden = false;
    document.documentElement.classList.add('is-locked');
    requestAnimationFrame(() => d.classList.add('is-open'));
    renderCart();
    const panel = $('[data-drawer-panel]');
    panel.focus({ preventScroll: true });
    if (step) { const sec = $(`[data-dsec="${step}"]`); if (sec) $('[data-drawer-body]').scrollTop = sec.offsetTop - 70; }
  }
  function closeDrawer() {
    const d = $('[data-drawer]');
    if (d.hidden) return;
    d.classList.remove('is-open');
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => { d.hidden = true; }, reduced ? 0 : 380);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function initDrawer() {
    const pr = $('[data-pres]');
    D.presentaciones.forEach(x => {
      const pp = x.producto ? prod(x.producto) : null;
      pr.append(h('label', { class: 'presopt' },
        h('input', { type: 'radio', name: 'pres', value: x.id, checked: x.id === cart.pres, onchange: () => setPres(x.id) }),
        h('span', { class: 'presopt__in' },
          h('span', { class: 'presopt__art', html: pp ? art(pp) : '<span class="presopt__none">sin<br>caja</span>' }),
          h('span', { class: 'presopt__txt' }, h('b', {}, x.nombre), h('small', {}, x.descripcion)),
          h('span', { class: 'presopt__p' }, pp ? money(pp.precio) : 'Gratis'))));
    });
    $('[data-card-head]').textContent = D.tarjeta.encabezado;
    const bind = (sel, key) => {
      const el = $(sel);
      el.value = cart[key] || '';
      el.addEventListener('input', () => { cart[key] = el.value; saveCart(); updateCard(); cnt(); renderStepsOnly(); });
    };
    const msg = $('[data-g-msg]');
    msg.maxLength = D.tarjeta.max;
    const cnt = () => { $('[data-g-count]').textContent = `(${msg.value.length}/${D.tarjeta.max})`; };
    bind('[data-g-para]', 'para'); bind('[data-g-msg]', 'msg'); bind('[data-g-de]', 'de'); cnt();
    const renderStepsOnly = () => $('[data-ds="3"]').classList.toggle('is-done', !!(cart.msg || cart.para));
    const picks = $('[data-cempty-picks]');
    D.destacados.map(prod).filter(p => sellable(p) && p.categoria !== 'caja').forEach(p => picks.append(miniCard(p)));
    $('[data-send-gift]').addEventListener('click', () => {
      if (!totals().lines.length) { $('[data-gift-err]').hidden = false; toast('Elige al menos una vela 💗'); return; }
      $('[data-gift-err]').hidden = true;
      track('form_submit', { tipo: 'regalo' });
      openWa(giftMessage(), 'regalo');
    });
    /* Paso activo según el scroll del drawer */
    const body = $('[data-drawer-body]');
    body.addEventListener('scroll', () => {
      let cur = '1';
      $$('[data-dsec]').forEach(s => { if (s.offsetTop - 120 <= body.scrollTop) cur = s.dataset.dsec; });
      $$('[data-ds]').forEach(li => li.classList.toggle('is-on', li.dataset.ds === cur));
    }, { passive: true });
    $$('[data-ds]').forEach(li => li.addEventListener('click', () => { const s = $(`[data-dsec="${li.dataset.ds}"]`); body.scrollTo({ top: s.offsetTop - 70, behavior: reduced ? 'auto' : 'smooth' }); }));
    $$('[data-open-cart]').forEach(b => b.addEventListener('click', () => openDrawer()));
    $$('[data-open-gift]').forEach(b => b.addEventListener('click', () => openDrawer(totals().n ? null : '1')));
    $$('[data-close-cart]').forEach(b => b.addEventListener('click', closeDrawer));
  }

  /* ---------- Catálogo ---------- */
  const view = { cat: 'todos', budget: 'all', sort: 'rec' };
  const BUDGETS = [
    { id: 'all', nombre: 'Todo precio', ok: () => true },
    { id: 'b10', nombre: 'Hasta $10', ok: p => p.precio != null && p.precio <= 10 },
    { id: 'b25', nombre: '$11 a $25', ok: p => p.precio != null && p.precio > 10 && p.precio <= 25 },
    { id: 'b26', nombre: 'Más de $25', ok: p => p.precio != null && p.precio > 25 }
  ];
  const catalog = () => D.productos.filter(p => p.coleccion === 'navidad');
  function renderCatalog() {
    const all = catalog();
    const cats = $('[data-cats]');
    D.categorias.filter(c => c.id === 'todos' || all.some(p => p.categoria === c.id)).forEach(c => {
      const n = c.id === 'todos' ? all.length : all.filter(p => p.categoria === c.id).length;
      cats.append(h('button', { type: 'button', class: 'fchip', 'aria-pressed': String(c.id === view.cat), 'data-cat': c.id, onclick: () => { view.cat = c.id; applyView(true); } }, c.nombre, h('small', {}, String(n))));
    });
    const bud = $('[data-budget]');
    BUDGETS.forEach(b => bud.append(h('button', { type: 'button', class: 'bchip', 'aria-pressed': String(b.id === view.budget), 'data-b': b.id, onclick: () => { view.budget = b.id; applyView(true); } }, b.nombre)));
    $('[data-sort]').addEventListener('change', e => { view.sort = e.target.value; applyView(true); });

    const ul = $('[data-grid]');
    all.forEach((p, i) => {
      const soon = !sellable(p);
      const seals = [...(p.sellos || [])];
      if (p.oferta) seals.push(`${p.oferta.cantidad} x ${money(p.oferta.precio)}`);
      if (soon) seals.unshift('Próximamente');
      const li = h('li', { class: 'card' + (soon ? ' is-soon' : ''), 'data-card': p.id, 'data-i': i });
      const artBtn = h('button', { type: 'button', class: 'card__art' + (p.fotos && p.fotos[1] ? ' has-b' : ''), style: p.tono ? `--tone:${p.tono}` : null, 'aria-label': 'Ver ' + p.nombre, html: art(p), onclick: () => openSheet(p.id) });
      li.append(artBtn,
        h('div', { class: 'card__seals' }, seals.map(s => h('span', { class: 'seal' + (s === 'Próximamente' ? ' seal--soon' : '') }, s))),
        h('div', { class: 'card__body' },
          h('p', { class: 'card__cat' }, catName(p.categoria)),
          h('h3', {}, h('button', { type: 'button', class: 'card__name', onclick: () => openSheet(p.id) }, p.nombre)),
          h('p', { class: 'card__d' }, p.descripcion),
          h('p', { class: 'card__price' }, p.precio != null ? money(p.precio) : (p.precio_texto || ''))),
        soon ? null : h('button', { type: 'button', class: 'plus plus--card', 'aria-label': 'Agregar ' + p.nombre, onclick: () => addToCart(p.id, 1, artBtn) }, '+'));
      ul.append(li);
    });
    $('[data-grid-note]').textContent = D.marca.nota_imagenes;
    applyView(false);
  }
  function applyView(animate) {
    $$('[data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === view.cat)));
    $$('[data-b]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.b === view.budget)));
    const okB = BUDGETS.find(b => b.id === view.budget).ok;
    const ul = $('[data-grid]');
    const cards = $$('[data-card]', ul);
    const visible = [];
    cards.forEach(li => {
      const p = prod(li.dataset.card);
      const on = (view.cat === 'todos' || p.categoria === view.cat) && okB(p);
      li.hidden = !on;
      if (on) visible.push(li);
    });
    const key = li => { const p = prod(li.dataset.card); return p.precio == null ? 1e9 : p.precio; };
    const sorted = [...cards].sort((a, b) => view.sort === 'rec' ? a.dataset.i - b.dataset.i : view.sort === 'asc' ? key(a) - key(b) : (key(b) === 1e9 ? -1e9 : key(b)) - (key(a) === 1e9 ? -1e9 : key(a)));
    sorted.forEach(li => ul.append(li));
    const n = visible.length;
    $('[data-count]').textContent = n ? `${n} ${n === 1 ? 'producto' : 'productos'}` : 'No hay productos con ese filtro. Prueba otro precio.';
    const g = G();
    if (animate && g) g.fromTo(visible, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .025, ease: 'power2.out', overwrite: true });
  }

  /* ---------- Ficha de producto ---------- */
  const sheetState = { id: null, q: 1 };
  function openSheet(id, fromHash) {
    const p = prod(id);
    if (!p) return;
    sheetState.id = id; sheetState.q = 1;
    const s = $('[data-sheet]');
    $('[data-sheet-art]').innerHTML = art(p, true);
    if (p.tono) $('[data-sheet-art]').style.setProperty('--tone', p.tono); else $('[data-sheet-art]').style.removeProperty('--tone');
    $('[data-sheet-cat]').textContent = catName(p.categoria) + ' · Christmas Collection';
    $('[data-sheet-t]').textContent = p.nombre;
    $('[data-sheet-d]').textContent = p.descripcion;
    $('[data-sheet-p]').textContent = p.precio != null ? money(p.precio) : (p.precio_texto || '');
    $('[data-sheet-offer]').textContent = p.oferta ? `Oferta: ${p.oferta.cantidad} x ${money(p.oferta.precio)}. Se aplica sola en tu pedido.` : '';
    const vr = $('[data-sheet-var]');
    vr.innerHTML = '';
    if (p.variantes && p.variantes.length) vr.append(h('p', { class: 'lbl' }, 'Opciones'), h('div', { class: 'occ' }, p.variantes.map(v => h('span', { class: 'fchip' }, v))));
    const soon = !sellable(p);
    $('[data-sheet-buy]').hidden = soon;
    $('[data-sheet-soon]').hidden = !soon;
    $('[data-sheet-note]').textContent = `${D.precios_etiqueta}. ${p.fotos && p.fotos.length ? '' : D.marca.nota_imagenes}`;
    const url = location.origin + location.pathname + '#p/' + p.id;
    $('[data-sheet-share]').href = 'https://wa.me/?text=' + encodeURIComponent(`Mira esta vela de Velati 💗 ${p.nombre}: ${url}`);
    sheetQty();
    if (!fromHash && location.hash !== '#p/' + id) history.replaceState(null, '', '#p/' + id);
    lastFocus = document.activeElement;
    s.hidden = false;
    document.documentElement.classList.add('is-locked');
    requestAnimationFrame(() => s.classList.add('is-open'));
    $('[data-sheet-panel]').focus({ preventScroll: true });
  }
  function sheetQty() {
    const p = prod(sheetState.id);
    $('[data-sq]').textContent = sheetState.q;
    $('[data-sq-minus]').disabled = sheetState.q <= 1;
    if (sellable(p)) $('[data-sheet-sum]').textContent = money(lineCalc(p, sheetState.q).total);
  }
  function closeSheet() {
    const s = $('[data-sheet]');
    if (s.hidden) return;
    s.classList.remove('is-open');
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => { s.hidden = true; }, reduced ? 0 : 360);
    if (location.hash.startsWith('#p/')) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function initSheet() {
    $('[data-sq-minus]').addEventListener('click', () => { sheetState.q = Math.max(1, sheetState.q - 1); sheetQty(); });
    $('[data-sq-plus]').addEventListener('click', () => { sheetState.q = Math.min(30, sheetState.q + 1); sheetQty(); });
    $('[data-sheet-add]').addEventListener('click', () => {
      const art = $('[data-sheet-art]');
      addToCart(sheetState.id, sheetState.q, art);
      setTimeout(closeSheet, 250);
    });
    $$('[data-close-sheet]').forEach(b => b.addEventListener('click', closeSheet));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); closeDrawer(); } });
    const fromHash = () => { const m = location.hash.match(/^#p\/([\w-]+)$/); if (m && prod(m[1])) openSheet(m[1], true); };
    addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- Reservas (lógica de la v1) ---------- */
  const res = { tab: 'taller', tPers: 1, tFecha: null, gPers: 6, occ: '' };
  const taller = () => D.talleres[0];
  const futuras = () => taller().fechas.filter(f => f.fecha >= todayISO()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  function renderReserva() {
    const T = taller();
    $('[data-t-kicker]').textContent = `USD ${T.precio} por persona · incluye ${T.incluye}`;
    $('[data-t-name]').textContent = T.nombre;
    $('[data-t-meta]').textContent = `${T.lugar} · ${T.cupos_texto}`;
    const box = $('[data-t-dates]');
    const fs = futuras();
    if (!fs.length) {
      box.append(h('div', { class: 'nodate' }, h('b', {}, 'Próxima fecha: escríbenos'), h('span', {}, 'Te avisamos apenas abramos la siguiente edición.')));
      $('[data-t-btn]').textContent = 'Pedir la próxima fecha';
    } else {
      fs.forEach((f, i) => {
        const id = 'tf-' + i;
        box.append(h('label', { class: 'date', for: id },
          h('input', { type: 'radio', name: 'tfecha', id, value: f.fecha, checked: i === 0, onchange: () => { res.tFecha = f; clampT(); } }),
          h('span', {}, h('b', {}, fmtDate(f.fecha)), h('small', {}, `${fmtHour(f.hora_inicio)} a ${fmtHour(f.hora_fin)}`),
            f.cupos != null ? h('em', { class: 'badge' }, f.cupos > 0 ? `quedan ${f.cupos} cupos` : 'agotado') : null)));
      });
      res.tFecha = fs[0];
    }
    $('[data-t-minus]').addEventListener('click', () => { res.tPers--; clampT(); });
    $('[data-t-plus]').addEventListener('click', () => { res.tPers++; clampT(); });
    $('[data-send-taller]').addEventListener('click', sendTaller);
    clampT();

    const Gp = D.grupos;
    $('[data-g-meta]').textContent = `De ${Gp.min} a ${Gp.max} personas · lunes a sábado · USD ${Gp.precio_persona} por persona · incluye ${Gp.incluye}`;
    res.gPers = Gp.min;
    $('[data-gr-minus]').addEventListener('click', () => { res.gPers--; clampG(); });
    $('[data-gr-plus]').addEventListener('click', () => { res.gPers++; clampG(); });
    const fe = $('[data-gr-fecha]');
    fe.min = addDaysISO(todayISO(), 1);
    fe.addEventListener('change', checkFecha);
    fe.addEventListener('input', checkFecha);
    const occ = $('[data-gr-occ]');
    Gp.ocasiones.forEach(o => occ.append(h('button', { type: 'button', class: 'fchip', role: 'radio', 'aria-checked': 'false', onclick: () => {
      res.occ = res.occ === o ? '' : o;
      $$('.fchip', occ).forEach(b => b.setAttribute('aria-checked', String(b.textContent === res.occ)));
    } }, o)));
    $('[data-send-grupo]').addEventListener('click', sendGrupo);
    clampG();

    const tabs = $$('[data-tab]');
    tabs.forEach(t => {
      t.addEventListener('click', () => setTab(t.dataset.tab));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = tabs[(tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        setTab(n.dataset.tab); n.focus();
      });
    });
    addEventListener('resize', () => setTab(res.tab, true));
    setTab('taller', true);
  }
  function setTab(id, instant) {
    res.tab = id;
    $$('[data-tab]').forEach(t => { const on = t.dataset.tab === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== id; });
    const t = $(`[data-tab="${id}"]`);
    const ind = $('[data-tabs-ind]');
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = `translateX(${t.offsetLeft - 5}px)`;
    const g = G();
    if (g && !instant) g.fromTo(`[data-panel="${id}"] .frame`, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power2.out' });
  }
  function clampT() {
    const T = taller();
    const max = res.tFecha && res.tFecha.cupos != null ? Math.max(1, res.tFecha.cupos) : 8;
    res.tPers = Math.max(1, Math.min(max, res.tPers));
    $('[data-t-pers]').textContent = res.tPers;
    $('[data-t-minus]').disabled = res.tPers <= 1;
    $('[data-t-plus]').disabled = res.tPers >= max;
    $('[data-t-total]').textContent = money(res.tPers * T.precio);
  }
  function clampG() {
    const Gp = D.grupos;
    res.gPers = Math.max(Gp.min, Math.min(Gp.max, res.gPers));
    $('[data-gr-pers]').textContent = res.gPers;
    $('[data-gr-minus]').disabled = res.gPers <= Gp.min;
    $('[data-gr-plus]').disabled = res.gPers >= Gp.max;
    $('[data-gr-calc]').textContent = `${res.gPers} x USD ${Gp.precio_persona}`;
    $('[data-gr-total]').textContent = money(res.gPers * Gp.precio_persona);
  }
  function checkFecha() {
    const fe = $('[data-gr-fecha]');
    const err = $('[data-gr-fecha-err]');
    err.hidden = true;
    if (!fe.value) return true;
    if (fe.value < fe.min) { err.textContent = 'Elige una fecha a partir de mañana.'; err.hidden = false; fe.value = ''; return false; }
    if (new Date(fe.value + 'T12:00:00').getDay() === 0) { err.textContent = 'Los domingos no hay grupos. Elige de lunes a sábado.'; err.hidden = false; fe.value = ''; return false; }
    return true;
  }
  function sendTaller() {
    const T = taller();
    const nombre = $('[data-t-nombre]').value.trim();
    const err = $('[data-t-err]');
    if (!nombre) { err.textContent = 'Escribe tu nombre.'; err.hidden = false; $('[data-t-nombre]').focus(); return; }
    err.hidden = true;
    const f = res.tFecha;
    const lines = [waText('taller_titulo'), '', T.nombre,
      f ? `Fecha: ${fmtDate(f.fecha)}, ${fmtHour(f.hora_inicio)} a ${fmtHour(f.hora_fin)}` : 'Fecha: la próxima que tengan',
      `Personas: ${res.tPers}`, `Total: ${money(res.tPers * T.precio)} (USD ${T.precio} por persona, incluye ${T.incluye})`, `Nombre: ${nombre}`];
    track('form_submit', { tipo: 'taller' });
    openWa(lines.join('\n'), 'taller');
  }
  function sendGrupo() {
    const Gp = D.grupos;
    const fe = $('[data-gr-fecha]');
    const nombre = $('[data-gr-nombre]').value.trim();
    const err = $('[data-gr-err]');
    if (!fe.value || !checkFecha()) { err.textContent = 'Elige una fecha de lunes a sábado.'; err.hidden = false; fe.focus(); return; }
    if (!nombre) { err.textContent = 'Escribe tu nombre.'; err.hidden = false; $('[data-gr-nombre]').focus(); return; }
    err.hidden = true;
    const lines = [waText('grupo_titulo'), '', `Personas: ${res.gPers}`, `Fecha: ${fmtDate(fe.value)}`];
    if (res.occ) lines.push(`Ocasión: ${res.occ}`);
    lines.push(`Total: ${money(res.gPers * Gp.precio_persona)} (${res.gPers} x USD ${Gp.precio_persona}, incluye ${Gp.incluye})`, `Nombre: ${nombre}`);
    track('form_submit', { tipo: 'grupo' });
    openWa(lines.join('\n'), 'grupo');
  }

  /* ---------- Resto de secciones ---------- */
  function renderBase() {
    const c = D.marca.colores;
    const r = document.documentElement.style;
    r.setProperty('--wine', c.vino); r.setProperty('--rose', c.rosa); r.setProperty('--cream', c.crema);
    r.setProperty('--sage', c.salvia); r.setProperty('--lilac', c.lila); r.setProperty('--ink', c.tinta);
    r.setProperty('--xred', c.navidad_rojo); r.setProperty('--gold', c.navidad_dorado);
    if (!D.demo.banner) $('[data-demo-bar]').remove(); else $('[data-demo-text]').textContent = D.demo.texto;
    $('[data-demo-text-foot]').textContent = D.demo.texto;
    $('[data-hero-line]').textContent = D.hero.linea;
    $('[data-hero-lead]').textContent = D.hero.bajada;
    $$('[data-precios-etiqueta]').forEach(e => { e.textContent = D.precios_etiqueta; });
    /* Titular letra por letra (la Í con su acento) */
    const t = $('[data-hero-title]');
    t.innerHTML = [...'VELATÍ'].map(ch => `<span class="ch" aria-hidden="true">${ch}</span>`).join('');

    const L = D.local;
    const addr = `${L.centro}, local ${L.local}, ${L.ciudad}`;
    $('[data-local-addr]').textContent = addr;
    $('[data-foot-addr]').textContent = addr;
    $('[data-local-desc]').textContent = L.descripcion;
    $('[data-local-hours]').textContent = L.horario ? 'Horario: ' + L.horario : 'Horario: escríbenos y te contamos.';
    $('[data-maps]').href = L.maps;

    const fl = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse transform="rotate(${a})" cx="0" cy="-7" rx="5" ry="8" fill="${col}"/>`).join('')}<circle r="3.5" fill="#f2d48a"/></g>`;
    const leaf = (x, y, a) => `<ellipse transform="translate(${x} ${y}) rotate(${a})" rx="4" ry="10" fill="#8fa086"/>`;
    $('[data-oval-flowers]').innerHTML =
      `<ellipse cx="150" cy="190" rx="132" ry="176" fill="none" stroke="#6b1e33" stroke-width="1.5" opacity=".55"/>` +
      `<ellipse cx="150" cy="190" rx="122" ry="166" fill="none" stroke="#6b1e33" stroke-width=".8" opacity=".35"/>` +
      leaf(40, 72, -30) + leaf(56, 52, 20) + leaf(250, 312, 30) + leaf(236, 334, -20) + leaf(262, 70, 40) + leaf(36, 310, -40) +
      fl(46, 56, 1.4, '#e4a5ae') + fl(70, 40, 1, '#b7a3c8') + fl(28, 92, .9, '#f4dfdc') +
      fl(254, 324, 1.4, '#e4a5ae') + fl(228, 344, 1, '#b7a3c8') + fl(272, 290, .9, '#f4dfdc') +
      fl(262, 54, .8, '#b7a3c8') + fl(40, 330, .8, '#e4a5ae');

    const mq = $('[data-marq]');
    const items = D.marquee.map(x => `<span>${x}</span><i>✦</i>`).join('');
    mq.innerHTML = items + items;

    const dest = $('[data-destacados]');
    D.destacados.map(prod).filter(sellable).forEach(p => dest.append(miniCard(p)));

    $('[data-firma-txt]').textContent = D.firma.texto;
    if (D.firma.enlace) {
      const ig = $('[data-ignis]');
      const a = h('a', { class: ig.className, href: D.firma.enlace, target: '_blank', rel: 'noopener', html: ig.innerHTML });
      ig.replaceWith(a);
    }
  }
  function renderResto() {
    const T = taller();
    T.aprendes.forEach(a => $('[data-aprendes]').append(h('li', {}, a)));
    ['Materiales incluidos', `USD ${T.precio} por persona`, `Duración: ${T.duracion}`, `En el ${T.lugar}`, T.cupos_texto].forEach(a => $('[data-incluye]').append(h('li', {}, a)));

    if (D.corporativo && D.corporativo.mostrar) {
      $('[data-corp]').hidden = false;
      $('[data-corp-form]').addEventListener('submit', e => {
        e.preventDefault();
        const v = s => $(s).value.trim();
        const lines = [waText('corporativo_titulo'), '', 'Empresa: ' + v('[data-c-emp]'), 'Cantidad: ' + v('[data-c-cant]'), 'Presupuesto por unidad: USD ' + v('[data-c-pres]'), 'Fecha: ' + (v('[data-c-fecha]') ? fmtDate(v('[data-c-fecha]')) : 'por definir')];
        track('form_submit', { tipo: 'corporativo' });
        openWa(lines.join('\n'), 'corporativo');
      });
    } else $('[data-corp]').remove();

    const gal = $('[data-galeria]');
    if (D.galeria.length) D.galeria.forEach(g => gal.append(h('img', { class: 'ph', src: g.src, alt: g.alt || '', loading: 'lazy', width: 600, height: 600, onload: e => e.target.classList.add('is-in') })));
    else gal.append(h('div', { class: 'gal__ph' }, h('span', { class: 'gal__icon', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flame"/></svg>' }), h('p', {}, D.galeria_placeholder)));

    const faq = $('[data-faq]');
    D.faq.filter(f => f.respuesta).forEach(f => faq.append(h('details', { class: 'qa' }, h('summary', {}, f.pregunta), h('p', {}, f.respuesta))));

    const pf = $('[data-pform]');
    $('[data-p-fecha]').min = todayISO();
    pf.addEventListener('submit', e => {
      e.preventDefault();
      const n = $('[data-p-nombre]').value.trim(), q = $('[data-p-que]').value.trim(), fch = $('[data-p-fecha]').value, det = $('[data-p-det]').value.trim();
      if (!n || !q) { $('[data-p-err]').hidden = false; return; }
      $('[data-p-err]').hidden = true;
      const lines = [waText('pedido_titulo'), '', 'Nombre: ' + n, 'Quiero: ' + q];
      if (fch) lines.push('Para: ' + fmtDate(fch));
      if (det) lines.push('Detalle: ' + det);
      track('form_submit', { tipo: 'pedido' });
      openWa(lines.join('\n'), 'pedido');
    });
  }

  /* ---------- Navegación: sección activa, progreso, cabecera ---------- */
  function initNav() {
    const top = $('[data-top]');
    const bar = $('[data-progress]');
    const onScroll = () => {
      top.classList.toggle('is-scrolled', scrollY > 10);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) $$('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === e.target.id));
      }), { rootMargin: '-45% 0px -50% 0px' });
      $$('[data-sec]').forEach(s => io.observe(s));
    }
    /* El dock se esconde mientras escribes */
    const dock = $('[data-dock]');
    document.addEventListener('focusin', e => { if (e.target.matches('input, textarea')) dock.classList.add('is-hidden'); });
    document.addEventListener('focusout', () => dock.classList.remove('is-hidden'));
  }

  /* ---------- Detalles premium: cursor llama y botones magnéticos ---------- */
  function premium() {
    if (reduced || !finePtr.matches || !window.gsap) return;
    const c = $('[data-cursor]');
    document.documentElement.classList.add('has-cursor');
    const xTo = gsap.quickTo(c, 'x', { duration: .25, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); c.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerover', e => c.classList.toggle('is-hot', !!e.target.closest('a, button, label, select, summary')));
    document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1, .4)' }));
    });
  }

  /* ---------- Chispas doradas (canvas, solo visible en el catálogo) ---------- */
  function sparks() {
    if (reduced) return;
    const cv = $('[data-sparks]');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, on = false, raf = 0;
    const N = wideMQ.matches ? 46 : 22;
    const ps = [];
    const size = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const spawn = (p, init) => Object.assign(p, { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: .6 + Math.random() * 1.6, v: .15 + Math.random() * .45, a: Math.random() * Math.PI * 2, f: .4 + Math.random() * .6 });
    size();
    for (let i = 0; i < N; i++) ps.push(spawn({}, true));
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.v; p.a += .02; p.x += Math.sin(p.a) * .3;
        if (p.y < -10) spawn(p);
        const tw = .45 + .55 * Math.abs(Math.sin(p.a * 1.7));
        ctx.globalAlpha = tw * p.f;
        ctx.fillStyle = '#f1d9a6';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      if (on) raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(raf); if (on) tick(); }).observe(cv);
    addEventListener('resize', () => { size(); });
  }

  /* ---------- Pétalos del hero ---------- */
  function petals() {
    if (reduced) return;
    const box = $('[data-petals]');
    const cols = ['#e4a5ae', '#f4dfdc', '#b7a3c8'];
    for (let i = 0; i < 9; i++) box.append(h('i', { class: 'petal', style: `left:${5 + i * 11}%;--d:${10 + (i % 4) * 2.5}s;--delay:${-i * 1.7}s;--c:${cols[i % 3]};--s:${.6 + (i % 3) * .25}` }));
  }

  /* ---------- Movimiento de autor ---------- */
  function motion() {
    const hero = $('[data-hero]');
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => hero.classList.toggle('is-off', !en.isIntersecting)).observe(hero);
    const g = G();
    if (!g) { document.documentElement.classList.add('no-motion'); return; }
    const ST = window.ScrollTrigger;
    if (ST) g.registerPlugin(ST);

    /* Entrada: el titular letra por letra y la vela se enciende */
    g.timeline({ delay: .15 })
      .from('[data-hero-script]', { y: 20, opacity: 0, duration: .7, ease: 'power2.out' })
      .from('.hero__title .ch', { yPercent: 110, opacity: 0, rotate: 8, duration: .9, stagger: .06, ease: 'power3.out' }, '<.1')
      .from('.hero__line, .hero__lead, .hero__cta', { y: 18, opacity: 0, duration: .6, stagger: .1 }, '-=.5')
      .from('.oval', { scale: .9, opacity: 0, duration: .9, ease: 'power2.out' }, .25)
      .from('[data-flame]', { scaleY: 0, scaleX: .3, opacity: 0, transformOrigin: '50% 100%', duration: .7, ease: 'back.out(2.5)' }, '-=.15')
      .from('[data-glow]', { opacity: 0, scale: .4, duration: 1.2, ease: 'power2.out' }, '<')
      .from('[data-hint]', { opacity: 0, duration: .6 }, '-=.4');

    if (!ST) return;
    const mm = g.matchMedia();
    /* Escritorio y tablet: escena fijada, la vela se derrite con el scroll */
    mm.add('(min-width: 768px)', () => {
      const tl = g.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: .6, pin: '[data-hero-stage]', anticipatePin: 1 } });
      tl.to('[data-wax]', { scaleY: .62, transformOrigin: '50% 100%', ease: 'none' }, 0)
        .to('[data-drip]', { height: 70, ease: 'none' }, 0)
        .to('[data-drip2]', { height: 48, ease: 'none' }, .1)
        .to('[data-puddle]', { scaleX: 1, opacity: 1, ease: 'none' }, .2)
        .to('[data-candle] .flame, [data-candle] .wick', { y: 46, ease: 'none' }, 0)
        .to('[data-glow]', { scale: 2.1, opacity: 1, ease: 'none' }, 0)
        .to('[data-warm]', { opacity: 1, ease: 'none' }, 0)
        .to('.hero__copy', { y: -40, opacity: .15, ease: 'none' }, .35)
        .to('[data-hint]', { opacity: 0, duration: .1 }, 0);
    });
    /* Móvil: versión corta, sin pin */
    mm.add('(max-width: 767px)', () => {
      g.to('[data-glow]', { scale: 1.5, opacity: 1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      g.to('[data-wax]', { scaleY: .8, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      g.to('[data-candle] .flame, [data-candle] .wick', { y: 22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });

    /* Transición rosa a vino al entrar al catálogo */
    g.fromTo('.catalogo', { '--bg-mix': 0 }, { '--bg-mix': 1, ease: 'none', scrollTrigger: { trigger: '.catalogo', start: 'top 95%', end: 'top 25%', scrub: true } });

    /* Marquee que acelera con la velocidad del scroll */
    const mq = $('[data-marq]');
    let x = 0, boost = 0;
    const half = () => mq.scrollWidth / 2;
    g.ticker.add(() => {
      x -= .6 + boost; boost *= .92;
      if (-x >= half()) x += half();
      mq.style.transform = `translate3d(${x}px,0,0)`;
    });
    ST.create({ onUpdate: s => { boost = Math.min(14, Math.abs(s.getVelocity()) / 220); } });

    /* Reveals */
    $$('[data-reveal]').forEach(el => g.from(el, { y: 30, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
    ST.batch('.card', { start: 'top 92%', once: true, onEnter: b => g.fromTo(b, { y: 34, opacity: 0, clipPath: 'inset(18% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: .7, stagger: .06, ease: 'power3.out', overwrite: true }) });
    addEventListener('load', () => ST.refresh(), { once: true });

    /* Lenis solo en escritorio */
    if (wideMQ.matches && window.Lenis) {
      const lenis = new window.Lenis({ lerp: .1 });
      lenis.on('scroll', ST.update);
      g.ticker.add(t => lenis.raf(t * 1000));
      g.ticker.lagSmoothing(0);
      window.__lenis = lenis;
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2 || a.getAttribute('href').startsWith('#p/')) return;
        const t = $(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        closeDrawer();
        lenis.scrollTo(t, { offset: -64 });
      });
      const obs = new MutationObserver(() => { document.documentElement.classList.contains('is-locked') ? lenis.stop() : lenis.start(); });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ---------- Arranque ---------- */
  async function init() {
    try {
      const r = await fetch('data.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      D = await r.json();
    } catch (err) {
      $('main').prepend(h('p', { role: 'alert', style: 'padding:120px 16px 24px;font-weight:700' }, 'No se pudo cargar data.json. Abre la página desde un servidor (por ejemplo, python3 -m http.server).'));
      console.warn('data.json', err);
      return;
    }
    /* Limpia del carrito productos que ya no existen */
    Object.keys(cart.qty).forEach(id => { if (!sellable(prod(id))) delete cart.qty[id]; });
    if (!D.presentaciones.some(x => x.id === cart.pres)) cart.pres = 'sin-caja';
    renderBase();
    renderCatalog();
    initDrawer();
    renderCart();
    renderReserva();
    renderResto();
    $$('[data-wa]').forEach(a => { a.href = waLink(waText(a.dataset.wa)); });
    initMedicion();
    initNav();
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-wa]');
      if (!a) return;
      a.href = waLink(waText(a.dataset.wa));
      window.__lastWa = a.href;
      track('whatsapp_click', { origen: 'flotante' });
    });
    $$('[data-drawer] a[href^="#"]').forEach(a => a.addEventListener('click', closeDrawer));
    petals();
    sparks();
    premium();
    motion();
    initSheet();
    window.__velati = { cart, totals, giftMessage, res, D };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
