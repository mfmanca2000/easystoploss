import { MongoClient, Db } from 'mongodb';

// Reuse the connection across hot-reloads in development
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

// Lazy-initialized so the URI is only read at runtime, not at build time
let _clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (_clientPromise) return _clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = new MongoClient(uri).connect();
    }
    _clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    _clientPromise = new MongoClient(uri).connect();
  }

  return _clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('easystoploss');
}

export async function ensureIndexes() {
  const db = await getDb();
  await db.collection('watched_stocks').createIndex({ symbol: 1 }, { unique: true });
  await db.collection('alert_history').createIndex({ symbol: 1, triggeredAt: 1 }, { unique: true });
}
