// ===========================
// ZOOM TECHNOLOGIE — COOKIES.JS
// Gestion complète des cookies, consentement et tracking
// ===========================

const ZoomCookies = (function(){

  // ── Durées ──
  const DAYS_365 = 365 * 24 * 60 * 60 * 1000;
  const DAYS_30  = 30  * 24 * 60 * 60 * 1000;

  // ── Clés de stockage ──
  const KEYS = {
    consent:       'zoom_cookie_consent',
    preferences:   'zoom_cookie_prefs',
    recentlyViewed:'zoom_recently_viewed',
    productViews:  'zoom_product_views',
    searchHistory: 'zoom_search_history',
    lastCategory:  'zoom_last_category',
    sortPref:      'zoom_sort_pref',
    visitCount:    'zoom_visit_count',
    firstVisit:    'zoom_first_visit',
    sessionStart:  'zoom_session_start',
  };

  // ── Préférences par défaut ──
  const DEFAULT_PREFS = {
    essential:   true,   // toujours actif, non modifiable
    analytics:   false,
    marketing:   false,
    performance: false,
  };

  // ════════════════════════════
  // UTILITAIRES COOKIES
  // ════════════════════════════
  function setCookie(name, value, ms){
    const d = new Date(Date.now() + ms);
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }
  function getCookie(name){
    const match = document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='));
    if(!match) return null;
    try{ return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('='))); }
    catch(e){ return null; }
  }
  function deleteCookie(name){
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }

  // localStorage avec fallback
  function lsGet(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } }
  function lsSet(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  function lsDel(key){ try{ localStorage.removeItem(key); }catch(e){} }

  // ════════════════════════════
  // CONSENTEMENT
  // ════════════════════════════
  function getConsent(){ return getCookie(KEYS.consent); }
  function getPrefs(){
    const saved = getCookie(KEYS.preferences);
    return Object.assign({}, DEFAULT_PREFS, saved || {});
  }
  function hasConsented(){ return getConsent() !== null; }
  function isAllowed(category){
    if(category === 'essential') return true;
    const prefs = getPrefs();
    return prefs[category] === true;
  }

  function saveConsent(prefs){
    setCookie(KEYS.consent, { date: new Date().toISOString(), version: '1.0' }, DAYS_365);
    setCookie(KEYS.preferences, prefs, DAYS_365);
    applyConsent(prefs);
  }

  function acceptAll(){
    const prefs = { essential: true, analytics: true, marketing: true, performance: true };
    saveConsent(prefs);
    hideBanner();
    trackEvent('cookie_consent', 'accept_all');
    showToastCookie('✅ Préférences enregistrées — Merci !');
  }

  function refuseAll(){
    const prefs = { essential: true, analytics: false, marketing: false, performance: false };
    saveConsent(prefs);
    hideBanner();
    clearNonEssential();
    trackEvent('cookie_consent', 'refuse_all');
    showToastCookie('🔒 Seuls les cookies essentiels sont actifs.');
  }

  function saveCustom(){
    const prefs = {
      essential:   true,
      analytics:   document.getElementById('ck-analytics')?.checked   || false,
      marketing:   document.getElementById('ck-marketing')?.checked   || false,
      performance: document.getElementById('ck-performance')?.checked || false,
    };
    saveConsent(prefs);
    hideBanner();
    hidePanel();
    if(!prefs.analytics && !prefs.marketing && !prefs.performance) clearNonEssential();
    trackEvent('cookie_consent', 'custom');
    showToastCookie('✅ Vos préférences ont été enregistrées.');
  }

  function applyConsent(prefs){
    // Google Analytics — chargement conditionnel
    if(prefs.analytics){
      loadGoogleAnalytics();
    }
    // Performance — détecter la connexion
    if(prefs.performance){
      detectPerformance();
    }
  }

  function clearNonEssential(){
    lsDel(KEYS.productViews);
    lsDel(KEYS.searchHistory);
    // Garder recentlyViewed car utile UX (on efface quand même si marketing refusé)
    if(!isAllowed('marketing')) lsDel(KEYS.recentlyViewed);
  }

  // ════════════════════════════
  // BANDEAU & PANNEAU UI
  // ════════════════════════════
  function showBanner(){
    const b = document.getElementById('cookieBanner');
    if(b){ b.classList.add('open'); }
  }
  function hideBanner(){
    const b = document.getElementById('cookieBanner');
    if(b){ b.classList.remove('open'); setTimeout(()=>b.style.display='none', 400); }
  }
  function showPanel(){
    // Pré-remplir les toggles avec les prefs actuelles
    const prefs = getPrefs();
    const a = document.getElementById('ck-analytics');
    const m = document.getElementById('ck-marketing');
    const p = document.getElementById('ck-performance');
    if(a) a.checked = prefs.analytics;
    if(m) m.checked = prefs.marketing;
    if(p) p.checked = prefs.performance;
    const panel = document.getElementById('cookiePanel');
    if(panel){ panel.classList.add('open'); }
  }
  function hidePanel(){
    const panel = document.getElementById('cookiePanel');
    if(panel){ panel.classList.remove('open'); }
  }
  function openCookieSettings(){
    // Rouvrir les paramètres depuis le footer
    const b = document.getElementById('cookieBanner');
    if(b){ b.style.display=''; b.classList.add('open'); }
    showPanel();
  }

  // ════════════════════════════
  // GOOGLE ANALYTICS GA4
  // ════════════════════════════
  function loadGoogleAnalytics(){
    // Remplacez G-XXXXXXXXXX par votre vrai ID GA4
    const GA_ID = 'G-399082738';
    if(window.gtag || document.getElementById('ga-script')) return;
    const s = document.createElement('script');
    s.id  = 'ga-script';
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function trackEvent(category, action, label=''){
    if(typeof window.gtag === 'function'){
      window.gtag('event', action, { event_category: category, event_label: label });
    }
  }

  // ════════════════════════════
  // ESSENTIELS — Toujours actifs
  // ════════════════════════════

  // Compteur de visites
  function trackVisit(){
    const count = (lsGet(KEYS.visitCount) || 0) + 1;
    lsSet(KEYS.visitCount, count);
    if(!lsGet(KEYS.firstVisit)) lsSet(KEYS.firstVisit, new Date().toISOString());
    lsSet(KEYS.sessionStart, Date.now());
  }

  // Mémoriser dernière catégorie
  function saveLastCategory(cat){
    lsSet(KEYS.lastCategory, cat);
  }
  function getLastCategory(){ return lsGet(KEYS.lastCategory) || ''; }

  // Mémoriser tri favori
  function saveSortPref(sort){ lsSet(KEYS.sortPref, sort); }
  function getSortPref(){ return lsGet(KEYS.sortPref) || 'default'; }

  // ════════════════════════════
  // ANALYTICS — Vues produits
  // ════════════════════════════
  function trackProductView(productId){
    if(!isAllowed('analytics')) return;
    const views = lsGet(KEYS.productViews) || {};
    views[productId] = (views[productId] || 0) + 1;
    lsSet(KEYS.productViews, views);
    trackEvent('product', 'view', String(productId));
  }

  function getProductViews(){ return lsGet(KEYS.productViews) || {}; }

  function getMostViewed(limit=6){
    const views = getProductViews();
    return Object.entries(views)
      .sort((a,b) => b[1]-a[1])
      .slice(0, limit)
      .map(([id]) => parseInt(id));
  }

  // Tracking recherches
  function trackSearch(query){
    if(!isAllowed('analytics') || !query) return;
    const history = lsGet(KEYS.searchHistory) || [];
    const entry = { q: query, t: Date.now() };
    const filtered = history.filter(h => h.q !== query);
    filtered.unshift(entry);
    lsSet(KEYS.searchHistory, filtered.slice(0, 10));
    trackEvent('search', 'query', query);
  }

  function getSearchHistory(){ return lsGet(KEYS.searchHistory) || []; }

  // ════════════════════════════
  // MARKETING — Récemment vus
  // ════════════════════════════
  function addRecentlyViewed(productId){
    if(!isAllowed('marketing')) return;
    const list = lsGet(KEYS.recentlyViewed) || [];
    const filtered = list.filter(id => id !== productId);
    filtered.unshift(productId);
    lsSet(KEYS.recentlyViewed, filtered.slice(0, 8));
  }

  function getRecentlyViewed(){ return lsGet(KEYS.recentlyViewed) || []; }

  // ════════════════════════════
  // PERFORMANCE — Détection réseau
  // ════════════════════════════
  function detectPerformance(){
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if(conn){
      const slow = ['slow-2g','2g'].includes(conn.effectiveType);
      if(slow){
        // Réduire qualité images sur réseau lent
        document.documentElement.classList.add('slow-network');
        console.info('[ZOOM] Réseau lent détecté — images optimisées');
      }
    }
    // Détecter mobile
    if(/Mobi|Android/i.test(navigator.userAgent)){
      document.documentElement.classList.add('is-mobile');
    }
  }

  // ════════════════════════════
  // SECTION "RÉCEMMENT VUS"
  // ════════════════════════════
  function renderRecentlyViewed(){
    if(!isAllowed('marketing')) return;
    const ids = getRecentlyViewed();
    if(ids.length < 2) return; // Afficher seulement si au moins 2 produits
    const section = document.getElementById('recentlyViewedSection');
    const grid    = document.getElementById('recentlyViewedGrid');
    if(!section || !grid || typeof PRODUCTS === 'undefined') return;

    const products = ids
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter(Boolean);

    if(products.length < 2){ section.style.display='none'; return; }

    section.style.display = '';
    grid.innerHTML = products.map(p => {
      const imgs = typeof getImgs === 'function' ? getImgs(p) : [p.img||null];
      const imgHTML = imgs[0]
        ? `<img src="${imgs[0]}" alt="${p.name}" class="rv-img" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
          + `<div class="rv-emoji" style="display:none">${p.icon}</div>`
        : `<div class="rv-emoji">${p.icon}</div>`;
      return `
        <div class="rv-card" onclick="openModal(PRODUCTS.find(p=>p.id===${p.id}))">
          <div class="rv-img-wrap">${imgHTML}</div>
          <div class="rv-name">${p.name}</div>
          <div class="rv-price">${p.price}</div>
        </div>`;
    }).join('');
  }

  // ════════════════════════════
  // BADGES POPULAIRES
  // ════════════════════════════
  function applyPopularBadges(){
    if(!isAllowed('analytics')) return;
    const topIds = getMostViewed(5);
    if(topIds.length === 0) return;
    // Marquer les cards avec data-id correspondant
    topIds.forEach(id => {
      const card = document.querySelector(`.product-card[data-product-id="${id}"]`);
      if(card && !card.querySelector('.badge-popular')){
        const badge = document.createElement('span');
        badge.className = 'badge-popular';
        badge.textContent = '🔥 Populaire';
        card.prepend(badge);
      }
    });
  }

  // ════════════════════════════
  // TOAST COOKIES
  // ════════════════════════════
  function showToastCookie(msg){
    let t = document.getElementById('cookieToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'cookieToast';
      t.className = 'cookie-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    trackVisit();

    // Afficher le bandeau si pas encore de consentement
    if(!hasConsented()){
      setTimeout(showBanner, 1200);
    } else {
      // Appliquer les préférences déjà enregistrées
      applyConsent(getPrefs());
    }

    // Restaurer tri favori
    const sort = getSortPref();
    const sel = document.getElementById('sortSelect');
    if(sel && sort !== 'default') sel.value = sort;

    // Restaurer dernière catégorie (optionnel, ne pas forcer le filtre au chargement)
    // filterCategory(null, getLastCategory());

    // Afficher section récemment vus après rendu des produits
    setTimeout(renderRecentlyViewed, 800);
  }

  // API publique
  return {
    init,
    acceptAll,
    refuseAll,
    saveCustom,
    showPanel,
    hidePanel,
    openCookieSettings,
    trackProductView,
    trackSearch,
    addRecentlyViewed,
    getRecentlyViewed,
    getMostViewed,
    getSearchHistory,
    saveLastCategory,
    getLastCategory,
    saveSortPref,
    getSortPref,
    renderRecentlyViewed,
    applyPopularBadges,
    isAllowed,
    hasConsented,
  };

})();

// Lancer à la fin du chargement de la page
document.addEventListener('DOMContentLoaded', () => ZoomCookies.init());
