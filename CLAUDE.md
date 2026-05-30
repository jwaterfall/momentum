# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Momentum is a personal tracking app built around three resource types, all deliberately favouring neutral, factual logging over guilt. Single-user-per-account, mobile-first PWA.

- **Goals** — things you gradually work towards over a recurring period (e.g. "exercise 3×/week", "piano 4h/month"). Have a target (count or duration) and a period; logging adds progress towards the target.
- **Tasks** — one-off checklist items you mark complete. Have a priority; can optionally carry dates.
- **Streaks** — things you want to _avoid_ doing (e.g. "don't drink"); you log a slip when you break the streak. **Not yet implemented** — only Goals and Tasks exist in the schema/actions today. When adding Streaks, follow the existing Goal/Task patterns below (schema in `src/db/schema/`, server actions in `src/app/actions.ts`, all user-scoped).

## Commands

This project uses **pnpm**.

| Command                            | Purpose                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                         | Start the dev server (http://localhost:3000)                  |
| `pnpm dev:pwa`                     | Dev server over HTTPS — needed to test PWA/manifest behaviour |
| `pnpm build`                       | Production build (`output: "standalone"`)                     |
| `pnpm lint`                        | ESLint                                                        |
| `pnpm format`                      | Prettier (auto-sorts imports — see config in `package.json`)  |
| `pnpm drizzle:generate`            | Generate a migration from schema changes in `src/db/schema/`  |
| `pnpm drizzle:migrate`             | Apply migrations to the DB                                    |
| `pnpm better-auth:generate-schema` | Regenerate `src/db/schema/auth.ts` from Better Auth config    |

There is no test suite.

A `DATABASE_URL` (PostgreSQL) must be set in `.env.local` for the app, Drizzle, and Better Auth to work.

## Stack

- **Next.js 16** (App Router, React 19, Server Components/Actions) — note Next 16 renames middleware to **`src/proxy.ts`**.
- **Drizzle ORM** over `node-postgres` (`pg` Pool).
- **Better Auth** (email/password + username plugin) with `@daveyplate/better-auth-ui` for prebuilt auth/account UI.
- **Tailwind v4** + **shadcn/ui built on Base UI** (`@base-ui/react`) — generated from the `base-maia` style / `mist` base-color preset (see `components.json`); components live in `src/components/ui/`. App is currently hard-coded to dark mode in `layout.tsx`. Fonts: Inter (body), Merriweather (headings, via `font-heading`), Geist Mono.
- Forms: `react-hook-form` + `zod` (+ `drizzle-zod`).

## Architecture

**Data access is centralised in `src/app/actions.ts`** — a single `"use server"` module containing every DB operation (CRUD for goals/tasks, goal-progress logging). There is no separate API layer or service/repository abstraction; components call these server actions directly.

Two invariants enforced throughout `actions.ts`:

1. **Every action calls `getUserId()` first** (reads the Better Auth session from request headers, throws `Unauthorized` if absent) and scopes all queries with `eq(table.userId, userId)`. New data-access code must follow this pattern — there is no row-level security in the DB.
2. **Mutations call `revalidatePath("/")`** to refresh the cached server-rendered page.

Goal progress is **derived, not stored**: `getGoals()` computes each goal's progress with a correlated SQL subquery that sums `goal_log.value` over the current period window (`date_trunc` by daily/weekly/monthly/yearly). Logging progress inserts a `goalLog` row rather than mutating the goal.

**Auth flow:**

- `src/proxy.ts` optimistically redirects unauthenticated requests to `/auth/sign-in` based on the session cookie (it is _not_ a security boundary — see the comment in the file; real checks happen in server actions and `PrivateRoute`).
- `src/lib/auth.ts` is the server-side Better Auth instance; `src/lib/auth-client.ts` is the React client. The catch-all route `src/app/api/auth/[...all]/route.ts` handles all auth endpoints.
- `<PrivateRoute>` wraps protected pages, gating content on `SignedIn` and redirecting otherwise.

**Routing** uses App Router route groups:

- `src/app/(with-nav)/` — authenticated pages with the bottom nav (`/` dashboard, `/stats`, `/account`).
- `src/app/(without-nav)/` — the auth pages (`/auth/[path]`).

**Schema** lives in `src/db/schema/` (`goals.ts`, `tasks.ts`, `auth.ts`, re-exported via `index.ts`). Postgres enums are defined as TS `enum`s wrapped in `pgEnum`. `auth.ts` is generated — don't hand-edit it; change Better Auth config and regenerate. Drizzle infers `Goal`/`Task` types via `$inferSelect`/`$inferInsert`.

## Conventions

- Import alias `@/*` → `src/*`.
- Components are built on **Base UI** — use the `render` prop to compose a trigger with a custom element (e.g. `<DialogTrigger render={<Button />}>`), not Radix's `asChild`. Add new components via the shadcn CLI (`pnpm dlx shadcn@latest`, config in `components.json`); icons from `lucide-react`.
- Prettier sorts imports into groups (react → next → third-party → `@/` → relative); run `pnpm format` before committing.
