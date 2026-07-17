import { prisma } from "./db";

interface LinkedInProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function upsertUserFromLinkedInProfile(profile: LinkedInProfile) {
  return prisma.user.upsert({
    where: { linkedinId: profile.sub },
    update: { email: profile.email, name: profile.name },
    create: {
      linkedinId: profile.sub,
      email: profile.email,
      name: profile.name,
      profile: {
        create: {
          photoUrl: profile.picture,
          linkedinUrl: `https://www.linkedin.com/in/${profile.sub}`,
        },
      },
    },
    include: { profile: true },
  });
}
