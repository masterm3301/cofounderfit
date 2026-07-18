import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { isMatch } from "@/lib/reaction";
import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { LinkButton } from "@/components/Button";

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const userId = await requireCompleteProfile();
  const { with: otherUserId } = await searchParams;

  if (!otherUserId || !(await isMatch(userId, otherUserId))) {
    redirect("/matches");
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    redirect("/matches");
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Card className="max-w-lg text-center">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-600">It&apos;s a match!</h1>
        <p className="mt-2 text-gray-700">You and {otherUser.name} liked each other.</p>
        <div className="flex justify-center gap-4 mt-4">
          <LinkButton href={`/profile/${otherUser.id}`}>View {otherUser.name}&apos;s profile</LinkButton>
          <LinkButton href="/matches" variant="secondary">
            See all matches
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
