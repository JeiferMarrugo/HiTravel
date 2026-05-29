import type { AdminTourCard, AdminTourDetail } from "@/lib/admin/types";

export const adminTourCategories = [
  { label: "Todos", count: 24, active: true },
  { label: "Pasadía", count: 8 },
  { label: "Luxury", count: 6 },
  { label: "Aventura", count: 10 },
];

export const adminTours: AdminTourCard[] = [
  {
    id: "sunset-yacht",
    name: "Private Sunset Yacht Tour",
    category: "Luxury",
    description: "Exclusive 4-hour navigation with champagne, gourmet appetizers, and snorkeling at secluded reefs.",
    price: "$249.00",
    duration: "4h",
    capacity: "Hasta 8",
    location: "Bahía",
    rating: "4.9",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAc5ZAjsEru0vKU6CnDSwbMX16E2JKsWeP98_wfzX5fwt__zKuNIhPDZUA_FOCLB5VekK6rAHWbpMhPg6sDuby0womTuXvEmHjrdPXdjkUFX8APweWsWSPMTW-PXW2IeUkUETWVfOWtj3gpilCBGgtwdynEM5m_zzidHdC2aEXhUaVbrqqPevycv__xp3feMZJIceCr7YXrg7KablxruQizu5jHQNQCAxRxbIEsz6CqVUcbwkY7yuEGqQ9EUwH_88lFjcUoHujk-w",
    active: true,
  },
  {
    id: "rosario-beach-club",
    name: "Rosario Islands Beach Club",
    category: "Pasadía",
    description: "Full-day access to premium beach club including traditional lunch and boat transportation.",
    price: "$85.00",
    duration: "8h",
    capacity: "Islas",
    location: "Rosario",
    rating: "4.7",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXOY0NQCSnj2TZ1kf6cOJvrCNBU8ia2Q3VCT-oRwRhWryuMmusXkGflo7llriCAsURbEbgRe5tt23877oHOIyThc02QXNWgPVBhB0q5uIkG_wkSQD482SJ4qsuxJp2HbyavITr4C6Ci4uhbyuba7inVDPpTmfOkbkpvhA4OzWLtQ-In6j3pSzd39iQcSKqDHHhBegB6EtERafCiykddfsIgp8euuhn-uZJii1m5f4rax23e8tK3VLsqkB_sxdvfc3NJHprLXH-7w",
    active: true,
  },
  {
    id: "hidden-waterfalls",
    name: "Hidden Waterfalls Trek",
    category: "Adventure",
    description: "Guided jungle hiking experience to undiscovered waterfall systems with swimming and snacks.",
    price: "$120.00",
    duration: "6h",
    capacity: "Mod.",
    location: "Selva",
    rating: "4.5",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK9caBAfqwGoGkZHchHrCKjkPkCy_upzwDZIwgep6RtkhYNk5pplkOLYpm0IEUlb8sX9jk298ISgobdBA6dpYZJx26u649vy1pocRBh5mmF1Ht_Eztqnn05hlJETU7MLzLOTapjpbhEGgc2o4BPdzRj9GTIlxMUG9S49S-oMYXOG07DH62nGrMc1lTaYKqRmnsTtQYwjVo3kPr4iMxOV2teUZ3QJCFBtptCXDyKXmGzHsGcnHYUuOTMYX5Qgl6242as3uqcA3Mbg",
    active: false,
  },
];

export const adminTourDetail: AdminTourDetail = {
  id: "caribbean-sunsets-snorkeling",
  title: "Caribbean Sunsets & Snorkeling",
  category: "Pasadía (Day Trip)",
  duration: "8 horas",
  description:
    "Experience the vibrant underwater world of the Rosario Islands followed by a breathtaking sunset at Playa Blanca. This premium day trip includes guided snorkeling, gourmet lunch, and open bar during the sunset toast.",
  media: [
    {
      id: "media-1",
      label: "Main cover",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBYDxlffsxshbllKHjYGb200_xgE1FMyU_PYfXSIwR0u16nKQ-Gps0-vgkP2GzxJ-eCsfMclQDG_gXDxtEaSgtpEyBx8_sG0z_7udX5yfaCjlw-YdYoChhqZrF2dHCjF7wU9K9qLtMu4Y0Plx8-pjUXvLKM0ogTYduVIsc9A7Bg3OvAzID3qm8O1sbqDoOYFKGMXkUCBOsM7di_MlmXrUVjSN3QhLtFuP4xaZvSErHE1JLGV7TubsyfRzYEsceiEqNrQAXT8cBZUQ",
    },
    {
      id: "media-2",
      label: "Sunset view",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLNwZW8VGKTvJJHLDkVmcI17nGzC9tX1Pw9gIBvpAyVV5oqnIvoeQa_dZru0mMRaJW-8m6EiGQLiLlpIZ7MM1gLDQUC_W8d5yxvwC4k0jCUtjyKH8Kw4KJfLlf48tFuUPK9O_F6Kt9YFEC8URmnv9KlOp5FccaHcU2mXTg8t9aw7zl5AJYUbPqQaOcwAe5hYGk3m6ntEY1ASjWJh7q45_YRF-WeUtzqxFEEYfw1qFe85Iy0dMQPyUeTI2xx6jDV683FpFfOKewRg",
    },
    {
      id: "media-3",
      label: "Boat",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAc5ZAjsEru0vKU6CnDSwbMX16E2JKsWeP98_wfzX5fwt__zKuNIhPDZUA_FOCLB5VekK6rAHWbpMhPg6sDuby0womTuXvEmHjrdPXdjkUFX8APweWsWSPMTW-PXW2IeUkUETWVfOWtj3gpilCBGgtwdynEM5m_zzidHdC2aEXhUaVbrqqPevycv__xp3feMZJIceCr7YXrg7KablxruQizu5jHQNQCAxRxbIEsz6CqVUcbwkY7yuEGqQ9EUwH_88lFjcUoHujk-w",
    },
    {
      id: "media-4",
      label: "Beach sunset",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuARJVPW75K46Fu_3CYIbJ99tiUpurWhDn6KZvFR6agNb6fuQRT5FG9ihjfbCsFjrvCt7jPRbiSF0Pbzu5cMkrcDOypiturjtsLndxn7FOeYOZnMAUSr5nv3LLcsmvX8OkB-DS7nF-QB403cYsoldt8vCVLUizPcgV2mvhnKHJiAsYiyD6MyPGbJMFbb7mimWiV2lsvxgOqbq8y_Iwd2vG95OmputFnC4lfhBxZi8lEyQkN76ZqtrB7TNrNnJzMQ0B35UlXQbSrm2w",
    },
  ],
  pricing: [
    { id: "rate-high", season: "Temporada alta (Dic - Ene)", adultPrice: "$120", childPrice: "$85" },
    { id: "rate-low", season: "Temporada baja (Feb - Nov)", adultPrice: "$95", childPrice: "$60" },
  ],
  itinerary: [
    {
      id: "step-1",
      time: "08:00 AM",
      title: "Salida desde la marina",
      description: "Reunión en muelle y briefing de seguridad antes de zarpar.",
    },
    {
      id: "step-2",
      time: "10:30 AM",
      title: "Snorkel en Rosario Islands",
      description: "Aventura con guías locales y equipo profesional incluido.",
    },
    {
      id: "step-3",
      time: "01:30 PM",
      title: "Almuerzo en beach club privado",
      description: "Open bar, almuerzo caribeño y tiempo libre en camas y sombra.",
    },
  ],
  included: [
    "Equipo de snorkel (máscara, aletas y chaleco)",
    "Open bar de cócteles y bebidas sin alcohol",
    "Transporte redondo desde el hotel",
    "Almuerzo gourmet frente al mar",
    "Guía bilingüe certificado",
  ],
};
