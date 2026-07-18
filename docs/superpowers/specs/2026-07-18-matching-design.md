# co-founder.fit — Spec #3: Swipe-Based Matching (Reactions & Matches)

## Context

Spec #1 (Foundation) built accounts, profiles, and projects. Spec #2 (Discover
Profiles & Discover Projects) added paginated feeds so users can browse people and
projects. Neither spec lets a user express interest or find out when interest is
mutual. This spec adds that: Like/Pass reactions on profiles and projects, and a
`Match` the moment two users have liked each other (directly or through a project).

**In scope:** Like/Pass buttons on `ProfileCard` and `ProjectCard` (in the existing
`/discover/profiles` and `/discover/projects` feeds), mutual-match detection across
both reaction types, an "It's a match!" confirmation, and a `/matches` list page.

**Out of scope (future specs):** messaging/inbox (a match cannot open a chat yet —
users connect via the LinkedIn link already on their profile), notifications (no
push/email when someone likes or matches with you — you only find out by revisiting
the app), admin/moderation, "who liked me" / unmatching / reporting.

## Data Model

Two new reaction tables, kept separate (not one polymorphic table) so each gets a
native Prisma unique constraint without resorting to raw-SQL partial indexes:

```prisma
enum ReactionStatus {
  LIKE
  PASS
}

model ProfileReaction {
  id         String         @id @default(cuid())
  fromUserId String
  toUserId   String
  status     ReactionStatus
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  fromUser User @relation("ProfileReactionFrom", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser   User @relation("ProfileReactionTo", fields: [toUserId], references: [id], onDelete: Cascade)

  @@unique([fromUserId, toUserId])
}

model ProjectReaction {
  id          String         @id @default(cuid())
  fromUserId  String
  toProjectId String
  status      ReactionStatus
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  fromUser  User    @relation("ProjectReactionFrom", fields: [fromUserId], references: [id], onDelete: Cascade)
  toProject Project @relation(fields: [toProjectId], references: [id], onDelete: Cascade)

  @@unique([fromUserId, toProjectId])
}

model Match {
  id        String   @id @default(cuid())
  userAId   String
  userBId   String
  createdAt DateTime @default(now())

  userA User @relation("MatchUserA", fields: [userAId], references: [id], onDelete: Cascade)
  userB User @relation("MatchUserB", fields: [userBId], references: [id], onDelete: Cascade)

  @@unique([userAId, userBId])
}
```

`Match.userAId`/`userBId` are canonically ordered (the lexicographically smaller
user id is always `userAId`) so the same pair can never produce two `Match` rows
regardless of which user's action triggers the match.

**Match permanence:** once created, a `Match` row is never deleted — including if
one side later switches a `LIKE` to `PASS`. Matches disappearing after the fact
(because someone reconsidered) would be a more confusing surprise than an
occasionally-stale match, and reactions stay freely changeable per user preference.

## Match Detection

`src/lib/reaction.ts`:

- `hasLikedUser(fromUserId: string, targetUserId: string): Promise<boolean>` — true
  if `fromUserId` has a `LIKE` `ProfileReaction` aimed at `targetUserId`, **or**
  `targetUserId` owns an active `Project` that `fromUserId` has `LIKE`'d via
  `ProjectReaction`. This is the one symmetric primitive both reaction types share.
- `reactToProfile(fromUserId: string, toUserId: string, status: ReactionStatus): Promise<{ matched: boolean }>`
  — rejects (throws) if `fromUserId === toUserId`. Upserts the `ProfileReaction`
  (matches the "decisions are always changeable" requirement — a repeat call
  overwrites the prior status). If `status === "LIKE"`, calls `hasLikedUser(toUserId, fromUserId)`
  (the reciprocal direction); if true, creates the canonically-ordered `Match` row
  (no-op via the unique constraint if it already exists). Returns whether the two
  users are mutually matched after this call.
- `reactToProject(fromUserId: string, projectId: string, status: ReactionStatus): Promise<{ matched: boolean }>`
  — looks up the project's `ownerId`; rejects if `ownerId === fromUserId`. Upserts
  the `ProjectReaction`. If `status === "LIKE"`, runs the same mutual check between
  `fromUserId` and the project's owner and creates a `Match` under the same rule.
- `getMatches(userId: string): Promise<{ matchId: string; otherUser: User & { profile: Profile | null; project: Project | null }; matchedAt: Date }[]>`
  — every `Match` row where `userId` is `userAId` or `userBId`, resolved to "the
  other person" (with their profile and project, if any) for the `/matches` page.

## UI: Cards & Server Actions

`ProfileCard` and `ProjectCard` (both modified from Spec #2) are restructured so the
clickable-to-view-detail area is an `<a>` wrapping just the summary content, with a
separate footer row of two small `<form>`s (Like, Pass) as siblings — not nested
inside the `<a>`, since interactive elements cannot nest inside a link. Each form
posts to a Server Action bound with a fixed status
(`reactToProfileAction.bind(null, "LIKE")` / `.bind(null, "PASS")`), carrying the
target id and the current page number as hidden inputs (so the redirect after
reacting lands the user back on the same page of the feed).

Both cards gain two new optional props:

- `viewerId?: string` — who's looking. If it matches the card's own owner, the
  Like/Pass buttons are omitted entirely (you cannot react to yourself, and there is
  no self-exclusion in the Discover feeds per Spec #2, so your own card can appear).
- `viewerReaction?: "LIKE" | "PASS" | null` — the viewer's existing decision on this
  item, if any. Whichever button matches renders in a highlighted/active style.

`listProfiles`/`listProjects` (both modified from Spec #2) gain an optional
`viewerId?: string` parameter. When present, a second batched query fetches the
viewer's reactions for the returned page of ids and merges each item's
`viewerReaction` into the result. When absent (a signed-out visitor on the public
`/discover/projects` feed), this step is skipped and every item gets
`viewerReaction: null`.

New `src/app/actions/reaction.ts`:

- `reactToProfileAction(status: ReactionStatus, formData: FormData)` and
  `reactToProjectAction(status: ReactionStatus, formData: FormData)`, both gated by
  `requireCompleteProfile()` (same as every other write action in the app — this is
  also what redirects a signed-out visitor who clicks Like/Pass on the public
  Discover Projects page to sign-in). On `{ matched: true }`, redirect to
  `/matches/new?with=<otherUserId>`. Otherwise, redirect back to
  `/discover/profiles?page=N` / `/discover/projects?page=N` using the hidden `page`
  input.

## New Pages

- `/matches` — gated by `requireCompleteProfile()`. Lists every mutual match for the
  signed-in user: the other person's name, photo, a link to their profile, and a
  link to their project if they have one.
- `/matches/new?with=<userId>` — also gated. Shows an "It's a match!" confirmation
  with a link to that person's profile and a link to `/matches`. If `with` does not
  correspond to an actual match involving the current user, redirects to `/matches`
  instead of rendering anything (prevents probing whether a match exists with an
  arbitrary user id).

## Error Handling

- **Self-reaction**: rejected by `reactToProfile`/`reactToProject` (throws), though
  structurally unreachable through the UI since Like/Pass buttons never render on a
  viewer's own card.
- **Reacting after already matched**: allowed — reactions stay changeable.
  Switching a `LIKE` to `PASS` does **not** delete an existing `Match`.
- **Re-liking someone you're already matched with**: harmless. The mutual check
  re-runs, finds the `Match` already exists (unique constraint), and still returns
  `matched: true` — the action redirects to the same confirmation page again.
- **`/matches/new?with=<id>` with a non-existent or non-matching id**: redirects to
  `/matches` rather than rendering anything.
- **Reacting while signed out**: `requireCompleteProfile()` inside the Server Action
  redirects to sign-in, same as every other gated action in the app.

## Testing

- Integration tests for `reaction.ts` (real Postgres, same pattern as existing
  `lib` tests): profile-like creates/updates a `ProfileReaction`; self-reaction is
  rejected; project-like resolves through the project's owner and creates/updates a
  `ProjectReaction`; reacting to your own project is rejected; mutual profile likes
  create exactly one `Match`; a project-like plus a reciprocal profile-like also
  creates a `Match`; switching `LIKE` → `PASS` after a match leaves the `Match` row
  intact; re-liking an already-matched user does not create a duplicate `Match` row;
  `getMatches` returns the correct list from both the `userA` and `userB` side of
  the relationship.
- Manual verification: two accounts like each other's profiles → both land on the
  match confirmation and both see each other on `/matches`; one account likes the
  other's project, then the project's owner likes the liker's profile back → match;
  switching a `LIKE` to `PASS` after matching still shows the match on `/matches`;
  confirm no Like/Pass buttons render on your own card in either feed; confirm
  clicking Like/Pass while signed out on `/discover/projects` redirects to sign-in.
