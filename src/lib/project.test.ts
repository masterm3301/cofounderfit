import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
const prisma = getDb();
import { resetDb } from "../test/db-helpers";
import {
  getProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  listProjects,
  getFeaturedProjects,
} from "./project";

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

describe("listProjects", () => {
  it("orders newest first and paginates at 20 per page", async () => {
    // Sequential awaits here would be 44 real round trips to Neon (owner +
    // project per iteration) and can exceed the test timeout under CI
    // network latency; these are all independent rows, so create them
    // concurrently. Promise.all preserves input order, so owners[i] still
    // lines up with Project i regardless of completion order.
    const owners = await Promise.all(
      Array.from({ length: 22 }, async (_, i) => {
        const owner = await createTestUser(`li-${i}`);
        await prisma.project.create({
          data: {
            ownerId: owner.id,
            name: `Project ${i}`,
            tagline: "Tagline",
            description: "Description",
            createdAt: new Date(2020, 0, 1 + i),
          },
        });
        return owner;
      })
    );

    const page1 = await listProjects(1);
    expect(page1.projects).toHaveLength(20);
    expect(page1.totalPages).toBe(2);
    expect(page1.projects[0].name).toBe("Project 21");
    expect(page1.projects[0].owner.id).toBe(owners[21].id);

    const page2 = await listProjects(2);
    expect(page2.projects).toHaveLength(2);
    expect(page2.projects[1].name).toBe("Project 0");
  });

  it("returns an empty list with totalPages 1 when there are no projects", async () => {
    const { projects, totalPages } = await listProjects(1);
    expect(projects).toEqual([]);
    expect(totalPages).toBe(1);
  });
});

describe("listProjects viewerReaction", () => {
  it("attaches the viewer's existing reaction to each project", async () => {
    const viewer = await createTestUser("li-viewer");
    const likedOwner = await createTestUser("li-liked-owner");
    const passedOwner = await createTestUser("li-passed-owner");
    const undecidedOwner = await createTestUser("li-undecided-owner");

    const likedProject = await createProject(likedOwner.id, { ...validInput, name: "Liked Project" });
    const passedProject = await createProject(passedOwner.id, { ...validInput, name: "Passed Project" });
    await createProject(undecidedOwner.id, { ...validInput, name: "Undecided Project" });

    await prisma.projectReaction.create({
      data: { fromUserId: viewer.id, toProjectId: likedProject.id, status: "LIKE" },
    });
    await prisma.projectReaction.create({
      data: { fromUserId: viewer.id, toProjectId: passedProject.id, status: "PASS" },
    });

    const { projects } = await listProjects(1, viewer.id);
    const byName = new Map(projects.map((project) => [project.name, project.viewerReaction]));

    expect(byName.get("Liked Project")).toBe("LIKE");
    expect(byName.get("Passed Project")).toBe("PASS");
    expect(byName.get("Undecided Project")).toBeNull();
  });

  it("returns null viewerReaction for every project when no viewer is given", async () => {
    const owner = await createTestUser("li-owner");
    await createProject(owner.id, validInput);
    const { projects } = await listProjects(1);
    expect(projects.every((project) => project.viewerReaction === null)).toBe(true);
  });
});

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
