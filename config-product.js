/* ============================================================
   CONFIGURACIÓN DEL PRODUCTO — Limpiador de Parabrisas (ClaraVista)
   Editá SOLO este archivo para cambiar precio, textos e imágenes.
   ============================================================ */
const PRODUCT_CONFIG = {
  id: "limpiador-parabrisas",
  origin: "landing_limpiador_parabrisas",
  category: "Automotriz",
  brand: "VG Shop",
  name: "Limpiador de Parabrisas Potente",
  shortName: "Limpiador de Parabrisas",
  logo: "images/logo.png",

  // Precios (en guaraníes, sin puntos)
  price: 119000,
  oldPrice: 199000,
  currency: "PYG",
  metaPixelId: "2412226475899711",
  whatsapp: "595972738779",            // Contacto WhatsApp VG Shop

  // Imágenes — reemplazá estos archivos por tus fotos reales (mismo nombre) en la carpeta images/
  images: {
    hero: "images/producto-hero.jpg",
    antesDespues: "images/antes-despues.jpg",
    beneficios: "images/beneficios.jpg",
    // Galería — la imagen del producto va primero, luego las fotos reales
    gallery: [
      "images/producto-hero.jpg",
      "images/real1.jpg",
      "images/real2.jpg",
      "images/real3.jpg"
    ]
  },

  // Backend (Supabase compartido con las demás landings)
  supabaseUrl: "https://roruinqorwgolcrhhmpm.supabase.co",
  supabaseAnonKey: "sb_publishable_aRPb1yNunMEheat00BxwtQ_Uft732KJ",
  supabaseTable: "pedidos_web",

  // ====== PANEL DE FUNCIONES (activá/desactivá sin tocar el código) ======
  // También editable en vivo con ?config=1 o Ctrl+Shift+C
  features: {
    announcementBar: true,   // Barra superior con mensajes rotativos
    stockCounter: true,      // "Quedan X unidades"
    stockDecay: true,        // El stock baja solo con el tiempo (visual)
    liveViewers: true,       // "X personas viendo ahora"
    recentPurchases: true,   // Notificaciones de compras recientes
    offerProgress: true,     // Barra "Oferta del día — 82% reclamado"
    countdown: true,         // Contador "la oferta termina en…"
    stickyMobileBar: true,   // Barra fija de compra en mobile
    floatingBenefits: true,  // Tarjetas de beneficios al hacer scroll
    backToTop: true          // Botón "volver arriba"
  },

  // Parámetros de urgencia / prueba social
  urgency: {
    stockStart: 18,          // Unidades iniciales mostradas
    stockMin: 5,             // No baja de este número
    viewersMin: 9,
    viewersMax: 22,
    offerClaimedStart: 78    // % inicial de la barra "reclamado"
  }
};

// Ciudades de Paraguay para autocompletar y prueba social
const PY_CITIES = [
  "Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá",
  "Lambaré", "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación",
  "Mariano Roque Alonso", "Pedro Juan Caballero", "Villa Elisa", "Itauguá",
  "Caaguazú", "Coronel Oviedo", "Presidente Franco", "Villarrica",
  "Hernandarias", "San Antonio", "Concepción", "Pilar", "Caacupé",
  "Areguá", "Paraguarí", "Villa Hayes", "Itá", "Guarambaré"
];

/* ============================================================
   ZONAS DE ENTREGA
   local    → Asunción y Central: pago CONTRA ENTREGA + delivery
   interior → resto del país: transportadora + PAGO ANTICIPADO
   Para mover una ciudad de zona, simplemente cambiala de lista.
   ============================================================ */
const CITY_ZONES = {
  local: {
    label: "Asunción y Central · Pago contra entrega",
    cities: [
      "Asunción", "San Lorenzo", "Fernando de la Mora", "Luque", "Lambaré",
      "Capiatá", "Ñemby", "Villa Elisa", "Mariano Roque Alonso", "Limpio",
      "Areguá", "Ypané", "Itauguá", "San Antonio", "Guarambaré", "Itá",
      "Otra ciudad de Central"
    ]
  },
  interior: {
    label: "Interior del país · Envío por transportadora",
    cities: [
      "Ciudad del Este", "Presidente Franco", "Hernandarias", "Encarnación",
      "Coronel Oviedo", "Caaguazú", "Villarrica", "Pedro Juan Caballero",
      "Concepción", "Pilar", "Caacupé", "Paraguarí", "Villa Hayes",
      "Otra ciudad del interior"
    ]
  }
};

// Opciones que piden escribir la ciudad a mano
const CITY_OTHER_OPTIONS = ["Otra ciudad de Central", "Otra ciudad del interior"];

// Exponer en window (const no se adjunta a window por sí solo)
window.PRODUCT_CONFIG = PRODUCT_CONFIG;
window.PY_CITIES = PY_CITIES;
window.CITY_ZONES = CITY_ZONES;
window.CITY_OTHER_OPTIONS = CITY_OTHER_OPTIONS;
