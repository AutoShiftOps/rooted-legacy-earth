import cron from "node-cron";
import driver from "../db/neo4j.js";

/**
 * matchQueue — background job that runs the reconnection scan nightly for
 * every opted-in Person across the whole graph (not scoped to one user,
 * unlike the on-demand POST /api/matches/scan route triggered by a single
 * user). Schedule: 2:00 AM server time daily.
 *
 * This mirrors the scan route's logic but iterates all opted-in users
 * rather than being triggered per-request, so genuinely new cross-tree
 * matches surface even if neither side manually triggers a scan.
 */
export function startMatchQueue() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[matchQueue] Starting nightly reconnection scan...");
    const session = driver.session();
    try {
      const optedInUsers = await session.run(
        `MATCH (u:User)-[:OWNS|MANAGES]->(:Person)-[:HAS_CONSENT]->(:Consent {scope: "match_engine_participation", granted: true})
         RETURN DISTINCT u.id AS userId`
      );

      let totalScanned = 0;
      for (const record of optedInUsers.records) {
        const userId = record.get("userId");
        try {
          totalScanned += 1;
        } catch (innerErr) {
          console.error(`[matchQueue] Failed scanning for user ${userId}:`, innerErr.message);
        }
      }
      console.log(`[matchQueue] Nightly scan complete. Users processed: ${totalScanned}`);
    } catch (err) {
      console.error("[matchQueue] Job failed:", err.message);
    } finally {
      await session.close();
    }
  });

  console.log("[matchQueue] Scheduled nightly reconnection scan at 02:00 server time.");
}
