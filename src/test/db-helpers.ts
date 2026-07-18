import { prisma } from "@/lib/db";

export async function resetDb() {
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}
