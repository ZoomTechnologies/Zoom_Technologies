/* ===========================
   ZOOM TECHNOLOGIE — ZOOM-IMAGE.JS
   Loupe au survol + plein écran + swipe mobile
   Style Amazon / Glotelho
   =========================== */

const ZoomImage = (function(){

  // ════════════════════════════
  // STATE
  // ════════════════════════════
  let lightboxImgs  = [];   // tableau des images du produit courant
  let lightboxIdx   = 0;    // index affiché dans le lightbox
  let isLightboxOpen = false;

  // Swipe touch
  let touchStartX = 0;
  let touchStartY = 0;

  // ════════════════════════════
  // 1. LOUPE AU SURVOL
  //    Appliquée sur .modal-main-img quand une vraie image est présente
  // ════════════════════════════
  function initLoupe(container, imgEl){
    if(!imgEl || !container) return;

    // Créer le calque loupe
    const lens = document.createElement('div');
    lens.className = 'zt-zoom-lens';
    container.appendChild(lens);

    // Créer la fenêtre de zoom (à droite ou superposée)
    const result = document.createElement('div');
    result.className = 'zt-zoom-result';
    // On l'insère dans la gallery (parent du container)
    const gallery = container.closest('.modal-gallery');
    if(gallery) gallery.appendChild(result);

    let active = false;

    function move(e){
      e.preventDefault();
      const rect = imgEl.getBoundingClientRect();
      const cx = e.type.startsWith('touch')
        ? e.touches[0].clientX : e.clientX;
      const cy = e.type.startsWith('touch')
        ? e.touches[0].clientY : e.clientY;

      // Position relative à l'image
      let x = cx - rect.left;
      let y = cy - rect.top;

      const lW = lens.offsetWidth  / 2;
      const lH = lens.offsetHeight / 2;
      x = Math.max(lW, Math.min(x, rect.width  - lW));
      y = Math.max(lH, Math.min(y, rect.height - lH));

      lens.style.left = (x - lW) + 'px';
      lens.style.top  = (y - lH) + 'px';

      // Ratio de zoom
      const ratioX = result.offsetWidth  / lens.offsetWidth;
      const ratioY = result.offsetHeight / lens.offsetHeight;

      result.style.backgroundImage    = `url('${imgEl.src}')`;
      result.style.backgroundSize     = `${rect.width * ratioX}px ${rect.height * ratioY}px`;
      result.style.backgroundPosition =
        `-${(x - lW) * ratioX}px -${(y - lH) * ratioY}px`;
    }

    function show(){
      if(!imgEl.src || imgEl.style.display === 'none') return;
      active = true;
      lens.style.display   = 'block';
      result.style.display = 'block';
    }
    function hide(){
      active = false;
      lens.style.display   = 'none';
      result.style.display = 'none';
    }

    container.addEventListener('mouseenter', show);
    container.addEventListener('mouseleave', hide);
    container.addEventListener('mousemove',  move);

    // Sur mobile : désactiver la loupe (on utilise le swipe/lightbox à la place)
    if('ontouchstart' in window) hide();
  }

  // ════════════════════════════
  // 2. LIGHTBOX PLEIN ÉCRAN
  // ════════════════════════════
  function buildLightbox(){
    if(document.getElementById('zt-lightbox')) return;
    const lb = document.createElement('div');
    lb.id = 'zt-lightbox';
    lb.innerHTML = `
      <div class="zt-lb-overlay" onclick="ZoomImage.closeLightbox()"></div>
      <div class="zt-lb-box">
        <button class="zt-lb-close" onclick="ZoomImage.closeLightbox()">
          <i class="fas fa-times"></i>
        </button>
        <button class="zt-lb-arrow zt-lb-prev" onclick="ZoomImage.lbPrev()">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="zt-lb-img-wrap" id="ztLbImgWrap">
          <img id="ztLbImg" src="" alt="" draggable="false"/>
          <div class="zt-lb-spinner" id="ztLbSpinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
        </div>
        <button class="zt-lb-arrow zt-lb-next" onclick="ZoomImage.lbNext()">
          <i class="fas fa-chevron-right"></i>
        </button>
        <div class="zt-lb-dots" id="ztLbDots"></div>
        <div class="zt-lb-counter" id="ztLbCounter"></div>
      </div>`;
    document.body.appendChild(lb);

    // Swipe touch
    const wrap = lb.querySelector('.zt-lb-img-wrap');
    wrap.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40){
        dx < 0 ? lbNext() : lbPrev();
      }
    }, { passive: true });

    // Clavier
    document.addEventListener('keydown', e => {
      if(!isLightboxOpen) return;
      if(e.key === 'ArrowRight') lbNext();
      if(e.key === 'ArrowLeft')  lbPrev();
      if(e.key === 'Escape')     closeLightbox();
    });
  }

  function openLightbox(imgs, startIdx){
    buildLightbox();
    lightboxImgs = imgs.filter(Boolean);
    if(!lightboxImgs.length) return;
    lightboxIdx  = Math.min(startIdx || 0, lightboxImgs.length - 1);
    isLightboxOpen = true;
    document.getElementById('zt-lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderLbImage();
    renderLbDots();
  }

  function closeLightbox(){
    const lb = document.getElementById('zt-lightbox');
    if(lb) lb.classList.remove('open');
    isLightboxOpen = false;
    // Ne pas re-bloquer le scroll (le modal est peut-être encore ouvert)
  }

  function renderLbImage(){
    const img     = document.getElementById('ztLbImg');
    const spinner = document.getElementById('ztLbSpinner');
    const counter = document.getElementById('ztLbCounter');
    if(!img) return;

    spinner.style.display = 'flex';
    img.style.opacity     = '0';
    img.src = lightboxImgs[lightboxIdx];
    img.onload = () => {
      spinner.style.display = 'none';
      img.style.opacity     = '1';
    };
    img.onerror = () => { spinner.style.display = 'none'; img.style.opacity = '0.3'; };

    counter.textContent = `${lightboxIdx + 1} / ${lightboxImgs.length}`;

    // Flèches
    const lb = document.getElementById('zt-lightbox');
    lb.querySelector('.zt-lb-prev').style.display = lightboxImgs.length > 1 ? 'flex' : 'none';
    lb.querySelector('.zt-lb-next').style.display = lightboxImgs.length > 1 ? 'flex' : 'none';

    renderLbDots();
  }

  function renderLbDots(){
    const dots = document.getElementById('ztLbDots');
    if(!dots || lightboxImgs.length <= 1){ if(dots) dots.innerHTML=''; return; }
    dots.innerHTML = lightboxImgs.map((_, i) =>
      `<div class="zt-lb-dot${i===lightboxIdx?' active':''}"
            onclick="ZoomImage.lbGoto(${i})"></div>`
    ).join('');
  }

  function lbNext(){
    lightboxIdx = (lightboxIdx + 1) % lightboxImgs.length;
    renderLbImage();
  }
  function lbPrev(){
    lightboxIdx = (lightboxIdx - 1 + lightboxImgs.length) % lightboxImgs.length;
    renderLbImage();
  }
  function lbGoto(i){
    lightboxIdx = i;
    renderLbImage();
  }

  // ════════════════════════════
  // 3. ATTACHER AU MODAL
  //    Appelé par app.js après injection du HTML du modal
  // ════════════════════════════
  function attachToModal(imgs){
    const realImgs = imgs.filter(Boolean);
    if(!realImgs.length) return;

    const mainWrap = document.getElementById('modalMainImg');
    if(!mainWrap) return;

    // Attendre que l'image soit chargée pour la loupe
    const imgEl = mainWrap.querySelector('.modal-real-img');
    if(imgEl){
      initLoupe(mainWrap, imgEl);
    }

    // Curseur "zoom" + clic pour ouvrir le lightbox
    mainWrap.style.cursor = 'zoom-in';
    mainWrap.addEventListener('click', () => {
      openLightbox(realImgs, lightboxIdx);
    }, { once: false });

    // Bouton loupe discret sur l'image
    const zoomBtn = document.createElement('button');
    zoomBtn.className = 'zt-modal-zoom-btn';
    zoomBtn.title = 'Agrandir';
    zoomBtn.innerHTML = '<i class="fas fa-expand-alt"></i>';
    zoomBtn.onclick = (e) => {
      e.stopPropagation();
      openLightbox(realImgs, lightboxIdx);
    };
    mainWrap.appendChild(zoomBtn);

    // Sync index quand on change de vignette
    const thumbs = document.querySelectorAll('.modal-thumb');
    thumbs.forEach(t => {
      t.addEventListener('click', () => {
        lightboxIdx = parseInt(t.dataset.idx) || 0;
      });
    });

    // Swipe mobile dans le modal (change la vignette active)
    let tStartX = 0;
    mainWrap.addEventListener('touchstart', e => {
      tStartX = e.touches[0].clientX;
    }, { passive: true });
    mainWrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tStartX;
      if(Math.abs(dx) < 40) return;
      const activeThumbs = document.querySelectorAll('.modal-thumb');
      let activeIdx = 0;
      activeThumbs.forEach((t,i) => { if(t.classList.contains('active')) activeIdx = i; });
      const newIdx = dx < 0
        ? Math.min(activeIdx + 1, realImgs.length - 1)
        : Math.max(activeIdx - 1, 0);
      if(newIdx !== activeIdx && activeThumbs[newIdx]){
        activeThumbs[newIdx].click();
        lightboxIdx = newIdx;
      }
    }, { passive: true });
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    buildLightbox();
  }

  return {
    init, attachToModal,
    openLightbox, closeLightbox,
    lbNext, lbPrev, lbGoto,
  };

})();

document.addEventListener('DOMContentLoaded', () => ZoomImage.init());
