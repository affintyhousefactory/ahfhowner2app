"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  proposé: "#7469F4",
  accepté: "#60a5fa",
  refusé: "#6b7280",
  en_cours: "#e07b28",
  finalisé: "#2d6b27",
};

export function DossiersDonut({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h3 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">Dossiers par statut</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#444"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
