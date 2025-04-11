// app/api/check/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';

// 환경변수에서 MongoDB 연결 문자열을 읽어옵니다.
const rawUri = process.env.MONGODB_URI;
if (!rawUri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}
const uri: string = rawUri;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db | null = null;

// MongoDB와의 연결을 관리하는 함수입니다.
async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  // MongoClient 인스턴스 생성 후 연결합니다.
  client = new MongoClient(uri);
  
  clientPromise = client.connect();
  await clientPromise;
  
  // 연결 성공 시, 사용할 데이터베이스를 선택합니다.
  const db = client.db('yourDatabase');
  cachedDb = db;
  return db;
}

export async function GET() {
  try {
    // 데이터베이스 연결
    const db = await connectToDatabase();

    // 예시: 'yourCollection' 컬렉션의 문서 수를 가져옵니다.
    const count = await db.collection('yourCollection').countDocuments();

    // 현재 시각을 확인합니다.
    const now = new Date();
    let redirectUrl = '/default';

    /* 
      조건 예시: 
      - 만약 문서 수가 10개 이상이면서 현재 시각이 오전(0~11시)이면 /morning으로,
      - 그 외에는 /evening 또는 기본 경로(/default)로 리다이렉션하도록 구현
    */
    if (count >= 10 && now.getHours() < 12) {
      redirectUrl = '/morning';
    } else if (count < 10 && now.getHours() >= 12) {
      redirectUrl = '/evening';
    }

    // 조건에 따라 클라이언트로 리다이렉션 URL 반환
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error('MongoDB 연결 또는 조건 체크 중 에러 발생:', error);
    // 에러 발생 시, 기본 경로를 전달하도록 설정할 수 있습니다.
    return NextResponse.json({ redirectUrl: '/default' });
  }
}
