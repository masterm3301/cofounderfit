# co-founder.fit — Spec #2: Discover Profiles & Discover Projects

## Context

Spec #1 (Foundation) built accounts, profiles, and projects, but every profile and
project page is reachable only by direct link — there is no way to browse. This spec
adds two feed pages, `Discover Profiles` and `Discover Projects`, so users can find
people and projects without already knowing a URL.

**In scope:** a paginated feed of complete profiles at `/discover/profiles` and a
paginated feed of projects at `/discover/projects`, plus links to both from the home
page.

**Out of scope (future specs):** filtering/search, swipe-based matching, infinite
scroll or "load more", notifications, admin/moderation.

## Architecture

Two new routes, following the existing thin-page pattern (Server Component page +
logic in `src/lib/`):

- `/discover/profiles` — signed-in with a complete profile only, guarded by the
  existing `requireCompleteProfile()` (Spec #1, Task 7).
- `/discover/projects` — public, no auth guard, matching the existing public
  project-view page.

Both are paginated via a `?page=N` query param using offset-based pagination
(Prisma `skip`/`take`), not cursor-based (keyset) pagination — offset pagination is
simpler and supports jumping to an arbitrary page number, which cursor pagination
does not. This is the right trade-off at the current (small) dataset size; if the
dataset grows large enough for `skip` performance to matter, a later spec can switch
to cursor-based pagination without changing the rest of this design.

Page size is a fixed constant, 20 items per page, for both feeds. Both feeds are
ordered newest-first (`createdAt desc`).

## Data & Queries

Two new functions, alongside the existing data-access functions:

- `listProfiles(page: number): Promise<{ profiles: (Profile & { user: User })[]; totalPages: number }>`
  in `src/lib/profile.ts`. Queries `Profile` joined with `User` (for name/photo),
  **filtered to only complete profiles** — a blank `Profile` row exists for every user
  from the moment they first sign in (Spec #1, Task 4), before they've finished
  `/profile/setup`, and those incomplete rows must never appear in the feed. "Complete"
  uses the same definition as `isProfileComplete` (bio, at least one skill, roleType,
  and commitment all set). Ordered by `user.createdAt desc`, paginated with
  `skip`/`take`.
- `listProjects(page: number): Promise<{ projects: (Project & { owner: User })[]; totalPages: number }>`
  in `src/lib/project.ts`. Queries `Project` joined with `owner` (for the "Founded by"
  link on the detail page). No completeness filter is needed — `createProject`
  already validates all required fields via `projectSchema` before a row can exist, so
  every `Project` row is inherently complete. Ordered by `createdAt desc`, paginated
  with `skip`/`take`.

Both functions compute `totalPages` via a `count()` query against the same filter
conditions, so the page can render Prev/Next controls and clamp out-of-range page
numbers correctly.

Signed-in users are **not** excluded from feeds containing their own profile or
project — no self-exclusion logic. This matches YAGNI: it's simpler, and seeing your
own card in the feed causes no harm.

## UI & Components

Two new card components, following the existing small-focused-component pattern
(`ProfileForm`, `ProjectForm`):

- `ProfileCard` (`src/components/ProfileCard.tsx`) — photo, name, location, role,
  commitment, a truncated bio snippet, and skills (as tags). The whole card links to
  `/profile/[userId]`.
- `ProjectCard` (`src/components/ProjectCard.tsx`) — name, tagline, industry, roles
  needed, commitment expected. The whole card links to `/project/[projectId]`.

`src/app/discover/profiles/page.tsx` and `src/app/discover/projects/page.tsx` each
read `page` from `searchParams`, call the corresponding `list*` function, render a
responsive grid of cards, and render inline Prev/Next links (disabled at the
boundaries). No shared `Pagination` component yet — with only two call sites and a
few lines of boundary logic each, a shared component would be premature; extract one
if a third paginated feed is added later.

`src/app/page.tsx` (home page) gets two new links, "Discover Profiles" and "Discover
Projects", shown to everyone. The "Discover Profiles" link is visible even when
signed out; clicking it redirects to sign-in via the existing guard, the same as any
other protected link would.

## Error Handling

- **Invalid or out-of-range `page`** (`?page=0`, `?page=999`, `?page=abc`, missing):
  clamp rather than error. Non-numeric or less-than-1 values become page 1; values
  greater than `totalPages` become the last valid page. No 404 or error page for this
  case.
- **Empty feed** (no complete profiles yet, or no projects yet): render a plain
  message — "No profiles yet." / "No projects yet." — instead of an empty grid.
- **`/discover/profiles` while signed out or with an incomplete profile**: handled
  entirely by the existing `requireCompleteProfile()` guard (redirect to sign-in, or
  to `/profile/setup` if signed in but incomplete). No new error handling needed.
- **`/discover/projects`**: no guard, no error case — always renders.

## Testing

- Integration tests for `listProfiles` and `listProjects` (Vitest against a real
  Postgres test database, same pattern as `profile.test.ts` / `project.test.ts`):
  pagination math and `totalPages` calculation, newest-first ordering, the
  completeness filter excluding blank profiles from `listProfiles`, and page-number
  clamping for out-of-range and invalid values.
- Manual verification: browse both feeds; confirm each card links to the correct
  detail page; confirm Prev/Next behave correctly at both boundaries; confirm
  `/discover/profiles` redirects when signed out and when signed in with an
  incomplete profile; confirm `/discover/projects` is reachable while signed out;
  confirm a user who has only completed `/profile/setup` partially (blank profile)
  never appears in `/discover/profiles`.
