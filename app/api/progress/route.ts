import { dbPromise } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const levelParam = searchParams.get("level");

  if (!levelParam) {
    return NextResponse.json({ error: "Missing level parameter" }, { status: 400 });
  }

  const level = Number(levelParam);
  if (isNaN(level)) {
    return NextResponse.json({ error: "Invalid level parameter" }, { status: 400 });
  }
  if (level === 99) {
    return NextResponse.json({ time: new Date(0).toISOString() });
  }

  try {
    const db = await dbPromise;
    const doc = await db.collection("progress").findOne({ level });

    if (!doc || !doc.time) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 });
    }

    return NextResponse.json({ time: doc.time });
  } catch (e) {
    console.error("Progress GET error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
