/* ===========================
   ZOOM TECHNOLOGIE — ADMIN.JS
   Tableau de bord statistiques
   Mot de passe + graphiques + données réelles
   =========================== */

const ZoomAdmin = (function(){

  // ════════════════════════════
  // CONFIG
  // ════════════════════════════
  const PASSWORD   = 'ZoomAdmin2025!';   // ← changer ici
  const SESSION_KEY = 'zoom_admin_auth';
  const DAYS_1      = 24 * 60 * 60 * 1000;

  // Clés localStorage (identiques à cookies.js)
  const LS = {
    productViews  : 'zoom_product_views',
    searchHistory : 'zoom_search_history',
    visitCount    : 'zoom_visit_count',
    firstVisit    : 'zoom_first_visit',
    sessionStart  : 'zoom_session_start',
    dailyVisits   : 'zoom_daily_visits',   // géré par admin.js
    cartEvents    : 'zoom_cart_events',    // géré par admin.js
  };

  let chartsDrawn = false;
  let chartInstances = {};

  // ════════════════════════════
  // AUTH
  // ════════════════════════════
  function checkSession(){
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      return s && s.ok && (Date.now() - s.ts < DAYS_1);
    } catch(e){ return false; }
  }

  function login(){
    const val = document.getElementById('loginInput').value;
    const err = document.getElementById('loginError');
    if(val === PASSWORD){
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display   = 'grid';
      trackTodayVisit();
      initDashboard();
    } else {
      err.textContent = 'Mot de passe incorrect. Réessayez.';
      document.getElementById('loginInput').value = '';
      document.getElementById('loginInput').focus();
      setTimeout(() => { err.textContent = ''; }, 3000);
    }
  }

  function logout(){
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  }

  function togglePwd(){
    const input = document.getElementById('loginInput');
    const icon  = document.getElementById('eyeIcon');
    if(input.type === 'password'){
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fas fa-eye';
    }
  }

  // ════════════════════════════
  // TRACKING VISITS (enrichi)
  // ════════════════════════════
  function trackTodayVisit(){
    const today = dateKey(new Date());
    const daily = lsGet(LS.dailyVisits) || {};
    daily[today] = (daily[today] || 0) + 1;
    // Garder seulement 30 jours
    const keys = Object.keys(daily).sort();
    if(keys.length > 30) keys.slice(0, keys.length - 30).forEach(k => delete daily[k]);
    lsSet(LS.dailyVisits, daily);
  }

  function dateKey(d){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // ════════════════════════════
  // DONNÉES
  // ════════════════════════════
  function getData(){
    const productViews  = lsGet(LS.productViews)  || {};
    const searchHistory = lsGet(LS.searchHistory) || [];
    const visitCount    = lsGet(LS.visitCount)    || 0;
    const firstVisit    = lsGet(LS.firstVisit);
    const dailyVisits   = lsGet(LS.dailyVisits)   || {};
    const cartEvents    = lsGet(LS.cartEvents)     || 0;

    // Visites aujourd'hui / semaine / mois
    const now   = new Date();
    const today = dateKey(now);

    let todayV = dailyVisits[today] || 0;
    let weekV  = 0;
    let monthV = 0;
    for(let i = 0; i < 7; i++){
      const d = new Date(now); d.setDate(d.getDate() - i);
      weekV += dailyVisits[dateKey(d)] || 0;
    }
    for(let i = 0; i < 30; i++){
      const d = new Date(now); d.setDate(d.getDate() - i);
      monthV += dailyVisits[dateKey(d)] || 0;
    }

    // Recherches agrégées
    const searchAgg = {};
    searchHistory.forEach(s => {
      const q = s.q.toLowerCase().trim();
      searchAgg[q] = (searchAgg[q] || 0) + 1;
    });
    const topSearches = Object.entries(searchAgg)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 10);

    // Produits triés
    const topProducts = Object.entries(productViews)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 8);

    // 7 derniers jours pour graphique
    const last7 = [];
    const last7Labels = [];
    for(let i = 6; i >= 0; i--){
      const d = new Date(now); d.setDate(d.getDate() - i);
      last7.push(dailyVisits[dateKey(d)] || 0);
      last7Labels.push(d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric' }));
    }

    // 30 derniers jours
    const last30 = [];
    const last30Labels = [];
    for(let i = 29; i >= 0; i--){
      const d = new Date(now); d.setDate(d.getDate() - i);
      last30.push(dailyVisits[dateKey(d)] || 0);
      last30Labels.push(i % 5 === 0 ? d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' }) : '');
    }

    return {
      productViews, searchHistory, visitCount,
      firstVisit, dailyVisits, cartEvents,
      todayV, weekV, monthV,
      topSearches, topProducts,
      last7, last7Labels, last30, last30Labels,
    };
  }

  // ════════════════════════════
  // INIT DASHBOARD
  // ════════════════════════════
  function initDashboard(){
    refresh();
  }

  function refresh(){
    const data = getData();
    renderKPIs(data);
    renderTopProducts(data);
    renderSearches(data);
    renderVisitors(data);
    drawCharts(data);
    renderPushSection();
    renderLoyaltySection();
    renderOffersSection();
  }

  // ════════════════════════════
  // KPIs
  // ════════════════════════════
  function renderKPIs(data){
    el('kpi-today').textContent   = data.todayV  || '0';
    el('kpi-week').textContent    = data.weekV   || '0';
    el('kpi-month').textContent   = data.monthV  || '0';
    el('kpi-total').textContent   = data.visitCount || '0';
    el('kpi-carts').textContent   = data.cartEvents || '0';
    el('kpi-searches').textContent= Object.keys(
      (lsGet(LS.searchHistory)||[]).reduce((a,s)=>{a[s.q]=1;return a;},{})).length || '0';
  }

  // ════════════════════════════
  // PRODUITS POPULAIRES
  // ════════════════════════════
  function renderTopProducts(data){
    const list = el('topProductsList');
    if(!data.topProducts.length){
      list.innerHTML = '<div class="adm-list-empty">Aucune vue enregistrée pour l\'instant.<br/>Visitez le catalogue pour générer des données.</div>';
      return;
    }
    const max = data.topProducts[0][1];
    list.innerHTML = data.topProducts.map(([id, count], i) => {
      const product = typeof PRODUCTS !== 'undefined'
        ? PRODUCTS.find(p => p.id === parseInt(id)) : null;
      const name  = product ? product.name  : `Produit #${id}`;
      const icon  = product ? product.icon  : '📦';
      const cat   = product ? product.cat   : '';
      const pct   = Math.round((count / max) * 100);
      const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
      return `<div class="adm-list-item">
        <div class="adm-list-rank ${rankClass}">${i+1}</div>
        <div class="adm-list-emoji">${icon}</div>
        <div class="adm-list-info">
          <div class="adm-list-name">${name}</div>
          <div class="adm-list-meta">${cat} · ID #${id}</div>
        </div>
        <div class="adm-list-bar-wrap">
          <div class="adm-list-bar-bg">
            <div class="adm-list-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="adm-list-count">${count} vues</div>
      </div>`;
    }).join('');
  }

  // ════════════════════════════
  // RECHERCHES
  // ════════════════════════════
  function renderSearches(data){
    const topEl  = el('topSearchesList');
    const histEl = el('searchHistoryList');

    if(!data.topSearches.length){
      topEl.innerHTML = '<div class="adm-list-empty">Aucune recherche enregistrée.<br/>Les recherches apparaîtront ici après les premières visites.</div>';
    } else {
      const max = data.topSearches[0][1];
      topEl.innerHTML = data.topSearches.map(([q, count], i) => {
        const pct = Math.round((count / max) * 100);
        const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
        return `<div class="adm-list-item">
          <div class="adm-list-rank ${rankClass}">${i+1}</div>
          <div class="adm-list-emoji">🔍</div>
          <div class="adm-list-info">
            <div class="adm-list-name">${escHtml(q)}</div>
            <div class="adm-list-meta">Recherche</div>
          </div>
          <div class="adm-list-bar-wrap">
            <div class="adm-list-bar-bg">
              <div class="adm-list-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="adm-list-count">${count}×</div>
        </div>`;
      }).join('');
    }

    // Historique récent (10 dernières)
    const recent = data.searchHistory.slice(0, 10);
    if(!recent.length){
      histEl.innerHTML = '<div class="adm-list-empty">Aucun historique disponible.</div>';
    } else {
      histEl.innerHTML = recent.map(s => {
        const d = new Date(s.t);
        const when = d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        return `<div class="adm-list-item">
          <div class="adm-list-emoji">🔍</div>
          <div class="adm-list-info">
            <div class="adm-list-name">${escHtml(s.q)}</div>
            <div class="adm-list-meta">${when}</div>
          </div>
        </div>`;
      }).join('');
    }
  }

  // ════════════════════════════
  // VISITEURS
  // ════════════════════════════
  function renderVisitors(data){
    const cont = el('visitorDetails');
    const firstD = data.firstVisit
      ? new Date(data.firstVisit).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
      : 'Inconnu';
    const avgDaily = data.last30.length
      ? Math.round(data.last30.reduce((a,b)=>a+b,0) / 30)
      : 0;
    const maxDay = Math.max(...data.last30, 0);

    cont.innerHTML = `
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${data.todayV}</div>
        <div class="adm-visitor-stat-lbl">Visites aujourd'hui</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${data.weekV}</div>
        <div class="adm-visitor-stat-lbl">Cette semaine</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${data.monthV}</div>
        <div class="adm-visitor-stat-lbl">Ce mois</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${data.visitCount}</div>
        <div class="adm-visitor-stat-lbl">Total cumulé</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${avgDaily}</div>
        <div class="adm-visitor-stat-lbl">Moyenne/jour (30j)</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${maxDay}</div>
        <div class="adm-visitor-stat-lbl">Record journalier</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val" style="font-size:.9rem">${firstD}</div>
        <div class="adm-visitor-stat-lbl">Première visite</div>
      </div>
      <div class="adm-visitor-stat">
        <div class="adm-visitor-stat-val">${Object.keys(data.dailyVisits).length}</div>
        <div class="adm-visitor-stat-lbl">Jours avec activité</div>
      </div>`;
  }

  // ════════════════════════════
  // GRAPHIQUES (Canvas 2D natif — pas de dépendance)
  // ════════════════════════════
  function drawCharts(data){
    drawBarChart('chartWeek',     data.last7Labels, data.last7,     '#0055FF', 'Visites');
    drawLineChart('chartMonth',   data.last30Labels, data.last30,   '#059669', 'Visites/jour');
    drawProductChart(data);
    drawCatChart(data);
  }

  function drawBarChart(id, labels, values, color, label){
    const canvas = document.getElementById(id);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth - 40 || 500;
    const H = 220;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const pad   = { top:20, right:20, bottom:40, left:46 };
    const cW    = W - pad.left - pad.right;
    const cH    = H - pad.top  - pad.bottom;
    const max   = Math.max(...values, 1);
    const step  = cW / labels.length;

    // Grille horizontale
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++){
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max/4)*i), pad.left - 6, y + 3);
    }

    // Barres
    const barW = step * 0.55;
    values.forEach((v, i) => {
      const x = pad.left + step * i + (step - barW) / 2;
      const h = (v / max) * cH;
      const y = pad.top + cH - h;
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '88');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + 4, y);
      ctx.lineTo(x + barW - 4, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + 4);
      ctx.lineTo(x + barW, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + 4);
      ctx.quadraticCurveTo(x, y, x + 4, y);
      ctx.closePath();
      ctx.fill();
      // Valeur au dessus
      if(v > 0){
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v, x + barW/2, y - 5);
      }
      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW/2, H - pad.bottom + 16);
    });
  }

  function drawLineChart(id, labels, values, color, label){
    const canvas = document.getElementById(id);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.parentElement.clientWidth - 40 || 600;
    const H = 220;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const pad  = { top:20, right:20, bottom:36, left:40 };
    const cW   = W - pad.left - pad.right;
    const cH   = H - pad.top  - pad.bottom;
    const max  = Math.max(...values, 1);
    const step = cW / (values.length - 1 || 1);

    // Grille
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++){
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(max - (max/4)*i), pad.left - 5, y + 3);
    }

    // Zone remplie
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = pad.left + step * i;
      const y = pad.top + cH - (v / max) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + step * (values.length-1), pad.top + cH);
    ctx.lineTo(pad.left, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Ligne
    ctx.beginPath();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    values.forEach((v, i) => {
      const x = pad.left + step * i;
      const y = pad.top + cH - (v / max) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    values.forEach((v, i) => {
      if(!labels[i] && i !== 0 && i !== values.length-1) return;
      const x = pad.left + step * i;
      const y = pad.top + cH - (v / max) * cH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'white'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      if(labels[i]){
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x, H - pad.bottom + 14);
      }
    });
  }

  function drawProductChart(data){
    const canvas = document.getElementById('chartProducts');
    if(!canvas || !data.topProducts.length) return;
    const top8 = data.topProducts.slice(0,8);
    const labels = top8.map(([id]) => {
      const p = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(x => x.id === parseInt(id)) : null;
      return p ? p.name.slice(0, 18) + (p.name.length > 18 ? '…' : '') : `#${id}`;
    });
    const values = top8.map(([,v]) => v);
    drawBarChart('chartProducts', labels, values, '#7c3aed', 'Vues');
  }

  function drawCatChart(data){
    const canvas = document.getElementById('chartCats');
    if(!canvas) return;

    // Agréger les vues par catégorie
    const catViews = {};
    if(typeof PRODUCTS !== 'undefined'){
      Object.entries(data.productViews).forEach(([id, count]) => {
        const p = PRODUCTS.find(x => x.id === parseInt(id));
        if(p){ catViews[p.cat] = (catViews[p.cat] || 0) + count; }
      });
    }
    const entries = Object.entries(catViews).sort((a,b) => b[1]-a[1]);
    if(!entries.length){ canvas.parentElement.innerHTML = '<div class="adm-list-empty">Pas encore de données de catégorie.</div>'; return; }

    const ctx = canvas.getContext('2d');
    const W = Math.min(canvas.parentElement.clientWidth - 40, 320);
    const H = 220;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const colors = ['#0055FF','#ea580c','#059669','#7c3aed','#dc2626','#0891b2','#d97706','#475569'];
    const total  = entries.reduce((a,[,v]) => a+v, 0);
    const cx = W * 0.38, cy = H/2, r = Math.min(cx, cy) - 10, rInner = r * 0.54;
    let angle = -Math.PI / 2;

    entries.forEach(([cat, count], i) => {
      const slice = (count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
      angle += slice;
    });

    // Anneau central
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = '#475569'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(total + ' vues', cx, cy + 4);

    // Légende
    const legX = W * 0.72;
    entries.slice(0, 6).forEach(([cat, count], i) => {
      const y = 30 + i * 28;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legX, y - 7, 12, 12);
      ctx.fillStyle = '#0f172a'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(cat, legX + 16, y + 3);
      ctx.fillStyle = '#64748b'; ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`${count} (${Math.round(count/total*100)}%)`, legX + 16, y + 13);
    });
  }

  // ════════════════════════════
  // NAVIGATION SECTIONS
  // ════════════════════════════
  function showSection(name){
    document.querySelectorAll('.adm-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.adm-nav-link').forEach(l => l.classList.remove('active'));
    const sec = document.getElementById('sec-' + name);
    if(sec) sec.classList.add('active');
    const titles = {
      overview:'Vue d\'ensemble', products:'Produits populaires',
      searches:'Recherches', visitors:'Visiteurs',
      push:'Notifications Push', loyalty:'Programme de fidélité',
      offers:'Offres limitées',
    };
    el('admPageTitle').textContent = titles[name] || name;

    // Activer le nav link
    document.querySelectorAll('.adm-nav-link').forEach(l => {
      if(l.getAttribute('onclick') && l.getAttribute('onclick').includes(`'${name}'`))
        l.classList.add('active');
    });

    // Fermer sidebar mobile
    document.getElementById('admSidebar').classList.remove('open');

    // Redessiner les graphiques si nécessaire
    setTimeout(() => { const data = getData(); drawCharts(data); }, 50);
  }

  function toggleSidebar(){
    document.getElementById('admSidebar').classList.toggle('open');
  }

  // ════════════════════════════
  // RESET
  // ════════════════════════════
  function resetStats(){
    if(!confirm('⚠️ Effacer toutes les statistiques ? Cette action est irréversible.')) return;
    [LS.productViews, LS.searchHistory, LS.visitCount, LS.firstVisit, LS.sessionStart, LS.dailyVisits, LS.cartEvents].forEach(k => {
      try{ localStorage.removeItem(k); }catch(e){}
    });
    refresh();
    alert('✅ Statistiques réinitialisées.');
  }

  // ════════════════════════════
  // UTILITAIRES
  // ════════════════════════════
  function el(id){ return document.getElementById(id); }
  function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ── Push Notifications ──
  function renderPushSection(){
    const panel = el('admPushPanel');
    if(!panel) return;
    if(typeof ZoomPush !== 'undefined'){
      panel.innerHTML = ZoomPush.buildAdminPanel();
    } else {
      panel.innerHTML = '<div class="adm-list-empty">Module push non chargé.</div>';
    }
  }

  // ── Fidélité ──
  function renderLoyaltySection(){
    const kpisEl   = el('admLoyaltyKpis');
    const histEl   = el('admLoyaltyHistory');
    if(!kpisEl || typeof ZoomLoyalty === 'undefined') return;

    const data = ZoomLoyalty.load();
    const lvl  = ZoomLoyalty.getLevel(data.points);
    const next = ZoomLoyalty.LEVELS.find(l => l.min > data.points);

    kpisEl.innerHTML = `
      <div class="adm-kpi" data-color="orange">
        <div class="adm-kpi-icon"><i class="fas fa-star"></i></div>
        <div class="adm-kpi-body">
          <div class="adm-kpi-val">${data.points}</div>
          <div class="adm-kpi-lbl">Points accumulés</div>
        </div>
      </div>
      <div class="adm-kpi" data-color="purple">
        <div class="adm-kpi-icon">${lvl.icon}</div>
        <div class="adm-kpi-body">
          <div class="adm-kpi-val">${lvl.name}</div>
          <div class="adm-kpi-lbl">Niveau actuel</div>
        </div>
      </div>
      <div class="adm-kpi" data-color="green">
        <div class="adm-kpi-icon"><i class="fas fa-shopping-bag"></i></div>
        <div class="adm-kpi-body">
          <div class="adm-kpi-val">${data.orders}</div>
          <div class="adm-kpi-lbl">Commandes passées</div>
        </div>
      </div>
      <div class="adm-kpi" data-color="blue">
        <div class="adm-kpi-icon"><i class="fas fa-id-card"></i></div>
        <div class="adm-kpi-body">
          <div class="adm-kpi-val" style="font-size:.9rem">${data.cardId}</div>
          <div class="adm-kpi-lbl">ID Carte</div>
        </div>
      </div>`;

    if(!data.history.length){
      histEl.innerHTML = '<div class="adm-list-empty">Aucun historique de points.</div>';
    } else {
      histEl.innerHTML = data.history.map(h => `
        <div class="adm-list-item">
          <div class="adm-list-emoji">⭐</div>
          <div class="adm-list-info">
            <div class="adm-list-name">${escHtml(h.desc)}</div>
            <div class="adm-list-meta">${new Date(h.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
          <div class="adm-list-count">+${h.pts} pts</div>
        </div>`).join('');
    }
  }

  // ── Offres limitées ──
  function renderOffersSection(){
    const panel = el('admOffersPanel');
    if(!panel || typeof ZoomOffers === 'undefined') return;

    const statuses = ZoomOffers.getStatus();
    panel.innerHTML = statuses.map(o => {
      const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === o.productId) : null;
      const remainH = o.active ? Math.floor(o.remaining / 3600000) : 0;
      const remainM = o.active ? Math.floor((o.remaining % 3600000) / 60000) : 0;
      return `<div class="adm-list-item">
        <div class="adm-list-emoji">${o.active ? '🔥' : '⏸️'}</div>
        <div class="adm-list-info">
          <div class="adm-list-name">${o.label} — ${product ? product.name.substring(0,30) : 'Produit #'+o.productId}</div>
          <div class="adm-list-meta">${o.active
            ? `⏱ Expire dans ${remainH}h ${remainM}m`
            : 'Inactive — durée : ' + o.durationH + 'h'}</div>
        </div>
        <div style="display:flex;gap:6px">
          ${!o.active
            ? `<button class="adm-push-send" style="background:#059669" onclick="ZoomOffers.adminStart('${o.id}');ZoomAdmin.refresh()"><i class="fas fa-play"></i> Lancer</button>`
            : `<button class="adm-push-send" style="background:#dc2626" onclick="ZoomOffers.adminStop('${o.id}');ZoomAdmin.refresh()"><i class="fas fa-stop"></i> Arrêter</button>`}
        </div>
      </div>`;
    }).join('') || '<div class="adm-list-empty">Aucune offre configurée.</div>';
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    if(checkSession()){
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display   = 'grid';
      trackTodayVisit();
      initDashboard();
    }
    // Focus auto sur le champ password
    setTimeout(() => {
      const inp = document.getElementById('loginInput');
      if(inp && !checkSession()) inp.focus();
    }, 200);
  }

  return { init, login, logout, togglePwd, showSection, toggleSidebar, refresh, resetStats };

})();

document.addEventListener('DOMContentLoaded', () => ZoomAdmin.init());

// Patch cart tracking : enregistrer les ajouts au panier
document.addEventListener('zoom:cart:add', () => {
  try {
    const n = (JSON.parse(localStorage.getItem('zoom_cart_events')) || 0) + 1;
    localStorage.setItem('zoom_cart_events', JSON.stringify(n));
  } catch(e){}
});
