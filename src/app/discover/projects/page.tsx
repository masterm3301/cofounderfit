import { auth } from "@/lib/auth";
import { listProjects } from "@/lib/project";
import { clampPage } from "@/lib/pagination";
import { ProjectCard } from "@/components/ProjectCard";
import { LinkButton } from "@/components/Button";

export default async function DiscoverProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const { page } = await searchParams;
  const { projects, totalPages } = await listProjects(Number(page), viewerId);
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Discover Projects</h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} viewerId={viewerId} currentPage={currentPage} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <LinkButton href={`/discover/projects?page=${currentPage - 1}`} variant="secondary" size="sm">
            Prev
          </LinkButton>
        )}
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <LinkButton href={`/discover/projects?page=${currentPage + 1}`} variant="secondary" size="sm">
            Next
          </LinkButton>
        )}
      </div>
    </main>
  );
}
