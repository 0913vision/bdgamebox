import { dbPromise } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await dbPromise;
    const stateDoc = await db.collection("state").findOne({});

    if (!stateDoc || typeof stateDoc.level !== "number") {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ level: stateDoc.level });
  } catch (e) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level } = body;

    if (typeof level !== "number") {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const db = await dbPromise;
    const result = await db.collection("state").updateOne(
      {},                            // 단 하나의 문서 (기존 구조 유지)
      { $set: { level } },           // level 필드만 갱신
      { upsert: true }               // 문서가 없으면 새로 생성
    );

    return NextResponse.json({ success: true, level });
  } catch (e) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
