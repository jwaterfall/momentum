# Audit checklist

A defensive sweep against the conventions in [`CLAUDE.md`](../CLAUDE.md), run **before committing** a non-trivial change. The conventions are the "get it right the first time" layer; this audit catches the drift that creeps in over a long session.

It audits **code patterns and judgment calls** — the things a linter can't reliably catch. Genuinely mechanical rules should be enforced by ESLint / a pre-commit hook instead (see [Mechanize these](#mechanize-these-dont-audit-by-hand)); don't spend audit attention on them once they're wired up.

> **Repo binding (momentum).** The cross-app stack is constant — Better Auth, Next.js App Router, Drizzle, shadcn/Base UI — so the rules apply as written. The one current divergence: momentum hasn't adopted the `features/{name}/` + `services.ts`/`actions.ts` split; all data access lives in `src/app/actions.ts`. Until an area is migrated, apply the data-layer rules to `actions.ts` and skip **A3**. Protected pages live under `src/app/(with-nav)/**`.

## How to run it

1. **Confirm scope.** Default to the current change set — staged/working-tree diff, or `git diff --name-only main...HEAD`. Don't audit the whole repo; the report becomes noise. If the user named a path, audit that.
2. **Grep for candidates, then read the surrounding context before flagging.** Every rule is "candidates to consider," not "automatic violations" — most patterns are legitimate somewhere.
3. **Run Section A first.** If a structural invariant is broken, the rest is suspect anyway.
4. **Don't auto-fix.** Report; the user decides. Some violations are intentional in context — especially auth (`requirePageAuth` / user-scoping), where being wrong is worse than being absent.
5. **If it's clean, say so plainly.** False positives erode trust in the audit.

Each rule lists: **Scope** · **Severity** · **Pattern** · **Allow-list**. Severities: `[security]` blocks the commit · `[correctness]` likely a bug · `[consistency]` convention drift.

---

## Section A — structural invariants

### A1. Protected pages call `requirePageAuth()` [security]

- **Scope:** app pages outside a public/`(without-nav)` route group (momentum: `src/app/(with-nav)/**/page.tsx`).
- **Pattern:** the page body must `await requirePageAuth()` before reading user data.
- **Allow-list:** public/auth pages. A protected page with no guard is the bug.

### A2. Data access is user-scoped [security]

- **Scope:** the data layer — `services.ts` and `actions.ts` (momentum: `src/app/actions.ts`).
- **Pattern:** every read/write resolves the current user (`getUserId()` / session) and filters every query by that user. Mutations also `revalidatePath(...)`.
- **Allow-list:** none — ownership is enforced only in code, so a missing user filter is a real access-control hole. A mutation without `revalidatePath` is `[consistency]`, not security.

### A3. Reads vs writes in the right file [correctness]

- **Scope:** `features/*/services.ts`, `features/*/actions.ts`.
- **Pattern:** `services.ts` holds reads and starts with `import "server-only"`; `actions.ts` holds mutations and starts with `"use server"`. Flag queries in `actions.ts` or mutations in `services.ts`.
- **Allow-list:** repos that haven't adopted the split yet (momentum today) — skip this rule until the area is migrated.

### A4. `"use client"` is justified [correctness]

- **Scope:** any file with `"use client"`.
- **Pattern:** it must use `useState`/`useEffect`/`useRouter`/`useForm`/an `on*` handler/a browser API. If none, drop the directive.
- **Allow-list:** thin client-boundary wrappers — verify by reading.

### A5. No `asChild` (Base UI uses `render`) [correctness]

- **Scope:** all `.tsx`.
- **Pattern:** `asChild` — composition uses the `render` prop (`<DialogTrigger render={<Button />}>`). Any `asChild` is a Radix-era leftover.
- **Allow-list:** none.

---

## Section B — content & judgment

### B1. Data shaping leaking into pages/components [consistency]

- **Scope:** pages and components (momentum: `src/app/**/*.tsx`, `src/components/**/*.tsx`).
- **Pattern:** shaping that the data layer should own — `parseFloat`/`parseInt`, regex over data, conditional `.push` of `[label, value]` tuples, `.filter`/`.map` reshaping, `.toLowerCase`/`.replace`/normalisation over data. The service should return a **render-ready type** so the page just renders.
- **Allow-list:** simple guards (`if (!data) …`), single-field fallback (`x ?? "—"`), and `format*`/date-display calls — those are presentation, not shaping.

### B2. Client data fetching outside React Query [correctness]

- **Scope:** client components.
- **Pattern:** a `useEffect` whose body fetches data, or raw `fetch` in a client component for page data. Client-side fetches go through React Query (`useQuery`/`useMutation`); initial data should come from a server component.
- **Allow-list:** subscriptions / one-shot bootstrap of a non-data resource; a mutation handler that calls a server action (or `authClient.*`) then `router.refresh()` is fine — that's not a fetch-in-effect.

### B3. Comments that justify rather than warn [consistency]

- **Scope:** all `.ts(x)`.
- **Pattern:** keep a comment only if it warns of something the code can't say (an API quirk, a non-obvious constraint). Flag comments that restate the code or justify a layout/style choice.
- **Allow-list:** genuine warnings; `eslint-disable` lines with a reason.

### B4. Fighting the primitives [consistency]

- **Scope:** all `.tsx`.
- **Pattern:** `size={N}` on an icon inside `Button`/`DropdownMenuItem`/`Badge`, or a `<span>` wrapping a button label — the primitive already sizes and spaces.
- **Allow-list:** icons outside primitives, where an explicit size is intended.

### B5. Raw colour literals [consistency]

- **Scope:** app + feature/component code. Skip generated UI primitives (momentum: `src/components/ui/**`).
- **Pattern:** `text-white`/`bg-black`, `bg-{slate,gray,zinc,neutral,stone}-N`, `text-{red,green,blue,emerald,amber,…}-N`, hex codes, and `dark:` overrides on raw colours.
- **Allow-list:** the generated `ui/` primitives. Elsewhere prefer `bg-card`/`text-muted-foreground`/`text-destructive`/`border`/`primary`.

### B6. Components that bundle chrome or fetching instead of staying leaves [consistency]

- **Scope:** feature/shared components (momentum: `src/components/**/*.tsx`).
- **Pattern:** a reusable component that owns its own `<section>`/`<header>` heading copy, takes a `title`/`description` copy prop, or fetches its own data. The chrome and the fetch belong in the page; the component should be props-in/render-out.
- **Allow-list:** genuine layout primitives that carry no feature-specific copy (a generic `PageHeader`, the nav).

### B7. TypeScript escape hatches [correctness]

- **Scope:** all `.ts(x)`.
- **Pattern:** `: any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`.
- **Allow-list:** a narrow, commented cast where a library type genuinely can't be expressed — flag it for the reviewer. (Once `no-explicit-any` is in ESLint, drop this from the manual audit.)

---

## Output format

Group findings by severity (security → correctness → consistency), then by rule. Each finding:

```
**A2. Data access is user-scoped**
src/app/actions.ts:54-60
deleteGoal() deletes by id with no userId filter.
→ Add `and(eq(goal.id, id), eq(goal.userId, userId))` to the where clause.
```

Include the rule reference (`A2`, `B5`…), the `path:line-range`, a 2–3 line excerpt (or "missing"), and the fix as a one-liner (`→ …`). End with a totals line:

```
1 security · 2 correctness · 4 consistency  →  7 issues across 5 files.
```

If clean, say so.

---

## Mechanize these (don't audit by hand)

Pure pattern-matches are caught more reliably by tooling than by an LLM grep. Wire these into ESLint (`eslint.config.mjs`) / the pre-commit hook and drop them from the manual audit:

- **B7 escape hatches** → `@typescript-eslint/no-explicit-any` + `@typescript-eslint/ban-ts-comment`. _(reliable, low effort)_
- **A5 `asChild`** → a `no-restricted-syntax` rule flagging the `asChild` JSX attribute. _(reliable, low effort)_
- **B5 raw colour literals** → `eslint-plugin-tailwindcss` or a custom class-name rule. _(useful, medium effort)_
- **B2 client fetch in `useEffect`** → hard to lint precisely; keep as a judgment rule.

Everything else needs reading context and stays a manual audit.
