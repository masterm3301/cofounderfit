import type { Project, User, ReactionStatus } from "@prisma/client";
import { reactToProjectAction } from "@/app/actions/reaction";

interface ProjectCardProps {
  project: Project & { owner: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

export function ProjectCard({ project, viewerId, currentPage }: ProjectCardProps) {
  const isOwnCard = viewerId === project.ownerId;

  return (
    <div className="border rounded p-4 hover:bg-gray-50">
      <a href={`/project/${project.id}`} className="block">
        <h2 className="font-bold">{project.name}</h2>
        <p className="text-sm italic">{project.tagline}</p>
        {project.industry && <p className="text-sm text-gray-600">{project.industry}</p>}
        {project.rolesNeeded.length > 0 && (
          <p className="text-sm mt-1">Roles needed: {project.rolesNeeded.join(", ")}</p>
        )}
        {project.commitmentExpected && <p className="text-sm">{project.commitmentExpected}</p>}
        <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
      </a>
      {!isOwnCard && (
        <div className="flex gap-2 mt-3">
          <form action={reactToProjectAction.bind(null, "LIKE")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <button
              type="submit"
              className={`text-sm px-3 py-1 rounded border ${
                project.viewerReaction === "LIKE" ? "bg-black text-white" : ""
              }`}
            >
              Like
            </button>
          </form>
          <form action={reactToProjectAction.bind(null, "PASS")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <button
              type="submit"
              className={`text-sm px-3 py-1 rounded border ${
                project.viewerReaction === "PASS" ? "bg-black text-white" : ""
              }`}
            >
              Pass
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
