import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "./db";
import { resetDb } from "../test/db-helpers";
import { getProfile, isProfileComplete, updateProfile, listProfiles } from "./profile";

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

async function createCompleteProfileUser(linkedinId: string, name: string, createdAt: Date) {
  return prisma.user.create({
    data: {
      linkedinId,
      email: `${linkedinId}@example.com`,
      name,
      createdAt,
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

describe("listProfiles", () => {
  it("excludes incomplete profiles", async () => {
    await createTestUser();
    await createCompleteProfileUser("li-complete", "Complete User", new Date(2020, 0, 1));

    const { profiles, totalPages } = await listProfiles(1);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].user.name).toBe("Complete User");
    expect(totalPages).toBe(1);
  });

  it("orders newest user first and paginates at 20 per page", async () => {
    for (let i = 0; i < 25; i++) {
      await createCompleteProfileUser(`li-${i}`, `User ${i}`, new Date(2020, 0, 1 + i));
    }

    const page1 = await listProfiles(1);
    expect(page1.profiles).toHaveLength(20);
    expect(page1.totalPages).toBe(2);
    expect(page1.profiles[0].user.name).toBe("User 24");

    const page2 = await listProfiles(2);
    expect(page2.profiles).toHaveLength(5);
    expect(page2.profiles[4].user.name).toBe("User 0");
  });

  it("returns an empty list with totalPages 1 when there are no complete profiles", async () => {
    const { profiles, totalPages } = await listProfiles(1);
    expect(profiles).toEqual([]);
    expect(totalPages).toBe(1);
  });
});
