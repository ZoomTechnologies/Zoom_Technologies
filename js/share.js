/* ===========================
   ZOOM TECHNOLOGIE — SHARE.JS
   Partage avancé produit
   URL unique · QR Code · Open Graph · Copier lien
   =========================== */

const ZoomShare = (function(){

  const BASE_URL  = window.location.origin + window.location.pathname.replace(/\/$/, '');
  const WA_NUMBER = '237697557365';

  // ════════════════════════════
  // 1. URL UNIQUE PAR PRODUIT
  // ════════════════════════════
  function getProductUrl(id){
    return `${BASE_URL}?product=${id}`;
  }

  // ─── Lire le paramètre ?product= au chargement ───
  function checkProductParam(){
    const params = new URLSearchParams(window.location.search);
    const id     = parseInt(params.get('product'));
    if(!id || isNaN(id)) return;

    // Attendre que PRODUCTS soit chargé
    const tryOpen = (attempts = 0) => {
      if(typeof PRODUCTS === 'undefined' || typeof openModal === 'undefined'){
        if(attempts < 20) setTimeout(() => tryOpen(attempts + 1), 200);
        return;
      }
      const product = PRODUCTS.find(p => p.id === id);
      if(product){
        // Mettre à jour les meta OG dynamiquement
        updateOGMeta(product);
        // Ouvrir le modal après que la page soit rendue
        setTimeout(() => openModal(product), 600);
      }
    };
    tryOpen();
  }

  // ════════════════════════════
  // 2. OPEN GRAPH DYNAMIQUE
  //    Met à jour les meta OG quand un produit est partagé
  // ════════════════════════════
  function updateOGMeta(product){
    if(!product) return;
    const imgs = typeof getImgs === 'function' ? getImgs(product) : [];
    const img  = imgs[0] || '';
    const url  = getProductUrl(product.id);
    const title= `${product.name} — ZOOM Technologie`;
    const desc = `${product.price} · ${product.desc ? product.desc.substring(0,120)+'…' : 'Disponible en boutique à Douala'}`;

    // Mettre à jour ou créer les balises meta
    setMeta('og:title',       title);
    setMeta('og:description', desc);
    setMeta('og:url',         url);
    if(img) setMeta('og:image', img.startsWith('http') ? img : `${window.location.origin}/${img}`);
    setMeta('og:type', 'product');
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       title);
    setMeta('twitter:description', desc);
    document.title = title;

    // Mettre à jour canonical
    let canon = document.querySelector('link[rel="canonical"]');
    if(!canon){ canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = url;

    // Mettre à jour l'URL sans recharger la page
    window.history.replaceState({ productId: product.id }, title, `?product=${product.id}`);
  }

  function resetOGMeta(){
    setMeta('og:title',       'ZOOM Technologie – Informatique & NTIC à Douala');
    setMeta('og:description', 'Ordinateurs, smartphones, accessoires et équipements NTIC. Vente en gros et détail. Livraison au Cameroun.');
    setMeta('og:url',         BASE_URL);
    setMeta('og:type',        'website');
    document.title = 'ZOOM Technologie – Ordinateurs, Accessoires Informatiques & NTIC à Douala';
    window.history.replaceState({}, document.title, window.location.pathname);
    let canon = document.querySelector('link[rel="canonical"]');
    if(canon) canon.href = BASE_URL;
  }

  function setMeta(property, content){
    let el = document.querySelector(`meta[property="${property}"]`)
          || document.querySelector(`meta[name="${property}"]`);
    if(!el){
      el = document.createElement('meta');
      el.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // ════════════════════════════
  // 3. QR CODE (Canvas natif — sans dépendance)
  // ════════════════════════════

  // Implémentation QR code minimaliste (QR version 3, mode URL courte)
  // Pour des URLs longues on utilise un service externe gratuit
  function generateQR(text, canvas, size){
    // Utiliser l'API Google Charts (gratuit, fiable, HTTPS)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=0F1111&margin=10&qzone=1`;
    const ctx  = canvas.getContext('2d');
    canvas.width  = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.onerror = () => {
      // Fallback si hors ligne : afficher le lien en texte
      ctx.fillStyle = '#f7f9fc';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#0055FF';
      ctx.font = `bold ${size/10}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('QR non disponible', size/2, size/2 - 8);
      ctx.font = `${size/14}px monospace`;
      ctx.fillStyle = '#555';
      ctx.fillText('(connexion requise)', size/2, size/2 + 14);
    };
    img.src = url;
  }

  // ════════════════════════════
  // 4. SHARE SHEET ENRICHI
  //    Remplace l'ancien openShareSheet
  // ════════════════════════════
  function openShareSheet(id){
    const p = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(x => x.id === id) : null;
    if(!p) return;

    updateOGMeta(p);

    const productUrl = getProductUrl(id);
    const imgs       = typeof getImgs === 'function' ? getImgs(p) : [];
    const imgSrc     = imgs[0] || '';
    const shareText  = `${p.icon} ${p.name} — ${p.price}\nDisponible chez ZOOM Technologie, Bar Akwa Douala 🇨🇲`;

    let sheet = document.getElementById('zt-share-sheet');
    if(!sheet){
      sheet = document.createElement('div');
      sheet.id = 'zt-share-sheet';
      document.body.appendChild(sheet);
    }

    sheet.innerHTML = `
      <div class="zt-ss-overlay" onclick="ZoomShare.close()"></div>
      <div class="zt-ss-box">
        <div class="zt-ss-handle"></div>

        <!-- Aperçu produit -->
        <div class="zt-ss-preview">
          ${imgSrc ? `<img src="${imgSrc}" class="zt-ss-preview-img" alt="${p.name}" onerror="this.style.display='none'">` : `<div class="zt-ss-preview-emoji">${p.icon}</div>`}
          <div class="zt-ss-preview-info">
            <div class="zt-ss-preview-name">${p.name.substring(0,50)}${p.name.length>50?'…':''}</div>
            <div class="zt-ss-preview-price">${p.price}</div>
            <div class="zt-ss-preview-badge"><i class="fas fa-store"></i> ZOOM Technologie · Douala</div>
          </div>
        </div>

        <!-- Lien unique + bouton copier -->
        <div class="zt-ss-link-section">
          <div class="zt-ss-link-label"><i class="fas fa-link"></i> Lien direct produit</div>
          <div class="zt-ss-link-row">
            <input class="zt-ss-link-input" id="ztShareLinkInput" value="${productUrl}" readonly onclick="this.select()"/>
            <button class="zt-ss-copy-btn" id="ztCopyBtn" onclick="ZoomShare.copyLink('${productUrl}')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- QR Code -->
        <div class="zt-ss-qr-section">
          <div class="zt-ss-qr-label"><i class="fas fa-qrcode"></i> QR Code</div>
          <div class="zt-ss-qr-wrap">
            <canvas id="ztQrCanvas" class="zt-ss-qr-canvas"></canvas>
            <button class="zt-ss-qr-dl" onclick="ZoomShare.downloadQR('${p.name}')">
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>

        <!-- Boutons partage -->
        <div class="zt-ss-platforms-label">Partager via</div>
        <div class="zt-ss-platforms">
          <button class="zt-ss-btn zt-ss-wa"
            onclick="window.open('https://api.whatsapp.com/send?text=${encodeURIComponent(shareText+'\\n'+productUrl)}','_blank');ZoomShare.close()">
            <i class="fab fa-whatsapp"></i><span>WhatsApp</span>
          </button>
          <button class="zt-ss-btn zt-ss-fb"
            onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}','_blank');ZoomShare.close()">
            <i class="fab fa-facebook-f"></i><span>Facebook</span>
          </button>
          <button class="zt-ss-btn zt-ss-tg"
            onclick="window.open('https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}','_blank');ZoomShare.close()">
            <i class="fab fa-telegram-plane"></i><span>Telegram</span>
          </button>
          <button class="zt-ss-btn zt-ss-native"
            onclick="ZoomShare.native(${id})">
            <i class="fas fa-share-alt"></i><span>Autres</span>
          </button>
        </div>

        <button class="zt-ss-cancel" onclick="ZoomShare.close()">Fermer</button>
      </div>`;

    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Générer le QR après rendu
    setTimeout(() => {
      const canvas = document.getElementById('ztQrCanvas');
      if(canvas) generateQR(productUrl, canvas, 160);
    }, 200);
  }

  function close(){
    const sheet = document.getElementById('zt-share-sheet');
    if(sheet){ sheet.classList.remove('open'); }
    document.body.style.overflow = '';
    resetOGMeta();
  }

  // ─── Copier le lien ───
  function copyLink(url){
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('ztCopyBtn');
      if(btn){
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i>';
          btn.classList.remove('copied');
        }, 2000);
      }
    }).catch(() => {
      // Fallback pour les navigateurs sans clipboard API
      const input = document.getElementById('ztShareLinkInput');
      if(input){ input.select(); document.execCommand('copy'); }
    });
  }

  // ─── Partage natif (Web Share API) ───
  function native(id){
    const p = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(x => x.id === id) : null;
    if(!p) return;
    const url = getProductUrl(id);
    if(navigator.share){
      navigator.share({
        title: `${p.name} — ZOOM Technologie`,
        text:  `${p.icon} ${p.name} — ${p.price} chez ZOOM Technologie, Douala`,
        url,
      }).catch(() => {});
    } else {
      copyLink(url);
    }
    close();
  }

  // ─── Télécharger le QR ───
  function downloadQR(productName){
    const canvas = document.getElementById('ztQrCanvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-zoom-${productName.replace(/[^a-z0-9]/gi,'_').substring(0,30)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    checkProductParam();
  }

  return {
    init, openShareSheet, close, copyLink,
    native, downloadQR, getProductUrl, updateOGMeta,
  };

})();

// Rétrocompatibilité avec les anciens appels dans le HTML
function openShareSheet(id){ ZoomShare.openShareSheet(id); }
function closeShareSheet() { ZoomShare.close(); }

document.addEventListener('DOMContentLoaded', () => ZoomShare.init());
