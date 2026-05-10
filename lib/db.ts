import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;

// Reuse the connection across hot-reloads in development
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('easystoploss');
}

export async function ensureIndexes() {
  const db = await getDb();
  await db.collection('watched_stocks').createIndex({ symbol: 1 }, { unique: true });
  await db.collection('alert_history').createIndex({ symbol: 1, triggeredAt: 1 }, { unique: true });
}
