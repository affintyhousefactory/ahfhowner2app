"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Perf = { nom: string; count: number; ca: number };

export function MandatairesBar({ data }: { data: Perf[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h3 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">Performance mandataires</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/20">Aucun dossier finalisé</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={20}>
            <XAxis dataKey="nom" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              formatter={(val, name) => [
                name === "ca" ? `${Number(val).toLocaleString("fr-FR")} €` : val,
                name === "ca" ? "CA généré" : "Dossiers finalisés",
              ]}
            />
            <Bar dataKey="count" fill="#7469F4" radius={[4, 4, 0, 0]} name="count" />
            <Bar dataKey="ca" fill="#2d6b27" radius={[4, 4, 0, 0]} name="ca" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
