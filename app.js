'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Core tools (real feature counts from the templates).
const products = [
  ['Facecam Master', 'Rosto e reação', 'Facecam Master', '6 estilos visuais, 5 formatos de moldura, bordas, glow, sombra, posição e impacto de reação.'],
  ['Zoom Dinâmico', 'Movimento e enquadramento', 'Dynamic Zoom', '6 estilos de movimento, alvo do zoom, perspectiva 3D, shake e controle de entrada e saída.'],
  ['Legendas', '25 presets de texto', 'Captions', 'Estilos para gameplay, redes sociais, cinema e aulas. Fonte, contorno, caixa, sombra, glow e animação.'],
  ['Pop de Elementos', 'Logos, stickers e imagens', 'Asset Pop', '9 entradas, saídas ajustáveis, flutuação, pulso, contorno, sombra, flash e 3D.'],
  ['Tremor de Câmera', 'Câmera e impacto', 'Cinematic Camera Shake', '6 perfis de câmera, modos contínuo, impacto e híbrido, eixos, corte de bordas e motion blur.'],
  ['120 Transições', '12 categorias', 'Transitions', 'Limpas, deslizes, zoom, giro, formas, glitch, luz, líquido, papel, social, retrô e máscaras.']
];
const grid = $('#products');
for (const [name, type, image, text] of products) {
  const card = document.createElement('article');
  card.className = 'core';
  card.innerHTML = `<img alt="" loading="lazy" width="640" height="360"><div><p class="type"></p><h3></h3><p></p></div>`;
  card.querySelector('img').src = 'assets/icons/' + encodeURIComponent(image) + '.svg';
  card.querySelector('img').alt = 'Ícone de ' + name;
  card.querySelector('.type').textContent = type.toUpperCase();
  card.querySelector('h3').textContent = name;
  card.querySelector('p:last-child').textContent = text;
  grid.append(card);
}

// Transition catalog generated from the PT-BR inventory.
const categories = {'01': 'Limpas', '02': 'Deslizes', '03': 'Zoom e câmera', '04': 'Giro e 3D', '05': 'Formas', '06': 'Glitch',
  '07': 'Luz e cinema', '08': 'Líquido', '09': 'Papel e traços', '10': 'Social', '11': 'Retrô', '12': 'Premium'};
const transitions = window.STUDIO_TRANSITIONS || [];
let activeCategory = 'all';
const filters = $('#filters');
for (const [key, label] of [['all', 'Todas'], ...Object.entries(categories)]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.category = key;
  button.textContent = label;
  button.setAttribute('aria-pressed', String(key === 'all'));
  button.addEventListener('click', () => {
    activeCategory = key;
    $$('button', filters).forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    renderTransitions();
  });
  filters.append(button);
}
const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function renderTransitions() {
  const query = normalize($('#search').value.trim());
  const list = $('#transitions');
  list.replaceChildren();
  let shown = 0;
  for (const [id, name, category] of transitions) {
    if (activeCategory !== 'all' && category !== activeCategory) continue;
    if (query && !normalize(id + ' ' + name + ' ' + categories[category]).includes(query)) continue;
    const row = document.createElement('div');
    row.className = 'transition-row';
    const code = document.createElement('span');
    code.textContent = id;
    const tag = document.createElement('small');
    tag.textContent = categories[category];
    row.append(code, document.createTextNode(name), tag);
    list.append(row);
    shown++;
  }
  $('#count').textContent = shown === 1 ? '1 transição' : `${shown} transições`;
}
$('#search').addEventListener('input', renderTransitions);
renderTransitions();

// Animated numbers in the utility demos.
function loopNumber(element, duration, format) {
  if (!element) return;
  if (reduceMotion) { element.textContent = format(1); return; }
  const start = performance.now();
  const tick = now => {
    const t = ((now - start) % (duration + 1200)) / duration;
    const p = Math.min(1, t);
    element.textContent = format(1 - Math.pow(1 - p, 3));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
loopNumber($('[data-counter]'), 2200, p => brl.format(Math.round(p * 128450)).replace(/\s/g, ''));
const progress = $('[data-progress]');
if (progress && !reduceMotion) {
  const start = performance.now();
  const tick = now => { progress.textContent = Math.floor(((now - start) % 5000) / 50) + '%'; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
} else if (progress) progress.textContent = '62%';

// Offer: filled from offer.js (generated from release-config.json).
const offer = window.STUDIO_OFFER || {};
let checkoutUrl = null;
try { const url = new URL(offer.checkoutUrl); if (url.protocol === 'https:') checkoutUrl = url.href; } catch {}
const hasPrice = typeof offer.priceBRL === 'number' && offer.priceBRL > 0;
const ready = offer.releaseApproved && checkoutUrl && hasPrice && offer.sellerName && offer.supportEmail;
const price = hasPrice ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(offer.priceBRL) : '';
$$('[data-refund]').forEach(el => { el.textContent = offer.refundDays || 7; });
if (offer.version) $$('[data-version]').forEach(el => { el.textContent = offer.version; });
if (hasPrice) {
  $('#price').textContent = price;
  $$('[data-price]').forEach(el => { el.textContent = price; el.hidden = false; });
  $$('[data-price-text]').forEach(el => { el.textContent = price + ' · pagamento único'; });
}
if (offer.testedResolveVersions?.length) {
  $('#compat').textContent = 'Testado no DaVinci Resolve ' + offer.testedResolveVersions.join(', ') + '. Duas transições (Whip Pan e Troca Pixelada) usam ResolveFX; se não estiverem disponíveis na sua edição, as demais 118 continuam funcionando.';
}
const checkout = $('#checkout');
if (ready) {
  checkout.href = checkoutUrl;
  checkout.textContent = 'Comprar agora';
  checkout.removeAttribute('aria-disabled');
  $$('[data-buy]').forEach(link => { if (link !== checkout) link.href = checkoutUrl; });
  $$('[data-support]').forEach(el => { el.textContent = offer.supportEmail; });
  $('#seller').textContent = 'Vendido por ' + offer.sellerName + ' · Suporte: ' + offer.supportEmail + '.';
} else {
  $$('[data-cta-label]').forEach(el => { el.textContent = 'Conhecer a oferta'; });
  $('#offer-status').textContent = 'As vendas ainda não estão abertas. O botão será liberado com o checkout oficial.';
  checkout.addEventListener('click', event => event.preventDefault());
}

// Mobile buy bar appears after the hero.
const bar = $('#buybar');
const hero = $('.hero');
const offerSection = $('#oferta');
if ('IntersectionObserver' in window) {
  let heroVisible = true, offerVisible = false;
  const update = () => bar.classList.toggle('show', !heroVisible && !offerVisible);
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([entry]) => { offerVisible = entry.isIntersecting; update(); }).observe(offerSection);
}
