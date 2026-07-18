import type { Commitment, RoleType } from "@prisma/client";

export const COMMITMENT_LABELS: Record<Commitment, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
};

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  TECHNICAL: "Technical",
  BUSINESS: "Business",
  DESIGN: "Design",
  OTHER: "Generalist",
};
