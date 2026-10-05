import { neon } from '@neondatabase/serverless';

/**
 * Neon PostgreSQL Raw SQL query helper using @neondatabase/serverless HTTP driver.
 * Uses process.env.DATABASE_URL from environment variables.
 */
export const sql = neon(process.env.DATABASE_URL || '');
