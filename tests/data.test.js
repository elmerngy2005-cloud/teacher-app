import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {blankData,normalizeData,collectionKeys,isFieldRequired} from '../src/data.js';
import {createBackupFile,readBackupFile} from '../src/backup.js';

test('normal data preserves all valid LocalStorage records',()=>{
 const input={settings:{language:'ar',theme:'dark',appName:'My Class'},students:[{id:'s1',name:'Student'}],payments:[{id:'p1',amount:100}]};
 const result=normalizeData(input);
 assert.deepEqual(result.students,input.students);
 assert.deepEqual(result.payments,input.payments);
 assert.equal(result.settings.language,'ar');
 assert.equal(result.settings.appName,'My Class');
 for(const key of collectionKeys)assert.ok(Array.isArray(result[key]),`${key} should be an array`);
});

test('malformed legacy collections normalize to empty arrays without losing valid collections',()=>{
 const result=normalizeData({students:{old:'bad shape'},centers:'legacy',payments:[{id:'p2'}],settings:null});
 assert.deepEqual(result.students,[]);
 assert.deepEqual(result.centers,[]);
 assert.deepEqual(result.payments,[{id:'p2'}]);
 assert.deepEqual(result.settings,blankData.settings);
});

test('null, arrays, and primitive saved values are safe startup inputs',()=>{
 for(const input of [null,[],false,'legacy']){
  const result=normalizeData(input);
  assert.deepEqual(result.students,[]);
  assert.deepEqual(result.settings,blankData.settings);
 }
});

test('an optional relationship dropdown is not mistaken for a required field',()=>{
 assert.equal(isFieldRequired('groups',['center','select','centers']),false);
 assert.equal(isFieldRequired('attendance',['student','select','students',true]),true);
 assert.equal(isFieldRequired('groups',['name','text',true]),true);
});

test('Excel backup restores settings and records without credentials',()=>{
 const source=normalizeData({settings:{language:'ar',theme:'dark',appName:'Local Class'},students:[{id:'student-1',name:'Lina',createdAt:'2026-01-01'}],payments:[{id:'payment-1',amount:250,status:'paid'}]});
 const bytes=createBackupFile(source);
 const restored=readBackupFile(bytes,blankData);
 assert.deepEqual(restored.students,source.students);
 assert.deepEqual(restored.payments,source.payments);
 assert.deepEqual(restored.settings,source.settings);
});

test('Excel restore rejects unrelated spreadsheets',()=>{
 const workbook=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet([{Name:'Lina'}]),'Students');
 assert.throws(()=>readBackupFile(XLSX.write(workbook,{bookType:'xlsx',type:'array'}),blankData),/backup workbook/);
});
