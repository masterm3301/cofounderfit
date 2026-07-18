import { requireCompleteProfile } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { saveProfileAction } from "@/app/actions/profile";

export default async function ProfileEditPage() {
  const userId = await requireCompleteProfile();
  const profile = await getProfile(userId);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Edit your profile</h1>
      <ProfileForm action={saveProfileAction} initialProfile={profile} />
    </main>
  );
}
