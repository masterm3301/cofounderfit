import { listProjects } from "@/lib/project";
import { clampPage } from "@/lib/pagination";
import { ProjectCard } from "@/components/ProjectCard";

export default async function DiscoverProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const { projects, totalPages } = await listProjects(Number(page));
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Discover Projects</h1>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <a href={`/discover/projects?page=${currentPage - 1}`} className="underline">
            Prev
          </a>
        )}
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <a href={`/discover/projects?page=${currentPage + 1}`} className="underline">
            Next
          </a>
        )}
      </div>
    </main>
  );
}
