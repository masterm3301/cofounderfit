import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const OWNER_NAME = "Tree of Knowledge";

interface ShowcaseProject {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  rolesNeeded: string[];
  websiteUrl: string;
  // Only one showcase owner gets a Profile so "Tree of Knowledge" appears once in discover
  hasProfile?: boolean;
}

const projects: ShowcaseProject[] = [
  {
    slug: "freecen",
    name: "Freecen",
    tagline: "Censorship-resistant messaging, Telegram-style",
    description:
      "A messaging application similar to Telegram, built around censorship-resistant messaging so conversations stay reachable even under network restrictions.",
    industry: "Communication / Privacy Tech",
    rolesNeeded: ["Mobile engineer", "Backend engineer", "Security engineer"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/freecen",
  },
  {
    slug: "gasurvivor",
    name: "Gaza Survivor",
    tagline: "A survival game that puts you in a civilian's shoes during war",
    description:
      "An educational survival game that simulates the harsh realities of war to promote peace awareness. Players experience the challenges civilians face during conflict, inspired by the Gaza genocide.",
    industry: "Gaming / Social Impact",
    rolesNeeded: ["Game developer", "Narrative designer", "3D artist"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/gasurvivor",
  },
  {
    slug: "maxhour",
    name: "Famous",
    tagline: "One random person gets famous for a week — everyone else watches",
    description:
      "A mobile app called \"Famous\". Each week it selects one random person who becomes the king inside the app: their videos, social posts, and messages get shared and everyone else just watches as that person gets famous — as long as they don't break the rules (no nudity, violence, etc).",
    industry: "Social / Entertainment",
    rolesNeeded: ["Mobile engineer", "Growth", "Community moderator"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/maxhour",
    hasProfile: true,
  },
];

async function main() {
  for (const project of projects) {
    const owner = await prisma.user.upsert({
      where: { linkedinId: `showcase-${project.slug}` },
      update: {},
      create: {
        linkedinId: `showcase-${project.slug}`,
        email: `${project.slug}@treeofknowledge.dev`,
        name: OWNER_NAME,
        ...(project.hasProfile
          ? {
              profile: {
                create: {
                  bio: `Building ${project.name} at Tree of Knowledge.`,
                  skills: ["Product", "Engineering"],
                  roleType: "TECHNICAL",
                  commitment: "FULL_TIME",
                  hasIdea: true,
                  otherLinks: [project.websiteUrl],
                },
              },
            }
          : {}),
      },
    });

    await prisma.project.upsert({
      where: { ownerId: owner.id },
      update: {
        name: project.name,
        tagline: project.tagline,
        description: project.description,
        industry: project.industry,
        rolesNeeded: project.rolesNeeded,
        websiteUrl: project.websiteUrl,
      },
      create: {
        ownerId: owner.id,
        name: project.name,
        tagline: project.tagline,
        description: project.description,
        industry: project.industry,
        rolesNeeded: project.rolesNeeded,
        websiteUrl: project.websiteUrl,
      },
    });

    console.log(`Upserted ${project.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
