"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function Entonnoir({ total, affectes, finalises }: { total: number; affectes: number; finalises: number }) {
  const data = [
    { name: "Leads", value: total, fill: "#7469F4" },
    { name: "Affectés", value: affectes, fill: "#e07b28" },
    { name: "Finalisés", value: finalises, fill: "#2d6b27" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#252521] p-6">
      <h3 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">Entonnoir conversion</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={28}>
          <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip
            contentStyle={{ background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
