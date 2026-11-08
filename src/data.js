import {storage} from './storage.js';

export const blankData={
 settings:{language:'en',theme:'light',appName:'Classroom'},
 students:[],groups:[],centers:[],attendance:[],payments:[],exams:[],
 recitation:[],finance:[],suppliers:[],expenses:[]
};

export const collectionKeys=['students','groups','centers','attendance','payments','exams','recitation','finance','suppliers','expenses'];
export const requiredFields={students:['name'],groups:['name'],centers:['name'],attendance:['date','student'],payments:['date','student','amount'],exams:['date','student','subject','score'],recitation:['date','student'],finance:['date','center','description','amount'],suppliers:['name'],expenses:['date','description','amount']};
export const isFieldRequired=(collection,field)=>requiredFields[collection]?.includes(field[0])===true;

export function normalizeData(saved){
 const source=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
 const result={...blankData,...source};
 result.settings={...blankData.settings,...(source.settings&&typeof source.settings==='object'&&!Array.isArray(source.settings)?source.settings:{})};
 for(const key of collectionKeys)if(!Array.isArray(result[key]))result[key]=[];
 return result;
}

export function readAppData(){try{return normalizeData(storage.get('data',{}))}catch{return normalizeData(null)}}
