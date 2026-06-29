import type { ContratData } from "@/shared/components/mandataire/ContratCanvas";

// Génère un PDF du contrat signé et retourne un Blob
export async function generateContratPdf(contrat: ContratData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const MARGIN = 18;
  const MAX_W = W - MARGIN * 2;
  let y = 20;

  const line = (dy = 5) => { y += dy; };
  const section = (title: string) => {
    y += 4;
    doc.setFillColor(116, 105, 244);
    doc.rect(MARGIN, y, MAX_W, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), MARGIN + 3, y + 4.2);
    doc.setTextColor(30, 30, 28);
    y += 9;
  };
  const field = (label: string, value: string) => {
    if (!value) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 28);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(value, MAX_W - 50);
    doc.text(lines, MARGIN + 52, y);
    y += Math.max(5, lines.length * 4.5);
  };

  // En-tête
  doc.setFillColor(30, 30, 28);
  doc.rect(0, 0, W, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTRAT-CADRE DE SOUS-TRAITANCE MANDATAIRE", MARGIN, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text("Pack Recherche Terrain — Plateforme HOWNER", MARGIN, 13.5);
  y = 24;

  // AHF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "AHF · SAS · SIRET 982 581 506 00010 · 28 Chemin de Sabalce OEV, 64100 Bayonne · contact@affinityhousefactory.com",
    MARGIN, y,
  );
  doc.setTextColor(30, 30, 28);
  line(8);

  // Page 1 — Identification
  section("Identification du Mandataire (Sous-traitant)");
  field("Nom / Raison sociale", contrat.nom_raison_sociale);
  field("Forme juridique", contrat.forme_juridique);
  field("SIRET", contrat.siret);
  field("Adresse", contrat.adresse);
  field("Immatriculation RSAC", contrat.immatriculation_rsac);
  field("Réseau carte T", contrat.reseau_carte_t);
  field("Carte professionnelle T", contrat.carte_t_numero);
  field("Email professionnel", contrat.email);
  field("Qualité dans ce contrat", contrat.qualite);

  // Article 16 — Contact RGPD
  section("Article 16 — Contact des Parties (RGPD)");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("AHF — Responsable de traitement", MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 28);
  field("Contact DPA / RGPD", "contact@affinityhousefactory.com");
  field("Adresse", "28 Chemin de Sabalce OEV, 64100 Bayonne");
  field("Notifications violations", "contact@affinityhousefactory.com — délai 48h");

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Mandataire partenaire — Sous-traitant", MARGIN, y);
  y += 5;
  doc.setTextColor(30, 30, 28);
  field("Contact DPA / RGPD", contrat.dpa_nom_prenom);
  field("Email professionnel", contrat.dpa_email);
  field("Email notifications violations", contrat.dpa_email_violations || contrat.dpa_email);

  // Signatures
  section("Signatures");

  // AHF (gauche)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Pour Affinity House Factory", MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 28);
  doc.setFontSize(9);
  doc.text("Albert Puigbo — Directeur Général", MARGIN, y);
  y += 4;
  doc.text(`Fait à Bayonne, le ${contrat.signature_date}`, MARGIN, y);
  y += 10;

  // Mandataire (droite) — nom + qualité
  const sigX = W / 2 + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Pour le Mandataire partenaire", sigX, y - 19);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 28);
  doc.setFontSize(9);
  doc.text(
    `${contrat.signature_prenom} ${contrat.signature_nom} — ${contrat.signature_qualite}`,
    sigX, y - 14,
  );

  // Image de la signature canvas
  if (contrat.signature_data_url) {
    try {
      const sigW = 70;
      const sigH = 22;
      doc.addImage(contrat.signature_data_url, "PNG", sigX, y - 10, sigW, sigH);
      y += 15;
    } catch {
      // Signature image non disponible
    }
  }

  // Ligne de séparation finale
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Document généré automatiquement par la plateforme HOWNER — © 2026 Affinity House Factory",
    MARGIN, y,
  );

  return doc.output("blob");
}
