/* ===========================
   ZOOM TECHNOLOGIE — I18N.JS
   Sélecteur de langue FR / EN
   Mémorisation cookie + traduction complète
   =========================== */

const ZoomI18n = (function(){

  const COOKIE_KEY = 'zoom_lang';
  const DAYS_365   = 365 * 24 * 60 * 60 * 1000;

  // ════════════════════════════
  // DICTIONNAIRE COMPLET
  // ════════════════════════════
  const DICT = {

    fr: {
      // ── Topbar
      topbar_address  : 'Douala-Bar Akwa, Douala, Cameroun',
      topbar_phone    : '+237 697557365',
      topbar_hours    : 'Lun–Sam : 8h–18h',
      topbar_delivery : 'Livraison rapide Douala & Cameroun',

      // ── Header / Nav
      nav_home        : 'Accueil',
      nav_flash       : 'Ventes Flash',
      nav_catalogue   : 'Catalogue',
      nav_gros        : 'Vente en Gros',
      nav_apropos     : 'À Propos',
      nav_localisation: 'Localisation',
      nav_contact     : 'Contact',
      search_placeholder : 'Rechercher un produit, une marque...',
      search_btn      : 'Rechercher',

      // ── Hero
      hero_badge      : '🇨🇳 Importé directement de Chine · Meilleurs prix garantis',
      hero_subtitle   : 'Ordinateurs · Maintenance · Smartphones · Accessoires · Équipements NTIC<br/>Vente en gros & en détail — Douala-Bar Akwa, Douala',
      hero_search_ph  : 'Que cherchez-vous ? Ex : laptop HP, clé USB, routeur…',
      hero_stat1_val  : '500+', hero_stat1_lbl: 'Produits',
      hero_stat2_val  : 'Gros', hero_stat2_lbl: '& Détail',
      hero_stat3_val  : 'Import', hero_stat3_lbl: 'Chine directe',
      hero_stat4_val  : 'Livraison', hero_stat4_lbl: 'Cameroun',

      // ── Slides hero
      slide1_title:'L\'ultra-Tech à votre portée', slide1_hl:'à Douala',
      slide2_title:'Accessoires Tech', slide2_hl:'dernière génération',
      slide3_title:'Laptops', slide3_hl:'dernière génération',
      slide4_title:'Casques & écouteurs', slide4_hl:'de toutes marques',
      slide5_title:'Tablette, iPad, PC Ultra-Slim', slide5_hl:'dernière génération',
      slide6_title:'Accessoires', slide6_hl:'à prix imbattables',
      slide7_title:'Clavier, souris, Hub USB', slide7_hl:'& adaptateurs',
      slide8_title:'Chargeurs, câbles USB', slide8_hl:'& supports pour PC portable',
      slide9_title:'Housses, sacoches', slide9_hl:'& sacs à dos pour PC',
      slide10_title:'Clés USB, cartes mémoire', slide10_hl:'& stockage externe',
      slide11_title:'Webcams, micros, multiprises', slide11_hl:'& accessoires d\'alimentation',
      slide12_title:'Antivols & filtres de confidentialité', slide12_hl:'pour laptop',
      slide13_title:'Afficheurs, claviers', slide13_hl:'& batteries pour laptop',
      slide14_title:'Accessoires de capture', slide14_hl:'& cinématographique',
      slide15_title:'Équipements réseaux toutes marques', slide15_hl:'Câbles, Switch, Routeur',

      // ── Catégories
      cat_title       : 'Parcourir par catégorie',
      cat_ordinateur  : 'Ordinateurs',
      cat_smartphone  : 'Smartphones',
      cat_accessoire  : 'Accessoires',
      cat_reseau      : 'Réseau & WiFi',
      cat_ecran       : 'Écrans',
      cat_stockage    : 'Stockage',
      cat_energie     : 'Énergie',
      cat_tout        : 'Tout voir',

      // ── Ventes Flash
      flash_title     : 'Ventes Flash',
      flash_see_all   : 'Voir tout',
      flash_stock     : '🔥 Stock limité',
      flash_add_cart  : 'Ajouter au panier',

      // ── Catalogue
      catalogue_title : 'Notre Catalogue',
      catalogue_sub   : 'Découvrez tous nos équipements informatiques disponibles en boutique à Douala',
      sort_label      : 'Trier :',
      sort_default    : 'Par défaut',
      sort_price_asc  : 'Prix croissant',
      sort_price_desc : 'Prix décroissant',
      sort_promo      : 'Promotions d\'abord',
      sort_new        : 'Nouveautés d\'abord',
      filter_price    : 'Prix',
      filter_brand    : 'Marque',
      filter_status   : 'Statut',
      filter_all_prices : 'Tous les prix',
      filter_all_brands : 'Toutes les marques',
      filter_all      : 'Tous',
      filter_promo    : '🔥 En promotion',
      filter_new      : '🆕 Nouveautés',
      filter_popular  : '⭐ Populaires',
      filter_reset    : 'Effacer',
      no_results      : 'Aucun produit trouvé.<br/>Contactez-nous pour une commande personnalisée.',
      no_results_btn  : 'Contacter sur WhatsApp',
      add_cart        : 'Ajouter au panier',
      delivery_badge  : 'Livraison Douala & Cameroun',
      discuss_label   : 'Discuter',
      btn_wa          : 'WhatsApp',
      btn_ms          : 'Messenger',
      btn_share       : 'Partager',

      // ── Modal
      modal_in_stock  : 'En stock — Disponible en boutique',
      modal_delivery  : 'Livraison rapide à Douala & tout le Cameroun',
      modal_specs     : 'Caractéristiques principales',
      modal_discuss   : 'Discuter & commander',
      modal_similar   : 'Produits similaires',
      modal_economy   : 'Vous économisez',
      modal_add_cart  : 'Ajouter au panier',
      modal_badge_gros: 'Vente en gros dispo',

      // ── Vente en Gros
      gros_eyebrow    : 'Commerce B2B',
      gros_title      : 'Vente en Gros disponible',
      gros_desc       : 'Vous êtes revendeur, entreprise ou institution ? ZOOM Technologie vous propose des tarifs préférentiels sur les commandes en volume, avec des équipements importés directement de Chine.',
      gros_av1        : 'Prix grossiste négociables',
      gros_av2        : 'Commandes personnalisées selon vos besoins',
      gros_av3        : 'Importation directe depuis la Chine',
      gros_av4        : 'Livraison dans tout le Cameroun',
      gros_av5        : 'Devis gratuit sous 24h',
      gros_btn        : 'Demander un devis gratuit',
      gros_c1_lbl     : 'Ordinateurs', gros_c1_sub : 'dès 10 unités',
      gros_c2_lbl     : 'Smartphones', gros_c2_sub : 'dès 5 unités',
      gros_c3_lbl     : 'Accessoires', gros_c3_sub : 'dès 20 unités',
      gros_c4_lbl     : 'Réseau',      gros_c4_sub : 'dès 5 unités',

      // ── À propos
      apropos_title   : 'À Propos de ZOOM Technologie',
      apropos_p1      : 'ZOOM Technologie est votre boutique de référence en équipements informatiques et NTIC à Douala. Installée au cœur de <strong>Douala-Bar Akwa</strong>, nous proposons une large gamme de produits technologiques à des prix compétitifs.',
      apropos_p2      : 'Grâce à nos <strong>partenariats directs avec des fournisseurs en Chine</strong>, nous vous garantissons des équipements de qualité aux meilleurs tarifs du marché camerounais, aussi bien pour les particuliers que pour les entreprises.',
      val1_title      : 'Qualité garantie',    val1_txt : 'Produits testés et vérifiés avant vente',
      val2_title      : 'Meilleurs prix',      val2_txt : 'Import direct Chine = économies maximales',
      val3_title      : 'SAV réactif',         val3_txt : 'Support client disponible 7j/7 sur WhatsApp',
      val4_title      : 'Livraison Cameroun',  val4_txt : 'Expédition dans toutes les villes du pays',

      // ── Localisation
      loc_title       : 'Nous Trouver',
      loc_sub         : 'Douala-Bar Akwa, Douala, Cameroun',
      contact_address : 'Adresse',
      contact_addr_val: 'Douala-Bar Akwa, Douala<br/>Cameroun',
      contact_wa_lbl  : 'WhatsApp',
      contact_ms_lbl  : 'Messenger',
      contact_hours_lbl:'Horaires',
      contact_hours_val:'Lun – Sam : 8h00 – 18h00',

      // ── CTA Contact
      cta_title       : 'Passez votre commande facilement',
      cta_sub         : 'Contactez-nous sur WhatsApp ou Messenger pour toute commande, devis ou renseignement. Réponse rapide garantie !',

      // ── Footer
      footer_desc     : 'Votre boutique informatique de confiance à Douala. Ordinateurs, smartphones, accessoires et équipements NTIC importés directement de Chine.',
      footer_cat      : 'Catégories',
      footer_info     : 'Informations',
      footer_contact  : 'Contact rapide',
      footer_about    : 'À propos',
      footer_wholesale: 'Vente en gros',
      footer_flash    : 'Ventes Flash',
      footer_store    : 'Notre boutique',
      footer_loc_val  : 'Douala-Bar Akwa, Douala, Cameroun',
      footer_hours    : 'Lun – Sam : 8h – 18h',
      footer_copy     : '© 2025 ZOOM Technologie. Tous droits réservés. — Douala-Bar Akwa, Douala, Cameroun',
      footer_cookies  : 'Paramètres cookies',
      footer_laptop   : 'Ordinateurs portables',
      footer_access   : 'Accessoires',
      footer_network  : 'Réseau & WiFi',
      footer_screen   : 'Écrans & Moniteurs',
      footer_power    : 'Énergie & Onduleurs',
    },

    en: {
      // ── Topbar
      topbar_address  : 'Douala-Bar Akwa, Douala, Cameroon',
      topbar_phone    : '+237 697557365',
      topbar_hours    : 'Mon–Sat: 8am–6pm',
      topbar_delivery : 'Fast delivery across Douala & Cameroon',

      // ── Header / Nav
      nav_home        : 'Home',
      nav_flash       : 'Flash Sales',
      nav_catalogue   : 'Catalogue',
      nav_gros        : 'Wholesale',
      nav_apropos     : 'About Us',
      nav_localisation: 'Location',
      nav_contact     : 'Contact',
      search_placeholder : 'Search for a product, brand...',
      search_btn      : 'Search',

      // ── Hero
      hero_badge      : '🇨🇳 Imported directly from China · Best prices guaranteed',
      hero_subtitle   : 'Computers · Maintenance · Smartphones · Accessories · NTIC Equipment<br/>Wholesale & Retail — Douala-Bar Akwa, Douala',
      hero_search_ph  : 'What are you looking for? e.g. HP laptop, USB drive, router…',
      hero_stat1_val  : '500+', hero_stat1_lbl: 'Products',
      hero_stat2_val  : 'Wholesale', hero_stat2_lbl: '& Retail',
      hero_stat3_val  : 'Import', hero_stat3_lbl: 'Direct China',
      hero_stat4_val  : 'Delivery', hero_stat4_lbl: 'Cameroon',

      // ── Slides hero
      slide1_title:'Ultra-Tech at your fingertips', slide1_hl:'in Douala',
      slide2_title:'Tech Accessories', slide2_hl:'latest generation',
      slide3_title:'Laptops', slide3_hl:'latest generation',
      slide4_title:'Headsets & earphones', slide4_hl:'all brands',
      slide5_title:'Tablets, iPad, Ultra-Slim PC', slide5_hl:'latest generation',
      slide6_title:'Accessories', slide6_hl:'at unbeatable prices',
      slide7_title:'Keyboard, mouse, USB Hub', slide7_hl:'& adapters',
      slide8_title:'Chargers, USB cables', slide8_hl:'& laptop stands',
      slide9_title:'Sleeves, bags', slide9_hl:'& backpacks for PC',
      slide10_title:'USB drives, memory cards', slide10_hl:'& external storage',
      slide11_title:'Webcams, mics, power strips', slide11_hl:'& power accessories',
      slide12_title:'Locks & privacy screens', slide12_hl:'for laptops',
      slide13_title:'Displays, keyboards', slide13_hl:'& laptop batteries',
      slide14_title:'Capture accessories', slide14_hl:'& cinematographic gear',
      slide15_title:'Network equipment all brands', slide15_hl:'Cables, Switch, Router',

      // ── Catégories
      cat_title       : 'Browse by category',
      cat_ordinateur  : 'Computers',
      cat_smartphone  : 'Smartphones',
      cat_accessoire  : 'Accessories',
      cat_reseau      : 'Network & WiFi',
      cat_ecran       : 'Screens',
      cat_stockage    : 'Storage',
      cat_energie     : 'Power',
      cat_tout        : 'View all',

      // ── Ventes Flash
      flash_title     : 'Flash Sales',
      flash_see_all   : 'View all',
      flash_stock     : '🔥 Limited stock',
      flash_add_cart  : 'Add to cart',

      // ── Catalogue
      catalogue_title : 'Our Catalogue',
      catalogue_sub   : 'Discover all our IT equipment available in-store in Douala',
      sort_label      : 'Sort:',
      sort_default    : 'Default',
      sort_price_asc  : 'Price: low to high',
      sort_price_desc : 'Price: high to low',
      sort_promo      : 'Deals first',
      sort_new        : 'New arrivals first',
      filter_price    : 'Price',
      filter_brand    : 'Brand',
      filter_status   : 'Status',
      filter_all_prices : 'All prices',
      filter_all_brands : 'All brands',
      filter_all      : 'All',
      filter_promo    : '🔥 On sale',
      filter_new      : '🆕 New arrivals',
      filter_popular  : '⭐ Popular',
      filter_reset    : 'Clear',
      no_results      : 'No products found.<br/>Contact us for a custom order.',
      no_results_btn  : 'Contact on WhatsApp',
      add_cart        : 'Add to cart',
      delivery_badge  : 'Delivery Douala & Cameroon',
      discuss_label   : 'Discuss',
      btn_wa          : 'WhatsApp',
      btn_ms          : 'Messenger',
      btn_share       : 'Share',

      // ── Modal
      modal_in_stock  : 'In stock — Available in store',
      modal_delivery  : 'Fast delivery in Douala & all of Cameroon',
      modal_specs     : 'Key specifications',
      modal_discuss   : 'Discuss & order',
      modal_similar   : 'Similar products',
      modal_economy   : 'You save',
      modal_add_cart  : 'Add to cart',
      modal_badge_gros: 'Wholesale available',

      // ── Vente en Gros
      gros_eyebrow    : 'B2B Commerce',
      gros_title      : 'Wholesale available',
      gros_desc       : 'Are you a reseller, company or institution? ZOOM Technologie offers preferential rates on volume orders, with equipment imported directly from China.',
      gros_av1        : 'Negotiable wholesale prices',
      gros_av2        : 'Custom orders tailored to your needs',
      gros_av3        : 'Direct importation from China',
      gros_av4        : 'Delivery throughout Cameroon',
      gros_av5        : 'Free quote within 24h',
      gros_btn        : 'Request a free quote',
      gros_c1_lbl     : 'Computers',   gros_c1_sub : 'from 10 units',
      gros_c2_lbl     : 'Smartphones', gros_c2_sub : 'from 5 units',
      gros_c3_lbl     : 'Accessories', gros_c3_sub : 'from 20 units',
      gros_c4_lbl     : 'Network',     gros_c4_sub : 'from 5 units',

      // ── À propos
      apropos_title   : 'About ZOOM Technologie',
      apropos_p1      : 'ZOOM Technologie is your go-to store for IT and NTIC equipment in Douala. Located in the heart of <strong>Douala-Bar Akwa</strong>, we offer a wide range of tech products at competitive prices.',
      apropos_p2      : 'Thanks to our <strong>direct partnerships with suppliers in China</strong>, we guarantee quality equipment at the best prices on the Cameroonian market, for both individuals and businesses.',
      val1_title      : 'Quality guaranteed', val1_txt : 'Products tested and verified before sale',
      val2_title      : 'Best prices',        val2_txt : 'Direct import China = maximum savings',
      val3_title      : 'Responsive support', val3_txt : 'Customer support available 7/7 on WhatsApp',
      val4_title      : 'Delivery Cameroon',  val4_txt : 'Shipping to all cities in the country',

      // ── Localisation
      loc_title       : 'Find Us',
      loc_sub         : 'Douala-Bar Akwa, Douala, Cameroon',
      contact_address : 'Address',
      contact_addr_val: 'Douala-Bar Akwa, Douala<br/>Cameroon',
      contact_wa_lbl  : 'WhatsApp',
      contact_ms_lbl  : 'Messenger',
      contact_hours_lbl:'Opening hours',
      contact_hours_val:'Mon – Sat: 8:00am – 6:00pm',

      // ── CTA Contact
      cta_title       : 'Place your order easily',
      cta_sub         : 'Contact us on WhatsApp or Messenger for any order, quote or enquiry. Fast response guaranteed!',

      // ── Footer
      footer_desc     : 'Your trusted IT store in Douala. Computers, smartphones, accessories and NTIC equipment imported directly from China.',
      footer_cat      : 'Categories',
      footer_info     : 'Information',
      footer_contact  : 'Quick contact',
      footer_about    : 'About us',
      footer_wholesale: 'Wholesale',
      footer_flash    : 'Flash Sales',
      footer_store    : 'Our store',
      footer_loc_val  : 'Douala-Bar Akwa, Douala, Cameroon',
      footer_hours    : 'Mon – Sat: 8am – 6pm',
      footer_copy     : '© 2025 ZOOM Technologie. All rights reserved. — Douala-Bar Akwa, Douala, Cameroon',
      footer_cookies  : 'Cookie settings',
      footer_laptop   : 'Laptops',
      footer_access   : 'Accessories',
      footer_network  : 'Network & WiFi',
      footer_screen   : 'Screens & Monitors',
      footer_power    : 'Power & UPS',
    },
  };

  // ════════════════════════════
  // ÉTAT
  // ════════════════════════════
  let currentLang = 'fr';

  // ════════════════════════════
  // COOKIE
  // ════════════════════════════
  function saveLang(lang){
    const d = new Date(Date.now() + DAYS_365);
    document.cookie = `${COOKIE_KEY}=${lang};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }
  function loadLang(){
    const m = document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith(COOKIE_KEY+'='));
    return m ? m.split('=')[1] : null;
  }

  // ════════════════════════════
  // TRADUCTEUR
  // ════════════════════════════
  function t(key){ return DICT[currentLang][key] || DICT['fr'][key] || key; }

  function applyAll(){
    // Tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if(val){
        // Champs input : placeholder
        if(el.tagName === 'INPUT' && el.type !== 'button'){
          el.placeholder = val;
        }
        // Option select
        else if(el.tagName === 'OPTION'){
          el.textContent = val;
        }
        // Tout le reste
        else {
          el.innerHTML = val;
        }
      }
    });

    // Slides hero (data-title / data-highlight)
    document.querySelectorAll('.hero-slide').forEach((slide, i) => {
      const n = i + 1;
      const titleKey = `slide${n}_title`;
      const hlKey    = `slide${n}_hl`;
      if(DICT[currentLang][titleKey]) slide.dataset.title     = t(titleKey);
      if(DICT[currentLang][hlKey])    slide.dataset.highlight = t(hlKey);
    });

    // Mettre à jour <html lang="">
    document.documentElement.lang = currentLang;

    // Mettre à jour le sélecteur visuel
    updateSelector();

    // Notifier app.js pour retradure les textes dynamiques
    document.dispatchEvent(new CustomEvent('zoom:langchange', { detail: { lang: currentLang } }));
  }

  // ════════════════════════════
  // SÉLECTEUR HTML
  // ════════════════════════════
  function buildSelector(){
    const wrap = document.createElement('div');
    wrap.id = 'zt-lang-selector';
    wrap.innerHTML = `
      <button class="zt-lang-btn ${currentLang==='fr'?'active':''}" onclick="ZoomI18n.setLang('fr')" title="Français">
        <span class="zt-lang-flag">🇫🇷</span>
      </button>
      <div class="zt-lang-sep"></div>
      <button class="zt-lang-btn ${currentLang==='en'?'active':''}" onclick="ZoomI18n.setLang('en')" title="English">
        <span class="zt-lang-flag">🇬🇧</span>
      </button>`;

    const actions = document.querySelector('.header-actions');
    const cartBtn  = document.querySelector('.cart-header-btn');
    if(actions && cartBtn) actions.insertBefore(wrap, cartBtn);
    else if(actions) actions.prepend(wrap);
  }

  function updateSelector(){
    document.querySelectorAll('.zt-lang-btn').forEach(btn => {
      const lang = btn.getAttribute('onclick').includes("'fr'") ? 'fr' : 'en';
      btn.classList.toggle('active', lang === currentLang);
    });
  }

  // ════════════════════════════
  // CHANGER DE LANGUE
  // ════════════════════════════
  function setLang(lang){
    if(!DICT[lang]) return;
    currentLang = lang;
    saveLang(lang);
    applyAll();
  }

  function getLang(){ return currentLang; }

  // ════════════════════════════
  // INIT
  // ════════════════════════════
  function init(){
    const saved = loadLang();
    currentLang = (saved && DICT[saved]) ? saved : 'fr';
    buildSelector();
    applyAll();
  }

  return { init, setLang, getLang, t, applyAll };

})();

document.addEventListener('DOMContentLoaded', () => ZoomI18n.init());
