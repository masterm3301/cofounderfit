import { requireCompleteProfile } from "@/lib/session";
import { getProject } from "@/lib/project";
import { ProjectForm } from "@/components/ProjectForm";
import { saveProjectAction, deleteProjectAction } from "@/app/actions/project";

export default async function ProjectEditPage() {
  const userId = await requireCompleteProfile();
  const project = await getProject(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        {project ? "Edit your project" : "Create your project"}
      </h1>
      <ProjectForm action={saveProjectAction} initialProject={project} />
      {project && (
        <form action={deleteProjectAction} className="mt-4">
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete project
          </button>
        </form>
      )}
    </main>
  );
}
