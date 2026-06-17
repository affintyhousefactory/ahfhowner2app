# INDEX — Howner / ARKO

## Démarrage Claude (ordre de lecture)
1. `_RUNTIME/CURRENT_SESSION.md`
2. `_RUNTIME/active-context.md`
3. `00_INDEX/PROJECT_STATE.md` — **état canonique**
4. `00_INDEX/INDEX.md` (ce fichier) → HUB du domaine concerné
5. `DESIGN.md`, puis l'ADR concernée dans `03_DECISIONS/`

## HUBS (par domaine)
- [[HUB_GOUVERNANCE]] — ADR, marque, secrets, alertes Albert
- [[HUB_PRODUCT]] — Arko One / Arko Max, pricing 3 couches, réservation
- [[HUB_FRONTEND]] — multi-pages, nav Tesla, charte, perf/média, SEO
- [[HUB_BACKEND]] — Phase 4 : Supabase, Stripe, terrain, leads
- [[HUB_RELEASE]] — Vercel, QA, gates (perf/légal)

## Mémoire active (`_RUNTIME/`, courte, jetable)
- `CURRENT_SESSION.md` · `active-context.md` · `recent-decisions.md` · `pending-questions.md`

## Mémoire décisionnelle (`03_DECISIONS/`, durable)
- `ADR_TEMPLATE.md` + `ADR-001 … ADR-022`

## Règles (ADR-019)
Une seule vérité d'état = `00_INDEX/PROJECT_STATE.md`. `_RUNTIME` ≠ backlog. Ne pas mélanger les projets. Toute décision durable → ADR.
