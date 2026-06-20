-- ADR-026 — Table contacts : leads formulaire /contact
-- Insert public via anon (Turnstile vérifié côté serveur avant insert)
-- Lecture/update réservés service_role (pas de policy SELECT)

CREATE TABLE IF NOT EXISTS contacts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now() NOT NULL,
  prenom       text        NOT NULL,
  nom          text        NOT NULL,
  email        text        NOT NULL,
  tel          text,
  produit      text        CHECK (produit IS NULL OR produit IN ('one', 'max', 'autre')),
  message      text        NOT NULL,
  turnstile_ok boolean     NOT NULL DEFAULT false,
  statut       text        NOT NULL DEFAULT 'nouveau'
               CHECK (statut IN ('nouveau', 'en_cours', 'traite')),
  notes        text
);

CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_statut     ON contacts(statut);
CREATE INDEX IF NOT EXISTS idx_contacts_created    ON contacts(created_at DESC);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_insert_public"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);
