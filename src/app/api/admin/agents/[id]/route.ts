/**
 * Fiche d'un agent immobilier partenaire — lecture et mise à jour (ADR-044).
 *
 * ⚠ Le changement de `statut_partenariat` **sort de la base** : il recopie le
 * statut chez Brevo, et « Ne pas recontacter » y désinscrit l'adresse (§6).
 * Sans cette remontée, le fichier qui cible les campagnes ignorerait le travail
 * fait au téléphone, et un agent ayant dit non recevrait l'emailing suivant.
 *
 * ⚠ **L'échec de la remontée Brevo n'annule pas l'enregistrement.** Le statut
 * est un fait interne ; le refuser parce qu'un service tiers est indisponible
 * ferait perdre au conseiller ce qu'il vient de saisir. La divergence est
 * signalée dans la réponse (`brevo`), jamais tue — leçon du `notified: true`
 * menteur d'août : un triptyque n'a de valeur que s'il dit non.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { signalerPanne } from "@/shared/lib/panne";
import { STATUTS_PARTENARIAT, remonteeBrevo } from "@/lib/agents";

/**
 * Champs modifiables. Liste blanche explicite, comme la route des leads : un
 * `update` qui accepte le corps de la requête tel quel laisse écrire
 * `created_at`, `agent_number` ou `id`.
 */
const ALLOWED_FIELDS = [
  // Identité
  "agence", "prenom", "nom", "fonction", "email", "tel", "tel_fixe",
  // Localisation
  "adresse", "code_postal", "commune", "departement",
  // Entreprise
  "siren", "siret", "naf", "site_web", "linkedin",
  // Suivi
  "statut_partenariat", "responsable", "prochain_rappel_at", "notes",
  /* Corrigeable à la main bien qu'un trigger la maintienne : une issue se note
     pendant l'appel et se corrige après coup sans rouvrir le journal. Le
     trigger reprend la main au prochain appel journalisé — c'est lui la source,
     la saisie n'est qu'un rattrapage. Même arbitrage que sur les leads. */
  "derniere_issue",
] as const;

const STATUTS = STATUTS_PARTENARIAT.map((s) => s.id) as readonly string[];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("agents_immo")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const champ of ALLOWED_FIELDS) {
    if (champ in body) patch[champ] = body[champ] === "" ? null : body[champ];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ modifiable fourni." }, { status: 400 });
  }

  /* La base ne porte pas de CHECK sur le statut — le cycle de partenariat n'est
     pas stabilisé et un CHECK figé imposerait une migration à chaque ajout
     (ADR-044 §7). La contrainte est donc ici, et elle doit l'être : sans elle,
     une valeur inventée passerait en base et le Kanban afficherait la colonne
     par défaut sans que rien ne le signale. */
  if ("statut_partenariat" in patch && !STATUTS.includes(String(patch.statut_partenariat))) {
    return NextResponse.json({ error: "Statut de partenariat inconnu." }, { status: 400 });
  }

  /* `responsable_at` accompagne `responsable` : savoir depuis quand une agence
     est portée par quelqu'un change la lecture d'un silence de trois semaines. */
  if ("responsable" in patch) {
    patch.responsable_at = patch.responsable ? new Date().toISOString() : null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("agents_immo")
    .update(patch)
    .eq("id", id)
    .select("id, email, statut_partenariat")
    .single();

  if (error) {
    signalerPanne("admin/agents", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let brevo: "ignore" | "ok" | "echec" = "ignore";
  if ("statut_partenariat" in patch && data?.email) {
    brevo = (await remonterChezBrevo(data.email, String(patch.statut_partenariat))) ? "ok" : "echec";
  }

  return NextResponse.json({ ok: true, agent: data, brevo });
}

/**
 * Recopie le statut dans l'attribut `STATUT_PROSPECTION` du contact, et
 * désinscrit l'adresse quand le partenariat est refusé.
 *
 * ⚠ `emailBlacklisted` n'est jamais remis à `false` ici. Réinscrire quelqu'un
 * qui s'est opposé ne peut pas être l'effet de bord d'un clic dans un Kanban :
 * cela se fait depuis Brevo, en connaissance de cause. La fonction ne pose donc
 * le drapeau que dans un sens.
 */
async function remonterChezBrevo(email: string, statut: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    signalerPanne("admin/agents/brevo", "BREVO_API_KEY manquant — statut non remonté.");
    return false;
  }

  const { statutProspection, blacklister } = remonteeBrevo(statut);

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        attributes: { STATUT_PROSPECTION: statutProspection },
        ...(blacklister ? { emailBlacklisted: true } : {}),
      }),
    });
    /* 204 est le succès normal de cette route ; 404 dit que l'agence n'est pas
       (ou plus) un contact Brevo — ce n'est pas une panne, c'est une agence
       saisie à la main hors du fichier de prospection. */
    if (res.status === 404) return true;
    if (!res.ok && res.status !== 204) {
      signalerPanne("admin/agents/brevo", `${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    signalerPanne("admin/agents/brevo", e);
    return false;
  }
}
