const PREFIX='offlineTeacher.';
export class StorageError extends Error { constructor(message,cause){super(message,{cause});this.name='StorageError';} }
export const storage={
 get(key,fallback=null){try{const raw=localStorage.getItem(PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch(error){throw new StorageError(`Could not read ${key}`,error)}},
 set(key,value){try{const serialized=JSON.stringify(value);localStorage.setItem(PREFIX+key,serialized);const bytes=new Blob([serialized]).size;const used=Object.keys(localStorage).reduce((n,k)=>n+k.length+localStorage.getItem(k).length,0);if(used>4_000_000)window.dispatchEvent(new CustomEvent('storage-warning',{detail:'near'}));if(bytes>4_000_000)window.dispatchEvent(new CustomEvent('storage-warning',{detail:'near'}));return true}catch(error){window.dispatchEvent(new CustomEvent('storage-warning',{detail:'failed'}));throw new StorageError('Could not save data. Browser storage may be full.',error)}},
 remove(key){try{localStorage.removeItem(PREFIX+key)}catch(error){throw new StorageError(`Could not remove ${key}`,error)}},
 exportAll(){const result={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(PREFIX)){const name=k.slice(PREFIX.length);if(!['credentials','session'].includes(name))result[name]=JSON.parse(localStorage.getItem(k))}}return result}
};
