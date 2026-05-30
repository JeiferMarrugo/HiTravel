export type SiteStat = { value: string; label: string };
export type SiteValueCard = { title: string; description: string };
export type SocialLinks = { facebook: string; instagram: string; youtube: string };

export type SiteContent = {
  brand: {
    name: string;
    logoUrl: string;
    navCtaLabel: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsappUrl: string;
    address: string;
    addressLine2: string;
    mapImageUrl: string;
  };
  social: SocialLinks;
  footer: {
    homeDescription: string;
    homeCopyright: string;
    toursDescription: string;
    detailDescription: string;
    contactCopyright: string;
    locationLabel: string;
  };
  home: {
    heroImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    featuredBadge: string;
    featuredTitle: string;
    featuredLinkLabel: string;
    dayTripsImageUrl: string;
    dayTripsBadge: string;
    dayTripsTitle: string;
    dayTripsDescription: string;
    dayTripsHighlight1Title: string;
    dayTripsHighlight1Text: string;
    dayTripsHighlight2Title: string;
    dayTripsHighlight2Text: string;
    dayTripsCardTitle: string;
    dayTripsCardSubtitle: string;
    dayTripsCtaLabel: string;
    whyTitle: string;
    whySubtitle: string;
    whyGuidesTitle: string;
    whyGuidesText: string;
    whySafetyTitle: string;
    whySafetyText: string;
    whyWhatsappTitle: string;
    whyWhatsappText: string;
    whyFlexibleTitle: string;
    whyFlexibleText: string;
  };
  toursPage: {
    title: string;
    subtitle: string;
    emptyWithToursTitle: string;
    emptyWithToursText: string;
    emptyCatalogTitle: string;
    emptyCatalogText: string;
  };
  about: {
    heroImageUrl: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    storyBadge: string;
    storyTitle: string;
    storyParagraph1: string;
    storyParagraph2: string;
    stats: SiteStat[];
    valuesTitle: string;
    valuesSubtitle: string;
    values: SiteValueCard[];
    missionLabel: string;
    missionText: string;
    visionLabel: string;
    visionText: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaText: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
  };
  contactPage: {
    heroImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    formTitle: string;
    officeTitle: string;
    socialEyebrow: string;
  };
  searchCountries: string[];
  pricing: {
    /** Pesos colombianos por 1 USD (ej. 4200). */
    usdCopRate: number;
    /** Códigos ISO de país (ej. CO) que ven precios en COP automáticamente. */
    copCountryCodes: string[];
  };
};

export type UpdateSiteContentInput = SiteContent;
