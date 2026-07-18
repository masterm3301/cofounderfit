import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/profile";
import { Card } from "@/components/Card";

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const profile = await getProfile(userId);
  if (!profile) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>
        {profile.location && <p className="text-sm text-gray-500 mt-1">{profile.location}</p>}
        <p className="mt-3 text-gray-700">{profile.bio}</p>
        <p className="text-sm text-gray-500 mt-2">Skills: {profile.skills.join(", ")}</p>
        <p className="text-sm text-gray-500">Role: {profile.roleType}</p>
        <p className="text-sm text-gray-500">Commitment: {profile.commitment}</p>
        {profile.coFounderTraitsWanted && (
          <p className="mt-2 text-gray-700">Looking for: {profile.coFounderTraitsWanted}</p>
        )}
        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} className="text-indigo-600 hover:underline block mt-2">
            LinkedIn
          </a>
        )}
        <ul className="mt-1">
          {profile.otherLinks.map((link) => (
            <li key={link}>
              <a href={link} className="text-indigo-600 hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
