# TrustedtrAiner

Production Next.js build of the TrustedtrAiner landing site, ported from the approved proof of concept
(`docs/poc/finaleee.html`) as specified in `docs/TrustedtrAiner — Developer Documentation.pdf`.
This repo covers the **site-only scope**; back-office (★) items come later.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Radix UI · React Hook Form + Zod · Prisma 7 + PostgreSQL · Nodemailer (Google SMTP) + React Email ·
Cloudflare Turnstile · Vitest + Testing Library · Playwright.

Deviations from the spec, agreed during planning:

- **Email:** Google SMTP via Nodemailer instead of Resend.
- **Database:** any PostgreSQL. Locally that's a native install (or `docker compose up -d`); in production,
  point `DATABASE_URL` at a cloud Postgres and run `pnpm db:deploy`.

## Getting started

Prerequisites: Node.js LTS, pnpm (or `npx pnpm@latest …`), PostgreSQL.

```bash
pnpm install
cp .env.example .env.local      # then fill in DATABASE_URL and SMTP settings
pnpm db:migrate                 # creates the tables (first run: name the migration "init")
pnpm db:seed                    # optional sample lead for Prisma Studio
pnpm dev                        # http://localhost:3000
```

`.env.example` documents every variable. Turnstile ships with Cloudflare's always-pass **test keys**;
replace them before launch. For Gmail, use an **App Password** (Google account → Security → App passwords),
not the account password. Without SMTP credentials, emails are logged to the console instead of sent.

## Scripts

| Command                         | Does                                               |
| ------------------------------- | -------------------------------------------------- |
| `pnpm dev`                      | Dev server with hot reload                         |
| `pnpm build` / `pnpm start`     | Production build and run                           |
| `pnpm lint` / `pnpm format`     | ESLint / Prettier                                  |
| `pnpm typecheck`                | Route typegen + `tsc --noEmit`                     |
| `pnpm test`                     | Vitest unit + component tests                      |
| `pnpm test:e2e`                 | Playwright end-to-end (builds and starts the app)  |
| `pnpm db:migrate` / `db:deploy` | Create a migration (dev) / apply migrations (prod) |
| `pnpm db:seed` / `db:studio`    | Sample data / browse the database                  |
| `pnpm og`                       | Regenerate `public/og.png`                         |

## How it's put together

- `app/(public)/page.tsx` assembles the landing page as 10 cinematic **scenes** (`CineScene`) in the POC's order.
- `app/globals.css` holds the POC stylesheet **verbatim** (class names unchanged) plus a short "port additions"
  block at the end. Use Tailwind + theme tokens (`text-gold`, `bg-ink`, …) for new UI.
- `lib/content/*` is the typed site copy (programmes, outcomes, FAQs, testimonials, quiz). In the ★ scope this
  moves to the database.
- `components/webgl/` holds the POC's animation code, ported rather than rewritten:
  - `particleHero.ts` (WebGL planet; shaders in `shaders/`), `ribbons.ts`, `cineEngine.ts` (scroll timeline + snap).
  - Each exports a `start…()` that returns a cleanup function; React islands (`ParticleStage`, `CineScroll`,
    `SpatialParallax`) load them after hydration.
  - `lib/motion/journey.ts` links the scroll timeline to the planet (replaces the POC's `window.__planetJourney`).
- `components/modals/` — `ModalProvider` exposes `openApply(track)`, `openAssessment()`, `openPortal()`.
- `lib/actions/` — Server Actions for both forms: validate → rate-limit → Turnstile → save → email.
  Secrets are only read in `lib/server/*` (all `server-only`).

### Accessibility notes

- Cinematic mode is skipped under `prefers-reduced-motion`, and switches to standard scrolling on the first
  **Tab** press or via the screen-reader "Switch to standard scrolling" control, so every section stays reachable.
- Modals trap focus, close on Esc and return focus to the button that opened them.
