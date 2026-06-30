import { NextRequest, NextResponse } from "next/server";

interface PappersRepresentant {
  prenom?: string;
  nom?: string;
  qualite?: string;
}

interface PappersEntreprise {
  nom_entreprise?: string;
  siren?: string;
  forme_juridique?: string;
  siege?: {
    adresse_ligne_1?: string;
    code_postal?: string;
    ville?: string;
  };
  representants?: PappersRepresentant[];
  entreprise_cessee?: boolean;
  statut_rcs?: string;
}

export async function GET(req: NextRequest) {
  const siren = req.nextUrl.searchParams.get("siren")?.replace(/\s/g, "");

  if (!siren || !/^\d{9}$/.test(siren)) {
    return NextResponse.json({ error: "SIREN invalide (9 chiffres requis)" }, { status: 400 });
  }

  const apiKey = process.env.PAPPERS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PAPPERS_API_KEY non configurée" }, { status: 503 });
  }

  const url = `https://api.pappers.fr/v2/entreprise?siren=${siren}&api_token=${apiKey}&representants=true`;
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (res.status === 404) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }
  if (res.status === 401) {
    return NextResponse.json({ error: "Pappers erreur 401 : privilèges insuffisants. Saisie libre." }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: `Pappers erreur ${res.status}` }, { status: 502 });
  }

  const data = (await res.json()) as PappersEntreprise;

  const siege = data.siege;
  const adresse = [
    siege?.adresse_ligne_1,
    siege?.code_postal && siege?.ville ? `${siege.code_postal} ${siege.ville}` : siege?.ville,
  ].filter(Boolean).join(", ");

  const dirigeant = data.representants?.find((r) => r.qualite);

  return NextResponse.json({
    nom_entreprise: data.nom_entreprise ?? "",
    forme_juridique: data.forme_juridique ?? "",
    adresse,
    siren: data.siren ?? siren,
    cessee: data.entreprise_cessee ?? false,
    statut_rcs: data.statut_rcs ?? "",
    dirigeant: dirigeant
      ? { prenom: dirigeant.prenom ?? "", nom: dirigeant.nom ?? "", qualite: dirigeant.qualite ?? "" }
      : null,
  });
}
