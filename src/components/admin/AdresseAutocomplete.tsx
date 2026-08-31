"use client";

/**
 * Saisie d'adresse assistée par Google Places — adresse, code postal, ville.
 *
 * Le mécanisme existait déjà, écrit à même `LeadEditIdentite` pour l'adresse du
 * client. L'adresse de la société en avait besoin à son tour ; le recopier
 * aurait donné deux intégrations à maintenir, dont une seule serait corrigée le
 * jour où l'API bouge — et elle a déjà bougé une fois (`PlaceAutocompleteElement`
 * a remplacé l'ancien `Autocomplete`).
 *
 * ⚠ **Les trois champs restent saisissables à la main.** L'autocomplétion ne
 * connaît pas tout : un camping au lieu-dit, une adresse récente, un accès de
 * service. Elle assiste, elle ne conditionne pas — et sans clé d'API, seule
 * l'assistance disparaît, jamais la saisie.
 */

import { useEffect, useRef } from "react";
import { loadGooglePlacesScript } from "@/shared/lib/google-places";

export type ValeursAdresse = { adresse: string; cp: string; ville: string };

export function AdresseAutocomplete({
  valeurs,
  onChange,
  libelle = "Adresse",
  /** Rendu dans un `<form>` parent : `id` distingue deux instances d'une page. */
  id,
}: {
  valeurs: ValeursAdresse;
  onChange: (v: ValeursAdresse) => void;
  libelle?: string;
  id: string;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const element = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  /* `onChange` change à chaque rendu du parent ; le garder dans une ref évite de
     détruire et reconstruire l'élément Google à chaque frappe.

     ⚠ La ref se met à jour dans un effet, jamais pendant le rendu : y toucher
     directement casse la garantie que deux rendus d'un même état produisent le
     même résultat, et `eslint` le refuse à juste titre. */
  const rappel = useRef(onChange);
  useEffect(() => {
    rappel.current = onChange;
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

  useEffect(() => {
    if (!apiKey) return;
    let annule = false;

    loadGooglePlacesScript(apiKey)
      .then(() => {
        if (annule || !conteneur.current || element.current) return;

        const el = new window.google.maps.places.PlaceAutocompleteElement({
          includedRegionCodes: ["fr"],
          includedPrimaryTypes: ["street_address", "route"],
        });
        conteneur.current.appendChild(el);
        element.current = el;

        el.addEventListener("gmp-select", async (event) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] });

          let cp = "";
          let ville = "";
          for (const comp of place.addressComponents ?? []) {
            if (comp.types.includes("postal_code")) cp = comp.longText ?? "";
            if (comp.types.includes("locality")) ville = comp.longText ?? "";
          }

          /* Ce que Google ne rend pas ne doit pas effacer ce qui est déjà saisi :
             une adresse de lieu-dit revient souvent sans code postal. */
          rappel.current({
            adresse: place.formattedAddress ?? "",
            cp,
            ville,
          });
        });
      })
      .catch(() => {
        /* Google indisponible, clé absente ou quota dépassé : les trois champs
           restent saisissables. Une adresse se tape très bien à la main. */
      });

    return () => {
      annule = true;
      element.current?.remove();
      element.current = null;
    };
  }, [apiKey]);

  const champ =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#7469F4]";

  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40" htmlFor={`${id}-adresse`}>
        {libelle}
      </label>

      {/* Le champ Google se greffe ici. Absent, le champ manuel en dessous suffit. */}
      <div ref={conteneur} className="mb-2 [&_gmp-place-autocomplete]:w-full" />

      <input
        id={`${id}-adresse`}
        value={valeurs.adresse}
        onChange={(e) => onChange({ ...valeurs, adresse: e.target.value })}
        placeholder="Numéro et voie"
        className={champ}
      />

      <div className="mt-2 grid grid-cols-3 gap-2">
        <input
          value={valeurs.cp}
          onChange={(e) => onChange({ ...valeurs, cp: e.target.value })}
          placeholder="Code postal"
          inputMode="numeric"
          className={champ}
        />
        <input
          value={valeurs.ville}
          onChange={(e) => onChange({ ...valeurs, ville: e.target.value })}
          placeholder="Ville"
          className={`${champ} col-span-2`}
        />
      </div>
    </div>
  );
}
