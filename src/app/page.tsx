import { auth, signIn, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">co-founder.fit</h1>
      <div className="flex gap-4 mt-2">
        <a href="/discover/profiles" className="underline">
          Discover Profiles
        </a>
        <a href="/discover/projects" className="underline">
          Discover Projects
        </a>
      </div>
      {session?.user ? (
        <div className="flex flex-col gap-2 mt-4 items-start">
          <p>Signed in as {session.user.name}</p>
          <a href={`/profile/${session.user.id}`} className="underline">
            My profile
          </a>
          <a href="/profile/edit" className="underline">
            Edit profile
          </a>
          <a href="/project/edit" className="underline">
            My project
          </a>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("linkedin");
          }}
          className="mt-4"
        >
          <button type="submit" className="bg-black text-white p-2 rounded">
            Sign in with LinkedIn
          </button>
        </form>
      )}
    </main>
  );
}
