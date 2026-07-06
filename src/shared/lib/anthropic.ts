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
}

const EXTRACTION_TOOL: Anthropic.Tool = {
  name: "extraire_fiche_terrain",
  description:
    "Extrait les caractéristiques d'un terrain constructible à partir du texte d'une annonce immobilière.",
  input_schema: {
    type: "object",
    properties: {
      commune: {
        type: ["string", "null"],
        description: "Nom de la commune où se situe le terrain, sans code postal.",
      },
      secteur: {
        type: ["string", "null"],
        description: "Quartier / lieu-dit / secteur précis si mentionné, sinon null.",
      },
      prix: {
        type: ["number", "null"],
        description: "Prix de vente en euros, nombre entier sans espaces ni symbole.",
      },
      surface: {
        type: ["number", "null"],
        description: "Surface du terrain en m², nombre entier.",
      },
      zonage: {
        type: ["string", "null"],
        enum: ["U", "AU", "A", "N", "autre", null],
        description:
          "Zonage PLU si mentionné explicitement (U, AU, A, N), sinon 'autre' si mentionné vaguement, sinon null.",
      },
      urbanisme_detail: {
        type: ["string", "null"],
        description: "Règles d'urbanisme mentionnées : emprise au sol, hauteur max, reculs, CES, etc.",
      },
      reseaux: {
        type: ["string", "null"],
        description: "Réseaux disponibles mentionnés : eau, électricité, gaz, télécom.",
      },
      assainissement: {
        type: ["string", "null"],
        description: "Type d'assainissement mentionné : tout-à-l'égout, fosse septique, étude à prévoir.",
      },
      description_libre: {
        type: ["string", "null"],
        description: "Résumé factuel court (2-3 phrases) des points clés non capturés par les autres champs.",
      },
      source_reference: {
        type: ["string", "null"],
        description: "Référence/numéro d'annonce affiché sur la page, si présent.",
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
          "Extrais les informations demandées. N'invente aucune donnée absente du texte : mets null si l'information n'est pas présente.\n\n" +
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
