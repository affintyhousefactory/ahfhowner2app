import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface ContactConfirmationProps {
  prenom: string;
  nom: string;
  produit?: string | null;
  message: string;
}

const PRODUIT_LABELS: Record<string, string> = {
  one: "Arko One (20 m²)",
  max: "Arko Max (40 m²)",
  autre: "Autre demande",
};

export default function ContactConfirmation({
  prenom,
  nom,
  produit,
  message,
}: ContactConfirmationProps) {
  const produitLabel = produit ? (PRODUIT_LABELS[produit] ?? produit) : null;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre message a bien été reçu — Affinity House Factory</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>AFFINITY HOUSE FACTORY</Text>

          <Heading style={h1}>Votre message a bien été reçu</Heading>

          <Text style={text}>
            Bonjour {prenom} {nom},
          </Text>
          <Text style={text}>
            Nous avons bien reçu votre message et reviendrons vers vous sous{" "}
            <strong>24 h ouvrées</strong>.
          </Text>

          {produitLabel && (
            <Section style={infoBlock}>
              <Text style={infoLabel}>Modèle concerné</Text>
              <Text style={infoValue}>{produitLabel}</Text>
            </Section>
          )}

          <Section style={infoBlock}>
            <Text style={infoLabel}>Votre message</Text>
            <Text style={quote}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Affinity House Factory — <a href="https://affinityhome.fr" style={link}>affinityhome.fr</a>
            <br />
            Cet email vous a été envoyé suite à votre demande de contact.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ContactConfirmation.PreviewProps = {
  prenom: "Marie",
  nom: "Dupont",
  produit: "one",
  message: "Bonjour, je souhaite en savoir plus sur les délais de livraison.",
} satisfies ContactConfirmationProps;

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

const infoBlock = {
  backgroundColor: "#f8f8f5",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
};

const infoLabel = { fontSize: "11px", letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" as const, margin: "0 0 4px" };

const infoValue = { fontSize: "15px", color: "#1a1a18", margin: 0 };

const quote = { fontSize: "14px", lineHeight: "1.65", color: "#555", margin: 0, fontStyle: "italic" };

const hr = { borderColor: "#e8e8e4", margin: "28px 0 20px" };

const footer = { fontSize: "12px", lineHeight: "1.6", color: "#aaa" };

const link = { color: "#aaa" };
