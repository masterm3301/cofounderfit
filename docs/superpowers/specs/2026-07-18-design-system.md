# co-founder.fit — Spec #4: Design System & Home Page

## Context

Specs #1-3 built the app's functionality (auth, profiles, projects, discovery,
matching) with no visual design pass — every page uses ad-hoc Tailwind utility
classes (plain borders, black-and-white buttons, no shared layout). This spec
establishes a consistent design system and applies it across the app, and turns the
home page from a bare sign-in link into a real landing page.

**In scope:** design tokens (color, type, layout), three shared components (`Nav`,
`Button`, `Card`), restyling every existing page with them, and a redesigned home
page with live stats, featured projects, and marketing content.

**Out of scope (future specs):** a real review/testimonial system (this spec uses
static placeholder testimonial copy), any new functional behavior — this is a
styling and content pass over already-built, already-tested logic, not a new
subsystem like messaging or notifications.

## Design Tokens

- **Color:** white background, Tailwind's default gray scale for text/borders/subtle
  backgrounds (`gray-900` headings, `gray-700` body text, `gray-500` muted/secondary
  text, `gray-200` borders, `gray-50` subtle section backgrounds), and **indigo-600**
  as the single accent color (primary buttons, links, the active Like state, the
  match confirmation), with `indigo-700` for hover states and `indigo-50` for light
  accent backgrounds (e.g. a highlighted Like button's background).
- **Typography:** Inter, loaded via `next/font/google` (self-hosted by Next.js at
  build time — no runtime request to Google Fonts) and set as the body font in the
  root layout. Headings use `font-bold tracking-tight`; muted/secondary text uses
  `text-gray-500`.
- **Layout:** page content is capped at a max width and centered
  (`max-w-5xl mx-auto px-4 sm:px-6`) on every page, replacing the current ad-hoc
  `p-8` on each page's `<main>`.

## Shared Components

- **`Nav`** (`src/components/Nav.tsx`) — a slim top bar rendered once in the root
  layout (`src/app/layout.tsx`, which becomes an async Server Component calling
  `auth()` to know whether to render signed-in or signed-out nav state). Shows the
  "co-founder.fit" wordmark, and when signed in: links to Discover Profiles,
  Discover Projects, My Matches, My Profile, and a Sign out button; when signed out:
  a "Sign in with LinkedIn" button. This replaces the ad-hoc links that currently
  exist only on the home page — every page gets navigation automatically.
- **`Button`** (`src/components/Button.tsx`) — a small presentational wrapper around
  `<button>`/`<a>` with two variants, `primary` (solid `indigo-600`, white text) and
  `secondary` (outlined, `gray-300` border). Used for every submit button and
  Prev/Next link across the app, including the Discover feed cards' Like/Pass
  buttons — the highlighted "you already reacted this way" state switches from the
  current black background to `indigo-600`.
- **`Card`** (`src/components/Card.tsx`) — the white/bordered/rounded wrapper
  (`bg-white border border-gray-200 rounded-xl p-4 shadow-sm`) used by `ProfileCard`,
  `ProjectCard`, and content blocks on the profile/project/matches pages.

## Home Page

`src/app/page.tsx` becomes a landing page with these sections, top to bottom:

1. **Hero** — wordmark/tagline, a one-paragraph explanation of the site's objective
   (matching people to co-founders and to existing projects), and a
   "Sign in with LinkedIn" call-to-action button. If the visitor is already signed
   in, this becomes a short welcome-back message instead of the sign-in CTA (the
   `Nav` already provides navigation, so this section no longer needs to list links
   to "My profile"/"My project" the way the old home page did).
2. **Stats** — three numbers: count of complete profiles, count of projects, count
   of matches made, each via a simple Prisma `count()`.
3. **"How it works"** — a static 3-step explainer (create your profile → discover
   people & projects → match and connect). No data, just content.
4. **Featured projects** — the 3 most recently created projects (same ordering as
   `listProjects`, just capped at 3, reusing `ProjectCard` for display — without the
   Like/Pass buttons, since this is a preview, not the Discover feed). If there are
   fewer than 3 projects, show as many as exist; if there are none, show a brief
   "No projects yet — be the first" message instead of an empty section.
5. **Testimonials** — 3 static placeholder testimonial quotes (written content, not
   backed by any data model).
6. **Footer** — a row of placeholder social/contact links (e.g. a placeholder X/
   Twitter link, a placeholder LinkedIn company page link, a `mailto:` placeholder),
   standard landing-page footer treatment.

New data-access support for this page:

- `getHomeStats(): Promise<{ profileCount: number; projectCount: number; matchCount: number }>`
  in `src/lib/stats.ts` — three independent `count()` calls (`Profile` filtered to
  complete, per the existing `COMPLETE_PROFILE_FILTER` definition; `Project`
  unfiltered; `Match` unfiltered).
- `getFeaturedProjects(): Promise<(Project & { owner: User })[]>` in
  `src/lib/project.ts` — `findMany` with `include: { owner: true }`,
  `orderBy: { createdAt: "desc" }`, `take: 3`. No pagination, no viewer reaction (not
  the Discover feed).

## Rest of the App

Every other existing page and component is restyled in place with the new tokens
and `Button`/`Card` — no behavior changes: `/profile/setup`, `/profile/edit`,
`/profile/[userId]`, `/project/edit`, `/project/[projectId]`,
`/discover/profiles`, `/discover/projects`, `/matches`, `/matches/new`,
`/auth/error`, `ProfileForm`, `ProjectForm`, `ProfileCard`, `ProjectCard`. `Nav` is
added once to the root layout and therefore appears on every page without each page
needing its own copy.

## Error Handling

No new error states are introduced — this is a styling and content pass over
already-tested logic. The only new server-side logic is the home page's stats and
featured-project queries, which reuse existing, already-proven Prisma patterns
(`count()`, `findMany` ordered `createdAt desc`). The one edge case: zero projects
in the database — stats show `0` and the featured-projects section shows a brief
"No projects yet" message instead of an empty grid.

## Testing

- A small integration test for `getHomeStats` and `getFeaturedProjects`
  (`src/lib/stats.test.ts` and an addition to `src/lib/project.test.ts`, same
  real-Postgres pattern as every other `lib` test): counts are correct, featured
  projects are capped at 3 and ordered newest-first, and both handle the
  zero-projects case correctly.
- No new tests for the styling changes themselves (no behavior to test).
- Manual verification: visually walk every page against the new design system;
  confirm `Nav` appears on every page and every link works, in both signed-in and
  signed-out states; confirm the home page renders real stats/featured projects
  against seeded data, and degrades gracefully (stats show `0`, "No projects yet")
  against an empty database.
