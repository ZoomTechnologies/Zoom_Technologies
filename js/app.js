// ===========================
// ZOOM TECHNOLOGIE — APP.JS v3
// ===========================

let currentCat = "";
let currentSearch = "";
let currentSort = "default";
let wishlist = JSON.parse(sessionStorage.getItem('zoom_wishlist') || '[]');
let currentProduct = null;

// ===== HERO IMAGE SLIDER avec textes dynamiques =====
(function(){
  const slides   = document.querySelectorAll(".hero-slide");
  const dotsC    = document.getElementById("sliderDots");
  const titleEl  = document.getElementById("heroTitle");
  const hlWrap   = document.querySelector(".hero-highlight-wrap");
  const hlEl     = document.getElementById("heroHighlight");
  let cur = 0, timer = null;

  // Créer les dots
  slides.forEach((_,i)=>{
    const d = document.createElement("button");
    d.className = "slider-dot" + (i===0 ? " active" : "");
    d.setAttribute("aria-label", "Slide " + (i+1));
    d.addEventListener("click", ()=>{ goTo(i); resetTimer(); });
    dotsC.appendChild(d);
  });

  // Initialiser le texte du 1er slide
  updateText(0, false);

  function updateText(n, animate){
    const slide = slides[n];
    const newTitle = slide.dataset.title    || "";
    const newHL    = slide.dataset.highlight || "";

    if(!animate){
      // Affichage direct sans animation (init)
      titleEl.textContent = newTitle;
      hlEl.textContent    = newHL;
      titleEl.classList.add("text-visible");
      hlWrap.classList.add("text-visible");
      return;
    }

    // Phase 1 — sortie
    titleEl.classList.remove("text-visible");
    titleEl.classList.add("text-exit");
    hlWrap.classList.remove("text-visible");
    hlWrap.classList.add("text-exit");

    setTimeout(()=>{
      // Phase 2 — changer le texte + préparer l'entrée
      titleEl.textContent = newTitle;
      hlEl.textContent    = newHL;
      titleEl.classList.remove("text-exit");
      titleEl.classList.add("text-enter");
      hlWrap.classList.remove("text-exit");
      hlWrap.classList.add("text-enter");

      // Forcer reflow pour que la transition se déclenche
      titleEl.getBoundingClientRect();

      setTimeout(()=>{
        // Phase 3 — entrée
        titleEl.classList.remove("text-enter");
        titleEl.classList.add("text-visible");
        hlWrap.classList.remove("text-enter");
        hlWrap.classList.add("text-visible");
      }, 30);
    }, 420);
  }

  function goTo(n){
    // Changer le slide image
    slides[cur].classList.remove("active");
    slides[cur].classList.add("prev");
    const old = slides[cur];
    setTimeout(()=>old.classList.remove("prev"), 1300);
    document.querySelectorAll(".slider-dot")[cur].classList.remove("active");

    cur = n;
    slides[cur].classList.add("active");
    document.querySelectorAll(".slider-dot")[cur].classList.add("active");

    // Mettre à jour le texte avec animation
    updateText(cur, true);
  }

  function next(){ goTo((cur+1) % slides.length); }
  function startTimer(){ timer = setInterval(next, 5000); }
  function resetTimer(){ clearInterval(timer); startTimer(); }

  document.getElementById("sliderPrev").addEventListener("click",()=>{ goTo((cur-1+slides.length)%slides.length); resetTimer(); });
  document.getElementById("sliderNext").addEventListener("click",()=>{ goTo((cur+1)%slides.length); resetTimer(); });

  const hero = document.querySelector(".hero");
  hero.addEventListener("mouseenter", ()=>clearInterval(timer));
  hero.addEventListener("mouseleave", startTimer);

  let tx = 0;
  hero.addEventListener("touchstart", e=>{ tx=e.touches[0].clientX; }, {passive:true});
  hero.addEventListener("touchend",   e=>{
    const dx = e.changedTouches[0].clientX - tx;
    if(Math.abs(dx) > 50){ dx<0 ? goTo((cur+1)%slides.length) : goTo((cur-1+slides.length)%slides.length); resetTimer(); }
  });

  startTimer();
})();

// ===== FLASH SALE COUNTDOWN =====
(function(){
  const el=document.getElementById("flashCountdown");
  if(!el)return;
  // Ends at midnight
  function update(){
    const now=new Date(), end=new Date(now);
    end.setHours(23,59,59,0);
    const diff=end-now;
    const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
    el.textContent=`⏱ Se termine dans ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
  }
  update(); setInterval(update,1000);
})();

// ===== RENDER FLASH PRODUCTS =====
function renderFlash(){
  const grid=document.getElementById("flashGrid");
  if(!grid)return;
  const promos=PRODUCTS.filter(p=>p.badge==="promo").slice(0,6);
  grid.innerHTML="";
  promos.forEach(p=>{
    const pct=p.oldPrice?Math.round((1-(parseFCFA(p.price)/parseFCFA(p.oldPrice)))*100):0;
    const card=document.createElement("div");
    card.className="flash-card";
    card.innerHTML=`
      ${productImg(p, 'flash-card-img-wrap', 'flash-card-img')}
      <div class="flash-card-body">
        <div class="flash-discount">-${pct}%</div>
        <div class="flash-card-name">${p.name}</div>
        <div class="flash-card-old">${p.oldPrice||''}</div>
        <div class="flash-card-price">${p.price}</div>
        <div class="flash-progress"><div class="flash-progress-bar" style="width:${30+Math.random()*60}%"></div></div>
        <div class="flash-stock">🔥 Stock limité</div>
        <button class="btn-add-cart" style="margin-top:8px" onclick="event.stopPropagation();ZoomCart.addItem(${p.id})">
          <i class="fas fa-cart-plus"></i> Ajouter au panier
        </button>
      </div>`;
    card.addEventListener("click",()=>openModal(p));
    grid.appendChild(card);
  });
}

function parseFCFA(str){return parseInt((str||"0").replace(/[^\d]/g,""))||0;}

// ===== HELPER — récupère le tableau des 4 images d'un produit =====
// Supporte imgs[] (nouveau format) et img (ancien format, rétrocompat)
function getImgs(p){
  if(p.imgs && Array.isArray(p.imgs)) return p.imgs;          // nouveau format
  if(p.img) return [p.img, null, null, null];                 // ancien format
  return [null, null, null, null];                            // aucune image
}

// ===== HELPER — rendu de la zone image d'une card produit =====
function productImg(p, wrapClass, emojiClass){
  const imgs = getImgs(p);
  const first = imgs[0];
  if(first){
    return `<div class="${wrapClass}">
      <img src="${first}" class="prod-real-img" alt="${p.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="${emojiClass}" style="display:none">${p.icon}</div>
    </div>`;
  }
  return `<div class="${emojiClass}">${p.icon}</div>`;
}

// ===== STARS RENDERER =====
function renderStars(n){
  const full=Math.floor(n), half=n%1>=.5?1:0, empty=5-full-half;
  return "★".repeat(full)+(half?"½":"")+"☆".repeat(empty);
}

// ===== CAT LABEL =====
function catLabel(cat){
  const m={ordinateur:"Ordinateurs",smartphone:"Smartphones",accessoire:"Accessoires",reseau:"Réseau & WiFi",ecran:"Écrans",stockage:"Stockage",energie:"Énergie & Onduleurs"};
  return m[cat]||cat;
}

// ===== RENDER PRODUCTS =====
function renderProducts(list){
  const grid=document.getElementById("productsGrid");
  const noRes=document.getElementById("noResults");
  const count=document.getElementById("resultCount");
  grid.innerHTML="";
  if(list.length===0){noRes.style.display="block";count.textContent="Aucun produit trouvé";if(typeof ZoomFilters!=='undefined')ZoomFilters.updateResultCount(0);return;}
  noRes.style.display="none";
  count.textContent=`${list.length} produit${list.length>1?"s":""} trouvé${list.length>1?"s":""}`;
  if(typeof ZoomFilters!=='undefined')ZoomFilters.updateResultCount(list.length);
  list.forEach((p,i)=>{
    const rating=(3.5+Math.random()*1.5).toFixed(1);
    const reviews=Math.floor(20+Math.random()*180);
    const pct=p.oldPrice?`<span class="discount-pct">-${Math.round((1-parseFCFA(p.price)/parseFCFA(p.oldPrice))*100)}%</span>`:"";
    const inWish=wishlist.includes(p.id);
    const card=document.createElement("div");
    card.className="product-card fade-in";
    card.dataset.productId = p.id;
    card.dataset.productId = p.id;
    card.innerHTML=`
      ${p.badge?`<span class="product-badge ${p.badge}">${p.badge==="new"?"Nouveau":"Promo"}</span>`:""}
      <button class="product-wishlist${inWish?" active":""}" data-id="${p.id}" title="Favoris" onclick="toggleWishlist(event,${p.id})"><i class="fa${inWish?"s":"r"} fa-heart"></i></button>
      ${productImg(p, 'product-img-wrap', 'product-img-placeholder')}
      <div class="product-body">
        <div class="product-cat">${catLabel(p.cat)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-stars"><span class="stars">${renderStars(parseFloat(rating))}</span><span class="reviews-count">(${reviews})</span></div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">
          ${p.oldPrice?`<span class="old-price">${p.oldPrice}</span>`:""}
          <span class="product-price-current">${p.price}</span>
          ${pct}
        </div>
        <div class="product-delivery"><i class="fas fa-truck"></i> Livraison Douala &amp; Cameroun</div>
      </div>
      <div class="product-discuss">
        <div class="discuss-label">Discuter</div>
        <div class="discuss-btns">
          <button class="discuss-btn d-wa" onclick="event.stopPropagation();discutWA(${p.id})"><i class="fab fa-whatsapp"></i>WhatsApp</button>
          <button class="discuss-btn d-ms" onclick="event.stopPropagation();discutMS(${p.id})"><i class="fab fa-facebook-messenger"></i>Messenger</button>
          <button class="discuss-btn d-share" onclick="event.stopPropagation();openShareSheet(${p.id})"><i class="fas fa-share-alt"></i>Partager</button>
        </div>
        <button class="btn-add-cart" onclick="event.stopPropagation();ZoomCart.addItem(${p.id})">
          <i class="fas fa-cart-plus"></i> Ajouter au panier
        </button>
      </div>`;
    card.addEventListener("click",()=>openModal(p));
    grid.appendChild(card);
    setTimeout(()=>{
      const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target);}});},{threshold:.08});
      obs.observe(card);
    },30);
  });
}

// ===== WISHLIST =====
function toggleWishlist(event,id){
  event.stopPropagation();
  const btn=event.currentTarget;
  if(wishlist.includes(id)){wishlist=wishlist.filter(x=>x!==id);btn.classList.remove("active");btn.innerHTML='<i class="far fa-heart"></i>';showToast("Retiré des favoris");}
  else{wishlist.push(id);btn.classList.add("active");btn.innerHTML='<i class="fas fa-heart"></i>';showToast("❤️ Ajouté aux favoris");}
  sessionStorage.setItem('zoom_wishlist',JSON.stringify(wishlist));
}

// ===== DISCUTER ACTIONS =====
function discutWA(id){const p=PRODUCTS.find(x=>x.id===id);if(p)window.open(`https://wa.me/237697557365?text=Bonjour%20ZOOM%20Technologie%20!%20Je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20%3A%20${encodeURIComponent(p.name)}%20-%20${encodeURIComponent(p.price)}`,"_blank");}
function discutMS(id){const p=PRODUCTS.find(x=>x.id===id);if(p)window.open(`https://m.me/tem.larissa?text=${encodeURIComponent("Bonjour, je suis intéressé(e) par : "+p.name+" - "+p.price)}`,"_blank");}

// ===== SHARE SHEET =====
function openShareSheet(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  currentProduct=p;
  document.getElementById("shareProductPreview").textContent=`${p.icon} ${p.name} — ${p.price}`;
  document.getElementById("shareSheetOverlay").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeShareSheet(){
  document.getElementById("shareSheetOverlay").classList.remove("open");
  document.body.style.overflow="";
}
function shareVia(platform){
  if(!currentProduct)return;
  const p=currentProduct;
  const text=`${p.icon} ${p.name} - ${p.price}\nDisponible chez ZOOM Technologie, Bar Akwa Douala 🇨🇲\nCommandez sur WhatsApp : https://wa.me/237697557365`;
  const url=encodeURIComponent(window.location.href);
  const txt=encodeURIComponent(text);
  if(platform==="whatsapp"){window.open(`https://api.whatsapp.com/send?text=${txt}`,"_blank");}
  else if(platform==="facebook"){window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${txt}`,"_blank");}
  else if(platform==="instagram"){navigator.clipboard.writeText(text).then(()=>showToast("📋 Texte copié ! Collez-le dans Instagram"));closeShareSheet();return;}
  else if(platform==="status"){window.open(`https://api.whatsapp.com/send?text=${txt}`,"_blank");}
  else if(platform==="copy"){navigator.clipboard.writeText(text).then(()=>showToast("🔗 Lien copié !"));closeShareSheet();return;}
  else if(platform==="native"){
    if(navigator.share){navigator.share({title:"ZOOM Technologie – "+p.name,text:text,url:window.location.href}).catch(()=>{});}
    else{navigator.clipboard.writeText(text).then(()=>showToast("📋 Copié ! Partagez dans votre appli."));}
    closeShareSheet();return;
  }
  closeShareSheet();
}

// ===== FILTER =====
function applyFilters(){
  let list=[...PRODUCTS];
  if(currentCat)list=list.filter(p=>p.cat===currentCat);
  if(currentSearch){const q=currentSearch.toLowerCase();list=list.filter(p=>p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||catLabel(p.cat).toLowerCase().includes(q));}
  // Filtres avancés prix / marques / statut
  if(typeof ZoomFilters !== 'undefined') list = ZoomFilters.filterList(list);
  // Sort
  if(currentSort==="price-asc")list.sort((a,b)=>parseFCFA(a.price)-parseFCFA(b.price));
  else if(currentSort==="price-desc")list.sort((a,b)=>parseFCFA(b.price)-parseFCFA(a.price));
  else if(currentSort==="promo")list.sort((a,b)=>(b.badge==="promo"?1:0)-(a.badge==="promo"?1:0));
  else if(currentSort==="new")list.sort((a,b)=>(b.badge==="new"?1:0)-(a.badge==="new"?1:0));
  renderProducts(list);
  document.getElementById("catalogue").scrollIntoView({behavior:"smooth",block:"start"});
}
function filterCategory(btn,cat){
  currentCat=cat; currentSearch="";
  document.getElementById("searchInput").value=""; document.getElementById("heroSearch").value="";
  document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("active"));
  if(btn)btn.classList.add("active");
  else{const m=document.querySelector(`.cat-btn[data-cat="${cat}"]`);if(m)m.classList.add("active");}
  document.getElementById("categoryFilter").value=cat;
  applyFilters();
}
function searchProducts(){
  currentSearch=document.getElementById("searchInput").value.trim();
  currentCat=document.getElementById("categoryFilter").value;
  if(currentSearch && typeof ZoomCookies!=='undefined') ZoomCookies.trackSearch(currentSearch);
  applyFilters();
}
function heroSearchProducts(){
  const v=document.getElementById("heroSearch").value.trim();
  currentSearch=v;currentCat="";
  document.getElementById("searchInput").value=v;
  document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("active"));
  document.querySelector('.cat-btn[data-cat=""]').classList.add("active");
  if(v && typeof ZoomCookies!=='undefined') ZoomCookies.trackSearch(v);
  applyFilters();
}
function sortProducts(){
  currentSort=document.getElementById("sortSelect").value;
  if(typeof ZoomCookies!=='undefined') ZoomCookies.saveSortPref(currentSort);
  applyFilters();
}
document.getElementById("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchProducts();});
document.getElementById("heroSearch").addEventListener("keydown",e=>{if(e.key==="Enter")heroSearchProducts();});
document.getElementById("categoryFilter").addEventListener("change",()=>{currentCat=document.getElementById("categoryFilter").value;currentSearch=document.getElementById("searchInput").value.trim();applyFilters();});

// ===== MODAL PRODUIT (style Amazon/Glotelho) =====
function openModal(p){
  currentProduct=p;
  // ── Tracking cookies ──
  if(typeof ZoomCookies !== 'undefined'){
    ZoomCookies.trackProductView(p.id);
    ZoomCookies.addRecentlyViewed(p.id);
    setTimeout(()=>{ ZoomCookies.applyPopularBadges(); ZoomCookies.renderRecentlyViewed(); }, 300);
  }
  const overlay = document.getElementById("modalOverlay");
  const box     = document.getElementById("modalBox");  // cible directe la modal-box
  const rating=(3.5+Math.random()*1.5).toFixed(1);
  const reviews=Math.floor(20+Math.random()*180);
  const pct=p.oldPrice?Math.round((1-parseFCFA(p.price)/parseFCFA(p.oldPrice))*100):0;
  const badges=[
    p.badge==="new"?'<span class="modal-badge mbadge-new">Nouveau</span>':"",
    p.badge==="promo"?'<span class="modal-badge mbadge-promo">Promo -'+pct+'%</span>':"",
    '<span class="modal-badge mbadge-gros">Vente en gros dispo</span>'
  ].filter(Boolean).join("");
  const specs=generateSpecs(p);
  const imgs = getImgs(p);

  const buildMainHTML = (src) => src
    ? `<img src="${src}" class="modal-real-img" alt="${p.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="modal-main-emoji" style="display:none">${p.icon}</div>`
    : `<div class="modal-main-emoji">${p.icon}</div>`;

  const fallbackLabels = [p.icon, "📦", "🏷️", "✅"];

  const thumbsHTML = imgs.map((src, i) => {
    if(src){
      return `<div class="modal-thumb${i===0?' active':''} has-img" data-idx="${i}">
        <img src="${src}" alt="Vue ${i+1}"
             onerror="this.style.display='none';this.parentElement.classList.add('thumb-fallback');this.parentElement.innerHTML='${fallbackLabels[i]}'">
      </div>`;
    }
    return `<div class="modal-thumb${i===0 && !imgs[0]?' active':''} thumb-fallback" data-idx="${i}">${fallbackLabels[i]}</div>`;
  }).join("");

  // ── Produits similaires : même catégorie, excl. produit courant, max 4 ──
  const similar = PRODUCTS
    .filter(x => x.id !== p.id && x.cat === p.cat)
    .slice(0, 4);

  const similarHTML = similar.length ? `
    <div class="modal-similar">
      <div class="modal-similar-title"><i class="fas fa-th-large"></i> Produits similaires</div>
      <div class="modal-similar-grid">
        ${similar.map(s => {
          const sImgs = getImgs(s);
          const sImg  = sImgs[0];
          const sPct  = s.oldPrice ? Math.round((1-parseFCFA(s.price)/parseFCFA(s.oldPrice))*100) : 0;
          const imgHTML = sImg
            ? `<img src="${sImg}" alt="${s.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="sim-emoji" style="display:none">${s.icon}</div>`
            : `<div class="sim-emoji">${s.icon}</div>`;
          return `<div class="sim-card" onclick="event.stopPropagation();openModal(PRODUCTS.find(x=>x.id===${s.id}))">
            <div class="sim-img">${imgHTML}</div>
            <div class="sim-info">
              <div class="sim-name">${s.name}</div>
              <div class="sim-price">
                ${s.oldPrice?`<span class="sim-old">${s.oldPrice}</span>`:''}
                <span class="sim-current">${s.price}</span>
                ${sPct?`<span class="sim-pct">-${sPct}%</span>`:''}
              </div>
              <button class="sim-btn-cart" onclick="event.stopPropagation();ZoomCart.addItem(${s.id})">
                <i class="fas fa-cart-plus"></i> Ajouter
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  box.innerHTML=`
    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    <div class="modal-gallery">
      <div class="modal-main-img" id="modalMainImg">${buildMainHTML(imgs[0])}</div>
      <div class="modal-thumbnails" id="modalThumbs">${thumbsHTML}</div>
    </div>
    <div class="modal-info-panel">
      <div class="modal-badges">${badges}</div>
      <div class="modal-cat">${catLabel(p.cat)}</div>
      <div class="modal-name">${p.name}</div>
      <div class="modal-stars">
        <span class="stars">${renderStars(parseFloat(rating))}</span>
        <span style="font-size:.82rem;font-weight:700;color:var(--star);margin-left:4px">${rating}</span>
        <span class="reviews-count">${reviews} avis clients</span>
      </div>
      <div class="modal-price-box">
        ${p.oldPrice?`<div class="modal-old-price">Prix habituel : ${p.oldPrice}</div>`:""}
        <div class="modal-price-row">
          <span class="modal-price">${p.price}</span>
          ${pct?`<span class="modal-discount">−${pct}%</span>`:""}
        </div>
        <div class="modal-economy">${pct?`Vous économisez ${Math.round(parseFCFA(p.price)*(pct/100)).toLocaleString('fr-FR')} FCFA`:''}</div>
      </div>
      ${typeof ZoomOffers!=='undefined' ? ZoomOffers.injectInModal(p.id) : ''}
      <div class="modal-stock in-stock"><i class="fas fa-check-circle"></i> En stock — Disponible en boutique</div>
      <div class="modal-delivery"><i class="fas fa-truck"></i> Livraison rapide à Douala &amp; tout le Cameroun</div>
      ${specs.length?`
      <div class="modal-specs">
        <div class="modal-specs-title">Caractéristiques principales</div>
        <div class="modal-specs-grid">
          ${specs.map(s=>`<div class="spec-item"><div class="spec-label">${s.label}</div><div class="spec-value">${s.value}</div></div>`).join("")}
        </div>
      </div>`:""}
      <div class="modal-discuss">
        <div class="modal-discuss-label">Discuter &amp; commander</div>
        <div class="modal-discuss-btns">
          <button class="mdiscuss-btn d-wa" onclick="discutWA(${p.id})"><i class="fab fa-whatsapp"></i>WhatsApp</button>
          <button class="mdiscuss-btn d-ms" onclick="discutMS(${p.id})"><i class="fab fa-facebook-messenger"></i>Messenger</button>
          <button class="mdiscuss-btn d-share" onclick="openShareSheet(${p.id})"><i class="fas fa-share-alt"></i>Partager</button>
        </div>
        <button class="modal-btn-cart" onclick="ZoomCart.addItem(${p.id});closeModal()">
          <i class="fas fa-cart-plus"></i> Ajouter au panier
        </button>
      </div>
      ${similarHTML}
    </div>`;

  document.getElementById("modalThumbs").querySelectorAll(".modal-thumb").forEach(t=>{
    t.addEventListener("click", ()=>{
      document.getElementById("modalThumbs").querySelectorAll(".modal-thumb").forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      const idx = parseInt(t.dataset.idx);
      const src = imgs[idx];
      document.getElementById("modalMainImg").innerHTML = buildMainHTML(src);
      // Ré-attacher la loupe sur la nouvelle image
      const newImg = document.getElementById("modalMainImg").querySelector('.modal-real-img');
      if(newImg && typeof ZoomImage !== 'undefined') ZoomImage.attachToModal(imgs.filter(Boolean));
    });
  });

  // Attacher zoom/loupe/swipe
  if(typeof ZoomImage !== 'undefined') ZoomImage.attachToModal(imgs);

  overlay.classList.add("open");
  document.body.style.overflow="hidden";
}

function generateSpecs(p){
  const specs=[];
  const n=p.name.toLowerCase();
  if(p.cat==="ordinateur"){
    if(n.includes("core i3"))specs.push({label:"Processeur",value:"Intel Core i3"});
    else if(n.includes("core i5"))specs.push({label:"Processeur",value:"Intel Core i5"});
    else if(n.includes("core i7"))specs.push({label:"Processeur",value:"Intel Core i7"});
    else if(n.includes("ryzen"))specs.push({label:"Processeur",value:"AMD Ryzen"});
    else if(n.includes("m1"))specs.push({label:"Processeur",value:"Apple M1"});
    const ramM=p.desc.match(/(\d+Go)\s*RAM/i);
    if(ramM)specs.push({label:"RAM",value:ramM[1]});
    const ssdM=p.desc.match(/SSD\s*(\d+Go)/i);
    if(ssdM)specs.push({label:"Stockage",value:"SSD "+ssdM[1]});
    const hddM=p.desc.match(/HDD\s*(\d+To|\d+Go)/i);
    if(hddM)specs.push({label:"Stockage",value:"HDD "+hddM[1]});
    const ecranM=p.desc.match(/(\d+\.?\d*)"?/);
    if(ecranM)specs.push({label:"Écran",value:ecranM[1]+'"'});
  } else if(p.cat==="smartphone"){
    const ramM=p.desc.match(/(\d+Go)\+?(\d+Go)?/);
    if(ramM)specs.push({label:"Stockage",value:ramM[0]});
    const camM=p.desc.match(/(\d+)MP/i);
    if(camM)specs.push({label:"Caméra",value:camM[1]+" MP"});
    const battM=p.desc.match(/(\d+)mAh/i);
    if(battM)specs.push({label:"Batterie",value:battM[1]+" mAh"});
    if(n.includes("5g"))specs.push({label:"Réseau",value:"5G"});
    else specs.push({label:"Réseau",value:"4G LTE"});
  } else if(p.cat==="ecran"){
    const sizeM=p.desc.match(/(\d+)"/);
    if(sizeM)specs.push({label:"Taille",value:sizeM[1]+'"'});
    const hzM=p.desc.match(/(\d+)Hz/i);
    if(hzM)specs.push({label:"Taux rafraîch.",value:hzM[1]+" Hz"});
    const resM=p.desc.match(/(\d+x\d+)/);
    if(resM)specs.push({label:"Résolution",value:resM[1]});
  }
  specs.push({label:"Origine",value:"Import direct Chine 🇨🇳"});
  specs.push({label:"Garantie",value:"3 mois boutique"});
  return specs.slice(0,6);
}

function closeModal(){document.getElementById("modalOverlay").classList.remove("open");document.body.style.overflow="";}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeShareSheet();}});

// ===== MOBILE MENU =====
function toggleMenu(){document.getElementById("navMenu").classList.toggle("open");}
function closeMenu(){document.getElementById("navMenu").classList.remove("open");}
document.addEventListener("click",e=>{
  const menu=document.getElementById("navMenu");
  const hamburger=document.getElementById("hamburger");
  if(menu.classList.contains("open")&&!menu.contains(e.target)&&!hamburger.contains(e.target))closeMenu();
});

// ===== SCROLL =====
window.addEventListener("scroll",()=>{
  const btn=document.getElementById("backToTop");
  if(window.scrollY>400)btn.classList.add("visible"); else btn.classList.remove("visible");
});
function scrollToTop(){window.scrollTo({top:0,behavior:"smooth"});}

// ===== SMOOTH ANCHORS =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const t=document.querySelector(a.getAttribute("href"));
    if(t){e.preventDefault();const h=document.getElementById("header").offsetHeight;window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-h-10,behavior:"smooth"});}
  });
});

// ===== TOAST =====
function showToast(msg){
  let t=document.querySelector(".toast");
  if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t);}
  t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}

// ===== FADE-IN OBSERVER =====
const fadeObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");fadeObs.unobserve(e.target);}});},{threshold:.1});
document.querySelectorAll(".value-card,.gros-card,.contact-card,.apropos-text,.gros-text,.cat-visual-btn").forEach(el=>{el.classList.add("fade-in");fadeObs.observe(el);});

// ===== INIT =====
renderProducts(PRODUCTS);
renderFlash();
