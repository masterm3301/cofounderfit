import type { Profile, User } from "@prisma/client";

interface ProfileCardProps {
  profile: Profile & { user: User };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const bioSnippet =
    profile.bio && profile.bio.length > 140 ? `${profile.bio.slice(0, 140)}…` : profile.bio;

  return (
    <a href={`/profile/${profile.userId}`} className="block border rounded p-4 hover:bg-gray-50">
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
  );
}
