import { connection } from "next/server";
import { getDb } from "@/lib/server/db";

/** Liveness + database check for uptime monitors. Always evaluated at request time. */
export async function GET() {
  await connection();
  try {
    await getDb().$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "up" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[health] database check failed", error);
    return Response.json(
      { status: "degraded", database: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
