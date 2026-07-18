import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/project";

export default async function PublicProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="italic">{project.tagline}</p>
      <p>{project.description}</p>
      {project.industry && <p>Industry: {project.industry}</p>}
      <p>Roles needed: {project.rolesNeeded.join(", ")}</p>
      {project.equityOffered && <p>Equity offered: {project.equityOffered}</p>}
      {project.commitmentExpected && <p>Commitment: {project.commitmentExpected}</p>}
      <p>
        Founded by{" "}
        <a href={`/profile/${project.owner.id}`} className="underline">
          {project.owner.name}
        </a>
      </p>
      <ul>
        {project.websiteUrl && (
          <li>
            <a href={project.websiteUrl} className="underline">
              Website
            </a>
          </li>
        )}
        {project.deckUrl && (
          <li>
            <a href={project.deckUrl} className="underline">
              Deck
            </a>
          </li>
        )}
        {project.demoUrl && (
          <li>
            <a href={project.demoUrl} className="underline">
              Demo
            </a>
          </li>
        )}
      </ul>
    </main>
  );
}
