/**
 * Création d'un agent immobilier partenaire — ADR-044.
 *
 * Deux origines, une seule route : la reprise d'un contact du vivier Brevo et
 * la saisie manuelle d'une agence rencontrée hors fichier. Elles ne diffèrent
 * que par ce qui pré-remplit le formulaire, jamais par ce qui est écrit.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { signalerPanne } from "@/shared/lib/panne";
import { emailMalForme } from "@/shared/lib/validation";
import { STATUTS_PARTENARIAT } from "@/lib/agents";

const CHAMPS = [
  "agence", "prenom", "nom", "fonction", "email", "tel", "tel_fixe",
  "adresse", "code_postal", "commune", "departement",
  "siren", "siret", "naf", "site_web", "linkedin",
  "brevo_contact_id", "source_contact", "url_source",
  "statut_partenariat", "responsable", "prochain_rappel_at", "notes",
] as const;

const STATUTS = STATUTS_PARTENARIAT.map((s) => s.id) as readonly string[];

/**
 * Liste légère des agences — sert le sélecteur d'apporteur de l'écran de
 * pré-qualification (ADR-044 §5).
 *
 * Volontairement pauvre : trois colonnes, pas la fiche. Le sélecteur a besoin
 * de reconnaître une agence, pas de la décrire.
 *
 * ⚠ Les agences closes ne sont pas retirées. Un lead peut avoir été apporté par
 * une agence devenue inactive, et le rattachement doit rester possible — c'est
 * l'assiette d'une commission, pas une liste de démarchage. Le statut est rendu
 * pour que l'écran le signale.
 */
export async function GET() {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { data, error } = await getSupabaseAdmin()
    .from("agents_immo")
    .select("id, agence, commune, departement, statut_partenariat")
    .order("agence", { ascending: true });

  if (error) {
    signalerPanne("admin/agents", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ agents: data ?? [] });
}

export async function POST(req: NextRequest) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const body = (await req.json()) as Record<string, unknown>;

  const ligne: Record<string, unknown> = {};
  for (const champ of CHAMPS) {
    if (champ in body) ligne[champ] = body[champ] === "" ? null : body[champ];
  }

  /* L'agence et l'email sont `not null` en base. Les contrôler ici permet de
     rendre un message lisible plutôt qu'une violation de contrainte brute —
     et surtout d'être précis sur celui des deux qui manque. */
  const agence = String(ligne.agence ?? "").trim();
  if (!agence) {
    return NextResponse.json({ error: "Le nom de l'agence est obligatoire." }, { status: 400 });
  }
  ligne.agence = agence;

  /* L'email n'est pas une commodité ici, contrairement au lead où il est
     facultatif depuis le 27 août : c'est **la clé de jonction avec Brevo**.
     Sans lui, la fiche ne peut ni recevoir d'email, ni dire ce qu'elle a reçu,
     ni empêcher qu'on la reprenne une seconde fois depuis le vivier. */
  const email = String(ligne.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "L'email est obligatoire — c'est lui qui rattache la fiche au contact Brevo." },
      { status: 400 },
    );
  }
  if (emailMalForme(email)) {
    return NextResponse.json({ error: "Email mal formé." }, { status: 400 });
  }
  ligne.email = email;

  if (ligne.statut_partenariat && !STATUTS.includes(String(ligne.statut_partenariat))) {
    return NextResponse.json({ error: "Statut de partenariat inconnu." }, { status: 400 });
  }
  if (ligne.responsable) ligne.responsable_at = new Date().toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from("agents_immo")
    .insert(ligne)
    .select("id, agent_number, agence")
    .single();

  if (error) {
    /* 23505 = l'index unique sur `lower(email)`. Ce n'est pas une panne, c'est
       une agence déjà suivie — et le conseiller doit pouvoir aller la voir
       plutôt que de comprendre un code Postgres. On lui rend donc l'identifiant
       de la fiche existante. */
    if (error.code === "23505") {
      const { data: existante } = await getSupabaseAdmin()
        .from("agents_immo")
        .select("id, agence")
        .ilike("email", email)
        .maybeSingle();
      return NextResponse.json(
        {
          error: `Cette adresse est déjà suivie${existante ? ` — ${(existante as { agence: string }).agence}` : ""}.`,
          agentExistant: (existante as { id: string } | null)?.id ?? null,
        },
        { status: 409 },
      );
    }
    signalerPanne("admin/agents", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, agent: data });
}
