// app/api/quest/route.ts
import { NextResponse, NextRequest } from "next/server";
import { dbPromise } from "@/lib/mongo";

export async function GET() {
  const db = await dbPromise;
  const quests = await db.collection("quest").find({}).toArray();
  return NextResponse.json({ quests });
}

export async function POST(req: NextRequest) {
  const db = await dbPromise;
  const body = await req.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const collection = db.collection("quest");

  const now = new Date().toISOString();

  const docs = await db.collection("quest").find({}).toArray();
  console.log(docs);

  const result = await collection.findOneAndUpdate(
    { slug },
    {
      $set: { latestTimestamp: now },
      $inc: { count: 1 },
    },
    { returnDocument: "after" }
  );

  if (!result || !result.value) {
    return NextResponse.json({ error: "Quest not found or not updated" }, { status: 404 });
  }
  
  return NextResponse.json({ updated: result.value });
}