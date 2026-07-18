import { LinkButton } from "@/components/Button";

export default function AuthErrorPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Sign-in failed</h1>
      <p className="text-gray-500 mt-2">We couldn&apos;t sign you in with LinkedIn. Please try again.</p>
      <LinkButton href="/api/auth/signin" className="mt-4">
        Try again
      </LinkButton>
    </main>
  );
}
