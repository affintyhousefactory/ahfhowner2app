import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Mentions légales | HOWNER",
  description:
    "Mentions légales du site affinityhome.fr : éditeur Affinity House Factory, hébergement Vercel, services tiers, propriété intellectuelle et droit applicable.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsPage() {
  return (
    <LegalShell eyebrow="Légal" title="Mentions légales" pending={false} updated="juin 2026">

      <h2>1. Éditeur du site</h2>
      <p>
        <strong>Affinity House Factory</strong>
        <br />
        Forme juridique : SAS (Société par Actions Simplifiée)
        <br />
        SIRET : 982 581 506 00010
        <br />
        Siège social : 28 Chemin de Sabalce OEV, 64100 Bayonne, France
        <br />
        Email :{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
      </p>
      <p>Directeur de la publication : Albert Puigbo</p>

      <h2>2. Hébergement</h2>
      <p>
        Le site <strong>affinityhome.fr</strong> est hébergé par :
      </p>
      <p>
        <strong>Vercel Inc.</strong>
        <br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        <br />
        Site :{" "}
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
          vercel.com
        </a>
      </p>
      <p>
        Les données sont hébergées sur des serveurs situés en{" "}
        <strong>Europe (Frankfurt, Allemagne)</strong>, conformément à la
        politique de localisation des données de Vercel.
      </p>

      <h2>3. Services tiers intégrés</h2>
      <p>
        Le site recourt aux services tiers suivants dans le cadre de son
        fonctionnement :
      </p>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Éditeur</th>
            <th>Finalité</th>
            <th>Données traitées</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Google Analytics 4</td>
            <td>Google LLC (États-Unis)</td>
            <td>Mesure d'audience anonymisée</td>
            <td>Avec consentement préalable</td>
          </tr>
          <tr>
            <td>Cloudflare Turnstile</td>
            <td>Cloudflare Inc. (États-Unis)</td>
            <td>Protection anti-bot des formulaires</td>
            <td>Données techniques éphémères — intérêt légitime</td>
          </tr>
        </tbody>
      </table>
      <p>
        Les modalités de traitement de ces données sont détaillées dans la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>4. Données personnelles et cookies</h2>
      <p>
        Le site collecte des données personnelles dans les conditions décrites
        dans la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
        Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et
        Libertés, les Utilisateurs disposent de droits d'accès, de rectification,
        d'effacement et d'opposition sur leurs données.
      </p>
      <p>
        Un <strong>bandeau de consentement</strong> est affiché lors de chaque
        nouvelle session navigateur pour recueillir les préférences de
        l'Utilisateur concernant les cookies analytiques (Google Analytics 4).
      </p>
      <p>
        Pour exercer vos droits :{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
      </p>

      <h2>5. Conditions générales d'utilisation</h2>
      <p>
        L'accès et l'utilisation du site affinityhome.fr valent acceptation des
        présentes mentions légales. Celles-ci sont susceptibles d'être modifiées
        à tout moment ; l'Utilisateur est invité à les consulter régulièrement.
      </p>
      <p>
        Le site est normalement accessible à tout moment. Une interruption pour
        maintenance technique peut toutefois intervenir ; Affinity House Factory
        s'efforcera d'en informer les utilisateurs au préalable dans la mesure
        du possible.
      </p>

      <h2>6. Description des services</h2>
      <p>
        Le site affinityhome.fr a pour objet de présenter les maisons compactes
        d'architecte <strong>Arko One</strong> et <strong>Arko Max</strong>,
        conçues et fabriquées au Pays-Basque par Affinity House Factory, et de
        permettre leur réservation. Affinity House Factory s'efforce de fournir
        des informations aussi précises et à jour que possible.
      </p>
      <p>
        Les informations publiées (caractéristiques techniques, prix, disponibilités)
        sont données à titre indicatif et sont susceptibles d'évoluer sans préavis.
        Elles ne constituent pas une offre contractuelle au sens du Code civil.
      </p>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Affinity House Factory est titulaire des droits de propriété
        intellectuelle ou détient les droits d'usage sur l'ensemble des éléments
        accessibles sur le site : textes, images, graphismes, logo, icônes, sons
        et logiciels.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication ou
        adaptation de tout ou partie de ces éléments, quel que soit le moyen ou
        le procédé utilisé, est strictement interdite sans l'autorisation écrite
        préalable d'Affinity House Factory.
      </p>
      <p>
        Toute exploitation non autorisée constitue une contrefaçon sanctionnée
        par les articles L.335-2 et suivants du Code de la Propriété
        Intellectuelle.
      </p>

      <h2>8. Limitation de responsabilité</h2>
      <p>
        Affinity House Factory ne saurait être tenue responsable des dommages
        directs ou indirects résultant de l'accès au site, de son utilisation,
        de l'impossibilité d'y accéder, ni des interruptions ou indisponibilités
        du réseau ou des serveurs.
      </p>
      <p>
        Le site peut contenir des liens vers des sites tiers. Affinity House
        Factory n'exerce aucun contrôle sur leur contenu et décline toute
        responsabilité à leur égard. L'existence d'un lien ne vaut pas
        approbation du site tiers.
      </p>

      <h2>9. Droit applicable et juridiction compétente</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas
        de litige, et à défaut de résolution amiable, les tribunaux compétents du
        ressort de <strong>Bayonne</strong> seront seuls compétents.
      </p>
    </LegalShell>
  );
}
