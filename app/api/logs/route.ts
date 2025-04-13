// app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = 'yourDatabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    const db = client.db(dbName);
    const collection = db.collection('logs');

    await collection.insertOne({
      content,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}

export async function GET() {
    try {
      const db = client.db(dbName);
      const collection = db.collection('logs');
  
      const logs = await collection
        .find({})
        .sort({ timestamp: -1 })
        .toArray();
  
      return NextResponse.json({ logs });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ logs: [] });
    }
  }
  