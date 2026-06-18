# ADR-024 — Bandeau consentement cookies + Cloudflare Turnstile

- **Statut** : Accepté
- **Date** : 2026-06-18
- **Phase** : 1.5
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

La politique de confidentialité (`/confidentialite`) déclarait GA4, Brevo et un bandeau de consentement non déployés. Alerte RGPD ouverte depuis la livraison SEO P1 (2026-06-17). Les formulaires (contact, réservation, terrain) ne sont pas protégés contre le spam/bots.

## Décision

### Consentement cookies
- Bandeau de consentement `CookieBanner` (bas d'écran, non-intrusif, charte Affinity).
- GA4 chargé **uniquement après acceptation** (`ahf-consent = "granted"` en localStorage).
- Cloudflare Turnstile : base légale **intérêt légitime** (sécurité) → pas de consentement requis.
- Préférence persistée en `localStorage` clé `ahf-consent` (`"granted"` | `"denied"`).

### Analytics
- **Google Analytics 4** via `@next/third-parties/google` (`GoogleAnalytics`).
- Chargement conditionnel dans `Analytics.tsx` (client component).
- Variable d'env : `NEXT_PUBLIC_GA_MEASUREMENT_ID` (ex : `G-XXXXXXXXXX`).

### Protection formulaires
- **Cloudflare Turnstile** (widget invisible `managed`) via `@marsidev/react-turnstile`.
- Widget ajouté dans `ContactForm.tsx`.
- Vérification serveur via route API `POST /api/verify-turnstile`.
- Variables : `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client) + `TURNSTILE_SECRET_KEY` (serveur, jamais commité).
- Clés de test Cloudflare en dev (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`).

## Faisabilité

- **Verdict** : ✅ — Aucune dépendance externe bloquante. GA4 conditionnel = RGPD-safe.
- **Dépendances** : compte Google Analytics (Measurement ID), compte Cloudflare (site key + secret key).
- **Risques** : Turnstile peut être bloqué par certains navigateurs/adblock → dégradation gracieuse (formulaire toujours soumis sans token si l'API échoue).

## Conséquences

- Ferme l'alerte RGPD sur `/confidentialite` (bandeau déployé, GA4 réel).
- `TURNSTILE_SECRET_KEY` → Vercel > Settings > Env > Production (jamais dans Git — ADR-003).
- Phase 4 : Turnstile token transmis avec le payload Supabase/Stripe pour double-validation serveur.
- Compatibilité Supabase Auth : Turnstile est supporté nativement par Supabase Auth (Phase 4).

## Sources

- `src/components/site/CookieBanner.tsx`
- `src/components/site/Analytics.tsx`
- `src/app/api/verify-turnstile/route.ts`
- `src/components/site/ContactForm.tsx`
- `ADR-003` — secrets & env
- `ADR-014` — service email (Phase 4)
- `ADR-015` — légal
