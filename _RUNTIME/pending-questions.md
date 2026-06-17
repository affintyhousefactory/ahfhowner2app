# PENDING QUESTIONS — Howner / ARKO

## Questions ouvertes

- **Grille Arko One ?** perM2, options, terrasse, dimensions/footprint, `reserved` — valeurs provisoires `TODO ARKO ONE` dans `site.ts` (base 59 900 € / 20 m² / 12 ex confirmés).
- **Asset vidéo Arko One ?** Absent du repo → fallback provisoire = footage Max (`placeholderMedia: true`). Fournir le fichier 20 m².
- **`reserved` par produit ?** Jauges One/Max actuellement One=0, Max=4 (placeholder).
- **Email de contact ?** Destinataire + service d'envoi pour `/contact` (Phase 4, lié ADR-014).
- **Validation Albert — repositionnement bi-produit + déverrouillage configurateur + retrait wordmark ARKO ?** ADR-022/020.
- ~~**Domaine de production ?**~~ **Tranché 2026-06-17 : `affinityhome.fr`** (constante `SITE_URL`, `src/lib/site.ts`).
- ⚠ **Alerte Albert — RGPD confidentialité ?** La politique de confidentialité publiée (doc mutualisée AHF) déclare GA4 (cookies `_ga`), un bandeau de consentement et Brevo (newsletter) — **non déployés sur ce site** (pas d'analytics/cookies/newsletter aujourd'hui ; backend Phase 4). Arbitrer avant mise en prod indexée : (a) déployer réellement ces traceurs + bandeau consentement, ou (b) adapter la politique au périmètre réel du site.
- **Fournisseur email transactionnel ?** Resend / Mailgun / SendGrid — bloque la confirmation Stripe (ADR-014).
- **Validation Albert — charte Affinity ?** ADR-002 contredit le verrou « Argile & Encre » du PASSATION.
- **Validation Albert — légal ?** Acompte vs arrhes + CGV (ADR-015) — bloque le lancement commercial.

## Règle
Une question tranchée → décision dans `_RUNTIME/recent-decisions.md`, puis ADR si durable.
