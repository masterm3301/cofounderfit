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
}

const projects: ShowcaseProject[] = [
  {
    slug: "crystartup",
    name: "Crystartup",
    tagline: "Decentralized crowdfunding for startups, powered by crypto",
    description:
      "A decentralized crowdfunding platform powered by cryptocurrency for startups and mobile applications. Features blockchain-based funding, smart contracts, and crypto payment integration.",
    industry: "Blockchain / Fintech",
    rolesNeeded: ["Blockchain engineer", "Smart contract developer", "Business co-founder"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/crystartup",
  },
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
    slug: "honestvote",
    name: "BlockchainVote",
    tagline: "Transparent, tamper-proof elections on the blockchain",
    description:
      "A decentralized voting system built on blockchain technology, ensuring transparent and tamper-proof elections for organizations and communities.",
    industry: "GovTech / Blockchain",
    rolesNeeded: ["Blockchain engineer", "Frontend engineer"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/honestVote",
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
  },
  {
    slug: "skill-tree",
    name: "Skill Tree AI",
    tagline: "An open, visual tree mapping every learnable skill, root to mastery",
    description:
      "An open, visual, interactive \"tree\" mapping every learnable skill from roots to mastery — each node is a community-maintained markdown file with the best free resources, a learning path, exercises, and \"poneglyphs\": the hard-won insider knowledge no course teaches you. Like roadmap.sh, but fully open, contributor-driven, and covering everything, not just tech. Contributing is simple: edit a markdown node, open a PR. The poneglyph notes unlock structurally once you've traversed the prerequisite nodes.",
    industry: "EdTech / Open Source",
    rolesNeeded: ["Frontend engineer", "Content curator"],
    websiteUrl: "https://github.com/Tree-of-Knowledge/Skill-Tree",
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
