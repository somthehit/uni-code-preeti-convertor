const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('nep_dict.sqlite3');

const rows = db.prepare('SELECT value FROM word').all();
const letterCounts = {};

for (const r of rows) {
  const w = r.value.trim();
  if (!w) continue;
  // Get first character or consonant
  const firstChar = w[0];
  letterCounts[firstChar] = (letterCounts[firstChar] || 0) + 1;
}

console.log('Total words:', rows.length);
console.log('Starting characters distribution:');
const sorted = Object.entries(letterCounts).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 30));
console.log('Total distinct starting chars:', sorted.length);
