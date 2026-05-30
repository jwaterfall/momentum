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

## Development workflow

- **Don't run `pnpm lint` / `pnpm build` after every small change** — they're slow and break flow. Batch related edits, then run `pnpm format`, `pnpm lint`, and `pnpm build` once **before committing**.
- Do not commit or push without explicit approval from the user.
- **Before committing a non-trivial change, run the audit in [`docs/audit-checklist.md`](docs/audit-checklist.md).** Always-on conventions reduce mistakes; the audit catches the drift.

## Conventions

These are the standard to build to — the "get it right the first time" layer; the audit checklist is the safety net. They're written as the **target** across apps, not just a description of momentum as it is today. Where momentum hasn't caught up, that's a migration target, called out in the boxes below — not an excuse to write to the old shape.

### Architecture: feature folders + read/write split

- **Each feature lives in `features/{name}/`**: `services.ts` (data fetching + reshaping, server-only), `components/` (leaf components), and `actions.ts` _only_ when the feature has mutations. Pages compose features.
- **Reads and writes are separate.** `services.ts` owns reads (`import "server-only"`); `actions.ts` owns mutations (`"use server"`). Don't put queries in `actions.ts` or mutations in `services.ts`.
- **Services return render-ready types.** Model what the UI needs, not the raw API/DB shape. All parsing, filtering, and normalising lives in the service so pages/components never shape data.
- **Every data access is user-scoped.** Services and actions resolve the current user (`getUserId()` / session) and scope every query by it. There is no row-level security in the DB — ownership is enforced in code. Never trust an id from the client for ownership.
- **Mutations call `revalidatePath(...)`** so the cached server render refreshes.
- **Protected pages call `requirePageAuth()` first** (`src/utils/require-page-auth.ts`). Pages in a `(without-nav)`/public group are the only exceptions.

> **Momentum today (migration target):** momentum hasn't adopted the split yet — all reads _and_ writes sit in one `src/app/actions.ts`, with no `features/` folders or `services.ts`. New features should be built the new way (`features/{name}/` with a `services.ts`/`actions.ts` split, render-ready types). Until a given area is migrated, the data-layer rules above apply to `actions.ts`.

### React & components

- **Default to server components.** Add `"use client"` only when the file actually uses client state/effects/handlers or a browser API (`useState`, `useEffect`, `useRouter`, an `on*` handler, `window`/`document`/`localStorage`). A `"use client"` file with none of these is cargo-culted.
- **Client-side data fetching goes through React Query** (`useQuery`/`useMutation`), never `useEffect` + `fetch`. Server components remain the default for initial data; reach for React Query only when data genuinely must load on the client.
- **Components are leaves: props in, render out.** Don't bundle a section heading/`<header>` chrome or a data-fetch inside a reusable component — that belongs in the page composing it. A `title` prop on a "section" component, or a component that awaits a service, are the tells.
- **Compose Base UI with the `render` prop, never Radix's `asChild`** (e.g. `<DialogTrigger render={<Button />}>`).
- **Don't fight the primitives.** They size their own icons and spacing — don't pass `size={N}` to an icon inside `Button`/`DropdownMenuItem`/`Badge`, and don't wrap a button label in a `<span>`.
- **Forms** use `react-hook-form` + `zod` + the `Form`/`FormField`/`FormControl`/`FormMessage` components. Surface validation through `FormMessage`; surface server errors inline.

> **Momentum today:** React Query isn't installed. The few client mutations (account cards) call `authClient.*` then `router.refresh()`, which is fine. Add React Query when a real client-side _fetch_ appears, rather than reaching for `useEffect`.

### Styling

- **Use design tokens, not raw colour literals.** Prefer `bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `text-destructive`, `border`, `primary`, etc. Avoid `text-white`/`bg-black`, `bg-{slate,gray,zinc,…}-N`, `text-{red,green,blue,…}-N`, and hex codes. The token system handles dark mode, so don't hand-add `dark:` overrides on raw colours.
- **Action buttons belong in `CardFooter`**, content in `CardContent` — don't right-align a button with a `flex justify-end` div inside `CardContent`.

### General quality

- **No TypeScript escape hatches** — no `any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`. Model the type instead; flag a genuinely inexpressible library type rather than silencing it.
- **Comments warn, they don't justify.** Keep a comment only if it tells the reader something the code can't (an API quirk, a non-obvious constraint). Delete comments that restate the code or justify a layout/style decision.
- **Scaffolds leave honest placeholders.** Don't pre-fill fake type shapes or create empty `actions.ts`/`utils.ts` files before they're needed.

### Tooling

- Import alias `@/*` → `src/*`.
- Add new components via the shadcn CLI (`pnpm dlx shadcn@latest`, config in `components.json`); icons from `lucide-react`.
- Prettier sorts imports into groups (react → next → third-party → `@/` → relative); run `pnpm format` before committing.
