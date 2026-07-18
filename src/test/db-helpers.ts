import { getDb } from "@/lib/db";

export async function resetDb() {
  const prisma = getDb();
  await prisma.match.deleteMany();
  await prisma.profileReaction.deleteMany();
  await prisma.projectReaction.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}
