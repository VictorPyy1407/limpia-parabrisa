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
  price: 140000,
  oldPrice: 199000,
  currency: "PYG",
  metaPixelId: "2412226475899711",

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

// Exponer en window (const no se adjunta a window por sí solo)
window.PRODUCT_CONFIG = PRODUCT_CONFIG;
window.PY_CITIES = PY_CITIES;
