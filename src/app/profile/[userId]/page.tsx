import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { isMatch } from "@/lib/reaction";
import { reactToProfileAction } from "@/app/actions/reaction";
import { Button, LinkButton } from "@/components/Button";
import { COMMITMENT_LABELS, ROLE_TYPE_LABELS } from "@/lib/labels";

function linkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const prisma = getDb();
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { project: true } });
  if (!user) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  const session = await auth();
  const viewerId = session?.user?.id;
  const isOwnProfile = viewerId === userId;

  const [viewerReaction, matched] = await Promise.all([
    viewerId && !isOwnProfile
      ? prisma.profileReaction.findUnique({
          where: { fromUserId_toUserId: { fromUserId: viewerId, toUserId: userId } },
        })
      : null,
    viewerId && !isOwnProfile ? isMatch(viewerId, userId) : false,
  ]);

  const links = [
    ...(profile.linkedinUrl ? [{ label: "LinkedIn", url: profile.linkedinUrl }] : []),
    ...profile.otherLinks.map((url) => ({ label: linkLabel(url), url })),
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <a href="/discover/profiles" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to profiles
      </a>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 truncate">{user.name}</h1>
              {profile.location && <p className="mt-1 text-gray-500">{profile.location}</p>}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
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

          {profile.bio && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">About</h2>
              <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </section>
          )}

          {profile.coFounderTraitsWanted && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Looking for in a co-founder
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.coFounderTraitsWanted}
              </p>
            </section>
          )}

          {profile.skills.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <div className="mb-5 border-b border-gray-100 pb-5">
              {isOwnProfile ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Your profile</span>
                  <LinkButton href="/profile/edit" variant="secondary" size="sm">
                    Edit
                  </LinkButton>
                </div>
              ) : matched ? (
                <>
                  <p className="text-sm font-medium text-emerald-700">
                    You&apos;re matched with {user.name} 🎉
                  </p>
                  <LinkButton href="/matches" variant="secondary" className="mt-3 w-full">
                    Go to your matches
                  </LinkButton>
                </>
              ) : viewerId ? (
                <>
                  <p className="text-sm font-medium text-gray-700">Want to build together?</p>
                  <div className="mt-3 flex gap-2">
                    <form action={reactToProfileAction.bind(null, "PASS")} className="flex-1">
                      <input type="hidden" name="toUserId" value={userId} />
                      <input type="hidden" name="redirectTo" value={`/profile/${userId}`} />
                      <Button
                        type="submit"
                        variant="secondary"
                        className={`w-full ${
                          viewerReaction?.status === "PASS" ? "!bg-gray-700 !text-white !border-gray-700" : ""
                        }`}
                      >
                        Pass
                      </Button>
                    </form>
                    <form action={reactToProfileAction.bind(null, "LIKE")} className="flex-1">
                      <input type="hidden" name="toUserId" value={userId} />
                      <input type="hidden" name="redirectTo" value={`/profile/${userId}`} />
                      <Button
                        type="submit"
                        variant={viewerReaction?.status === "LIKE" ? "primary" : "secondary"}
                        className="w-full"
                      >
                        ♥ Like
                      </Button>
                    </form>
                  </div>
                  {viewerReaction?.status === "LIKE" && (
                    <p className="mt-2 text-xs text-gray-500">
                      You liked {user.name} — if they like you back, you&apos;ll match.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Want to build together?</p>
                  <form
                    action={async () => {
                      "use server";
                      await signIn("linkedin");
                    }}
                    className="mt-3"
                  >
                    <Button type="submit" className="w-full">
                      Sign in to like this profile
                    </Button>
                  </form>
                </>
              )}
            </div>

            {user.project && (
              <div className="mb-5 border-b border-gray-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Their project</p>
                <a href={`/project/${user.project.id}`} className="group mt-3 block">
                  <span className="block font-semibold text-gray-900 group-hover:text-indigo-600">
                    {user.project.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-500 line-clamp-2">{user.project.tagline}</span>
                  <span className="mt-1 block text-sm text-indigo-600">View project →</span>
                </a>
              </div>
            )}

            {links.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Links</p>
                <div className="mt-3 flex flex-col gap-2">
                  {links.map((link) => (
                    <LinkButton
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      className="w-full justify-between"
                    >
                      <span className="truncate">{link.label}</span>
                      <span aria-hidden="true" className="text-gray-400">
                        ↗
                      </span>
                    </LinkButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
