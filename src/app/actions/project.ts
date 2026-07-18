"use server";

import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { createProject, updateProject, deleteProject, getProject } from "@/lib/project";
import { projectSchema } from "@/lib/validation/project";

function parseProjectForm(formData: FormData) {
  return projectSchema.parse({
    name: formData.get("name") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    industry: (formData.get("industry") as string) || undefined,
    rolesNeeded: ((formData.get("rolesNeeded") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    equityOffered: (formData.get("equityOffered") as string) || undefined,
    commitmentExpected: (formData.get("commitmentExpected") as string) || undefined,
    websiteUrl: (formData.get("websiteUrl") as string) || "",
    deckUrl: (formData.get("deckUrl") as string) || "",
    demoUrl: (formData.get("demoUrl") as string) || "",
  });
}

export async function saveProjectAction(formData: FormData) {
  const userId = await requireCompleteProfile();
  const input = parseProjectForm(formData);
  const existing = await getProject(userId);

  if (existing) {
    await updateProject(userId, input);
  } else {
    await createProject(userId, input);
  }

  redirect("/project/edit");
}

export async function deleteProjectAction() {
  const userId = await requireCompleteProfile();
  await deleteProject(userId);
  redirect("/project/edit");
}
