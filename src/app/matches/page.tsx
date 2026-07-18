import { requireCompleteProfile } from "@/lib/session";
import { getMatches } from "@/lib/reaction";

export default async function MatchesPage() {
  const userId = await requireCompleteProfile();
  const matches = await getMatches(userId);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Matches</h1>
      {matches.length === 0 ? (
        <p>No matches yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {matches.map((match) => (
            <li key={match.matchId} className="border rounded p-4">
              <p className="font-bold">{match.otherUser.name}</p>
              <a href={`/profile/${match.otherUser.id}`} className="underline">
                View profile
              </a>
              {match.otherUser.project && (
                <>
                  {" "}
                  ·{" "}
                  <a href={`/project/${match.otherUser.project.id}`} className="underline">
                    View project
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
