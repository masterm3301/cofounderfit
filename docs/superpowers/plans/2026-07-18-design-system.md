# Design System & Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a consistent design system (indigo accent, gray neutrals, Inter type, a shared `Nav`/`Button`/`Card`) and apply it across every existing page, and turn the home page into a real landing page with live stats, featured projects, a "how it works" explainer, and static testimonial content.

**Architecture:** Three new presentational components (`Nav`, `Button`/`LinkButton`, `Card`) carry the design system; every existing page is restyled in place to use them, with no behavior changes to guards, data fetching, or Server Actions. Two new read-only data-access functions (`getHomeStats` in a new `src/lib/stats.ts`, `getFeaturedProjects` in the existing `src/lib/project.ts`) back the new home page content. No new npm dependencies — the Inter font comes from `next/font/google`, which ships with Next.js itself.

**Tech Stack:** Same as before: Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma + Postgres (Neon), Vitest.

## Global Constraints

- **indigo-600** is the single accent color (buttons, links, active states); everything else uses Tailwind's default gray scale. No other colors are introduced.
- Every page's `<main>` uses `max-w-5xl mx-auto px-4 sm:px-6 py-8` (the home page uses `py-12` given its section-heavy layout), replacing the old ad-hoc `p-8`.
- `Nav` is rendered exactly once, in the root layout — no individual page renders its own navigation links anymore (the old home page's `Discover Profiles`/`Discover Projects`/`My profile`/`Edit profile`/`My project`/`Sign out` links move into `Nav` and are removed from the home page).
- No new npm dependencies.
- No behavior changes to any existing guard, Server Action, or data-fetching call — every restyled page keeps its exact existing logic; only markup and `className`s change, except the home page, which gains new read-only data fetching (`getHomeStats`, `getFeaturedProjects`).

---

### Task 1: Design tokens, Button, and Card

**Files:**
- Modify: `tailwind.config.ts`
- Create: `src/components/Button.tsx`
- Create: `src/components/Card.tsx`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: Tailwind's `font-sans` utility resolving to the Inter variable font; `Button` and `LinkButton` components (`{ variant?: "primary" | "secondary"; size?: "sm" | "md" }` plus native `<button>`/`<a>` props) from `@/components/Button`; `Card` component (native `<div>` props) from `@/components/Card`. Used by every later task in this plan.

- [ ] **Step 1: Add the Inter font family to the Tailwind config**

Replace `tailwind.config.ts` with:
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Write the Button component**

`src/components/Button.tsx`:
```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className: string) {
  return `inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button {...props} className={buttonClasses(variant, size, className)} />;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function LinkButton({ variant = "primary", size = "md", className = "", ...props }: LinkButtonProps) {
  return <a {...props} className={buttonClasses(variant, size, className)} />;
}
```

- [ ] **Step 3: Write the Card component**

`src/components/Card.tsx`:
```tsx
import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`} />;
}
```

- [ ] **Step 4: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors. (Neither component is imported anywhere yet, so this just confirms they compile.)

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/components/Button.tsx src/components/Card.tsx
git commit -m "feat: add design tokens, Button, and Card components"
```

---

### Task 2: Nav component and root layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/Button` (Task 1); `auth`, `signIn`, `signOut` from `@/lib/auth` (existing).
- Produces: a `Nav` Server Component rendered once in the root layout, appearing on every page; the Inter font wired up via `next/font/google` and applied through `font-sans`.

- [ ] **Step 1: Write the Nav component**

`src/components/Nav.tsx`:
```tsx
import { auth, signIn, signOut } from "@/lib/auth";
import { Button } from "@/components/Button";

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-lg font-bold tracking-tight text-gray-900">
          co-founder<span className="text-indigo-600">.fit</span>
        </a>
        {session?.user ? (
          <nav className="flex items-center gap-4 text-sm text-gray-700">
            <a href="/discover/profiles" className="hover:text-gray-900">
              Discover Profiles
            </a>
            <a href="/discover/projects" className="hover:text-gray-900">
              Discover Projects
            </a>
            <a href="/matches" className="hover:text-gray-900">
              My Matches
            </a>
            <a href={`/profile/${session.user.id}`} className="hover:text-gray-900">
              My Profile
            </a>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("linkedin");
            }}
          >
            <Button type="submit" size="sm">
              Sign in with LinkedIn
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Wire the font and Nav into the root layout**

Replace `src/app/layout.tsx` with:
```tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "co-founder.fit",
  description: "Match with a co-founder or a project to join.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-gray-900">
        <Nav />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`. Visit `/` while signed out.
Expected: the top nav shows the "co-founder.fit" wordmark and a "Sign in with LinkedIn" button; visiting any other existing page (e.g. `/discover/projects`) shows the same nav bar at the top.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/components/Nav.tsx
git commit -m "feat: add Nav component and wire it into the root layout"
```

---

### Task 3: Restyle ProfileCard and ProjectCard

**Files:**
- Modify: `src/components/ProfileCard.tsx`
- Modify: `src/components/ProjectCard.tsx`

**Interfaces:**
- Consumes: `Card` from `@/components/Card` (Task 1); `Button` from `@/components/Button` (Task 1).
- Produces: no prop or behavior changes — same props, same Server Action wiring, same hidden inputs — purely visual.

- [ ] **Step 1: Restyle ProfileCard**

Replace `src/components/ProfileCard.tsx` with:
```tsx
import type { Profile, User, ReactionStatus } from "@prisma/client";
import { reactToProfileAction } from "@/app/actions/reaction";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface ProfileCardProps {
  profile: Profile & { user: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

export function ProfileCard({ profile, viewerId, currentPage }: ProfileCardProps) {
  const bioSnippet =
    profile.bio && profile.bio.length > 140 ? `${profile.bio.slice(0, 140)}…` : profile.bio;
  const isOwnCard = viewerId === profile.userId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <a href={`/profile/${profile.userId}`} className="block">
        {profile.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={profile.user.name}
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
        )}
        <h2 className="font-bold text-gray-900">{profile.user.name}</h2>
        {profile.location && <p className="text-sm text-gray-500">{profile.location}</p>}
        {bioSnippet && <p className="text-sm mt-1 text-gray-700">{bioSnippet}</p>}
        <p className="text-sm mt-1 text-gray-500">
          {profile.roleType} · {profile.commitment}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {profile.skills.map((skill) => (
            <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      </a>
      {!isOwnCard && (
        <div className="flex gap-2 mt-3">
          <form action={reactToProfileAction.bind(null, "LIKE")}>
            <input type="hidden" name="toUserId" value={profile.userId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={profile.viewerReaction === "LIKE" ? "primary" : "secondary"}>
              Like
            </Button>
          </form>
          <form action={reactToProfileAction.bind(null, "PASS")}>
            <input type="hidden" name="toUserId" value={profile.userId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={profile.viewerReaction === "PASS" ? "primary" : "secondary"}>
              Pass
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Restyle ProjectCard**

Replace `src/components/ProjectCard.tsx` with:
```tsx
import type { Project, User, ReactionStatus } from "@prisma/client";
import { reactToProjectAction } from "@/app/actions/reaction";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface ProjectCardProps {
  project: Project & { owner: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

export function ProjectCard({ project, viewerId, currentPage }: ProjectCardProps) {
  const isOwnCard = viewerId === project.ownerId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <a href={`/project/${project.id}`} className="block">
        <h2 className="font-bold text-gray-900">{project.name}</h2>
        <p className="text-sm italic text-gray-500">{project.tagline}</p>
        {project.industry && <p className="text-sm text-gray-500">{project.industry}</p>}
        {project.rolesNeeded.length > 0 && (
          <p className="text-sm mt-1 text-gray-700">Roles needed: {project.rolesNeeded.join(", ")}</p>
        )}
        {project.commitmentExpected && <p className="text-sm text-gray-700">{project.commitmentExpected}</p>}
        <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
      </a>
      {!isOwnCard && (
        <div className="flex gap-2 mt-3">
          <form action={reactToProjectAction.bind(null, "LIKE")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={project.viewerReaction === "LIKE" ? "primary" : "secondary"}>
              Like
            </Button>
          </form>
          <form action={reactToProjectAction.bind(null, "PASS")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={project.viewerReaction === "PASS" ? "primary" : "secondary"}>
              Pass
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProfileCard.tsx src/components/ProjectCard.tsx
git commit -m "style: restyle ProfileCard and ProjectCard with Card and Button"
```

---

### Task 4: Restyle ProfileForm and ProjectForm

**Files:**
- Modify: `src/components/ProfileForm.tsx`
- Modify: `src/components/ProjectForm.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/Button` (Task 1).
- Produces: no prop or behavior changes — purely visual.

- [ ] **Step 1: Restyle ProfileForm**

Replace `src/components/ProfileForm.tsx` with:
```tsx
"use client";

import { useState } from "react";
import type { Profile } from "@prisma/client";
import { Button } from "@/components/Button";

const ROLE_TYPES = ["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"] as const;
const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

const INPUT_CLASSES =
  "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const LABEL_CLASSES = "flex flex-col gap-1 text-sm font-medium text-gray-700";

interface ProfileFormProps {
  action: (formData: FormData) => void;
  initialProfile?: Profile | null;
}

export function ProfileForm({ action, initialProfile }: ProfileFormProps) {
  const [skills, setSkills] = useState(initialProfile?.skills.join(", ") ?? "");
  const [otherLinks, setOtherLinks] = useState(initialProfile?.otherLinks.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className={LABEL_CLASSES}>
        Bio
        <textarea name="bio" defaultValue={initialProfile?.bio ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Skills (comma separated)
        <input
          name="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Role
        <select name="roleType" defaultValue={initialProfile?.roleType ?? ""} required className={INPUT_CLASSES}>
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
      <label className={LABEL_CLASSES}>
        Commitment
        <select name="commitment" defaultValue={initialProfile?.commitment ?? ""} required className={INPUT_CLASSES}>
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
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="hasIdea" defaultChecked={initialProfile?.hasIdea ?? false} />
        I already have an idea
      </label>
      <label className={LABEL_CLASSES}>
        Location
        <input name="location" defaultValue={initialProfile?.location ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        What I want in a co-founder
        <textarea
          name="coFounderTraitsWanted"
          defaultValue={initialProfile?.coFounderTraitsWanted ?? ""}
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Other links (comma separated URLs)
        <input
          name="otherLinks"
          value={otherLinks}
          onChange={(e) => setOtherLinks(e.target.value)}
          className={INPUT_CLASSES}
        />
      </label>
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Restyle ProjectForm**

Replace `src/components/ProjectForm.tsx` with:
```tsx
"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";
import { Button } from "@/components/Button";

const COMMITMENTS = ["FULL_TIME", "PART_TIME"] as const;

const INPUT_CLASSES =
  "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
const LABEL_CLASSES = "flex flex-col gap-1 text-sm font-medium text-gray-700";

interface ProjectFormProps {
  action: (formData: FormData) => void;
  initialProject?: Project | null;
}

export function ProjectForm({ action, initialProject }: ProjectFormProps) {
  const [rolesNeeded, setRolesNeeded] = useState(initialProject?.rolesNeeded.join(", ") ?? "");

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <label className={LABEL_CLASSES}>
        Name
        <input name="name" defaultValue={initialProject?.name ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Tagline
        <input name="tagline" defaultValue={initialProject?.tagline ?? ""} required className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Description
        <textarea
          name="description"
          defaultValue={initialProject?.description ?? ""}
          required
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Industry
        <input name="industry" defaultValue={initialProject?.industry ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Roles needed (comma separated)
        <input
          name="rolesNeeded"
          value={rolesNeeded}
          onChange={(e) => setRolesNeeded(e.target.value)}
          className={INPUT_CLASSES}
        />
      </label>
      <label className={LABEL_CLASSES}>
        Equity offered
        <input name="equityOffered" defaultValue={initialProject?.equityOffered ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Commitment expected
        <select
          name="commitmentExpected"
          defaultValue={initialProject?.commitmentExpected ?? ""}
          className={INPUT_CLASSES}
        >
          <option value="">Not specified</option>
          {COMMITMENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className={LABEL_CLASSES}>
        Website URL
        <input name="websiteUrl" defaultValue={initialProject?.websiteUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Deck URL
        <input name="deckUrl" defaultValue={initialProject?.deckUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <label className={LABEL_CLASSES}>
        Demo URL
        <input name="demoUrl" defaultValue={initialProject?.demoUrl ?? ""} className={INPUT_CLASSES} />
      </label>
      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProfileForm.tsx src/components/ProjectForm.tsx
git commit -m "style: restyle ProfileForm and ProjectForm inputs and submit button"
```

---

### Task 5: Restyle profile pages

**Files:**
- Modify: `src/app/profile/setup/page.tsx`
- Modify: `src/app/profile/edit/page.tsx`
- Modify: `src/app/profile/[userId]/page.tsx`

**Interfaces:**
- Consumes: `Card` from `@/components/Card` (Task 1).
- Produces: no behavior changes — same guards, same data fetching — purely visual.

- [ ] **Step 1: Restyle the profile setup page**

Replace `src/app/profile/setup/page.tsx` with:
```tsx
import { requireUserId } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

export default async function ProfileSetupPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Complete your profile</h1>
      <ProfileForm action={saveProfileAction} initialProfile={profile} />
    </main>
  );
}
```

- [ ] **Step 2: Restyle the profile edit page**

Replace `src/app/profile/edit/page.tsx` with:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

export default async function ProfileEditPage() {
  const userId = await requireCompleteProfile();
  const profile = await getProfile(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Edit your profile</h1>
      <ProfileForm action={saveProfileAction} initialProfile={profile} />
    </main>
  );
}
```

- [ ] **Step 3: Restyle the public profile view page**

Replace `src/app/profile/[userId]/page.tsx` with:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/profile";
import { Card } from "@/components/Card";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>
        {profile.location && <p className="text-sm text-gray-500 mt-1">{profile.location}</p>}
        <p className="mt-3 text-gray-700">{profile.bio}</p>
        <p className="text-sm text-gray-500 mt-2">Skills: {profile.skills.join(", ")}</p>
        <p className="text-sm text-gray-500">Role: {profile.roleType}</p>
        <p className="text-sm text-gray-500">Commitment: {profile.commitment}</p>
        {profile.coFounderTraitsWanted && (
          <p className="mt-2 text-gray-700">Looking for: {profile.coFounderTraitsWanted}</p>
        )}
        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} className="text-indigo-600 hover:underline block mt-2">
            LinkedIn
          </a>
        )}
        <ul className="mt-1">
          {profile.otherLinks.map((link) => (
            <li key={link}>
              <a href={link} className="text-indigo-600 hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/profile/setup/page.tsx src/app/profile/edit/page.tsx "src/app/profile/[userId]/page.tsx"
git commit -m "style: restyle profile setup, edit, and view pages"
```

---

### Task 6: Restyle project pages

**Files:**
- Modify: `src/app/project/edit/page.tsx`
- Modify: `src/app/project/[projectId]/page.tsx`

**Interfaces:**
- Consumes: `Card` from `@/components/Card` (Task 1).
- Produces: no behavior changes — purely visual.

- [ ] **Step 1: Restyle the project create/edit page**

Replace `src/app/project/edit/page.tsx` with:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { getProject } from "@/lib/project";
import { ProjectForm } from "@/components/ProjectForm";
import { saveProjectAction, deleteProjectAction } from "@/app/actions/project";

export default async function ProjectEditPage() {
  const userId = await requireCompleteProfile();
  const project = await getProject(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        {project ? "Edit your project" : "Create your project"}
      </h1>
      <ProjectForm action={saveProjectAction} initialProject={project} />
      {project && (
        <form action={deleteProjectAction} className="mt-4">
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete project
          </button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Restyle the public project view page**

Replace `src/app/project/[projectId]/page.tsx` with:
```tsx
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/project";
import { Card } from "@/components/Card";

export default async function PublicProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.name}</h1>
        <p className="italic text-gray-500 mt-1">{project.tagline}</p>
        <p className="mt-3 text-gray-700">{project.description}</p>
        {project.industry && <p className="text-sm text-gray-500 mt-2">Industry: {project.industry}</p>}
        <p className="text-sm text-gray-500">Roles needed: {project.rolesNeeded.join(", ")}</p>
        {project.equityOffered && <p className="text-sm text-gray-500">Equity offered: {project.equityOffered}</p>}
        {project.commitmentExpected && <p className="text-sm text-gray-500">Commitment: {project.commitmentExpected}</p>}
        <p className="mt-2 text-gray-700">
          Founded by{" "}
          <a href={`/profile/${project.owner.id}`} className="text-indigo-600 hover:underline">
            {project.owner.name}
          </a>
        </p>
        <ul className="mt-2">
          {project.websiteUrl && (
            <li>
              <a href={project.websiteUrl} className="text-indigo-600 hover:underline">
                Website
              </a>
            </li>
          )}
          {project.deckUrl && (
            <li>
              <a href={project.deckUrl} className="text-indigo-600 hover:underline">
                Deck
              </a>
            </li>
          )}
          {project.demoUrl && (
            <li>
              <a href={project.demoUrl} className="text-indigo-600 hover:underline">
                Demo
              </a>
            </li>
          )}
        </ul>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/project/edit/page.tsx "src/app/project/[projectId]/page.tsx"
git commit -m "style: restyle project create/edit and view pages"
```

---

### Task 7: Restyle Discover pages

**Files:**
- Modify: `src/app/discover/profiles/page.tsx`
- Modify: `src/app/discover/projects/page.tsx`

**Interfaces:**
- Consumes: `LinkButton` from `@/components/Button` (Task 1).
- Produces: no behavior changes — same guards, same pagination logic — purely visual.

- [ ] **Step 1: Restyle the Discover Profiles page**

Replace `src/app/discover/profiles/page.tsx` with:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { listProfiles } from "@/lib/profile";
import { clampPage } from "@/lib/pagination";
import { ProfileCard } from "@/components/ProfileCard";
import { LinkButton } from "@/components/Button";

export default async function DiscoverProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const viewerId = await requireCompleteProfile();

  const { page } = await searchParams;
  const { profiles, totalPages } = await listProfiles(Number(page), viewerId);
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Discover Profiles</h1>
      {profiles.length === 0 ? (
        <p className="text-gray-500">No profiles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} viewerId={viewerId} currentPage={currentPage} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <LinkButton href={`/discover/profiles?page=${currentPage - 1}`} variant="secondary" size="sm">
            Prev
          </LinkButton>
        )}
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <LinkButton href={`/discover/profiles?page=${currentPage + 1}`} variant="secondary" size="sm">
            Next
          </LinkButton>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Restyle the Discover Projects page**

Replace `src/app/discover/projects/page.tsx` with:
```tsx
import { auth } from "@/lib/auth";
import { listProjects } from "@/lib/project";
import { clampPage } from "@/lib/pagination";
import { ProjectCard } from "@/components/ProjectCard";
import { LinkButton } from "@/components/Button";

export default async function DiscoverProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const { page } = await searchParams;
  const { projects, totalPages } = await listProjects(Number(page), viewerId);
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Discover Projects</h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} viewerId={viewerId} currentPage={currentPage} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <LinkButton href={`/discover/projects?page=${currentPage - 1}`} variant="secondary" size="sm">
            Prev
          </LinkButton>
        )}
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <LinkButton href={`/discover/projects?page=${currentPage + 1}`} variant="secondary" size="sm">
            Next
          </LinkButton>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/discover/profiles/page.tsx src/app/discover/projects/page.tsx
git commit -m "style: restyle Discover Profiles and Discover Projects pages"
```

---

### Task 8: Restyle Matches pages and the auth error page

**Files:**
- Modify: `src/app/matches/page.tsx`
- Modify: `src/app/matches/new/page.tsx`
- Modify: `src/app/auth/error/page.tsx`

**Interfaces:**
- Consumes: `Card`, `LinkButton` from `@/components/Card` and `@/components/Button` (Task 1).
- Produces: no behavior changes — purely visual. Note: `src/app/auth/error/page.tsx` currently uses `next/link`'s `Link`; this task switches it to `LinkButton` (a plain `<a>`), matching every other page in the app, none of which use `next/link`.

- [ ] **Step 1: Restyle the My Matches page**

Replace `src/app/matches/page.tsx` with:
```tsx
import { requireCompleteProfile } from "@/lib/session";
import { getMatches } from "@/lib/reaction";
import { Card } from "@/components/Card";

export default async function MatchesPage() {
  const userId = await requireCompleteProfile();
  const matches = await getMatches(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Your Matches</h1>
      {matches.length === 0 ? (
        <p className="text-gray-500">No matches yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <Card key={match.matchId}>
              <p className="font-bold text-gray-900">{match.otherUser.name}</p>
              <a href={`/profile/${match.otherUser.id}`} className="text-indigo-600 hover:underline text-sm">
                View profile
              </a>
              {match.otherUser.project && (
                <>
                  {" "}
                  ·{" "}
                  <a
                    href={`/project/${match.otherUser.project.id}`}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    View project
                  </a>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Restyle the match confirmation page**

Replace `src/app/matches/new/page.tsx` with:
```tsx
import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { isMatch } from "@/lib/reaction";
import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { LinkButton } from "@/components/Button";

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const userId = await requireCompleteProfile();
  const { with: otherUserId } = await searchParams;

  if (!otherUserId || !(await isMatch(userId, otherUserId))) {
    redirect("/matches");
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    redirect("/matches");
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg text-center">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-600">It&apos;s a match!</h1>
        <p className="mt-2 text-gray-700">You and {otherUser.name} liked each other.</p>
        <div className="flex justify-center gap-4 mt-4">
          <LinkButton href={`/profile/${otherUser.id}`}>View {otherUser.name}&apos;s profile</LinkButton>
          <LinkButton href="/matches" variant="secondary">
            See all matches
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Restyle the auth error page**

Replace `src/app/auth/error/page.tsx` with:
```tsx
import { LinkButton } from "@/components/Button";

export default function AuthErrorPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Sign-in failed</h1>
      <p className="text-gray-500 mt-2">We couldn&apos;t sign you in with LinkedIn. Please try again.</p>
      <LinkButton href="/api/auth/signin" className="mt-4">
        Try again
      </LinkButton>
    </main>
  );
}
```

- [ ] **Step 4: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/matches/page.tsx src/app/matches/new/page.tsx src/app/auth/error/page.tsx
git commit -m "style: restyle Matches, match confirmation, and auth error pages"
```

---

### Task 9: Home page data layer (stats and featured projects)

**Files:**
- Modify: `src/lib/profile.ts`
- Create: `src/lib/stats.ts`
- Test: `src/lib/stats.test.ts`
- Modify: `src/lib/project.ts`
- Modify: `src/lib/project.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`; `resetDb` from `@/test/db-helpers`.
- Produces: `getHomeStats(): Promise<{ profileCount: number; projectCount: number; matchCount: number }>` from `@/lib/stats`; `getFeaturedProjects(): Promise<(Project & { owner: User })[]>` from `@/lib/project`. Used by Task 10 (home page).

- [ ] **Step 1: Export the existing complete-profile filter**

In `src/lib/profile.ts`, change:
```ts
const COMPLETE_PROFILE_FILTER = {
```
to:
```ts
export const COMPLETE_PROFILE_FILTER = {
```
(No other change to this file — this is a one-word edit adding `export`.)

- [ ] **Step 2: Write the failing test for getHomeStats**

`src/lib/stats.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { getHomeStats } from "./stats";

beforeEach(async () => {
  await resetDb();
});

async function createCompleteProfileUser(linkedinId: string) {
  return prisma.user.create({
    data: {
      linkedinId,
      email: `${linkedinId}@example.com`,
      name: linkedinId,
      profile: {
        create: {
          bio: "Hi",
          skills: ["TypeScript"],
          roleType: "TECHNICAL",
          commitment: "FULL_TIME",
        },
      },
    },
  });
}

describe("getHomeStats", () => {
  it("returns zero counts when the database is empty", async () => {
    expect(await getHomeStats()).toEqual({ profileCount: 0, projectCount: 0, matchCount: 0 });
  });

  it("counts only complete profiles, all projects, and all matches", async () => {
    await prisma.user.create({
      data: { linkedinId: "li-blank", email: "blank@example.com", name: "Blank", profile: { create: {} } },
    });
    const a = await createCompleteProfileUser("li-a");
    const b = await createCompleteProfileUser("li-b");

    await prisma.project.create({
      data: { ownerId: a.id, name: "Loomly", tagline: "Tagline", description: "Description" },
    });

    await prisma.profileReaction.create({ data: { fromUserId: a.id, toUserId: b.id, status: "LIKE" } });
    await prisma.profileReaction.create({ data: { fromUserId: b.id, toUserId: a.id, status: "LIKE" } });
    await prisma.match.create({
      data: { userAId: a.id < b.id ? a.id : b.id, userBId: a.id < b.id ? b.id : a.id },
    });

    const stats = await getHomeStats();
    expect(stats.profileCount).toBe(2);
    expect(stats.projectCount).toBe(1);
    expect(stats.matchCount).toBe(1);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/stats.test.ts`
Expected: FAIL with "Cannot find module './stats'" (or similar).

- [ ] **Step 4: Write the getHomeStats implementation**

`src/lib/stats.ts`:
```ts
import { prisma } from "./db";
import { COMPLETE_PROFILE_FILTER } from "./profile";

export async function getHomeStats(): Promise<{
  profileCount: number;
  projectCount: number;
  matchCount: number;
}> {
  const [profileCount, projectCount, matchCount] = await Promise.all([
    prisma.profile.count({ where: COMPLETE_PROFILE_FILTER }),
    prisma.project.count(),
    prisma.match.count(),
  ]);

  return { profileCount, projectCount, matchCount };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/stats.test.ts`
Expected: PASS (2 tests passed).

- [ ] **Step 6: Write the failing test for getFeaturedProjects**

Add this `describe` block to the end of `src/lib/project.test.ts` (keep everything else in the file unchanged):
```ts
describe("getFeaturedProjects", () => {
  it("returns up to 3 most recently created projects, newest first", async () => {
    for (let i = 0; i < 5; i++) {
      const owner = await createTestUser(`li-featured-${i}`);
      await prisma.project.create({
        data: {
          ownerId: owner.id,
          name: `Project ${i}`,
          tagline: "Tagline",
          description: "Description",
          createdAt: new Date(2020, 0, 1 + i),
        },
      });
    }

    const featured = await getFeaturedProjects();
    expect(featured).toHaveLength(3);
    expect(featured.map((project) => project.name)).toEqual(["Project 4", "Project 3", "Project 2"]);
  });

  it("returns an empty array when there are no projects", async () => {
    expect(await getFeaturedProjects()).toEqual([]);
  });
});
```

Also update the import line at the top of `src/lib/project.test.ts` to include `getFeaturedProjects`:
```ts
import {
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  listProjects,
  getFeaturedProjects,
} from "./project";
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run src/lib/project.test.ts`
Expected: FAIL with "getFeaturedProjects is not exported" (or similar) on the new `describe("getFeaturedProjects", ...)` block; the pre-existing tests still pass.

- [ ] **Step 8: Write the getFeaturedProjects implementation**

Add this function to the end of `src/lib/project.ts` (keep everything else in the file unchanged):
```ts
export async function getFeaturedProjects(): Promise<(Project & { owner: User })[]> {
  return prisma.project.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run src/lib/project.test.ts`
Expected: PASS (11 tests passed).

- [ ] **Step 10: Commit**

```bash
git add src/lib/profile.ts src/lib/stats.ts src/lib/stats.test.ts src/lib/project.ts src/lib/project.test.ts
git commit -m "feat: add getHomeStats and getFeaturedProjects for the home page"
```

---

### Task 10: Home page redesign

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Card` from `@/components/Card` (Task 1); `Button`, `LinkButton` from `@/components/Button` (Task 1); `getHomeStats` from `@/lib/stats` (Task 9); `getFeaturedProjects` from `@/lib/project` (Task 9); `auth`, `signIn` from `@/lib/auth` (existing).
- Produces: a redesigned home page: hero, stats, "how it works", featured projects, testimonials, footer. No longer shows its own navigation links (now provided by `Nav` on every page).

- [ ] **Step 1: Write the new home page**

Replace `src/app/page.tsx` with:
```tsx
import { auth, signIn } from "@/lib/auth";
import { getHomeStats } from "@/lib/stats";
import { getFeaturedProjects } from "@/lib/project";
import { Card } from "@/components/Card";
import { Button, LinkButton } from "@/components/Button";

const TESTIMONIALS = [
  {
    quote: "Found my technical co-founder in two weeks. We're now building full-time together.",
    author: "Early user",
  },
  {
    quote:
      "As a non-technical founder, this was the easiest way to find someone who actually wanted to build my idea.",
    author: "Early user",
  },
  {
    quote: "The direct-link profiles kept things simple — no noise, just people actually looking to build something.",
    author: "Early user",
  },
];

const STEPS = [
  { title: "Create your profile", description: "Sign in with LinkedIn and tell us what you're looking for." },
  {
    title: "Discover people & projects",
    description: "Browse profiles looking for a co-founder, or projects looking for one.",
  },
  { title: "Match and connect", description: "Like who you're interested in — when it's mutual, you're matched." },
];

export default async function HomePage() {
  const session = await auth();
  const [stats, featuredProjects] = await Promise.all([getHomeStats(), getFeaturedProjects()]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Find your <span className="text-indigo-600">co-founder</span>.
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          co-founder.fit matches you with people looking to build something — and with existing projects
          looking for someone like you to join.
        </p>
        {session?.user ? (
          <p className="mt-6 text-gray-700">Welcome back, {session.user.name}.</p>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("linkedin");
            }}
            className="mt-6"
          >
            <Button type="submit">Sign in with LinkedIn</Button>
          </form>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.profileCount}</p>
          <p className="text-sm text-gray-500 mt-1">Profiles</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.projectCount}</p>
          <p className="text-sm text-gray-500 mt-1">Projects</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.matchCount}</p>
          <p className="text-sm text-gray-500 mt-1">Matches made</p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto font-bold">
                {i + 1}
              </div>
              <h3 className="mt-3 font-bold text-gray-900">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Featured projects</h2>
        {featuredProjects.length === 0 ? (
          <p className="text-gray-500">No projects yet — be the first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredProjects.map((project) => (
              <Card key={project.id}>
                <a href={`/project/${project.id}`} className="block">
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.tagline}</p>
                  <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
                </a>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">What people are saying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.quote}>
              <p className="text-gray-700 italic">{`"${testimonial.quote}"`}</p>
              <p className="text-sm text-gray-500 mt-3">— {testimonial.author}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 pt-6 flex justify-center gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-900">
          X / Twitter
        </a>
        <a href="#" className="hover:text-gray-900">
          LinkedIn
        </a>
        <a href="mailto:hello@cofounder.fit" className="hover:text-gray-900">
          Contact
        </a>
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Confirm the app builds**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run db:seed`, then `npm run dev`. Visit `/` while signed out.
Expected: hero section with "Sign in with LinkedIn" CTA; stats section shows real counts (2 seeded profiles, 1 seeded project, 0 matches unless seeded); "How it works" 3-step section renders; "Featured projects" shows the seeded Loomly project card, linking to `/project/<id>`; testimonials render; footer links render. Sign in and revisit `/` — the CTA is replaced by "Welcome back, <name>."; the top `Nav` (from Task 2) still shows all navigation links regardless of what's on the home page itself.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: redesign home page with stats, featured projects, and marketing content"
```

---

### Task 11: End-to-end verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: the full feature from Tasks 1-10.
- Produces: confirmation that the design system spec's manual verification checklist passes.

- [ ] **Step 1: Run the full automated test suite**

Run: `npx dotenv -e .env.test -- npm test`
Expected: all test files pass, including the new `stats.test.ts` and the extended `getFeaturedProjects` block in `project.test.ts`.

- [ ] **Step 2: Run a full production build**

Run: `npm run build`
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 3: Walk the manual checklist from the spec**

Run: `npm run db:seed`, then `npm run dev` and, in a browser:

1. Visit every existing route (`/`, `/discover/profiles`, `/discover/projects`, `/matches`, `/profile/setup`, `/profile/edit`, `/profile/<id>`, `/project/edit`, `/project/<id>`, `/auth/error`) and confirm `Nav` renders identically at the top of each one, in both signed-in and signed-out states.
2. Confirm every link in `Nav` works (Discover Profiles, Discover Projects, My Matches, My Profile, Sign in/out).
3. Confirm the home page renders real stats and featured projects against the seeded database, and that "No projects yet — be the first" would show correctly against an empty database (can be spot-checked by temporarily reasoning about the empty-state branch rather than actually wiping seed data).
4. Confirm Like/Pass buttons on Discover cards show the indigo highlighted state correctly for an existing reaction, and plain outlined state otherwise.
5. Confirm profile/project forms are legibly styled (labeled inputs, visible focus states, a clear Save button) and still submit correctly.
6. Confirm no console errors or broken layout on any page at both mobile (`sm`) and desktop widths.

Expected: every step behaves as described above with no errors in the terminal or browser console.

- [ ] **Step 4: Record completion**

No commit — this task only verifies Tasks 1-10. If any check fails, fix the underlying task and re-run this checklist before considering the design system spec complete.
