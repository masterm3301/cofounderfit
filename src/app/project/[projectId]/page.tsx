import { notFound } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { getProjectById } from "@/lib/project";
import { reactToProjectAction } from "@/app/actions/reaction";
import { Button, LinkButton } from "@/components/Button";
import { COMMITMENT_LABELS } from "@/lib/labels";

export default async function PublicProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;
  const project = await getProjectById(projectId, viewerId);
  if (!project) notFound();

  const isOwner = viewerId === project.ownerId;

  const links = [
    { label: "Website", url: project.websiteUrl },
    { label: "Pitch deck", url: project.deckUrl },
    { label: "Demo", url: project.demoUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <a href="/discover/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to projects
      </a>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
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
            {project.equityOffered && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Equity: {project.equityOffered}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">{project.name}</h1>
          <p className="mt-3 text-lg text-gray-600">{project.tagline}</p>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">About the project</h2>
            <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{project.description}</p>
          </section>

          {project.rolesNeeded.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Looking for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.rolesNeeded.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                  >
                    {role}
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
              {isOwner ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Your project</span>
                  <LinkButton href="/project/edit" variant="secondary" size="sm">
                    Edit
                  </LinkButton>
                </div>
              ) : viewerId ? (
                <>
                  <p className="text-sm font-medium text-gray-700">Interested in joining?</p>
                  <div className="mt-3 flex gap-2">
                    <form action={reactToProjectAction.bind(null, "PASS")} className="flex-1">
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="ownerId" value={project.ownerId} />
                      <input type="hidden" name="redirectTo" value={`/project/${project.id}`} />
                      <Button
                        type="submit"
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
                      <input type="hidden" name="redirectTo" value={`/project/${project.id}`} />
                      <Button
                        type="submit"
                        variant={project.viewerReaction === "LIKE" ? "primary" : "secondary"}
                        className="w-full"
                      >
                        ♥ Like
                      </Button>
                    </form>
                  </div>
                  {project.viewerReaction === "LIKE" && (
                    <p className="mt-2 text-xs text-gray-500">
                      You liked this project — if {project.owner.name} likes you back, you&apos;ll match.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Interested in joining?</p>
                  <form
                    action={async () => {
                      "use server";
                      await signIn("linkedin");
                    }}
                    className="mt-3"
                  >
                    <Button type="submit" className="w-full">
                      Sign in to like this project
                    </Button>
                  </form>
                </>
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Founder</p>
            <a href={`/profile/${project.owner.id}`} className="group mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
                {project.owner.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900 truncate group-hover:text-indigo-600">
                  {project.owner.name}
                </span>
                <span className="block text-sm text-indigo-600">View profile →</span>
              </span>
            </a>

            {(project.commitmentExpected || project.equityOffered) && (
              <dl className="mt-5 border-t border-gray-100 pt-5 space-y-4">
                {project.commitmentExpected && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Commitment</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {COMMITMENT_LABELS[project.commitmentExpected]}
                    </dd>
                  </div>
                )}
                {project.equityOffered && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Equity offered</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">{project.equityOffered}</dd>
                  </div>
                )}
              </dl>
            )}

            {links.length > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Links</p>
                <div className="mt-3 flex flex-col gap-2">
                  {links.map((link) => (
                    <LinkButton
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      className="w-full justify-between"
                    >
                      {link.label}
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
