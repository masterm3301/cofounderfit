import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/profile";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      {profile.location && <p>{profile.location}</p>}
      <p>{profile.bio}</p>
      <p>Skills: {profile.skills.join(", ")}</p>
      <p>Role: {profile.roleType}</p>
      <p>Commitment: {profile.commitment}</p>
      {profile.coFounderTraitsWanted && <p>Looking for: {profile.coFounderTraitsWanted}</p>}
      {profile.linkedinUrl && (
        <a href={profile.linkedinUrl} className="underline">
          LinkedIn
        </a>
      )}
      <ul>
        {profile.otherLinks.map((link) => (
          <li key={link}>
            <a href={link} className="underline">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
