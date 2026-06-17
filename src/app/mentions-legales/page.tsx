import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Mentions légales | HOWNER",
  description:
    "Mentions légales du site : éditeur Affinity House Factory, hébergement, propriété intellectuelle et droit applicable.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsPage() {
  return (
    <LegalShell eyebrow="Légal" title="Mentions légales" pending={false} updated="juin 2026">
      <h2>Propriétaire et éditeur du site</h2>
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

      <h2>Hébergement</h2>
      <p>Le site est hébergé par :</p>
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
        <strong>Europe (Frankfurt, Allemagne)</strong>.
      </p>

      <h2>Conditions générales d'utilisation</h2>
      <p>
        L'accès et l'utilisation du site affinityhousefactory.com valent
        acceptation pleine et entière des présentes conditions générales
        d'utilisation. Celles-ci sont susceptibles d'être modifiées à tout
        moment ; l'utilisateur est invité à les consulter régulièrement.
      </p>
      <p>
        Le site est normalement accessible à tout moment. Une interruption pour
        maintenance technique peut toutefois intervenir ; Affinity House Factory
        s'efforcera d'en informer les utilisateurs au préalable dans la mesure
        du possible.
      </p>

      <h2>Description des services fournis</h2>
      <p>
        Les sites affinityhome.fr, howner.fr et affinityhousefactory.com ont
        pour objet de présenter les activités, produits et services d'Affinity
        House Factory. Affinity House Factory s'efforce de fournir des
        informations aussi précises et à jour que possible. Toutefois, la
        société ne saurait être tenue responsable des omissions, inexactitudes
        ou retards de mise à jour, qu'ils soient de son fait ou de celui de ses
        partenaires.
      </p>
      <p>
        Les informations publiées sur ce site sont données à titre indicatif et
        sont susceptibles d'évoluer sans préavis.
      </p>

      <h2>Limitations techniques</h2>
      <p>
        Le site utilise les technologies JavaScript et HTML5. Affinity House
        Factory ne saurait être tenu responsable de dommages matériels liés à
        l'utilisation du site. L'utilisateur s'engage à accéder au site depuis un
        équipement récent, exempt de virus, et avec un navigateur à jour.
      </p>

      <h2>Propriété intellectuelle</h2>
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

      <h2>Limitation de responsabilité</h2>
      <p>
        Affinity House Factory ne saurait être tenue responsable des dommages
        directs ou indirects résultant de l'accès au site, de son utilisation ou
        de l'impossibilité d'y accéder, ni des interruptions ou indisponibilités
        du réseau ou des serveurs.
      </p>

      <h2>Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers. Affinity House
        Factory n'exerce aucun contrôle sur le contenu de ces sites et décline
        toute responsabilité à leur égard. L'existence d'un lien ne vaut pas
        approbation du site tiers.
      </p>

      <h2>Droit applicable et juridiction compétente</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas
        de litige, et à défaut de résolution amiable, les tribunaux compétents du
        ressort de Bayonne seront seuls compétents.
      </p>
    </LegalShell>
  );
}
