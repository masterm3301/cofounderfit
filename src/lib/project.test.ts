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
