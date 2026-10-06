import { neon } from '@neondatabase/serverless';

let cachedSql = null;

function getSql() {
  if (!cachedSql) {
    cachedSql = neon(process.env.DATABASE_URL || '');
  }
  return cachedSql;
}

export const sql = getSql();
