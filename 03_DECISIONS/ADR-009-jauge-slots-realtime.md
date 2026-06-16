# ADR-009 — Jauge & slots live via Supabase Realtime

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : 🟠 Moyenne (dépendance)
- **Alerte Albert** : Non

## Contexte
La jauge (`Gauge.tsx`) et la grille de slots (`Reservation.tsx`) affichent aujourd'hui des valeurs statiques (4/12, `BRAND.reserved`/`BRAND.total` dans `site.ts`). Commentaire en place : *« Phase 1 : valeurs statiques, branchées sur Supabase Realtime en Phase 4 »*.

## Décision
- Remplacer la lecture statique par `SELECT COUNT(*) FROM reservations WHERE status='reserved'`.
- S'abonner en **Realtime** à la table `reservations` → mise à jour live de la jauge et désactivation des slots pris (`taken`/`disabled` déjà gérés visuellement).

## Faisabilité
- **Verdict** : 🟠 Moyenne — simple côté code, mais dépend entièrement d'ADR-007 + Realtime activé sur le projet.
- **Dépendances externes** : Supabase Realtime (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Risques** : fuite de données si la lecture publique expose autre chose que le count.

## Conséquences
Dépend de ADR-007. Ne touche pas le pricing (ADR-005). Fallback : valeurs statiques actuelles si Realtime indispo.

## Sources
`PASSATION_RICHARD.md` §3, `src/components/ui/Gauge.tsx`, `src/components/site/Reservation.tsx`.
