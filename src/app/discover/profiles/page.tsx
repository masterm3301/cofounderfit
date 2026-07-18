import { requireCompleteProfile } from "@/lib/session";
import { listProfiles } from "@/lib/profile";
import { clampPage } from "@/lib/pagination";
import { ProfileCard } from "@/components/ProfileCard";

export default async function DiscoverProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCompleteProfile();

  const { page } = await searchParams;
  const { profiles, totalPages } = await listProfiles(Number(page));
  const currentPage = clampPage(Number(page), totalPages);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Discover Profiles</h1>
      {profiles.length === 0 ? (
        <p>No profiles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-6">
        {currentPage > 1 && (
          <a href={`/discover/profiles?page=${currentPage - 1}`} className="underline">
            Prev
          </a>
        )}
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <a href={`/discover/profiles?page=${currentPage + 1}`} className="underline">
            Next
          </a>
        )}
      </div>
    </main>
  );
}
