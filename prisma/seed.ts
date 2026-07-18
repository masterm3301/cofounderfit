import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const ada = await prisma.user.create({
    data: {
      linkedinId: "seed-ada",
      email: "ada@example.com",
      name: "Ada Lovelace",
      profile: {
        create: {
          bio: "Full-stack engineer, ex-Stripe.",
          skills: ["TypeScript", "Postgres", "System design"],
          roleType: "TECHNICAL",
          commitment: "FULL_TIME",
          hasIdea: true,
          location: "San Francisco, CA",
          coFounderTraitsWanted: "A business co-founder who can sell.",
          linkedinUrl: "https://www.linkedin.com/in/seed-ada",
          otherLinks: ["https://github.com/example-ada"],
        },
      },
      project: {
        create: {
          name: "Loomly",
          tagline: "AI scheduling for freelancers",
          description: "Loomly auto-books client calls around a freelancer's real availability.",
          industry: "Productivity",
          rolesNeeded: ["Business co-founder", "Growth"],
          equityOffered: "15-25%",
          commitmentExpected: "FULL_TIME",
          websiteUrl: "https://example.com/loomly",
        },
      },
    },
  });

  const grace = await prisma.user.create({
    data: {
      linkedinId: "seed-grace",
      email: "grace@example.com",
      name: "Grace Hopper",
      profile: {
        create: {
          bio: "Ex-VP Sales, looking to join a technical co-founder's project.",
          skills: ["Sales", "Fundraising", "GTM strategy"],
          roleType: "BUSINESS",
          commitment: "FULL_TIME",
          hasIdea: false,
          location: "New York, NY",
          coFounderTraitsWanted: "A technical co-founder building something in fintech or AI.",
          linkedinUrl: "https://www.linkedin.com/in/seed-grace",
          otherLinks: [],
        },
      },
    },
  });

  console.log("Seeded users:", { ada: ada.id, grace: grace.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
