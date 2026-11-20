/* Velati (demo). Todo el contenido sale de data.json. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wideMQ = matchMedia('(min-width: 900px)');
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

  let D = null;

  /* ---------- WhatsApp ---------- */
  const waLink = text => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`;
  const waText = key => (D.mensajes && D.mensajes[key]) || key;
  function openWa(text, origen) {
    track('whatsapp_click', { origen });
    const url = waLink(text);
    window.__lastWa = url; /* para pruebas */
    const w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
  }
  function bindWa(rootEl = document) {
    $$('[data-wa]', rootEl).forEach(a => { a.href = waLink(waText(a.dataset.wa)); });
  }

  /* ---------- Medición (sin IDs no se inyecta nada) ---------- */
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
      window.fbq('init', pid);
      window.fbq('track', 'PageView');
      M.fb = true;
    }
    if (/^G-[A-Z0-9]{4,20}$/.test(gid)) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gid);
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gid);
      document.head.append(s);
      M.ga = true;
    }
  }
  function track(name, params = {}) {
    try {
      if (M.fb && window.fbq) window.fbq('track', name === 'form_submit' ? 'Lead' : 'Contact', params);
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
  let toastT = 0;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  /* ---------- Ilustraciones referenciales (SVG) ---------- */
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
  const illo = (p, cls = '') => `<svg class="illo ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${(ILLO[p.ilustracion] || ILLO.regalo)(p.tono)}</svg>`;

  /* ---------- Marca y textos fijos ---------- */
  function renderBase() {
    const c = D.marca.colores;
    const r = document.documentElement.style;
    r.setProperty('--wine', c.vino); r.setProperty('--rose', c.rosa); r.setProperty('--cream', c.crema);
    r.setProperty('--sage', c.salvia); r.setProperty('--lilac', c.lila); r.setProperty('--ink', c.tinta);
    r.setProperty('--xred', c.navidad_rojo); r.setProperty('--gold', c.navidad_dorado);

    const bar = $('[data-demo-bar]');
    if (!D.demo.banner) bar.remove(); else $('[data-demo-text]').textContent = D.demo.texto;
    $('[data-demo-text-foot]').textContent = D.demo.texto;
    $('[data-hero-line]').textContent = D.hero.linea;
    $('[data-hero-lead]').textContent = D.hero.bajada;
    $$('[data-img-note]').forEach(e => { e.textContent = D.marca.nota_imagenes; });
    $$('[data-precios-etiqueta]').forEach(e => { e.textContent = D.precios_etiqueta; });

    const L = D.local;
    const addr = `${L.centro}, local ${L.local}, ${L.ciudad}`;
    $('[data-local-addr]').textContent = addr;
    $('[data-foot-addr]').textContent = addr;
    $('[data-local-desc]').textContent = L.descripcion;
    $('[data-local-hours]').textContent = L.horario ? 'Horario: ' + L.horario : 'Horario: escríbenos y te contamos.';
    $('[data-maps]').href = L.maps;

    /* Flores del marco ovalado (firma de sus flyers) */
    const fl = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse transform="rotate(${a})" cx="0" cy="-7" rx="5" ry="8" fill="${col}"/>`).join('')}<circle r="3.5" fill="#f2d48a"/></g>`;
    const leaf = (x, y, a) => `<ellipse transform="translate(${x} ${y}) rotate(${a})" rx="4" ry="10" fill="#8fa086"/>`;
    $('[data-oval-flowers]').innerHTML =
      `<ellipse cx="150" cy="190" rx="132" ry="176" fill="none" stroke="#6b1e33" stroke-width="1.5" opacity=".55"/>` +
      `<ellipse cx="150" cy="190" rx="122" ry="166" fill="none" stroke="#6b1e33" stroke-width=".8" opacity=".35"/>` +
      leaf(40, 72, -30) + leaf(56, 52, 20) + leaf(250, 312, 30) + leaf(236, 334, -20) + leaf(262, 70, 40) + leaf(36, 310, -40) +
      fl(46, 56, 1.4, '#e4a5ae') + fl(70, 40, 1, '#b7a3c8') + fl(28, 92, .9, '#f4dfdc') +
      fl(254, 324, 1.4, '#e4a5ae') + fl(228, 344, 1, '#b7a3c8') + fl(272, 290, .9, '#f4dfdc') +
      fl(262, 54, .8, '#b7a3c8') + fl(40, 330, .8, '#e4a5ae');
  }

  /* ---------- 3a. Arma tu regalo ---------- */
  const gift = { qty: {}, pres: 'sin-caja', filtro: 'todos' };
  const pickable = () => D.productos.filter(p => p.categoria !== 'caja' && p.estado !== 'proximamente' && p.precio != null);
  function lineCalc(p, q) {
    if (p.oferta && q >= p.oferta.cantidad) {
      const packs = Math.floor(q / p.oferta.cantidad);
      const rest = q % p.oferta.cantidad;
      return { total: packs * p.oferta.precio + rest * p.precio, oferta: true };
    }
    return { total: q * p.precio, oferta: false };
  }
  function giftTotals() {
    const lines = Object.entries(gift.qty).filter(([, q]) => q > 0).map(([id, q]) => {
      const p = prod(id);
      return { p, q, ...lineCalc(p, q) };
    });
    const pres = D.presentaciones.find(x => x.id === gift.pres);
    const presP = pres && pres.producto ? prod(pres.producto) : null;
    const total = lines.reduce((s, l) => s + l.total, 0) + (presP ? presP.precio : 0);
    return { lines, pres, presP, total };
  }

  function renderBuilder() {
    const cats = D.categorias.filter(c => c.id === 'todos' || pickable().some(p => p.categoria === c.id));
    const bf = $('[data-bfilter]');
    cats.forEach(c => bf.append(h('button', { type: 'button', class: 'fchip', 'aria-pressed': String(c.id === 'todos'), 'data-cat': c.id, onclick: () => {
      gift.filtro = c.id;
      $$('.fchip', bf).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === c.id)));
      $$('[data-pick]').forEach(li => { li.hidden = !(c.id === 'todos' || li.dataset.cat === c.id); });
    } }, c.nombre)));

    const ul = $('[data-picker]');
    pickable().forEach(p => {
      const li = h('li', { class: 'pick', 'data-pick': p.id, 'data-cat': p.categoria });
      li.innerHTML = `${illo(p, 'pick__img')}<div class="pick__txt"><b>${p.nombre}</b><small>${p.descripcion}</small><span class="pick__price">${money(p.precio)}${p.oferta ? ` <em class="badge">${p.oferta.cantidad} x ${money(p.oferta.precio)}</em>` : ''}</span></div>`;
      const st = h('div', { class: 'stepper stepper--sm', role: 'group', 'aria-label': 'Cantidad de ' + p.nombre },
        h('button', { type: 'button', 'aria-label': 'Quitar ' + p.nombre, onclick: () => setQty(p.id, -1) }, '−'),
        h('output', { 'data-q': p.id, 'aria-live': 'polite' }, '0'),
        h('button', { type: 'button', 'aria-label': 'Agregar ' + p.nombre, onclick: e => setQty(p.id, 1, e.currentTarget) }, '+'));
      li.append(st);
      ul.append(li);
    });

    const pr = $('[data-pres]');
    D.presentaciones.forEach(x => {
      const pp = x.producto ? prod(x.producto) : null;
      const lab = h('label', { class: 'presopt' },
        h('input', { type: 'radio', name: 'pres', value: x.id, checked: x.id === gift.pres, onchange: () => setPres(x.id) }),
        h('span', { class: 'presopt__in' },
          h('b', {}, x.nombre),
          h('small', {}, x.descripcion),
          h('span', { class: 'presopt__p' }, pp ? money(pp.precio) : 'Sin costo extra')));
      pr.append(lab);
    });

    $('[data-card-head]').textContent = D.tarjeta.encabezado;
    const msg = $('[data-g-msg]');
    msg.maxLength = D.tarjeta.max;
    const cnt = () => { $('[data-g-count]').textContent = `(${msg.value.length}/${D.tarjeta.max})`; };
    cnt();
    msg.addEventListener('input', () => { cnt(); updateCard(); });
    $('[data-g-para]').addEventListener('input', updateCard);
    $('[data-g-de]').addEventListener('input', updateCard);
    $('[data-send-gift]').addEventListener('click', sendGift);
    updateCard();
    updateSummary();
  }

  function setQty(id, d, from) {
    const q = Math.max(0, Math.min(20, (gift.qty[id] || 0) + d));
    gift.qty[id] = q;
    const o = $(`[data-q="${id}"]`);
    if (o) o.textContent = q;
    const li = $(`[data-pick="${id}"]`);
    if (li) li.classList.toggle('is-on', q > 0);
    if (d > 0) dropAnim(prod(id), from);
    $('[data-gift-err]').hidden = true;
    updateSummary();
  }
  function setPres(id) {
    gift.pres = id;
    $$('input[name="pres"]').forEach(i => { i.checked = i.value === id; });
    const box = $('[data-gb-box]');
    box.classList.toggle('is-xmas', id !== 'sin-caja');
    const g = G();
    if (g) g.fromTo(box, { scale: .92 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    updateSummary();
  }
  function dropAnim(p) {
    const items = $('[data-gb-items]');
    const n = Object.values(gift.qty).reduce((s, q) => s + q, 0);
    if (items.children.length < 7) {
      const el = h('span', { class: 'gb-item', html: illo(p) });
      items.append(el);
      const g = G();
      if (g) g.fromTo(el, { y: -150, rotate: -25, opacity: 0 }, { y: 0, rotate: (n % 2 ? 6 : -6), opacity: 1, duration: .75, ease: 'bounce.out' });
    } else {
      const g = G();
      if (g) g.fromTo($('[data-gb-box]'), { y: 0 }, { y: 4, duration: .12, yoyo: true, repeat: 1 });
    }
  }
  function syncGiftItems() {
    const items = $('[data-gb-items]');
    const want = [];
    Object.entries(gift.qty).forEach(([id, q]) => { for (let i = 0; i < q; i++) want.push(id); });
    if (want.length < items.children.length) {
      items.innerHTML = '';
      want.slice(0, 7).forEach((id, i) => items.append(h('span', { class: 'gb-item', style: `transform:rotate(${i % 2 ? 6 : -6}deg)`, html: illo(prod(id)) })));
    }
  }
  function updateSummary() {
    syncGiftItems();
    const t = giftTotals();
    const ul = $('[data-lines]');
    ul.innerHTML = '';
    t.lines.forEach(l => ul.append(h('li', {},
      h('span', {}, `${l.q} x ${l.p.nombre}`, l.oferta ? h('em', { class: 'badge' }, `oferta ${l.p.oferta.cantidad} x ${money(l.p.oferta.precio)}`) : null),
      h('b', {}, money(l.total)))));
    if (t.presP) ul.append(h('li', { class: 'lines__pres' }, h('span', {}, t.pres.nombre), h('b', {}, money(t.presP.precio))));
    $('[data-empty]').hidden = t.lines.length > 0 || !!t.presP;
    $('[data-total]').textContent = money(t.total);
    const n = t.lines.reduce((s, l) => s + l.q, 0);
    $('[data-giftbar-txt]').textContent = `🎁 ${n} ${n === 1 ? 'pieza' : 'piezas'} · ${money(t.total)}`;
    giftbarSync();
    $('[data-total-note]').textContent = D.precios_etiqueta + '. Se confirman por WhatsApp.';
    const g = G();
    if (g) g.fromTo('[data-total]', { scale: 1.15 }, { scale: 1, duration: .35, ease: 'power2.out' });
  }
  let regaloVisible = false, summaryVisible = false;
  function giftbarSync() {
    const n = Object.values(gift.qty).reduce((s, q) => s + q, 0);
    $('[data-giftbar]').classList.toggle('is-on', n > 0 && regaloVisible && !summaryVisible);
  }
  function watchGiftbar() {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(([e]) => { regaloVisible = e.isIntersecting; giftbarSync(); }).observe($('.builder__steps'));
    new IntersectionObserver(([e]) => { summaryVisible = e.isIntersecting; giftbarSync(); }, { threshold: .15 }).observe($('.summary'));
  }
  function updateCard() {
    const para = $('[data-g-para]').value.trim();
    const msg = $('[data-g-msg]').value.trim();
    const de = $('[data-g-de]').value.trim();
    $('[data-card-para]').textContent = 'Para ' + (para || 'alguien especial');
    $('[data-card-msg]').textContent = msg || 'Tu mensaje aparece aquí mientras escribes…';
    $('[data-card-msg]').classList.toggle('is-ph', !msg);
    $('[data-card-de]').textContent = de ? 'Con cariño, ' + de : '';
  }
  function giftMessage() {
    const t = giftTotals();
    const out = [waText('regalo_titulo'), ''];
    t.lines.forEach(l => out.push(`• ${l.q} x ${l.p.nombre}: ${money(l.total)}${l.oferta ? ` (oferta ${l.p.oferta.cantidad} x ${money(l.p.oferta.precio)})` : ''}`));
    out.push(`Presentación: ${t.pres.nombre}${t.presP ? ` (${money(t.presP.precio)})` : ''}`);
    out.push(`Total referencial: ${money(t.total)}`);
    const para = $('[data-g-para]').value.trim();
    const msg = $('[data-g-msg]').value.trim();
    const de = $('[data-g-de]').value.trim();
    if (para || msg || de) {
      out.push('', 'Tarjeta:');
      if (para) out.push('Para: ' + para);
      if (msg) out.push('Mensaje: ' + msg);
      if (de) out.push('De: ' + de);
    }
    out.push('', `(${D.precios_etiqueta}, por confirmar) ✨`);
    return out.join('\n');
  }
  function sendGift() {
    if (!giftTotals().lines.length) {
      $('[data-gift-err]').hidden = false;
      toast('Elige al menos una vela 💗');
      return;
    }
    track('form_submit', { tipo: 'regalo' });
    openWa(giftMessage(), 'regalo');
  }

  /* ---------- 4. Colección Navidad ---------- */
  function renderGrid() {
    const navidad = D.productos.filter(p => p.coleccion === 'navidad');
    const f = $('[data-filters]');
    D.categorias.filter(c => c.id === 'todos' || navidad.some(p => p.categoria === c.id)).forEach(c =>
      f.append(h('button', { type: 'button', class: 'fchip fchip--gold', 'aria-pressed': String(c.id === 'todos'), 'data-cat': c.id, onclick: () => {
        $$('.fchip', f).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === c.id)));
        $$('[data-card]').forEach(li => { li.hidden = !(c.id === 'todos' || li.dataset.cat === c.id); });
        const g = G();
        if (g) g.fromTo($$('[data-card]:not([hidden])'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: .03, ease: 'power2.out' });
      } }, c.nombre)));

    const ul = $('[data-grid]');
    navidad.forEach(p => {
      const soon = p.estado === 'proximamente';
      const li = h('li', { class: 'card' + (soon ? ' is-soon' : ''), 'data-card': p.id, 'data-cat': p.categoria });
      li.innerHTML = `<div class="card__art">${illo(p)}${soon ? '<span class="card__tag">Próximamente</span>' : ''}${p.oferta ? `<span class="card__tag card__tag--gold">${p.oferta.cantidad} x ${money(p.oferta.precio)}</span>` : ''}</div>
        <div class="card__body"><h3>${p.nombre}</h3><p>${p.descripcion}</p><p class="card__price">${p.precio != null ? money(p.precio) : (p.precio_texto || '')}</p></div>`;
      if (!soon) {
        li.append(h('button', { type: 'button', class: 'btn btn--gold btn--sm btn--block', onclick: () => addFromCatalog(p) }, 'Agregar al regalo'));
      }
      ul.append(li);
    });
    $('[data-grid-note]').textContent = D.marca.nota_imagenes + ' Las tazas estaban anunciadas como "próximamente" y no se pueden agregar.';
  }
  function addFromCatalog(p) {
    if (p.categoria === 'caja') {
      setPres(p.id);
      toast(`${p.nombre} va como presentación de tu regalo 🎁`);
    } else {
      setQty(p.id, 1);
      toast(`Agregaste ${p.nombre} a tu regalo 💗`);
    }
  }

  /* ---------- 3b. Reservas ---------- */
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
    $('[data-g-meta]').textContent = `De ${Gp.min} a ${Gp.max} personas · lunes a sábado · USD ${Gp.precio_persona} por persona · incluye ${Gp.incluye} · ${Gp.cupos_texto.toLowerCase()}`;
    res.gPers = Gp.min;
    $('[data-gr-minus]').addEventListener('click', () => { res.gPers--; clampG(); });
    $('[data-gr-plus]').addEventListener('click', () => { res.gPers++; clampG(); });
    const fe = $('[data-gr-fecha]');
    fe.min = addDaysISO(todayISO(), 1);
    fe.addEventListener('change', checkFecha);
    fe.addEventListener('input', checkFecha);
    const occ = $('[data-gr-occ]');
    Gp.ocasiones.forEach(o => occ.append(h('button', { type: 'button', class: 'fchip', role: 'radio', 'aria-checked': 'false', onclick: e => {
      res.occ = res.occ === o ? '' : o;
      $$('.fchip', occ).forEach(b => b.setAttribute('aria-checked', String(b.textContent === res.occ)));
    } }, o)));
    $('[data-send-grupo]').addEventListener('click', sendGrupo);
    clampG();

    /* Pestañas */
    const tabs = $$('[data-tab]');
    tabs.forEach(t => {
      t.addEventListener('click', () => setTab(t.dataset.tab));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = tabs.indexOf(t);
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        setTab(n.dataset.tab); n.focus();
      });
    });
    $$('[data-tab-go]').forEach(a => a.addEventListener('click', () => setTab(a.dataset.tabGo)));
    addEventListener('resize', () => setTab(res.tab, true));
    setTab('taller', true);
  }
  function setTab(id, instant) {
    res.tab = id;
    $$('[data-tab]').forEach(t => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== id; });
    const t = $(`[data-tab="${id}"]`);
    const ind = $('[data-tabs-ind]');
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = `translateX(${t.offsetLeft}px)`;
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
    if (fe.value < fe.min) {
      err.textContent = 'Elige una fecha a partir de mañana.';
      err.hidden = false; fe.value = ''; return false;
    }
    if (new Date(fe.value + 'T12:00:00').getDay() === 0) {
      err.textContent = 'Los domingos no hay grupos. Elige de lunes a sábado.';
      err.hidden = false; fe.value = ''; return false;
    }
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
      `Personas: ${res.tPers}`,
      `Total: ${money(res.tPers * T.precio)} (USD ${T.precio} por persona, incluye ${T.incluye})`,
      `Nombre: ${nombre}`];
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
    const lines = [waText('grupo_titulo'), '',
      `Personas: ${res.gPers}`,
      `Fecha: ${fmtDate(fe.value)}`];
    if (res.occ) lines.push(`Ocasión: ${res.occ}`);
    lines.push(`Total: ${money(res.gPers * Gp.precio_persona)} (${res.gPers} x USD ${Gp.precio_persona}, incluye ${Gp.incluye})`, `Nombre: ${nombre}`);
    track('form_submit', { tipo: 'grupo' });
    openWa(lines.join('\n'), 'grupo');
  }

  /* ---------- 5, 6, 7, 9, 10, 11 ---------- */
  function renderResto() {
    const ul = $('[data-seasons]');
    D.colecciones_anio.forEach(c => ul.append(h('li', { class: 'season', style: `--tone:${c.tono}` }, h('span', { class: 'season__dot' }), h('b', {}, c.nombre), h('small', {}, c.nota))));

    const T = taller();
    T.aprendes.forEach(a => $('[data-aprendes]').append(h('li', {}, a)));
    [`Materiales incluidos`, `USD ${T.precio} por persona`, `Duración: ${T.duracion}`, `En el ${T.lugar}`, T.cupos_texto].forEach(a => $('[data-incluye]').append(h('li', {}, a)));

    if (D.corporativo && D.corporativo.mostrar) {
      const sec = $('[data-corp]');
      sec.hidden = false;
      $('[data-corp-form]').addEventListener('submit', e => {
        e.preventDefault();
        const v = s => $(s).value.trim();
        const lines = [waText('corporativo_titulo'), '', 'Empresa: ' + v('[data-c-emp]'), 'Cantidad: ' + v('[data-c-cant]'), 'Presupuesto por unidad: USD ' + v('[data-c-pres]'), 'Fecha: ' + (v('[data-c-fecha]') ? fmtDate(v('[data-c-fecha]')) : 'por definir')];
        track('form_submit', { tipo: 'corporativo' });
        openWa(lines.join('\n'), 'corporativo');
      });
    } else {
      $('[data-corp]').remove();
    }

    const gal = $('[data-galeria]');
    if (D.galeria.length) {
      D.galeria.forEach(g => gal.append(h('img', { src: g.src, alt: g.alt || '', loading: 'lazy', width: 600, height: 600 })));
    } else {
      gal.append(h('div', { class: 'gal__ph' }, h('span', {}, '📸'), h('p', {}, D.galeria_placeholder)));
    }

    const faq = $('[data-faq]');
    D.faq.filter(f => f.respuesta).forEach((f, i) => {
      const d = h('details', { class: 'qa' }, h('summary', {}, f.pregunta), h('p', {}, f.respuesta));
      faq.append(d);
    });

    const pf = $('[data-pform]');
    $('[data-p-fecha]').min = todayISO();
    pf.addEventListener('submit', e => {
      e.preventDefault();
      const n = $('[data-p-nombre]').value.trim();
      const q = $('[data-p-que]').value.trim();
      const fch = $('[data-p-fecha]').value;
      const det = $('[data-p-det]').value.trim();
      if (!n || !q) { $('[data-p-err]').hidden = false; return; }
      $('[data-p-err]').hidden = true;
      const lines = [waText('pedido_titulo'), '', 'Nombre: ' + n, 'Quiero: ' + q];
      if (fch) lines.push('Para: ' + fmtDate(fch));
      if (det) lines.push('Detalle: ' + det);
      track('form_submit', { tipo: 'pedido' });
      openWa(lines.join('\n'), 'pedido');
    });
  }

  /* ---------- Movimiento ---------- */
  function petals() {
    const box = $('[data-petals]');
    if (reduced) return;
    const cols = ['#e4a5ae', '#f4dfdc', '#b7a3c8'];
    for (let i = 0; i < 9; i++) {
      box.append(h('i', { class: 'petal', style: `left:${5 + i * 11}%;--d:${9 + (i % 4) * 2.5}s;--delay:${-i * 1.7}s;--c:${cols[i % 3]};--s:${.6 + (i % 3) * .25}` }));
    }
  }
  function motion() {
    const hero = $('.hero');
    /* Pausa llama y pétalos fuera de pantalla */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => hero.classList.toggle('is-off', !en.isIntersecting)).observe(hero);
    }
    const g = G();
    if (!g) { document.documentElement.classList.add('no-motion'); return; }
    const ST = window.ScrollTrigger;
    if (ST) g.registerPlugin(ST);

    /* La vela se enciende al entrar */
    const tl = g.timeline({ delay: .2 });
    tl.from('.hero__script', { y: 20, opacity: 0, duration: .7, ease: 'power2.out' })
      .from('.hero__title', { y: 30, opacity: 0, letterSpacing: '.4em', duration: 1, ease: 'power3.out' }, '<.1')
      .from('.hero__line, .hero__lead, .hero__cta', { y: 18, opacity: 0, duration: .6, stagger: .1 }, '-=.5')
      .from('.oval', { scale: .9, opacity: 0, duration: .9, ease: 'power2.out' }, .3)
      .from('[data-flame]', { scaleY: 0, scaleX: .3, opacity: 0, transformOrigin: '50% 100%', duration: .7, ease: 'back.out(2.5)' }, '-=.2')
      .from('[data-glow]', { opacity: 0, scale: .4, duration: 1.2, ease: 'power2.out' }, '<');

    if (ST) {
      /* La luz crece con el scroll */
      g.to('[data-glow]', { scale: 1.45, opacity: 1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.hero__candle', { y: 60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      $$('[data-reveal]').forEach(el => g.from(el, { y: 28, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
      g.from('.pick', { y: 20, opacity: 0, duration: .5, stagger: .03, ease: 'power2.out', scrollTrigger: { trigger: '[data-picker]', start: 'top 85%', once: true } });
      g.from('.card', { y: 24, opacity: 0, duration: .5, stagger: .03, ease: 'power2.out', scrollTrigger: { trigger: '[data-grid]', start: 'top 85%', once: true } });
      addEventListener('load', () => ST.refresh(), { once: true });
    }

    /* Lenis solo en escritorio */
    if (wideMQ.matches && window.Lenis) {
      const lenis = new window.Lenis({ lerp: .1 });
      if (ST) lenis.on('scroll', ST.update);
      g.ticker.add(t => lenis.raf(t * 1000));
      g.ticker.lagSmoothing(0);
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        const t = $(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -70 });
      });
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
    renderBase();
    renderBuilder();
    watchGiftbar();
    renderReserva();
    renderGrid();
    renderResto();
    bindWa();
    initMedicion();
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-wa]');
      if (!a) return;
      a.href = waLink(waText(a.dataset.wa));
      window.__lastWa = a.href;
      track('whatsapp_click', { origen: a.classList.contains('fab') ? 'flotante' : (a.closest('section') || {}).id || 'cabecera' });
    });
    /* Header con sombra al hacer scroll */
    const top = $('[data-top]');
    addEventListener('scroll', () => top.classList.toggle('is-scrolled', scrollY > 10), { passive: true });
    petals();
    motion();
    window.__velati = { gift, res, giftMessage, D };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
