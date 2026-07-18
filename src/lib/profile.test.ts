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
