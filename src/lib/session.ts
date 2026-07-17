import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getProfile, isProfileComplete } from "./profile";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
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
