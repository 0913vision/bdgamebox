import { dbPromise } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const db = await dbPromise;
    const quests = await db.collection("quest").find({}).toArray();

    const now = new Date();
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const updated = await Promise.all(
      quests.map(async (q) => {
        const cooldownMs = q.cooldown * 1000;
        const last = new Date(q.latestTimestamp);
        const elapsed = now.getTime() - last.getTime();

        // const updatedTime =
        //   elapsed < cooldownMs * 0.5 ? tenMinAgo : new Date(0);
        const updatedTime = new Date(0);
          
        console.log("Quest ID:", q.id);
        return db.collection("quest").updateOne(
          { id: q.id },
          {
            $set: {
              count: 0,
              latestTimestamp: updatedTime,
            },
          }
        );
      })
    );

    return NextResponse.json({ success: true, updated: updated.length });
  } catch (e) {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
