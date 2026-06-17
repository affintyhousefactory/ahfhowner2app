import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité | HOWNER",
  description:
    "Politique de confidentialité : données collectées par Affinity House Factory, finalités, bases légales, durées de conservation et droits RGPD.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <LegalShell
      eyebrow="RGPD"
      title="Politique de confidentialité"
      pending={false}
      updated="juin 2026"
    >
      <h2>1. Préambule</h2>
      <p>
        La présente Politique de confidentialité décrit la manière dont la
        société <strong>Affinity House Factory</strong>, société par actions
        simplifiée, dont le siège social est situé 28 Chemin de Sabalce OEV,
        64100 Bayonne – France, immatriculée sous le numéro SIRET 982 581 506
        00010 (ci-après « <strong>AHF</strong> »), collecte et traite les
        données à caractère personnel des utilisateurs (ci-après les «{" "}
        <strong>Utilisateurs</strong> »).
      </p>
      <p>
        La présente Politique s'applique à l'ensemble des sites et services
        exploités par AHF, incluant notamment :
      </p>
      <ul>
        <li>Le site internet affinityhousefactory.com</li>
        <li>Le site internet affinityhome.fr</li>
        <li>Le site internet howner.fr</li>
        <li>
          Tout formulaire de contact ou de newsletter accessible depuis ces
          sites
        </li>
      </ul>
      <p>(Ci-après ensemble les « <strong>Services</strong> »).</p>
      <p>
        AHF agit, pour les traitements décrits ci-après, en qualité de
        responsable de traitement au sens de la réglementation applicable.
      </p>

      <h2>2. Cadre juridique</h2>
      <p>
        Les traitements de données à caractère personnel mis en œuvre par AHF
        sont conformes au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et à la
        loi Informatique et Libertés du 6 janvier 1978 modifiée.
      </p>

      <h2>3. Données collectées</h2>
      <h3>3.1 Données collectées directement</h3>
      <p>
        Les données personnelles des Utilisateurs sont collectées notamment
        lorsque :
      </p>
      <ul>
        <li>L'Utilisateur remplit un formulaire de contact,</li>
        <li>L'Utilisateur s'inscrit à la newsletter d'AHF,</li>
        <li>L'Utilisateur communique avec AHF par voie électronique.</li>
      </ul>
      <p>Les données susceptibles d'être collectées sont :</p>
      <ul>
        <li>Adresse électronique (systématiquement)</li>
        <li>Nom et prénom (le cas échéant)</li>
        <li>Numéro de téléphone (le cas échéant)</li>
        <li>Objet et contenu de la demande</li>
      </ul>
      <h3>3.2 Données collectées indirectement</h3>
      <p>
        Certaines données sont collectées automatiquement par le biais de
        cookies et traceurs, dans les conditions décrites à l'article 9.
      </p>

      <h2>4. Finalités des traitements</h2>
      <p>
        Les données personnelles sont collectées et traitées pour les finalités
        suivantes :
      </p>
      <ul>
        <li>Réponse aux demandes de contact,</li>
        <li>Gestion des inscriptions et envois de newsletter,</li>
        <li>Amélioration des Services et de l'expérience utilisateur,</li>
        <li>Mesure d'audience et analyse statistique anonymisée.</li>
      </ul>

      <h2>5. Bases légales des traitements</h2>
      <table>
        <thead>
          <tr>
            <th>Traitement</th>
            <th>Base légale (RGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Réponse à une demande de contact</td>
            <td>Intérêt légitime — art. 6.1.f</td>
          </tr>
          <tr>
            <td>Newsletter</td>
            <td>Consentement — art. 6.1.a</td>
          </tr>
          <tr>
            <td>Mesure d'audience (GA4)</td>
            <td>Consentement — art. 6.1.a</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Destinataires des données — transferts</h2>
      <p>Les données personnelles sont accessibles uniquement :</p>
      <ul>
        <li>Au personnel habilité d'AHF,</li>
        <li>Aux prestataires techniques agissant en qualité de sous-traitants.</li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Prestataire</th>
            <th>Rôle</th>
            <th>Localisation des données</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vercel Inc.</td>
            <td>Hébergement des sites</td>
            <td>Europe — Frankfurt (Allemagne)</td>
          </tr>
          <tr>
            <td>Google LLC (GA4)</td>
            <td>Mesure d'audience</td>
            <td>États-Unis (SCC — art. 46 RGPD)</td>
          </tr>
          <tr>
            <td>Brevo (Sendinblue SAS)</td>
            <td>Envoi de newsletter</td>
            <td>Union Européenne</td>
          </tr>
        </tbody>
      </table>
      <p>
        Les transferts hors UE (Google) sont encadrés par les{" "}
        <strong>Clauses Contractuelles Types</strong> approuvées par la
        Commission Européenne, conformément à l'article 46 du RGPD.
      </p>
      <p>
        Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.
      </p>

      <h2>7. Durée de conservation des données</h2>
      <table>
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Durée de conservation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email — formulaire de contact</td>
            <td>12 mois après clôture de la demande</td>
          </tr>
          <tr>
            <td>Email — newsletter</td>
            <td>Jusqu'à désinscription ou demande de suppression</td>
          </tr>
          <tr>
            <td>Données de prospection commerciale</td>
            <td>3 ans après le dernier contact</td>
          </tr>
          <tr>
            <td>Cookies</td>
            <td>13 mois maximum</td>
          </tr>
        </tbody>
      </table>

      <h2>8. Sécurité des données</h2>
      <p>
        AHF met en œuvre des mesures techniques et organisationnelles
        appropriées, incluant notamment :
      </p>
      <ul>
        <li>Hébergement des données au sein de l'Union européenne,</li>
        <li>Chiffrement des flux (HTTPS/TLS),</li>
        <li>Contrôle d'accès restreint aux seules personnes habilitées,</li>
        <li>Sélection rigoureuse des sous-traitants.</li>
      </ul>

      <h2>9. Cookies</h2>
      <p>
        Lors de la première connexion, l'Utilisateur est informé de
        l'utilisation de cookies via un bandeau de consentement (en cours de
        déploiement).
      </p>
      <p>AHF utilise notamment des cookies permettant :</p>
      <ul>
        <li>La mesure d'audience (Google Analytics 4),</li>
        <li>L'amélioration de l'ergonomie et des performances.</li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Émetteur</th>
            <th>Finalité</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>_ga</code>
            </td>
            <td>Google Analytics</td>
            <td>Identification visiteur</td>
            <td>2 ans</td>
          </tr>
          <tr>
            <td>
              <code>_ga_[ID]</code>
            </td>
            <td>Google Analytics</td>
            <td>Suivi de session GA4</td>
            <td>2 ans</td>
          </tr>
        </tbody>
      </table>
      <p>
        L'Utilisateur peut à tout moment gérer ses préférences via le bandeau
        cookies ou en installant le{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          module de désinscription Google Analytics
        </a>
        .
      </p>

      <h2>10. Droits des utilisateurs</h2>
      <p>
        Conformément à la réglementation, les Utilisateurs disposent des droits
        suivants :
      </p>
      <ul>
        <li>
          <strong>Droit d'accès</strong> — obtenir une copie des données les
          concernant
        </li>
        <li>
          <strong>Droit de rectification</strong> — corriger des données
          inexactes
        </li>
        <li>
          <strong>Droit à l'effacement</strong> — demander la suppression des
          données
        </li>
        <li>
          <strong>Droit à la limitation</strong> — restreindre un traitement
        </li>
        <li>
          <strong>Droit d'opposition</strong> — s'opposer à un traitement
        </li>
        <li>
          <strong>Droit à la portabilité</strong> — recevoir les données dans un
          format structuré
        </li>
        <li>
          <strong>Droit de retrait du consentement</strong> — à tout moment,
          sans effet rétroactif
        </li>
        <li>
          <strong>Droit d'introduire une réclamation</strong> auprès de la CNIL
        </li>
      </ul>

      <h2>11. Modalités d'exercice des droits</h2>
      <p>Les droits peuvent être exercés :</p>
      <p>
        <strong>Par email :</strong>{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
      </p>
      <p>
        <strong>Par courrier postal :</strong>
        <br />
        Affinity House Factory – Responsable de la protection des données
        <br />
        28 Chemin de Sabalce OEV, 64100 Bayonne – France
      </p>
      <p>
        Une pièce d'identité pourra être demandée à des fins de vérification.
      </p>
      <p>
        En cas de réponse insatisfaisante, l'Utilisateur peut introduire une
        réclamation auprès de la <strong>CNIL</strong> :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>{" "}
        — 3 place de Fontenoy, 75007 Paris.
      </p>

      <h2>12. Modification de la politique</h2>
      <p>
        AHF se réserve le droit de modifier la présente Politique à tout moment
        pour refléter l'évolution du site ou de la réglementation applicable.
      </p>
      <p>
        La version applicable est celle publiée sur les Services à la date de
        consultation.
      </p>
    </LegalShell>
  );
}
