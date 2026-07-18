import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Cloudflare Workers can reuse a warm isolate across many unrelated requests.
// A PrismaClient built at module scope would hold a WebSocket-backed Pool
// tied to whichever request created it, and crash with "Cannot perform I/O
// on behalf of a different request" as soon as the isolate is reused for
// someone else's request. `cache()` gives every request its own instance
// (and its own connection) while still deduping within that one request.
export const getDb = cache(() => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
});
