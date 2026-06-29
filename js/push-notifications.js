/* ===========================
   ZOOM TECHNOLOGIE — PUSH-NOTIFICATIONS.JS
   Notifications Push Web
   Fonctionne via Service Worker + Notification API
   (mode local — sans serveur VAPID)
   =========================== */

const ZoomPush = (function(){

  const LS_KEY      = 'zoom_push_prefs';
  const LS_SCHEDULE = 'zoom_push_schedule';

  // ─── Catalogue de notifications prédéfinies ───
  const NOTIFICATIONS = [
    {
      id: 'welcome',
      title: '⚡ Bienvenue chez ZOOM Technologie !',
      body:  'Découvrez nos offres du jour — Ventes Flash, nouveautés, promotions.',
      icon:  'icons/icon-192x192.svg',
      badge: 'icons/icon-96x96.svg',
      tag:   'welcome',
      data:  { url: '/#catalogue' },
      delay: 5000,     // 5s après optin
    },
    {
      id: 'flash',
      title: '🔥 Ventes Flash — Offres limitées !',
      body:  'Les meilleures promos du moment se terminent ce soir. Profitez-en !',
      icon:  'icons/icon-192x192.svg',
      badge: 'icons/icon-96x96.svg',
      tag:   'flash-sale',
      data:  { url: '/#flash' },
    },
    {
      id: 'promo',
      title: '💰 Nouvelles promotions disponibles',
      body:  'Des réductions jusqu\'à -40% sur laptops, accessoires et équipements réseau.',
      icon:  'icons/icon-192x192.svg',
      badge: 'icons/icon-96x96.svg',
      tag:   'promo',
      data:  { url: '/#catalogue' },
    },
    {
      id: 'arrival',
      title: '📦 Nouvel arrivage en boutique !',
      body:  'De nouveaux équipements viennent d\'arriver — Smartphones, Laptops, Accessoires.',
      icon:  'icons/icon-192x192.svg',
      badge: 'icons/icon-96x96.svg',
      tag:   'arrival',
      data:  { url: '/#catalogue' },
    },
    {
      id: 'gros',
      title: '🏢 Offre spéciale Vente en Gros',
      body:  'Devis gratuit sous 24h pour toute commande en volume. Tarifs préférentiels !',
      icon:  'icons/icon-192x192.svg',
      badge: 'icons/icon-96x96.svg',
      tag:   'wholesale',
      data:  { url: '/#gros' },
    },
  ];

  // ════════════════════════════
  // PERMISSION & ABONNEMENT
  // ════════════════════════════
  function getPermission(){ return Notification.permission; }
  function isSupported(){ return 'Notification' in window && 'serviceWorker' in navigator; }
  function isGranted()  { return getPermission() === 'granted'; }

  function getPrefs(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function savePrefs(p){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(p)); }catch(e){}
  }

  // ─── Demander la permission ───
  async function requestPermission(){
    if(!isSupported()) return 'unsupported';
    if(isGranted()) return 'granted';
    try {
      const result = await Notification.requestPermission();
      if(result === 'granted'){
        savePrefs({ granted: true, ts: Date.now() });
        // Envoyer la notif de bienvenue
        scheduleNotification('welcome', NOTIFICATIONS[0].delay || 5000);
        return 'granted';
      }
      return result;
    } catch(e){ return 'denied'; }
  }

  // ─── Envoyer une notification via SW ou direct ───
  function send(notif){
    if(!isGranted()) return;
    if(navigator.serviceWorker.controller){
      // Via Service Worker (fonctionne en background)
      navigator.serviceWorker.controller.postMessage({
        type:  'SHOW_NOTIFICATION',
        notif: notif,
      });
    } else {
      // Fallback direct (tab active uniquement)
      new Notification(notif.title, {
        body:    notif.body,
        icon:    notif.icon,
        badge:   notif.badge,
        tag:     notif.tag || 'zoom',
        data:    notif.data,
        vibrate: [200, 100, 200],
      });
    }
  }

  function scheduleNotification(id, delayMs){
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if(!notif || !isGranted()) return;
    setTimeout(() => send(notif), delayMs || 0);
  }

  // ─── Planification auto des notifications ───
  function scheduleAuto(){
    if(!isGranted()) return;
    const prefs = getPrefs();
    if(!prefs.granted) return;

    const now   = Date.now();
    const sched = (() => { try{ return JSON.parse(localStorage.getItem(LS_SCHEDULE)) || {}; }catch(e){ return {}; } })();

    // Flash : tous les jours à 18h (ou 5min après optin si premier jour)
    const flashKey = 'last_flash';
    const oneDayMs = 24*60*60*1000;
    if(!sched[flashKey] || now - sched[flashKey] > oneDayMs){
      const delay = 5 * 60 * 1000; // 5 minutes après ouverture
      scheduleNotification('flash', delay);
      sched[flashKey] = now;
    }

    // Promo : tous les 3 jours
    const promoKey = 'last_promo';
    if(!sched[promoKey] || now - sched[promoKey] > 3*oneDayMs){
      scheduleNotification('promo', 10 * 60 * 1000); // 10 min
      sched[promoKey] = now;
    }

    try{ localStorage.setItem(LS_SCHEDULE, JSON.stringify(sched)); }catch(e){}
  }

  // ─── Envoyer une notif manuelle (depuis l'admin) ───
  function sendManual(id){
    const notif = NOTIFICATIONS.find(n => n.id === id);
    if(!notif){ console.warn('[Push] Notification inconnue :', id); return false; }
    if(!isGranted()){
      requestPermission().then(r => { if(r === 'granted') send(notif); });
      return false;
    }
    send(notif);
    return true;
  }

  // ════════════════════════════
  // WIDGET OPTIN (bannière)
  // ════════════════════════════
  function buildOptinBanner(){
    if(!isSupported()) return;
    if(isGranted()) return;       // déjà accordé
    if(getPermission() === 'denied') return; // refusé définitivement
    const prefs = getPrefs();
    if(prefs.dismissed) return;   // déjà refusé par l'user

    const el = document.createElement('div');
    el.id = 'zt-push-optin';
    el.innerHTML = `
      <div class="zt-optin-inner">
        <div class="zt-optin-icon">🔔</div>
        <div class="zt-optin-text">
          <strong>Restez informé(e) !</strong>
          <span>Recevez nos promos, arrivages et ventes flash en temps réel.</span>
        </div>
        <button class="zt-optin-yes" onclick="ZoomPush.optin()">Activer</button>
        <button class="zt-optin-no"  onclick="ZoomPush.dismissOptin()">✕</button>
      </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 200);
  }

  async function optin(){
    const banner = document.getElementById('zt-push-optin');
    if(banner) banner.classList.remove('visible');
    const result = await requestPermission();
    if(banner) setTimeout(() => banner.remove(), 400);
    if(result === 'granted'){
      scheduleAuto();
      showOptinConfirm();
    }
  }

  function dismissOptin(){
    const banner = document.getElementById('zt-push-optin');
    if(banner){ banner.classList.remove('visible'); setTimeout(() => banner.remove(), 400); }
    const prefs = getPrefs();
    prefs.dismissed = true;
    savePrefs(prefs);
  }

  function showOptinConfirm(){
    const t = document.createElement('div');
    t.className = 'zt-push-confirm';
    t.innerHTML = `<i class="fas fa-check-circle"></i> Notifications activées ! Vous recevrez nos meilleures offres.`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 100);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 400); }, 4000);
  }

  // ════════════════════════════
  // PANNEAU ADMIN NOTIFS
  // ════════════════════════════
  function buildAdminPanel(){
    return `
      <div class="adm-push-panel">
        <div class="adm-push-status">
          <div class="adm-push-status-dot ${isGranted()?'on':'off'}"></div>
          <span>${isGranted() ? 'Notifications activées sur cet appareil' : 'Notifications non activées'}</span>
          ${!isGranted() ? `<button class="adm-push-enable" onclick="ZoomPush.optin()">Activer</button>` : ''}
        </div>
        <div class="adm-push-list">
          ${NOTIFICATIONS.map(n => `
            <div class="adm-push-item">
              <div class="adm-push-item-info">
                <div class="adm-push-item-title">${n.title}</div>
                <div class="adm-push-item-body">${n.body}</div>
              </div>
              <button class="adm-push-send" onclick="ZoomPush.sendManual('${n.id}')">
                <i class="fas fa-paper-plane"></i> Envoyer
              </button>
            </div>`).join('')}
        </div>
      </div>`;
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    if(!isSupported()) return;
    // Afficher la bannière optin après 8 secondes
    setTimeout(buildOptinBanner, 8000);
    // Si déjà accordé, planifier les notifs auto
    if(isGranted()) scheduleAuto();
  }

  return {
    init, requestPermission, optin, dismissOptin,
    sendManual, isGranted, isSupported,
    getPermission, buildAdminPanel, NOTIFICATIONS,
  };

})();

document.addEventListener('DOMContentLoaded', () => ZoomPush.init());
