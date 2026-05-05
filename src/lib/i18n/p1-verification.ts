export const p1VerificationLocales = ["en", "rw", "fr", "sw"] as const;

export type P1VerificationLocale = (typeof p1VerificationLocales)[number];

export type P1VerificationQueueCopy = {
  flags: {
    missingPricing: string;
    missingImpact: string;
    impactAssumptions: string;
    missingMuseumPlacement: string;
    rejectedArtwork: string;
  };
  summary: (input: {
    title: string;
    pricingStatus: string;
    impactStatus: string;
    museumStatus: "placed" | "missing";
    museumRoom?: string;
  }) => string;
};

export type P1VerificationPageCopy = {
  adminUserName: string;
  title: string;
  description: string;
  metrics: {
    ready: string;
    manual: string;
    missing: string;
  };
  queueTitle: string;
  byArtist: (artistName: string) => string;
  actionLabels: {
    approve_ready: string;
    manual_review: string;
    request_more_info: string;
  };
  fieldLabels: {
    pricing: string;
    impact: string;
    museum: string;
  };
  statusLabels: {
    ready: string;
    missing: string;
    placed: string;
  };
  reviewFlags: string;
  decisionSupportNotice: string;
};

export type P1VerificationCopy = {
  page: P1VerificationPageCopy;
  queue: P1VerificationQueueCopy;
};

export const p1VerificationCopy: Record<P1VerificationLocale, P1VerificationCopy> = {
  en: {
    page: {
      adminUserName: "Admin User",
      title: "AI Verification Queue",
      description: "Review pricing, impact, and museum-placement evidence before approving artwork listings.",
      metrics: {
        ready: "Ready for approval",
        manual: "Manual review",
        missing: "Need more information",
      },
      queueTitle: "Reviewer Work Queue",
      byArtist: (artistName) => `by ${artistName}`,
      actionLabels: {
        approve_ready: "Ready for approval",
        manual_review: "Manual review",
        request_more_info: "Request more info",
      },
      fieldLabels: {
        pricing: "Pricing",
        impact: "Impact",
        museum: "Museum",
      },
      statusLabels: {
        ready: "ready",
        missing: "missing",
        placed: "placed",
      },
      reviewFlags: "Review flags",
      decisionSupportNotice:
        "This queue is decision support only. Admins remain responsible for approval decisions, and missing evidence should trigger follow-up rather than automatic rejection.",
    },
    queue: {
      flags: {
        missingPricing: "Missing pricing recommendation.",
        missingImpact: "Missing impact estimate.",
        impactAssumptions: "Impact estimate has multiple assumptions to review.",
        missingMuseumPlacement: "Artwork is not placed in the museum curation plan.",
        rejectedArtwork: "Artwork is currently rejected.",
      },
      summary: ({ title, pricingStatus, impactStatus, museumStatus, museumRoom }) =>
        `${title} has ${pricingStatus} pricing, ${impactStatus} impact documentation, and is ${
          museumStatus === "placed" ? `placed in ${museumRoom}` : "not yet placed in the museum"
        }.`,
    },
  },
  rw: {
    page: {
      adminUserName: "Umuyobozi",
      title: "Urutonde rwo kugenzura rwa AI",
      description: "Suzuma ibiciro, ingaruka, n'ibimenyetso byo gushyirwa mu nzu ndangamurage mbere yo kwemeza ibihangano.",
      metrics: {
        ready: "Biteguye kwemezwa",
        manual: "Bisuzumwe n'umuntu",
        missing: "Hakenewe amakuru y'inyongera",
      },
      queueTitle: "Urutonde rw'abasuzuma",
      byArtist: (artistName) => `na ${artistName}`,
      actionLabels: {
        approve_ready: "Biteguye kwemezwa",
        manual_review: "Bisuzumwe n'umuntu",
        request_more_info: "Saba amakuru y'inyongera",
      },
      fieldLabels: {
        pricing: "Igiciro",
        impact: "Ingaruka",
        museum: "Inzu ndangamurage",
      },
      statusLabels: {
        ready: "byuzuye",
        missing: "bibura",
        placed: "byashyizwe",
      },
      reviewFlags: "Ibyo kwitondera mu isuzuma",
      decisionSupportNotice:
        "Uru rutonde ni ubufasha bwo gufata icyemezo gusa. Abayobozi ni bo bakomeza gufata ibyemezo byo kwemeza, kandi ibimenyetso bibura bigomba gutuma hakurikiranywa amakuru aho guhita haterwa ibihangano.",
    },
    queue: {
      flags: {
        missingPricing: "Igitekerezo cy'igiciro kirabura.",
        missingImpact: "Isuzuma ry'ingaruka rirabura.",
        impactAssumptions: "Isuzuma ry'ingaruka rifite ibitekerezo byinshi bigomba gusuzumwa.",
        missingMuseumPlacement: "Igihangano ntikirashyirwa muri gahunda y'inzu ndangamurage.",
        rejectedArtwork: "Igihangano kiri mu byanzwe.",
      },
      summary: ({ title, pricingStatus, impactStatus, museumStatus, museumRoom }) =>
        `${title} gifite igiciro ${pricingStatus}, inyandiko z'ingaruka ${impactStatus}, kandi ${
          museumStatus === "placed" ? `cyashyizwe muri ${museumRoom}` : "ntikirashyirwa mu nzu ndangamurage"
        }.`,
    },
  },
  fr: {
    page: {
      adminUserName: "Administrateur",
      title: "File de verification IA",
      description: "Examinez les preuves de prix, d'impact et de placement museal avant d'approuver les oeuvres.",
      metrics: {
        ready: "Pret pour approbation",
        manual: "Revue manuelle",
        missing: "Informations requises",
      },
      queueTitle: "File de travail des reviewers",
      byArtist: (artistName) => `par ${artistName}`,
      actionLabels: {
        approve_ready: "Pret pour approbation",
        manual_review: "Revue manuelle",
        request_more_info: "Demander plus d'informations",
      },
      fieldLabels: {
        pricing: "Prix",
        impact: "Impact",
        museum: "Musee",
      },
      statusLabels: {
        ready: "pret",
        missing: "manquant",
        placed: "place",
      },
      reviewFlags: "Points a verifier",
      decisionSupportNotice:
        "Cette file sert uniquement d'aide a la decision. Les administrateurs restent responsables des approbations, et les preuves manquantes doivent declencher un suivi plutot qu'un rejet automatique.",
    },
    queue: {
      flags: {
        missingPricing: "Recommandation de prix manquante.",
        missingImpact: "Estimation d'impact manquante.",
        impactAssumptions: "L'estimation d'impact contient plusieurs hypotheses a examiner.",
        missingMuseumPlacement: "L'oeuvre n'est pas placee dans le plan de curation museale.",
        rejectedArtwork: "L'oeuvre est actuellement rejetee.",
      },
      summary: ({ title, pricingStatus, impactStatus, museumStatus, museumRoom }) =>
        `${title} a un prix ${pricingStatus}, une documentation d'impact ${impactStatus}, et ${
          museumStatus === "placed" ? `est placee dans ${museumRoom}` : "n'est pas encore placee dans le musee"
        }.`,
    },
  },
  sw: {
    page: {
      adminUserName: "Msimamizi",
      title: "Foleni ya Uthibitishaji wa AI",
      description: "Kagua ushahidi wa bei, athari, na upangaji wa makumbusho kabla ya kuidhinisha kazi za sanaa.",
      metrics: {
        ready: "Tayari kuidhinishwa",
        manual: "Ukaguzi wa mtu",
        missing: "Taarifa zaidi zinahitajika",
      },
      queueTitle: "Foleni ya Wakaguzi",
      byArtist: (artistName) => `na ${artistName}`,
      actionLabels: {
        approve_ready: "Tayari kuidhinishwa",
        manual_review: "Ukaguzi wa mtu",
        request_more_info: "Omba taarifa zaidi",
      },
      fieldLabels: {
        pricing: "Bei",
        impact: "Athari",
        museum: "Makumbusho",
      },
      statusLabels: {
        ready: "tayari",
        missing: "inakosekana",
        placed: "imepangwa",
      },
      reviewFlags: "Alama za ukaguzi",
      decisionSupportNotice:
        "Foleni hii ni msaada wa kufanya maamuzi tu. Wasimamizi bado wanawajibika kwa maamuzi ya kuidhinisha, na ushahidi unaokosekana unapaswa kusababisha ufuatiliaji badala ya kukataliwa moja kwa moja.",
    },
    queue: {
      flags: {
        missingPricing: "Pendekezo la bei linakosekana.",
        missingImpact: "Makadirio ya athari yanakosekana.",
        impactAssumptions: "Makadirio ya athari yana mawazo kadhaa ya kukaguliwa.",
        missingMuseumPlacement: "Kazi ya sanaa haijapangwa katika mpango wa makumbusho.",
        rejectedArtwork: "Kazi ya sanaa imekataliwa kwa sasa.",
      },
      summary: ({ title, pricingStatus, impactStatus, museumStatus, museumRoom }) =>
        `${title} ina bei ${pricingStatus}, nyaraka za athari ${impactStatus}, na ${
          museumStatus === "placed" ? `imepangwa katika ${museumRoom}` : "haijapangwa bado kwenye makumbusho"
        }.`,
    },
  },
};

export const defaultP1VerificationCopy = p1VerificationCopy.en;
