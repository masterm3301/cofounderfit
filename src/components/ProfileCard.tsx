import type { Profile, User, ReactionStatus } from "@prisma/client";
import { reactToProfileAction } from "@/app/actions/reaction";

interface ProfileCardProps {
  profile: Profile & { user: User; viewerReaction: ReactionStatus | null };
  viewerId?: string;
  currentPage: number;
}

export function ProfileCard({ profile, viewerId, currentPage }: ProfileCardProps) {
  const bioSnippet =
    profile.bio && profile.bio.length > 140 ? `${profile.bio.slice(0, 140)}…` : profile.bio;
  const isOwnCard = viewerId === profile.userId;

  return (
    <div className="border rounded p-4 hover:bg-gray-50">
      <a href={`/profile/${profile.userId}`} className="block">
        {profile.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={profile.user.name}
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
        )}
        <h2 className="font-bold">{profile.user.name}</h2>
        {profile.location && <p className="text-sm text-gray-600">{profile.location}</p>}
        {bioSnippet && <p className="text-sm mt-1">{bioSnippet}</p>}
        <p className="text-sm mt-1">
          {profile.roleType} · {profile.commitment}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {profile.skills.map((skill) => (
            <span key={skill} className="text-xs bg-gray-200 rounded px-2 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      </a>
      {!isOwnCard && (
        <div className="flex gap-2 mt-3">
          <form action={reactToProfileAction.bind(null, "LIKE")}>
            <input type="hidden" name="toUserId" value={profile.userId} />
            <input type="hidden" name="page" value={currentPage} />
            <button
              type="submit"
              className={`text-sm px-3 py-1 rounded border ${
                profile.viewerReaction === "LIKE" ? "bg-black text-white" : ""
              }`}
            >
              Like
            </button>
          </form>
          <form action={reactToProfileAction.bind(null, "PASS")}>
            <input type="hidden" name="toUserId" value={profile.userId} />
            <input type="hidden" name="page" value={currentPage} />
            <button
              type="submit"
              className={`text-sm px-3 py-1 rounded border ${
                profile.viewerReaction === "PASS" ? "bg-black text-white" : ""
              }`}
            >
              Pass
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
