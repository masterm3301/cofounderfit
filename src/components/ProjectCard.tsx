import type { Project, User } from "@prisma/client";

interface ProjectCardProps {
  project: Project & { owner: User };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a href={`/project/${project.id}`} className="block border rounded p-4 hover:bg-gray-50">
      <h2 className="font-bold">{project.name}</h2>
      <p className="text-sm italic">{project.tagline}</p>
      {project.industry && <p className="text-sm text-gray-600">{project.industry}</p>}
      {project.rolesNeeded.length > 0 && (
        <p className="text-sm mt-1">Roles needed: {project.rolesNeeded.join(", ")}</p>
      )}
      {project.commitmentExpected && <p className="text-sm">{project.commitmentExpected}</p>}
      <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
    </a>
  );
}
