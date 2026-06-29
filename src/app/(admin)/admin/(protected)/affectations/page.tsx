import { getSupabaseAdmin } from "@/shared/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AffectationsPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: leads }, { data: mandataires }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, prenom, nom, email, statut, commune, departement, pack_terrain, mandataire_id, created_at")
      .is("mandataire_id", null)
      .not("statut", "eq", "perdu")
      .order("created_at", { ascending: false }),
    supabase
      .from("mandataires")
      .select("id, prenom, nom, statut, zone_activite")
      .eq("statut", "actif"),
  ]);

  const now = Date.now();
  const h48 = 48 * 3600 * 1000;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Affectations</h1>
        <p className="mt-1 text-sm text-white/40">Leads en attente d&apos;un mandataire</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Leads non affectés */}
        <div className="space-y-3">
          {(leads ?? []).length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#252521] p-8 text-center text-sm text-white/20">
              Aucun lead en attente d&apos;affectation
            </div>
          )}
          {(leads ?? []).map((l) => {
            const isUrgent = (now - new Date(l.created_at).getTime()) > h48;
            return (
              <div
                key={l.id}
                className={`rounded-2xl border bg-[#252521] p-5 ${isUrgent ? "border-[#e07b28]/40" : "border-white/10"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{l.prenom} {l.nom}</p>
                    <p className="mt-0.5 text-sm text-white/40">{l.email}</p>
                    <div className="mt-2 flex gap-2 text-xs text-white/30">
                      <span>{l.commune ?? l.departement ?? "Zone n/r"}</span>
                      {l.pack_terrain && <span>· {l.pack_terrain}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isUrgent && (
                      <span className="rounded-full bg-[#e07b28]/20 px-2.5 py-1 text-xs text-[#e07b28]">
                        &gt; 48h
                      </span>
                    )}
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="rounded-xl bg-[#7469F4]/20 px-3 py-1.5 text-xs font-medium text-[#7469F4] hover:bg-[#7469F4]/30 transition-colors"
                    >
                      Affecter →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandataires actifs */}
        <div className="rounded-2xl border border-white/10 bg-[#252521] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Mandataires actifs ({(mandataires ?? []).length})
          </h2>
          <div className="space-y-2">
            {(mandataires ?? []).map((m) => (
              <Link
                key={m.id}
                href={`/admin/mandataires/${m.id}`}
                className="block rounded-xl bg-white/5 px-3 py-2.5 text-sm hover:bg-white/10 transition-colors"
              >
                <p className="text-white">{m.prenom} {m.nom}</p>
                {(m.zone_activite as string[] | null)?.length ? (
                  <p className="mt-0.5 text-xs text-white/30 truncate">
                    {(m.zone_activite as string[]).slice(0, 3).join(", ")}
                  </p>
                ) : null}
              </Link>
            ))}
            {(mandataires ?? []).length === 0 && (
              <p className="text-sm text-white/20">Aucun mandataire actif</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
