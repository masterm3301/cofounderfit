"use server";

import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { updateProfile } from "@/lib/profile";
import { profileSchema } from "@/lib/validation/profile";

export async function saveProfileAction(formData: FormData) {
  const userId = await requireUserId();

  const parsed = profileSchema.parse({
    bio: formData.get("bio") as string,
    skills: (formData.get("skills") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    roleType: formData.get("roleType") as string,
    commitment: formData.get("commitment") as string,
    hasIdea: formData.get("hasIdea") === "on",
    location: (formData.get("location") as string) || undefined,
    coFounderTraitsWanted: (formData.get("coFounderTraitsWanted") as string) || undefined,
    otherLinks: ((formData.get("otherLinks") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  });

  await updateProfile(userId, parsed);
  redirect(`/profile/${userId}`);
}
