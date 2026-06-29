/* ===========================
   ZOOM TECHNOLOGIE — LIMITED-OFFERS.JS
   Offres limitées dans le temps
   Compte à rebours · Popup · Badge animé
   =========================== */

const ZoomOffers = (function(){

  const LS_KEY       = 'zoom_limited_offers';
  const LS_DISMISSED = 'zoom_offers_dismissed';

  // ════════════════════════════
  // CONFIGURATION DES OFFRES
  // Modifier ici pour créer/supprimer des offres
  // ════════════════════════════
  const OFFERS_CONFIG = [
    {
      id:        'offer_flash_1',
      productId:  2,                    // ID produit dans products.js
      label:     '⚡ Offre Flash',
      title:     'Prix spécial — 24h seulement !',
      discount:  '15% de réduction supplémentaire',
      durationH:  24,                   // durée en heures depuis activation
      autoStart:  true,                 // démarre au chargement de la page
      popupAfter: 20,                   // afficher le popup après N secondes
      popupOnce:  true,                 // popup une seule fois par session
    },
    {
      id:        'offer_weekend',
      productId:  5,
      label:     '🎉 Offre Week-end',
      title:     'Prix week-end — Stocks limités !',
      discount:  'Livraison offerte ce week-end',
      durationH:  48,
      autoStart:  false,
      popupAfter: 30,
      popupOnce:  true,
    },
  ];

  let activeTimers  = {};  // intervalles des comptes à rebours
  let popupShown    = {};  // popups déjà affichés cette session

  // ════════════════════════════
  // DONNÉES (localStorage)
  // ════════════════════════════
  function loadData(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }catch(e){ return {}; }
  }
  function saveData(d){ try{ localStorage.setItem(LS_KEY, JSON.stringify(d)); }catch(e){} }

  function getOffer(id){
    const data = loadData();
    return data[id] || null;
  }

  // ─── Démarrer une offre ───
  function startOffer(id){
    const config = OFFERS_CONFIG.find(o => o.id === id);
    if(!config) return;
    const data  = loadData();
    const now   = Date.now();
    const endTs = now + config.durationH * 3600 * 1000;
    data[id] = { startTs: now, endTs, active: true };
    saveData(data);
    activateOffer(config, data[id]);
  }

  // ─── Désactiver une offre expirée ───
  function expireOffer(id){
    const data = loadData();
    if(data[id]) { data[id].active = false; saveData(data); }
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
    // Masquer tous les éléments UI de cette offre
    document.querySelectorAll(`[data-offer="${id}"]`).forEach(el => el.remove());
    // Supprimer le badge sur la carte produit
    const config = OFFERS_CONFIG.find(o => o.id === id);
    if(config){
      document.querySelectorAll(`.product-card[data-product-id="${config.productId}"] .zt-offer-badge`).forEach(b => b.remove());
    }
  }

  // ════════════════════════════
  // ACTIVER UNE OFFRE
  // ════════════════════════════
  function activateOffer(config, state){
    const now = Date.now();
    if(now >= state.endTs){ expireOffer(config.id); return; }

    // 1. Badge animé sur la carte produit
    attachBadgeToCard(config, state);

    // 2. Bandeau/tag dans le modal produit
    // (géré dynamiquement quand le modal s'ouvre)

    // 3. Compte à rebours continu
    startCountdown(config, state);

    // 4. Popup si configuré
    if(config.popupAfter && (!config.popupOnce || !popupShown[config.id])){
      setTimeout(() => showPopup(config, state), config.popupAfter * 1000);
    }
  }

  // ════════════════════════════
  // BADGE ANIMÉ SUR LA CARTE
  // ════════════════════════════
  function attachBadgeToCard(config, state){
    // Observer les cartes produits rendues dynamiquement
    const tryAttach = () => {
      const card = document.querySelector(`.product-card[data-product-id="${config.productId}"]`);
      if(!card) return;
      if(card.querySelector('.zt-offer-badge')) return;

      const badge = document.createElement('div');
      badge.className  = 'zt-offer-badge';
      badge.dataset.offer = config.id;
      badge.innerHTML = `
        <span class="zt-offer-badge-label">${config.label}</span>
        <span class="zt-offer-badge-timer" id="badge-timer-${config.id}"></span>`;
      card.querySelector('.product-img-wrap')?.appendChild(badge)
        || card.prepend(badge);
    };

    // Essayer immédiatement puis observer
    tryAttach();
    const observer = new MutationObserver(tryAttach);
    observer.observe(document.body, { childList: true, subtree: true });
    // Arrêter d'observer après 30s
    setTimeout(() => observer.disconnect(), 30000);
  }

  // ════════════════════════════
  // COMPTE À REBOURS
  // ════════════════════════════
  function startCountdown(config, state){
    const update = () => {
      const remaining = state.endTs - Date.now();
      if(remaining <= 0){ expireOffer(config.id); return; }

      const h   = Math.floor(remaining / 3600000);
      const m   = Math.floor((remaining % 3600000) / 60000);
      const s   = Math.floor((remaining % 60000) / 1000);
      const str = h > 0
        ? `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
        : `${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;

      // Badge sur la carte
      const badgeTimer = document.getElementById(`badge-timer-${config.id}`);
      if(badgeTimer) badgeTimer.textContent = str;

      // Dans le popup si ouvert
      const popupTimer = document.getElementById(`popup-timer-${config.id}`);
      if(popupTimer) popupTimer.textContent = str;

      // Dans le modal si ce produit est ouvert
      const modalTimer = document.getElementById(`modal-offer-timer-${config.id}`);
      if(modalTimer) modalTimer.textContent = str;

      // Urgence : < 1h → clignotement rouge
      const urgentEls = document.querySelectorAll(`[data-offer-urgent="${config.id}"]`);
      urgentEls.forEach(el => el.classList.toggle('urgent', remaining < 3600000));
    };

    update();
    clearInterval(activeTimers[config.id]);
    activeTimers[config.id] = setInterval(update, 1000);
  }

  // ════════════════════════════
  // POPUP "OFFRE EXPIRE DANS…"
  // ════════════════════════════
  function showPopup(config, state){
    const remaining = state.endTs - Date.now();
    if(remaining <= 0) return;
    if(popupShown[config.id]) return;
    popupShown[config.id] = true;

    // Trouver le produit
    const product = typeof PRODUCTS !== 'undefined'
      ? PRODUCTS.find(p => p.id === config.productId) : null;

    const el = document.createElement('div');
    el.className  = 'zt-offer-popup';
    el.dataset.offer = config.id;

    const h = Math.floor(remaining / 3600000);
    const timeLabel = h > 0 ? `${h}h` : `${Math.floor(remaining/60000)} min`;

    el.innerHTML = `
      <div class="zt-offer-popup-inner">
        <button class="zt-offer-popup-close" onclick="this.closest('.zt-offer-popup').remove()">
          <i class="fas fa-times"></i>
        </button>
        <div class="zt-offer-popup-flame">🔥</div>
        <div class="zt-offer-popup-badge">${config.label}</div>
        <div class="zt-offer-popup-title">${config.title}</div>
        ${product ? `<div class="zt-offer-popup-product">${product.icon} ${product.name.substring(0,40)}${product.name.length>40?'…':''}</div>` : ''}
        <div class="zt-offer-popup-discount">${config.discount}</div>
        <div class="zt-offer-popup-timer-wrap">
          <div class="zt-offer-popup-timer-label">⏱ Expire dans</div>
          <div class="zt-offer-popup-timer" id="popup-timer-${config.id}" data-offer-urgent="${config.id}">${timeLabel}</div>
        </div>
        <div class="zt-offer-popup-actions">
          ${product ? `
          <button class="zt-offer-popup-cta" onclick="openModal(PRODUCTS.find(p=>p.id===${config.productId}));this.closest('.zt-offer-popup').remove()">
            <i class="fas fa-eye"></i> Voir l'offre
          </button>` : ''}
          <button class="zt-offer-popup-cart" onclick="ZoomCart.addItem(${config.productId});this.closest('.zt-offer-popup').remove()">
            <i class="fas fa-cart-plus"></i> Ajouter au panier
          </button>
        </div>
      </div>`;

    document.body.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 100);

    // Auto-fermer après 15s
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 400);
    }, 15000);
  }

  // ════════════════════════════
  // INJECTER DANS LE MODAL
  // Appelé par app.js quand un modal de produit s'ouvre
  // ════════════════════════════
  function injectInModal(productId){
    const offer = OFFERS_CONFIG.find(o => o.productId === productId);
    if(!offer) return '';

    const state = getOffer(offer.id);
    if(!state || !state.active) return '';
    if(Date.now() >= state.endTs) return '';

    const remaining = state.endTs - Date.now();
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m} min`;

    return `
      <div class="zt-modal-offer" data-offer="${offer.id}">
        <div class="zt-modal-offer-badge">${offer.label}</div>
        <div class="zt-modal-offer-title">${offer.title}</div>
        <div class="zt-modal-offer-discount">${offer.discount}</div>
        <div class="zt-modal-offer-timer">
          <i class="fas fa-hourglass-half"></i>
          Expire dans <strong id="modal-offer-timer-${offer.id}" data-offer-urgent="${offer.id}">${timeStr}</strong>
        </div>
      </div>`;
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    const data = loadData();

    OFFERS_CONFIG.forEach(config => {
      const state = data[config.id];
      if(state && state.active && Date.now() < state.endTs){
        // Offre déjà active → reprendre
        activateOffer(config, state);
      } else if(config.autoStart && (!state || !state.active)){
        // Offre à démarrer automatiquement
        startOffer(config.id);
      }
    });
  }

  // ─── Démarrer une offre manuellement (admin) ───
  function adminStart(id){ startOffer(id); }
  function adminStop(id) { expireOffer(id); }

  function getStatus(){
    const data = loadData();
    return OFFERS_CONFIG.map(c => {
      const s = data[c.id];
      const active = s && s.active && Date.now() < (s?.endTs||0);
      return {
        ...c,
        active,
        endTs:     s?.endTs || null,
        remaining: active ? s.endTs - Date.now() : 0,
      };
    });
  }

  return {
    init, startOffer, expireOffer, showPopup,
    injectInModal, adminStart, adminStop,
    getStatus, OFFERS_CONFIG,
  };

})();

document.addEventListener('DOMContentLoaded', () => ZoomOffers.init());
