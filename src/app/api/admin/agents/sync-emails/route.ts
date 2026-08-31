/**
 * Rafraîchissement des colonnes `dernier_email_*` — ADR-044 §4.
 *
 * **Un seul appel Brevo pour toutes les agences.** C'est la raison d'être de
 * cette route : lire l'historique agence par agence ferait 167 requêtes pour
 * afficher un tableau. On lit les événements globaux, on les rapproche par
 * adresse, on n'écrit que ce qui a changé.
 *
 * ⚠ **Une agence absente du retour n'est pas une agence sans email.** La
 * fenêtre de lecture est bornée dans le temps ; au-delà, Brevo ne renvoie plus
 * rien. Effacer sur cette base ferait disparaître un envoi ancien mais réel —
 * la route ne fait donc que poser des valeurs, jamais les retirer.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { utilisateurCourant } from "@/shared/lib/supabase-server";
import { signalerPanne } from "@/shared/lib/panne";
import { derniersEmailsParAdresse } from "@/shared/lib/brevo-emails";

/**
 * Deux appelants légitimes : un administrateur qui clique « Rafraîchir », et
 * une tâche planifiée qui n'a pas de session.
 *
 * ⚠ Sans `CRON_SECRET` posé, le second chemin est **fermé** — et c'est le bon
 * défaut : une route qui rafraîchit en lisant Brevo ne doit pas être ouverte à
 * qui devine son URL. Tant que la variable n'existe pas, seul l'écran l'appelle.
 */
async function autorise(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const entete = req.headers.get("authorization");
    if (entete === `Bearer ${secret}`) return true;
  }
  const user = await utilisateurCourant();
  return user?.app_metadata?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await autorise(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const derniers = await derniersEmailsParAdresse();
  if ("error" in derniers) {
    return NextResponse.json({ error: derniers.error }, { status: 502 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("agents_immo")
    .select("id, email, dernier_email_at");

  if (error) {
    signalerPanne("admin/agents", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const agences = (data ?? []) as unknown as {
    id: string;
    email: string;
    dernier_email_at: string | null;
  }[];

  const maintenant = new Date().toISOString();
  let misAJour = 0;
  let inchanges = 0;

  for (const a of agences) {
    const trouve = derniers.get((a.email ?? "").toLowerCase());
    if (!trouve) continue;

    /* Rien de plus récent que ce qui est déjà en base : on ne réécrit pas.
       Comparer les dates plutôt qu'écrire systématiquement évite 167 UPDATE
       quotidiens pour un tableau qui ne bouge pas. */
    if (a.dernier_email_at && a.dernier_email_at >= trouve.date) {
      inchanges++;
      continue;
    }

    const { error: majErr } = await supabase
      .from("agents_immo")
      .update({
        dernier_email_at: trouve.date,
        dernier_email_sujet: trouve.sujet,
        dernier_email_etat: trouve.etat,
        dernier_email_sync_at: maintenant,
      })
      .eq("id", a.id);

    if (majErr) signalerPanne("admin/agents", majErr.message);
    else misAJour++;
  }

  return NextResponse.json({
    ok: true,
    agences: agences.length,
    adressesVuesChezBrevo: derniers.size,
    misAJour,
    inchanges,
    synchroniseA: maintenant,
  });
}
