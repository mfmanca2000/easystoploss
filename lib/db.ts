import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS watched_stocks (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL UNIQUE,
      current_price DECIMAL(10,4),
      sma150 DECIMAL(10,4),
      last_checked_at TIMESTAMPTZ,
      added_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS alert_history (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      triggered_at DATE NOT NULL,
      current_price DECIMAL(10,4),
      sma150 DECIMAL(10,4),
      UNIQUE(symbol, triggered_at)
    )
  `;
}
