import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/project";
import { Card } from "@/components/Card";

export default async function PublicProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{project.name}</h1>
        <p className="italic text-gray-500 mt-1">{project.tagline}</p>
        <p className="mt-3 text-gray-700">{project.description}</p>
        {project.industry && <p className="text-sm text-gray-500 mt-2">Industry: {project.industry}</p>}
        <p className="text-sm text-gray-500">Roles needed: {project.rolesNeeded.join(", ")}</p>
        {project.equityOffered && <p className="text-sm text-gray-500">Equity offered: {project.equityOffered}</p>}
        {project.commitmentExpected && <p className="text-sm text-gray-500">Commitment: {project.commitmentExpected}</p>}
        <p className="mt-2 text-gray-700">
          Founded by{" "}
          <a href={`/profile/${project.owner.id}`} className="text-indigo-600 hover:underline">
            {project.owner.name}
          </a>
        </p>
        <ul className="mt-2">
          {project.websiteUrl && (
            <li>
              <a href={project.websiteUrl} className="text-indigo-600 hover:underline">
                Website
              </a>
            </li>
          )}
          {project.deckUrl && (
            <li>
              <a href={project.deckUrl} className="text-indigo-600 hover:underline">
                Deck
              </a>
            </li>
          )}
          {project.demoUrl && (
            <li>
              <a href={project.demoUrl} className="text-indigo-600 hover:underline">
                Demo
              </a>
            </li>
          )}
        </ul>
      </Card>
    </main>
  );
}
