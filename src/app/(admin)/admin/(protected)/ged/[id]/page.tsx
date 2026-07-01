import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadDocuments from "@/components/admin/LeadDocuments";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GedDossierPage({ params }: Props) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, lead_number, prenom, nom, commune, statut, mandataire_id")
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const identifier = `#${lead.lead_number ?? "—"} — ${lead.prenom} ${lead.nom}`;

  return (
    <div className="p-8">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/admin/ged"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors"
        >
          ← GED Dossiers
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{identifier}</h1>
          {lead.commune && (
            <span className="text-sm text-white/30">{lead.commune}</span>
          )}
        </div>
      </div>

      {/* Document manager */}
      <div className="max-w-2xl rounded-2xl border border-white/10 bg-[#252521] p-6">
        <LeadDocuments
          leadId={lead.id}
          currentMandataireId={lead.mandataire_id ?? null}
        />
      </div>
    </div>
  );
}
