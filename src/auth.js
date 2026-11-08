const enc=new TextEncoder();
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)))}
export async function hashSecret(secret,salt){const s=salt||crypto.getRandomValues(new Uint8Array(16));const material=await crypto.subtle.importKey('raw',enc.encode(secret),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:210000,hash:'SHA-256'},material,256);return {salt:b64(s),hash:b64(bits)}}
export async function verifySecret(secret,record){const expected=await hashSecret(secret,Uint8Array.from(atob(record.salt),c=>c.charCodeAt(0)));return expected.hash===record.hash}
export function makeRecovery(){const bytes=crypto.getRandomValues(new Uint8Array(12));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase().match(/.{1,4}/g).join('-')}
