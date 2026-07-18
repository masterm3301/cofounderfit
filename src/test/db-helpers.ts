import { getDb } from "@/lib/db";

export async function resetDb() {
  // This truncates every table. A misconfigured env (e.g. a CI step that
  // leaks the real DATABASE_URL into the test environment) must never let
  // this run against production — require the connection string to name
  // the test database explicitly.
  const url = process.env.DATABASE_URL ?? "";
  if (!/\/neondb_test\b/.test(url)) {
    throw new Error(
      `resetDb() refused to run: DATABASE_URL does not point at neondb_test (got: ${url.replace(/:[^:@]*@/, ":***@")}).`
    );
  }

  const prisma = getDb();
  await prisma.match.deleteMany();
  await prisma.profileReaction.deleteMany();
  await prisma.projectReaction.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}
