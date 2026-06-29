// ===========================
// ZOOM TECHNOLOGIE — FILTERS.JS v4
// 3 selects inline compacts (Prix / Marque / Statut)
// ===========================

const ZoomFilters = (function(){

  let state = {
    priceRange: '',   // ex: '0-50000', '50000-150000', etc.
    brand:      '',
    status:     '',
  };

  let globalMin = 0;
  let globalMax = 0;

  // ════════════════════════════
  // INITIALISATION
  // ════════════════════════════
  function init(){
    if(typeof PRODUCTS === 'undefined') return;

    const prices = PRODUCTS.map(p => parseFCFA(p.price)).filter(n => n > 0);
    globalMin = Math.min(...prices);
    globalMax = Math.max(...prices);

    buildFilterBar();
    restoreSession();
  }

  // ════════════════════════════
  // CONSTRUCTION — barre 3 selects
  // ════════════════════════════
  function buildFilterBar(){
    const panel = document.getElementById('filterPanel');
    if(!panel) return;

    // Tranches de prix automatiques
    const priceRanges = buildPriceRanges();

    // Marques trouvées dans les produits
    const brands = extractBrands();

    panel.innerHTML = `
      <div class="fbar-wrap">

        <!-- SELECT PRIX -->
        <div class="fbar-group">
          <label class="fbar-label"><i class="fas fa-tag"></i> Prix</label>
          <div class="fbar-select-wrap">
            <select id="fbarPrice" class="fbar-select" onchange="ZoomFilters.onPriceChange(this.value)">
              <option value="">Tous les prix</option>
              ${priceRanges.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
            <i class="fas fa-chevron-down fbar-chevron"></i>
          </div>
        </div>

        <!-- SELECT MARQUE -->
        <div class="fbar-group">
          <label class="fbar-label"><i class="fas fa-building"></i> Marque</label>
          <div class="fbar-select-wrap">
            <select id="fbarBrand" class="fbar-select" onchange="ZoomFilters.onBrandChange(this.value)">
              <option value="">Toutes les marques</option>
              ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
            </select>
            <i class="fas fa-chevron-down fbar-chevron"></i>
          </div>
        </div>

        <!-- SELECT STATUT -->
        <div class="fbar-group">
          <label class="fbar-label"><i class="fas fa-fire"></i> Statut</label>
          <div class="fbar-select-wrap">
            <select id="fbarStatus" class="fbar-select" onchange="ZoomFilters.onStatusChange(this.value)">
              <option value="">Tous</option>
              <option value="promo">🔥 En promotion</option>
              <option value="new">🆕 Nouveautés</option>
              <option value="popular">⭐ Populaires</option>
            </select>
            <i class="fas fa-chevron-down fbar-chevron"></i>
          </div>
        </div>

        <!-- BOUTON RESET — visible seulement si filtre actif -->
        <button class="fbar-reset" id="fbarReset" style="display:none" onclick="ZoomFilters.reset()">
          <i class="fas fa-times"></i> Effacer
        </button>

        <!-- COMPTEUR RÉSULTATS -->
        <span class="fbar-count" id="fbarCount"></span>

      </div>`;
  }

  // ════════════════════════════
  // GÉNÈRE LES TRANCHES DE PRIX
  // ════════════════════════════
  function buildPriceRanges(){
    const ranges = [];
    const steps = [
      {max: 20000,  label: 'Moins de 20 000 FCFA'},
      {min: 20000,  max: 50000,  label: '20 000 – 50 000 FCFA'},
      {min: 50000,  max: 100000, label: '50 000 – 100 000 FCFA'},
      {min: 100000, max: 200000, label: '100 000 – 200 000 FCFA'},
      {min: 200000, max: 350000, label: '200 000 – 350 000 FCFA'},
      {min: 350000, label: 'Plus de 350 000 FCFA'},
    ];
    steps.forEach(s => {
      const min = s.min || 0;
      const max = s.max || 9999999;
      // N'afficher la tranche que si au moins 1 produit y correspond
      const hasProduct = PRODUCTS.some(p => {
        const price = parseFCFA(p.price);
        return price >= min && price < max;
      });
      if(hasProduct) ranges.push({ value: `${min}-${max}`, label: s.label });
    });
    return ranges;
  }

  // ════════════════════════════
  // EXTRAIT LES MARQUES
  // ════════════════════════════
  function extractBrands(){
    const knownBrands = [
      'HP','Lenovo','Dell','ASUS','Apple','Acer',
      'Samsung','Xiaomi','Tecno','itel','Sony',
      'Logitech','TP-Link','Huawei','Seagate','Kingston',
      'SanDisk','APC','Canon','Synology','CyberPower'
    ];
    const found = new Set();
    PRODUCTS.forEach(p => {
      knownBrands.forEach(brand => {
        if(p.name.toLowerCase().includes(brand.toLowerCase())) found.add(brand);
      });
    });
    return Array.from(found).sort();
  }

  // ════════════════════════════
  // HANDLERS SELECTS
  // ════════════════════════════
  function onPriceChange(val){
    state.priceRange = val;
    applyAndUpdate();
  }
  function onBrandChange(val){
    state.brand = val;
    applyAndUpdate();
  }
  function onStatusChange(val){
    state.status = val;
    applyAndUpdate();
  }

  function applyAndUpdate(){
    updateResetBtn();
    saveSession();
    if(typeof applyFilters === 'function') applyFilters();
  }

  // ════════════════════════════
  // APPLIQUE LES FILTRES (appelée par app.js)
  // ════════════════════════════
  function filterList(list){
    return list.filter(p => {
      const price = parseFCFA(p.price);

      // Filtre prix
      if(state.priceRange){
        const [min, max] = state.priceRange.split('-').map(Number);
        if(price < min || price >= max) return false;
      }

      // Filtre marque
      if(state.brand){
        if(!p.name.toLowerCase().includes(state.brand.toLowerCase())) return false;
      }

      // Filtre statut
      if(state.status){
        if(state.status === 'promo'   && p.badge !== 'promo') return false;
        if(state.status === 'new'     && p.badge !== 'new')   return false;
        if(state.status === 'popular'){
          const popular = typeof ZoomCookies !== 'undefined'
            ? ZoomCookies.getMostViewed(5).includes(p.id) : false;
          if(!popular) return false;
        }
      }

      return true;
    });
  }

  // ════════════════════════════
  // RESET
  // ════════════════════════════
  function reset(){
    state = { priceRange: '', brand: '', status: '' };
    const s1 = document.getElementById('fbarPrice');
    const s2 = document.getElementById('fbarBrand');
    const s3 = document.getElementById('fbarStatus');
    if(s1) s1.value = '';
    if(s2) s2.value = '';
    if(s3) s3.value = '';
    updateResetBtn();
    saveSession();
    if(typeof applyFilters === 'function') applyFilters();
  }

  function updateResetBtn(){
    const btn = document.getElementById('fbarReset');
    if(!btn) return;
    const active = state.priceRange || state.brand || state.status;
    btn.style.display = active ? 'flex' : 'none';
  }

  // Mise à jour du compteur de résultats (appelée depuis app.js après rendu)
  function updateResultCount(n){
    const el = document.getElementById('fbarCount');
    if(el) el.textContent = n > 0 ? `${n} produit${n > 1 ? 's' : ''}` : '';
  }

  // ════════════════════════════
  // PERSISTANCE SESSION
  // ════════════════════════════
  function saveSession(){
    try{ sessionStorage.setItem('zoom_filters_v4', JSON.stringify(state)); }catch(e){}
  }
  function restoreSession(){
    try{
      const saved = JSON.parse(sessionStorage.getItem('zoom_filters_v4'));
      if(!saved) return;
      state = Object.assign(state, saved);
      const s1 = document.getElementById('fbarPrice');
      const s2 = document.getElementById('fbarBrand');
      const s3 = document.getElementById('fbarStatus');
      if(s1 && state.priceRange) s1.value = state.priceRange;
      if(s2 && state.brand)      s2.value = state.brand;
      if(s3 && state.status)     s3.value = state.status;
      updateResetBtn();
    }catch(e){}
  }

  // ════════════════════════════
  // STUBS MOBILE (conservés pour compatibilité)
  // ════════════════════════════
  function openMobile(){ /* plus utilisé */ }
  function closeMobile(){ /* plus utilisé */ }
  function togglePanel(){ /* plus utilisé */ }
  function openPanel(){ /* plus utilisé */ }
  function applyAndClose(){ /* plus utilisé */ }
  function updateActiveCount(){ updateResetBtn(); }
  function getState(){ return state; }

  function parseFCFA(str){
    return parseInt((str||'0').replace(/[^\d]/g,''))||0;
  }

  return {
    init, reset, filterList, getState,
    onPriceChange, onBrandChange, onStatusChange,
    updateResultCount, updateActiveCount,
    openMobile, closeMobile, togglePanel, openPanel, applyAndClose,
  };

})();

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => ZoomFilters.init(), 100);
});
