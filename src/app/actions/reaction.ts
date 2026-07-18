"use server";

import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { reactToProfile, reactToProject } from "@/lib/reaction";
import type { ReactionStatus } from "@prisma/client";

export async function reactToProfileAction(status: ReactionStatus, formData: FormData) {
  const fromUserId = await requireCompleteProfile();
  const toUserId = formData.get("toUserId") as string;
  const page = (formData.get("page") as string) || "1";
  const redirectTo = formData.get("redirectTo") as string | null;

  const { matched } = await reactToProfile(fromUserId, toUserId, status);

  if (matched) {
    redirect(`/matches/new?with=${toUserId}`);
  }
  // Only allow internal paths as redirect targets.
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    redirect(redirectTo);
  }
  redirect(`/discover/profiles?page=${page}`);
}

export async function reactToProjectAction(status: ReactionStatus, formData: FormData) {
  const fromUserId = await requireCompleteProfile();
  const projectId = formData.get("projectId") as string;
  const ownerId = formData.get("ownerId") as string;
  const page = (formData.get("page") as string) || "1";
  const redirectTo = formData.get("redirectTo") as string | null;

  const { matched } = await reactToProject(fromUserId, projectId, status);

  if (matched) {
    redirect(`/matches/new?with=${ownerId}`);
  }
  // Only allow internal paths as redirect targets.
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    redirect(redirectTo);
  }
  redirect(`/discover/projects?page=${page}`);
}
