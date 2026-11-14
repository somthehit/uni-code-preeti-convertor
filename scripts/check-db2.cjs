const { DatabaseSync } = require('node:sqlite');
const db2 = new DatabaseSync('nepali_dictionary.sqlite3');

const uniqueTitles = db2.prepare('SELECT count(distinct component_indv_entry_index_title) as c FROM tbl_component_indv_entry_index').get();
console.log('Unique titles in db2:', uniqueTitles.c);

const searchIndexCount = db2.prepare('SELECT count(distinct search_index_title) as c FROM tbl_search_index').get();
console.log('Unique titles in search_index:', searchIndexCount.c);
