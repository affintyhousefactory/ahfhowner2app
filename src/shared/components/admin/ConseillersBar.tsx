"use client";

/**
 * Charge par conseiller AHF — ADR-035 §1 et §6.
 *
 * Barres empilées par statut commercial : le total dit qui porte combien, la
 * pile dit dans quel état. Un simple total confondrait dix leads « nouveau »
 * (charge à venir) et dix leads « signé » (travail fait).
 *
 * ⚠ Rien à voir avec `MandatairesBar`, qui mesure la performance du réseau
 * mandataire — domaine suspendu (ADR-028).
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { STATUTS_COMMERCIAUX } from "@/lib/crm";

export type ChargeConseiller = {
  conseiller: string;
  total: number;
} & Record<string, string | number>;

export function ConseillersBar({ data }: { data: ChargeConseiller[] }) {
  // Ne pas empiler des colonnes vides : huit statuts dont six à zéro rendent
  // la légende illisible pour rien.
  const statutsPresents = STATUTS_COMMERCIAUX.filter((s) =>
    data.some((d) => Number(d[s.id] ?? 0) > 0),
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
          Charge par conseiller
        </h3>
        <span className="text-xs text-white/25">empilé par statut commercial</span>
      </div>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/20">Aucun lead attribué</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 46)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
            <YAxis
              type="category"
              dataKey="conseiller"
              width={110}
              tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
            {statutsPresents.map((s) => (
              <Bar key={s.id} dataKey={s.id} name={s.label} stackId="charge" fill={s.couleur} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
