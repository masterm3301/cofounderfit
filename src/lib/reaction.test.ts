import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { reactToProfile, reactToProject, getMatches, isMatch } from "./reaction";
import { createProject } from "./project";

beforeEach(async () => {
  await resetDb();
});

async function createTestUser(linkedinId: string) {
  return prisma.user.create({
    data: { linkedinId, email: `${linkedinId}@example.com`, name: linkedinId, profile: { create: {} } },
  });
}

const validProject = {
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

describe("reactToProfile", () => {
  it("rejects reacting to your own profile", async () => {
    const user = await createTestUser("li-1");
    await expect(reactToProfile(user.id, user.id, "LIKE")).rejects.toThrow(
      "You cannot react to your own profile."
    );
  });

  it("records a like without creating a match when not mutual", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");

    const result = await reactToProfile(a.id, b.id, "LIKE");
    expect(result.matched).toBe(false);
    expect(await isMatch(a.id, b.id)).toBe(false);
  });

  it("creates a match when both users like each other's profile", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");

    await reactToProfile(a.id, b.id, "LIKE");
    const result = await reactToProfile(b.id, a.id, "LIKE");

    expect(result.matched).toBe(true);
    expect(await isMatch(a.id, b.id)).toBe(true);
    expect(await prisma.match.count()).toBe(1);
  });

  it("updates an existing reaction instead of duplicating it", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");

    await reactToProfile(a.id, b.id, "PASS");
    await reactToProfile(a.id, b.id, "LIKE");

    expect(await prisma.profileReaction.count()).toBe(1);
    const reaction = await prisma.profileReaction.findUnique({
      where: { fromUserId_toUserId: { fromUserId: a.id, toUserId: b.id } },
    });
    expect(reaction?.status).toBe("LIKE");
  });

  it("keeps an existing match after switching a like to a pass", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");

    await reactToProfile(a.id, b.id, "LIKE");
    await reactToProfile(b.id, a.id, "LIKE");
    expect(await isMatch(a.id, b.id)).toBe(true);

    await reactToProfile(a.id, b.id, "PASS");
    expect(await isMatch(a.id, b.id)).toBe(true);
  });

  it("does not duplicate a match row when re-liking an already-matched user", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");

    await reactToProfile(a.id, b.id, "LIKE");
    await reactToProfile(b.id, a.id, "LIKE");
    const result = await reactToProfile(a.id, b.id, "LIKE");

    expect(result.matched).toBe(true);
    expect(await prisma.match.count()).toBe(1);
  });
});

describe("reactToProject", () => {
  it("rejects reacting to a nonexistent project", async () => {
    const user = await createTestUser("li-1");
    await expect(reactToProject(user.id, "does-not-exist", "LIKE")).rejects.toThrow(
      "Project not found."
    );
  });

  it("rejects reacting to your own project", async () => {
    const owner = await createTestUser("li-owner");
    const project = await createProject(owner.id, validProject);
    await expect(reactToProject(owner.id, project.id, "LIKE")).rejects.toThrow(
      "You cannot react to your own project."
    );
  });

  it("creates a match when the liker likes the project and the owner likes the liker's profile", async () => {
    const owner = await createTestUser("li-owner");
    const liker = await createTestUser("li-liker");
    const project = await createProject(owner.id, validProject);

    const likeResult = await reactToProject(liker.id, project.id, "LIKE");
    expect(likeResult.matched).toBe(false);

    const matchResult = await reactToProfile(owner.id, liker.id, "LIKE");
    expect(matchResult.matched).toBe(true);
    expect(await isMatch(owner.id, liker.id)).toBe(true);
  });
});

describe("getMatches", () => {
  it("returns matches from both sides of the relationship", async () => {
    const a = await createTestUser("li-a");
    const b = await createTestUser("li-b");
    await reactToProfile(a.id, b.id, "LIKE");
    await reactToProfile(b.id, a.id, "LIKE");

    const matchesForA = await getMatches(a.id);
    expect(matchesForA).toHaveLength(1);
    expect(matchesForA[0].otherUser.id).toBe(b.id);

    const matchesForB = await getMatches(b.id);
    expect(matchesForB).toHaveLength(1);
    expect(matchesForB[0].otherUser.id).toBe(a.id);
  });

  it("returns an empty list when there are no matches", async () => {
    const user = await createTestUser("li-1");
    expect(await getMatches(user.id)).toEqual([]);
  });
});
