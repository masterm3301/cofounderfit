import { prisma } from "./db";
import { projectSchema, ProjectInput } from "./validation/project";

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
