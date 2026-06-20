import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

export interface ConfigurateurRecapProps {
  // Identité
  nom: string;
  email: string;
  tel?: string | null;
  // Produit
  modele?: string | null;       // 'Arko One' | 'Arko Max'
  // Options configurateur
  bardage?: string | null;
  facade?: string | null;
  bar?: string | null;
  chambre?: string | null;
  interieur?: string | null;
  terrasseM2?: number | null;
  optionsLabels?: string[];     // libellés des options sélectionnées
  totalEstime?: string | null;  // ex. "67 400 €"
  // Pack terrain
  pack?: string | null;         // 'essentiel' | 'etendu' | 'departement'
  zones?: string[] | null;
  budget?: string | null;
}

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — communes ciblées",
  etendu: "Pack Étendu — zones élargies",
  departement: "Pack Département",
};

export default function ConfigurateurRecap({
  nom,
  email,
  tel,
  modele,
  bardage,
  facade,
  bar,
  chambre,
  interieur,
  terrasseM2,
  optionsLabels,
  totalEstime,
  pack,
  zones,
  budget,
}: ConfigurateurRecapProps) {
  const packLabel = pack ? (PACK_LABELS[pack] ?? pack) : null;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Récapitulatif de votre configuration ARKO — Affinity House Factory</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>AFFINITY HOUSE FACTORY</Text>

          <Heading style={h1}>Récapitulatif de votre demande</Heading>

          <Text style={text}>
            Bonjour {nom},
          </Text>
          <Text style={text}>
            Voici le récapitulatif de votre configuration et de votre demande de
            recherche de terrain. Nous revenons vers vous sous{" "}
            <strong>48 h ouvrées</strong>.
          </Text>

          {/* Maison */}
          {modele && (
            <Section style={card}>
              <Text style={cardTitle}>Votre maison</Text>
              <Row>
                <Column style={col}>
                  <Text style={label}>Modèle</Text>
                  <Text style={value}>{modele}</Text>
                </Column>
                {bardage && (
                  <Column style={col}>
                    <Text style={label}>Bardage</Text>
                    <Text style={value}>{bardage}</Text>
                  </Column>
                )}
              </Row>
              <Row>
                {facade && (
                  <Column style={col}>
                    <Text style={label}>Cuisine</Text>
                    <Text style={value}>{facade}</Text>
                  </Column>
                )}
                {bar && (
                  <Column style={col}>
                    <Text style={label}>Barre</Text>
                    <Text style={value}>{bar}</Text>
                  </Column>
                )}
              </Row>
              <Row>
                {chambre && (
                  <Column style={col}>
                    <Text style={label}>Chambre</Text>
                    <Text style={value}>{chambre}</Text>
                  </Column>
                )}
                {interieur && (
                  <Column style={col}>
                    <Text style={label}>Intérieur</Text>
                    <Text style={value}>{interieur}</Text>
                  </Column>
                )}
              </Row>
              {terrasseM2 != null && terrasseM2 > 0 && (
                <Row>
                  <Column style={col}>
                    <Text style={label}>Terrasse</Text>
                    <Text style={value}>{terrasseM2} m²</Text>
                  </Column>
                </Row>
              )}
              {optionsLabels && optionsLabels.length > 0 && (
                <Row>
                  <Column>
                    <Text style={label}>Options</Text>
                    <Text style={value}>{optionsLabels.join(", ")}</Text>
                  </Column>
                </Row>
              )}
              {totalEstime && (
                <>
                  <Hr style={innerHr} />
                  <Row>
                    <Column>
                      <Text style={label}>Estimation totale</Text>
                      <Text style={{ ...value, fontWeight: "600", fontSize: "17px" }}>
                        {totalEstime}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>
          )}

          {/* Terrain */}
          {packLabel && (
            <Section style={card}>
              <Text style={cardTitle}>Recherche de terrain</Text>
              <Row>
                <Column>
                  <Text style={label}>Pack</Text>
                  <Text style={value}>{packLabel}</Text>
                </Column>
              </Row>
              {zones && zones.length > 0 && (
                <Row>
                  <Column>
                    <Text style={label}>Zones / communes</Text>
                    <Text style={value}>{zones.join(", ")}</Text>
                  </Column>
                </Row>
              )}
              {budget && (
                <Row>
                  <Column>
                    <Text style={label}>Budget terrain</Text>
                    <Text style={value}>{budget}</Text>
                  </Column>
                </Row>
              )}
            </Section>
          )}

          {/* Contact */}
          <Section style={card}>
            <Text style={cardTitle}>Vos coordonnées</Text>
            <Row>
              <Column style={col}>
                <Text style={label}>Nom</Text>
                <Text style={value}>{nom}</Text>
              </Column>
              <Column style={col}>
                <Text style={label}>Email</Text>
                <Text style={value}>{email}</Text>
              </Column>
            </Row>
            {tel && (
              <Row>
                <Column style={col}>
                  <Text style={label}>Téléphone</Text>
                  <Text style={value}>{tel}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Affinity House Factory —{" "}
            <a href="https://affinityhome.fr" style={link}>
              affinityhome.fr
            </a>
            <br />
            Cet email confirme la réception de votre demande.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ConfigurateurRecap.PreviewProps = {
  nom: "Jean Martin",
  email: "jean.martin@example.com",
  tel: "06 12 34 56 78",
  modele: "Arko One",
  bardage: "Anthracite",
  facade: "Îlot façade foncée",
  bar: "Îlot avec barre",
  chambre: "Chêne naturel",
  interieur: "Intérieur bois",
  terrasseM2: 12,
  optionsLabels: ["Pergola bois", "Pompe à chaleur"],
  totalEstime: "67 400 €",
  pack: "etendu",
  zones: ["Pays Basque", "Landes"],
  budget: "80 000 €",
} satisfies ConfigurateurRecapProps;

const body = { backgroundColor: "#f4f4f0", fontFamily: "Georgia, serif" };

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "40px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const brand = {
  fontSize: "11px",
  letterSpacing: "0.12em",
  color: "#888",
  textTransform: "uppercase" as const,
  marginBottom: "32px",
};

const h1 = {
  fontSize: "22px",
  fontWeight: "500",
  color: "#1a1a18",
  margin: "0 0 20px",
  letterSpacing: "-0.02em",
};

const text = { fontSize: "15px", lineHeight: "1.6", color: "#3a3a38", margin: "0 0 12px" };

const card = {
  backgroundColor: "#f8f8f5",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
};

const cardTitle = {
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#888",
  margin: "0 0 12px",
  fontFamily: "sans-serif",
};

const col = { paddingRight: "16px" };

const label = {
  fontSize: "11px",
  letterSpacing: "0.06em",
  color: "#aaa",
  textTransform: "uppercase" as const,
  margin: "8px 0 2px",
  fontFamily: "sans-serif",
};

const value = { fontSize: "14px", color: "#1a1a18", margin: "0 0 4px" };

const innerHr = { borderColor: "#e8e8e4", margin: "12px 0" };

const hr = { borderColor: "#e8e8e4", margin: "28px 0 20px" };

const footer = { fontSize: "12px", lineHeight: "1.6", color: "#aaa", fontFamily: "sans-serif" };

const link = { color: "#aaa" };
