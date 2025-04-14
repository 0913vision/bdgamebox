// lib/mongo.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};
const dbName = "gameDatabase"; // 실제 사용 중인 DB 이름

// 전역 캐시 사용 (Next.js hot-reloading 대응)
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _cachedDbPromise: Promise<Db> | undefined;
}

let clientPromise: Promise<MongoClient>;
let dbPromise: Promise<Db>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

if (!global._cachedDbPromise) {
  global._cachedDbPromise = clientPromise.then(client => client.db(dbName));
}
dbPromise = global._cachedDbPromise;

export { clientPromise, dbPromise };
