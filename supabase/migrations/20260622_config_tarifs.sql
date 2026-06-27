-- ADR-007 (partiel) — Variables de configuration et catalogue options/produits
-- Source de vérité pour les tarifs transport et les options configurateur.
-- Le front lit ces valeurs via env vars (fallback) ; le portail Mandataire les lira ici.

-- ── Table config_variables ─────────────────────────────────────────────────────
-- Namespace / clé / valeur numérique ou texte + description métier.
-- Lecture publique (valeurs non sensibles) ; écriture service_role uniquement.

CREATE TABLE IF NOT EXISTS config_variables (
  namespace    text    NOT NULL,
  key          text    NOT NULL,
  value_num    numeric,
  value_txt    text,
  description  text,
  updated_at   timestamptz DEFAULT now(),
  PRIMARY KEY (namespace, key)
);

ALTER TABLE config_variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_variables_select_public"
  ON config_variables FOR SELECT TO anon USING (true);

-- Écriture réservée service_role (bypass RLS automatique)

-- Paramètres transport convoi
INSERT INTO config_variables (namespace, key, value_num, description) VALUES
  ('transport', 'tarif_eur_tonne_km',      0.24,    '€ par tonne par kilomètre (tarif convoi exceptionnel)'),
  ('transport', 'poids_arko_one_tonnes',   6,       'Poids estimé Arko One en tonnes (convoi)'),
  ('transport', 'poids_arko_max_tonnes',   9,       'Poids estimé Arko Max en tonnes (convoi)'),
  ('transport', 'grutage_eur',             1440,    'Forfait grutage + pose TTC (€)'),
  ('transport', 'road_factor',             1.3,     'Facteur haversine → distance route réelle'),
  ('transport', 'usine_lat',               43.4933, 'Latitude atelier de fabrication (Bayonne — à affiner)'),
  ('transport', 'usine_lon',              -1.4748,  'Longitude atelier de fabrication (Bayonne — à affiner)')
ON CONFLICT (namespace, key) DO UPDATE
  SET value_num = EXCLUDED.value_num, description = EXCLUDED.description, updated_at = now();

-- Paramètres produits
INSERT INTO config_variables (namespace, key, value_num, description) VALUES
  ('produit_one', 'base_eur',             59900, 'Prix de base Arko One TTC (€)'),
  ('produit_one', 'per_m2_eur',           2250,  'Prix par m² de surface supplémentaire'),
  ('produit_one', 'terrasse_per_m2_eur',  300,   'Prix terrasse bois par m²'),
  ('produit_one', 'total_exemplaires',    12,    'Nombre total d'exemplaires série 01'),
  ('produit_max', 'base_eur',             89900, 'Prix de base Arko Max TTC (€)'),
  ('produit_max', 'per_m2_eur',           2250,  'Prix par m² de surface supplémentaire'),
  ('produit_max', 'terrasse_per_m2_eur',  300,   'Prix terrasse bois par m²'),
  ('produit_max', 'total_exemplaires',    5,     'Nombre total d'exemplaires série 01')
ON CONFLICT (namespace, key) DO UPDATE
  SET value_num = EXCLUDED.value_num, description = EXCLUDED.description, updated_at = now();

-- ── Table options_produits ──────────────────────────────────────────────────────
-- Catalogue des options du configurateur avec leurs prix.
-- Commun aux deux produits sauf mention (produit IS NULL = tous).

CREATE TABLE IF NOT EXISTS options_produits (
  id           text    PRIMARY KEY,
  label        text    NOT NULL,
  price_eur    integer NOT NULL,
  produit      text,           -- NULL = One + Max ; 'one' ou 'max' si spécifique
  categorie    text    NOT NULL,
  description  text,
  actif        boolean NOT NULL DEFAULT true,
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE options_produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "options_produits_select_public"
  ON options_produits FOR SELECT TO anon USING (actif = true);

-- Options configurateur (couche 2 — pack)
INSERT INTO options_produits (id, label, price_eur, produit, categorie, description) VALUES
  ('cuisine_premium', 'Pack Cuisine Premium',       4200, NULL, 'amenagement', 'Façades laquées, plan de travail quartz, robinetterie haut de gamme'),
  ('sdb_premium',     'Pack Salle d''eau Premium',  3360, NULL, 'amenagement', 'Douche à l''italienne XXL, robinetterie thermostatique, miroir éclairé'),
  ('poele',           'Poêle à bois',               5400, NULL, 'equipement',  'Poêle à bois certifié Flamme Verte 7★, conduit isolé intégré'),
  ('solaire',         'Pack Solaire',               5880, NULL, 'equipement',  'Panneaux 3 kWc + micro-onduleur + supervision'),
  ('domotique',       'Pack Domotique',             2640, NULL, 'equipement',  'Volets motorisés, thermostat, éclairage scénarisé — protocole Matter')
ON CONFLICT (id) DO UPDATE
  SET label = EXCLUDED.label, price_eur = EXCLUDED.price_eur,
      categorie = EXCLUDED.categorie, description = EXCLUDED.description,
      updated_at = now();

-- Options bardage (couche 1 — visuel, inclus dans le prix de base)
CREATE TABLE IF NOT EXISTS options_bardage (
  id      text PRIMARY KEY,
  label   text NOT NULL,
  hex     text,
  tint    text,
  lift    numeric DEFAULT 0,
  actif   boolean NOT NULL DEFAULT true
);

ALTER TABLE options_bardage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options_bardage_select_public"
  ON options_bardage FOR SELECT TO anon USING (actif = true);

INSERT INTO options_bardage (id, label, hex, tint, lift) VALUES
  ('anthracite', 'Anthracite',    '#3a3f3c', NULL,     0),
  ('gris',       'Gris clair',    '#bcbeb9', '#c7c9c4', 0.46),
  ('bleu',       'Bleu pigeon',   '#5d7d8f', '#5d7d8f', 0.12),
  ('vert',       'Vert',          '#5a6a43', '#62733f', 0.07)
ON CONFLICT (id) DO UPDATE
  SET label = EXCLUDED.label, hex = EXCLUDED.hex, tint = EXCLUDED.tint,
      lift = EXCLUDED.lift;
