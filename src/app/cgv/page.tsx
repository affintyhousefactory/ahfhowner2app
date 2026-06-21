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
        Constructeur »), société [forme juridique] immatriculée au RCS de
        [ville] sous le numéro SIREN [à compléter], dont le siège social est
        situé [adresse complète], Pays Basque, France.
      </p>
      <ul>
        <li>
          Site :{" "}
          <a href="https://affinityhome.fr">https://affinityhome.fr</a>
        </li>
        <li>Contact commercial : contact@affinityhome.fr</li>
        <li>Responsable de publication : [fondé par Puigbo]</li>
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
            <td>
              <strong>Maison ARKO</strong>
            </td>
            <td>
              Ouvrage de construction fabriqué en atelier, livré prêt à vivre,
              décliné en deux modèles : Arko One (20 m²) et Arko Max (40 m²)
            </td>
          </tr>
          <tr>
            <td>
              <strong>Client / Maître d&apos;ouvrage</strong>
            </td>
            <td>
              Toute personne physique ou morale qui réserve ou commande une
              Maison ARKO
            </td>
          </tr>
          <tr>
            <td>
              <strong>Réservation</strong>
            </td>
            <td>
              Acte par lequel le Client, après un échange avec un conseiller
              AHF, verse un acompte de 5 000 € via un lien de pré-paiement
              sécurisé et réserve un numéro de série dans la Série 01
            </td>
          </tr>
          <tr>
            <td>
              <strong>CCMI</strong>
            </td>
            <td>
              Contrat de Construction de Maison Individuelle — contrat définitif
              signé après validation du projet
            </td>
          </tr>
          <tr>
            <td>
              <strong>Atelier</strong>
            </td>
            <td>
              Site de fabrication d&apos;AHF, situé au Pays Basque, dans lequel
              les Maisons ARKO sont intégralement montées et finies avant
              livraison
            </td>
          </tr>
          <tr>
            <td>
              <strong>Livraison / Pose</strong>
            </td>
            <td>
              Phase d&apos;installation de la Maison ARKO sur les fondations du
              Client, réalisée en une journée
            </td>
          </tr>
          <tr>
            <td>
              <strong>Architecte intégrée</strong>
            </td>
            <td>
              Architecte salariée ou mandataire d&apos;AHF qui accompagne le
              projet du Client de la réservation à la réception
            </td>
          </tr>
          <tr>
            <td>
              <strong>Série 01</strong>
            </td>
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
      <ul>
        <li>
          la <strong>Réservation</strong> d&apos;une Maison ARKO via le site{" "}
          <a href="https://affinityhome.fr">https://affinityhome.fr</a> ;
        </li>
        <li>
          la signature ultérieure du <strong>CCMI</strong> (Contrat de
          Construction de Maison Individuelle) au sens de l&apos;article L.
          231-1 du Code de la construction et de l&apos;habitation (CCH), qui
          constitue le contrat principal et définitif.
        </li>
      </ul>
      <p>
        <strong>Avertissement légal</strong> : La Réservation ne constitue pas
        un CCMI. Elle engage uniquement le versement de l&apos;acompte de{" "}
        <strong>5 000 €, remboursable et sans engagement de construction</strong>
        , et la mise en relation avec l&apos;Architecte intégrée. Le CCMI, qui
        détermine le prix global et forfaitaire, les délais de construction et
        l&apos;ensemble des garanties légales, sera soumis à la signature du
        Client avant tout démarrage de fabrication.
      </p>

      {/* 4 — Description des modèles */}
      <h2>4. Description des modèles</h2>

      <h3>4.1 Arko One</h3>
      <ul>
        <li>
          Surface : <strong>20 m²</strong> (+ terrasse selon option)
        </li>
        <li>
          Série 01 : <strong>12 exemplaires numérotés</strong>
        </li>
        <li>
          Prix de départ : à partir de <strong>59 900 € TTC</strong>, clé en
          main, prêt à vivre
        </li>
        <li>
          Délai de fabrication en atelier : <strong>12 semaines</strong> à
          compter de la levée des conditions suspensives du CCMI
        </li>
      </ul>

      <h3>4.2 Arko Max</h3>
      <ul>
        <li>
          Surface : <strong>40 m²</strong> (+ terrasse selon option)
        </li>
        <li>
          Série 01 : <strong>5 exemplaires numérotés</strong>
        </li>
        <li>
          Prix de départ : à partir de <strong>89 900 € TTC</strong>, clé en
          main, prêt à vivre
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
        Sauf mention contraire dans le CCMI : fondations, raccordements aux
        réseaux publics (eau, électricité, assainissement), permis de construire
        (accompagnement proposé), transport au-delà d&apos;un rayon de [X] km
        du site de fabrication.
      </p>

      <h3>4.5 Visuels non contractuels</h3>
      <p>
        Les images, rendus et vidéos présents sur le site sont des
        représentations d&apos;intention. Seuls les plans et la Notice
        Descriptive annexés au CCMI ont valeur contractuelle.
      </p>

      {/* 5 — Spécificités hors site */}
      <h2>5. Spécificités de la fabrication en atelier</h2>

      <h3>5.1 Mode constructif</h3>
      <p>
        Les Maisons ARKO sont fabriquées selon un procédé de{" "}
        <strong>construction en atelier</strong> (off-site manufacturing) :
        l&apos;intégralité du module est montée, équipée et finalisée dans
        l&apos;<strong>Atelier AHF</strong> au Pays Basque, dans un
        environnement contrôlé, avant transport et pose en une journée sur les
        fondations du Client.
      </p>
      <p>
        Ce procédé relève, selon le niveau de finition, des modules 3D
        volumétriques tels que définis par la filière (CSTB, DREAL), et fait
        appel à des procédés constructifs pouvant être qualifiés de{" "}
        <strong>technique non courante</strong> au sens des assureurs
        construction, conformément au corpus normatif en vigueur (DTU 31.2,
        etc.).
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
        Pour les procédés constructifs non couverts par un DTU, AHF s&apos;engage
        à disposer d&apos;un <strong>Avis Technique (AT) ou d&apos;une
        Appréciation Technique d&apos;Expérimentation (ATEx)</strong> délivré(e)
        par le CSTB, préalablement à la mise en fabrication de la Série 01. Ce
        document est communiqué au Client sur demande et est annexé au CCMI.
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

      <h3>Étape 1 — Demande de réservation et échange avec un conseiller</h3>
      <p>
        Le Client exprime son intérêt sur le site et est mis en contact avec un
        conseiller AHF. Cet échange — sans engagement — permet de valider les
        grandes lignes du projet (modèle, numéro de série souhaité, terrain,
        calendrier) et de répondre aux questions du Client.
      </p>
      <p>
        À l&apos;issue de cet échange, AHF adresse au Client un{" "}
        <strong>lien de pré-paiement sécurisé</strong> pour confirmer sa
        réservation.
      </p>
      <p>
        <strong>Confirmation de réservation — acompte de 5 000 €</strong>
      </p>
      <p>
        Le Client confirme sa réservation en réglant un{" "}
        <strong>acompte de 5 000 € TTC</strong> via le lien sécurisé reçu. La
        Réservation est confirmée par email avec le numéro de série attribué.
      </p>
      <p>
        Cet acompte est <strong>entièrement remboursable</strong> et ne
        constitue <strong>aucun engagement de construction</strong> : si le
        projet ne se concrétise pas, pour quelque raison que ce soit, le Client
        est remboursé intégralement selon les conditions de l&apos;article 9.
      </p>

      <h3>Étape 2 — Visio avec notre architecte intégrée (gratuit, sous 7 jours)</h3>
      <p>
        Dans les 7 jours suivant la Réservation, notre architecte intégrée
        contacte le Client pour un entretien de 30 minutes afin de valider la
        compatibilité du terrain, les options souhaitées et les prérequis
        administratifs (permis de construire, raccordements).
      </p>

      <h3>Étape 3 — Signature du CCMI</h3>
      <p>
        Après validation du projet, AHF soumet au Client le CCMI comprenant :
        prix global forfaitaire, plans, Notice Descriptive, planning de
        fabrication et conditions suspensives.{" "}
        <strong>
          Le Client dispose d&apos;un délai de 10 jours calendaires pour se
          rétracter
        </strong>{" "}
        après signature (art. L. 271-1 CCH). L&apos;acompte de Réservation
        s&apos;impute sur le 1er appel de fonds.
      </p>

      <h3>Étape 4 — Fabrication en atelier (12 semaines)</h3>
      <p>
        La fabrication débute à la levée des conditions suspensives (obtention
        du permis de construire, financement, etc.). Le Client est informé de
        l&apos;avancement à chaque étape clé.
      </p>

      <h3>Étape 5 — Pose et livraison (1 journée)</h3>
      <p>
        La Maison ARKO est transportée et posée sur les fondations
        préalablement réalisées par le Client (ou AHF en option). La réception
        est prononcée contradictoirement.
      </p>

      {/* 7 — Tarifs */}
      <h2>7. Tarifs et échéancier de paiement</h2>

      <h3>7.1 Prix</h3>
      <p>
        Le prix affiché sur le site est un{" "}
        <strong>prix de départ indicatif TTC</strong>. Le prix global et
        forfaitaire, définitif et contractuel, est celui mentionné dans le CCMI
        signé.
      </p>
      <p>
        AHF se réserve le droit de modifier ses tarifs à tout moment, sans que
        cela n&apos;affecte le prix convenu dans un CCMI déjà signé.
      </p>

      <h3>7.2 Échéancier (conforme CCH art. R. 231-7)</h3>
      <p>
        L&apos;échéancier de paiement du CCMI respecte les plafonds légaux
        suivants :
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
              Réservation (acompte remboursable, sans engagement de
              construction, imputé au 1er appel)
            </td>
            <td>5 000 €</td>
          </tr>
          <tr>
            <td>Ouverture de chantier / lancement fabrication</td>
            <td>10 %</td>
          </tr>
          <tr>
            <td>Achèvement des fondations</td>
            <td>25 %</td>
          </tr>
          <tr>
            <td>Mise hors d&apos;eau (modules posés)</td>
            <td>40 %</td>
          </tr>
          <tr>
            <td>Mise hors d&apos;air / second œuvre</td>
            <td>60 %</td>
          </tr>
          <tr>
            <td>Achèvement des travaux d&apos;équipement</td>
            <td>80 %</td>
          </tr>
          <tr>
            <td>Réception sans réserve</td>
            <td>95 %</td>
          </tr>
          <tr>
            <td>Levée des réserves éventuelles</td>
            <td>100 %</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ces plafonds sont fixés par la loi. AHF ne peut pas exiger de sommes
        supérieures à celles autorisées à chaque stade.
      </p>

      <h3>7.3 Paiement</h3>
      <p>
        Le paiement de la Réservation s&apos;effectue par carte bancaire via le{" "}
        <strong>lien de pré-paiement sécurisé</strong> adressé par AHF au
        Client après leur échange. Les appels de fonds suivants font
        l&apos;objet de factures et sont réglés par virement bancaire.
      </p>

      {/* 8 — Conditions suspensives */}
      <h2>8. Conditions suspensives</h2>
      <p>
        Le CCMI est conditionné, sauf renonciation expresse du Client, à :
      </p>
      <ul>
        <li>
          l&apos;obtention du{" "}
          <strong>permis de construire</strong> (ou déclaration préalable selon
          surface et PLU) ;
        </li>
        <li>
          l&apos;obtention du ou des{" "}
          <strong>prêts de financement</strong> le cas échéant ;
        </li>
        <li>
          la <strong>réalisation des fondations</strong> conformes aux
          spécifications techniques d&apos;AHF.
        </li>
      </ul>
      <p>
        En cas de non-réalisation d&apos;une condition suspensive dans le délai
        contractuel, le CCMI est résolu de plein droit et l&apos;ensemble des
        sommes versées, y compris l&apos;acompte de Réservation, sont
        remboursées au Client sans pénalité.
      </p>

      {/* 9 — Rétractation */}
      <h2>9. Rétractation et remboursement de l&apos;acompte de Réservation</h2>

      <h3>9.1 Avant signature du CCMI — remboursement libre et sans condition</h3>
      <p>
        L&apos;acompte de Réservation de <strong>5 000 €</strong> est{" "}
        <strong>intégralement remboursable</strong> à la demande du Client,
        sans justification ni pénalité, à tout moment avant la signature du
        CCMI. La Réservation ne constitue aucun engagement de construction : le
        Client est libre de renoncer à tout moment.
      </p>
      <p>
        Pour exercer ce droit, il suffit d&apos;en faire la demande par email à{" "}
        contact@affinityhome.fr.
      </p>
      <p>
        Le remboursement est effectué dans les <strong>14 jours</strong>{" "}
        suivant la réception de la demande, sur le moyen de paiement utilisé
        lors de la Réservation.
      </p>

      <h3>9.2 Après signature du CCMI — délai légal de rétractation</h3>
      <p>
        Conformément à l&apos;article L. 271-1 du CCH, le Client dispose
        d&apos;un <strong>délai de 10 jours calendaires</strong> à compter de
        la première présentation de la lettre notifiant le CCMI pour se
        rétracter, sans frais ni pénalité. La rétractation entraîne le
        remboursement intégral des sommes versées.
      </p>

      <h3>9.3 Après expiration du délai de rétractation</h3>
      <p>
        Une fois le délai de rétractation expiré et les conditions suspensives
        levées, la résiliation du CCMI à l&apos;initiative du Client peut
        entraîner des indemnités conformément aux dispositions contractuelles
        du CCMI.
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
        AHF est tenue pendant <strong>10 ans</strong> à compter de la
        réception des dommages compromettant la solidité de l&apos;ouvrage ou
        le rendant impropre à sa destination, ainsi que des vices affectant les
        éléments d&apos;équipement indissociables. Cette garantie est
        transférable aux acquéreurs successifs en cas de revente.
      </p>
      <p>
        <strong>AHF justifie d&apos;une assurance de responsabilité
        décennale</strong> souscrite auprès de [nom de l&apos;assureur],
        police n° [à compléter], dont l&apos;attestation est remise au Client
        au plus tard à la signature du CCMI.
      </p>

      <h3>10.4 Garantie de livraison à prix et délais convenus (art. L. 231-6 CCH)</h3>
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
        L. 242-1 du Code des assurances (loi Spinetta de 1978), le Client
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
          des désordres résultant des fondations, raccordements ou travaux
          réalisés par des intervenants extérieurs à AHF ;
        </li>
        <li>
          des dommages causés par un sinistre postérieur à la livraison non
          couvert par les garanties légales (inondation, incendie, etc.) ;
        </li>
        <li>
          des retards de livraison imputables à des cas de force majeure au
          sens de l&apos;article 1218 du Code civil, ou à des retards dans
          l&apos;obtention des autorisations administratives par le Client.
        </li>
      </ul>

      {/* 12 — Urbanisme */}
      <h2>12. Urbanisme — Responsabilité du Client</h2>
      <p>
        Le Client est seul responsable de la conformité de son projet aux
        règles d&apos;urbanisme applicables à son terrain (PLU, PLUi, règlement
        de lotissement, zones protégées, etc.). L&apos;outil de vérification
        terrain disponible sur le site est fourni à titre indicatif et ne
        constitue pas une étude de faisabilité juridique.
      </p>
      <p>
        AHF peut accompagner le Client dans le dépôt du permis de construire
        via notre architecte intégrée, dans les conditions définies dans le
        CCMI.
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
        peut exercer ses droits à : contact@affinityhome.fr.
      </p>

      {/* 15 — Médiation */}
      <h2>15. Médiation et règlement des litiges</h2>

      <h3>15.1 Réclamations</h3>
      <p>
        Toute réclamation est à adresser en priorité à contact@affinityhome.fr
        ou par courrier recommandé au siège d&apos;AHF.
      </p>

      <h3>15.2 Médiation (consommateurs)</h3>
      <p>
        En cas d&apos;échec de la réclamation amiable dans un délai de 2 mois,
        le Client consommateur peut saisir gratuitement le médiateur compétent.
        Pour les contrats de construction, le médiateur de la Fédération
        Française du Bâtiment (FFB) ou tout médiateur agréé peut être
        sollicité. La plateforme européenne de règlement en ligne des litiges
        est accessible à{" "}
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
