import type { Project, User } from "@prisma/client";
import { prisma } from "./db";
import { projectSchema, ProjectInput } from "./validation/project";
import { PAGE_SIZE, clampPage } from "./pagination";

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

export async function listProjects(
  page: number
): Promise<{ projects: (Project & { owner: User })[]; totalPages: number }> {
  const total = await prisma.project.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = clampPage(page, totalPages);

  const projects = await prisma.project.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { projects, totalPages };
}
