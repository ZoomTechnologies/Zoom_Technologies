// ===========================
// ZOOM TECHNOLOGIE — CART.JS
// Moteur complet du panier WhatsApp
// ===========================

const ZoomCart = (function(){

  const STORAGE_KEY = 'zoom_cart';
  const WA_NUMBER   = '237694990439'; // ← Votre numéro WhatsApp
  const MS_PAGE     = 'zoomtechnologie'; // ← Remplacez par votre page Messenger

  // ════════════════════════════
  // STOCKAGE
  // ════════════════════════════
  function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch(e){ return []; } }
  function save(items){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }catch(e){} }

  function getItems(){ return load(); }

  // ════════════════════════════
  // ACTIONS PANIER
  // ════════════════════════════
  function addItem(productId, qty=1){
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p=>p.id===productId) : null;
    if(!product) return;
    const items = load();
    const existing = items.find(i=>i.id===productId);
    if(existing){
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      const imgs = typeof getImgs === 'function' ? getImgs(product) : [product.img||null];
      items.push({
        id:    product.id,
        name:  product.name,
        price: product.price,
        icon:  product.icon,
        img:   imgs[0] || null,
        qty:   qty
      });
    }
    save(items);
    updateBadge();
    animateBadge();
    showCartToast(`✅ <strong>${product.name.substring(0,30)}${product.name.length>30?'…':''}</strong> ajouté au panier`);
    document.dispatchEvent(new CustomEvent('zoom:cart:add', { detail: { id: productId } }));
    return true;
  }

  function removeItem(productId){
    const items = load().filter(i=>i.id!==productId);
    save(items);
    updateBadge();
    renderDrawer();
  }

  function updateQty(productId, delta){
    const items = load();
    const item = items.find(i=>i.id===productId);
    if(!item) return;
    item.qty = Math.max(1, Math.min(item.qty + delta, 99));
    save(items);
    updateBadge();
    renderDrawer();
  }

  function setQty(productId, val){
    const n = parseInt(val);
    if(isNaN(n) || n < 1) return;
    const items = load();
    const item = items.find(i=>i.id===productId);
    if(!item) return;
    item.qty = Math.min(n, 99);
    save(items);
    updateBadge();
  }

  function clearCart(){
    save([]);
    updateBadge();
    renderDrawer();
    showCartToast('🗑️ Panier vidé');
  }

  function getTotal(){
    return load().reduce((sum,i)=>{
      const price = parseInt((i.price||'0').replace(/[^\d]/g,''))||0;
      return sum + price * i.qty;
    }, 0);
  }

  function getTotalItems(){
    return load().reduce((sum,i)=>sum+i.qty, 0);
  }

  function formatPrice(n){
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  // ════════════════════════════
  // BADGE COMPTEUR
  // ════════════════════════════
  function updateBadge(){
    const badge = document.getElementById('cartBadge');
    const count = getTotalItems();
    if(!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function animateBadge(){
    const badge = document.getElementById('cartBadge');
    if(!badge) return;
    badge.classList.remove('badge-pop');
    void badge.offsetWidth; // reflow
    badge.classList.add('badge-pop');
  }

  // ════════════════════════════
  // DRAWER
  // ════════════════════════════
  function openDrawer(){
    renderDrawer();
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer(){
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderDrawer(){
    const items   = load();
    const listEl  = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    const emptyEl = document.getElementById('cartEmpty');
    const footerEl= document.getElementById('cartFooter');
    const countEl = document.getElementById('cartCount');
    if(!listEl) return;

    const totalItems = getTotalItems();
    if(countEl) countEl.textContent = totalItems + (totalItems > 1 ? ' articles' : ' article');

    if(items.length === 0){
      listEl.innerHTML   = '';
      if(emptyEl)  emptyEl.style.display  = '';
      if(footerEl) footerEl.style.display = 'none';
      if(totalEl)  totalEl.textContent    = '';
      return;
    }

    if(emptyEl)  emptyEl.style.display  = 'none';
    if(footerEl) footerEl.style.display = '';

    listEl.innerHTML = items.map(item=>{
      const imgHTML = item.img
        ? `<img src="${item.img}" alt="${item.name}" class="ci-img"
               onerror="this.style.display='none';this.nextSibling.style.display='flex'">
           <div class="ci-emoji" style="display:none">${item.icon}</div>`
        : `<div class="ci-emoji">${item.icon}</div>`;

      const lineTotal = parseInt((item.price||'0').replace(/[^\d]/g,''))*item.qty;

      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="ci-img-wrap">${imgHTML}</div>
          <div class="ci-info">
            <div class="ci-name">${item.name}</div>
            <div class="ci-price-unit">${item.price} / unité</div>
            <div class="ci-line-total">${formatPrice(lineTotal)}</div>
            <div class="ci-qty-row">
              <button class="ci-qty-btn" onclick="ZoomCart.updateQty(${item.id},-1)">−</button>
              <input class="ci-qty-input" type="number" value="${item.qty}" min="1" max="99"
                     onchange="ZoomCart.setQty(${item.id},this.value);ZoomCart.renderDrawer()">
              <button class="ci-qty-btn" onclick="ZoomCart.updateQty(${item.id},+1)">+</button>
              <button class="ci-remove-btn" onclick="ZoomCart.removeItem(${item.id})" title="Supprimer">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    if(totalEl) totalEl.textContent = formatPrice(getTotal());
  }

  // ════════════════════════════
  // COMMANDE WHATSAPP / MESSENGER
  // ════════════════════════════
  function buildOrderMessage(){
    const items = load();
    if(items.length === 0) return null;
    const lines = items.map((item,i)=>{
      const lineTotal = parseInt((item.price||'0').replace(/[^\d]/g,''))*item.qty;
      return `${i+1}. ${item.name} (x${item.qty}) — ${formatPrice(lineTotal)}`;
    });
    return [
      'Bonjour ZOOM Technologie ! 🛒',
      '',
      'Je voudrais commander :',
      '',
      ...lines,
      '',
      `💰 TOTAL : ${formatPrice(getTotal())}`,
      '',
      '📍 Livraison souhaitée à : [votre ville]',
      '📞 Mon numéro : [votre numéro]',
      '',
      'Merci !'
    ].join('\n');
  }

  function orderWhatsApp(){
    const msg = buildOrderMessage();
    if(!msg){ showCartToast('⚠️ Votre panier est vide !'); return; }
    document.dispatchEvent(new CustomEvent('zoom:cart:order', { detail: { channel:'whatsapp' } }));
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function orderMessenger(){
    const msg = buildOrderMessage();
    if(!msg){ showCartToast('⚠️ Votre panier est vide !'); return; }
    document.dispatchEvent(new CustomEvent('zoom:cart:order', { detail: { channel:'messenger' } }));
    window.open(`https://m.me/${MS_PAGE}?ref=${encodeURIComponent(msg.substring(0,200))}`, '_blank');
  }

  // ════════════════════════════
  // TOAST
  // ════════════════════════════
  function showCartToast(html){
    let t = document.getElementById('cartToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'cartToast';
      t.className = 'cart-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 3000);
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    // Fermer drawer au clic sur overlay
    document.getElementById('cartOverlay')?.addEventListener('click', closeDrawer);
    // Fermer avec Escape
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });
    // Restaurer badge
    updateBadge();
  }

  // API publique
  return {
    init, addItem, removeItem, updateQty, setQty,
    clearCart, openDrawer, closeDrawer, renderDrawer,
    orderWhatsApp, orderMessenger,
    getItems, getTotal, getTotalItems, updateBadge,
  };

})();

document.addEventListener('DOMContentLoaded', ()=>ZoomCart.init());
