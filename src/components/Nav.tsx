import { auth, signIn, signOut } from "@/lib/auth";
import { Button } from "@/components/Button";

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-lg font-bold tracking-tight text-gray-900">
          co-founder<span className="text-indigo-600">.fit</span>
        </a>
        {session?.user ? (
          <nav className="flex items-center gap-4 text-sm text-gray-700">
            <a href="/discover/profiles" className="hover:text-gray-900">
              Discover Profiles
            </a>
            <a href="/discover/projects" className="hover:text-gray-900">
              Discover Projects
            </a>
            <a href="/matches" className="hover:text-gray-900">
              My Matches
            </a>
            <a href={`/profile/${session.user.id}`} className="hover:text-gray-900">
              My Profile
            </a>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("linkedin");
            }}
          >
            <Button type="submit" size="sm">
              Sign in with LinkedIn
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
