export type TourStop = {
  time: string;
  title: string;
  description: string;
  featured?: boolean;
};

export type Tour = {
  slug: string;
  name: string;
  category: string;
  badge?: string;
  country: string;
  description: string;
  longDescription: string[];
  price: number;
  rating: number;
  reviews: number;
  duration: string;
  groupSize: string;
  languages: string;
  location: string;
  heroImage: string;
  gallery: string[];
  includes: string[];
  excludes: string[];
  itinerary: TourStop[];
};

export const navigationLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tours", label: "Tours" },
  { href: "/nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export const tours: Tour[] = [
  {
    slug: "rosario-vip",
    name: "Islas del Rosario: Experiencia Elite en Beach Club",
    category: "Pasadía VIP",
    badge: "Destacado",
    country: "Colombia",
    description:
      "Escapa del ritmo de Cartagena y sumérgete en las aguas cristalinas de las Islas del Rosario.",
    longDescription: [
      "Escapa del ritmo de Cartagena y sumérgete en las aguas cristalinas de las Islas del Rosario. Nuestro pasadía VIP está diseñado para quienes buscan un equilibrio entre aventura tropical y comodidad de alto nivel. Viaja con estilo en nuestra flota premium hacia un beach club exclusivo donde la arena es blanca, los cócteles están fríos y el servicio marca la diferencia.",
      "Ya sea que quieras hacer snorkel entre arrecifes coralinos o simplemente descansar en una cama balinesa frente al horizonte del Caribe, este plan todo incluido ofrece el refugio perfecto.",
    ],
    price: 120,
    rating: 4.9,
    reviews: 128,
    duration: "8 horas",
    groupSize: "Máx. 15",
    languages: "ES / EN",
    location: "Cartagena, Colombia",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBulXF4F-edw9gRu9Sdq7WXDV6bRucsihRtX4RAR-7PMpunXy5CySeLUk3tJFMWOTVClDCRfGIKQwrrw7Bx9nViGmBQ-cuuFqLnwjzyUWbuhPoz2iBIJzzL9n9oz8R90N0QRpbGROAVnK3n43xA1vekb2Llay0RvmUkgonCpBO1BvqgNjJP6EWysqm3ulu0mEezGwQW2TkI9pWr2oSZ0PMiUHIAIJcEekCY3B12iI4fzwlc-SkT6PPP75YA9uZApHJ0d6m6zXGt0g",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBulXF4F-edw9gRu9Sdq7WXDV6bRucsihRtX4RAR-7PMpunXy5CySeLUk3tJFMWOTVClDCRfGIKQwrrw7Bx9nViGmBQ-cuuFqLnwjzyUWbuhPoz2iBIJzzL9n9oz8R90N0QRpbGROAVnK3n43xA1vekb2Llay0RvmUkgonCpBO1BvqgNjJP6EWysqm3ulu0mEezGwQW2TkI9pWr2oSZ0PMiUHIAIJcEekCY3B12iI4fzwlc-SkT6PPP75YA9uZApHJ0d6m6zXGt0g",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0m7DSDeVyg8TZbAa7baaiV_tuuyKerUpwAJUIXZeWVwTIesQVM5CHPgMsjVWF3UPO3_6ERwl1EnLA7A3ZPWHcSvRIhftm2YMvN3FHW_gGXmyvCDeKm8SZLylNvK80hig_PX4JUKVDMjq_VVCFqvATNdmz337QLULCRaULFD_ymkiPCOcUGfcj28cBsCHJoIq5oCuT_HQ0keb5Fk8VAScYt8l3d6JylZ9gsE5tr54MRFObGi_rVjmidxtQwcpBFqHwvfCjXjAqXg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARJVPW75K46Fu_3CYIbJ99tiUpurWhDn6KZvFR6agNb6fuQRT5FG9ihjfbCsFjrvCt7jPRbiSF0Pbzu5cMkrcDOypiturjtsLndxn7FOeYOZnMAUSr5nv3LLcsmvX8OkB-DS7nF-QB403cYsoldt8vCVLUizPcgV2mvhnKHJiAsYiyD6MyPGbJMFbb7mimWiV2lsvxgOqbq8y_Iwd2vG95OmputFnC4lfhBxZi8lEyQkN76ZqtrB7TNrNnJzMQ0B35UlXQbSrm2w",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYDxlffsxshbllKHjYGb200_xgE1FMyU_PYfXSIwR0u16nKQ-Gps0-vgkP2GzxJ-eCsfMclQDG_gXDxtEaSgtpEyBx8_sG0z_7udX5yfaCjlw-YdYoChhqZrF2dHCjF7wU9K9qLtMu4Y0Plx8-pjUXvLKM0ogTYduVIsc9A7Bg3OvAzID3qm8O1sbqDoOYFKGMXkUCBOsM7di_MlmXrUVjSN3QhLtFuP4xaZvSErHE1JLGV7TubsyfRzYEsceiEqNrQAXT8cBZUQ",
    ],
    includes: [
      "Transporte ida y vuelta en lancha premium",
      "Cóctel de bienvenida con o sin alcohol",
      "Almuerzo caribeño de 3 tiempos",
      "Acceso a beach club privado y toallas",
      "Guía profesional bilingüe",
    ],
    excludes: [
      "Impuesto portuario (aprox. $6 USD por persona)",
      "Bebidas alcohólicas adicionales",
      "Propinas y gastos personales",
    ],
    itinerary: [
      {
        time: "08:30 AM",
        title: "Salida",
        description:
          "Encuentro en Muelle de la Bodeguita para check-in exprés y abordaje de la lancha premium.",
        featured: true,
      },
      {
        time: "09:45 AM",
        title: "Recorrido panorámico",
        description:
          "Navega por las 27 islas con comentarios expertos sobre la historia del archipiélago.",
      },
      {
        time: "11:00 AM",
        title: "Actividad en el mar",
        description:
          "Snorkel guiado en el arrecife de San Fernando o visita al oceanario local.",
      },
      {
        time: "01:00 PM",
        title: "Almuerzo gourmet",
        description:
          "Disfruta un almuerzo caribeño preparado por chef con pesca del día y acompañamientos tropicales.",
        featured: true,
      },
    ],
  },
  {
    slug: "cartagena-historica",
    name: "Tour Histórico Cartagena",
    category: "Historia",
    badge: "Historia",
    country: "Colombia",
    description:
      "Recorre la historia con nuestros guías expertos en la ciudad amurallada y el Castillo San Felipe.",
    longDescription: [
      "Recorre la historia con nuestros guías expertos en la ciudad amurallada y el Castillo San Felipe.",
      "Una experiencia cultural pensada para viajeros que buscan arquitectura, relatos locales y plazas icónicas en una sola ruta.",
    ],
    price: 85,
    rating: 4.8,
    reviews: 215,
    duration: "4 horas",
    groupSize: "Máx. 20",
    languages: "ES / EN",
    location: "Cartagena, Colombia",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Ck5rjAyuOyvHd12megAjWM6-PPA3G60XJRo82uqLZRcpjhNTN5nk0r1kKSI918VtnCSexIunynXyFyrwLA9N1wxOb-DbEelzIeU4JvOyfTNHh_iRXbcgqP4uo1C8zOqwmQDY2Si5CKnKl1pjMN5jujDt1AN-pEaYO9b-1ju8Z2SWXLHCylNqorbrXvRAHg5Zxuo_VnXIi7AuKlwZ7fmH70QlekeX81_p0WiX9R0MGF20pNfa8AwBDpaFRNy98NfuwA3NGfmInw",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Ck5rjAyuOyvHd12megAjWM6-PPA3G60XJRo82uqLZRcpjhNTN5nk0r1kKSI918VtnCSexIunynXyFyrwLA9N1wxOb-DbEelzIeU4JvOyfTNHh_iRXbcgqP4uo1C8zOqwmQDY2Si5CKnKl1pjMN5jujDt1AN-pEaYO9b-1ju8Z2SWXLHCylNqorbrXvRAHg5Zxuo_VnXIi7AuKlwZ7fmH70QlekeX81_p0WiX9R0MGF20pNfa8AwBDpaFRNy98NfuwA3NGfmInw",
    ],
    includes: ["Guía local experto", "Ruta peatonal", "Seguro básico de asistencia"],
    excludes: ["Entradas a monumentos", "Traslados desde hotel", "Gastos personales"],
    itinerary: [
      {
        time: "03:00 PM",
        title: "Recorrido por el centro histórico",
        description: "Inicia tu caminata guiada entre plazas, balcones y calles coloniales.",
      },
    ],
  },
  {
    slug: "tayrona-aventura",
    name: "Aventura en el Tayrona",
    category: "Aventura",
    badge: "Aventura",
    country: "Colombia",
    description:
      "Descubre la mezcla mágica de selva y mar en el parque nacional más famoso de Colombia.",
    longDescription: [
      "Descubre la mezcla mágica de selva y mar en el parque nacional más famoso de Colombia.",
      "La ruta combina caminata suave, vistas costeras espectaculares y una experiencia de aventura con estética premium.",
    ],
    price: 195,
    rating: 5,
    reviews: 86,
    duration: "12 horas",
    groupSize: "Máx. 12",
    languages: "ES / EN",
    location: "Santa Marta, Colombia",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK9caBAfqwGoGkZHchHrCKjkPkCy_upzwDZIwgep6RtkhYNk5pplkOLYpm0IEUlb8sX9jk298ISgobdBA6dpYZJx26u649vy1pocRBh5mmF1Ht_Eztqnn05hlJETU7MLzLOTapjpbhEGgc2o4BPdzRj9GTIlxMUG9S49S-oMYXOG07DH62nGrMc1lTaYKqRmnsTtQYwjVo3kPr4iMxOV2teUZ3QJCFBtptCXDyKXmGzHsGcnHYUuOTMYX5Qgl6242as3uqcA3Mbg",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK9caBAfqwGoGkZHchHrCKjkPkCy_upzwDZIwgep6RtkhYNk5pplkOLYpm0IEUlb8sX9jk298ISgobdBA6dpYZJx26u649vy1pocRBh5mmF1Ht_Eztqnn05hlJETU7MLzLOTapjpbhEGgc2o4BPdzRj9GTIlxMUG9S49S-oMYXOG07DH62nGrMc1lTaYKqRmnsTtQYwjVo3kPr4iMxOV2teUZ3QJCFBtptCXDyKXmGzHsGcnHYUuOTMYX5Qgl6242as3uqcA3Mbg",
    ],
    includes: ["Transporte terrestre", "Acompañamiento de guía", "Seguro de asistencia"],
    excludes: ["Alimentación adicional", "Entradas no especificadas", "Gastos personales"],
    itinerary: [
      {
        time: "05:00 AM",
        title: "Salida temprana",
        description: "Salida hacia Tayrona y preparación para el ingreso al parque junto a tu guía.",
      },
    ],
  },
  {
    slug: "dia-playa-baru",
    name: "Día de Playa en Isla Barú",
    category: "Pasadía",
    badge: "Pasadía",
    country: "Colombia",
    description:
      "Vive el paraíso con un día completo de aguas cristalinas, arena blanca y almuerzo caribeño tradicional.",
    longDescription: [
      "Vive el paraíso con un día completo de aguas cristalinas, arena blanca y almuerzo caribeño tradicional.",
      "Un producto equilibrado de pasadía con logística simple, visual fuerte y una experiencia cómoda frente al mar.",
    ],
    price: 120,
    rating: 4.9,
    reviews: 120,
    duration: "8 horas",
    groupSize: "Máx. 18",
    languages: "ES / EN",
    location: "Cartagena, Colombia",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXOY0NQCSnj2TZ1kf6cOJvrCNBU8ia2Q3VCT-oRwRhWryuMmusXkGflo7llriCAsURbEbgRe5tt23877oHOIyThc02QXNWgPVBhB0q5uIkG_wkSQD482SJ4qsuxJp2HbyavITr4C6Ci4uhbyuba7inVDPpTmfOkbkpvhA4OzWLtQ-In6j3pSzd39iQcSKqDHHhBegB6EtERafCiykddfsIgp8euuhn-uZJii1m5f4rax23e8tK3VLsqkB_sxdvfc3NJHprLXH-7w",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXOY0NQCSnj2TZ1kf6cOJvrCNBU8ia2Q3VCT-oRwRhWryuMmusXkGflo7llriCAsURbEbgRe5tt23877oHOIyThc02QXNWgPVBhB0q5uIkG_wkSQD482SJ4qsuxJp2HbyavITr4C6Ci4uhbyuba7inVDPpTmfOkbkpvhA4OzWLtQ-In6j3pSzd39iQcSKqDHHhBegB6EtERafCiykddfsIgp8euuhn-uZJii1m5f4rax23e8tK3VLsqkB_sxdvfc3NJHprLXH-7w",
    ],
    includes: ["Transporte compartido", "Almuerzo típico", "Uso de instalaciones"],
    excludes: ["Impuesto portuario", "Bebidas extra", "Propinas"],
    itinerary: [
      {
        time: "08:00 AM",
        title: "Salida a playa",
        description: "Encuentro con el equipo y salida hacia Barú con acceso a club de playa.",
      },
    ],
  },
];

export const contactDetails = {
  address: "123 Coastal Drive, Ocean Plaza, Santa Marta, Colombia",
  phone: "+57 (300) 123-4567",
  email: "hello@hitravel.com",
  whatsapp: "https://wa.me/573001234567",
};
