// ===========================
// ZOOM TECHNOLOGIE — PRODUCTS.JS
// imgs: tableau de 1 à 4 chemins d'images (null = emoji affiché)
// img: (ancien format) converti automatiquement en imgs[0]
// ===========================

const PRODUCTS = [
  // ===== ORDINATEURS =====
  {
    id: 1, cat: "ordinateur", badge: "new",
    imgs: ["images/17.jpg", "images/17b.jpg", "images/17c.jpg", "images/17d.jpg"],
    icon: "💻",
    name: "Acer Aspire 16 AI Copilot",
    desc: "16\" WUXGA 120Hz Multi-Touch Display | 16GB LPDDR5X | 512GB PCIe Gen 4 SSD | Wi-Fi 7 | A16-11MT-X669",
    price: "195 000 FCFA", oldPrice: "220 000 FCFA"
  },
  {
    id: 2, cat: "ordinateur", badge: "promo",
    imgs: ["images/16.jpg", "images/16b.jpg", "images/16c.jpg", "images/16d.jpg"],
    icon: "💻",
    name: "Lenovo Business Laptop with Copilot AI",
    desc: "Intel 13th Gen i5-13420H • 16GB DDR5 • 512GB SSD • 16\" FHD • Microsoft 365 • WiFi 6 • Windows 11",
    price: "150 000 FCFA", oldPrice: "175 000 FCFA"
  },
  {
    id: 3, cat: "ordinateur", badge: "promo",
    imgs: ["images/18.jpg", null, null, null],
    icon: "💻",
    name: "Lenovo IdeaPad Slim 3X - 2025 - Everyday AI Laptop - Copilot",
    desc: "15.3\" WUXGA Display - 16 GB Memory - 512 GB Storage - Snapdragon® X - Luna Grey",
    price: "165 000 FCFA", oldPrice: "250 000 FCFA"
  },
  {
    id: 4, cat: "accessoire", badge: "promo",
    imgs: ["images/19.jpg", null, null, null],
    icon: "🔌",
    name: "Cat6 Ethernet Cable 1 ft (10 Pack)",
    desc: "10G Network Patch Cable for Data Centers, Home and Enterprise Networks – Blue",
    price: "12 000 FCFA", oldPrice: "20 500 FCFA"
  },
  {
    id: 5, cat: "ecran", badge: "promo",
    imgs: ["images/20.jpg", null, null, null],
    icon: "🖥️",
    name: "A2337 Screen Replacement – 13 inches MacBook",
    desc: "2560x1600 Replacement LCD Full Assembly for EMC 3598 MGN63 Space Grey",
    price: "15 000 FCFA", oldPrice: "35 000 FCFA"
  },
  {
    id: 6, cat: "ordinateur", badge: "",
    imgs: ["images/6.jpg", null, null, null],
    icon: "💻",
    name: "Laptop ASUS VivoBook – Ryzen 5",
    desc: "15.6\" FHD, 8Go RAM, 512Go SSD, écran anti-reflets.",
    price: "220 000 FCFA", oldPrice: null
  },

  // ===== SMARTPHONES & ACCESSOIRES =====
  {
    id: 7, cat: "accessoire", badge: "promo",
    imgs: ["images/22.jpg", null, null, null],
    icon: "🔌",
    name: "VJYUIJAY Universal 65W USB C Laptop Charger",
    desc: "Compatible with HP chromebook Lenovo Dell Acer Asus Samsung Google Computer Type C Power AC Adapter",
    price: "15 000 FCFA", oldPrice: "25 000 FCFA"
  },
  {
    id: 8, cat: "accessoire", badge: "promo",
    imgs: ["images/21.jpg", null, null, null],
    icon: "🖥️",
    name: "Screen Replacement A4532 LCD – 13 inches HP, LENOVO",
    desc: "2560x1600 Replacement LCD Full Assembly for EMC 3598 MGN63 Space Grey",
    price: "18 000 FCFA", oldPrice: "30 000 FCFA"
  },
  {
    id: 9, cat: "accessoire", badge: "promo",
    imgs: ["images/23.jpg", null, null, null],
    icon: "🔋",
    name: "Fancy Buying New B21N1329 Laptop Battery",
    desc: "Asus X403 X403M X403MA X503M X502CA X453 X453M X453MA X553 X553M X553MA - 7.6V 30Wh",
    price: "9 000 FCFA", oldPrice: "15 000 FCFA"
  },
  {
    id: 10, cat: "smartphone", badge: "new",
    imgs: [null, null, null, null],
    icon: "📱",
    name: "Tecno Spark 20 Pro+",
    desc: "6.78\" FHD+, 8Go RAM, 256Go, caméra 108MP, batterie 5000mAh.",
    price: "85 000 FCFA", oldPrice: null
  },
  {
    id: 11, cat: "smartphone", badge: "promo",
    imgs: [null, null, null, null],
    icon: "📱",
    name: "Samsung Galaxy S23 FE",
    desc: "6.4\" Dynamic AMOLED, Snapdragon 8 Gen1, 8Go+128Go, 50MP.",
    price: "280 000 FCFA", oldPrice: "320 000 FCFA"
  },
  {
    id: 12, cat: "smartphone", badge: "",
    imgs: [null, null, null, null],
    icon: "📱",
    name: "itel P55+ – Entrée de gamme",
    desc: "6.6\", 4Go RAM, 128Go, double SIM, batterie 6000mAh.",
    price: "42 000 FCFA", oldPrice: null
  },

  // ===== ACCESSOIRES =====
  {
    id: 13, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "🎧",
    name: "Casque Bluetooth Sony WH-1000XM5",
    desc: "Réduction de bruit active, 30h d'autonomie, son Hi-Res Audio.",
    price: "95 000 FCFA", oldPrice: null
  },
  {
    id: 14, cat: "accessoire", badge: "promo",
    imgs: [null, null, null, null],
    icon: "🖱️",
    name: "Souris Sans Fil Logitech MX Master 3",
    desc: "Ergonomique, 4000 DPI, rechargeable USB-C, compatible multi-OS.",
    price: "45 000 FCFA", oldPrice: "55 000 FCFA"
  },
  {
    id: 15, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "⌨️",
    name: "Clavier Mécanique RGB Gaming",
    desc: "Switches bleus, rétroéclairage RGB, USB, compatible PC et Mac.",
    price: "28 000 FCFA", oldPrice: null
  },
  {
    id: 16, cat: "accessoire", badge: "new",
    imgs: [null, null, null, null],
    icon: "🎧",
    name: "Écouteurs TWS – Réduction de bruit",
    desc: "Bluetooth 5.3, ANC, 6h + boitier 24h, IPX5, charge rapide.",
    price: "18 000 FCFA", oldPrice: null
  },
  {
    id: 17, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "🖨️",
    name: "Imprimante HP LaserJet M140w",
    desc: "Laser monochrome, WiFi, recto-verso, compatible smartphone.",
    price: "85 000 FCFA", oldPrice: null
  },
  {
    id: 18, cat: "accessoire", badge: "promo",
    imgs: [null, null, null, null],
    icon: "📷",
    name: "Webcam Full HD 1080p – Microphone intégré",
    desc: "Autofocus, micro antibruit, compatible Zoom/Teams/Meet.",
    price: "14 000 FCFA", oldPrice: "18 000 FCFA"
  },
  {
    id: 19, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "🔌",
    name: "Hub USB-C 7-en-1",
    desc: "HDMI 4K, USB 3.0 x3, SD/microSD, USB-C PD 100W.",
    price: "12 000 FCFA", oldPrice: null
  },
  {
    id: 20, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "🖱️",
    name: "Tapis de souris XXL Gaming",
    desc: "900x400mm, surface lisse, base anti-dérapante, bord cousu.",
    price: "5 000 FCFA", oldPrice: null
  },

  // ===== RÉSEAU =====
  {
    id: 21, cat: "reseau", badge: "new",
    imgs: [null, null, null, null],
    icon: "📡",
    name: "Routeur WiFi 6 TP-Link AX3000",
    desc: "Dual band, 3000Mbps, 4 antennes, idéal maison & PME.",
    price: "55 000 FCFA", oldPrice: null
  },
  {
    id: 22, cat: "reseau", badge: "",
    imgs: [null, null, null, null],
    icon: "📡",
    name: "Routeur 4G LTE Huawei B315",
    desc: "WiFi 300Mbps, port LAN x4, compatible toutes SIM MTN/Orange CM.",
    price: "68 000 FCFA", oldPrice: null
  },
  {
    id: 23, cat: "reseau", badge: "promo",
    imgs: [null, null, null, null],
    icon: "🔁",
    name: "Switch Ethernet 8 Ports Gigabit",
    desc: "TP-Link, 10/100/1000Mbps, plug & play, idéal réseau d'entreprise.",
    price: "18 000 FCFA", oldPrice: "24 000 FCFA"
  },
  {
    id: 24, cat: "reseau", badge: "",
    imgs: [null, null, null, null],
    icon: "📡",
    name: "Point d'accès WiFi PoE – Outdoor",
    desc: "Pour extérieur, portée 300m, IP65, parfait cyber & hôtel.",
    price: "35 000 FCFA", oldPrice: null
  },
  {
    id: 25, cat: "reseau", badge: "",
    imgs: [null, null, null, null],
    icon: "🔌",
    name: "Câble RJ45 Cat6 – 20m",
    desc: "Cat6 blindé, 1Gbps, idéal installation réseau bureau.",
    price: "4 500 FCFA", oldPrice: null
  },

  // ===== ÉCRANS =====
  {
    id: 26, cat: "ecran", badge: "new",
    imgs: [null, null, null, null],
    icon: "🖥️",
    name: "Écran LED 24\" Full HD – LG",
    desc: "1920x1080, IPS, 75Hz, HDMI+VGA, eye-care, sans bordure.",
    price: "85 000 FCFA", oldPrice: null
  },
  {
    id: 27, cat: "ecran", badge: "promo",
    imgs: [null, null, null, null],
    icon: "🖥️",
    name: "Écran Gaming 27\" 144Hz – Samsung",
    desc: "QHD 2560x1440, 1ms, FreeSync, HDMI+DisplayPort, RGB.",
    price: "145 000 FCFA", oldPrice: "175 000 FCFA"
  },
  {
    id: 28, cat: "ecran", badge: "",
    imgs: [null, null, null, null],
    icon: "🖥️",
    name: "Écran 22\" HD – Acer (Reconditionné)",
    desc: "1080p, VGA+HDMI, bon état, garantie 3 mois. Idéal petit budget.",
    price: "48 000 FCFA", oldPrice: null
  },
  {
    id: 29, cat: "ecran", badge: "new",
    imgs: [null, null, null, null],
    icon: "📺",
    name: "Vidéoprojecteur 4K – WiFi & Bluetooth",
    desc: "3000 lumens, 300\" max, Android intégré, HDMI+USB.",
    price: "185 000 FCFA", oldPrice: null
  },

  // ===== STOCKAGE =====
  {
    id: 30, cat: "stockage", badge: "",
    imgs: [null, null, null, null],
    icon: "💾",
    name: "SSD Interne 512Go – Samsung 870 EVO",
    desc: "Format 2.5\", SATA III, lecture 560Mo/s, parfait upgrade PC.",
    price: "35 000 FCFA", oldPrice: null
  },
  {
    id: 31, cat: "stockage", badge: "promo",
    imgs: [null, null, null, null],
    icon: "💾",
    name: "Disque Dur Externe 1To – Seagate",
    desc: "USB 3.0, portable, plug & play, compatible PC/Mac/TV.",
    price: "28 000 FCFA", oldPrice: "35 000 FCFA"
  },
  {
    id: 32, cat: "stockage", badge: "",
    imgs: [null, null, null, null],
    icon: "🔑",
    name: "Clé USB 3.0 – 64Go SanDisk Ultra",
    desc: "Lecture 130Mo/s, robuste, compacte, garantie 5 ans.",
    price: "5 500 FCFA", oldPrice: null
  },
  {
    id: 33, cat: "stockage", badge: "new",
    imgs: [null, null, null, null],
    icon: "💾",
    name: "SSD NVMe M.2 1To – Kingston",
    desc: "PCIe 3.0, lecture 3500Mo/s, pour PC portable et desktop.",
    price: "55 000 FCFA", oldPrice: null
  },
  {
    id: 34, cat: "stockage", badge: "",
    imgs: [null, null, null, null],
    icon: "📦",
    name: "NAS Synology 2 baies – DS223",
    desc: "Stockage réseau, 2 baies, compatible RAID, accès distant.",
    price: "120 000 FCFA", oldPrice: null
  },

  // ===== ÉNERGIE =====
  {
    id: 35, cat: "energie", badge: "new",
    imgs: [null, null, null, null],
    icon: "⚡",
    name: "Onduleur 1000VA – APC Back-UPS",
    desc: "Protection PC contre coupure, 600W, 6 prises, écran LCD.",
    price: "75 000 FCFA", oldPrice: null
  },
  {
    id: 36, cat: "energie", badge: "promo",
    imgs: [null, null, null, null],
    icon: "🔋",
    name: "Powerbank 20 000mAh – Charge Rapide 22W",
    desc: "USB-C PD, 2 USB-A, charge 3 appareils simultanément.",
    price: "16 000 FCFA", oldPrice: "22 000 FCFA"
  },
  {
    id: 37, cat: "energie", badge: "",
    imgs: [null, null, null, null],
    icon: "☀️",
    name: "Panneau Solaire 100W + Contrôleur",
    desc: "Kit solaire mono, pour alimentation bureau hors réseau.",
    price: "85 000 FCFA", oldPrice: null
  },
  {
    id: 38, cat: "energie", badge: "new",
    imgs: [null, null, null, null],
    icon: "⚡",
    name: "Multiprise Parafoudre – 6 prises + USB",
    desc: "Protection contre surtension, 3 USB 2.4A, câble 3m.",
    price: "8 500 FCFA", oldPrice: null
  },
  {
    id: 39, cat: "energie", badge: "",
    imgs: [null, null, null, null],
    icon: "🔌",
    name: "Onduleur 2000VA – Cyberpower",
    desc: "Pour serveurs et équipements réseau, LCD, USB management.",
    price: "145 000 FCFA", oldPrice: null
  },
  {
    id: 40, cat: "accessoire", badge: "",
    imgs: [null, null, null, null],
    icon: "🖨️",
    name: "Imprimante Canon PIXMA – Multifonction",
    desc: "Jet d'encre couleur, scanner, copie, WiFi, recto-verso auto.",
    price: "65 000 FCFA", oldPrice: null
  },
 {
    id: 41, cat: "accessoire", badge: "",
    imgs: ["images/24.jpg", "images/24a.jpg", "images/24.jpg", "images/24c.jpg"],
    icon: "🖨️",
    name: "Boitier Disque dur SSD - M.2 SSD Enclosure 3.1",
    desc: "Jet d'encre couleur, scanner, copie, WiFi, recto-verso auto.",
    price: "8 000 FCFA", oldPrice: "8 000 FCFA"
  }, 
];
