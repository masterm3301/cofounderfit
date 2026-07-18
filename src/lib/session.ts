import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getDb } from "./db";
import { getProfile, isProfileComplete } from "./profile";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // The JWT only gets re-derived from a fresh LinkedIn `profile.sub` on
  // initial sign-in (see auth.ts), so a cookie can keep pointing at a user
  // id that no longer exists in the DB (e.g. after a data reset). Catch
  // that here instead of letting a later query 500 on a missing row.
  const user = await getDb().user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/api/auth/signin");
  }

  return session.user.id;
}

export async function requireCompleteProfile(): Promise<string> {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  if (!isProfileComplete(profile)) {
    redirect("/profile/setup");
  }
  return userId;
}
