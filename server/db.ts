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
    // Split into individual statements and execute
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      await supabase.from('_migrations').rpc('raw_sql', { sql: statement });
    }
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

runMigrations();
