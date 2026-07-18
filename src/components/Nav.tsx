import { auth, signIn, signOut } from "@/lib/auth";
import { Button } from "@/components/Button";
import { NavLinks } from "@/components/NavLinks";

export async function Nav() {
  const session = await auth();

  const links = session?.user
    ? [
        { href: "/discover/profiles", label: "Profiles" },
        { href: "/discover/projects", label: "Projects" },
        { href: "/matches", label: "Matches" },
        { href: `/profile/${session.user.id}`, label: "My profile" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-16 w-16" />
          {/* <span className="text-indigo-600">.FIT</span> */}
        </a>

        {session?.user ? (
          <NavLinks links={links}>
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
          </NavLinks>
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
