interface ConfigJson {
  bardage?: string;
  facade?: string;
  bar?: string;
  chambre?: string;
  interieur?: string;
  terrasseM2?: number;
}

interface LeadConfigurateurProps {
  produit: string | null;
  surface: string | null;
  house_total: number | null;
  delivery: number | null;
  grand_total: number | null;
  terrain_mode: string | null;
  pack_terrain: string | null;
  config_json: ConfigJson | null;
  options_labels: string[] | null;
}

const BARDAGE: Record<string, string> = {
  anthracite: "Anthracite",
  gris: "Gris clair",
  bleu: "Bleu pigeon",
  vert: "Vert",
};
const FACADE: Record<string, string> = {
  fonce: "Îlot façade foncée",
  clair: "Îlot façade claire",
};
const BAR: Record<string, string> = {
  avec: "Îlot avec barre",
  sans: "Îlot sans barre",
};
const CHAMBRE: Record<string, string> = {
  naturel: "Chêne naturel",
  ardoise: "Reflet ardoise",
  olive: "Touche olive",
};
const INTERIEUR: Record<string, string> = {
  bois: "Intérieur bois",
  placo: "Intérieur clair",
};
const PACK_TERRAIN: Record<string, string> = {
  essentiel: "Pack Essentiel",
  etendu: "Pack Étendu",
  departement: "Pack Département",
};

function eur(v: number | null) {
  if (!v) return "—";
  return `${v.toLocaleString("fr-FR")} €`;
}

function Row({ label, value, accent, sub }: { label: string; value: string; accent?: boolean; sub?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={sub ? "text-white/30 text-xs pl-2" : "text-white/50 text-sm"}>{label}</dt>
      <dd className={`text-sm text-right ${accent ? "font-semibold text-[#e07b28]" : "text-white"}`}>{value}</dd>
    </div>
  );
}

export default function LeadConfigurateur({
  produit,
  surface,
  house_total,
  delivery,
  grand_total,
  terrain_mode,
  pack_terrain,
  config_json,
  options_labels,
}: LeadConfigurateurProps) {
  if (!produit && !house_total && !config_json) {
    return (
      <p className="text-sm text-white/20 italic">Aucune configuration enregistrée (lead saisi manuellement).</p>
    );
  }

  const cfg = config_json ?? {};
  const opts = options_labels ?? [];

  const terrainLabel =
    terrain_mode === "have"
      ? "J'ai un terrain"
      : terrain_mode === "pack" && pack_terrain
      ? (PACK_TERRAIN[pack_terrain] ?? pack_terrain)
      : null;

  return (
    <dl className="space-y-1">
      {/* Modèle */}
      {(produit || surface) && (
        <Row label="Modèle" value={[produit, surface].filter(Boolean).join(" ")} />
      )}
      {cfg.bardage && (
        <Row label="Bardage" value={BARDAGE[cfg.bardage] ?? cfg.bardage} />
      )}

      {/* Séparateur aménagements */}
      {(cfg.facade || cfg.bar || cfg.chambre || cfg.interieur) && (
        <div className="!my-3 border-t border-white/5" />
      )}
      {cfg.facade && <Row label="Cuisine" value={FACADE[cfg.facade] ?? cfg.facade} />}
      {cfg.bar    && <Row label="Barre"   value={BAR[cfg.bar] ?? cfg.bar} />}
      {cfg.chambre  && <Row label="Chambre"  value={CHAMBRE[cfg.chambre] ?? cfg.chambre} />}
      {cfg.interieur && <Row label="Intérieur" value={INTERIEUR[cfg.interieur] ?? cfg.interieur} />}
      {cfg.terrasseM2 && cfg.terrasseM2 > 0 && (
        <Row label="Terrasse" value={`${cfg.terrasseM2} m²`} />
      )}

      {/* Options */}
      {opts.length > 0 && (
        <>
          <div className="!my-3 border-t border-white/5" />
          {opts.map((o) => (
            <Row key={o} label={o} value="inclus" sub />
          ))}
        </>
      )}

      {/* Terrain */}
      {terrainLabel && (
        <>
          <div className="!my-3 border-t border-white/5" />
          <Row label="Situation terrain" value={terrainLabel} />
        </>
      )}

      {/* Prix */}
      {(house_total || delivery || grand_total) && (
        <>
          <div className="!my-3 border-t border-white/5" />
          {house_total && <Row label="Votre Arko" value={`${eur(house_total)} TTC`} />}
          {delivery != null && delivery > 0 && <Row label="Livraison estimée" value={eur(delivery)} />}
          {grand_total && <Row label="Total estimé" value={eur(grand_total)} accent />}
        </>
      )}
    </dl>
  );
}
