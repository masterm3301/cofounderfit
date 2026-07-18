import { requireCompleteProfile } from "@/lib/session";
import { getProject } from "@/lib/project";
import { ProjectForm } from "@/components/ProjectForm";
import { saveProjectAction, deleteProjectAction } from "@/app/actions/project";

export default async function ProjectEditPage() {
  const userId = await requireCompleteProfile();
  const project = await getProject(userId);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{project ? "Edit your project" : "Create your project"}</h1>
      <ProjectForm action={saveProjectAction} initialProject={project} />
      {project && (
        <form action={deleteProjectAction} className="mt-4">
          <button type="submit" className="text-red-600 underline">
            Delete project
          </button>
        </form>
      )}
    </main>
  );
}
