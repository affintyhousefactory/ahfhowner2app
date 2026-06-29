import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Conditions générales de vente | HOWNER",
  description:
    "Conditions générales de vente HOWNER — réservation, acompte, garanties légales et processus de construction ARKO.",
  alternates: { canonical: "/cgv" },
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Conditions générales de vente"
      pending={false}
      updated="21 juin 2026"
    >
      {/* 1 — Identification */}
      <h2>1. Identification de l&apos;éditeur et du constructeur</h2>
      <p>
        <strong>HOWNER</strong> est une marque éditée par{" "}
        <strong>Affinity House Factory</strong> (ci-après « AHF » ou « le
        Constructeur »), société par actions simplifiée (SAS), immatriculée
        sous le numéro SIRET 982&nbsp;581&nbsp;506&nbsp;00010, dont le siège
        social est situé 28 Chemin de Sabalce OEV, 64100 Bayonne, France.
      </p>
      <ul>
        <li>
          Site :{" "}
          <a href="https://affinityhome.fr">https://affinityhome.fr</a>
        </li>
        <li>Contact commercial : contact@affinityhousefactory.com</li>
        <li>Directeur de la publication : Albert Puigbo</li>
        <li>Numéro de TVA intracommunautaire : FR[à compléter]</li>
      </ul>

      {/* 2 — Définitions */}
      <h2>2. Définitions</h2>
      <table>
        <thead>
          <tr>
            <th>Terme</th>
            <th>Définition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Maison ARKO</strong></td>
            <td>
              Ouvrage de construction fabriqué en atelier, livré prêt à vivre,
              décliné en deux modèles : Arko One (20 m²) et Arko Max (40 m²)
            </td>
          </tr>
          <tr>
            <td><strong>Client / Maître d&apos;ouvrage</strong></td>
            <td>
              Toute personne physique ou morale qui réserve ou commande une
              Maison ARKO
            </td>
          </tr>
          <tr>
            <td><strong>Réservation</strong></td>
            <td>
              Acte par lequel le Client verse un acompte de 5&nbsp;000&nbsp;€
              et réserve un numéro de série dans la Série 01
            </td>
          </tr>
          <tr>
            <td><strong>Pack Recherche Terrain</strong></td>
            <td>
              Prestation optionnelle et accessoire à la Réservation, permettant
              au Client de bénéficier d&apos;une mission de recherche de
              terrain constructible compatible avec la Maison ARKO réservée,
              réalisée par un chasseur immobilier partenaire titulaire de la
              carte T. Ne peut être souscrit qu&apos;en complément d&apos;une
              Réservation active
            </td>
          </tr>
          <tr>
            <td><strong>Chasseur partenaire</strong></td>
            <td>
              Mandataire immobilier indépendant, titulaire ou rattaché à une
              carte professionnelle T, sous-traitant d&apos;AHF pour la
              réalisation des missions Pack Recherche Terrain
            </td>
          </tr>
          <tr>
            <td><strong>CCMI</strong></td>
            <td>
              Contrat de Construction de Maison Individuelle — contrat définitif
              signé après validation du projet
            </td>
          </tr>
          <tr>
            <td><strong>Atelier</strong></td>
            <td>
              Site de fabrication d&apos;AHF, situé au Pays Basque, dans lequel
              les Maisons ARKO sont intégralement montées et finies avant
              livraison
            </td>
          </tr>
          <tr>
            <td><strong>Micro-pieux</strong></td>
            <td>
              Système de fondations légères sur pieux battus ou vissés, fourni
              et mis en œuvre par le Client ou un prestataire de son choix, sur
              lequel repose la Maison ARKO
            </td>
          </tr>
          <tr>
            <td><strong>Livraison / Pose</strong></td>
            <td>
              Phase d&apos;installation de la Maison ARKO sur les micro-pieux
              du Client, réalisée en une journée
            </td>
          </tr>
          <tr>
            <td><strong>Architecte intégrée</strong></td>
            <td>
              Architecte salariée ou mandataire d&apos;AHF qui accompagne le
              projet du Client de la réservation à la réception
            </td>
          </tr>
          <tr>
            <td><strong>Série 01</strong></td>
            <td>
              Première série limitée : 12 exemplaires Arko One + 5 exemplaires
              Arko Max
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3 — Objet */}
      <h2>3. Objet — Nature juridique du contrat</h2>
      <p>Les présentes CGV régissent :</p>
      <ol>
        <li>
          la <strong>Réservation</strong> d&apos;une Maison ARKO via le site{" "}
          <a href="https://affinityhome.fr">https://affinityhome.fr</a> ;
        </li>
        <li>
          le <strong>Pack Recherche Terrain</strong>, prestation optionnelle et
          accessoire à la Réservation ;
        </li>
        <li>
          la signature ultérieure du <strong>CCMI</strong> (Contrat de
          Construction de Maison Individuelle) au sens de l&apos;article L.
          231-1 du Code de la construction et de l&apos;habitation (CCH), qui
          constitue le contrat principal et définitif.
        </li>
      </ol>
      <p>
        <strong>Avertissement légal</strong> : La Réservation ne constitue pas
        un CCMI. Elle engage uniquement le versement de l&apos;acompte de{" "}
        <strong>5&nbsp;000&nbsp;€, remboursable et sans engagement de
        construction</strong>, et la mise en relation avec l&apos;Architecte
        intégrée. Le CCMI, qui détermine le prix global et forfaitaire, les
        délais de construction et l&apos;ensemble des garanties légales, sera
        soumis à la signature du Client avant tout démarrage de fabrication.
      </p>

      {/* 4 — Description des modèles */}
      <h2>4. Description des modèles</h2>

      <h3>4.1 Arko One</h3>
      <ul>
        <li>Surface : <strong>20 m²</strong> (+ terrasse selon option)</li>
        <li>Série 01 : <strong>12 exemplaires numérotés</strong></li>
        <li>
          Prix de départ : à partir de <strong>59&nbsp;900&nbsp;€ TTC</strong>,
          clé en main, prêt à vivre
        </li>
        <li>
          Délai de fabrication en atelier : <strong>12 semaines</strong> à
          compter de la levée des conditions suspensives du CCMI
        </li>
      </ul>

      <h3>4.2 Arko Max</h3>
      <ul>
        <li>Surface : <strong>40 m²</strong> (+ terrasse selon option)</li>
        <li>Série 01 : <strong>5 exemplaires numérotés</strong></li>
        <li>
          Prix de départ : à partir de <strong>89&nbsp;900&nbsp;€ TTC</strong>,
          clé en main, prêt à vivre
        </li>
        <li>
          Délai de fabrication en atelier : <strong>12 semaines</strong> à
          compter de la levée des conditions suspensives du CCMI
        </li>
      </ul>

      <h3>4.3 Ce qui est inclus (clé en main)</h3>
      <p>
        Chaque Maison ARKO est livrée avec : structure, isolation, menuiseries
        extérieures, second œuvre intérieur, équipements sanitaires, cuisine
        équipée, revêtements de sol et mur, électricité et plomberie
        raccordables, terrasse bois sur pilotis (selon configuration). Les
        prestations exactes sont détaillées dans la Notice Descriptive annexée
        au CCMI.
      </p>

      <h3>4.4 Ce qui est exclu</h3>
      <p>
        Sauf mention contraire dans le CCMI : <strong>micro-pieux</strong>{" "}
        (fourniture, étude géotechnique et pose à la charge du Client),
        raccordements aux réseaux publics (eau, électricité, assainissement),
        autorisations d&apos;urbanisme (accompagnement proposé par
        l&apos;Architecte intégrée), transport au-delà du rayon contractuel
        depuis le site de fabrication.
      </p>
      <p>
        <strong>Autorisation d&apos;urbanisme selon surface</strong> :
        l&apos;Arko One (20&nbsp;m²) requiert une{" "}
        <strong>déclaration préalable de travaux</strong> ; l&apos;Arko Max
        (40&nbsp;m²) requiert un <strong>permis de construire</strong> (art.
        R.&nbsp;421-1 et s. du Code de l&apos;urbanisme). Dans les deux cas,
        la fixation sur micro-pieux constitue une construction nouvelle soumise
        à la réglementation applicable.
      </p>

      <h3>4.5 Visuels non contractuels</h3>
      <p>
        Les images, rendus et vidéos présents sur le site sont des
        représentations d&apos;intention. Seuls les plans et la Notice
        Descriptive annexés au CCMI ont valeur contractuelle.
      </p>

      {/* 5 — Spécificités de la fabrication en atelier */}
      <h2>5. Spécificités de la fabrication en atelier</h2>

      <h3>5.1 Mode constructif</h3>
      <p>
        Les Maisons ARKO sont fabriquées selon un procédé de{" "}
        <strong>construction en atelier</strong> (off-site manufacturing) :
        l&apos;intégralité du module est montée, équipée et finalisée dans
        l&apos;<strong>Atelier AHF</strong> au Pays Basque, dans un
        environnement contrôlé, avant transport et pose en une journée sur les
        <strong> micro-pieux</strong> préalablement installés par le Client.
      </p>
      <p>
        Ce procédé relève des modules 3D volumétriques tels que définis par la
        filière (CSTB, DREAL), et fait appel à des procédés constructifs
        pouvant être qualifiés de <strong>technique non courante</strong> au
        sens des assureurs construction, conformément au corpus normatif en
        vigueur (DTU 31.2, etc.).
      </p>
      <p>
        Le recours à la fabrication en atelier dans le cadre du CCMI est
        encadré par le <strong>décret du 6 février 2020</strong> (art.
        R.&nbsp;231-7-1 CCH), qui adapte l&apos;échéancier de paiement et les
        obligations d&apos;information à l&apos;état d&apos;avancement en
        atelier.
      </p>

      <h3>5.2 Contrôle qualité en atelier</h3>
      <p>
        La fabrication est soumise à un autocontrôle continu : traçabilité des
        assemblages, contrôle des tolérances, vérification de la conformité aux
        normes applicables (sécurité incendie, acoustique, stabilité
        structurelle). AHF s&apos;engage à fournir, sur demande du Client, les
        registres de production liés à son numéro de série.
      </p>

      <h3>5.3 Avis Technique / ATEx</h3>
      <p>
        Pour les procédés constructifs non couverts par un DTU, AHF
        s&apos;engage à disposer d&apos;un{" "}
        <strong>
          Avis Technique (AT) ou d&apos;une Appréciation Technique
          d&apos;Expérimentation (ATEx)
        </strong>{" "}
        délivré(e) par le CSTB, préalablement à la mise en fabrication de la
        Série 01. Ce document est communiqué au Client sur demande et est
        annexé au CCMI.
      </p>

      <h3>5.4 RE2020</h3>
      <p>
        Les Maisons ARKO sont conçues pour répondre aux exigences de la{" "}
        <strong>Réglementation Environnementale RE2020</strong> applicable aux
        maisons individuelles neuves. L&apos;attestation de conformité est
        remise au Client à la livraison.
      </p>

      {/* 6 — Processus de réservation */}
      <h2>6. Processus de réservation et parcours client</h2>

      <h3>Étape 1 — Configuration et réservation en ligne</h3>
      <p>
        Le Client configure son modèle sur le site — choix du modèle, numéro
        de série, bardage, aménagements et options — et obtient un{" "}
        <strong>devis indicatif en direct</strong>. Ce devis est fourni à titre
        d&apos;estimation, sans valeur contractuelle (voir article 7.1).
      </p>
      <p>
        Après son échange de 30 minutes avec l&apos;Architecte intégrée, le
        Client reçoit un <strong>devis récapitulatif</strong> mentionnant :
      </p>
      <ul>
        <li>
          <strong>5&nbsp;000&nbsp;€ TTC</strong> · Acompte de Réservation
          Maison ARKO — remboursable, sans engagement de construction
        </li>
        <li>
          <strong>1&nbsp;500&nbsp;€ TTC</strong> · Acompte Pack Recherche
          Terrain{" "}
          <em>(optionnel — réservé aux acquéreurs d&apos;un module Arko)</em>
        </li>
      </ul>
      <p>
        Ces deux postes peuvent faire l&apos;objet d&apos;un{" "}
        <strong>bon de commande unique</strong> pour un total de{" "}
        <strong>6&nbsp;500&nbsp;€ TTC</strong> si le Client souscrit les deux.
        Le Client peut ne souscrire que la Réservation (5&nbsp;000&nbsp;€)
        s&apos;il dispose déjà d&apos;un terrain.
      </p>
      <p>
        <strong>
          L&apos;acompte de Réservation de 5&nbsp;000&nbsp;€ est intégralement
          remboursable, sans condition et sans engagement de construction
        </strong>
        , selon les modalités de l&apos;article 9.
      </p>
      <p>
        <strong>
          Le Pack Recherche Terrain est une prestation accessoire et
          conditionnée à la Réservation.
        </strong>{" "}
        Il ne peut être souscrit de manière indépendante. Sa résiliation ou
        l&apos;annulation de la Réservation entraîne de plein droit sa
        résiliation et le remboursement de l&apos;acompte Pack Recherche
        Terrain versé.
      </p>

      <h3>
        Étape 2 — Entretien de 30 minutes avec l&apos;Architecte intégrée
        (gratuit, sous 7 jours)
      </h3>
      <p>
        Dans les <strong>7 jours ouvrés</strong> suivant la Réservation,
        l&apos;Architecte intégrée d&apos;AHF contacte le Client pour un
        entretien de <strong>30 minutes</strong> (en visioconférence ou par
        téléphone). Cet entretien permet de :
      </p>
      <ul>
        <li>
          valider la compatibilité du terrain (PLU, accessibilité, exposition) ;
        </li>
        <li>préciser les options retenues et les adaptations éventuelles ;</li>
        <li>
          identifier les prérequis techniques et administratifs : autorisation
          d&apos;urbanisme requise (déclaration préalable pour l&apos;Arko One,
          permis de construire pour l&apos;Arko Max), étude géotechnique,
          dimensionnement des micro-pieux, raccordements.
        </li>
      </ul>
      <p>
        À l&apos;issue de cet entretien, AHF remet au Client un{" "}
        <strong>devis définitif</strong> incluant le prix global et forfaitaire,
        les frais de livraison calculés depuis Bayonne, et les éléments de
        terrain identifiés. Ce devis a une <strong>validité de 3 mois</strong>.
      </p>
      <p>
        Si le Client décide de ne pas donner suite, l&apos;acompte de
        Réservation lui est intégralement remboursé sur simple demande.
      </p>

      <h3>Étape 3 — Signature du CCMI</h3>
      <p>
        Après acceptation du devis définitif, AHF soumet au Client le{" "}
        <strong>CCMI</strong> comprenant : prix global forfaitaire, plans,
        Notice Descriptive, planning de fabrication et conditions suspensives.{" "}
        <strong>
          Le Client dispose d&apos;un délai légal de 10 jours calendaires pour
          se rétracter
        </strong>{" "}
        après première présentation du CCMI par lettre recommandée (art.
        L.&nbsp;271-1 CCH), sans frais ni justification. L&apos;acompte de
        Réservation s&apos;impute sur le premier appel de fonds.
      </p>

      <h3>Étape 4 — Fabrication en atelier (12 semaines)</h3>
      <p>
        La fabrication débute à la levée des conditions suspensives (obtention
        de l&apos;autorisation d&apos;urbanisme, financement confirmé,
        micro-pieux réceptionnés). Le Client est informé par email de
        l&apos;avancement à chaque étape clé.
      </p>

      <h3>Étape 5 — Pose et livraison (1 journée)</h3>
      <p>
        La Maison ARKO est transportée depuis l&apos;Atelier AHF au Pays
        Basque et posée sur les <strong>micro-pieux</strong> préalablement
        installés et réceptionnés par le Client. La réception est prononcée
        contradictoirement, en présence du Client ou de son représentant.
      </p>

      {/* 7 — Tarifs */}
      <h2>7. Tarifs et échéancier de paiement</h2>

      <h3>7.1 Prix — devis indicatif et prix contractuel</h3>
      <p>
        Le devis généré par le configurateur en ligne est un{" "}
        <strong>document indicatif, non contractuel</strong>, valable{" "}
        <strong>3 mois</strong> à compter de la date de Réservation. Il ne
        constitue ni une offre ferme ni un engagement d&apos;AHF sur le prix
        final.
      </p>
      <p>
        Le <strong>prix global et forfaitaire, définitif et contractuel</strong>
        , est celui figurant dans le CCMI signé. Il est établi après
        l&apos;entretien avec l&apos;Architecte intégrée et tient compte des
        spécificités du terrain et du projet.
      </p>
      <p>
        AHF se réserve le droit de modifier ses tarifs affichés à tout moment,
        sans effet sur le CCMI déjà signé.
      </p>

      <p><strong>Frais inclus dans le devis configurateur</strong></p>
      <table>
        <thead>
          <tr>
            <th>Poste</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Maison ARKO clé en main</td>
            <td>Prix de base + options sélectionnées, TTC</td>
          </tr>
          <tr>
            <td>Livraison &amp; pose</td>
            <td>1&nbsp;440&nbsp;€ forfaitaire + 5,4&nbsp;€/km depuis Bayonne</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Frais de terrain — exclus du devis, à prévoir par le Client</strong>
      </p>
      <p>
        Ces frais sont propres au terrain du Client et ne sont pas inclus dans
        le prix de la Maison ARKO. Leur montant est variable selon la parcelle.
      </p>
      <table>
        <thead>
          <tr>
            <th>Poste</th>
            <th>Ordre de grandeur indicatif</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Étude de sol G2 (géotechnique)</td>
            <td>dès 2&nbsp;400&nbsp;€</td>
          </tr>
          <tr>
            <td>Micro-pieux (fourniture + pose)</td>
            <td>selon étude</td>
          </tr>
          <tr>
            <td>Assainissement (micro-station)</td>
            <td>dès 9&nbsp;000&nbsp;€</td>
          </tr>
          <tr>
            <td>Raccordements, terrassement, accès grue</td>
            <td>sur étude</td>
          </tr>
          <tr>
            <td>Permis de construire / déclaration préalable</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Taxe d&apos;aménagement</td>
            <td>selon commune</td>
          </tr>
          <tr>
            <td>Assurance dommages-ouvrage (obligatoire)</td>
            <td>selon assureur</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ces estimations sont fournies à titre indicatif. AHF ne saurait être
        tenue responsable de l&apos;évolution de ces coûts entre la Réservation
        et la signature du CCMI.
      </p>

      <h3>
        7.2 Échéancier adapté à la fabrication en atelier (décret du 6 février
        2020 — art. R.&nbsp;231-7-1 CCH)
      </h3>
      <p>
        En application du décret du 6 février 2020, l&apos;échéancier est
        adapté à l&apos;avancement de la fabrication en atelier.
        L&apos;étape « achèvement des fondations » du barème standard est
        remplacée par une étape d&apos;<strong>achèvement en atelier</strong>,
        constatée contradictoirement.
      </p>
      <table>
        <thead>
          <tr>
            <th>Étape</th>
            <th>% du prix TTC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Réservation (acompte remboursable, imputé au 1er appel de fonds)
            </td>
            <td>5&nbsp;000&nbsp;€</td>
          </tr>
          <tr>
            <td>Ouverture du chantier / lancement fabrication en atelier</td>
            <td>10&nbsp;%</td>
          </tr>
          <tr>
            <td>
              Achèvement de la structure du module en atelier (hors d&apos;eau
              hors d&apos;air)
            </td>
            <td>40&nbsp;%</td>
          </tr>
          <tr>
            <td>
              Achèvement des finitions intérieures et équipements en atelier
            </td>
            <td>60&nbsp;%</td>
          </tr>
          <tr>
            <td>
              Module prêt à livrer — vérification contradictoire en atelier
              possible
            </td>
            <td>80&nbsp;%</td>
          </tr>
          <tr>
            <td>Réception sur site sans réserve</td>
            <td>95&nbsp;%</td>
          </tr>
          <tr>
            <td>Levée des réserves éventuelles</td>
            <td>100&nbsp;%</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ces plafonds sont établis conformément à l&apos;encadrement légal du
        CCMI. AHF ne peut exiger de sommes supérieures aux stades définis. Le
        Client est informé de chaque étape clé par email avec justificatif
        d&apos;avancement.
      </p>
      <p>
        <strong>Note micro-pieux</strong> : la réalisation des micro-pieux par
        le Client ou son prestataire ne déclenche aucun appel de fonds AHF.
        Elle constitue une condition préalable à la Pose, vérifiée par
        l&apos;Architecte intégrée avant toute intervention d&apos;AHF sur
        site.
      </p>

      <h3>7.3 Paiement</h3>
      <p>
        Le paiement de la Réservation s&apos;effectue par carte bancaire via un
        prestataire sécurisé. Les appels de fonds suivants font l&apos;objet de
        factures et sont réglés par virement bancaire.
      </p>

      {/* 8 — Conditions suspensives */}
      <h2>8. Conditions suspensives</h2>
      <p>
        Le CCMI est conditionné, sauf renonciation expresse du Client, à :
      </p>
      <ul>
        <li>
          l&apos;obtention de l&apos;
          <strong>autorisation d&apos;urbanisme</strong> requise (déclaration
          préalable pour l&apos;Arko One, permis de construire pour l&apos;Arko
          Max) ;
        </li>
        <li>
          l&apos;obtention du ou des{" "}
          <strong>prêts de financement</strong> le cas échéant ;
        </li>
        <li>
          la réalisation d&apos;une{" "}
          <strong>étude géotechnique</strong> (de type G1 au minimum) attestant
          de la compatibilité du sol avec le système de micro-pieux ;
        </li>
        <li>
          la{" "}
          <strong>
            mise en œuvre et réception des micro-pieux
          </strong>{" "}
          conformes aux spécifications techniques communiquées par AHF,
          préalablement à la Pose.
        </li>
      </ul>
      <p>
        En cas de non-réalisation d&apos;une condition suspensive dans le délai
        contractuel, le CCMI est résolu de plein droit et l&apos;ensemble des
        sommes versées, y compris l&apos;acompte de Réservation, sont
        remboursées au Client sans pénalité.
      </p>

      {/* 9 — Remboursement */}
      <h2>9. Remboursement des acomptes — engagements d&apos;AHF</h2>

      <h3>9.1 Acompte de Réservation (5&nbsp;000&nbsp;€) — remboursable sans condition avant CCMI</h3>
      <p>
        La Réservation est un <strong>acte précontractuel sans engagement de
        construction</strong>. L&apos;acompte de 5&nbsp;000&nbsp;€ est{" "}
        <strong>intégralement remboursable</strong> à la demande du Client,
        sans condition, sans frais et sans justification, à tout moment avant
        la signature du CCMI.
      </p>
      <p>
        Le remboursement est effectué dans les{" "}
        <strong>14 jours calendaires</strong> suivant la réception de la
        demande, sur le moyen de paiement utilisé lors de la Réservation.
      </p>
      <p>
        <strong>Demande de remboursement</strong> : par email à
        contact@affinityhousefactory.com, en précisant le numéro de Réservation
        et le numéro de série concerné. Le numéro de série est immédiatement
        remis en disponibilité.
      </p>

      <h3>9.2 Acompte Pack Recherche Terrain (1&nbsp;500&nbsp;€) — conditions de remboursement</h3>
      <p>
        L&apos;acompte de 1&nbsp;500&nbsp;€ versé lors de la souscription du
        Pack Recherche Terrain est remboursable dans les cas suivants :
      </p>
      <ul>
        <li>
          <strong>Annulation de la Réservation</strong> par le Client avant
          CCMI : le Pack Recherche Terrain est résilié de plein droit et
          l&apos;acompte de 1&nbsp;500&nbsp;€ est remboursé dans les 14 jours ;
        </li>
        <li>
          <strong>Terrain non trouvé</strong> dans le délai contractuel de
          3 mois (renouvelable par accord écrit) : remboursement intégral dans
          les 14 jours suivant l&apos;expiration du délai ;
        </li>
        <li>
          <strong>
            AHF ne contacte pas le Client dans les 7 jours ouvrés
          </strong>{" "}
          suivant la souscription : remboursement de plein droit sans démarche
          du Client.
        </li>
      </ul>
      <p>
        L&apos;acompte de 1&nbsp;500&nbsp;€ <strong>n&apos;est pas
        remboursable</strong> si la mission a démarré (mandat de recherche
        signé avec le Chasseur partenaire) et que le Client y renonce sans
        motif légitime avant l&apos;expiration du délai contractuel.
      </p>

      <h3>9.3 Remboursement automatique de la Réservation (sans démarche nécessaire)</h3>
      <p>
        L&apos;acompte de Réservation de 5&nbsp;000&nbsp;€ est remboursé de
        plein droit, sans démarche du Client, dans les cas suivants :
      </p>
      <ul>
        <li>
          <strong>AHF ne contacte pas le Client dans les 7 jours ouvrés</strong>{" "}
          suivant la Réservation pour organiser l&apos;entretien avec
          l&apos;Architecte intégrée ;
        </li>
        <li>
          le <strong>devis définitif</strong> remis après l&apos;entretien
          n&apos;est pas accepté par le Client dans le délai de validité de
          3 mois ;
        </li>
        <li>
          <strong>non-réalisation d&apos;une condition suspensive</strong> du
          CCMI dans les délais contractuels ;
        </li>
        <li>
          <strong>rétractation légale de 10 jours</strong> exercée après
          signature du CCMI (art. L.&nbsp;271-1 CCH).
        </li>
      </ul>
      <p>
        Dans ces cas, le remboursement est effectué dans les{" "}
        <strong>14 jours</strong> à compter du fait générateur, sans
        qu&apos;AHF puisse opposer de retenue ni de pénalité.
      </p>

      <h3>9.4 Imputation des acomptes sur le CCMI</h3>
      <p>Si le Client signe le CCMI :</p>
      <ul>
        <li>
          L&apos;acompte de Réservation de{" "}
          <strong>5&nbsp;000&nbsp;€</strong> s&apos;impute intégralement sur le
          premier appel de fonds ;
        </li>
        <li>
          L&apos;acompte Pack Recherche Terrain de{" "}
          <strong>1&nbsp;500&nbsp;€</strong> s&apos;impute à hauteur de{" "}
          <strong>50&nbsp;% (750&nbsp;€)</strong> sur le premier appel de fonds
          si le terrain a été trouvé par le Chasseur partenaire.
        </li>
      </ul>

      <h3>9.5 Résiliation après expiration du délai de rétractation du CCMI</h3>
      <p>
        Une fois le délai légal de rétractation de 10 jours expiré et les
        conditions suspensives levées, la résiliation du CCMI à
        l&apos;initiative du Client peut entraîner des indemnités conformément
        aux dispositions du CCMI et au droit commun.
      </p>

      {/* 10 — Garanties */}
      <h2>10. Garanties légales applicables</h2>
      <p>
        Conformément aux articles 1792 et suivants du Code civil et aux
        dispositions du CCH, les garanties suivantes s&apos;appliquent à chaque
        Maison ARKO :
      </p>

      <h3>10.1 Garantie de parfait achèvement (1 an)</h3>
      <p>
        Couvre tous les désordres signalés lors de la réception ou dans
        l&apos;année suivante. AHF prend en charge les réparations nécessaires.
      </p>

      <h3>10.2 Garantie biennale de bon fonctionnement (2 ans)</h3>
      <p>
        Couvre les éléments d&apos;équipement dissociables du gros œuvre
        (volets, robinetterie, équipements électriques, etc.) pendant 2 ans à
        compter de la réception.
      </p>

      <h3>10.3 Garantie décennale (10 ans)</h3>
      <p>
        AHF est tenue pendant <strong>10 ans</strong> à compter de la réception
        des dommages compromettant la solidité de l&apos;ouvrage ou le rendant
        impropre à sa destination, ainsi que des vices affectant les éléments
        d&apos;équipement indissociables. Cette garantie est transférable aux
        acquéreurs successifs en cas de revente.
      </p>
      <p>
        <strong>
          AHF justifie d&apos;une assurance de responsabilité décennale
        </strong>{" "}
        souscrite auprès de [nom de l&apos;assureur], police n°&nbsp;[à
        compléter], dont l&apos;attestation est remise au Client au plus tard à
        la signature du CCMI.
      </p>

      <h3>10.4 Garantie de livraison à prix et délais convenus (art. L.&nbsp;231-6 CCH)</h3>
      <p>
        AHF fournit, au démarrage du chantier, une garantie de livraison
        délivrée par un établissement de crédit ou une société d&apos;assurance
        agréée. Elle couvre le Client contre les risques d&apos;inexécution ou
        de mauvaise exécution, et assure l&apos;achèvement de la construction
        au prix et dans les délais contractuels, même en cas de défaillance
        d&apos;AHF.
      </p>
      <p>
        <strong>Obligation du Client</strong> : conformément à l&apos;article
        L.&nbsp;242-1 du Code des assurances (loi Spinetta de 1978), le Client
        (maître d&apos;ouvrage) a l&apos;obligation de souscrire une{" "}
        <strong>assurance dommages-ouvrage</strong> avant l&apos;ouverture du
        chantier. AHF peut accompagner le Client dans cette démarche mais ne
        saurait se substituer à cette obligation légale.
      </p>

      {/* 11 — Responsabilité */}
      <h2>11. Responsabilité d&apos;AHF</h2>

      <h3>11.1 Étendue</h3>
      <p>
        AHF est responsable des dommages résultant directement de
        l&apos;inexécution ou de la mauvaise exécution de ses obligations
        contractuelles, dans les limites des garanties légales applicables à la
        construction.
      </p>

      <h3>11.2 Exclusions</h3>
      <p>AHF ne saurait être tenue responsable :</p>
      <ul>
        <li>
          des désordres liés à une utilisation non conforme de la Maison ARKO ;
        </li>
        <li>
          des désordres résultant des <strong>micro-pieux</strong>, de
          l&apos;étude géotechnique, des raccordements ou de tout autre travail
          réalisé par le Client ou ses prestataires extérieurs à AHF ; en
          particulier, tout désordre lié à un défaut de dimensionnement, de
          pose ou de réception des micro-pieux relève de la responsabilité
          exclusive du prestataire du Client ;
        </li>
        <li>
          des dommages causés par un sinistre postérieur à la livraison non
          couvert par les garanties légales (inondation, incendie, etc.) ;
        </li>
        <li>
          des retards de livraison imputables à des cas de force majeure au
          sens de l&apos;article 1218 du Code civil, à des retards dans
          l&apos;obtention des autorisations administratives par le Client, ou
          à un retard dans la mise en œuvre des micro-pieux.
        </li>
      </ul>

      {/* 12 — Urbanisme et prérequis techniques */}
      <h2>12. Urbanisme et prérequis techniques — Responsabilité du Client</h2>

      <h3>12.1 Autorisations d&apos;urbanisme</h3>
      <p>
        Le Client est seul responsable de l&apos;obtention des autorisations
        d&apos;urbanisme requises. La fixation d&apos;une Maison ARKO sur
        micro-pieux constitue une <strong>construction nouvelle</strong> au sens
        de l&apos;article R.&nbsp;421-1 du Code de l&apos;urbanisme, soumise à :
      </p>
      <ul>
        <li>
          <strong>Déclaration préalable de travaux</strong> pour l&apos;Arko
          One (surface de plancher ≤ 20 m²) ;
        </li>
        <li>
          <strong>Permis de construire</strong> pour l&apos;Arko Max (surface
          de plancher ≥ 20 m²).
        </li>
      </ul>
      <p>
        Ces seuils s&apos;appliquent en zone courante. Des règles spécifiques
        peuvent s&apos;imposer en secteur protégé (abords de monuments
        historiques, site classé, ZPPAUP, etc.). L&apos;outil de vérification
        terrain disponible sur le site est fourni à titre indicatif et ne
        constitue pas une étude de faisabilité juridique. AHF peut accompagner
        le Client dans le dépôt des autorisations via l&apos;Architecte
        intégrée, dans les conditions définies dans le CCMI.
      </p>

      <h3>12.2 Étude géotechnique et micro-pieux</h3>
      <p>
        La mise en œuvre des micro-pieux nécessite impérativement une{" "}
        <strong>étude géotechnique préalable de type G1</strong> (mission
        d&apos;étude de site) afin d&apos;attester de la capacité portante du
        sol et de dimensionner correctement le système de fondation. Cette étude
        est à la charge du Client.
      </p>
      <p>
        AHF communique au Client les{" "}
        <strong>spécifications techniques de référence</strong> (charges,
        tolérances, entraxes) auxquelles les micro-pieux doivent répondre. Le
        Client s&apos;assure que son prestataire respecte ces spécifications et
        fournit à AHF une attestation de mise en œuvre avant la date de
        livraison convenue.
      </p>
      <p>
        AHF se réserve le droit de reporter ou de refuser la Pose si les
        micro-pieux ne sont pas conformes aux spécifications techniques, sans
        que cela ouvre droit à indemnité pour le Client.
      </p>

      {/* 13 — Propriété intellectuelle */}
      <h2>13. Propriété intellectuelle</h2>
      <p>
        Les Maisons ARKO, leurs plans, leur design, leur identité visuelle et
        le nom HOWNER sont la propriété exclusive d&apos;AHF et font
        l&apos;objet d&apos;une protection au titre de la propriété
        intellectuelle et/ou industrielle. Toute reproduction, même partielle,
        est interdite sans autorisation préalable écrite.
      </p>

      {/* 14 — Données personnelles */}
      <h2>14. Protection des données personnelles</h2>
      <p>
        Le traitement des données personnelles des Clients est régi par la{" "}
        <strong>Politique de Confidentialité</strong> disponible à{" "}
        <a href="/confidentialite">affinityhome.fr/confidentialite</a>.
        Conformément au RGPD et à la loi Informatique et Libertés, le Client
        peut exercer ses droits à : contact@affinityhousefactory.com.
      </p>

      {/* 15 — Médiation */}
      <h2>15. Médiation et règlement des litiges</h2>

      <h3>15.1 Réclamations</h3>
      <p>
        Toute réclamation est à adresser en priorité à
        contact@affinityhousefactory.com ou par courrier recommandé au siège
        d&apos;AHF : 28 Chemin de Sabalce OEV, 64100 Bayonne.
      </p>

      <h3>15.2 Médiation (consommateurs)</h3>
      <p>
        En cas d&apos;échec de la réclamation amiable dans un délai de 2 mois,
        le Client consommateur peut saisir gratuitement le médiateur compétent.
        Pour les contrats de construction, le médiateur de la{" "}
        <strong>Fédération Française du Bâtiment (FFB)</strong> ou tout
        médiateur agréé peut être sollicité. La plateforme européenne de
        règlement en ligne des litiges est accessible à{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>

      <h3>15.3 Juridiction compétente</h3>
      <p>
        En cas de litige non résolu amiablement, les tribunaux compétents du
        ressort du siège d&apos;AHF seront saisis, sauf dispositions légales
        impératives contraires (notamment pour les consommateurs : tribunal du
        domicile du défendeur).
      </p>

      {/* 16 — Droit applicable */}
      <h2>16. Droit applicable</h2>
      <p>
        Les présentes CGV sont soumises au <strong>droit français</strong>.
        Toute clause contraire au droit de la construction ou à la protection
        du consommateur est réputée non écrite.
      </p>

      {/* 17 — Dispositions finales */}
      <h2>17. Dispositions finales</h2>
      <p>
        En cas de contradiction entre les présentes CGV et le CCMI signé, le
        CCMI prévaut. Les CGV s&apos;appliquent à toutes les réservations
        passées avant la signature du CCMI.
      </p>

      <p>
        <em>
          © 2026 HOWNER / Affinity House Factory — Fabriqué au Pays Basque.
          Renders d&apos;intention — visuels non contractuels.
        </em>
      </p>
    </LegalShell>
  );
}
