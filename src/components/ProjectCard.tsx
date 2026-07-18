import type { Project, User, ReactionStatus } from "@prisma/client";
import { reactToProjectAction } from "@/app/actions/reaction";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface ProjectCardProps {
  project: Project & { owner: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

export function ProjectCard({ project, viewerId, currentPage }: ProjectCardProps) {
  const isOwnCard = viewerId === project.ownerId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <a href={`/project/${project.id}`} className="block">
        <h2 className="font-bold text-gray-900">{project.name}</h2>
        <p className="text-sm italic text-gray-500">{project.tagline}</p>
        {project.industry && <p className="text-sm text-gray-500">{project.industry}</p>}
        {project.rolesNeeded.length > 0 && (
          <p className="text-sm mt-1 text-gray-700">Roles needed: {project.rolesNeeded.join(", ")}</p>
        )}
        {project.commitmentExpected && <p className="text-sm text-gray-700">{project.commitmentExpected}</p>}
        <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
      </a>
      {!isOwnCard && (
        <div className="flex gap-2 mt-3">
          <form action={reactToProjectAction.bind(null, "LIKE")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={project.viewerReaction === "LIKE" ? "primary" : "secondary"}>
              Like
            </Button>
          </form>
          <form action={reactToProjectAction.bind(null, "PASS")}>
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="ownerId" value={project.ownerId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={project.viewerReaction === "PASS" ? "primary" : "secondary"}>
              Pass
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
