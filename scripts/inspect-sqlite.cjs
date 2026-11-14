const { DatabaseSync } = require('node:sqlite');

function inspectDb(path) {
  console.log('=== INSPECTING:', path, '===');
  try {
    const db = new DatabaseSync(path);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables);
    for (const t of tables) {
      console.log('--- Table:', t.name, '---');
      const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
      console.log('Columns:', info.map(c => c.name));
      const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get();
      console.log('Row count:', count.c);
      const sample = db.prepare(`SELECT * FROM ${t.name} LIMIT 3`).all();
      console.log('Sample rows:', JSON.stringify(sample, null, 2));
    }
  } catch (err) {
    console.error('Error inspecting:', err.message);
  }
}

inspectDb('nepali_dictionary.sqlite3');
inspectDb('nep_dict.sqlite3');
