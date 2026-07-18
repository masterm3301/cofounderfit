import { requireCompleteProfile } from "@/lib/session";
import { getMatches } from "@/lib/reaction";
import { Card } from "@/components/Card";

export default async function MatchesPage() {
  const userId = await requireCompleteProfile();
  const matches = await getMatches(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Your Matches</h1>
      {matches.length === 0 ? (
        <p className="text-gray-500">No matches yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <Card key={match.matchId}>
              <p className="font-bold text-gray-900">{match.otherUser.name}</p>
              <a href={`/profile/${match.otherUser.id}`} className="text-indigo-600 hover:underline text-sm">
                View profile
              </a>
              {match.otherUser.project && (
                <>
                  {" "}
                  ·{" "}
                  <a
                    href={`/project/${match.otherUser.project.id}`}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    View project
                  </a>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
