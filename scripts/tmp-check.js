/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('No DATABASE_URL');
  process.exit(1);
}
async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const res = await client.query("select table_schema, table_name from information_schema.tables where table_schema not in ('pg_catalog','information_schema') order by 1,2;");
  console.log(res.rows);
  await client.end();
}
main().catch((err) => { console.error(err); process.exit(1); });
