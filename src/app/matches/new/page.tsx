import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/session";
import { isMatch } from "@/lib/reaction";
import { prisma } from "@/lib/db";

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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">It&apos;s a match!</h1>
      <p>You and {otherUser.name} liked each other.</p>
      <div className="flex gap-4 mt-4">
        <a href={`/profile/${otherUser.id}`} className="underline">
          View {otherUser.name}&apos;s profile
        </a>
        <a href="/matches" className="underline">
          See all matches
        </a>
      </div>
    </main>
  );
}
