import { auth, signIn } from "@/lib/auth";
import { getHomeStats } from "@/lib/stats";
import { getFeaturedProjects } from "@/lib/project";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

const TESTIMONIALS = [
  {
    quote: "Found my technical co-founder in two weeks. We're now building full-time together.",
    author: "Early user",
  },
  {
    quote:
      "As a non-technical founder, this was the easiest way to find someone who actually wanted to build my idea.",
    author: "Early user",
  },
  {
    quote: "The direct-link profiles kept things simple — no noise, just people actually looking to build something.",
    author: "Early user",
  },
];

const STEPS = [
  { title: "Create your profile", description: "Sign in with LinkedIn and tell us what you're looking for." },
  {
    title: "Discover people & projects",
    description: "Browse profiles looking for a co-founder, or projects looking for one.",
  },
  { title: "Match and connect", description: "Like who you're interested in — when it's mutual, you're matched." },
];

export default async function HomePage() {
  const session = await auth();
  const [stats, featuredProjects] = await Promise.all([getHomeStats(), getFeaturedProjects()]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Find your <span className="text-indigo-600">co-founder</span>.
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          co-founder.fit matches you with people looking to build something — and with existing projects
          looking for someone like you to join.
        </p>
        {session?.user ? (
          <p className="mt-6 text-gray-700">Welcome back, {session.user.name}.</p>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("linkedin");
            }}
            className="mt-6"
          >
            <Button type="submit">Sign in with LinkedIn</Button>
          </form>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.profileCount}</p>
          <p className="text-sm text-gray-500 mt-1">Profiles</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.projectCount}</p>
          <p className="text-sm text-gray-500 mt-1">Projects</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{stats.matchCount}</p>
          <p className="text-sm text-gray-500 mt-1">Matches made</p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto font-bold">
                {i + 1}
              </div>
              <h3 className="mt-3 font-bold text-gray-900">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Featured projects</h2>
        {featuredProjects.length === 0 ? (
          <p className="text-gray-500">No projects yet — be the first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredProjects.map((project) => (
              <Card key={project.id}>
                <a href={`/project/${project.id}`} className="block">
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.tagline}</p>
                  <p className="text-xs text-gray-500 mt-2">by {project.owner.name}</p>
                </a>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">What people are saying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.quote}>
              <p className="text-gray-700 italic">{`"${testimonial.quote}"`}</p>
              <p className="text-sm text-gray-500 mt-3">— {testimonial.author}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 pt-6 flex justify-center gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-900">
          X / Twitter
        </a>
        <a href="#" className="hover:text-gray-900">
          LinkedIn
        </a>
        <a href="mailto:hello@cofounder.fit" className="hover:text-gray-900">
          Contact
        </a>
      </footer>
    </main>
  );
}
