import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("[anthropic] ANTHROPIC_API_KEY manquant");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface ExtractedFields {
  commune: string | null;
  secteur: string | null;
  prix: number | null;
  surface: number | null;
  zonage: "U" | "AU" | "A" | "N" | "autre" | null;
  urbanisme_detail: string | null;
  reseaux: string | null;
  assainissement: string | null;
  description_libre: string | null;
  source_reference: string | null;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_telephone: string | null;
  contact_role: "proprietaire" | "notaire" | "agence_partenaire" | "autre_mandataire" | "autre" | null;
}

const EXTRACTION_TOOL: Anthropic.Tool = {
  name: "extraire_fiche_terrain",
  description:
    "Extrait les caractéristiques d'un terrain constructible à partir du texte d'une annonce immobilière.",
  input_schema: {
    type: "object",
    properties: {
      commune: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Nom de la commune où se situe le terrain, sans code postal.",
      },
      secteur: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Quartier / lieu-dit / secteur précis si mentionné, sinon null.",
      },
      prix: {
        anyOf: [{ type: "number" }, { type: "null" }],
        description: "Prix de vente en euros, nombre entier sans espaces ni symbole.",
      },
      surface: {
        anyOf: [{ type: "number" }, { type: "null" }],
        description: "Surface du terrain en m², nombre entier.",
      },
      zonage: {
        anyOf: [{ type: "string", enum: ["U", "AU", "A", "N", "autre"] }, { type: "null" }],
        description:
          "Zonage PLU si mentionné explicitement (U, AU, A, N), sinon 'autre' si mentionné vaguement, sinon null.",
      },
      urbanisme_detail: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Règles d'urbanisme mentionnées : emprise au sol, hauteur max, reculs, CES, etc.",
      },
      reseaux: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Réseaux disponibles mentionnés : eau, électricité, gaz, télécom.",
      },
      assainissement: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Type d'assainissement mentionné : tout-à-l'égout, fosse septique, étude à prévoir.",
      },
      description_libre: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Résumé factuel court (2-3 phrases) des points clés non capturés par les autres champs.",
      },
      source_reference: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description:
          "Référence/numéro de l'annonce. Cherche en priorité un littéral explicite dans le texte comme " +
          "'Réf :', 'Référence :', 'Ref.', 'N° annonce' suivi d'un code, sinon utilise la référence affichée " +
          "ailleurs sur la page (URL, titre). Renvoie uniquement le code, sans le préfixe.",
      },
      contact_nom: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description:
          "Nom de famille de la personne à contacter pour ce bien (agent, mandataire, propriétaire), si mentionné " +
          "explicitement dans le texte (ex: près de 'Contactez', 'Votre contact', une signature, une bio d'agent). " +
          "Ne jamais inventer un nom.",
      },
      contact_prenom: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description: "Prénom de cette même personne de contact, si mentionné.",
      },
      contact_telephone: {
        anyOf: [{ type: "string" }, { type: "null" }],
        description:
          "Numéro de téléphone de contact mentionné dans le texte (format français typique 0X XX XX XX XX), si présent.",
      },
      contact_role: {
        anyOf: [
          { type: "string", enum: ["proprietaire", "notaire", "agence_partenaire", "autre_mandataire", "autre"] },
          { type: "null" },
        ],
        description:
          "Rôle du contact identifié : 'agence_partenaire' si un nom d'agence/société immobilière est associé, " +
          "'autre_mandataire' si c'est un agent/mandataire indépendant sans nom d'agence, 'proprietaire' si le texte " +
          "indique une vente directe par le propriétaire, 'notaire' si une étude notariale est mentionnée, sinon null " +
          "si aucun contact identifiable.",
      },
    },
    required: [
      "commune",
      "secteur",
      "prix",
      "surface",
      "zonage",
      "urbanisme_detail",
      "reseaux",
      "assainissement",
      "description_libre",
      "source_reference",
      "contact_nom",
      "contact_prenom",
      "contact_telephone",
      "contact_role",
    ],
    additionalProperties: false,
  },
  strict: true,
};

export async function extractFieldsFromText(input: {
  title: string;
  metaDescription: string;
  cleanedText: string;
  jsonLd: unknown[];
}): Promise<ExtractedFields> {
  const client = getAnthropicClient();

  const contextBlock = [
    `Titre de la page : ${input.title}`,
    `Méta-description : ${input.metaDescription}`,
    input.jsonLd.length
      ? `Données structurées JSON-LD : ${JSON.stringify(input.jsonLd).slice(0, 3000)}`
      : "",
    `Contenu texte de la page (nettoyé) :`,
    input.cleanedText,
  ]
    .filter(Boolean)
    .join("\n\n");

  const msg = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: "tool", name: "extraire_fiche_terrain" },
    messages: [
      {
        role: "user",
        content:
          "Voici le contenu d'une annonce de vente de terrain constructible publiée sur une plateforme immobilière. " +
          "Extrais les informations demandées. N'invente aucune donnée absente du texte : mets null si l'information n'est pas présente. " +
          "Porte une attention particulière à toute mention d'une personne de contact (agent, mandataire, propriétaire) " +
          "avec son nom et/ou son téléphone dans le texte, et à toute référence explicite de l'annonce (ex: 'Réf :').\n\n" +
          contextBlock,
      },
    ],
  });

  const toolUse = msg.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas retourné de résultat structuré");
  }
  return toolUse.input as ExtractedFields;
}
