const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const db1 = new DatabaseSync('nep_dict.sqlite3');
const db2 = new DatabaseSync('nepali_dictionary.sqlite3');

console.log('Counting nep_dict.sqlite3:');
const wCount1 = db1.prepare('SELECT count(*) as c FROM word').get();
console.log('Words in nep_dict:', wCount1.c);

// Check sample data from nep_dict
const sample1 = db1.prepare(`
  SELECT w.id, w.value as word, w.part_of_speech as pos, d.id as def_id, d.value as definition, e.value as example
  FROM word w
  LEFT JOIN definition d ON w.id = d.word_id
  LEFT JOIN example e ON d.id = e.definition_id
  LIMIT 5
`).all();
console.log('Sample 1 joined:\n', JSON.stringify(sample1, null, 2));

// Check tbl_component_indv_entry_index from nepali_dictionary.sqlite3
console.log('\nChecking nepali_dictionary.sqlite3:');
const sample2 = db2.prepare(`
  SELECT component_indv_entry_index_id, component_indv_entry_index_title, component_indv_entry_index_comp_type, component_indv_entry_index_entry_type
  FROM tbl_component_indv_entry_index
  LIMIT 10
`).all();
console.log('Sample 2:\n', JSON.stringify(sample2, null, 2));
