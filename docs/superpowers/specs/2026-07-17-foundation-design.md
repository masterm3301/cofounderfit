# co-founder.fit — Spec #1: Foundation (Auth + Profiles + Projects)

## Context

co-founder.fit matches people to co-founders and, unlike YC Co-Founder Matching, also
matches people to *projects* — existing ideas/startups looking for a co-founder to join.
The product has several independent subsystems (accounts/profiles, project listings,
discovery, matching, messaging). This spec covers only the foundation: everything else
depends on it and is designed separately.

**In scope:** LinkedIn OAuth sign-in, user accounts, person profiles (CRUD), project
listings (CRUD).

**Out of scope (future specs):** Discover Profiles, Discover Projects, swipe-based
matching, inbox/messaging, notifications, admin/moderation.

## Architecture

- **Stack:** Next.js (App Router, TypeScript), full-stack (no separate backend service).
- **Database:** Postgres, accessed via Prisma ORM.
- **Hosting:** Vercel (app) + managed Postgres (Neon or Vercel Postgres).
- **Auth:** Auth.js (NextAuth v5), LinkedIn OpenID Connect as the sole sign-in provider.
  No email/password.

## Data model

### User
| field | type | notes |
|---|---|---|
| id | string (cuid) | primary key |
| linkedinId | string | unique, from OAuth |
| email | string | from LinkedIn |
| name | string | from LinkedIn |
| createdAt | datetime | |

### Profile (1:1 with User)
| field | type | notes |
|---|---|---|
| userId | string | FK, unique |
| photoUrl | string | defaults to LinkedIn photo |
| location | string | |
| bio | text | required to be "complete" |
| skills | string[] | required, at least one |
| roleType | enum | technical / business / design / other |
| commitment | enum | full-time / part-time |
| hasIdea | boolean | whether they already have a project idea |
| coFounderTraitsWanted | text | free text |
| linkedinUrl | string | auto-filled from OAuth |
| otherLinks | string[] | optional (personal site, X/Twitter, GitHub, etc.) |

### Project (1:1 with User — one active project per owner)
| field | type | notes |
|---|---|---|
| id | string (cuid) | primary key |
| ownerId | string | FK, unique |
| name | string | required |
| tagline | string | required |
| description | text | required |
| industry | string | |
| rolesNeeded | string[] | e.g. "technical co-founder" |
| equityOffered | string | free text, e.g. "10-20%" |
| commitmentExpected | enum | full-time / part-time |
| websiteUrl | string | optional |
| deckUrl | string | optional |
| demoUrl | string | optional |
| createdAt | datetime | |
| updatedAt | datetime | |

## Auth & core flows

1. User clicks "Sign in with LinkedIn" → OAuth redirect → on first successful login, a
   `User` row and a blank `Profile` row are created.
2. If the `Profile` is incomplete (missing bio, skills, or other required fields), the
   user is redirected to a profile-setup form and cannot access the rest of the app
   until it's complete.
3. A signed-in user can view and edit their own `Profile`.
4. A signed-in user can view and edit their own `Project`. If they don't have one yet,
   they see a "create project" form instead of an edit form. Creating a second project
   is not possible while one is active (edit the existing one, or delete it first).
5. Any signed-in user can view another user's `Profile` and `Project` pages, read-only.
   There is no list/browse view in this spec — pages are only reachable by direct link
   (list/browse is Discover Profiles / Discover Projects, a later spec).

## Error handling

- LinkedIn OAuth failure or denial → dedicated error page with a retry link back to
  sign-in.
- Profile and Project forms validate required fields both client-side (immediate
  feedback) and server-side (source of truth) before persisting.
- A user attempting to reach another user's edit routes (`/profile/edit`,
  `/project/edit` for an id they don't own) receives a 403.
- Attempting to create a second project while one exists is rejected with a clear
  message directing them to edit the existing project.

## Testing

- Unit tests for Prisma schema constraints (required fields, uniqueness of
  `ownerId`/`userId`).
- Integration test for the OAuth callback: first login creates exactly one `User` and
  one blank `Profile`; subsequent logins do not duplicate rows.
- Manual verification: sign in with LinkedIn, complete profile setup, create a project,
  edit the project, view another (seeded) user's profile and project pages read-only,
  confirm edit routes 403 for non-owners.
