import type { Profile, User, ReactionStatus } from "@prisma/client";
import { reactToProfileAction } from "@/app/actions/reaction";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

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
    <Card className="hover:shadow-md transition-shadow">
      <a href={`/profile/${profile.userId}`} className="block">
        {profile.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={profile.user.name}
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
        )}
        <h2 className="font-bold text-gray-900">{profile.user.name}</h2>
        {profile.location && <p className="text-sm text-gray-500">{profile.location}</p>}
        {bioSnippet && <p className="text-sm mt-1 text-gray-700">{bioSnippet}</p>}
        <p className="text-sm mt-1 text-gray-500">
          {profile.roleType} · {profile.commitment}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {profile.skills.map((skill) => (
            <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-0.5">
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
            <Button type="submit" size="sm" variant={profile.viewerReaction === "LIKE" ? "primary" : "secondary"}>
              Like
            </Button>
          </form>
          <form action={reactToProfileAction.bind(null, "PASS")}>
            <input type="hidden" name="toUserId" value={profile.userId} />
            <input type="hidden" name="page" value={currentPage} />
            <Button type="submit" size="sm" variant={profile.viewerReaction === "PASS" ? "primary" : "secondary"}>
              Pass
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
