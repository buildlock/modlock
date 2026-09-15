import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Pool } from 'pg';

const url = new URL(process.env.DATABASE_URL || '');
if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname) || !['postgres:','postgresql:'].includes(url.protocol)) throw new Error('Shared account tests require a loopback disposable PostgreSQL server.');
const name = `modlock_shared_${randomBytes(8).toString('hex')}`;
const pool = new Pool({ connectionString: url.href, max: 1 });
let created = false;
try {
  await pool.query(`CREATE DATABASE "${name}"`); created = true;
  url.pathname = '/'+name;
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV:'development', DATABASE_URL:url.href, MODLOCK_TEST_SHARED:'1', MODLOCK_ACCOUNT_MODE:'shared', MODLOCK_LOCAL_ACCOUNTS:'0', MODLOCK_ORIGIN:'http://127.0.0.1:4312', PORTFOLIO_CLIENT_SECRET:randomBytes(32).toString('base64url') };
  for (const args of [['scripts/migrate-shared-accounts.ts'],['--test','tests/shared-accounts.integration.ts']]) {
    const result = spawnSync(process.execPath, args, {env, stdio:'inherit'});
    if (result.status !== 0) throw new Error('Shared account verification failed.');
  }
} finally {
  if (created) await pool.query(`DROP DATABASE "${name}"`);
  await pool.end();
}
