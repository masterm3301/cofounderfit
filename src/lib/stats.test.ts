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
