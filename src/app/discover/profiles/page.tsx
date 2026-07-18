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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Discover Profiles</h1>
      {profiles.length === 0 ? (
        <p className="text-gray-500">No profiles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} viewerId={viewerId} currentPage={currentPage} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <LinkButton href={`/discover/profiles?page=${currentPage - 1}`} variant="secondary" size="sm">
            Prev
          </LinkButton>
        )}
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <LinkButton href={`/discover/profiles?page=${currentPage + 1}`} variant="secondary" size="sm">
            Next
          </LinkButton>
        )}
      </div>
    </main>
  );
}
