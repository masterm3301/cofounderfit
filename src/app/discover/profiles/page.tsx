import { requireCompleteProfile } from "@/lib/session";
import { listProfiles } from "@/lib/profile";
import { clampPage } from "@/lib/pagination";
import { ProfileCard } from "@/components/ProfileCard";
import { LinkButton } from "@/components/Button";

export default async function DiscoverProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const viewerId = await requireCompleteProfile();

  const { page } = await searchParams;
  const { profiles, totalPages } = await listProfiles(Number(page), viewerId);
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Discover</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">People looking to build</h1>
        <p className="mt-2 text-gray-500">
          Browse builders looking for a co-founder. Like the ones that fit — if they like you back,
          you&apos;re matched.
        </p>
      </header>

      {profiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
          <p className="font-medium text-gray-900">No profiles yet</p>
          <p className="mt-1 text-sm text-gray-500">Check back soon — new builders join every day.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} viewerId={viewerId} currentPage={currentPage} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
          <div className="w-24 flex justify-end">
            {currentPage > 1 && (
              <LinkButton href={`/discover/profiles?page=${currentPage - 1}`} variant="secondary" size="sm">
                ← Previous
              </LinkButton>
            )}
          </div>
          <span className="text-sm text-gray-500 tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <div className="w-24">
            {currentPage < totalPages && (
              <LinkButton href={`/discover/profiles?page=${currentPage + 1}`} variant="secondary" size="sm">
                Next →
              </LinkButton>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
