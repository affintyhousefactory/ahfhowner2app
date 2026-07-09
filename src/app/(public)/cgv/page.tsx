import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "Conditions générales de vente | HOWNER",
  description:
    "Conditions générales de vente HOWNER — réservation, versement initial, échéancier, garanties légales et parcours de fabrication, livraison et installation ARKO.",
  alternates: { canonical: "/cgv" },
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Conditions générales de vente"
      pending={false}
      updated="9 juillet 2026"
    >
      {/* 1 */}
      <h2>1. Identification de l&apos;éditeur et du fabricant-installateur</h2>
      <p>
        <strong>HOWNER</strong> est une marque exploitée par{" "}
        <strong>Affinity House Factory</strong> (ci-après « AHF »), société par
        actions simplifiée (SAS), immatriculée sous le numéro{" "}
        <strong>SIRET 982&nbsp;581&nbsp;506&nbsp;00010</strong>, dont le siège
        social est situé <strong>28 Chemin de Sabalce OEV, 64100 Bayonne, France</strong>.
      </p>
      <ul>
        <li>Site internet : <a href="https://affinityhome.fr">https://affinityhome.fr</a></li>
        <li>Contact commercial : contact@affinityhousefactory.com</li>
        <li>Directeur de la publication : Albert Puigbo</li>
        <li>Numéro de TVA intracommunautaire : FR[à compléter]</li>
        <li>Médiateur de la consommation : [à compléter avant publication]</li>
        <li>Assureur responsabilité civile professionnelle / décennale : [à compléter avant publication]</li>
      </ul>
      <p>
        Les présentes Conditions Générales de Vente (ci-après les « CGV »)
        encadrent le parcours de réservation, de commande, de fabrication, de
        livraison et d&apos;installation des maisons légères de gamme{" "}
        <strong>ARKO</strong> proposées par AHF.
      </p>

      {/* 2 */}
      <h2>2. Définitions</h2>
      <table>
        <thead>
          <tr><th>Terme</th><th>Définition</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>AHF</strong></td>
            <td>Affinity House Factory, fabricant et installateur des maisons légères ARKO dans le périmètre expressément prévu au contrat.</td>
          </tr>
          <tr>
            <td><strong>HOWNER</strong></td>
            <td>Marque, portail ou espace digital exploité par AHF pour présenter les modèles ARKO, qualifier les projets, éditer des devis et accompagner le Client.</td>
          </tr>
          <tr>
            <td><strong>Client</strong></td>
            <td>Toute personne physique ou morale sollicitant AHF pour un projet de maison légère ARKO. Lorsque le Client agit à des fins non professionnelles, il est considéré comme consommateur au sens du Code de la consommation.</td>
          </tr>
          <tr>
            <td><strong>Maître d&apos;ouvrage</strong></td>
            <td>Personne pour le compte de laquelle le projet est réalisé et qui assume notamment la responsabilité du terrain, des autorisations administratives et des assurances qui lui incombent.</td>
          </tr>
          <tr>
            <td><strong>Maison ARKO</strong></td>
            <td>Maison légère, fabriquée en atelier, livrée puis installée sur un terrain choisi par le Client, selon le modèle, les options et les caractéristiques techniques prévues au devis et au contrat.</td>
          </tr>
          <tr>
            <td><strong>Modèle ARKO</strong></td>
            <td>Modèle standard ou variante proposée par AHF, notamment Arko One, Arko Max ou tout autre modèle figurant dans la proposition commerciale.</td>
          </tr>
          <tr>
            <td><strong>Devis</strong></td>
            <td>Document commercial et technique présentant le modèle retenu, les options, le prix estimatif ou ferme selon son état de validation, les prestations incluses et exclues, et les conditions de validité.</td>
          </tr>
          <tr>
            <td><strong>Réservation commerciale</strong></td>
            <td>Étape précontractuelle permettant au Client de confirmer son intérêt pour un projet ARKO par un versement initial de 5&nbsp;000&nbsp;€, remboursable avant signature du contrat de fabrication, livraison et installation.</td>
          </tr>
          <tr>
            <td><strong>Contrat de fabrication, livraison et installation</strong></td>
            <td>Contrat définitif signé entre AHF et le Client, définissant les obligations des parties, le prix, le calendrier, le périmètre des prestations, les prérequis techniques et les conditions de livraison et d&apos;installation de la maison ARKO.</td>
          </tr>
          <tr>
            <td><strong>Notice technique contractuelle</strong></td>
            <td>Annexe au contrat décrivant précisément les caractéristiques techniques de la maison ARKO, les matériaux, équipements, finitions, options et limites de prestation.</td>
          </tr>
          <tr>
            <td><strong>Fiches techniques élémentaires</strong></td>
            <td>Annexes détaillant les composants ou lots techniques : structure, isolation, menuiseries, électricité, plomberie, chauffage, ventilation, finitions, transport, installation, etc.</td>
          </tr>
          <tr>
            <td><strong>Terrain</strong></td>
            <td>Terrain choisi, réservé ou acquis par le Client, destiné à recevoir la maison ARKO. AHF n&apos;intervient pas dans l&apos;achat du terrain.</td>
          </tr>
          <tr>
            <td><strong>Prérequis terrain</strong></td>
            <td>Ensemble des conditions nécessaires à la fabrication, livraison et installation : propriété ou droits suffisants, autorisation d&apos;urbanisme, accès chantier, fondations ou supports, étude de sol, raccordements préparatoires, etc.</td>
          </tr>
          <tr>
            <td><strong>Fondations / supports d&apos;accueil</strong></td>
            <td>Ouvrages destinés à recevoir la maison ARKO : plots, longrines, micropieux, dalle, pieux vissés ou tout autre système validé techniquement. Sauf mention contraire, ces ouvrages sont à la charge du Client.</td>
          </tr>
          <tr>
            <td><strong>Livraison</strong></td>
            <td>Acheminement de la maison ARKO depuis l&apos;atelier ou le site de fabrication jusqu&apos;au terrain du Client.</td>
          </tr>
          <tr>
            <td><strong>Installation / Pose</strong></td>
            <td>Opération consistant à positionner et installer la maison ARKO sur les supports d&apos;accueil préalablement réalisés et réceptionnés.</td>
          </tr>
          <tr>
            <td><strong>Réception</strong></td>
            <td>Acte contradictoire par lequel le Client accepte la maison livrée et installée, avec ou sans réserves, et qui fait l&apos;objet d&apos;un procès-verbal de réception.</td>
          </tr>
          <tr>
            <td><strong>Mandataire partenaire</strong></td>
            <td>Professionnel indépendant susceptible d&apos;accompagner le Client dans la recherche d&apos;un terrain. Il agit sous sa propre responsabilité et n&apos;est pas partie au contrat de fabrication, livraison et installation conclu avec AHF.</td>
          </tr>
          <tr>
            <td><strong>Conditions suspensives</strong></td>
            <td>Conditions dont la réalisation est nécessaire pour permettre l&apos;exécution du contrat : obtention du financement, autorisation d&apos;urbanisme, terrain disponible, étude de sol favorable, accès chantier, supports réceptionnés, etc.</td>
          </tr>
        </tbody>
      </table>

      {/* 3 */}
      <h2>3. Objet des CGV</h2>
      <p>Les présentes CGV ont pour objet de définir les conditions dans lesquelles AHF propose :</p>
      <ol>
        <li>la présentation des modèles de maisons légères ARKO ;</li>
        <li>l&apos;édition d&apos;un devis commercial et technique ;</li>
        <li>la réservation commerciale d&apos;un projet ARKO ;</li>
        <li>la signature ultérieure d&apos;un contrat de fabrication, livraison et installation ;</li>
        <li>la fabrication en atelier de la maison ARKO ;</li>
        <li>la livraison sur le terrain choisi par le Client ;</li>
        <li>l&apos;installation sur site, sous réserve de la réunion des prérequis techniques, administratifs et financiers.</li>
      </ol>
      <p>
        Les présentes CGV ne régissent pas l&apos;achat du terrain, l&apos;acte
        notarié, les frais de notaire, les relations entre le Client et un
        mandataire immobilier, les taxes d&apos;urbanisme, les travaux réalisés
        par des prestataires tiers du Client, ni les autorisations
        administratives qui relèvent de la responsabilité du Client, sauf
        mission spécifique expressément confiée à AHF.
      </p>

      {/* 4 */}
      <h2>4. Nature juridique de l&apos;intervention d&apos;AHF</h2>
      <p>
        AHF intervient dans le cadre d&apos;un{" "}
        <strong>contrat de fabrication, livraison et installation d&apos;une maison légère ARKO</strong>{" "}
        sur un terrain choisi par le Client.
      </p>
      <p>Le contrat définitif n&apos;a pas pour objet :</p>
      <ul>
        <li>la vente d&apos;un terrain ;</li>
        <li>la vente d&apos;un ensemble « terrain + maison » ;</li>
        <li>l&apos;acquisition foncière ;</li>
        <li>la rédaction ou la signature d&apos;un acte notarié ;</li>
        <li>la garantie de constructibilité du terrain indépendamment des autorisations administratives ;</li>
        <li>la réalisation de prestations non expressément incluses dans le devis et le contrat.</li>
      </ul>
      <p>
        Le Client reconnaît que le terrain destiné à recevoir la maison ARKO
        est choisi, négocié, réservé ou acquis par lui, sous sa responsabilité.
      </p>

      <h3>4.1 Alerte de qualification juridique</h3>
      <p>
        Selon la nature exacte du projet, le périmètre d&apos;intervention
        d&apos;AHF, les prestations incluses, la fourniture éventuelle de
        plans et l&apos;usage d&apos;habitation de la maison, certaines
        opérations peuvent être susceptibles de relever d&apos;un régime légal
        spécifique applicable aux travaux de construction de maison
        individuelle.
      </p>
      <p>
        Dans une telle hypothèse, les règles légales impératives applicables
        prévalent sur les présentes CGV. AHF se réserve le droit d&apos;adapter
        le contrat, les garanties, les modalités de paiement et les documents
        contractuels afin de respecter le régime juridique applicable au
        projet.
      </p>
      <p>
        Aucune stipulation des présentes CGV ne peut avoir pour objet ou pour
        effet d&apos;écarter une disposition légale impérative applicable au
        Client.
      </p>

      {/* 5 */}
      <h2>5. Description des modèles ARKO</h2>
      <p>
        Les maisons ARKO sont des maisons légères fabriquées hors site, en
        atelier, puis livrées et installées sur le terrain du Client.
      </p>
      <p>
        Les modèles, surfaces, prix, finitions et options présentés sur le
        site sont fournis à titre d&apos;information commerciale. Les
        caractéristiques contractuelles sont celles figurant dans :
      </p>
      <ol>
        <li>le devis accepté ;</li>
        <li>le contrat de fabrication, livraison et installation ;</li>
        <li>la notice technique contractuelle ;</li>
        <li>les plans validés ;</li>
        <li>les fiches techniques annexées.</li>
      </ol>

      <h3>5.1 Modèles présentés</h3>
      <p>Les modèles disponibles peuvent notamment comprendre :</p>
      <ul>
        <li><strong>Arko One</strong> : modèle compact d&apos;environ 20 m², selon configuration retenue ;</li>
        <li><strong>Arko Max</strong> : modèle d&apos;environ 30 à 40 m², selon configuration retenue ;</li>
        <li>tout autre modèle, variante ou déclinaison proposée par AHF.</li>
      </ul>
      <p>
        Les surfaces, équipements et prix affichés sur le site peuvent
        évoluer. Seuls les documents contractuels signés engagent AHF.
      </p>

      <h3>5.2 Ce qui peut être inclus</h3>
      <p>
        Selon la proposition commerciale et le contrat signé, la maison ARKO
        peut comprendre tout ou partie des éléments suivants :
      </p>
      <ul>
        <li>structure et ossature ;</li>
        <li>isolation ;</li>
        <li>menuiseries extérieures ;</li>
        <li>couverture et enveloppe ;</li>
        <li>second œuvre intérieur ;</li>
        <li>équipements sanitaires ;</li>
        <li>équipements électriques ;</li>
        <li>plomberie intérieure ;</li>
        <li>système de ventilation ;</li>
        <li>chauffage ou solution thermique prévue au devis ;</li>
        <li>revêtements intérieurs ;</li>
        <li>cuisine ou mobilier intégré si expressément prévu ;</li>
        <li>livraison ;</li>
        <li>installation sur supports d&apos;accueil conformes.</li>
      </ul>
      <p>
        La liste précise des prestations incluses est définie dans le devis et
        la notice technique contractuelle.
      </p>

      <h3>5.3 Ce qui est exclu par défaut</h3>
      <p>Sauf mention contraire expresse dans le devis ou le contrat, sont exclus :</p>
      <ul>
        <li>l&apos;achat du terrain ;</li>
        <li>les frais de notaire ;</li>
        <li>les frais d&apos;agence immobilière ou de mandataire ;</li>
        <li>les taxes d&apos;urbanisme ;</li>
        <li>les études de sol ;</li>
        <li>les fondations, micropieux, plots, longrines, dalles ou supports d&apos;accueil ;</li>
        <li>le terrassement ;</li>
        <li>les voiries et réseaux divers ;</li>
        <li>les raccordements aux réseaux publics ou privés ;</li>
        <li>l&apos;assainissement individuel ou collectif ;</li>
        <li>les autorisations d&apos;urbanisme ;</li>
        <li>les frais d&apos;architecte ou de bureau d&apos;études non inclus ;</li>
        <li>l&apos;assurance dommages-ouvrage du Client ;</li>
        <li>les aménagements extérieurs ;</li>
        <li>les clôtures, terrasses, plantations, stationnements, accès grue, accès chantier et ouvrages annexes ;</li>
        <li>toute prestation non expressément mentionnée comme incluse.</li>
      </ul>

      {/* 6 */}
      <h2>6. Visuels, simulateurs et configurateurs</h2>
      <p>
        Les images, rendus 3D, vidéos, schémas, simulations et configurations
        présentés sur le site sont fournis à titre illustratif.
      </p>
      <p>
        Ils ne constituent pas des documents contractuels, sauf lorsqu&apos;ils
        sont expressément annexés au contrat signé et identifiés comme tels.
      </p>
      <p>
        Le configurateur en ligne, lorsqu&apos;il est disponible, permet
        d&apos;obtenir une estimation ou une préconfiguration du projet. Cette
        estimation ne constitue pas une offre ferme ni un engagement définitif
        d&apos;AHF tant qu&apos;un devis validé puis un contrat n&apos;ont pas
        été signés.
      </p>

      {/* 7 */}
      <h2>7. Parcours client</h2>

      <h3>7.1 Étape 0 — Premier échange et proposition commerciale</h3>
      <p>
        Après un premier échange téléphonique ou par visioconférence, AHF
        adresse au Client une proposition commerciale par email.
      </p>
      <p>Cette proposition peut comprendre :</p>
      <ul>
        <li>le modèle ARKO envisagé ;</li>
        <li>les principales caractéristiques techniques ;</li>
        <li>les options sélectionnées ;</li>
        <li>les conditions prévisionnelles de fabrication, livraison et installation ;</li>
        <li>les prestations incluses et exclues ;</li>
        <li>un échéancier prévisionnel de paiement ;</li>
        <li>les prérequis terrain connus à ce stade.</li>
      </ul>

      <h3>7.2 Étape 1 — Réservation commerciale du projet</h3>
      <p>
        Pour confirmer son intérêt et réserver son projet, le Client peut être
        invité à verser un montant initial de <strong>5&nbsp;000&nbsp;€</strong>.
      </p>
      <p>
        Ce versement est une <strong>réservation commerciale précontractuelle</strong>.
        Il est intégralement remboursable tant que le contrat de fabrication,
        livraison et installation n&apos;a pas été signé.
      </p>
      <p>
        Le paiement peut être réalisé par virement bancaire ou par paiement
        sécurisé en ligne, selon les modalités proposées par AHF.
      </p>

      <h3>7.3 Étape 2 — Validation technique et contractuelle</h3>
      <p>Avant signature du contrat définitif, AHF et le Client vérifient notamment :</p>
      <ul>
        <li>l&apos;identification du terrain ;</li>
        <li>la situation du Client au regard du terrain : propriétaire, futur propriétaire, compromis, promesse ou autre droit permettant l&apos;installation ;</li>
        <li>la nature de l&apos;autorisation d&apos;urbanisme requise ;</li>
        <li>les contraintes d&apos;accès, de transport et d&apos;installation ;</li>
        <li>les supports d&apos;accueil nécessaires ;</li>
        <li>les raccordements à prévoir ;</li>
        <li>les conditions de financement ;</li>
        <li>les documents techniques à annexer au contrat.</li>
      </ul>

      <h3>7.4 Étape 3 — Signature du contrat de fabrication, livraison et installation</h3>
      <p>
        La signature du contrat définitif intervient après validation du
        devis, des conditions techniques et des conditions suspensives.
      </p>
      <p>Le contrat précise notamment :</p>
      <ul>
        <li>le prix ;</li>
        <li>le modèle retenu ;</li>
        <li>les options ;</li>
        <li>les prestations incluses ;</li>
        <li>les prestations exclues ;</li>
        <li>les conditions suspensives ;</li>
        <li>l&apos;échéancier de paiement ;</li>
        <li>les délais de fabrication, livraison et installation ;</li>
        <li>les responsabilités respectives d&apos;AHF et du Client ;</li>
        <li>les garanties et assurances applicables ;</li>
        <li>les modalités de réception.</li>
      </ul>

      <h3>7.5 Étape 4 — Fabrication en atelier</h3>
      <p>
        La fabrication débute après signature du contrat, expiration ou purge
        des éventuels délais de rétractation applicables, levée des conditions
        prévues au contrat et paiement des sommes dues à l&apos;étape
        correspondante.
      </p>
      <p>
        Le Client est informé par email des étapes clés : lancement de
        fabrication, avancement structurel, finitions, maison prête à livrer.
      </p>

      <h3>7.6 Étape 5 — Livraison et installation</h3>
      <p>La livraison et l&apos;installation interviennent lorsque :</p>
      <ul>
        <li>la maison ARKO est prête à livrer ;</li>
        <li>le terrain est accessible ;</li>
        <li>les supports d&apos;accueil sont réalisés et réceptionnés ;</li>
        <li>les autorisations nécessaires ont été obtenues ;</li>
        <li>les conditions de sécurité, de météo, de manutention et d&apos;accès permettent l&apos;intervention ;</li>
        <li>les factures exigibles ont été réglées.</li>
      </ul>
      <p>
        L&apos;installation est généralement réalisée en une journée, sous
        réserve des conditions d&apos;accès, de météo, de préparation du
        terrain et des contraintes propres au site.
      </p>

      <h3>7.7 Étape 6 — Réception</h3>
      <p>
        À l&apos;issue de l&apos;installation, un procès-verbal de réception
        est établi contradictoirement entre AHF et le Client, avec ou sans
        réserves.
      </p>
      <p>
        La réception marque le point de départ des garanties légales
        applicables aux prestations réalisées.
      </p>

      {/* 8 */}
      <h2>8. Prix et devis</h2>

      <h3>8.1 Prix affichés</h3>
      <p>Les prix affichés sur le site sont indicatifs, sauf mention expresse contraire. Ils peuvent varier selon :</p>
      <ul>
        <li>le modèle choisi ;</li>
        <li>les options ;</li>
        <li>le niveau de finition ;</li>
        <li>les contraintes de fabrication ;</li>
        <li>les contraintes de transport ;</li>
        <li>les contraintes d&apos;installation ;</li>
        <li>la localisation du terrain ;</li>
        <li>l&apos;évolution des coûts de matériaux, de transport ou de main-d&apos;œuvre ;</li>
        <li>les contraintes techniques propres au terrain.</li>
      </ul>

      <h3>8.2 Devis</h3>
      <p>Le devis précise :</p>
      <ul>
        <li>l&apos;identité d&apos;AHF ;</li>
        <li>l&apos;identité du Client ;</li>
        <li>la date d&apos;émission ;</li>
        <li>la durée de validité ;</li>
        <li>le modèle retenu ;</li>
        <li>les options ;</li>
        <li>les prestations incluses ;</li>
        <li>les prestations exclues ;</li>
        <li>le prix HT, la TVA applicable et le prix TTC ;</li>
        <li>les frais de livraison ou leur méthode de calcul ;</li>
        <li>les conditions de paiement ;</li>
        <li>les conditions particulières éventuelles.</li>
      </ul>
      <p>
        Le devis n&apos;a de valeur contractuelle qu&apos;après acceptation
        par le Client et confirmation par AHF, sous réserve de la signature du
        contrat définitif lorsque celui-ci est requis.
      </p>

      <h3>8.3 Frais propres au terrain</h3>
      <p>
        Les frais propres au terrain sont en principe à la charge du Client,
        sauf stipulation contraire expresse. Ils peuvent notamment comprendre :
      </p>
      <table>
        <thead><tr><th>Poste</th><th>Commentaire</th></tr></thead>
        <tbody>
          <tr><td>Étude de sol</td><td>À prévoir selon nature du terrain et prescriptions techniques.</td></tr>
          <tr><td>Fondations / supports</td><td>Plots, micropieux, dalle, longrines ou autre système validé.</td></tr>
          <tr><td>Terrassement</td><td>Préparation du site, nivellement, accès.</td></tr>
          <tr><td>Raccordements</td><td>Eau, électricité, assainissement, télécom, réseaux divers.</td></tr>
          <tr><td>Assainissement</td><td>Assainissement collectif ou individuel selon situation.</td></tr>
          <tr><td>Autorisations</td><td>Déclaration préalable, permis de construire ou autre autorisation.</td></tr>
          <tr><td>Taxes</td><td>Taxe d&apos;aménagement, PFAC ou autres taxes éventuelles.</td></tr>
          <tr><td>Accès chantier</td><td>Cheminement, grutage, stationnement, portance, dégagements.</td></tr>
          <tr><td>Assurance dommages-ouvrage</td><td>À souscrire par le Client lorsque la réglementation l&apos;exige.</td></tr>
        </tbody>
      </table>
      <p>
        Les montants éventuellement indiqués par AHF pour ces postes sont
        donnés à titre indicatif et ne constituent pas un engagement de prix,
        sauf stipulation contraire expresse.
      </p>

      {/* 9 */}
      <h2>9. Échéancier de paiement</h2>
      <p>Le paiement de la maison ARKO s&apos;effectue progressivement selon l&apos;avancement du projet.</p>

      <h3>9.1 Versement initial de réservation</h3>
      <p>
        Après envoi de la proposition commerciale, un versement initial de{" "}
        <strong>5&nbsp;000&nbsp;€</strong> peut être demandé au Client afin de
        confirmer la réservation commerciale du projet.
      </p>
      <p>
        Ce versement est intégralement remboursable tant que le contrat de
        fabrication, livraison et installation n&apos;a pas été signé.
      </p>

      <h3>9.2 Imputation du versement initial</h3>
      <p>
        Une fois le contrat signé, le versement initial de 5&nbsp;000&nbsp;€
        est déduit du prix total de la maison ARKO et intégré à
        l&apos;échéancier de paiement.
      </p>

      <h3>9.3 Factures d&apos;étape</h3>
      <p>Sauf conditions particulières différentes, l&apos;échéancier peut être structuré comme suit :</p>
      <table>
        <thead><tr><th>Étape</th><th>Moment</th><th>Montant</th></tr></thead>
        <tbody>
          <tr>
            <td>Réservation commerciale</td>
            <td>Avant signature du contrat définitif</td>
            <td>5&nbsp;000&nbsp;€, remboursables avant signature</td>
          </tr>
          <tr>
            <td>Lancement de fabrication</td>
            <td>Après signature du contrat et levée des prérequis de lancement</td>
            <td>40&nbsp;% du montant total TTC, déduction faite des 5&nbsp;000&nbsp;€ déjà versés</td>
          </tr>
          <tr>
            <td>Sortie d&apos;atelier</td>
            <td>Maison fabriquée et prête à livrer</td>
            <td>50&nbsp;% du montant total TTC</td>
          </tr>
          <tr>
            <td>Livraison, installation et réception</td>
            <td>Livraison et installation sur site, procès-verbal de réception</td>
            <td>10&nbsp;% du montant total TTC</td>
          </tr>
        </tbody>
      </table>
      <p>
        Cet échéancier peut être adapté dans le contrat selon la nature du
        projet, le modèle retenu, le niveau de finition, le financement, les
        conditions particulières ou toute règle légale impérative applicable.
      </p>

      <h3>9.4 Retard de paiement</h3>
      <p>
        Tout retard de paiement peut entraîner la suspension de la
        fabrication, de la livraison ou de l&apos;installation, sans que cette
        suspension puisse être imputée à AHF.
      </p>
      <p>
        Les éventuels frais, retards, coûts de stockage, reports de transport
        ou pertes liés à un retard de paiement pourront être facturés au
        Client, dans les conditions prévues au contrat.
      </p>

      <h3>9.5 Paiement sécurisé</h3>
      <p>
        Les paiements peuvent être effectués par virement bancaire ou par
        paiement sécurisé en ligne via un prestataire de paiement. AHF ne
        conserve pas les données bancaires complètes du Client lorsque le
        paiement est réalisé via un prestataire externe sécurisé.
      </p>

      {/* 10 */}
      <h2>10. Remboursement du versement de réservation</h2>

      <h3>10.1 Remboursement avant signature du contrat</h3>
      <p>
        Le versement initial de <strong>5&nbsp;000&nbsp;€</strong> est
        intégralement remboursable à la demande du Client, sans frais ni
        justification, tant que le contrat de fabrication, livraison et
        installation n&apos;a pas été signé.
      </p>
      <p>
        La demande de remboursement doit être adressée par email à :
        contact@affinityhousefactory.com
      </p>
      <p>Le Client doit préciser :</p>
      <ul>
        <li>son nom ;</li>
        <li>ses coordonnées ;</li>
        <li>la référence de réservation ;</li>
        <li>le modèle ARKO concerné ;</li>
        <li>le moyen de paiement utilisé.</li>
      </ul>
      <p>
        Le remboursement intervient dans un délai raisonnable et, sauf
        difficulté technique ou bancaire, dans un délai cible de{" "}
        <strong>14 jours calendaires</strong> à compter de la confirmation de
        la demande.
      </p>

      <h3>10.2 Après signature du contrat</h3>
      <p>
        Après signature du contrat de fabrication, livraison et installation,
        le versement initial est imputé sur le prix total.
      </p>
      <p>
        Les conditions d&apos;annulation, de résiliation, de remboursement ou
        d&apos;indemnisation sont alors celles prévues au contrat, aux
        présentes CGV et aux règles légales applicables.
      </p>

      <h3>10.3 Conditions suspensives</h3>
      <p>
        Si le contrat prévoit des conditions suspensives et que l&apos;une
        d&apos;elles ne se réalise pas dans le délai prévu, les conséquences
        financières sont déterminées par le contrat.
      </p>
      <p>
        Sauf stipulation contraire conforme au droit applicable, les sommes
        versées au titre d&apos;une opération devenue impossible du fait de la
        non-réalisation d&apos;une condition suspensive sont restituées selon
        les modalités prévues au contrat.
      </p>

      {/* 11 */}
      <h2>11. Terrain, acquisition foncière et mandataires partenaires</h2>

      <h3>11.1 Terrain choisi par le Client</h3>
      <p>Le terrain destiné à recevoir la maison ARKO est choisi, réservé ou acquis par le Client.</p>
      <p>Le Client est seul responsable :</p>
      <ul>
        <li>de l&apos;identification du terrain ;</li>
        <li>de son acquisition éventuelle ;</li>
        <li>de la vérification de ses droits à construire ;</li>
        <li>de la vérification des servitudes ;</li>
        <li>de la conformité administrative du terrain ;</li>
        <li>de la transmission à AHF des informations nécessaires à l&apos;étude du projet.</li>
      </ul>

      <h3>11.2 Acquisition du terrain et acte notarié</h3>
      <p>
        L&apos;acquisition éventuelle du terrain relève exclusivement du
        Client et donne lieu, le cas échéant, à la signature d&apos;un acte
        notarié établi en bonne et due forme.
      </p>
      <p>
        AHF n&apos;intervient pas dans l&apos;opération d&apos;achat du
        terrain, ni dans les formalités juridiques, administratives ou
        notariales qui y sont attachées.
      </p>
      <p>
        AHF ne perçoit pas de prix de vente du terrain et n&apos;agit pas
        comme vendeur, agent immobilier, notaire ou intermédiaire foncier,
        sauf habilitation spécifique expressément prévue, ce qui n&apos;est
        pas l&apos;objet des présentes CGV.
      </p>

      <h3>11.3 Mandataires partenaires</h3>
      <p>
        Les mandataires ou partenaires susceptibles d&apos;accompagner le
        Client dans sa recherche de terrain interviennent sous leur seule
        responsabilité, dans le cadre de leur propre activité professionnelle.
      </p>
      <p>Leur intervention est distincte de celle d&apos;AHF.</p>
      <p>AHF ne saurait être tenue responsable :</p>
      <ul>
        <li>de la disponibilité réelle d&apos;un terrain ;</li>
        <li>de son prix ;</li>
        <li>de sa constructibilité définitive ;</li>
        <li>de la régularité de la vente ;</li>
        <li>des honoraires du mandataire ;</li>
        <li>des informations transmises par un tiers ;</li>
        <li>de l&apos;issue de la négociation foncière ;</li>
        <li>de la signature ou non de l&apos;acte notarié.</li>
      </ul>

      {/* 12 */}
      <h2>12. Urbanisme et autorisations administratives</h2>

      <h3>12.1 Responsabilité du Client</h3>
      <p>
        Sauf mission spécifique expressément confiée à AHF, le Client est
        responsable de l&apos;obtention des autorisations administratives
        nécessaires à l&apos;installation de la maison ARKO.
      </p>
      <p>
        Selon la surface, la localisation, l&apos;usage, le secteur
        d&apos;implantation et les règles d&apos;urbanisme applicables, le
        projet peut nécessiter notamment :
      </p>
      <ul>
        <li>une déclaration préalable ;</li>
        <li>un permis de construire ;</li>
        <li>une autorisation spécifique en secteur protégé ;</li>
        <li>un accord relatif à l&apos;assainissement ;</li>
        <li>une autorisation de voirie ;</li>
        <li>toute autre autorisation requise par la réglementation applicable.</li>
      </ul>

      <h3>12.2 Assistance éventuelle d&apos;AHF</h3>
      <p>
        AHF peut assister le Client dans l&apos;identification des démarches à
        prévoir ou dans la constitution de certains éléments techniques,
        uniquement si cette mission est prévue au devis ou au contrat.
      </p>
      <p>Cette assistance ne constitue pas une garantie d&apos;obtention de l&apos;autorisation administrative.</p>
      <p>
        AHF ne peut être tenue responsable du refus, du retrait, du recours ou
        du délai d&apos;instruction d&apos;une autorisation administrative,
        sauf faute directement imputable à une prestation expressément confiée
        à AHF.
      </p>

      <h3>12.3 Vérification de compatibilité</h3>
      <p>
        AHF peut vérifier la compatibilité technique apparente du terrain avec
        une maison ARKO sur la base des informations transmises par le Client.
      </p>
      <p>Cette vérification ne remplace pas :</p>
      <ul>
        <li>une étude d&apos;urbanisme complète ;</li>
        <li>une étude notariale ;</li>
        <li>une étude géotechnique ;</li>
        <li>une étude de structure ;</li>
        <li>une analyse de servitudes ;</li>
        <li>une vérification exhaustive des règles locales.</li>
      </ul>

      {/* 13 */}
      <h2>13. Prérequis techniques du terrain</h2>
      <p>Avant toute livraison et installation, le Client doit s&apos;assurer que le terrain est prêt à recevoir la maison ARKO.</p>
      <p>Les prérequis peuvent notamment comprendre :</p>
      <ul>
        <li>terrain accessible aux véhicules de livraison et engins de manutention ;</li>
        <li>portance suffisante des accès ;</li>
        <li>absence d&apos;obstacle empêchant la livraison ou l&apos;installation ;</li>
        <li>supports d&apos;accueil réalisés selon les prescriptions techniques ;</li>
        <li>supports réceptionnés par le Client ou son prestataire ;</li>
        <li>raccordements préparés ou en attente selon le périmètre prévu ;</li>
        <li>autorisations administratives obtenues et purgées si nécessaire ;</li>
        <li>conditions de sécurité réunies.</li>
      </ul>
      <p>
        AHF se réserve le droit de reporter la livraison ou l&apos;installation
        si les prérequis ne sont pas réunis, sans que ce report puisse lui
        être imputé.
      </p>
      <p>
        Les frais supplémentaires résultant d&apos;un terrain non prêt, non
        conforme, inaccessible ou insuffisamment préparé peuvent être facturés
        au Client.
      </p>

      {/* 14 */}
      <h2>14. Étude de sol, fondations et supports d&apos;accueil</h2>
      <p>Sauf mention contraire expresse, les études de sol, fondations et supports d&apos;accueil sont à la charge du Client.</p>
      <p>Le Client doit faire réaliser les études et travaux nécessaires par des professionnels qualifiés et assurés.</p>
      <p>
        AHF communique, lorsque cela est nécessaire, les charges, tolérances
        et spécifications techniques utiles à la conception des supports
        d&apos;accueil.
      </p>
      <p>Le Client doit transmettre à AHF les justificatifs demandés, notamment :</p>
      <ul>
        <li>étude géotechnique ;</li>
        <li>plans d&apos;exécution des supports ;</li>
        <li>attestation de conformité ou procès-verbal de réception des supports ;</li>
        <li>coordonnées et assurances des entreprises intervenantes ;</li>
        <li>photographies ou contrôles demandés par AHF.</li>
      </ul>
      <p>
        AHF peut refuser ou reporter l&apos;installation si les supports
        d&apos;accueil ne sont pas conformes aux prescriptions techniques ou
        si les justificatifs nécessaires ne sont pas fournis.
      </p>

      {/* 15 */}
      <h2>15. Fabrication en atelier</h2>
      <p>
        Les maisons ARKO sont fabriquées hors site, en atelier ou dans un
        environnement de production contrôlé, selon les plans, options et
        spécifications validés.
      </p>
      <p>AHF organise la fabrication selon son planning de production et informe le Client des étapes significatives.</p>
      <p>Le Client reconnaît que toute modification demandée après validation du contrat peut entraîner :</p>
      <ul>
        <li>un surcoût ;</li>
        <li>un délai supplémentaire ;</li>
        <li>une impossibilité technique ;</li>
        <li>la nécessité d&apos;un avenant.</li>
      </ul>
      <p>
        AHF se réserve le droit de remplacer un matériau, équipement ou
        composant par un équivalent de qualité comparable ou supérieure,
        notamment en cas d&apos;indisponibilité fournisseur, sous réserve de ne
        pas dégrader les caractéristiques essentielles de la maison ARKO.
      </p>

      {/* 16 */}
      <h2>16. Délais</h2>

      <h3>16.1 Délai de fabrication</h3>
      <p>
        Le délai de fabrication en atelier est estimé à{" "}
        <strong>12 semaines</strong> à compter de la levée des conditions
        prévues au contrat.
      </p>
      <p>Ce délai ne commence notamment à courir qu&apos;après :</p>
      <ul>
        <li>signature du contrat ;</li>
        <li>expiration ou purge du délai de rétractation applicable ;</li>
        <li>obtention des autorisations nécessaires ;</li>
        <li>confirmation du financement ;</li>
        <li>validation technique définitive ;</li>
        <li>paiement des factures exigibles ;</li>
        <li>validation des prérequis de fabrication ;</li>
        <li>transmission complète des pièces demandées.</li>
      </ul>

      <h3>16.2 Délai de livraison et d&apos;installation</h3>
      <p>La livraison et l&apos;installation sont planifiées après confirmation de la sortie d&apos;atelier et vérification des prérequis terrain.</p>
      <p>
        L&apos;installation sur site est généralement réalisée en une journée,
        sous réserve des conditions d&apos;accès, de météo, de préparation du
        terrain et des contraintes techniques propres au site.
      </p>

      <h3>16.3 Causes de report</h3>
      <p>Les délais peuvent être prorogés en cas de :</p>
      <ul>
        <li>retard dans l&apos;obtention d&apos;une autorisation administrative ;</li>
        <li>recours, retrait ou opposition administrative ;</li>
        <li>retard de financement ;</li>
        <li>retard de paiement ;</li>
        <li>modification demandée par le Client ;</li>
        <li>terrain non accessible ;</li>
        <li>supports d&apos;accueil non conformes ;</li>
        <li>intempéries ;</li>
        <li>impossibilité de transport ;</li>
        <li>retard fournisseur ;</li>
        <li>force majeure ;</li>
        <li>intervention d&apos;un tiers non coordonné par AHF ;</li>
        <li>toute cause extérieure empêchant raisonnablement l&apos;exécution dans les délais prévus.</li>
      </ul>

      {/* 17 */}
      <h2>17. Livraison, transport et installation</h2>
      <p>La livraison est organisée selon les conditions prévues au devis et au contrat.</p>
      <p>Le Client doit garantir l&apos;accès au terrain et communiquer à AHF toute information utile, notamment :</p>
      <ul>
        <li>largeur et état des voies d&apos;accès ;</li>
        <li>présence de lignes aériennes ;</li>
        <li>contraintes de stationnement ;</li>
        <li>pente ;</li>
        <li>portance ;</li>
        <li>arbres, clôtures, murs ou obstacles ;</li>
        <li>autorisations de voirie nécessaires ;</li>
        <li>disponibilité des zones de manœuvre ;</li>
        <li>contraintes de voisinage.</li>
      </ul>
      <p>
        Lorsque l&apos;installation nécessite un engin de levage, une
        autorisation de voirie, une interruption de circulation ou une
        prestation spécifique, ces éléments sont inclus uniquement s&apos;ils
        sont expressément prévus au devis ou au contrat.
      </p>
      <p>À défaut, ils sont à la charge du Client.</p>

      {/* 18 */}
      <h2>18. Réception</h2>
      <p>La réception intervient après installation de la maison ARKO sur site.</p>
      <p>Elle donne lieu à l&apos;établissement d&apos;un procès-verbal signé par le Client et AHF, avec ou sans réserves.</p>
      <p>
        En cas de réserves, celles-ci sont listées précisément dans le
        procès-verbal. Les délais et modalités de levée des réserves sont
        convenus entre les parties.
      </p>
      <p>La réception marque le point de départ des garanties légales applicables aux prestations réalisées.</p>
      <p>
        Si le Client refuse de signer le procès-verbal sans motif légitime ou
        ne se présente pas à la réception régulièrement organisée, AHF pourra
        constater la situation par tout moyen utile et appliquer les
        conséquences prévues au contrat.
      </p>

      {/* 19 */}
      <h2>19. Garanties légales applicables</h2>
      <p>
        Les garanties légales applicables dépendent de la nature des
        prestations réalisées, du périmètre contractuel et des règles
        d&apos;ordre public applicables.
      </p>
      <p>
        À compter de la réception, les prestations relevant de travaux de
        construction peuvent notamment être couvertes par les garanties
        suivantes.
      </p>

      <h3>19.1 Garantie de parfait achèvement</h3>
      <p>
        La garantie de parfait achèvement couvre, pendant un délai d&apos;un
        an à compter de la réception, les désordres signalés par le Client
        lors de la réception ou notifiés par écrit dans l&apos;année suivant
        celle-ci, lorsqu&apos;ils relèvent des prestations réalisées par AHF
        ou ses intervenants.
      </p>

      <h3>19.2 Garantie de bon fonctionnement</h3>
      <p>
        La garantie de bon fonctionnement couvre, pendant deux ans à compter
        de la réception, les éléments d&apos;équipement dissociables de
        l&apos;ouvrage, lorsqu&apos;ils relèvent du périmètre des prestations
        réalisées et des garanties applicables.
      </p>

      <h3>19.3 Garantie décennale</h3>
      <p>
        La garantie décennale couvre, pendant dix ans à compter de la
        réception, les dommages relevant des articles 1792 et suivants du
        Code civil, notamment ceux qui compromettent la solidité de
        l&apos;ouvrage ou le rendent impropre à sa destination.
      </p>
      <p>Cette garantie est attachée à l&apos;ouvrage et bénéficie aux propriétaires successifs pendant sa durée légale.</p>

      <h3>19.4 Limites</h3>
      <p>Les garanties ne couvrent pas les désordres résultant notamment :</p>
      <ul>
        <li>d&apos;une utilisation anormale ;</li>
        <li>d&apos;un défaut d&apos;entretien ;</li>
        <li>d&apos;une modification réalisée sans accord d&apos;AHF ;</li>
        <li>d&apos;une intervention d&apos;un tiers ;</li>
        <li>d&apos;un défaut affectant les travaux réalisés par le Client ou ses prestataires ;</li>
        <li>d&apos;un défaut du terrain ou des supports non imputable à AHF ;</li>
        <li>d&apos;un sinistre extérieur ;</li>
        <li>d&apos;une cause étrangère.</li>
      </ul>

      {/* 20 */}
      <h2>20. Assurances</h2>
      <p>
        AHF déclare être ou devoir être assurée pour les activités
        effectivement exercées et les prestations réalisées, conformément aux
        obligations légales applicables.
      </p>
      <p>
        Les attestations d&apos;assurance pertinentes sont remises au Client
        au plus tard à la signature du contrat ou avant le démarrage des
        prestations concernées, selon le cas.
      </p>
      <p>
        Le Client reconnaît avoir été informé de la nécessité de souscrire,
        lorsque la réglementation l&apos;exige, une assurance
        dommages-ouvrage avant l&apos;ouverture du chantier ou le démarrage des
        travaux concernés.
      </p>
      <p>
        AHF peut accompagner le Client dans l&apos;identification de cette
        obligation, mais ne se substitue pas au Client dans sa qualité de
        maître d&apos;ouvrage, sauf convention contraire expresse.
      </p>

      {/* 21 */}
      <h2>21. Après-vente et suivi technique</h2>
      <p>
        Après l&apos;installation de la maison ARKO, un interlocuteur dédié
        peut rester le référent du Client pour le suivi technique du projet.
      </p>
      <p>Il accompagne le Client pour les questions liées :</p>
      <ul>
        <li>à la maison livrée ;</li>
        <li>à son installation ;</li>
        <li>à ses équipements ;</li>
        <li>au traitement des réserves ;</li>
        <li>aux désordres signalés après réception.</li>
      </ul>
      <p>
        Les désordres relevant de la garantie de parfait achèvement et
        signalés dans l&apos;année suivant la réception sont traités dans ce
        cadre, sans frais pour le Client, sous réserve qu&apos;ils relèvent
        bien des prestations réalisées par AHF ou ses intervenants.
      </p>
      <p>
        Le suivi après-vente ne constitue pas une mission générale
        d&apos;urbanisme, d&apos;administration foncière, de gestion locative,
        de maintenance permanente ou de contrôle technique du terrain.
      </p>

      {/* 22 */}
      <h2>22. Responsabilité d&apos;AHF</h2>
      <p>
        AHF est responsable de la bonne exécution des prestations expressément
        mises à sa charge par le devis, le contrat et leurs annexes.
      </p>
      <p>AHF ne saurait être tenue responsable :</p>
      <ul>
        <li>de l&apos;acquisition du terrain ;</li>
        <li>des informations erronées ou incomplètes transmises par le Client ;</li>
        <li>du refus ou du délai d&apos;une autorisation administrative ;</li>
        <li>de la non-constructibilité du terrain ;</li>
        <li>des servitudes ou contraintes non communiquées ;</li>
        <li>des travaux réalisés par le Client ou par ses prestataires ;</li>
        <li>des fondations ou supports réalisés hors périmètre AHF ;</li>
        <li>des raccordements non inclus ;</li>
        <li>du défaut d&apos;accès au terrain ;</li>
        <li>des retards causés par le Client ou des tiers ;</li>
        <li>des modifications demandées après validation ;</li>
        <li>des événements de force majeure ;</li>
        <li>des dommages causés par une utilisation non conforme ou un défaut d&apos;entretien.</li>
      </ul>

      {/* 23 */}
      <h2>23. Responsabilité du Client</h2>
      <p>Le Client est responsable :</p>
      <ul>
        <li>de la sincérité et de l&apos;exactitude des informations communiquées ;</li>
        <li>du choix et de l&apos;acquisition éventuelle du terrain ;</li>
        <li>de l&apos;obtention des droits permettant l&apos;installation ;</li>
        <li>de l&apos;obtention des autorisations administratives ;</li>
        <li>de la réalisation des travaux préparatoires à sa charge ;</li>
        <li>de la souscription des assurances qui lui incombent ;</li>
        <li>de l&apos;accès au terrain ;</li>
        <li>du paiement des sommes dues ;</li>
        <li>du respect des conditions de sécurité et de préparation du site ;</li>
        <li>de la conservation et de l&apos;entretien normal de la maison après réception.</li>
      </ul>

      {/* 24 */}
      <h2>24. Modifications du projet</h2>
      <p>
        Toute modification demandée par le Client après acceptation du devis
        ou signature du contrat doit faire l&apos;objet d&apos;une validation
        écrite d&apos;AHF.
      </p>
      <p>
        Lorsque la modification affecte le prix, le délai, les
        caractéristiques techniques ou le périmètre des prestations, elle
        donne lieu à un avenant.
      </p>
      <p>
        AHF peut refuser une modification devenue techniquement impossible,
        incompatible avec la fabrication engagée, non conforme aux règles
        applicables ou disproportionnée.
      </p>

      {/* 25 */}
      <h2>25. Droit de rétractation</h2>
      <p>
        Lorsque le Client agit en qualité de consommateur, il bénéficie des
        droits de rétractation prévus par les dispositions légales
        applicables selon la nature du contrat, le mode de conclusion et le
        régime juridique applicable au projet.
      </p>
      <p>
        Lorsque le contrat est conclu à distance ou hors établissement, les
        règles du Code de la consommation peuvent prévoir un délai de
        rétractation.
      </p>
      <p>
        Lorsque le projet relève d&apos;un régime juridique spécifique
        applicable à la construction d&apos;une maison individuelle, les
        règles de rétractation propres à ce régime s&apos;appliquent.
      </p>
      <p>
        Les modalités précises de rétractation sont communiquées au Client
        dans le contrat et, le cas échéant, au moyen d&apos;un formulaire de
        rétractation.
      </p>
      <p>
        Aucun démarrage de fabrication ne peut intervenir avant
        l&apos;expiration ou la renonciation régulière au délai applicable
        lorsque la réglementation l&apos;exige.
      </p>

      {/* 26 */}
      <h2>26. Résiliation</h2>
      <p>Le contrat peut être résilié dans les conditions prévues aux conditions particulières, notamment en cas :</p>
      <ul>
        <li>de non-réalisation d&apos;une condition suspensive ;</li>
        <li>d&apos;impossibilité technique définitive ;</li>
        <li>de refus définitif d&apos;autorisation administrative ;</li>
        <li>de défaut de paiement ;</li>
        <li>de manquement grave d&apos;une partie ;</li>
        <li>de force majeure prolongée ;</li>
        <li>d&apos;accord écrit entre les parties.</li>
      </ul>
      <p>Les conséquences financières de la résiliation sont déterminées par le contrat, les présentes CGV et le droit applicable.</p>

      {/* 27 */}
      <h2>27. Force majeure</h2>
      <p>
        Aucune des parties ne pourra être tenue responsable d&apos;un retard
        ou d&apos;une inexécution résultant d&apos;un événement de force
        majeure au sens de l&apos;article 1218 du Code civil.
      </p>
      <p>
        Sont notamment susceptibles de constituer des événements de force
        majeure, selon les circonstances : catastrophe naturelle, événement
        climatique exceptionnel, incendie, inondation, grève externe, blocage
        de transport, décision administrative, pandémie, pénurie majeure,
        impossibilité d&apos;approvisionnement ou tout événement
        imprévisible, irrésistible et extérieur empêchant l&apos;exécution
        normale du contrat.
      </p>

      {/* 28 */}
      <h2>28. Propriété intellectuelle</h2>
      <p>
        Les marques, noms, logos, plans, modèles, visuels, configurations,
        notices, fiches techniques, designs et contenus relatifs à HOWNER, AHF
        et ARKO sont protégés par les droits de propriété intellectuelle.
      </p>
      <p>Toute reproduction, représentation, adaptation, diffusion ou exploitation non autorisée est interdite.</p>
      <p>
        Le Client s&apos;interdit de reproduire, faire reproduire ou exploiter
        les plans, modèles ou documents techniques transmis par AHF en dehors
        de son projet personnel, sauf accord écrit préalable.
      </p>

      {/* 29 */}
      <h2>29. Données personnelles</h2>
      <p>AHF traite les données personnelles du Client pour les besoins :</p>
      <ul>
        <li>de la qualification du projet ;</li>
        <li>de l&apos;édition du devis ;</li>
        <li>de la gestion de la réservation ;</li>
        <li>de la préparation du contrat ;</li>
        <li>de l&apos;exécution des prestations ;</li>
        <li>du suivi client ;</li>
        <li>de la facturation ;</li>
        <li>du service après-vente ;</li>
        <li>du respect des obligations légales.</li>
      </ul>
      <p>
        Les données traitées peuvent comprendre : identité, coordonnées,
        informations relatives au projet, informations relatives au terrain,
        documents techniques, documents administratifs, échanges commerciaux
        et contractuels.
      </p>
      <p>
        Le Client dispose des droits prévus par la réglementation applicable
        en matière de protection des données personnelles, notamment les
        droits d&apos;accès, de rectification, d&apos;opposition,
        d&apos;effacement, de limitation et de portabilité lorsque ceux-ci
        sont applicables.
      </p>
      <p>Pour exercer ses droits, le Client peut écrire à : contact@affinityhousefactory.com</p>
      <p>La politique de confidentialité applicable est disponible sur le site ou communiquée sur demande.</p>

      {/* 30 */}
      <h2>30. Réclamations</h2>
      <p>Toute réclamation doit être adressée prioritairement à AHF :</p>
      <ul>
        <li>par email : contact@affinityhousefactory.com</li>
        <li>ou par courrier : Affinity House Factory, 28 Chemin de Sabalce OEV, 64100 Bayonne, France</li>
      </ul>
      <p>La réclamation doit préciser :</p>
      <ul>
        <li>l&apos;identité du Client ;</li>
        <li>la référence du projet ;</li>
        <li>l&apos;objet de la réclamation ;</li>
        <li>les éléments justificatifs utiles ;</li>
        <li>les coordonnées de contact.</li>
      </ul>
      <p>AHF s&apos;efforce de répondre dans un délai raisonnable à compter de la réception d&apos;une réclamation complète.</p>

      {/* 31 */}
      <h2>31. Médiation de la consommation</h2>
      <p>
        Lorsque le Client agit en qualité de consommateur, il peut recourir
        gratuitement à un médiateur de la consommation en cas de litige non
        résolu amiablement avec AHF.
      </p>
      <p>
        Les coordonnées du médiateur compétent seront communiquées au Client
        et doivent être complétées avant publication des présentes CGV :
      </p>
      <ul>
        <li>Médiateur désigné : [à compléter]</li>
        <li>Adresse : [à compléter]</li>
        <li>Site internet : [à compléter]</li>
      </ul>
      <p>
        Le Client peut également consulter la plateforme européenne de
        règlement en ligne des litiges :{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
      </p>

      {/* 32 */}
      <h2>32. Droit applicable et juridiction compétente</h2>
      <p>Les présentes CGV sont soumises au droit français.</p>
      <p>En cas de litige, les parties recherchent prioritairement une solution amiable.</p>
      <p>
        À défaut d&apos;accord amiable, le litige est porté devant les
        juridictions compétentes conformément aux règles de droit commun et
        aux dispositions impératives applicables, notamment lorsque le Client
        agit en qualité de consommateur.
      </p>

      {/* 33 */}
      <h2>33. Hiérarchie contractuelle</h2>
      <p>
        En cas de contradiction entre plusieurs documents, l&apos;ordre de
        priorité suivant s&apos;applique, sauf stipulation contraire expresse :
      </p>
      <ol>
        <li>les conditions particulières du contrat signé ;</li>
        <li>le contrat de fabrication, livraison et installation ;</li>
        <li>le devis accepté ;</li>
        <li>la notice technique contractuelle ;</li>
        <li>les plans validés ;</li>
        <li>les fiches techniques annexées ;</li>
        <li>les présentes CGV ;</li>
        <li>les documents commerciaux ou supports de présentation.</li>
      </ol>
      <p>
        Les documents commerciaux, visuels, rendus, simulations et contenus du
        site ne prévalent jamais sur les documents contractuels signés.
      </p>

      {/* 34 */}
      <h2>34. Nullité partielle</h2>
      <p>Si une clause des présentes CGV est déclarée nulle, illégale ou réputée non écrite, les autres clauses demeurent applicables.</p>
      <p>
        La clause concernée est remplacée, dans la mesure du possible, par une
        clause valable reflétant l&apos;intention économique et juridique
        initiale des parties, dans le respect du droit applicable.
      </p>

      {/* 35 */}
      <h2>35. Évolution des CGV</h2>
      <p>AHF se réserve le droit de modifier les présentes CGV à tout moment.</p>
      <p>
        Les CGV applicables sont celles en vigueur à la date de la réservation
        ou de la signature du devis, sauf stipulation contraire ou obligation
        légale impérative.
      </p>
      <p>
        Les modifications postérieures ne s&apos;appliquent pas aux contrats
        déjà signés, sauf accord des parties ou nécessité de mise en
        conformité légale.
      </p>

      <p>
        <em>
          © 2026 HOWNER / Affinity House Factory — Maisons légères ARKO —
          Fabriquées hors site et installées sur terrain client. Visuels,
          rendus et simulations non contractuels, sauf mention contraire dans
          les documents signés.
        </em>
      </p>
    </LegalShell>
  );
}
