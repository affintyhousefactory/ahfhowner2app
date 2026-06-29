"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  nouveau: "#7469F4",
  qualifié: "#60a5fa",
  affecté: "#e07b28",
  en_cours: "#facc15",
  finalisé: "#2d6b27",
  perdu: "#6b7280",
};

export function LeadsDonut({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h3 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">Leads par statut</h3>
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
