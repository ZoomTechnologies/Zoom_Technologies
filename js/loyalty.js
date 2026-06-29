/* ===========================
   ZOOM TECHNOLOGIE — LOYALTY.JS
   Programme de fidélité
   Points · Niveaux · Carte numérique
   =========================== */

const ZoomLoyalty = (function(){

  const LS_KEY   = 'zoom_loyalty';
  const DAYS_365 = 365 * 24 * 60 * 60 * 1000;

  // ─── Niveaux ───
  const LEVELS = [
    { name:'Bronze', min:0,    max:499,  color:'#CD7F32', bg:'#FFF8F3', icon:'🥉', perks:'5% de réduction sur votre prochain achat' },
    { name:'Argent', min:500,  max:1499, color:'#A8A9AD', bg:'#F6F6F8', icon:'🥈', perks:'10% de réduction + livraison prioritaire' },
    { name:'Or',     min:1500, max:Infinity, color:'#FFD700', bg:'#FFFBEA', icon:'🥇', perks:'15% de réduction + devis personnalisé gratuit' },
  ];

  // Points gagnés : 1 point par 100 FCFA dépensés
  const POINTS_PER_100 = 1;

  // ════════════════════════════
  // DONNÉES
  // ════════════════════════════
  function load(){
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if(d) return d;
    } catch(e){}
    return {
      points:    0,
      totalSpent:0,
      orders:    0,
      history:   [],
      name:      '',
      cardId:    generateCardId(),
      joinDate:  new Date().toISOString(),
    };
  }
  function save(data){ try{ localStorage.setItem(LS_KEY, JSON.stringify(data)); }catch(e){} }

  function generateCardId(){
    return 'ZT-' + Math.random().toString(36).substr(2,4).toUpperCase() +
           '-'   + Math.random().toString(36).substr(2,4).toUpperCase();
  }

  function getLevel(points){
    return LEVELS.slice().reverse().find(l => points >= l.min) || LEVELS[0];
  }

  function getNextLevel(points){
    return LEVELS.find(l => l.min > points) || null;
  }

  // ════════════════════════════
  // AJOUTER DES POINTS
  // ════════════════════════════
  function addPoints(fcfaAmount, description){
    const data   = load();
    const gained = Math.floor(fcfaAmount / 100 * POINTS_PER_100);
    if(gained <= 0) return;

    data.points     += gained;
    data.totalSpent += fcfaAmount;
    data.orders     += 1;
    data.history.unshift({
      pts:  gained,
      desc: description || 'Achat',
      date: new Date().toISOString(),
      total: data.points,
    });
    data.history = data.history.slice(0, 20); // garder les 20 derniers
    save(data);

    showPointsToast(gained);
    updateWidget();
    return gained;
  }

  // ─── Calculer les points d'une commande ───
  function pointsFromCart(){
    try {
      const items = JSON.parse(localStorage.getItem('zoom_cart_v1')) || [];
      return items.reduce((total, item) => {
        const price = parseInt((item.price||'0').replace(/[^\d]/g,'')) || 0;
        return total + Math.floor(price * item.qty / 100);
      }, 0);
    } catch(e){ return 0; }
  }

  function getTotal(){
    try {
      const items = JSON.parse(localStorage.getItem('zoom_cart_v1')) || [];
      return items.reduce((t, item) => {
        return t + (parseInt((item.price||'0').replace(/[^\d]/g,''))||0) * item.qty;
      }, 0);
    } catch(e){ return 0; }
  }

  // ════════════════════════════
  // WIDGET FLOTTANT
  // ════════════════════════════
  function buildWidget(){
    if(document.getElementById('zt-loyalty-widget')) return;
    const data = load();
    const lvl  = getLevel(data.points);

    const w = document.createElement('div');
    w.id = 'zt-loyalty-widget';
    w.innerHTML = `
      <button class="zt-loyalty-bubble" onclick="ZoomLoyalty.openCard()" title="Ma carte de fidélité">
        <span class="zt-loyalty-bubble-icon">${lvl.icon}</span>
        <span class="zt-loyalty-bubble-pts" id="ztLoyBubblePts">${data.points}</span>
        <span class="zt-loyalty-bubble-lbl">pts</span>
      </button>`;
    document.body.appendChild(w);
  }

  function updateWidget(){
    const data = load();
    const el   = document.getElementById('ztLoyBubblePts');
    if(el) el.textContent = data.points;
    // Mettre à jour la carte si ouverte
    if(document.getElementById('zt-loyalty-modal')) renderCard();
  }

  // ════════════════════════════
  // CARTE DE FIDÉLITÉ MODALE
  // ════════════════════════════
  function openCard(){
    let modal = document.getElementById('zt-loyalty-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'zt-loyalty-modal';
      document.body.appendChild(modal);
    }
    renderCard();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCard(){
    const modal = document.getElementById('zt-loyalty-modal');
    if(modal){ modal.classList.remove('open'); }
    document.body.style.overflow = '';
  }

  function renderCard(){
    const data  = load();
    const lvl   = getLevel(data.points);
    const next  = getNextLevel(data.points);
    const pct   = next
      ? Math.round(((data.points - lvl.min) / (next.min - lvl.min)) * 100)
      : 100;
    const ptsToNext = next ? next.min - data.points : 0;
    const joinDate  = new Date(data.joinDate).toLocaleDateString('fr-FR',{ month:'long', year:'numeric' });

    const modal = document.getElementById('zt-loyalty-modal');
    if(!modal) return;

    modal.innerHTML = `
      <div class="zt-loy-overlay" onclick="ZoomLoyalty.closeCard()"></div>
      <div class="zt-loy-box">
        <button class="zt-loy-close" onclick="ZoomLoyalty.closeCard()">
          <i class="fas fa-times"></i>
        </button>

        <!-- Carte numérique -->
        <div class="zt-loy-card" id="ztLoyCard" style="background:linear-gradient(135deg,${lvl.color}22,${lvl.color}44)">
          <div class="zt-loy-card-header">
            <div class="zt-loy-logo">
              <span style="font-size:1.1rem">⚡</span>
              <span class="zt-loy-logo-txt">ZOOM Technologie</span>
            </div>
            <div class="zt-loy-level-badge" style="background:${lvl.color};color:${lvl.name==='Or'?'#333':'white'}">
              ${lvl.icon} ${lvl.name}
            </div>
          </div>
          <div class="zt-loy-card-pts">
            <div class="zt-loy-pts-val">${data.points.toLocaleString('fr-FR')}</div>
            <div class="zt-loy-pts-lbl">points de fidélité</div>
          </div>
          <div class="zt-loy-card-footer">
            <div>
              <div class="zt-loy-card-id">${data.cardId}</div>
              <div class="zt-loy-card-since">Membre depuis ${joinDate}</div>
            </div>
            <div class="zt-loy-card-orders">
              <strong>${data.orders}</strong>
              <span>commandes</span>
            </div>
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="zt-loy-progress-section">
          <div class="zt-loy-prog-labels">
            <span>${lvl.icon} ${lvl.name} (${lvl.min} pts)</span>
            ${next ? `<span>${getLevel(next.min).icon} ${getLevel(next.min).name} (${next.min} pts)</span>` : '<span>🏆 Niveau maximum !</span>'}
          </div>
          <div class="zt-loy-prog-bar">
            <div class="zt-loy-prog-fill" style="width:${pct}%;background:${lvl.color}"></div>
          </div>
          ${next
            ? `<div class="zt-loy-prog-hint">Plus que <strong>${ptsToNext} points</strong> pour atteindre le niveau ${getLevel(next.min).name} ${getLevel(next.min).icon}</div>`
            : `<div class="zt-loy-prog-hint" style="color:${lvl.color}">🎉 Vous avez atteint le niveau maximum !</div>`}
        </div>

        <!-- Avantages du niveau -->
        <div class="zt-loy-perks">
          <div class="zt-loy-perks-title"><i class="fas fa-gift"></i> Vos avantages ${lvl.name}</div>
          <div class="zt-loy-perks-text">${lvl.perks}</div>
        </div>

        <!-- Comment gagner des points -->
        <div class="zt-loy-howto">
          <div class="zt-loy-howto-title">Comment gagner des points ?</div>
          <div class="zt-loy-howto-item">
            <i class="fas fa-shopping-cart"></i>
            <span><strong>1 point</strong> pour 100 FCFA dépensés</span>
          </div>
          <div class="zt-loy-howto-item">
            <i class="fab fa-whatsapp"></i>
            <span>Commandez via WhatsApp et indiquez votre ID carte</span>
          </div>
        </div>

        <!-- Historique -->
        ${data.history.length ? `
        <div class="zt-loy-history">
          <div class="zt-loy-history-title"><i class="fas fa-history"></i> Historique récent</div>
          ${data.history.slice(0,5).map(h => `
            <div class="zt-loy-history-item">
              <span class="zt-loy-hist-desc">${h.desc}</span>
              <span class="zt-loy-hist-pts">+${h.pts} pts</span>
              <span class="zt-loy-hist-date">${new Date(h.date).toLocaleDateString('fr-FR')}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- Boutons -->
        <div class="zt-loy-actions">
          <button class="zt-loy-dl-btn" onclick="ZoomLoyalty.downloadCard()">
            <i class="fas fa-download"></i> Télécharger ma carte
          </button>
          <button class="zt-loy-wa-btn"
            onclick="window.open('https://wa.me/237697557365?text=Bonjour+ZOOM+Technologie+!+Mon+ID+carte+de+fidélité+est+${data.cardId}+%28${data.points}+points+—+niveau+${lvl.name}%29','_blank')">
            <i class="fab fa-whatsapp"></i> Utiliser mes points
          </button>
        </div>
      </div>`;
  }

  // ─── Télécharger la carte en SVG / HTML ───
  function downloadCard(){
    const data = load();
    const lvl  = getLevel(data.points);
    const joinDate = new Date(data.joinDate).toLocaleDateString('fr-FR',{ month:'long', year:'numeric' });

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F1111"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lvl.color}"/>
      <stop offset="100%" style="stop-color:${lvl.color}aa"/>
    </linearGradient>
  </defs>

  <!-- Fond -->
  <rect width="400" height="240" rx="16" fill="url(#bg)"/>
  <!-- Bande niveau -->
  <rect x="0" y="0" width="400" height="6" rx="3" fill="url(#lvlGrad)"/>

  <!-- Logo -->
  <text x="24" y="42" font-family="Arial Black" font-size="18" fill="${lvl.color}" font-weight="900">⚡ ZOOM</text>
  <text x="24" y="58" font-family="Arial" font-size="9" fill="rgba(255,255,255,0.5)" letter-spacing="3">TECHNOLOGIE</text>

  <!-- Badge niveau -->
  <rect x="288" y="20" width="88" height="28" rx="14" fill="${lvl.color}"/>
  <text x="332" y="38" font-family="Arial Black" font-size="11" fill="${lvl.name==='Or'?'#333':'white'}" text-anchor="middle" font-weight="900">${lvl.icon} ${lvl.name}</text>

  <!-- Points -->
  <text x="24" y="130" font-family="Arial Black" font-size="48" fill="white" font-weight="900">${data.points.toLocaleString('fr-FR')}</text>
  <text x="24" y="155" font-family="Arial" font-size="13" fill="rgba(255,255,255,0.55)">points de fidélité</text>

  <!-- Séparateur -->
  <line x1="24" y1="175" x2="376" y2="175" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

  <!-- ID Carte -->
  <text x="24" y="200" font-family="Courier New" font-size="14" fill="${lvl.color}" letter-spacing="2" font-weight="bold">${data.cardId}</text>
  <text x="24" y="218" font-family="Arial" font-size="10" fill="rgba(255,255,255,0.4)">Membre depuis ${joinDate} · ${data.orders} commandes</text>

  <!-- Commandes -->
  <text x="376" y="200" font-family="Arial Black" font-size="18" fill="white" text-anchor="end" font-weight="900">${data.orders}</text>
  <text x="376" y="218" font-family="Arial" font-size="10" fill="rgba(255,255,255,0.4)" text-anchor="end">commandes</text>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `carte-fidelite-zoom-${data.cardId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ════════════════════════════
  // TOAST POINTS GAGNÉS
  // ════════════════════════════
  function showPointsToast(pts){
    const t = document.createElement('div');
    t.className = 'zt-loy-toast';
    t.innerHTML = `<i class="fas fa-star"></i> +${pts} points de fidélité gagnés !`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 100);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 3500);
  }

  // ─── Hook sur commande panier ───
  function hookCart(){
    document.addEventListener('zoom:cart:order', () => {
      const total  = getTotal();
      const gained = Math.floor(total / 100);
      if(gained > 0) addPoints(total, 'Commande via WhatsApp');
    });
    // Aussi écouter les ajouts panier (1pt par produit ajouté)
    document.addEventListener('zoom:cart:add', e => {
      const data = load();
      data.points += 1;
      data.history.unshift({ pts:1, desc:'Produit ajouté au panier', date: new Date().toISOString(), total: data.points });
      data.history = data.history.slice(0,20);
      save(data);
      updateWidget();
    });
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    buildWidget();
    hookCart();
  }

  return {
    init, openCard, closeCard, downloadCard,
    addPoints, load, getLevel, updateWidget,
    LEVELS,
  };

})();

document.addEventListener('DOMContentLoaded', () => ZoomLoyalty.init());
