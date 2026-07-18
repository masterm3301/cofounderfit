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
