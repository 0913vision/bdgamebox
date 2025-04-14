// app/api/quest/init/route.ts
import { dbPromise } from "@/lib/mongo";
import { NextResponse } from "next/server";

const defaultQuests = [
  { slug: "feed", id: "영양 보충하기", cooldown: 5400, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🧪" },
  { slug: "turbidity", id: "탁도 측정하기", cooldown: 3600, latestTimestamp: new Date(0), count: 0, goal: 3, icon: "🔬" },
  { slug: "pollution", id: "오염 제거하기", cooldown: 5400, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🚨" },
  { slug: "analysis", id: "유전자 분석하기", cooldown: 2100, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🧬"},
  { slug: "xray", id: "X-ray 촬영하기", cooldown: 5400, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🦴" },
  { slug: "email", id:"이메일 보내기", cooldown: 3600, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "📧"},
  { slug: "culture", id: "배양", cooldown: 1800, latestTimestamp: new Date(0), count: 0, goal: 2, icon: "🧫" },
];

export async function POST() {
  try {
    const db = await dbPromise;
    const collection = db.collection("quest");

    // 초기화
    await collection.deleteMany({});
    await collection.insertMany(defaultQuests);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "DB init failed" }, { status: 500 });
  }
}
