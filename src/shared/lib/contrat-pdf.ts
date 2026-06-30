import type { ContratData } from "@/shared/components/mandataire/ContratCanvas";

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateContratPdf(contrat: ContratData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const H = 297;
  const MARGIN = 18;
  const MAX_W = W - MARGIN * 2;
  const BOTTOM = 20;
  let y = 0;
  let page = 1;

  const logoDataUrl = await loadImageAsDataUrl("/terrain-affinity.png");

  // ── Helpers ────────────────────────────────────────────────────────────────

  const footer = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `HOWNER / Affinity House Factory — Contrat-cadre de sous-traitance — Page ${page}`,
      MARGIN, H - 7,
    );
    doc.setTextColor(30, 30, 28);
  };

  const newPage = () => {
    doc.addPage();
    page++;
    y = 20;
    footer();
  };

  const checkY = (needed: number) => {
    if (y + needed > H - BOTTOM) newPage();
  };

  const section = (title: string) => {
    checkY(14);
    y += 4;
    doc.setFillColor(116, 105, 244);
    doc.rect(MARGIN, y, MAX_W, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), MARGIN + 3, y + 4.5);
    doc.setTextColor(30, 30, 28);
    y += 10;
  };

  const subSection = (title: string) => {
    checkY(10);
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(title, MARGIN, y);
    doc.setTextColor(30, 30, 28);
    y += 5;
  };

  const para = (text: string, indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, MAX_W - indent);
    for (const l of lines) {
      checkY(5);
      doc.text(l, MARGIN + indent, y);
      y += 4.2;
    }
    y += 1;
  };

  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, MAX_W - 8);
    checkY(5);
    doc.text("•", MARGIN + 3, y);
    doc.text(lines[0], MARGIN + 8, y);
    y += 4.2;
    for (let i = 1; i < lines.length; i++) {
      checkY(5);
      doc.text(lines[i], MARGIN + 8, y);
      y += 4.2;
    }
  };

  const field = (label: string, value: string) => {
    if (!value) return;
    checkY(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 28);
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(value, MAX_W - 52);
    doc.text(lines, MARGIN + 52, y);
    y += Math.max(5, lines.length * 4.2);
  };

  const tableHeader = (cells: string[], widths: number[]) => {
    checkY(10);
    doc.setFillColor(235, 235, 240);
    doc.rect(MARGIN, y, MAX_W, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    let x = MARGIN + 2;
    cells.forEach((cell, i) => { doc.text(cell, x, y + 4.2); x += widths[i]; });
    doc.setTextColor(30, 30, 28);
    y += 7;
  };

  const tableRow = (cells: string[], widths: number[]) => {
    checkY(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    let x = MARGIN + 2;
    cells.forEach((cell, i) => {
      doc.text(doc.splitTextToSize(cell, widths[i] - 4)[0] ?? "", x, y + 4.2);
      x += widths[i];
    });
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGIN, y + 6.5, W - MARGIN, y + 6.5);
    y += 7.5;
  };

  // ── EN-TÊTE PAGE 1 ────────────────────────────────────────────────────────
  doc.setFillColor(26, 26, 24);
  doc.rect(0, 0, W, 24, "F");

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", MARGIN, 4, 16, 16); } catch { /* */ }
  }

  const titleX = logoDataUrl ? MARGIN + 20 : MARGIN;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTRAT-CADRE DE SOUS-TRAITANCE MANDATAIRE", titleX, 10.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Pack Recherche Terrain — Plateforme HOWNER", titleX, 16);
  doc.text("© 2026 HOWNER / Affinity House Factory — Confidentiel", W - MARGIN, 16, { align: "right" });

  footer();
  y = 30;
  doc.setTextColor(30, 30, 28);

  // ── DONNEUR D'ORDRE ───────────────────────────────────────────────────────
  section("Donneur d'ordre — Affinity House Factory (AHF)");
  field("Société", "Affinity House Factory (AHF)");
  field("Forme juridique", "SAS — Société par Actions Simplifiée");
  field("SIRET", "982 581 506 00010");
  field("Siège social", "28 Chemin de Sabalce OEV, 64100 Bayonne, France");
  field("Email", "contact@affinityhousefactory.com");
  field("Représentée par", "Albert Puigbo, Directeur Général - Fondateur");
  field("Qualité", "Donneur d'ordre — Coordinateur Pack Recherche Terrain");

  // ── SOUS-TRAITANT ─────────────────────────────────────────────────────────
  section("Sous-traitant (Mandataire partenaire)");
  field("Nom / Raison sociale", contrat.nom_raison_sociale);
  field("Forme juridique", contrat.forme_juridique);
  field("SIRET", contrat.siret);
  field("Adresse", contrat.adresse);
  field("Immatriculation RSAC", contrat.immatriculation_rsac);
  field("Réseau carte T", contrat.reseau_carte_t);
  field("Carte professionnelle T", contrat.carte_t_numero);
  field("Email professionnel", contrat.email);
  field("Qualité", "Sous-traitant — Mandataire immobilier partenaire");
  y += 2;
  para("Ci-après désignés ensemble « les Parties ».");

  // ── PRÉAMBULE ─────────────────────────────────────────────────────────────
  section("Préambule");
  para("Affinity House Factory (AHF) exploite plusieurs plateformes numériques (affinityhome.fr, affinityhousefactory.com, howner.fr), dédiées à la commercialisation de maisons compactes d'architecte — Arko One (20 m²) et Arko Max (40 m²) — fabriquées dans l'Atelier AHF au Pays Basque.");
  para("AHF propose à ses Clients réservataires un service optionnel dénommé « Pack Recherche Terrain », ayant pour objet la recherche d'un terrain constructible compatible avec la Maison ARKO réservée.");
  para("AHF ne dispose pas de la carte professionnelle T au sens de la loi n°70-9 du 2 janvier 1970 (loi Hoguet) et n'exerce aucune activité d'intermédiation immobilière. Toute mission de recherche et d'accompagnement à la transaction foncière est confiée à un mandataire immobilier indépendant, titulaire ou rattaché à une carte professionnelle T valide.");
  para("Le Mandataire partenaire dispose de l'ensemble des compétences, habilitations, assurances et autorisations nécessaires à l'exercice de son activité d'intermédiaire immobilier.");

  // ── ARTICLE 1 ─────────────────────────────────────────────────────────────
  section("Article 1 — Objet du contrat");
  para("Le présent contrat a pour objet de définir les conditions dans lesquelles le Mandataire partenaire accepte de :");
  bullet("Recevoir des dossiers Clients qualifiés issus de la plateforme HOWNER, accompagnés du Cahier des Charges Techniques Arko ;");
  bullet("Accepter ou refuser librement chaque mission proposée ;");
  bullet("Exécuter les missions acceptées pour son propre compte, sous sa seule responsabilité et sous sa carte professionnelle T ;");
  bullet("Accomplir l'intégralité des actes d'intermédiation immobilière requis, du mandat de recherche jusqu'à l'acte notarié.");
  para("Le présent contrat constitue un contrat-cadre de sous-traitance non exclusive. AHF agit en qualité de coordinateur du Pack Recherche Terrain. Elle fixe les critères techniques, qualifie les Clients, coordonne administrativement la mission et facture le Pack. Elle n'accomplit aucun acte d'intermédiation immobilière.");

  // ── ARTICLE 2 ─────────────────────────────────────────────────────────────
  section("Article 2 — Indépendance des parties");
  para("Le Mandataire partenaire agit en qualité de prestataire indépendant, inscrit au RSAC, rattaché à la carte professionnelle T de son réseau. Aucune disposition du présent contrat ne saurait :");
  bullet("Créer un lien de subordination entre les Parties ;");
  bullet("Conférer à AHF la qualité d'employeur, d'agent immobilier ou de mandataire du Mandataire ;");
  bullet("Autoriser le Mandataire à engager AHF à l'égard des Clients finaux ou des vendeurs ;");
  bullet("Qualifier la relation de contrat de travail ou de mandat d'intérêt commun au sens de l'article L. 134-1 du Code de commerce.");
  para("Le Mandataire partenaire demeure seul responsable de l'organisation de son activité, de ses charges, cotisations et obligations fiscales et sociales.");

  // ── ARTICLE 3 ─────────────────────────────────────────────────────────────
  section("Article 3 — Processus de mission");
  subSection("3.1 Transmission du dossier Client");
  para("AHF transmet au Mandataire un dossier Client comprenant : le Cahier des Charges Techniques Arko (Annexe 1), les coordonnées du Client réservataire, le modèle réservé (Arko One ou Arko Max), le budget terrain validé et le périmètre de recherche. La transmission est effectuée dans les 7 jours ouvrés suivant la souscription du Pack par le Client.");
  subSection("3.2 Acceptation ou refus de la mission");
  para("Le Mandataire partenaire demeure libre d'accepter ou de refuser chaque mission. En cas de refus, il en informe AHF par email dans un délai de 48 heures. AHF se réserve le droit de confier la mission à un autre Mandataire partenaire.");
  subSection("3.3 Exécution de la mission");
  para("En cas d'acceptation, le Mandataire s'engage à :");
  bullet("Signer un mandat de recherche exclusif directement avec le Client, sous sa carte professionnelle T, conformément à la loi Hoguet ;");
  bullet("Respecter strictement le Cahier des Charges Techniques Arko (Annexe 1) ;");
  bullet("Remettre au Client et à AHF un rapport de compatibilité terrain / Arko avant toute offre d'achat ;");
  bullet("Accompagner le Client jusqu'à la signature de l'acte authentique chez le notaire ;");
  bullet("Informer AHF des jalons clés : 1er terrain identifié, offre déposée, compromis signé, acte notarié.");
  subSection("3.4 Contrat Client");
  para("Le mandat de recherche est conclu directement entre le Client et le Mandataire partenaire. AHF n'est pas partie à ce mandat. Le contrat de Pack Recherche Terrain, distinct, est conclu entre AHF et le Client.");

  // ── ARTICLE 4 ─────────────────────────────────────────────────────────────
  section("Article 4 — Conditions financières");
  subSection("4.1 Grille de rémunération");
  tableHeader(["Pack souscrit par le Client", "Prix client TTC", "Rémunération Mandataire HT"], [100, 42, 32]);
  tableRow(["Pack Essentiel — 1 commune", "4 900 €", "3 600 €"], [100, 42, 32]);
  tableRow(["Pack Étendu — rayon ~20 km", "7 300 €", "5 500 €"], [100, 42, 32]);
  tableRow(["Pack Département — 64 ou 40", "11 200 €", "8 400 €"], [100, 42, 32]);
  y += 2;
  subSection("4.2 Conditions de versement");
  para("La rémunération est due uniquement après réunion cumulative des deux conditions suivantes : signature de l'acte authentique de vente du terrain chez le notaire ; encaissement par AHF du prix total du Pack auprès du Client. Aucun abonnement ni frais fixe ne sont exigés du Mandataire partenaire.");
  subSection("4.3 Facturation");
  para("Le Mandataire émet une facture HT + TVA applicable à AHF dans les 15 jours suivant l'acte notarié. AHF règle dans les 30 jours réception de facture, par virement bancaire.");
  subSection("4.4 Cas d'échec");
  para("Si la mission n'aboutit pas à un acte notarié dans le délai contractuel, aucune rémunération n'est due. L'acompte de 1 500 € versé par le Client lors de la souscription est conservé par AHF à titre de provision de coordination et n'est pas reversé au Mandataire.");

  // ── ARTICLE 5 ─────────────────────────────────────────────────────────────
  section("Article 5 — Obligations du mandataire partenaire");
  subSection("5.1 Obligations légales et professionnelles");
  bullet("Maintenir en cours de validité sa carte professionnelle T (ou son rattachement à un réseau titulaire) pendant toute la durée du contrat ;");
  bullet("Respecter l'ensemble des obligations légales et réglementaires applicables (loi Hoguet, décret du 20 juillet 1972) ;");
  bullet("Maintenir une assurance de responsabilité civile professionnelle couvrant l'ensemble des risques liés à son activité, et en justifier à première demande d'AHF ;");
  bullet("Respecter les règles déontologiques applicables à la profession d'intermédiaire immobilier.");
  subSection("5.2 Obligations opérationnelles");
  bullet("Respecter le Cahier des Charges Techniques Arko (Annexe 1) pour chaque terrain présenté au Client ;");
  bullet("Remettre un rapport de compatibilité terrain / Arko avant toute offre d'achat ;");
  bullet("Informer AHF de l'avancement de chaque mission aux jalons définis à l'article 3.3 ;");
  bullet("Informer sans délai AHF de tout incident, litige ou difficulté rencontré dans l'exécution de la mission.");
  subSection("5.3 Obligations de loyauté et non-concurrence");
  bullet("Ne pas démarcher directement les Clients HOWNER pour d'autres services immobiliers pendant la durée du contrat et 12 mois après son terme ;");
  bullet("Ne pas contourner AHF en facturant directement des services au Client HOWNER dans le périmètre du Pack ;");
  bullet("Ne pas divulguer à des tiers les critères techniques, les données Clients ou les informations commerciales transmises par AHF.");
  subSection("5.4 Obligation de formation");
  para("Le Mandataire s'engage à maintenir son niveau de compétence professionnelle, notamment via les formations continues obligatoires (14 heures/an) prévues par la loi ALUR.");

  // ── ARTICLE 6 ─────────────────────────────────────────────────────────────
  section("Article 6 — Obligations d'AHF");
  bullet("Transmettre des dossiers Clients qualifiés avec le Cahier des Charges Techniques et le budget terrain validé ;");
  bullet("Ne pas contacter directement les vendeurs ou agences identifiés par le Mandataire dans le cadre de la mission ;");
  bullet("Rémunérer le Mandataire selon la grille de l'article 4, dans les délais convenus, après réunion des conditions de versement ;");
  bullet("Informer le Mandataire de toute modification des critères techniques ou commerciaux avec un préavis de 15 jours ;");
  bullet("Mettre à disposition les outils de coordination et les modèles de documents (Annexes 1 et 2) ;");
  bullet("Assurer la gestion de la relation contractuelle avec le Client (CGV, acomptes, devis).");

  // ── ARTICLE 7 ─────────────────────────────────────────────────────────────
  section("Article 7 — Responsabilité");
  subSection("7.1 Responsabilité du Mandataire");
  para("Le Mandataire partenaire est seul responsable de l'intégralité des actes d'intermédiation immobilière accomplis sous sa carte T, de la conformité du mandat de recherche signé avec le Client, des conseils et engagements pris auprès du Client ou du vendeur, et des dommages causés à des tiers résultant de l'exécution de sa mission. Le Mandataire garantit et indemnise AHF contre toute réclamation ou condamnation résultant de l'exercice de sa mission.");
  subSection("7.2 Responsabilité d'AHF");
  para("AHF est responsable de la coordination administrative du Pack, de la conformité du Cahier des Charges Techniques Arko transmis, et de la gestion des acomptes Clients. AHF ne saurait être tenue responsable des actes du Mandataire, ni du résultat de la recherche foncière, ni de la réalisation de la transaction immobilière.");
  subSection("7.3 Limitation de responsabilité croisée");
  para("La responsabilité d'AHF envers le Mandataire ne peut en aucun cas excéder le montant des rémunérations versées au cours des 12 derniers mois précédant le fait générateur.");

  // ── ARTICLE 8 ─────────────────────────────────────────────────────────────
  section("Article 8 — Data Processing Agreement (DPA / RGPD)");
  subSection("8.1 Qualification des Parties");
  para("AHF agit en qualité de Responsable de traitement au sens du RGPD (Règlement UE 2016/679). Le Mandataire partenaire agit en qualité de Sous-traitant au sens de l'article 28 du RGPD.");
  subSection("8.2 Données transmises");
  para("Les données personnelles des Clients HOWNER transmises par AHF sont : nom, prénom, email, téléphone, adresse ou périmètre de recherche terrain, modèle Arko réservé et budget terrain validé. Ces données sont transmises exclusivement pour les finalités de la mission de recherche terrain définie au présent contrat.");
  subSection("8.3 Obligations du Mandataire (sous-traitant)");
  bullet("Traiter les données uniquement sur instructions documentées d'AHF et pour les finalités du contrat ;");
  bullet("Ne pas utiliser les données à des fins commerciales propres ou les transmettre à des tiers sans accord écrit préalable d'AHF ;");
  bullet("Garantir la confidentialité des données et mettre en œuvre des mesures techniques et organisationnelles appropriées ;");
  bullet("Ne pas conserver les données au-delà de la durée strictement nécessaire à l'exécution de la mission ;");
  bullet("Supprimer ou restituer l'ensemble des données à l'issue de la mission ou à la résiliation du contrat ;");
  bullet("Notifier AHF sans délai (et au plus tard sous 48 heures) de toute violation de données personnelles.");
  subSection("8.4 Sous-traitance ultérieure");
  para("Le Mandataire peut recourir à des sous-traitants ultérieurs pour l'exécution matérielle de l'intervention, sous réserve qu'ils présentent des garanties suffisantes en matière de protection des données et soient liés par un contrat écrit imposant des obligations au moins équivalentes à celles du présent DPA.");
  subSection("8.5 Sort des données");
  para("À l'issue de la mission, le Mandataire s'engage à supprimer toutes les données personnelles impliquant AHF ou ses clients, y compris par les sous-traitants ultérieurs, ou les restituer à AHF en cas d'audit ou de contrôle.");
  subSection("8.6 Audit et contrôle");
  para("AHF se réserve le droit de vérifier le respect des obligations du présent article, par tout moyen raisonnable, notamment en demandant tout document attestant de la conformité du Mandataire.");
  subSection("8.7 Mesures techniques et organisationnelles (TOMs)");
  bullet("Stockage des données Clients sur des supports sécurisés (accès par mot de passe, chiffrement recommandé) ;");
  bullet("Accès aux données limité aux seules personnes impliquées dans la mission ;");
  bullet("Suppression effective des données à l'issue de la mission ;");
  bullet("Non-utilisation d'outils tiers non sécurisés pour le partage de données Clients.");

  // ── ARTICLE 9 ─────────────────────────────────────────────────────────────
  section("Article 9 — Confidentialité");
  para("Le Mandataire s'engage à conserver strictement confidentielles toutes les informations reçues dans le cadre du présent contrat, notamment : les données Clients et les dossiers de mission ; le Cahier des Charges Techniques Arko ; les conditions financières du présent contrat ; toute information commerciale ou stratégique d'AHF.");
  para("Cette obligation de confidentialité survivra pendant une durée de 5 ans après la cessation du contrat. Le Mandataire s'engage à ne pas utiliser ces informations à des fins autres que l'exécution du présent contrat.");

  // ── ARTICLE 10 ────────────────────────────────────────────────────────────
  section("Article 10 — Exclusivité géographique (optionnel)");
  para("Les Parties peuvent convenir, par avenant signé, d'une exclusivité géographique sur un périmètre défini (commune, département), pour une durée déterminée. En contrepartie, le Mandataire s'engage à traiter en priorité les dossiers HOWNER dans ce périmètre, avec un délai de prise en charge de 48 heures maximum. En l'absence d'avenant, le présent contrat est non exclusif.");

  // ── ARTICLE 11 ────────────────────────────────────────────────────────────
  section("Article 11 — Durée — Résiliation — Suspension");
  subSection("11.1 Durée");
  para("Le présent contrat est conclu pour une durée indéterminée à compter de sa signature.");
  subSection("11.2 Résiliation à l'initiative des Parties");
  para("Chaque Partie peut résilier le présent contrat à tout moment, sans motif, sous réserve du respect d'un préavis de 30 jours calendaires, notifié par tout moyen écrit permettant d'en conserver la preuve (email avec accusé de réception ou LRAR).");
  subSection("11.3 Résiliation sans préavis pour faute grave");
  para("AHF se réserve le droit de résilier immédiatement et sans préavis le contrat en cas de manquement grave, notamment : perte ou suspension de la carte professionnelle T ; absence d'assurance RC professionnelle ; violation caractérisée des obligations RGPD / DPA ; violation de l'obligation de confidentialité ; démarchage direct de Clients HOWNER ; fraude, fausse déclaration ou contournement de la coordination AHF ; atteinte à l'image ou à la réputation d'AHF ou de la marque HOWNER.");
  subSection("11.4 Suspension temporaire");
  para("AHF se réserve le droit de suspendre temporairement la transmission de nouveaux dossiers sans résiliation, en cas de doute sérieux sur la conformité de la carte T, de taux d'annulation anormalement élevé, ou de comportement préjudiciable au Client ou à AHF. La suspension est levée après régularisation constatée par AHF.");
  subSection("11.5 Effets de la résiliation");
  para("À la date effective de résiliation : aucune nouvelle mission ne sera transmise ; les missions déjà acceptées et en cours doivent être exécutées jusqu'à leur terme, sauf accord contraire écrit ; les rémunérations dues pour missions réalisées restent exigibles ; le Mandataire supprime ou restitue les données personnelles Clients conformément à l'article 8.");
  subSection("11.7 Absence d'indemnité");
  para("La résiliation du présent contrat, pour quelque cause que ce soit, n'ouvre droit à aucune indemnité au bénéfice du Mandataire, sous réserve des rémunérations acquises pour missions réalisées.");

  // ── ARTICLE 12 ────────────────────────────────────────────────────────────
  section("Article 12 — Preuve électronique");
  para("Les Parties conviennent que les emails, messages et documents échangés dans le cadre du présent contrat ont valeur probante entre elles. L'horodatage électronique des communications fait foi. L'acceptation d'une mission par email ou via tout outil de coordination AHF vaut acceptation formelle au sens du présent contrat.");

  // ── ARTICLE 13 ────────────────────────────────────────────────────────────
  section("Article 13 — Force majeure");
  para("Aucune Partie ne pourra être tenue responsable d'un retard ou d'une inexécution résultant d'un événement de force majeure au sens de l'article 1218 du Code civil. La Partie qui invoque la force majeure doit en informer l'autre par écrit dans les 48 heures, et prendre toutes mesures raisonnables pour en limiter les effets. Si l'événement persiste au-delà de 30 jours, chaque Partie peut résilier le contrat sans indemnité.");

  // ── ARTICLE 14 ────────────────────────────────────────────────────────────
  section("Article 14 — Modification du contrat");
  para("Toute modification du présent contrat doit faire l'objet d'un avenant écrit signé par les représentants habilités des deux Parties. Aucune modification verbale n'est opposable. AHF se réserve le droit de modifier la grille de rémunération (article 4.1) avec un préavis de 30 jours notifié au Mandataire. L'absence d'opposition écrite dans ce délai vaut acceptation.");

  // ── ARTICLE 15 ────────────────────────────────────────────────────────────
  section("Article 15 — Droit applicable et juridiction");
  para("Le présent contrat est régi par le droit français. Tout litige relatif à son interprétation ou à son exécution sera soumis à une tentative de résolution amiable préalable. À défaut d'accord dans un délai de 30 jours, le litige relèvera de la compétence exclusive du Tribunal de Commerce de Bayonne.");

  // ── ARTICLE 16 — Contact RGPD ─────────────────────────────────────────────
  section("Article 16 — Contact des Parties (RGPD)");
  subSection("AHF — Responsable de traitement");
  field("Contact DPA / RGPD", "contact@affinityhousefactory.com");
  field("Adresse", "28 Chemin de Sabalce OEV, 64100 Bayonne");
  field("Notifications violations", "contact@affinityhousefactory.com — délai 48h");
  y += 2;
  subSection("Mandataire partenaire — Sous-traitant");
  field("Contact DPA / RGPD", contrat.dpa_nom_prenom);
  field("Email professionnel", contrat.dpa_email);
  field("Email notifications violations", contrat.dpa_email_violations || contrat.dpa_email);

  // ── SIGNATURES ────────────────────────────────────────────────────────────
  section("Signatures");
  para(`Fait en deux exemplaires originaux, à Bayonne, le ${contrat.signature_date}`);
  y += 4;
  checkY(40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Pour Affinity House Factory", MARGIN, y);
  doc.text("Pour le Mandataire partenaire", W / 2 + 4, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 28);
  doc.text("Albert Puigbo — Directeur Général", MARGIN, y);
  const mandName = `${contrat.signature_prenom} ${contrat.signature_nom} — ${contrat.signature_qualite}`;
  doc.text(mandName, W / 2 + 4, y);
  y += 14;

  if (contrat.signature_data_url) {
    try {
      doc.addImage(contrat.signature_data_url, "PNG", W / 2 + 4, y - 12, 70, 22);
    } catch { /* */ }
  }

  y += 12;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;

  // ── ANNEXE 1 ──────────────────────────────────────────────────────────────
  section("Annexe 1 — Cahier des charges techniques Arko");
  para("Tout terrain présenté au Client dans le cadre du Pack Recherche Terrain doit satisfaire aux critères minimaux suivants :");
  y += 2;
  tableHeader(["Critère", "Exigence minimale"], [68, 106]);
  const annexe: [string, string][] = [
    ["Zonage PLU", "Zone U ou AU (constructible)"],
    ["Autorisation urbanisme", "Déclaration préalable (Arko One) ou permis de construire (Arko Max)"],
    ["Accès voirie", "Largeur ≥ 3,5 m (passage camion grue)"],
    ["Pente terrain", "≤ 10 % (à confirmer selon étude G2)"],
    ["Réseaux eau + électricité", "À proximité ou raccordement possible"],
    ["Assainissement", "Réseau collectif ou ANC possible (avis SPANC favorable)"],
    ["Zones exclues", "PPRI, Natura 2000 restrictive, ABF contraignant"],
    ["Orientation", "Sud ou sud-ouest préférable (RE2020 — baies toute hauteur)"],
    ["Nature du sol", "Pas de roche affleurante, pas d'ancienne décharge, pas de remblai non contrôlé"],
    ["Certificat d'Urbanisme", "Pas de CU négatif connu"],
    ["Surface terrain utile", "≥ 200 m² (Arko One) — ≥ 300 m² (Arko Max) selon PLU"],
  ];
  for (const [c, v] of annexe) tableRow([c, v], [68, 106]);

  // Pied de page final
  y += 8;
  checkY(10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Document généré automatiquement par la plateforme HOWNER — © 2026 Affinity House Factory",
    MARGIN, y,
  );

  return doc.output("blob");
}
