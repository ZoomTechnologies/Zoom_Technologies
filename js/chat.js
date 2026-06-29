/* ===========================
   ZOOM TECHNOLOGIE — CHAT.JS
   Bot de chat en direct
   =========================== */

const ZoomChat = (function(){

  // ════════════════════════════
  // CONFIGURATION
  // ════════════════════════════
  const CONFIG = {
    shopName   : 'ZOOM Technologie',
    agentName  : 'Assistant ZOOM',
    agentIcon  : '🤖',
    waNumber   : '237697557365',
    messenger  : 'https://m.me/tem.larissa',
    // Horaires d'ouverture (0=Dim,1=Lun,...,6=Sam)
    openDays   : [1,2,3,4,5,6],   // Lun–Sam
    openHour   : 8,
    closeHour  : 18,
    typingDelay: 950,              // ms avant réponse du bot
  };

  // ════════════════════════════
  // ARBRE DE RÉPONSES DU BOT
  // ════════════════════════════
  const FLOWS = {
    // Message d'accueil initial
    welcome: {
      text: `Bonjour 👋 Je suis l'assistant de <strong>${CONFIG.shopName}</strong>.<br>Comment puis-je vous aider ?`,
      quick: ['🛍️ Voir les produits','💰 Prix & devis','📦 Commande & livraison','🕐 Horaires','📞 Parler à un agent'],
    },

    // Réponses par mot-clé
    rules: [
      {
        keys: ['produit','catalogue','voir','article','ordinateur','laptop','smartphone','accessoire','imprimante'],
        text: '😊 Notre catalogue est directement sur cette page ! Faites défiler vers le bas ou utilisez la barre de recherche pour trouver votre produit.',
        quick: ['💰 Demander un prix','📦 Comment commander ?','📞 Parler à un agent'],
      },
      {
        keys: ['prix','combien','tarif','devis','coût','cout','promotion','promo','remise'],
        text: '💰 Les prix sont affichés sur chaque produit du catalogue. Pour un devis personnalisé ou une commande en gros, contactez-nous directement.',
        quick: ['📦 Commander maintenant','🛒 Voir le catalogue','📞 Parler à un agent'],
      },
      {
        keys: ['commande','commander','acheter','achat','passer','panier'],
        text: '🛒 Pour commander :\n1. Cliquez sur un produit\n2. Ajoutez-le au panier 🛒\n3. Envoyez votre commande via WhatsApp ou Messenger.',
        quick: ['📦 Livraison ?','💰 Prix & devis','📞 Parler à un agent'],
      },
      {
        keys: ['livraison','livrer','expédition','expedition','délai','delai','envoyer','transport'],
        text: '🚚 Nous livrons à Douala et dans tout le Cameroun. Les délais varient selon votre zone. Contactez-nous pour un devis livraison précis.',
        quick: ['💰 Demander un devis','📞 Parler à un agent'],
      },
      {
        keys: ['horaire','heure','ouvert','ferme','fermé','disponible','quand'],
        text: '🕐 Nous sommes ouverts <strong>Lundi – Samedi, 8h00 – 18h00</strong>.<br>📍 Adresse : Douala-Bar Akwa, Douala, Cameroun.',
        quick: ['📞 Contacter maintenant','🛍️ Voir les produits'],
      },
      {
        keys: ['agent','humain','personne','conseiller','vendeur','contact','joindre','parler','appeler'],
        text: '👨‍💼 Bien sûr ! Choisissez votre canal préféré pour parler directement à notre équipe :',
        quick: [],
        action: 'showContacts',
      },
      {
        keys: ['bonjour','bonsoir','salut','hello','hi','bjr','bsr'],
        text: 'Bonjour ! 😊 Ravi de vous accueillir chez <strong>ZOOM Technologie</strong>. Comment puis-je vous aider aujourd\'hui ?',
        quick: ['🛍️ Voir les produits','💰 Prix & devis','📞 Parler à un agent'],
      },
      {
        keys: ['merci','ok','bien','super','parfait','d\'accord'],
        text: 'Avec plaisir ! 😊 N\'hésitez pas si vous avez d\'autres questions. Bonne visite sur ZOOM Technologie !',
        quick: ['🛍️ Voir les produits','📞 Parler à un agent'],
      },
      {
        keys: ['wifi','reseau','réseau','routeur','tp-link','huawei'],
        text: '📶 Nous proposons des équipements réseau : routeurs Wi-Fi, switches, câbles, bornes d\'accès. Consultez notre catalogue pour les modèles disponibles.',
        quick: ['💰 Demander un prix','📞 Parler à un agent'],
      },
      {
        keys: ['garantie','sav','panne','réparation','reparation','service'],
        text: '🛡️ Nos produits sont vendus avec garantie constructeur. Pour toute question SAV, contactez-nous directement sur WhatsApp.',
        quick: ['📞 Contacter WhatsApp','📞 Parler à un agent'],
      },
    ],

    // Message hors horaires
    offHours: {
      text: `😴 Nous sommes actuellement <strong>fermés</strong>.<br>Nos horaires : <strong>Lundi–Samedi, 8h–18h</strong>.<br><br>Laissez-nous un message WhatsApp, nous vous répondrons dès l'ouverture ! 📱`,
      action: 'showWA',
    },

    // Réponse par défaut
    fallback: {
      text: 'Je ne suis pas sûr de comprendre 🤔 Voici ce que je peux faire pour vous :',
      quick: ['🛍️ Voir les produits','💰 Prix & devis','📦 Commande & livraison','📞 Parler à un agent'],
    },
  };

  // ════════════════════════════
  // ÉTAT
  // ════════════════════════════
  let isOpen      = false;
  let msgCount    = 0;   // messages non lus (badge)
  let greeted     = false;
  let typingTimer = null;

  // ════════════════════════════
  // UTILITAIRES
  // ════════════════════════════
  function isOpenNow(){
    // ── Fuseau horaire forcé sur Douala (UTC+1, sans changement d'heure) ──
    // new Date().getHours() utilise l'heure du visiteur, pas celle de Douala.
    // Intl.DateTimeFormat garantit l'heure locale de la boutique.
    const now = new Date();
    const tz  = 'Africa/Douala';

    // Jour de la semaine : 'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'short'
    }).format(now);
    const dayMap = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    const day = dayMap[dayName] ?? -1;

    // Heure locale Douala : ex "09" → 9
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', hour12: false
    }).format(now);
    const hour = parseInt(hourStr, 10);

    return CONFIG.openDays.includes(day)
        && hour >= CONFIG.openHour
        && hour <  CONFIG.closeHour;
  }

  function nowTime(){
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Africa/Douala',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date());
  }

  function el(id){ return document.getElementById(id); }

  // ════════════════════════════
  // INJECTION HTML
  // ════════════════════════════
  function buildHTML(){
    const online = isOpenNow();
    const statusLabel = online ? 'En ligne · Répond en quelques minutes' : 'Hors ligne · Répond à l\'ouverture';
    const dotClass = online ? '' : 'offline';
    const hoursText = `🕐 Horaires : Lun–Sam  8h00 – 18h00  ·  📍 Bar Akwa, Douala`;

    document.body.insertAdjacentHTML('beforeend', `
      <!-- ── CHAT WIDGET ZOOM TECHNOLOGIE ── -->
      <div id="zt-chat-bubble" onclick="ZoomChat.toggle()" title="Chat avec nous">
        <i class="fas fa-comment-dots"></i>
        <div id="zt-chat-badge"></div>
      </div>

      <div id="zt-chat-window">

        <!-- Header -->
        <div class="zt-chat-header">
          <div class="zt-chat-avatar">💻</div>
          <div class="zt-chat-header-info">
            <div class="zt-chat-header-name">${CONFIG.shopName}</div>
            <div class="zt-chat-header-status">
              <div class="zt-status-dot ${dotClass}"></div>
              ${statusLabel}
            </div>
          </div>
          <button class="zt-chat-close" onclick="ZoomChat.toggle()"><i class="fas fa-times"></i></button>
        </div>

        <!-- Bandeau horaires -->
        <div class="zt-hours-bar">
          <i class="fas fa-clock"></i> ${hoursText}
        </div>

        <!-- Messages -->
        <div class="zt-chat-messages" id="zt-messages"></div>

        <!-- Réponses rapides -->
        <div class="zt-quick-replies" id="zt-quick-replies"></div>

        <!-- Input -->
        <div class="zt-chat-input">
          <input type="text" id="zt-input" placeholder="Écrivez votre message…"
            onkeydown="if(event.key==='Enter')ZoomChat.sendUser()">
          <button class="zt-send-btn" id="zt-send" onclick="ZoomChat.sendUser()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>

      </div>
    `);
  }

  // ════════════════════════════
  // AFFICHER / MASQUER
  // ════════════════════════════
  function toggle(){
    isOpen = !isOpen;
    const win = el('zt-chat-window');
    const bubble = el('zt-chat-bubble');

    if(isOpen){
      win.classList.add('open');
      // Effacer le badge
      el('zt-chat-badge').style.display = 'none';
      msgCount = 0;
      // Changer icône bulle
      bubble.querySelector('i').className = 'fas fa-times';
      // Premier message d'accueil
      if(!greeted){
        greeted = true;
        setTimeout(() => greetUser(), 400);
      }
      // Focus input
      setTimeout(()=>{ el('zt-input').focus(); }, 350);
    } else {
      win.classList.remove('open');
      bubble.querySelector('i').className = 'fas fa-comment-dots';
    }
  }

  // ════════════════════════════
  // MESSAGE D'ACCUEIL
  // ════════════════════════════
  function greetUser(){
    if(isOpenNow()){
      showTyping();
      setTimeout(()=>{
        removeTyping();
        addBotMsg(FLOWS.welcome.text);
        setQuickReplies(FLOWS.welcome.quick);
      }, CONFIG.typingDelay);
    } else {
      showTyping();
      setTimeout(()=>{
        removeTyping();
        addBotMsg(FLOWS.offHours.text);
        doAction('showWA');
        setQuickReplies([]);
      }, CONFIG.typingDelay);
    }
  }

  // ════════════════════════════
  // ENVOYER (utilisateur)
  // ════════════════════════════
  function sendUser(){
    const input = el('zt-input');
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    setQuickReplies([]);
    addUserMsg(text);
    setTimeout(()=> processMessage(text), 300);
  }

  function sendQuick(text){
    setQuickReplies([]);
    addUserMsg(text);
    setTimeout(()=> processMessage(text), 300);
  }

  // ════════════════════════════
  // TRAITEMENT DU MESSAGE
  // ════════════════════════════
  function processMessage(text){
    // Hors horaires → redirection WA directement
    if(!isOpenNow()){
      showTyping();
      setTimeout(()=>{
        removeTyping();
        addBotMsg(FLOWS.offHours.text);
        doAction('showWA');
      }, CONFIG.typingDelay);
      return;
    }

    const lower = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,''); // suppr accents pour match

    // Cherche une règle correspondante
    const match = FLOWS.rules.find(r => r.keys.some(k => lower.includes(k)));

    showTyping();
    setTimeout(()=>{
      removeTyping();
      if(match){
        addBotMsg(match.text);
        if(match.action) doAction(match.action);
        if(match.quick && match.quick.length) setQuickReplies(match.quick);
      } else {
        addBotMsg(FLOWS.fallback.text);
        setQuickReplies(FLOWS.fallback.quick);
      }
    }, CONFIG.typingDelay + Math.random()*300);
  }

  // ════════════════════════════
  // ACTIONS SPÉCIALES
  // ════════════════════════════
  function doAction(action){
    if(action === 'showWA'){
      const msgs = el('zt-messages');
      const btn = document.createElement('div');
      btn.style.cssText = 'width:100%;animation:msgSlideIn .22s ease';
      btn.innerHTML = `
        <button class="zt-wa-redirect"
          onclick="window.open('https://wa.me/${CONFIG.waNumber}?text=Bonjour+ZOOM+Technologie+!','_blank')">
          <i class="fab fa-whatsapp"></i> Contacter sur WhatsApp
        </button>`;
      msgs.appendChild(btn);
      scrollBottom();
    }
    if(action === 'showContacts'){
      const msgs = el('zt-messages');
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;flex-direction:column;gap:6px;width:100%;animation:msgSlideIn .22s ease';
      div.innerHTML = `
        <button class="zt-wa-redirect"
          onclick="window.open('https://wa.me/${CONFIG.waNumber}?text=Bonjour+ZOOM+Technologie+!','_blank')">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
        <button class="zt-wa-redirect" style="background:#0084FF"
          onclick="window.open('${CONFIG.messenger}','_blank')">
          <i class="fab fa-facebook-messenger"></i> Messenger
        </button>`;
      msgs.appendChild(div);
      scrollBottom();
    }
  }

  // ════════════════════════════
  // HELPERS UI
  // ════════════════════════════
  function addBotMsg(html){
    const msgs = el('zt-messages');
    const row = document.createElement('div');
    row.className = 'zt-msg';
    row.innerHTML = `
      <div class="zt-msg-avatar"><i class="fas fa-robot"></i></div>
      <div>
        <div class="zt-msg-bubble">${html}</div>
        <div class="zt-msg-time">${nowTime()}</div>
      </div>`;
    msgs.appendChild(row);
    scrollBottom();
    // Badge si fenêtre fermée
    if(!isOpen){ showBadge(); }
  }

  function addUserMsg(text){
    const msgs = el('zt-messages');
    const row = document.createElement('div');
    row.className = 'zt-msg user';
    row.innerHTML = `
      <div>
        <div class="zt-msg-bubble">${escapeHtml(text)}</div>
        <div class="zt-msg-time">${nowTime()}</div>
      </div>`;
    msgs.appendChild(row);
    scrollBottom();
  }

  function showTyping(){
    const msgs = el('zt-messages');
    const row = document.createElement('div');
    row.className = 'zt-msg zt-typing';
    row.id = 'zt-typing-indicator';
    row.innerHTML = `
      <div class="zt-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="zt-msg-bubble">
        <div class="zt-typing-dot"></div>
        <div class="zt-typing-dot"></div>
        <div class="zt-typing-dot"></div>
      </div>`;
    msgs.appendChild(row);
    scrollBottom();
  }

  function removeTyping(){
    const t = el('zt-typing-indicator');
    if(t) t.remove();
  }

  function setQuickReplies(arr){
    const qr = el('zt-quick-replies');
    qr.innerHTML = arr.map(label =>
      `<button class="zt-quick-btn" onclick="ZoomChat.sendQuick('${label.replace(/'/g,"\\'")}')">
         ${label}
       </button>`
    ).join('');
  }

  function scrollBottom(){
    const msgs = el('zt-messages');
    setTimeout(()=>{ msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  function showBadge(){
    msgCount++;
    const badge = el('zt-chat-badge');
    badge.style.display = 'flex';
    badge.textContent = msgCount > 9 ? '9+' : msgCount;
  }

  function escapeHtml(str){
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    buildHTML();
    // Afficher le badge après 4s pour attirer l'attention
    setTimeout(()=>{
      if(!isOpen && !greeted){ showBadge(); }
    }, 4000);
  }

  return { init, toggle, sendUser, sendQuick };

})();

document.addEventListener('DOMContentLoaded', () => ZoomChat.init());
