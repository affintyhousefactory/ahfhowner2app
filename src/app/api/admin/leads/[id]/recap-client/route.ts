import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";

const TEMPLATE_ID = Number(process.env.BREVO_TEMPLATE_RECAP ?? 0);

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — 4 900 € TTC",
  etendu: "Pack Étendu — 7 300 € TTC",
  departement: "Pack Département — 11 200 € TTC",
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead } = await supabase
    .from("leads")
    .select("prenom, nom, email, tel, produit, surface, house_total, delivery, grand_total, terrain_mode, pack_terrain")
    .eq("id", id)
    .single();

  if (!lead?.email) {
    return NextResponse.json({ error: "Lead introuvable ou sans email" }, { status: 404 });
  }

  if (!TEMPLATE_ID) {
    return NextResponse.json({ error: "BREVO_TEMPLATE_RECAP non défini" }, { status: 500 });
  }

  const terrainLabel =
    lead.terrain_mode === "pack" && lead.pack_terrain
      ? PACK_LABELS[lead.pack_terrain] ?? "Pack Terrain Affinity"
      : lead.terrain_mode === "have"
        ? "J'ai un terrain"
        : "Non renseigné";

  const livraisonLabel =
    lead.terrain_mode === "pack"
      ? "Via pack terrain"
      : lead.delivery != null
        ? `${lead.delivery.toLocaleString("fr-FR")} €`
        : "À estimer";

  const totalEstime =
    lead.grand_total && lead.grand_total > 0
      ? `${lead.grand_total.toLocaleString("fr-FR")} €`
      : lead.house_total
        ? `${lead.house_total.toLocaleString("fr-FR")} €`
        : "";

  try {
    await sendBrevoTemplate({
      templateId: TEMPLATE_ID,
      to: [{ email: lead.email, name: `${lead.prenom ?? ""} ${lead.nom ?? ""}`.trim() }],
      params: {
        PRENOM: lead.prenom ?? "",
        NOM: lead.nom ?? "",
        EMAIL: lead.email ?? "",
        TEL: lead.tel ?? "",
        PRODUIT: `${lead.produit ?? ""} ${lead.surface ?? ""}`.trim(),
        MAISON_TTC: lead.house_total ? `${lead.house_total.toLocaleString("fr-FR")} €` : "",
        LIVRAISON: livraisonLabel,
        TERRAIN: terrainLabel,
        MODELE: `${lead.produit ?? ""} ${lead.surface ?? ""}`.trim(),
        TOTAL_ESTIME: totalEstime,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur envoi email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
