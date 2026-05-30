import type { SiteContent } from "@/lib/site-content/types";

const IMG = {
  homeHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ6B72dtx69VaC6nS2TffgBNQw63_RNdYJIsfym5-Rjj1p42-xkwMzWd5WlSygtQxdmMeEbu9mHk68YLgfX1K6qOUG0UeYsxbWbVFVVZddSV7mns1hFyGtG-XxZ8yF_dMQaYCoj-s4GyTAsVEc4K3Tvn1_5RQzFXTjUVow4SLA0VlMCDAIApBF1IqVz3pCewwpUvqzywko1fjlnTV6_xOaoF-V3Iwwtc3qqB8uU0xNkK6kXkNODfI2PUIu7rtDJ8X2KO0Qs9XPiQ",
  beach:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD2mrCNHLm92LxkC22dS9fOjVqeIDFI3MAUStYJc-XuouBbkEGyMvuv7_eEKZa8qp7uKlVG2aSQ3gEOVBeSpJ74dVv113T0AjP9XgGPYrhjsjdTXU6s0igcwsdplryr0LFn0K_rHqktHyu0M4kE4dAmFeN7fQI4cRnzsXBE9fEGnh_LIAYk7Z1RT-YYmZRjgsA_z9SIhBMwLszcnR1y7nWHvAgRn07hkt9or8cI678jcQaEUri3ktbQZ9LRBmaTw1xEJ970T6SS_w",
  aboutHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCpWt9hXp92Vh_WU3xK4jMeCco-lqA59em3Pw9VYIzpH70cYB8voOp4Ce07zSnWhEZInLypop3yNZhyjcuO6XBjN87TYIgtlILroBST-1XRH_ymVnSH17jU9GPkIaen8viYaZ_Nmtz2CVD9MOkrhyjnpbaPRqSLPOA7epF-KNXKX40ep543ch9CyUdYLuRk_uFiNPts6z0DYZVn1Pk1TnNhOQqrxr2h0NkLKCtWrjcTFFfwTU93oCVN1s0XQ4e5MmPtfyI1L2xuPA",
  contactMap:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOO1H9de2jdr14vXD2EJU2L52XVX7mSHAcf54dKxjE62bzYmK79H7Y1RgqN7oFO55N4HcEMbQR2l-lCSDL8gv-iFcVDpGa3CqYm0QtrQQBUfBUt3ye3KWMWBOa8VQAKNjyy9Uyom1Ja3M4eGeTi6jQMSgyvlNZg5Ocn2PvpqVQp19HtRQ_ocBJnQ-CsPmxXOX4Q-x8oiUMUuz0WSm4x34lgVUKJzklzlmcsKmoI0x_lPCLSHwgQck5bTsQczyApaj8on2EAmOOw",
  logo:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBO5oDoomgBvwXYC2De_83fFELiB5C_XRgqL_mDl_2YzZTr9CfCZAtUbdpLZbprSLYJGPG8c_vqcF4DUZNPuKQPhOmK7MjAZUM7S_Skr9UUFJ27HylfEI3764dQ-AMf5VGewZ_iSQYG6kivmdRdrjlWzotqGVNjNxgN9TIOMFX3sJ-kkATVc0P_Tn66hd4bpdjKm8cytKfNI4SDGlvNyyMCyQ2gtA0QzElXVkvIcK1Qt6VXR61vKWtbIHZxMQo9Z3mqu6FLTkhVHg",
};

export const defaultSiteContent: SiteContent = {
  brand: {
    name: "HI TRAVEL",
    logoUrl: IMG.logo,
    navCtaLabel: "Reserva ahora",
  },
  contact: {
    phone: "+57 (300) 123-4567",
    email: "hello@hitravel.com",
    whatsappUrl: "https://wa.me/573001234567",
    address: "123 Coastal Drive, Ocean Plaza",
    addressLine2: "Santa Marta, Colombia",
    mapImageUrl: IMG.contactMap,
  },
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },
  footer: {
    homeDescription:
      "© 2024 HI TRAVEL. Todos los derechos reservados. La aventura te espera. Tu agencia de confianza para descubrir los rincones más bellos del Caribe.",
    homeCopyright: "© 2024 HI TRAVEL. Todos los derechos reservados.",
    toursDescription: "Curadores de viajes enfocados en ofrecer experiencias seguras e inolvidables en el Caribe.",
    detailDescription: "Tu puerta de entrada a los destinos más exclusivos del Caribe. Curamos recuerdos, una ola a la vez.",
    contactCopyright: "© 2024 HI TRAVEL. Todos los derechos reservados. La aventura te espera.",
    locationLabel: "Cartagena, Colombia",
  },
  home: {
    heroImageUrl: IMG.homeHero,
    heroTitle: "Tu próxima aventura comienza aquí",
    heroSubtitle:
      "Descubre destinos paradisíacos y experiencias inolvidables con nuestros tours curados profesionalmente.",
    featuredBadge: "Explora el Mundo",
    featuredTitle: "Tours Destacados",
    featuredLinkLabel: "Ver todos los tours",
    dayTripsImageUrl: IMG.beach,
    dayTripsBadge: "Todo Incluido",
    dayTripsTitle: "Pasadías Populares: Relájate y Disfruta",
    dayTripsDescription:
      "Nuestros planes de día están diseñados para quienes buscan una escapada rápida sin preocupaciones. Transporte, almuerzo y acceso a las mejores playas del Caribe.",
    dayTripsHighlight1Title: "Pasadía en Punta Arena",
    dayTripsHighlight1Text: "Aguas cristalinas y la mejor atención de la zona.",
    dayTripsHighlight2Title: "Atardecer en Playa Blanca",
    dayTripsHighlight2Text: "Disfruta del mejor atardecer con un cóctel de bienvenida.",
    dayTripsCardTitle: "Cupos Limitados",
    dayTripsCardSubtitle: "Reserva hoy",
    dayTripsCtaLabel: "Explorar Pasadías",
    whyTitle: "Por qué elegir HI TRAVEL",
    whySubtitle: "Combinamos la pasión por el detalle con la seguridad de una agencia profesional.",
    whyGuidesTitle: "Guías Certificados y Expertos",
    whyGuidesText:
      "No solo te llevamos al lugar, te contamos su historia. Nuestros guías son locales apasionados que garantizan una experiencia auténtica y educativa.",
    whySafetyTitle: "Seguridad 100%",
    whySafetyText:
      "Pólizas de seguro incluidas en todos nuestros recorridos para tu total tranquilidad.",
    whyWhatsappTitle: "Soporte 24/7 vía WhatsApp",
    whyWhatsappText:
      "¿Tienes dudas durante tu viaje? Nuestro equipo está listo para ayudarte en cualquier momento del día.",
    whyFlexibleTitle: "Reservas Flexibles",
    whyFlexibleText:
      "Cambia tu fecha o cancela con 24h de antelación sin cargos adicionales. Entendemos que los planes pueden cambiar.",
  },
  toursPage: {
    title: "Descubre tu próxima aventura",
    subtitle: "Desde las aguas cristalinas de Barú hasta los senderos de Tayrona, explora el Caribe como nunca antes.",
    emptyWithToursTitle: "No encontramos tours para ese destino",
    emptyWithToursText: "Prueba con otro destino o revisa la lista completa.",
    emptyCatalogTitle: "Aún no hay experiencias publicadas",
    emptyCatalogText: "Crea y activa pasadías o paquetes en Admin → Tours (marca «Publicado (activo)»).",
  },
  about: {
    heroImageUrl: IMG.aboutHero,
    heroBadge: "Sobre nosotros",
    heroTitle: "Creamos experiencias memorables en el Caribe colombiano",
    heroSubtitle:
      "En HI TRAVEL combinamos curaduría visual, operación confiable y atención cercana para convertir un tour en una experiencia que quieras repetir y recomendar.",
    storyBadge: "Nuestra historia",
    storyTitle: "Nacimos para vender el Caribe con más intención",
    storyParagraph1:
      "HI TRAVEL surge de una idea simple: los viajeros no solo compran un traslado o una entrada, compran la confianza de que el plan estará bien armado, se verá bien y se sentirá aún mejor cuando lo vivan.",
    storyParagraph2:
      "Por eso construimos una marca enfocada en claridad, hospitalidad y selección cuidadosa de experiencias en Cartagena, Barú, Rosario y Tayrona. Queremos que cada interacción, desde la primera visita al sitio hasta el regreso del tour, transmita seguridad y deseo de viajar.",
    stats: [
      { value: "4.9/5", label: "calificación promedio" },
      { value: "+1.200", label: "viajeros atendidos" },
      { value: "24/7", label: "soporte por WhatsApp" },
    ],
    valuesTitle: "Lo que nos define",
    valuesSubtitle:
      "Cada decisión de producto, diseño y operación está pensada para que el viaje se sienta claro, premium y cercano.",
    values: [
      {
        title: "Curaduría con detalle",
        description:
          "Diseñamos experiencias que equilibran estética, operación confiable y momentos memorables para cada tipo de viajero.",
      },
      {
        title: "Acompañamiento humano",
        description:
          "Nuestro equipo asesora antes, durante y después de la reserva para que el viaje se sienta claro y seguro.",
      },
      {
        title: "Aliados locales",
        description:
          "Trabajamos con operadores y anfitriones del Caribe colombiano para ofrecer experiencias más auténticas y consistentes.",
      },
    ],
    missionLabel: "Misión",
    missionText:
      "Diseñar y comercializar tours y pasadías con una experiencia de marca sólida, atención humana y ejecución confiable en cada detalle.",
    visionLabel: "Visión",
    visionText:
      "Convertirnos en una referencia regional para viajeros que buscan una forma más clara, estética y segura de descubrir el Caribe colombiano.",
    ctaEyebrow: "Viaja con nosotros",
    ctaTitle: "Listos para ayudarte a planear tu próxima salida",
    ctaText:
      "Si quieres cotizar un plan, resolver dudas o armar una experiencia personalizada, nuestro equipo está listo para acompañarte.",
    ctaPrimaryLabel: "Ver tours",
    ctaSecondaryLabel: "Hablar con un asesor",
  },
  contactPage: {
    heroImageUrl: IMG.aboutHero,
    heroTitle: "Planeemos tu próxima aventura",
    heroSubtitle:
      "¿Tienes preguntas sobre nuestros tours o quieres un itinerario personalizado? Nuestros asesores están listos para ayudarte a crear la escapada costera perfecta.",
    formTitle: "Envíanos un mensaje",
    officeTitle: "Ubicación de la oficina",
    socialEyebrow: "Sigue nuestro viaje",
  },
  searchCountries: ["Colombia", "Panamá", "México", "República Dominicana", "Costa Rica"],
  pricing: {
    usdCopRate: 3500,
    copCountryCodes: ["CO"],
  },
};
