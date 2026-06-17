import type { Metadata } from "next";

// /viewer est un composant client (R3F) : le metadata ne peut pas y être
// exporté. Ce layout serveur porte le noindex (ADR-018) — cohérent avec le
// disallow de robots.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
