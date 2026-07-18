import { requireCompleteProfile } from "@/lib/session";
import { getMatches } from "@/lib/reaction";
import { LinkButton } from "@/components/Button";
import { COMMITMENT_LABELS, ROLE_TYPE_LABELS } from "@/lib/labels";

function formatMatchDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function MatchesPage() {
  const userId = await requireCompleteProfile();
  const matches = await getMatches(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Matches</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">People who liked you back</h1>
        <p className="mt-2 text-gray-500">
          The interest is mutual — don&apos;t leave them hanging. Say hello and start the conversation.
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 py-16 px-6 text-center">
          <p className="font-medium text-gray-900">No matches yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Matches happen when you and another builder like each other. Keep browsing — your co-founder
            might be one like away.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <LinkButton href="/discover/profiles">Browse profiles</LinkButton>
            <LinkButton href="/discover/projects" variant="secondary">
              Browse projects
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {matches.map((match) => {
            const { otherUser } = match;
            const profile = otherUser.profile;

            return (
              <div
                key={match.matchId}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {profile?.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.photoUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 truncate">{otherUser.name}</h2>
                        {profile?.location && (
                          <p className="text-sm text-gray-500 truncate">{profile.location}</p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                      Matched {formatMatchDate(match.matchedAt)}
                    </span>
                  </div>

                  {(profile?.roleType || profile?.commitment) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {profile?.roleType && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {ROLE_TYPE_LABELS[profile.roleType]}
                        </span>
                      )}
                      {profile?.commitment && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          {COMMITMENT_LABELS[profile.commitment]}
                        </span>
                      )}
                    </div>
                  )}

                  {profile?.bio && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>}
                </div>

                <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-2">
                  {profile?.linkedinUrl ? (
                    <LinkButton
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                    >
                      Connect on LinkedIn
                    </LinkButton>
                  ) : (
                    <LinkButton href={`mailto:${otherUser.email}`} size="sm">
                      Say hello
                    </LinkButton>
                  )}
                  <LinkButton href={`/profile/${otherUser.id}`} variant="secondary" size="sm">
                    View profile
                  </LinkButton>
                  {otherUser.project && (
                    <LinkButton href={`/project/${otherUser.project.id}`} variant="secondary" size="sm">
                      View project
                    </LinkButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
