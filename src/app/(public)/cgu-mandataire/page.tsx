import type { Metadata } from "next";
import { LegalShell } from "@/components/site/LegalShell";

export const metadata: Metadata = {
  title: "CGU Portail Mandataires | HOWNER",
  description:
    "Conditions générales d'utilisation du Portail Mandataires HOWNER — accès, zones d'intervention, exclusivité territoriale, leads et données personnelles.",
  alternates: { canonical: "/cgu-mandataire" },
  robots: { index: false, follow: true },
};

export default function CguMandatairePage() {
  return (
    <LegalShell
      eyebrow="Légal · Portail Mandataires"
      title="Conditions générales d'utilisation — Portail Mandataires HOWNER"
      pending={false}
    >
      <div className="not-prose mb-2 rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">
          Document en cours de validation juridique
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Version 1.0 — projet à faire valider par un conseil juridique avant
          mise en application définitive. Certaines informations (URL du
          Portail, hébergeur, date d'effet) restent à compléter. Ce document
          complète, sans le remplacer, le contrat-cadre de partenariat conclu
          entre AHF et le Mandataire.
        </p>
      </div>

      <h2>1. Informations légales</h2>
      <p>
        <strong>Éditeur du Portail :</strong> Affinity House Factory («
        AHF »), SAS, SIRET 982&nbsp;581&nbsp;506&nbsp;00010, siège social 28
        Chemin de Sabalce OEV, 64100 Bayonne, France. Email :{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
        . Représentée par Albert Puigbo, Directeur Général — Fondateur.
      </p>
      <p>
        <strong>Portail concerné :</strong> Portail Mandataires HOWNER — URL à
        compléter. <strong>Hébergeur :</strong> nom, raison sociale, adresse
        et coordonnées à compléter.
      </p>

      <h2>2. Définitions</h2>
      <ul>
        <li>
          <strong>AHF</strong> : Affinity House Factory, éditeur du Portail et
          commercialisateur des solutions d'habitat ARKO.
        </li>
        <li>
          <strong>HOWNER</strong> : marque et environnement numérique
          exploités par AHF pour faciliter les échanges avec ses partenaires
          professionnels.
        </li>
        <li>
          <strong>Portail</strong> : interface numérique professionnelle
          HOWNER accessible aux Mandataires autorisés.
        </li>
        <li>
          <strong>Mandataire</strong> : professionnel de l'immobilier, agent
          commercial, agent immobilier ou représentant d'un réseau
          immobilier, disposant des habilitations nécessaires et accepté sur
          le Portail.
        </li>
        <li>
          <strong>Utilisateur</strong> : toute personne physique utilisant le
          Portail au nom et pour le compte du Mandataire.
        </li>
        <li>
          <strong>Compte</strong> : espace personnel sécurisé donnant accès au
          Portail.
        </li>
        <li>
          <strong>Prospect</strong> : personne ayant demandé à être mise en
          relation avec un professionnel immobilier partenaire pour une
          recherche de terrain compatible avec un projet ARKO.
        </li>
        <li>
          <strong>Lead</strong> : informations de contact et éléments de
          besoin d'un Prospect transmis au Mandataire via le Portail.
        </li>
        <li>
          <strong>Terrain compatible</strong> : terrain présenté par le
          Mandataire comme correspondant aux critères de présélection du
          Cahier des Charges Technique ARKO, sous réserve des vérifications
          ultérieures.
        </li>
        <li>
          <strong>Zone d'intervention</strong> : périmètre géographique
          déclaré par le Mandataire dans son Compte.
        </li>
        <li>
          <strong>Exclusivité territoriale</strong> : priorité limitée,
          révocable et non automatique susceptible d'être accordée par AHF sur
          une zone définie.
        </li>
        <li>
          <strong>CCT ARKO</strong> : Cahier des Charges Technique ARKO,
          document de présélection transmis ou mis à disposition par AHF.
        </li>
      </ul>

      <h2>3. Objet et champ d'application</h2>
      <p>
        Les CGU définissent les règles d'accès et d'usage du Portail,
        notamment pour la création et la gestion du Compte Mandataire, la
        déclaration des zones d'intervention, la publication et mise à jour de
        Terrains compatibles, la réception et le suivi de Leads, la gestion
        d'une éventuelle Exclusivité territoriale, et la consultation des
        informations, documents et outils mis à disposition par AHF.
      </p>
      <p>
        L'accès au Portail vaut acceptation pleine et entière des présentes
        CGU par le Mandataire et par tout Utilisateur agissant pour son
        compte. Le Portail est exclusivement réservé à un usage professionnel
        ; il n'est pas destiné aux consommateurs.
      </p>
      <p>
        En cas de contradiction entre les présentes CGU et un contrat-cadre de
        partenariat signé entre AHF et le Mandataire, le contrat-cadre prévaut
        pour les engagements commerciaux, territoriaux, de confidentialité, de
        responsabilité ou de rémunération qu'il régit expressément.
      </p>

      <h2>4. Absence d'intermédiation immobilière par AHF</h2>
      <p>
        AHF ne détient pas la carte professionnelle permettant d'exercer les
        actes d'entremise immobilière et n'exécute pas, par l'intermédiaire du
        Portail, de mission de transaction immobilière. AHF ne signe aucun
        mandat de recherche ou de vente au nom du Mandataire, ne négocie pas
        le prix d'un terrain, ne reçoit ni ne conserve de fonds, honoraires ou
        indemnités liés à une transaction immobilière, et ne garantit pas la
        disponibilité, la constructibilité, la valeur, l'urbanisme, la
        viabilisation, la qualité du sol ou la compatibilité définitive d'un
        terrain. AHF ne se substitue ni au Mandataire, ni au notaire, ni à
        l'architecte, ni au bureau d'études, ni aux entreprises intervenant
        dans le projet.
      </p>
      <p>
        Toute relation immobilière, tout mandat, toute négociation, toute
        offre, tout compromis, toute promesse ou tout acte authentique
        relevant d'une opération immobilière sont conclus directement entre
        les parties concernées, sous la responsabilité exclusive du
        professionnel habilité.
      </p>

      <h2>5. Conditions d'éligibilité et validation du Compte</h2>
      <h3>5.1 Conditions d'accès</h3>
      <p>Le Portail est accessible aux professionnels remplissant cumulativement :</p>
      <ul>
        <li>exercer légalement une activité d'intermédiation immobilière ou agir sous l'habilitation d'un titulaire de carte professionnelle valable ;</li>
        <li>être inscrit, lorsque requis, au RSAC ou au registre professionnel applicable ;</li>
        <li>disposer d'une assurance responsabilité civile professionnelle valide ;</li>
        <li>avoir transmis à AHF les documents justificatifs demandés ;</li>
        <li>avoir accepté les présentes CGU et, lorsqu'il existe, le contrat-cadre partenaire.</li>
      </ul>
      <h3>5.2 Vérifications</h3>
      <p>
        AHF peut demander à tout moment tout document nécessaire à la
        vérification des informations déclarées (justificatif d'identité,
        SIRET, immatriculation RSAC, habilitation, attestation de
        rattachement à un réseau, assurance RC professionnelle, coordonnées
        bancaires professionnelles, éléments relatifs aux zones déclarées).
        AHF peut refuser, suspendre ou supprimer un Compte lorsqu'un document
        est absent, expiré, incohérent, manifestement erroné ou insuffisant.
      </p>
      <h3>5.3 Exactitude des informations</h3>
      <p>
        Le Mandataire garantit l'exactitude, la complétude et la mise à jour
        de l'ensemble des informations renseignées sur le Portail et s'engage
        à signaler sans délai toute modification susceptible d'affecter son
        activité, ses habilitations, son assurance, son réseau de
        rattachement, ses coordonnées ou ses zones d'intervention.
      </p>

      <h2>6. Création, sécurité et utilisation du Compte</h2>
      <p>
        La création d'un Compte implique la saisie d'informations
        professionnelles exactes et l'acceptation des CGU. L'activation
        effective du Compte peut être subordonnée à une validation manuelle
        par AHF.
      </p>
      <p>
        Les identifiants de connexion sont personnels, confidentiels et non
        cessibles. Le Mandataire est responsable de toute utilisation de son
        Compte, y compris par ses collaborateurs ou personnes autorisées, et
        s'engage à conserver ses identifiants de manière sécurisée, ne pas
        partager son mot de passe, limiter l'accès aux seules personnes
        autorisées et informer immédiatement AHF de tout accès non autorisé,
        perte, compromission ou suspicion de fraude.
      </p>
      <p>
        Lorsque le Portail permet l'ajout de collaborateurs, le Mandataire
        demeure responsable des actions réalisées par les Utilisateurs
        rattachés et doit retirer sans délai les accès devenus inutiles.
      </p>

      <h2>7. Services disponibles sur le Portail</h2>
      <p>Sous réserve des fonctionnalités effectivement mises à disposition, le Portail peut permettre au Mandataire de :</p>
      <ul>
        <li>compléter son profil professionnel ;</li>
        <li>déclarer ou modifier ses zones d'intervention ;</li>
        <li>demander une éventuelle Exclusivité territoriale ;</li>
        <li>publier, modifier, archiver ou retirer des Terrains compatibles ;</li>
        <li>consulter le CCT ARKO et les documents techniques mis à disposition ;</li>
        <li>recevoir des Leads et signaler leur prise en charge ;</li>
        <li>déclarer l'avancement d'un dossier ;</li>
        <li>échanger avec les équipes AHF via les canaux proposés ;</li>
        <li>consulter des indicateurs de qualité, d'activité et de conformité.</li>
      </ul>
      <p>
        AHF peut faire évoluer, ajouter, suspendre ou retirer tout ou partie
        des fonctionnalités du Portail, notamment pour des raisons de
        maintenance, de sécurité, de conformité, de qualité de service ou
        d'évolution de l'offre HOWNER.
      </p>

      <h2>8. Zones d'intervention et Exclusivité territoriale</h2>
      <h3>8.1 Déclaration des zones</h3>
      <p>
        Le Mandataire déclare ses zones d'intervention sous sa
        responsabilité et garantit être en capacité de traiter les Leads et
        de suivre les dossiers qui lui sont adressés dans ces zones. La
        déclaration d'une zone ne crée aucun droit automatique à
        l'Exclusivité territoriale, à un volume minimal de Leads, à une
        priorité commerciale ou à une représentation exclusive de la marque
        ARKO.
      </p>
      <h3>8.2 Conditions d'une Exclusivité territoriale</h3>
      <p>Une Exclusivité territoriale ne peut résulter que :</p>
      <ol className="list-decimal pl-5">
        <li>d'un écrit exprès d'AHF (avenant, annexe territoriale ou validation écrite d'un représentant habilité) ; et</li>
        <li>du respect continu par le Mandataire de ses obligations contractuelles et des présentes CGU.</li>
      </ol>
      <p>
        L'Exclusivité territoriale, lorsqu'elle est accordée, est
        personnelle, limitée à la zone et à la durée indiquées dans l'écrit
        applicable, non cessible et révocable dans les conditions ci-dessous.
      </p>
      <h3>8.3 Contrepartie de l'Exclusivité : référencement de terrains</h3>
      <p>Sauf conditions plus exigeantes prévues dans le contrat-cadre ou l'annexe territoriale, le Mandataire bénéficiant d'une Exclusivité territoriale s'engage à :</p>
      <ul>
        <li>publier sur le Portail au minimum <strong>dix (10) Terrains compatibles</strong> dans les <strong>quatre-vingt-dix (90) jours</strong> suivant l'attribution de l'Exclusivité ;</li>
        <li>maintenir, après cette période, un portefeuille minimal de <strong>huit (8) Terrains compatibles actifs</strong>, à jour et réellement commercialisables ;</li>
        <li>actualiser chaque annonce lorsqu'un terrain est vendu, retiré, devenu indisponible ou ne répond plus aux critères déclarés ;</li>
        <li>transmettre les éléments permettant à AHF de vérifier la cohérence de la présélection avec le CCT ARKO.</li>
      </ul>
      <p>
        Un terrain ne peut être comptabilisé qu'une seule fois. Les doublons,
        biens indisponibles, annonces fictives, informations manifestement
        inexactes, terrains incompatibles ou annonces publiées sans droit de
        diffusion ne sont pas pris en compte.
      </p>
      <h3>8.4 Retrait ou suspension de l'Exclusivité</h3>
      <p>AHF peut suspendre ou retirer l'Exclusivité territoriale, sans indemnité, après notification écrite au Mandataire, notamment en cas :</p>
      <ul>
        <li>de non-publication des dix (10) Terrains compatibles dans le délai prévu ;</li>
        <li>de maintien d'un nombre inférieur à huit (8) Terrains compatibles actifs pendant plus de trente (30) jours calendaires, hors force majeure dûment justifiée ;</li>
        <li>de données inexactes, incomplètes, obsolètes, trompeuses ou non vérifiables ;</li>
        <li>de défaut répété de mise à jour des annonces ;</li>
        <li>de délai de prise en charge des Leads insuffisant ou de non-réponse répétée ;</li>
        <li>de perte, suspension ou expiration d'une habilitation, d'une assurance ou d'un rattachement réseau requis ;</li>
        <li>de manquement aux CGU, au contrat-cadre, au CCT ARKO, aux règles de confidentialité ou de protection des données ;</li>
        <li>de litiges, plaintes, comportements inappropriés ou atteintes à l'image d'AHF ou d'HOWNER ;</li>
        <li>de toute circonstance rendant nécessaire la continuité de service, la protection des Prospects ou la préservation de la qualité du réseau.</li>
      </ul>
      <p>
        Sauf urgence, fraude, risque pour les personnes, risque juridique ou
        manquement grave, AHF adressera au Mandataire une mise en demeure de
        régulariser dans un délai de quinze (15) jours calendaires avant le
        retrait effectif de l'Exclusivité.
      </p>
      <p>
        Le retrait de l'Exclusivité n'emporte pas automatiquement résiliation
        du contrat-cadre ou suppression du Compte. AHF pourra toutefois
        référencer d'autres Mandataires dans la zone concernée et redistribuer
        les Leads selon ses critères internes de disponibilité, de qualité et
        de pertinence.
      </p>

      <h2>9. Publication de Terrains compatibles</h2>
      <h3>9.1 Obligations du Mandataire</h3>
      <p>Pour chaque terrain publié, le Mandataire s'engage à fournir des informations sincères, exactes, actualisées et suffisamment documentées, notamment :</p>
      <ul>
        <li>localisation ou périmètre de localisation compatible avec les règles de confidentialité applicables ;</li>
        <li>prix affiché et, le cas échéant, honoraires et conditions d'acquisition ;</li>
        <li>superficie, zonage connu et informations utiles à la présélection ;</li>
        <li>accès, réseaux, assainissement, pente et contraintes apparentes ;</li>
        <li>statut commercial du bien et disponibilité ;</li>
        <li>identité du professionnel responsable de l'annonce ;</li>
        <li>éléments justifiant son droit de publier ou de présenter le bien.</li>
      </ul>
      <p>
        Le Mandataire garantit qu'il dispose des autorisations, mandats,
        droits de diffusion et informations nécessaires à la publication du
        terrain.
      </p>
      <h3>9.2 Nature indicative de la compatibilité</h3>
      <p>
        La mention « compatible ARKO », « présélection ARKO » ou toute formule
        équivalente signifie uniquement que le terrain semble répondre aux
        critères de premier niveau du CCT ARKO sur la base des informations
        disponibles. Elle ne vaut pas validation urbanistique, certificat
        d'urbanisme opérationnel, étude géotechnique G2, validation des
        fondations, confirmation de raccordement eau/électricité/
        assainissement, confirmation de l'accessibilité grue, validation des
        contraintes environnementales, patrimoniales ou de voisinage, ni
        engagement de faisabilité, de coût ou de délai par AHF.
      </p>
      <h3>9.3 Retrait d'une annonce</h3>
      <p>
        AHF peut masquer, suspendre, corriger ou retirer toute annonce qui ne
        respecte pas les présentes CGU, le CCT ARKO, les règles
        professionnelles, les droits de tiers ou la réglementation
        applicable, et peut demander des justificatifs complémentaires avant
        publication ou maintien d'une annonce.
      </p>

      <h2>10. Leads transmis par AHF</h2>
      <h3>10.1 Nature des Leads</h3>
      <p>
        Les Leads sont transmis au Mandataire à titre de mise en relation
        professionnelle. Leur transmission ne constitue ni un mandat
        immobilier, ni une promesse de rémunération, ni une garantie de
        conversion, ni une garantie de conclusion d'une transaction. AHF ne
        garantit ni le volume, ni la qualité, ni la disponibilité, ni le
        budget, ni la solvabilité, ni l'intention d'achat des Prospects
        transmis.
      </p>
      <h3>10.2 Prise en charge</h3>
      <p>Le Mandataire s'engage à :</p>
      <ul>
        <li>accuser réception du Lead via le Portail ou par le canal défini par AHF dans un délai maximal de <strong>quarante-huit (48) heures ouvrées</strong>, sauf délai différent prévu contractuellement ;</li>
        <li>prendre contact avec le Prospect de manière professionnelle, loyale et conforme aux règles applicables ;</li>
        <li>expliquer clairement son statut, son réseau de rattachement, son habilitation et les conditions de sa mission ;</li>
        <li>conclure directement avec le Prospect tout mandat ou document requis avant d'accomplir des actes d'entremise immobilière ;</li>
        <li>renseigner les étapes de suivi demandées sur le Portail ;</li>
        <li>ne pas solliciter le Prospect pour des finalités étrangères au projet immobilier concerné sans base légale et information appropriée.</li>
      </ul>
      <h3>10.3 Refus ou réaffectation</h3>
      <p>
        Le Mandataire peut refuser un Lead lorsqu'il n'est pas en mesure de le
        traiter et doit alors le signaler sans délai dans le Portail. AHF peut
        réaffecter un Lead, sans indemnité, notamment en cas de non-prise en
        charge, d'absence de réponse, de conflit d'intérêts, d'indisponibilité
        déclarée, de demande du Prospect, de non-respect des délais ou de
        manquement aux présentes CGU.
      </p>
      <h3>10.4 Absence de commission AHF</h3>
      <p>
        Sauf stipulation expresse d'un contrat distinct signé entre les
        Parties, AHF ne perçoit aucune commission immobilière, honoraires de
        négociation, rémunération de mandat ou indemnité liée à la vente d'un
        terrain. Le Mandataire organise librement sa relation commerciale avec
        le Prospect dans le respect de la réglementation applicable.
      </p>

      <h2>11. Obligations générales du Mandataire</h2>
      <p>Le Mandataire s'engage à utiliser le Portail de manière loyale, professionnelle et conforme aux présentes CGU. Il s'interdit notamment de :</p>
      <ul>
        <li>fournir des informations, documents ou annonces faux, incomplets, trompeurs ou périmés ;</li>
        <li>publier un terrain sans mandat, autorisation, droit de diffusion ou vérification minimale suffisante ;</li>
        <li>contourner le Portail pour utiliser les données ou Leads communiqués par AHF à des fins non autorisées ;</li>
        <li>céder, louer, vendre, partager ou revendre les Leads, données ou accès reçus ;</li>
        <li>utiliser les données des Prospects pour une prospection sans rapport avec le besoin exprimé ou sans base légale appropriée ;</li>
        <li>faire croire qu'il représente juridiquement AHF ou qu'il dispose d'un pouvoir d'engagement au nom d'AHF ;</li>
        <li>utiliser les marques, logos, documents ou contenus AHF/HOWNER hors des autorisations accordées ;</li>
        <li>porter atteinte aux droits de tiers, à la réputation d'AHF, à la sécurité du Portail ou à son bon fonctionnement ;</li>
        <li>accéder aux comptes, données, interfaces ou zones réservées à d'autres utilisateurs sans autorisation ;</li>
        <li>introduire un virus, robot, script automatisé ou tout dispositif susceptible de perturber ou de contourner les mesures de sécurité du Portail ;</li>
        <li>adopter tout comportement injurieux, discriminatoire, harcelant, menaçant, violent ou contraire à la dignité des personnes dans les échanges avec AHF, les Prospects, les autres partenaires ou les tiers.</li>
      </ul>

      <h2>12. Contrôles, modération et sanctions</h2>
      <p>
        AHF peut réaliser des contrôles raisonnables sur les profils,
        documents, annonces, délais de réponse, données de suivi et usages du
        Portail. En cas de manquement, AHF peut, selon la gravité des faits et
        sans préjudice de tout autre droit : demander une correction ou des
        justificatifs ; masquer ou retirer une annonce ; limiter certaines
        fonctionnalités ; suspendre la réception de Leads ; suspendre ou
        retirer une Exclusivité territoriale ; suspendre temporairement le
        Compte ; fermer définitivement le Compte ; résilier le contrat-cadre
        applicable, dans les conditions prévues par celui-ci ; engager toute
        action nécessaire pour préserver ses droits, ceux des Prospects ou
        ceux des tiers.
      </p>
      <p>
        Sauf urgence, fraude, risque de sécurité, manquement grave ou
        obligation légale, AHF informera le Mandataire des motifs de la
        mesure et lui permettra, dans un délai raisonnable, de présenter ses
        observations ou de régulariser la situation.
      </p>

      <h2>13. Disponibilité, maintenance et assistance</h2>
      <p>
        AHF met en œuvre des moyens raisonnables pour assurer le
        fonctionnement du Portail, sans garantir une disponibilité permanente
        ni l'absence d'erreur, d'interruption ou de perte de données. AHF peut
        interrompre, limiter ou modifier l'accès au Portail pour des
        opérations de maintenance, de mise à jour, de sécurité, de
        sauvegarde, de correction, d'évolution réglementaire ou de gestion
        d'incident.
      </p>
      <p>
        Le Mandataire est responsable de son équipement, de sa connexion
        internet, de la compatibilité de son navigateur et de la sauvegarde de
        ses propres informations, dans la limite des fonctionnalités
        proposées.
      </p>
      <p>
        Pour toute demande d'assistance :{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
        .
      </p>

      <h2>14. Propriété intellectuelle et droits d'usage</h2>
      <p>
        Le Portail, ses logiciels, bases de données, contenus, textes, logos,
        visuels, maquettes, marques, noms de domaine, éléments graphiques,
        documents techniques et fonctionnalités sont protégés par les droits
        de propriété intellectuelle et appartiennent à AHF ou à ses
        concédants.
      </p>
      <p>
        Le Mandataire bénéficie d'un droit d'accès personnel, non exclusif,
        non cessible et révocable, strictement limité à l'utilisation
        professionnelle du Portail conformément aux présentes CGU. Toute
        reproduction, extraction, réutilisation, adaptation, diffusion,
        commercialisation, désassemblage, ingénierie inverse ou exploitation
        non autorisée est interdite.
      </p>
      <p>
        Les contenus publiés par le Mandataire restent sa propriété ou celle
        de leurs titulaires. Le Mandataire accorde toutefois à AHF, pour la
        durée d'utilisation du Portail et les besoins de son fonctionnement,
        une licence non exclusive, gratuite, mondiale et limitée aux finalités
        suivantes : hébergement, affichage, indexation, adaptation technique,
        modération, diffusion au sein du Portail et présentation aux
        Prospects concernés.
      </p>

      <h2>15. Confidentialité</h2>
      <p>
        Le Mandataire s'engage à conserver confidentiels les informations,
        données, documents, CCT ARKO, conditions commerciales, Leads,
        échanges, outils et éléments non publics reçus dans le cadre du
        Portail ou de sa relation avec AHF. Il s'interdit de les divulguer,
        reproduire ou utiliser à d'autres fins que l'exécution de ses
        obligations professionnelles et contractuelles, sauf accord écrit
        préalable d'AHF ou obligation légale.
      </p>
      <p>
        Cette obligation s'applique pendant toute la durée de la relation et
        pendant cinq (5) ans après sa cessation, sauf durée supérieure imposée
        par un contrat distinct ou par la loi.
      </p>

      <h2>16. Données à caractère personnel</h2>
      <p>
        Pour les données liées à la gestion du Compte, des zones, des
        annonces, de la conformité et du réseau partenaire, AHF agit en
        qualité de responsable de traitement. Pour les données de Leads
        reçues et les traitements réalisés pour exécuter sa mission
        immobilière, le Mandataire agit, sauf cas particulier clairement
        documenté, en qualité de responsable de traitement distinct. Il lui
        appartient de fournir au Prospect les informations requises sur ses
        propres traitements de données et de respecter la réglementation
        applicable.
      </p>
      <p>
        AHF peut transmettre au Mandataire les données strictement nécessaires
        à la mise en relation et à l'étude du besoin immobilier du Prospect,
        selon les modalités décrites dans la politique de confidentialité
        d'AHF et sur la base juridique applicable. Le Mandataire s'interdit
        d'utiliser les données reçues pour une finalité étrangère au besoin
        exprimé par le Prospect, au-delà de la durée nécessaire à la gestion
        de la relation et au respect de ses obligations légales, ou pour une
        prospection électronique ou un partage avec des tiers sans
        information et base légale appropriées.
      </p>
      <p>
        Le Mandataire met en œuvre les mesures de sécurité adaptées à la
        sensibilité des données traitées. Il informe AHF sans délai, et au
        plus tard dans les quarante-huit (48) heures suivant sa découverte, de
        toute violation de données ou incident de sécurité susceptible
        d'affecter les données transmises via le Portail.
      </p>
      <p>
        Les modalités détaillées de traitement des données personnelles et
        l'exercice des droits figurent dans la{" "}
        <a href="/confidentialite">Politique de confidentialité HOWNER / AHF</a>.
      </p>

      <h2>17. Cookies et traceurs</h2>
      <p>
        Le Portail peut utiliser des cookies et autres traceurs nécessaires à
        son fonctionnement, à la sécurité, à la mesure d'audience ou à
        l'amélioration de l'expérience utilisateur. Les informations
        relatives aux cookies figurent dans la{" "}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>18. Liens hypertextes et services tiers</h2>
      <p>
        Le Portail peut contenir des liens vers des sites, outils ou services
        exploités par des tiers. AHF ne contrôle pas leur contenu, leur
        disponibilité, leurs pratiques de confidentialité ni leurs conditions
        contractuelles. Le Mandataire est invité à consulter les conditions
        applicables à ces services tiers avant toute utilisation.
      </p>
      <p>
        Toute création d'un lien vers le Portail doit être autorisée au
        préalable par écrit par AHF. AHF peut demander le retrait de tout lien
        vers le Portail à tout moment.
      </p>

      <h2>19. Responsabilité</h2>
      <p>Le Mandataire est seul responsable de son habilitation professionnelle, de ses assurances et de ses obligations réglementaires, de ses mandats, conseils, négociations, annonces, prix, informations et documents, de ses relations avec les Prospects, vendeurs, agences, notaires et tiers, de la conformité de ses actions à la réglementation applicable, de l'usage des Leads et des données reçues, et des dommages causés à AHF, aux Prospects ou à des tiers du fait de ses manquements.</p>
      <p>
        AHF ne peut être tenue responsable de l'absence de Leads ou du volume
        de Leads transmis, de l'aboutissement d'une recherche, d'une
        négociation ou d'une transaction immobilière, de la disponibilité ou
        de la compatibilité définitive d'un terrain, du comportement, des
        conseils, des actes, des omissions ou des engagements du Mandataire,
        ni des interruptions, erreurs ou indisponibilités du Portail
        imputables à un tiers, à une maintenance, à une force majeure, au
        réseau internet ou au matériel du Mandataire.
      </p>
      <p>
        Dans toute la mesure permise par la loi, la responsabilité d'AHF est
        limitée aux dommages directs, certains et prévisibles résultant d'une
        faute démontrée. Elle ne couvre pas les pertes de chance, pertes de
        chiffre d'affaires, pertes de données, préjudices commerciaux,
        préjudices d'image ou dommages indirects.
      </p>

      <h2>20. Preuve électronique</h2>
      <p>
        Les enregistrements informatiques, journaux de connexion,
        horodatages, validations électroniques, messages, courriels et
        données conservés dans les systèmes d'AHF constituent des éléments de
        preuve recevables entre les Parties, sauf preuve contraire.
        L'acceptation des CGU par voie électronique a la même valeur probante
        qu'une acceptation manuscrite, dans les limites prévues par la
        réglementation applicable.
      </p>

      <h2>21. Évolution des CGU</h2>
      <p>
        AHF peut modifier les présentes CGU pour tenir compte d'une évolution
        du Portail, de ses services, de la réglementation, de la sécurité, de
        l'organisation du réseau partenaire ou de ses pratiques internes. La
        version mise à jour sera publiée sur le Portail avec sa date de mise
        en application. En cas de modification substantielle, AHF pourra
        informer le Mandataire par tout moyen approprié. La poursuite de
        l'utilisation du Portail après l'entrée en vigueur des nouvelles CGU
        vaut acceptation de celles-ci.
      </p>

      <h2>22. Durée, suspension et fermeture du Compte</h2>
      <p>
        Les CGU s'appliquent dès leur acceptation et pendant toute la durée
        d'utilisation du Portail. Le Mandataire peut demander la fermeture de
        son Compte en écrivant à{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
        , sous réserve des obligations contractuelles, légales ou de
        conservation des données qui demeurent applicables. AHF peut
        suspendre ou fermer un Compte dans les conditions de l'article 12,
        sans que cette mesure ouvre droit à une indemnité. La fermeture du
        Compte n'emporte pas renonciation aux droits et obligations nés
        antérieurement, notamment en matière de confidentialité,
        responsabilité, propriété intellectuelle et protection des données.
      </p>

      <h2>23. Force majeure</h2>
      <p>
        Aucune Partie ne sera tenue responsable d'un manquement résultant d'un
        événement de force majeure au sens de l'article 1218 du Code civil,
        sous réserve d'en informer l'autre Partie dans les meilleurs délais et
        de prendre les mesures raisonnables pour en limiter les effets.
      </p>

      <h2>24. Nullité partielle et non-renonciation</h2>
      <p>
        Si une stipulation des CGU est déclarée nulle, illégale ou
        inapplicable, les autres stipulations demeurent pleinement
        applicables. Le fait pour AHF de ne pas se prévaloir, à un moment
        donné, d'une stipulation des CGU ne vaut pas renonciation à s'en
        prévaloir ultérieurement.
      </p>

      <h2>25. Droit applicable et règlement des différends</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Les Parties
        s'efforceront de résoudre amiablement tout différend relatif à leur
        interprétation, leur validité ou leur exécution. À défaut d'accord
        dans un délai de trente (30) jours à compter de la notification écrite
        du différend, compétence est attribuée aux juridictions matériellement
        compétentes du ressort de Bayonne, sous réserve des règles impératives
        applicables.
      </p>

      <h2>26. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU, au Portail ou au
        Compte Mandataire : <strong>Affinity House Factory — HOWNER</strong>,
        28 Chemin de Sabalce OEV, 64100 Bayonne, France — Email :{" "}
        <a href="mailto:contact@affinityhousefactory.com">
          contact@affinityhousefactory.com
        </a>
        .
      </p>

      <h2>Annexe A — Rappel synthétique du Cahier des Charges Technique ARKO</h2>
      <p>
        Les critères ci-dessous sont des critères de présélection. Ils ne
        remplacent pas les études, diagnostics, autorisations, validations
        techniques ou vérifications juridiques nécessaires au projet.
      </p>
      <table>
        <thead>
          <tr>
            <th>Critère</th>
            <th>Indication de présélection</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Zonage PLU</td><td>Zone U ou AU constructible, sous réserve des règles locales applicables</td></tr>
          <tr><td>Autorisation d&apos;urbanisme</td><td>Déclaration préalable ou permis de construire envisageable selon le modèle, le PLU et le projet</td></tr>
          <tr><td>Accès voirie</td><td>Largeur indicative d&apos;au moins 3,5 m pour le passage d&apos;un camion-grue, à confirmer sur site</td></tr>
          <tr><td>Pente</td><td>Préférentiellement égale ou inférieure à 10 %, à confirmer par les études nécessaires</td></tr>
          <tr><td>Réseaux</td><td>Eau et électricité à proximité ou raccordement techniquement envisageable</td></tr>
          <tr><td>Assainissement</td><td>Réseau collectif disponible ou assainissement non collectif envisageable après avis compétent</td></tr>
          <tr><td>Zones exclues ou contraintes</td><td>Vigilance renforcée : PPRI, Natura 2000, ABF, servitudes, risques naturels, contraintes locales</td></tr>
          <tr><td>Orientation</td><td>Sud ou sud-ouest préférable selon le projet</td></tr>
          <tr><td>Nature du sol</td><td>Absence apparente de roche affleurante, ancienne décharge ou remblais non contrôlés ; étude géotechnique à prévoir selon le projet</td></tr>
          <tr><td>Certificat d&apos;urbanisme</td><td>Aucun élément connu laissant présumer une impossibilité manifeste ; vérification recommandée</td></tr>
          <tr><td>Surface utile</td><td>Indicativement : au moins 200 m² pour Arko One et 300 m² pour Arko Max, sous réserve du PLU, des retraits, des accès et du projet</td></tr>
        </tbody>
      </table>
    </LegalShell>
  );
}
