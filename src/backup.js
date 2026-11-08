import * as XLSX from 'xlsx';
import {blankData,collectionKeys,normalizeData} from './data.js';

const META_SHEET='__meta';
const SETTINGS_SHEET='__settings';
const BACKUP_FORMAT='offline-teacher-app-backup';

export function createBackupFile(data){
 const workbook=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet([{format:BACKUP_FORMAT,version:1,exportedAt:new Date().toISOString()}]),META_SHEET);
 XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet([{...blankData.settings,...data.settings}]),SETTINGS_SHEET);
 for(const key of collectionKeys)XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet(Array.isArray(data[key])?data[key]:[]),key);
 return XLSX.write(workbook,{bookType:'xlsx',type:'array',compression:true});
}

export function readBackupFile(buffer,currentData){
 const workbook=XLSX.read(buffer,{type:'array'});
 const meta=workbook.Sheets[META_SHEET]?XLSX.utils.sheet_to_json(workbook.Sheets[META_SHEET],{defval:''}):[];
 if(meta[0]?.format!==BACKUP_FORMAT)throw new Error('This is not a teacher app backup workbook.');
 const next=normalizeData(currentData);
 for(const key of collectionKeys){
  if(workbook.Sheets[key])next[key]=XLSX.utils.sheet_to_json(workbook.Sheets[key],{defval:''});
 }
 if(workbook.Sheets[SETTINGS_SHEET]){
  const rows=XLSX.utils.sheet_to_json(workbook.Sheets[SETTINGS_SHEET],{defval:''});
  if(rows[0])next.settings={...next.settings,...rows[0]};
 }
 return next;
}
