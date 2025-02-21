import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Run migrations
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    const sql = readFileSync(join(__dirname, 'migrations.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migrations completed successfully');
  } catch (error) {
    // Ignore if tables already exist
    if (!(error as any).message?.includes('already exists')) {
      console.error('Error running migrations:', error);
    }
  }
}

runMigrations();
