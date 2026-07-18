import type { Project, User, ReactionStatus } from "@prisma/client";
import { reactToProjectAction } from "@/app/actions/reaction";
import { Button, LinkButton } from "@/components/Button";
import { COMMITMENT_LABELS } from "@/lib/labels";

interface ProjectCardProps {
  project: Project & { owner: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

const MAX_VISIBLE_ROLES = 3;

export function ProjectCard({ project, viewerId, currentPage }: ProjectCardProps) {
  const isOwnCard = viewerId === project.ownerId;
  const visibleRoles = project.rolesNeeded.slice(0, MAX_VISIBLE_ROLES);
  const hiddenRoleCount = project.rolesNeeded.length - visibleRoles.length;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-indigo-300">
      <a href={`/project/${project.id}`} className="group flex-1 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {project.industry && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {project.industry}
            </span>
          )}
          {project.commitmentExpected && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {COMMITMENT_LABELS[project.commitmentExpected]}
            </span>
          )}
        </div>

        <h2 className="mt-3 font-semibold text-gray-900 group-hover:text-indigo-600">{project.name}</h2>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.tagline}</p>

        {project.rolesNeeded.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Looking for</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                >
                  {role}
                </span>
              ))}
              {hiddenRoleCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  +{hiddenRoleCount}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {project.owner.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 truncate">by {project.owner.name}</span>
        </div>
      </a>

      <div className="border-t border-gray-100 px-5 py-3">
        {isOwnCard ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Your project</span>
            <LinkButton href="/project/edit" variant="secondary" size="sm">
              Edit
            </LinkButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <form action={reactToProjectAction.bind(null, "PASS")} className="flex-1">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="ownerId" value={project.ownerId} />
              <input type="hidden" name="page" value={currentPage} />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className={`w-full ${
                  project.viewerReaction === "PASS" ? "!bg-gray-700 !text-white !border-gray-700" : ""
                }`}
              >
                Pass
              </Button>
            </form>
            <form action={reactToProjectAction.bind(null, "LIKE")} className="flex-1">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="ownerId" value={project.ownerId} />
              <input type="hidden" name="page" value={currentPage} />
              <Button
                type="submit"
                size="sm"
                variant={project.viewerReaction === "LIKE" ? "primary" : "secondary"}
                className="w-full"
              >
                ♥ Like
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
