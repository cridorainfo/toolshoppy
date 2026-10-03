import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {PDFDocument}=require('../assets/libs/pdf-lib.min.js');

test('worker undo/redo, failed changes, download, and reopening isolate documents',async()=>{
  const wasm=fs.readFileSync(new URL('../assets/libs/pdfium/pdfium.wasm',import.meta.url));
  const originalFetch=globalThis.fetch;
  let receive;
  globalThis.self={postMessage:value=>receive(value)};
  globalThis.fetch=async url=>{
    assert.match(String(url),/assets\/libs\/pdfium\/pdfium\.wasm$/);
    return {ok:true,arrayBuffer:async()=>wasm};
  };
  try{
    await import('../assets/js/pdf-editor-worker.mjs');
    let id=0;
    const call=(method,args={})=>new Promise((resolve,reject)=>{
      receive=data=>data.error?reject(new Error(data.error)):resolve(data.result);
      self.onmessage({data:{id:++id,method,args}});
    });
    const doc=await PDFDocument.create();doc.addPage([300,400]).drawText('Before',{x:30,y:300,size:16});
    const bytes=await doc.save();
    assert.equal((await call('open',{bytes})).count,1);
    let v=await call('render',{page:0,width:300});const obj=v.objects.find(o=>o.text==='Before');assert.ok(obj);
    let state=await call('edit',{action:'text',page:0,id:obj.id,text:'After',font:'original',size:16,color:'#000000',allowOverflow:true});
    assert.equal(state.canUndo,true);assert.equal(state.canRedo,false);
    assert.ok((await call('render',{page:0,width:300})).objects.some(o=>o.text==='After'));
    state=await call('undo');assert.equal(state.canRedo,true);
    assert.ok((await call('render',{page:0,width:300})).objects.some(o=>o.text==='Before'));
    await call('redo');
    assert.ok((await call('render',{page:0,width:300})).objects.some(o=>o.text==='After'));
    await assert.rejects(call('edit',{action:'text',page:0,id:obj.id,text:'\n',font:'original',size:16,color:'#000000'}));
    assert.ok((await call('render',{page:0,width:300})).objects.some(o=>o.text==='After'));
    const saved=await call('save');assert.ok(saved.bytes.length>0);
    await call('open',{bytes:saved.bytes});
    assert.ok((await call('render',{page:0,width:300})).objects.some(o=>o.text==='After'));
    state=await call('open',{bytes});assert.equal(state.canUndo,false);assert.equal(state.canRedo,false);
  }finally{globalThis.fetch=originalFetch;delete globalThis.self;}
});

test('UI references exist and free-download structured data matches the visible page',()=>{
  const html=fs.readFileSync(new URL('../tools/pdf/editor/index.html',import.meta.url),'utf8');
  const script=fs.readFileSync(new URL('../assets/js/pdf-editor.mjs',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,'IDs must be unique');
  for(const m of script.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),m[1]);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const app=schemas.find(s=>s['@type']==='WebApplication');assert.equal(app.isAccessibleForFree,true);assert.equal(app.offers.price,'0');
  assert.match(html,/Download PDF — Free/);assert.match(html,/No signup\. No subscription\. No watermark/);
  for(const slot of ['ad-top','ad-sidebar','ad-incontent','ad-sticky-footer'])assert.ok(html.includes(slot));
});
