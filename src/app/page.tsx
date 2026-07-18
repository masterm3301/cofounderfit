import { auth, signIn } from "@/lib/auth";
import { getHomeStats } from "@/lib/stats";
import { getFeaturedProjects } from "@/lib/project";
import { Button, LinkButton } from "@/components/Button";

const TESTIMONIALS = [
  {
    quote:
      "Found my technical co-founder in two weeks. We're now building full-time together.",
    author: "Early user",
  },
  {
    quote:
      "As a non-technical founder, this was the easiest way to find someone who actually wanted to build my idea.",
    author: "Early user",
  },
  {
    quote:
      "The direct-link profiles kept things simple — no noise, just people actually looking to build something.",
    author: "Early user",
  },
];

const STEPS = [
  {
    title: "Make your profile",
    description:
      "Sign in with LinkedIn, add your skills, and say what you're looking for. Takes two minutes.",
  },
  {
    title: "Browse the network",
    description:
      "Discover founders looking for a partner — and projects looking for someone exactly like you.",
  },
  {
    title: "Match when it's mutual",
    description:
      "Like the people and projects that fit. When the interest goes both ways, you're connected.",
  },
];

function SignInButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("linkedin");
      }}
    >
      <Button type="submit" className={className}>
        {label}
      </Button>
    </form>
  );
}

export default async function HomePage() {
  const session = await auth();
  const [stats, featuredProjects] = await Promise.all([
    getHomeStats(),
    getFeaturedProjects(),
  ]);

  const statItems = [
    { value: stats.profileCount, label: "Builders" },
    { value: stats.projectCount, label: "Open projects" },
    { value: stats.matchCount, label: "Matches made" },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-24 flex justify-center pointer-events-none"
        >
          <div className="h-80 w-[40rem] rounded-full bg-gradient-to-tr from-indigo-200 via-indigo-100 to-transparent blur-3xl opacity-70" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Free forever
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-gray-900">
            Your co-founder
            <br className="hidden sm:block" /> is out there.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
            Startups are a team sport. <br className="hidden sm:block" />
            Meet people who want to build something from scratch{" "}
            <br className="hidden sm:block" />
            or join a project that needs exactly what you bring.
          </p>

          {session?.user ? (
            <div className="mt-10">
              <p className="text-sm text-gray-500">
                Welcome back,{" "}
                <span className="font-medium text-gray-900">
                  {session.user.name}
                </span>
                . Jump back in:
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <LinkButton href="/discover/profiles">
                  Browse profiles
                </LinkButton>
                <LinkButton
                  href="/discover/projects"
                  variant="secondary"
                  className="bg-white"
                >
                  Browse projects
                </LinkButton>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <SignInButton label="Get started with LinkedIn" />
              <LinkButton
                href="#how-it-works"
                variant="secondary"
                className="bg-white"
              >
                See how it works
              </LinkButton>
            </div>
          )}

          <dl className="mt-16 flex items-center justify-center divide-x divide-gray-200">
            {statItems.map((stat) => (
              <div key={stat.label} className="px-8 sm:px-12">
                <dd className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs sm:text-sm text-gray-500">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-gray-50 border-y border-gray-100 scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-600">
            How it works
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900">
            From stranger to co-founder in three steps
          </h2>
          <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            <div
              aria-hidden="true"
              className="hidden sm:block absolute top-5 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-indigo-200"
            />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto font-bold shadow-sm ring-4 ring-gray-50">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Featured
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Projects looking for a co-founder right now
              </h2>
            </div>
            {featuredProjects.length > 0 && (
              <a
                href="/discover/projects"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
              >
                Browse all projects →
              </a>
            )}
          </div>

          {featuredProjects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 py-14 text-center">
              <p className="font-medium text-gray-900">No projects yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Yours could be the first one on the board.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featuredProjects.map((project) => (
                <a
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-1">
                    {project.tagline}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {(project.owner.name ?? "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {project.owner.name}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-indigo-600 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0"
                    >
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-600">
            From the community
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900">
            People are already matching
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.quote}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="text-4xl leading-none text-indigo-200 font-serif"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 text-gray-700">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-4 text-sm font-medium text-gray-500">
                  — {testimonial.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {!session?.user && (
        <section>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-14 sm:py-16 text-center">
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500 opacity-60"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-indigo-700 opacity-60"
              />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Stop building alone.
                </h2>
                <p className="mt-3 text-indigo-200 max-w-md mx-auto">
                  Create your profile in two minutes and meet someone who wants
                  to build as much as you do.
                </p>
                <div className="mt-8 flex justify-center">
                  <SignInButton
                    label="Get started — it's free"
                    className="!bg-white !text-indigo-600 hover:!bg-indigo-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-6 w-6" />
            <div>
              <p className="font-bold text-gray-900">
                co-founder<span className="text-indigo-600">.fit</span>
              </p>
              <p className="mt-1">
                Match with a co-founder — or a project to join.
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <a
              href="https://www.moharik.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              moharik
            </a>
            <a
              href="https://www.linkedin.com/company/moharikma"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@cofounder.fit"
              className="hover:text-gray-900"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
