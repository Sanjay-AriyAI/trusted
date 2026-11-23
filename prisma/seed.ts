/**
 * Development seed. Site scope: programme/FAQ/testimonial copy lives in lib/content (typed files),
 * so the only data to seed is a sample lead + assessment response for checking the DB in Prisma Studio.
 * Idempotent, and refuses to run against production.
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

config({ path: ".env.local" });
config();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed sample data in production.");
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (see .env.example).");

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const email = "sample.lead@example.com";
    const existing = await db.lead.findFirst({ where: { email } });
    if (existing) {
      console.log("Seed data already present — nothing to do.");
      return;
    }
    const lead = await db.lead.create({
      data: { name: "Sample Lead", email, track: "Certified AI Engineer", source: "seed" },
    });
    await db.assessmentResponse.create({
      data: {
        answers: [
          { questionId: "usage", answerIndex: 1 },
          { questionId: "goal", answerIndex: 1 },
          { questionId: "technical", answerIndex: 1 },
        ],
        result: "Certified AI Engineer",
        leadId: lead.id,
      },
    });
    console.log(`Seeded sample lead ${lead.id} with a linked assessment response.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
