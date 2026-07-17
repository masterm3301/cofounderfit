# Foundation (Auth + Profiles + Projects) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of co-founder.fit — LinkedIn sign-in, user accounts, person profiles, and project listings (CRUD) — with no browsing, matching, or messaging yet.

**Architecture:** A single Next.js (App Router, TypeScript) app talking to Postgres through Prisma. Auth.js (NextAuth v5) handles LinkedIn OAuth and creates a `User` + blank `Profile` on first login. Business logic (profile/project CRUD, completeness checks, ownership) lives in plain server-side TypeScript modules under `src/lib/`, independently testable with Vitest against a real Postgres test database; pages and Server Actions are thin wrappers around those modules.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma + Postgres, Auth.js v5 (LinkedIn OIDC provider), Zod, Vitest, Docker Compose (local Postgres).

## Global Constraints

- Auth is LinkedIn OAuth only — no email/password, no other providers (per spec).
- One active `Project` per user, enforced at the data layer (`ownerId` is unique).
- No list/browse views in this plan — profile and project pages are reachable only by direct link. Discover Profiles/Projects are future specs.
- Edit routes never take another user's id as a parameter — they always operate on the signed-in user's own resource, so there is no route through which one user can edit another's data.
- Required profile fields (bio, at least one skill, role, commitment) must be complete before a user can access anything beyond profile setup.
- All persisted data lives in Postgres via Prisma; no other datastore.

---

### Task 1: Project scaffold (Next.js, TypeScript, Tailwind, Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `src/lib/sanity.test.ts`

**Interfaces:**
- Produces: a running Next.js App Router project at `src/app`, path alias `@/*` → `src/*`, Vitest wired to run `*.test.ts` files with that same alias.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "cofounder-fit",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install core dependencies**

Run: `npm install next@15 react@19 react-dom@19`
Expected: installs succeed, `node_modules` created, `dependencies` added to `package.json`.

- [ ] **Step 3: Install dev dependencies**

Run: `npm install -D typescript @types/node @types/react @types/react-dom vitest tsx dotenv dotenv-cli tailwindcss postcss autoprefixer`
Expected: installs succeed, `devDependencies` added to `package.json`.

- [ ] **Step 4: Write config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`.gitignore`:
```
node_modules
.next
.env
.env.test
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

`vitest.setup.ts`:
```ts
import { config } from "dotenv";
config({ path: ".env.test" });
```

- [ ] **Step 5: Write the app shell**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/app/layout.tsx`:
```tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "co-founder.fit",
  description: "Match with a co-founder or a project to join.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">co-founder.fit</h1>
      <p>Foundation scaffold running.</p>
    </main>
  );
}
```

- [ ] **Step 6: Write a sanity test and confirm the test harness works**

`src/lib/sanity.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npx vitest run`
Expected: PASS (1 test passed).

- [ ] **Step 7: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.js .gitignore vitest.config.ts vitest.setup.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css src/lib/sanity.test.ts
git commit -m "chore: scaffold Next.js app with TypeScript, Tailwind, Vitest"
```

---

### Task 2: Postgres + Prisma schema & migrations

**Files:**
- Create: `docker-compose.yml`
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `.env` (not committed)
- Create: `.env.test` (not committed)

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: Postgres running locally on `5432` with database `cofounderfit` (dev) and `cofounderfit_test` (test), credentials `postgres`/`postgres`. Prisma schema with models `User`, `Profile`, `Project` and enums `RoleType`, `Commitment`, matching the spec's field tables exactly. `DATABASE_URL` env var convention used by all later Prisma access.

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cofounderfit
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: Start Postgres and create the test database**

Run: `docker compose up -d`
Expected: `docker compose ps` shows the `postgres` service as `running`/`healthy`.

Run: `docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE cofounderfit_test;"`
Expected: `CREATE DATABASE`.

- [ ] **Step 3: Install Prisma**

Run: `npm install @prisma/client`
Run: `npm install -D prisma`
Expected: both succeed.

- [ ] **Step 4: Write env files**

`.env.example`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cofounderfit"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cofounderfit_test"
AUTH_SECRET=""
AUTH_LINKEDIN_ID=""
AUTH_LINKEDIN_SECRET=""
```

`.env` (copy of the above with the same `DATABASE_URL`; `AUTH_*` values are filled in Task 5):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cofounderfit"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cofounderfit_test"
AUTH_SECRET=""
AUTH_LINKEDIN_ID=""
AUTH_LINKEDIN_SECRET=""
```

`.env.test`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cofounderfit_test"
```

- [ ] **Step 5: Write the Prisma schema**

`prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoleType {
  TECHNICAL
  BUSINESS
  DESIGN
  OTHER
}

enum Commitment {
  FULL_TIME
  PART_TIME
}

model User {
  id         String   @id @default(cuid())
  linkedinId String   @unique
  email      String   @unique
  name       String
  createdAt  DateTime @default(now())

  profile Profile?
  project Project?
}

model Profile {
  userId                String      @id
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  photoUrl              String?
  location              String?
  bio                   String?
  skills                String[]    @default([])
  roleType              RoleType?
  commitment            Commitment?
  hasIdea               Boolean     @default(false)
  coFounderTraitsWanted String?
  linkedinUrl           String?
  otherLinks            String[]    @default([])
}

model Project {
  id                  String      @id @default(cuid())
  ownerId             String      @unique
  owner               User        @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  name                String
  tagline             String
  description         String
  industry            String?
  rolesNeeded         String[]    @default([])
  equityOffered       String?
  commitmentExpected  Commitment?
  websiteUrl          String?
  deckUrl             String?
  demoUrl             String?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
}
```

- [ ] **Step 6: Run the initial migration and validate schema**

Run: `npx prisma validate`
Expected: "The schema at prisma/schema.prisma is valid".

Run: `npx prisma migrate dev --name init`
Expected: migration created under `prisma/migrations/`, applied, Prisma Client generated.

- [ ] **Step 7: Push the same schema to the test database**

Run: `npx dotenv -e .env.test -- npx prisma db push`
Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml prisma/schema.prisma prisma/migrations .env.example
git commit -m "feat: add Postgres via Docker and Prisma schema for User, Profile, Project"
```

---

### Task 3: Prisma client singleton, seed data, and test DB helper

**Files:**
- Create: `src/lib/db.ts`
- Create: `prisma/seed.ts`
- Create: `src/test/db-helpers.ts`

**Interfaces:**
- Consumes: Prisma schema from Task 2.
- Produces: `prisma` (singleton `PrismaClient`) exported from `src/lib/db.ts`, used by every later data-access module. `resetDb(): Promise<void>` from `src/test/db-helpers.ts`, used by every later integration test to clear tables between tests.

- [ ] **Step 1: Write the Prisma client singleton**

`src/lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Write the test DB reset helper**

`src/test/db-helpers.ts`:
```ts
import { prisma } from "@/lib/db";

export async function resetDb() {
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}
```

- [ ] **Step 3: Write the seed script**

`prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const ada = await prisma.user.create({
    data: {
      linkedinId: "seed-ada",
      email: "ada@example.com",
      name: "Ada Lovelace",
      profile: {
        create: {
          bio: "Full-stack engineer, ex-Stripe.",
          skills: ["TypeScript", "Postgres", "System design"],
          roleType: "TECHNICAL",
          commitment: "FULL_TIME",
          hasIdea: true,
          location: "San Francisco, CA",
          coFounderTraitsWanted: "A business co-founder who can sell.",
          linkedinUrl: "https://www.linkedin.com/in/seed-ada",
          otherLinks: ["https://github.com/example-ada"],
        },
      },
      project: {
        create: {
          name: "Loomly",
          tagline: "AI scheduling for freelancers",
          description: "Loomly auto-books client calls around a freelancer's real availability.",
          industry: "Productivity",
          rolesNeeded: ["Business co-founder", "Growth"],
          equityOffered: "15-25%",
          commitmentExpected: "FULL_TIME",
          websiteUrl: "https://example.com/loomly",
        },
      },
    },
  });

  const grace = await prisma.user.create({
    data: {
      linkedinId: "seed-grace",
      email: "grace@example.com",
      name: "Grace Hopper",
      profile: {
        create: {
          bio: "Ex-VP Sales, looking to join a technical co-founder's project.",
          skills: ["Sales", "Fundraising", "GTM strategy"],
          roleType: "BUSINESS",
          commitment: "FULL_TIME",
          hasIdea: false,
          location: "New York, NY",
          coFounderTraitsWanted: "A technical co-founder building something in fintech or AI.",
          linkedinUrl: "https://www.linkedin.com/in/seed-grace",
          otherLinks: [],
        },
      },
    },
  });

  console.log("Seeded users:", { ada: ada.id, grace: grace.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Wire the seed script into `package.json` and Prisma config**

Edit `package.json`, add a `"prisma"` field and a `db:seed` script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 5: Run the seed script and verify**

Run: `npm run db:seed`
Expected: prints `Seeded users: { ada: '...', grace: '...' }` with no errors.

Run: `docker compose exec -T postgres psql -U postgres -d cofounderfit -c "SELECT name FROM \"User\";"`
Expected: rows for `Ada Lovelace` and `Grace Hopper`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db.ts src/test/db-helpers.ts prisma/seed.ts package.json
git commit -m "feat: add Prisma client singleton, test DB reset helper, and seed data"
```

---

### Task 4: LinkedIn profile upsert logic

**Files:**
- Create: `src/lib/onboarding.ts`
- Test: `src/lib/onboarding.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db` (Task 3), `resetDb` from `@/test/db-helpers` (Task 3).
- Produces: `upsertUserFromLinkedInProfile(profile: { sub: string; email: string; name: string; picture?: string }): Promise<User & { profile: Profile | null }>`, used by Auth.js wiring in Task 5.

- [ ] **Step 1: Write the failing test**

`src/lib/onboarding.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { upsertUserFromLinkedInProfile } from "./onboarding";

beforeEach(async () => {
  await resetDb();
});

describe("upsertUserFromLinkedInProfile", () => {
  it("creates a new user and blank profile on first login", async () => {
    const user = await upsertUserFromLinkedInProfile({
      sub: "li-123",
      email: "a@example.com",
      name: "Ada Lovelace",
      picture: "https://example.com/a.jpg",
    });

    expect(user.linkedinId).toBe("li-123");
    expect(user.profile).not.toBeNull();
    expect(user.profile?.photoUrl).toBe("https://example.com/a.jpg");

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.profile.count()).toBe(1);
  });

  it("does not duplicate rows on repeat login and updates changed fields", async () => {
    await upsertUserFromLinkedInProfile({ sub: "li-123", email: "a@example.com", name: "Ada" });
    await upsertUserFromLinkedInProfile({ sub: "li-123", email: "a@example.com", name: "Ada Lovelace" });

    expect(await prisma.user.count()).toBe(1);

    const user = await prisma.user.findUnique({ where: { linkedinId: "li-123" } });
    expect(user?.name).toBe("Ada Lovelace");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/onboarding.test.ts`
Expected: FAIL with "Cannot find module './onboarding'" (or similar).

- [ ] **Step 3: Write the implementation**

`src/lib/onboarding.ts`:
```ts
import { prisma } from "./db";

interface LinkedInProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function upsertUserFromLinkedInProfile(profile: LinkedInProfile) {
  return prisma.user.upsert({
    where: { linkedinId: profile.sub },
    update: { email: profile.email, name: profile.name },
    create: {
      linkedinId: profile.sub,
      email: profile.email,
      name: profile.name,
      profile: {
        create: {
          photoUrl: profile.picture,
          linkedinUrl: `https://www.linkedin.com/in/${profile.sub}`,
        },
      },
    },
    include: { profile: true },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/onboarding.test.ts`
Expected: PASS (2 tests passed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/onboarding.ts src/lib/onboarding.test.ts
git commit -m "feat: upsert user and blank profile on LinkedIn login"
```

---

### Task 5: Auth.js LinkedIn sign-in wiring

**Files:**
- Create: `src/types/next-auth.d.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/auth/error/page.tsx`

**Interfaces:**
- Consumes: `upsertUserFromLinkedInProfile` from `@/lib/onboarding` (Task 4).
- Produces: `{ handlers, auth, signIn, signOut }` from `@/lib/auth`. `auth()` resolves to `Session | null` where a signed-in session has `session.user.id` set to the `User.id`. Used by every protected page/action from Task 7 onward.

- [ ] **Step 1: Install Auth.js**

Run: `npm install next-auth@beta`
Expected: installs succeed.

- [ ] **Step 2: Create a LinkedIn OAuth app and set env vars**

Create an app at the LinkedIn Developer Portal with the "Sign In with LinkedIn using OpenID Connect" product enabled, and set its redirect URL to `http://localhost:3000/api/auth/callback/linkedin`.

Generate an auth secret:
Run: `npx auth secret`
Expected: prints a secret and can write it to `.env` automatically, or prints one to copy in manually.

Edit `.env`, filling in the three blank values from Task 2:
```
AUTH_SECRET="<value from npx auth secret>"
AUTH_LINKEDIN_ID="<LinkedIn app Client ID>"
AUTH_LINKEDIN_SECRET="<LinkedIn app Client Secret>"
```

- [ ] **Step 3: Augment the Session type with `user.id`**

`src/types/next-auth.d.ts`:
```ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Write the Auth.js config**

`src/lib/auth.ts`:
```ts
import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { prisma } from "./db";
import { upsertUserFromLinkedInProfile } from "./onboarding";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub || !profile.email || !profile.name) return false;
      await upsertUserFromLinkedInProfile({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture as string | undefined,
      });
      return true;
    },
    async jwt({ token, profile }) {
      // `profile` is only present on the initial sign-in call. LinkedIn's `sub` is
      // NOT our Prisma User.id (that's a separate cuid) — look up the internal id
      // so `token.sub` (and later session.user.id) matches what getProfile/getProject
      // expect everywhere else in the app.
      if (profile?.sub) {
        const user = await prisma.user.findUnique({ where: { linkedinId: profile.sub } });
        if (user) {
          token.sub = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    error: "/auth/error",
  },
});
```

- [ ] **Step 5: Wire the route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 6: Write the OAuth error page**

`src/app/auth/error/page.tsx`:
```tsx
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Sign-in failed</h1>
      <p>We couldn&apos;t sign you in with LinkedIn. Please try again.</p>
      <Link href="/api/auth/signin" className="underline">
        Try again
      </Link>
    </main>
  );
}
```

- [ ] **Step 7: Manually verify the LinkedIn OAuth flow**

Run: `npm run dev`
Open `http://localhost:3000/api/auth/signin`, click LinkedIn, complete the OAuth consent screen.
Expected: redirected back to the app signed in; `docker compose exec -T postgres psql -U postgres -d cofounderfit -c "SELECT * FROM \"User\";"` shows a new row with your real LinkedIn `linkedinId`; `SELECT id FROM "User"` for that row is a cuid, not the LinkedIn subject id.

- [ ] **Step 8: Confirm the app still builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/types/next-auth.d.ts src/lib/auth.ts src/app/api/auth src/app/auth/error/page.tsx package.json
git commit -m "feat: wire up LinkedIn OAuth via Auth.js"
```

---

### Task 6: Profile data access & validation

**Files:**
- Create: `src/lib/validation/profile.ts`
- Create: `src/lib/profile.ts`
- Test: `src/lib/profile.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`, `resetDb` from `@/test/db-helpers`.
- Produces: `profileSchema` (Zod) and type `ProfileInput` from `@/lib/validation/profile`. `getProfile(userId: string): Promise<Profile | null>`, `isProfileComplete(profile: Profile | null): boolean`, `updateProfile(userId: string, input: ProfileInput): Promise<Profile>` from `@/lib/profile`. Used by Task 7 (guards) and Task 8 (UI).

- [ ] **Step 1: Install Zod**

Run: `npm install zod`
Expected: install succeeds.

- [ ] **Step 2: Write the failing test**

`src/lib/profile.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { getProfile, isProfileComplete, updateProfile } from "./profile";

beforeEach(async () => {
  await resetDb();
});

async function createTestUser() {
  return prisma.user.create({
    data: {
      linkedinId: "li-1",
      email: "a@example.com",
      name: "Ada",
      profile: { create: {} },
    },
  });
}

describe("isProfileComplete", () => {
  it("is false when required fields are missing", () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(
      isProfileComplete({
        userId: "1",
        photoUrl: null,
        location: null,
        bio: null,
        skills: [],
        roleType: null,
        commitment: null,
        hasIdea: false,
        coFounderTraitsWanted: null,
        linkedinUrl: null,
        otherLinks: [],
      })
    ).toBe(false);
  });

  it("is true when bio, skills, roleType, and commitment are set", () => {
    expect(
      isProfileComplete({
        userId: "1",
        photoUrl: null,
        location: null,
        bio: "Hi",
        skills: ["TypeScript"],
        roleType: "TECHNICAL",
        commitment: "FULL_TIME",
        hasIdea: false,
        coFounderTraitsWanted: null,
        linkedinUrl: null,
        otherLinks: [],
      })
    ).toBe(true);
  });
});

describe("updateProfile", () => {
  it("persists a valid profile update", async () => {
    const user = await createTestUser();

    await updateProfile(user.id, {
      bio: "Full-stack engineer",
      skills: ["TypeScript", "Postgres"],
      roleType: "TECHNICAL",
      commitment: "FULL_TIME",
      hasIdea: true,
      location: "SF",
      coFounderTraitsWanted: "A closer",
      otherLinks: ["https://github.com/example"],
    });

    const profile = await getProfile(user.id);
    expect(profile?.bio).toBe("Full-stack engineer");
    expect(profile?.skills).toEqual(["TypeScript", "Postgres"]);
    expect(isProfileComplete(profile)).toBe(true);
  });

  it("rejects an update missing required fields", async () => {
    const user = await createTestUser();

    await expect(
      updateProfile(user.id, {
        bio: "",
        skills: [],
        roleType: "TECHNICAL",
        commitment: "FULL_TIME",
        hasIdea: false,
      } as never)
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/profile.test.ts`
Expected: FAIL with "Cannot find module './profile'" (or similar).

- [ ] **Step 4: Write the validation schema**

`src/lib/validation/profile.ts`:
```ts
import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  roleType: z.enum(["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"]),
  commitment: z.enum(["FULL_TIME", "PART_TIME"]),
  hasIdea: z.boolean(),
  location: z.string().optional(),
  coFounderTraitsWanted: z.string().optional(),
  otherLinks: z.array(z.string().url()).optional().default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
```

- [ ] **Step 5: Write the profile module**

`src/lib/profile.ts`:
```ts
import type { Profile } from "@prisma/client";
import { prisma } from "./db";
import { profileSchema, ProfileInput } from "./validation/profile";

export async function getProfile(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(profile.bio) && profile.skills.length > 0 && Boolean(profile.roleType) && Boolean(profile.commitment);
}

export async function updateProfile(userId: string, input: ProfileInput) {
  const parsed = profileSchema.parse(input);
  return prisma.profile.update({ where: { userId }, data: parsed });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/profile.test.ts`
Expected: PASS (4 tests passed).

- [ ] **Step 7: Commit**

```bash
git add src/lib/validation/profile.ts src/lib/profile.ts src/lib/profile.test.ts package.json
git commit -m "feat: add profile data access, completeness check, and validation"
```

---

### Task 7: Session/profile guards

**Files:**
- Create: `src/lib/session.ts`
- Test: `src/lib/session.test.ts`

**Interfaces:**
- Consumes: `auth` from `@/lib/auth` (Task 5), `getProfile` and `isProfileComplete` from `@/lib/profile` (Task 6).
- Produces: `requireUserId(): Promise<string>` (redirects to `/api/auth/signin` if not signed in), `requireCompleteProfile(): Promise<string>` (redirects to `/profile/setup` if the profile is incomplete). Used by every protected page from Task 8 onward.

- [ ] **Step 1: Write the failing test**

`src/lib/session.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const authMock = vi.fn();
vi.mock("./auth", () => ({ auth: authMock }));

const getProfileMock = vi.fn();
const isProfileCompleteMock = vi.fn();
vi.mock("./profile", () => ({
  getProfile: getProfileMock,
  isProfileComplete: isProfileCompleteMock,
}));

import { requireUserId, requireCompleteProfile } from "./session";

beforeEach(() => {
  redirectMock.mockClear();
  authMock.mockReset();
  getProfileMock.mockReset();
  isProfileCompleteMock.mockReset();
});

describe("requireUserId", () => {
  it("returns the user id when signed in", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    await expect(requireUserId()).resolves.toBe("user-1");
  });

  it("redirects to sign-in when not signed in", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUserId()).rejects.toThrow("REDIRECT:/api/auth/signin");
  });
});

describe("requireCompleteProfile", () => {
  it("returns the user id when the profile is complete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    getProfileMock.mockResolvedValue({ bio: "hi" });
    isProfileCompleteMock.mockReturnValue(true);
    await expect(requireCompleteProfile()).resolves.toBe("user-1");
  });

  it("redirects to profile setup when the profile is incomplete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    getProfileMock.mockResolvedValue(null);
    isProfileCompleteMock.mockReturnValue(false);
    await expect(requireCompleteProfile()).rejects.toThrow("REDIRECT:/profile/setup");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/session.test.ts`
Expected: FAIL with "Cannot find module './session'" (or similar).

- [ ] **Step 3: Write the implementation**

`src/lib/session.ts`:
```ts
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getProfile, isProfileComplete } from "./profile";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }
  return session.user.id;
}

export async function requireCompleteProfile(): Promise<string> {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  if (!isProfileComplete(profile)) {
    redirect("/profile/setup");
  }
  return userId;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/session.test.ts`
Expected: PASS (4 tests passed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/session.ts src/lib/session.test.ts
git commit -m "feat: add session guards for signed-in and complete-profile routes"
```

---

### Task 8: Profile setup & edit UI

**Files:**
- Create: `src/app/actions/profile.ts`
- Create: `src/components/ProfileForm.tsx`
- Create: `src/app/profile/setup/page.tsx`
- Create: `src/app/profile/edit/page.tsx`

**Interfaces:**
- Consumes: `requireUserId`, `requireCompleteProfile` from `@/lib/session` (Task 7); `getProfile`, `updateProfile` from `@/lib/profile` (Task 6); `profileSchema` from `@/lib/validation/profile` (Task 6).
- Produces: `saveProfileAction(formData: FormData): Promise<void>` Server Action, `ProfileForm` client component with props `{ action: (formData: FormData) => void; initialProfile?: Profile | null }`.

- [ ] **Step 1: Write the Server Action**

`src/app/actions/profile.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { updateProfile } from "@/lib/profile";
import { profileSchema } from "@/lib/validation/profile";

export async function saveProfileAction(formData: FormData) {
  const userId = await requireUserId();

  const parsed = profileSchema.parse({
    bio: formData.get("bio") as string,
    skills: (formData.get("skills") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    roleType: formData.get("roleType") as string,
    commitment: formData.get("commitment") as string,
    hasIdea: formData.get("hasIdea") === "on",
    location: (formData.get("location") as string) || undefined,
    coFounderTraitsWanted: (formData.get("coFounderTraitsWanted") as string) || undefined,
    otherLinks: ((formData.get("otherLinks") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  await updateProfile(userId, parsed);
  redirect(`/profile/${userId}`);
}
```

- [ ] **Step 2: Write the form component**

`src/components/ProfileForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { Profile } from "@prisma/client";

const ROLE_TYPES = ["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"] as const;
const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

interface ProfileFormProps {
  action: (formData: FormData) => void;
  initialProfile?: Profile | null;
}

export function ProfileForm({ action, initialProfile }: ProfileFormProps) {
  const [skills, setSkills] = useState(initialProfile?.skills.join(", ") ?? "");
  const [otherLinks, setOtherLinks] = useState(initialProfile?.otherLinks.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className="flex flex-col gap-1">
        Bio
        <textarea name="bio" defaultValue={initialProfile?.bio ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Skills (comma separated)
        <input name="skills" value={skills} onChange={(e) => setSkills(e.target.value)} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Role
        <select name="roleType" defaultValue={initialProfile?.roleType ?? ""} required className="border p-2">
          <option value="" disabled>
            Select a role
          </option>
          {ROLE_TYPES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Commitment
        <select name="commitment" defaultValue={initialProfile?.commitment ?? ""} required className="border p-2">
          <option value="" disabled>
            Select commitment
          </option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="hasIdea" defaultChecked={initialProfile?.hasIdea ?? false} />
        I already have an idea
      </label>
      <label className="flex flex-col gap-1">
        Location
        <input name="location" defaultValue={initialProfile?.location ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        What I want in a co-founder
        <textarea name="coFounderTraitsWanted" defaultValue={initialProfile?.coFounderTraitsWanted ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Other links (comma separated URLs)
        <input name="otherLinks" value={otherLinks} onChange={(e) => setOtherLinks(e.target.value)} className="border p-2" />
      </label>
      <button type="submit" className="bg-black text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the setup and edit pages**

`src/app/profile/setup/page.tsx`:
```tsx
import { requireUserId } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

export default async function ProfileSetupPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Complete your profile</h1>
      <ProfileForm action={saveProfileAction} initialProfile={profile} />
    </main>
  );
}
```

`src/app/profile/edit/page.tsx`:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

export default async function ProfileEditPage() {
  const userId = await requireCompleteProfile();
  const profile = await getProfile(userId);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit your profile</h1>
      <ProfileForm action={saveProfileAction} initialProfile={profile} />
    </main>
  );
}
```

- [ ] **Step 4: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, sign in with LinkedIn.
Expected: new users land on `/profile/setup`; submitting the form with all required fields redirects to `/profile/<your-id>`; visiting `/profile/edit` afterward pre-fills the same data and saves changes.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/profile.ts src/components/ProfileForm.tsx src/app/profile/setup src/app/profile/edit
git commit -m "feat: add profile setup and edit UI"
```

---

### Task 9: Public profile view page

**Files:**
- Create: `src/app/profile/[userId]/page.tsx`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`, `getProfile` from `@/lib/profile`.
- Produces: a read-only page at `/profile/[userId]`, reachable by any signed-in or signed-out visitor with a direct link, `notFound()` if the user or profile doesn't exist.

- [ ] **Step 1: Write the page**

`src/app/profile/[userId]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/profile";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      {profile.location && <p>{profile.location}</p>}
      <p>{profile.bio}</p>
      <p>Skills: {profile.skills.join(", ")}</p>
      <p>Role: {profile.roleType}</p>
      <p>Commitment: {profile.commitment}</p>
      {profile.coFounderTraitsWanted && <p>Looking for: {profile.coFounderTraitsWanted}</p>}
      {profile.linkedinUrl && (
        <a href={profile.linkedinUrl} className="underline">
          LinkedIn
        </a>
      )}
      <ul>
        {profile.otherLinks.map((link) => (
          <li key={link}>
            <a href={link} className="underline">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run db:seed`, then `npm run dev`.
Visit `/profile/<ada's id>` (from the seed script's console output) while signed out.
Expected: Ada's bio, skills, role, commitment, and links render correctly. Visiting `/profile/does-not-exist` returns a 404 page.

- [ ] **Step 4: Commit**

```bash
git add src/app/profile/[userId]
git commit -m "feat: add public read-only profile page"
```

---

### Task 10: Project data access & validation

**Files:**
- Create: `src/lib/validation/project.ts`
- Create: `src/lib/project.ts`
- Test: `src/lib/project.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`, `resetDb` from `@/test/db-helpers`.
- Produces: `projectSchema` (Zod) and type `ProjectInput` from `@/lib/validation/project`. `getProject(userId: string): Promise<Project | null>`, `getProjectById(projectId: string): Promise<(Project & { owner: User }) | null>`, `createProject(userId: string, input: ProjectInput): Promise<Project>` (throws if the user already has a project), `updateProject(userId: string, input: ProjectInput): Promise<Project>`, `deleteProject(userId: string): Promise<void>` from `@/lib/project`. Used by Task 11 (UI) and Task 12 (public view).

- [ ] **Step 1: Write the failing test**

`src/lib/project.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { getProject, getProjectById, createProject, updateProject, deleteProject } from "./project";

beforeEach(async () => {
  await resetDb();
});

async function createTestUser(linkedinId: string) {
  return prisma.user.create({
    data: { linkedinId, email: `${linkedinId}@example.com`, name: "Test User", profile: { create: {} } },
  });
}

const validInput = {
  name: "Loomly",
  tagline: "AI scheduling for freelancers",
  description: "Auto-books client calls.",
  industry: "Productivity",
  rolesNeeded: ["Business co-founder"],
  equityOffered: "15-25%",
  commitmentExpected: "FULL_TIME" as const,
  websiteUrl: "",
  deckUrl: "",
  demoUrl: "",
};

describe("createProject", () => {
  it("creates a project for a user with none", async () => {
    const user = await createTestUser("li-1");
    const project = await createProject(user.id, validInput);
    expect(project.name).toBe("Loomly");
    expect(project.ownerId).toBe(user.id);
  });

  it("rejects creating a second project for the same user", async () => {
    const user = await createTestUser("li-1");
    await createProject(user.id, validInput);
    await expect(createProject(user.id, validInput)).rejects.toThrow(
      "You already have an active project"
    );
  });
});

describe("updateProject and deleteProject", () => {
  it("updates an existing project", async () => {
    const user = await createTestUser("li-1");
    await createProject(user.id, validInput);
    const updated = await updateProject(user.id, { ...validInput, name: "Loomly 2.0" });
    expect(updated.name).toBe("Loomly 2.0");
  });

  it("deletes a project so the owner can create a new one", async () => {
    const user = await createTestUser("li-1");
    await createProject(user.id, validInput);
    await deleteProject(user.id);
    expect(await getProject(user.id)).toBeNull();
    await expect(createProject(user.id, validInput)).resolves.toMatchObject({ name: "Loomly" });
  });
});

describe("getProjectById", () => {
  it("includes the owner", async () => {
    const user = await createTestUser("li-1");
    const project = await createProject(user.id, validInput);
    const found = await getProjectById(project.id);
    expect(found?.owner.id).toBe(user.id);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/project.test.ts`
Expected: FAIL with "Cannot find module './project'" (or similar).

- [ ] **Step 3: Write the validation schema**

`src/lib/validation/project.ts`:
```ts
import { z } from "zod";

const optionalUrl = z
  .string()
  .url()
  .optional()
  .or(z.literal(""));

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  industry: z.string().optional(),
  rolesNeeded: z.array(z.string()).default([]),
  equityOffered: z.string().optional(),
  commitmentExpected: z.enum(["FULL_TIME", "PART_TIME"]).optional(),
  websiteUrl: optionalUrl,
  deckUrl: optionalUrl,
  demoUrl: optionalUrl,
});

export type ProjectInput = z.infer<typeof projectSchema>;
```

- [ ] **Step 4: Write the project module**

`src/lib/project.ts`:
```ts
import { prisma } from "./db";
import { projectSchema, ProjectInput } from "./validation/project";

export async function getProject(userId: string) {
  return prisma.project.findUnique({ where: { ownerId: userId } });
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId }, include: { owner: true } });
}

export async function createProject(userId: string, input: ProjectInput) {
  const existing = await getProject(userId);
  if (existing) {
    throw new Error("You already have an active project. Edit it instead of creating a new one.");
  }
  const parsed = projectSchema.parse(input);
  return prisma.project.create({ data: { ...parsed, ownerId: userId } });
}

export async function updateProject(userId: string, input: ProjectInput) {
  const parsed = projectSchema.parse(input);
  return prisma.project.update({ where: { ownerId: userId }, data: parsed });
}

export async function deleteProject(userId: string) {
  await prisma.project.delete({ where: { ownerId: userId } });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/project.test.ts`
Expected: PASS (5 tests passed).

- [ ] **Step 6: Commit**

```bash
git add src/lib/validation/project.ts src/lib/project.ts src/lib/project.test.ts
git commit -m "feat: add project data access, one-project-per-user rule, and validation"
```

---

### Task 11: Project create/edit UI

**Files:**
- Create: `src/app/actions/project.ts`
- Create: `src/components/ProjectForm.tsx`
- Create: `src/app/project/edit/page.tsx`

**Interfaces:**
- Consumes: `requireCompleteProfile` from `@/lib/session` (Task 7); `getProject`, `createProject`, `updateProject`, `deleteProject` from `@/lib/project` (Task 10); `projectSchema` from `@/lib/validation/project` (Task 10).
- Produces: `saveProjectAction(formData: FormData): Promise<void>`, `deleteProjectAction(): Promise<void>` Server Actions. `ProjectForm` client component with props `{ action: (formData: FormData) => void; initialProject?: Project | null }`.

- [ ] **Step 1: Write the Server Actions**

`src/app/actions/project.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { createProject, updateProject, deleteProject, getProject } from "@/lib/project";
import { projectSchema } from "@/lib/validation/project";

function parseProjectForm(formData: FormData) {
  return projectSchema.parse({
    name: formData.get("name") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    industry: (formData.get("industry") as string) || undefined,
    rolesNeeded: ((formData.get("rolesNeeded") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    equityOffered: (formData.get("equityOffered") as string) || undefined,
    commitmentExpected: (formData.get("commitmentExpected") as string) || undefined,
    websiteUrl: (formData.get("websiteUrl") as string) || "",
    deckUrl: (formData.get("deckUrl") as string) || "",
    demoUrl: (formData.get("demoUrl") as string) || "",
  });
}

export async function saveProjectAction(formData: FormData) {
  const userId = await requireCompleteProfile();
  const input = parseProjectForm(formData);
  const existing = await getProject(userId);

  if (existing) {
    await updateProject(userId, input);
  } else {
    await createProject(userId, input);
  }

  redirect("/project/edit");
}

export async function deleteProjectAction() {
  const userId = await requireCompleteProfile();
  await deleteProject(userId);
  redirect("/project/edit");
}
```

- [ ] **Step 2: Write the form component**

`src/components/ProjectForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";

const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

interface ProjectFormProps {
  action: (formData: FormData) => void;
  initialProject?: Project | null;
}

export function ProjectForm({ action, initialProject }: ProjectFormProps) {
  const [rolesNeeded, setRolesNeeded] = useState(initialProject?.rolesNeeded.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className="flex flex-col gap-1">
        Name
        <input name="name" defaultValue={initialProject?.name ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Tagline
        <input name="tagline" defaultValue={initialProject?.tagline ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Description
        <textarea name="description" defaultValue={initialProject?.description ?? ""} required className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Industry
        <input name="industry" defaultValue={initialProject?.industry ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Roles needed (comma separated)
        <input
          name="rolesNeeded"
          value={rolesNeeded}
          onChange={(e) => setRolesNeeded(e.target.value)}
          className="border p-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Equity offered
        <input name="equityOffered" defaultValue={initialProject?.equityOffered ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Commitment expected
        <select name="commitmentExpected" defaultValue={initialProject?.commitmentExpected ?? ""} className="border p-2">
          <option value="">Not specified</option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Website URL
        <input name="websiteUrl" defaultValue={initialProject?.websiteUrl ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Deck URL
        <input name="deckUrl" defaultValue={initialProject?.deckUrl ?? ""} className="border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Demo URL
        <input name="demoUrl" defaultValue={initialProject?.demoUrl ?? ""} className="border p-2" />
      </label>
      <button type="submit" className="bg-black text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the edit/create page**

`src/app/project/edit/page.tsx`:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { getProject } from "@/lib/project";
import { ProjectForm } from "@/components/ProjectForm";
import { saveProjectAction, deleteProjectAction } from "@/app/actions/project";

export default async function ProjectEditPage() {
  const userId = await requireCompleteProfile();
  const project = await getProject(userId);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{project ? "Edit your project" : "Create your project"}</h1>
      <ProjectForm action={saveProjectAction} initialProject={project} />
      {project && (
        <form action={deleteProjectAction} className="mt-4">
          <button type="submit" className="text-red-600 underline">
            Delete project
          </button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, sign in, complete your profile, visit `/project/edit`.
Expected: form is empty and titled "Create your project"; after saving, revisiting `/project/edit` shows "Edit your project" pre-filled with the saved data; clicking "Delete project" clears it back to the create form.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/project.ts src/components/ProjectForm.tsx src/app/project/edit
git commit -m "feat: add project create/edit UI"
```

---

### Task 12: Public project view page + home dashboard

**Files:**
- Create: `src/app/project/[projectId]/page.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getProjectById` from `@/lib/project` (Task 10); `auth`, `signIn`, `signOut` from `@/lib/auth` (Task 5).
- Produces: a read-only page at `/project/[projectId]`; an updated home page showing sign-in/out and links to the current user's own profile and project.

- [ ] **Step 1: Write the public project page**

`src/app/project/[projectId]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/project";

export default async function PublicProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="italic">{project.tagline}</p>
      <p>{project.description}</p>
      {project.industry && <p>Industry: {project.industry}</p>}
      <p>Roles needed: {project.rolesNeeded.join(", ")}</p>
      {project.equityOffered && <p>Equity offered: {project.equityOffered}</p>}
      {project.commitmentExpected && <p>Commitment: {project.commitmentExpected}</p>}
      <p>
        Founded by{" "}
        <a href={`/profile/${project.owner.id}`} className="underline">
          {project.owner.name}
        </a>
      </p>
      <ul>
        {project.websiteUrl && (
          <li>
            <a href={project.websiteUrl} className="underline">
              Website
            </a>
          </li>
        )}
        {project.deckUrl && (
          <li>
            <a href={project.deckUrl} className="underline">
              Deck
            </a>
          </li>
        )}
        {project.demoUrl && (
          <li>
            <a href={project.demoUrl} className="underline">
              Demo
            </a>
          </li>
        )}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Update the home page**

`src/app/page.tsx`:
```tsx
import { auth, signIn, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">co-founder.fit</h1>
      {session?.user ? (
        <div className="flex flex-col gap-2 mt-4 items-start">
          <p>Signed in as {session.user.name}</p>
          <a href={`/profile/${session.user.id}`} className="underline">
            My profile
          </a>
          <a href="/profile/edit" className="underline">
            Edit profile
          </a>
          <a href="/project/edit" className="underline">
            My project
          </a>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("linkedin");
          }}
          className="mt-4"
        >
          <button type="submit" className="bg-black text-white p-2 rounded">
            Sign in with LinkedIn
          </button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run db:seed`, then `npm run dev`.
Visit `/project/<loomly's id>` (from the seed script's console output) while signed out.
Expected: Loomly's tagline, description, roles needed, and a link to Ada's profile render correctly; `/project/does-not-exist` returns a 404. Signed out, the home page shows a "Sign in with LinkedIn" button; signed in, it shows links to your own profile and project plus a working sign-out button.

- [ ] **Step 5: Commit**

```bash
git add src/app/project/[projectId] src/app/page.tsx
git commit -m "feat: add public project page and home dashboard"
```

---

### Task 13: End-to-end verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: the full app from Tasks 1-12.
- Produces: confirmation that the foundation spec's manual verification checklist passes.

- [ ] **Step 1: Reset to a clean environment**

Run: `docker compose down -v && docker compose up -d`
Run: `docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE cofounderfit_test;"`
Run: `npx prisma migrate deploy`
Run: `npx dotenv -e .env.test -- npx prisma db push`
Run: `npm run db:seed`

- [ ] **Step 2: Run the full automated test suite**

Run: `npx dotenv -e .env.test -- npm test`
Expected: all test files pass (sanity, onboarding, profile, session, project).

- [ ] **Step 3: Run a full production build**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Walk the manual checklist from the spec**

Run: `npm run dev` and, in a browser:

1. Sign in with LinkedIn as a real account → land on `/profile/setup` (first-time user).
2. Submit the setup form missing a required field (e.g. no skills) → inline validation blocks submission.
3. Complete the setup form → redirected to `/profile/<your-id>`, all fields render.
4. Visit `/profile/edit`, change your bio, save → change reflected on `/profile/<your-id>`.
5. Visit `/project/edit` → "Create your project" form; submit it → redirected back to `/project/edit`, now "Edit your project", pre-filled.
6. Visit `/project/<your-project-id>` → all fields render, including a working link back to your profile.
7. In a second browser (or incognito window), visit `/profile/<ada's seeded id>` and `/project/<loomly's seeded id>` while signed out → both render read-only with no edit controls.
8. Sign out from the home page → home page reverts to the "Sign in with LinkedIn" button.
9. Sign back in with the same LinkedIn account → no duplicate user created (confirm via `docker compose exec -T postgres psql -U postgres -d cofounderfit -c "SELECT COUNT(*) FROM \"User\";"`), and you land straight on your own profile rather than `/profile/setup` again.

Expected: every step behaves as described above with no errors in the terminal or browser console.

- [ ] **Step 5: Record completion**

No commit — this task only verifies Tasks 1-12. If any check fails, fix the underlying task and re-run this checklist before considering the foundation spec complete.
