// app/page.tsx
import { redirect } from "next/navigation";
import { dbPromise } from "@/lib/mongo";

export default async function HomePage() {
  const db = await dbPromise;
  const state = await db.collection("state").findOne({});

  if (!state || state.level === 0) {
    redirect("/meet");
  }

  redirect("/lab");
}
