require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');
const { Pool } = require('pg');

const sourcePath = path.resolve(process.env.SQLITE_SOURCE_PATH || path.join(__dirname, 'dev.db'));
const targetUrl = process.env.DATABASE_URL;

if (!targetUrl || !targetUrl.startsWith('postgresql://')) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string before running this transfer.');
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`SQLite source database was not found at ${sourcePath}.`);
}

const columns = [
  'id', 'firstName', 'lastName', 'email', 'phone', 'password', 'role', 'isVerified',
  'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'refreshToken',
  'profileImage', 'createdAt', 'updatedAt',
];

async function main() {
  const SQL = await initSqlJs();
  const sqlite = new SQL.Database(fs.readFileSync(sourcePath));
  const result = sqlite.exec(`SELECT ${columns.map((column) => `\"${column}\"`).join(', ')} FROM \"User\"`);
  const rows = result.length === 0
    ? []
    : result[0].values.map((values) => Object.fromEntries(result[0].columns.map((column, index) => [column, values[index]])));

  const pool = new Pool({ connectionString: targetUrl });
  const client = await pool.connect();
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const quotedColumns = columns.map((column) => `\"${column}\"`).join(', ');
  const updates = columns
    .filter((column) => column !== 'id')
    .map((column) => `\"${column}\" = EXCLUDED.\"${column}\"`)
    .join(', ');
  const insert = `INSERT INTO \"User\" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT (\"id\") DO UPDATE SET ${updates}`;

  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const values = columns.map((column) => column === 'isVerified' ? Boolean(row[column]) : row[column]);
      await client.query(insert, values);
    }
    await client.query('COMMIT');

    const ids = rows.map((row) => row.id);
    const { rows: [{ count }] } = await client.query(
      'SELECT COUNT(*)::int AS count FROM \"User\" WHERE \"id\" = ANY($1::text[])',
      [ids],
    );
    if (Number(count) !== rows.length) {
      throw new Error(`Transfer verification failed: SQLite has ${rows.length} users but PostgreSQL contains ${count} matching user IDs.`);
    }
    console.log(`Transferred ${rows.length} user record(s) from ${sourcePath} to PostgreSQL.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
