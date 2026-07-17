import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Sign-in failed</h1>
      <p>We couldn&apos;t sign you in with LinkedIn. Please try again.</p>
      <Link href="/api/auth/signin" className="underline">
        Try again
      </Link>
    </main>
  );
}
