/* ===========================
   ZOOM TECHNOLOGIE — PERFORMANCE.JS
   Optimisation vitesse
   Lazy loading · WebP · Preload · Cache
   =========================== */

const ZoomPerf = (function(){

  // ════════════════════════════
  // 1. DÉTECTION WEBP
  // ════════════════════════════
  let webpSupported = null;

  function checkWebP(){
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => { webpSupported = img.width > 0; resolve(webpSupported); };
      img.onerror = () => { webpSupported = false; resolve(false); };
      img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAgA0JZACdAEO/gHOAAA=';
    });
  }

  function supportsWebP(){ return webpSupported; }

  // Convertir une URL d'image en WebP si supporté et si le fichier est local
  function toWebP(src){
    if(!src || !webpSupported) return src;
    if(src.startsWith('http') || src.startsWith('data:')) return src;
    // Remplacer .jpg, .jpeg, .png par .webp si le fichier existe potentiellement
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // ════════════════════════════
  // 2. LAZY LOADING IMAGES
  // ════════════════════════════
  let observer = null;

  function initLazyLoading(){
    if(!('IntersectionObserver' in window)){
      // Fallback : charger toutes les images immédiatement
      document.querySelectorAll('img[data-src]').forEach(loadImg);
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          loadImg(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px 0px',  // précharger 200px avant apparition
      threshold: 0,
    });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  function loadImg(img){
    const src = img.dataset.src;
    if(!src) return;
    img.src = src;
    img.removeAttribute('data-src');
    img.classList.remove('zt-lazy');
    img.classList.add('zt-lazy-loaded');
  }

  // Observer les nouvelles images ajoutées dynamiquement (produits, modal)
  function observeNewImages(container){
    if(!observer || !container) return;
    container.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  // ════════════════════════════
  // 3. PRELOAD IMAGES CRITIQUES
  // ════════════════════════════
  function preloadCritical(){
    // Précharger les 4 premières images produits (above the fold)
    if(typeof PRODUCTS === 'undefined') return;
    const firstFour = PRODUCTS.slice(0, 4);
    firstFour.forEach(p => {
      const imgs = typeof getImgs === 'function' ? getImgs(p) : (p.imgs || []);
      const src  = imgs[0];
      if(src){
        const link = document.createElement('link');
        link.rel  = 'preload';
        link.as   = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }

  // ════════════════════════════
  // 4. RESOURCE HINTS
  // ════════════════════════════
  function addResourceHints(){
    const hints = [
      { rel:'dns-prefetch',    href:'//fonts.googleapis.com' },
      { rel:'dns-prefetch',    href:'//cdnjs.cloudflare.com' },
      { rel:'dns-prefetch',    href:'//api.qrserver.com' },
      { rel:'preconnect',      href:'https://api.whatsapp.com' },
    ];
    hints.forEach(h => {
      if(!document.querySelector(`link[rel="${h.rel}"][href="${h.href}"]`)){
        const link  = document.createElement('link');
        link.rel    = h.rel;
        link.href   = h.href;
        if(h.rel === 'preconnect') link.crossOrigin = 'anonymous';
        document.head.insertBefore(link, document.head.firstChild);
      }
    });
  }

  // ════════════════════════════
  // 5. OPTIMISATION IMAGES PRODUITS
  //    Patch app.js : remplacer src par data-src pour lazy loading
  // ════════════════════════════
  function patchProductImg(){
    // On surcharge la fonction productImg pour ajouter lazy loading
    if(typeof window.productImg === 'undefined') return;
    const original = window.productImg;
    window.productImg = function(p, wrapClass, emojiClass){
      let html = original(p, wrapClass, emojiClass);
      // Transformer src="..." en data-src="..." + loading="lazy" + class zt-lazy
      html = html.replace(
        /<img src="([^"]+)"/g,
        (match, src) => {
          const final = webpSupported ? toWebP(src) : src;
          return `<img data-src="${final}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" loading="lazy" class="zt-lazy"`;
        }
      );
      return html;
    };
  }

  // ════════════════════════════
  // 6. DÉCODAGE IMAGE ASYNCHRONE
  //    Pour éviter le blocking du thread principal
  // ════════════════════════════
  function applyAsyncDecoding(){
    document.querySelectorAll('img:not([decoding])').forEach(img => {
      img.decoding = 'async';
    });
  }

  // ════════════════════════════
  // 7. FONT DISPLAY SWAP
  //    Injecter font-display:swap si pas déjà fait
  // ════════════════════════════
  function optimizeFonts(){
    // Déjà géré via Google Fonts &display=swap dans index.html
    // On s'assure juste que la police de secours est bonne
    const style = document.createElement('style');
    style.textContent = `
      :root { --font-fallback: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; }
      body { font-display: swap; }
    `;
    document.head.appendChild(style);
  }

  // ════════════════════════════
  // 8. REPORT WEB VITALS (console)
  // ════════════════════════════
  function reportVitals(){
    // LCP — Largest Contentful Paint
    if('PerformanceObserver' in window){
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const last    = entries[entries.length - 1];
          console.info(`[ZOOM Perf] LCP: ${Math.round(last.startTime)}ms`);
        }).observe({ type:'largest-contentful-paint', buffered:true });

        // FID — First Input Delay
        new PerformanceObserver(list => {
          list.getEntries().forEach(e => {
            console.info(`[ZOOM Perf] FID: ${Math.round(e.processingStart - e.startTime)}ms`);
          });
        }).observe({ type:'first-input', buffered:true });

        // CLS — Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver(list => {
          list.getEntries().forEach(e => { if(!e.hadRecentInput) cls += e.value; });
          console.info(`[ZOOM Perf] CLS: ${cls.toFixed(4)}`);
        }).observe({ type:'layout-shift', buffered:true });

      } catch(e){}
    }
  }

  // ════════════════════════════
  // 9. CACHE HEADERS (SW side)
  //    Déjà géré dans sw.js (staleWhileRevalidate, cacheFirst)
  //    Ici on ajoute un hint de meta cache
  // ════════════════════════════
  function addCacheMeta(){
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content   = 'public, max-age=3600, stale-while-revalidate=86400';
    document.head.appendChild(meta);
  }

  // ════════════════════════════
  // 10. SCROLL PERFORMANCE
  //     Passive event listeners pour scroll fluide
  // ════════════════════════════
  function optimizeScroll(){
    // Forcer tous les event listeners scroll en passive
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, fn, options){
      if(type === 'scroll' || type === 'touchstart' || type === 'touchmove'){
        if(typeof options === 'object'){
          options.passive = options.passive !== false;
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener.call(this, type, fn, options);
    };
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  async function init(){
    // 1. Vérifier WebP en priorité
    await checkWebP();

    // 2. Resource hints dès que possible
    addResourceHints();

    // 3. Optimisation scroll (avant tout event listener)
    optimizeScroll();

    // 4. Font display
    optimizeFonts();

    // 5. Lazy loading
    initLazyLoading();

    // 6. Cache meta
    addCacheMeta();

    // 7. Async decoding
    document.addEventListener('DOMContentLoaded', () => {
      applyAsyncDecoding();
      preloadCritical();
      // Patch productImg après que app.js soit chargé
      setTimeout(patchProductImg, 100);
    });

    // 8. Web vitals en dev
    if(location.hostname === 'localhost' || location.hostname.includes('127.')){
      reportVitals();
    }

    // 9. Observer les mutations DOM pour lazy loading dynamique
    const domObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if(node.nodeType === 1) observeNewImages(node);
        });
      });
    });
    document.addEventListener('DOMContentLoaded', () => {
      domObserver.observe(document.body, { childList:true, subtree:true });
    });
  }

  return {
    init, toWebP, supportsWebP, checkWebP,
    observeNewImages, preloadCritical, reportVitals,
  };

})();

// Démarrer en priorité (avant DOMContentLoaded)
ZoomPerf.init();
