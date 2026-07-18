import type { Profile, User, ReactionStatus } from "@prisma/client";
import { reactToProfileAction } from "@/app/actions/reaction";
import { Button, LinkButton } from "@/components/Button";
import { COMMITMENT_LABELS, ROLE_TYPE_LABELS } from "@/lib/labels";

interface ProfileCardProps {
  profile: Profile & { user: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

const MAX_VISIBLE_SKILLS = 4;

export function ProfileCard({ profile, viewerId, currentPage }: ProfileCardProps) {
  const isOwnCard = viewerId === profile.userId;
  const visibleSkills = profile.skills.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkillCount = profile.skills.length - visibleSkills.length;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-indigo-300">
      <a href={`/profile/${profile.userId}`} className="group flex-1 p-5">
        <div className="flex items-center gap-3">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
              {profile.user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600">
              {profile.user.name}
            </h2>
            {profile.location && <p className="text-sm text-gray-500 truncate">{profile.location}</p>}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {profile.roleType && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {ROLE_TYPE_LABELS[profile.roleType]}
            </span>
          )}
          {profile.commitment && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {COMMITMENT_LABELS[profile.commitment]}
            </span>
          )}
          {profile.hasIdea && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Has an idea
            </span>
          )}
        </div>

        {profile.bio && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{profile.bio}</p>}

        {profile.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                >
                  {skill}
                </span>
              ))}
              {hiddenSkillCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  +{hiddenSkillCount}
                </span>
              )}
            </div>
          </div>
        )}
      </a>

      <div className="border-t border-gray-100 px-5 py-3">
        {isOwnCard ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Your profile</span>
            <LinkButton href="/profile/edit" variant="secondary" size="sm">
              Edit
            </LinkButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <form action={reactToProfileAction.bind(null, "PASS")} className="flex-1">
              <input type="hidden" name="toUserId" value={profile.userId} />
              <input type="hidden" name="page" value={currentPage} />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className={`w-full ${
                  profile.viewerReaction === "PASS" ? "!bg-gray-700 !text-white !border-gray-700" : ""
                }`}
              >
                Pass
              </Button>
            </form>
            <form action={reactToProfileAction.bind(null, "LIKE")} className="flex-1">
              <input type="hidden" name="toUserId" value={profile.userId} />
              <input type="hidden" name="page" value={currentPage} />
              <Button
                type="submit"
                size="sm"
                variant={profile.viewerReaction === "LIKE" ? "primary" : "secondary"}
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
