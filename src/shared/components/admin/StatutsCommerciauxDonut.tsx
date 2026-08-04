"use client";

/**
 * Répartition des leads par statut commercial — ADR-035 §6.
 *
 * Les couleurs viennent de `STATUTS_COMMERCIAUX` (`src/lib/crm.ts`) : les mêmes
 * qu'en liste, en Kanban et sur la fiche. Un statut ne doit pas changer de
 * teinte selon l'écran, sinon la lecture d'un coup d'œil ne veut plus rien dire.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { STATUTS_COMMERCIAUX } from "@/lib/crm";

export function StatutsCommerciauxDonut({ data }: { data: Record<string, number> }) {
  // Ordre du référentiel, pas ordre d'apparition : l'anneau suit la progression
  // commerciale (nouveau → signé), ce qui le rend lisible sans légende.
  const chartData = STATUTS_COMMERCIAUX.map((s) => ({
    name: s.label,
    value: data[s.id] ?? 0,
    couleur: s.couleur,
  })).filter((d) => d.value > 0);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
        Leads par statut commercial
      </h3>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-white/20">Aucun lead</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.couleur} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
