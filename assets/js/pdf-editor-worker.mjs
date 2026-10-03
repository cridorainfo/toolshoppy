import { PdfEditEngine } from './pdf-edit-engine.mjs';
let engine, current, undo=[], redo=[];
const MAX_HISTORY_BYTES=64*1024*1024;
function trim(stack) { while(stack.length>12 || (stack.length>1 && stack.reduce((n,b)=>n+b.byteLength,0)>MAX_HISTORY_BYTES))stack.shift(); }
function state() { return {count:engine.count,canUndo:undo.length>0,canRedo:redo.length>0}; }
let queue=Promise.resolve();
self.onmessage=({data})=>{
  queue=queue.then(async()=>{
    const {id,method,args={}}=data;
    try {
      if(!engine){const response=await fetch(new URL('../libs/pdfium/pdfium.wasm',import.meta.url));if(!response.ok)throw new Error('The PDF engine could not load. Check your connection and retry.');engine=await PdfEditEngine.create(await response.arrayBuffer());}
      let result;
      if(method==='open') {
        result=engine.open(new Uint8Array(args.bytes),args.password||'');
        current=engine.export();undo=[];redo=[];engine.fontFile=null;
        result={...result,...state()};
      } else if(method==='render')result=engine.render(args.page,args.width,args.objects!==false);
      else if(method==='edit') {
        try {
          engine.mutate(args);const next=engine.export();undo.push(current);trim(undo);current=next;redo=[];result=state();
        } catch(error) {engine.open(current,engine.password);throw error;}
      } else if(method==='undo'||method==='redo') {
        const source=method==='undo'?undo:redo,target=method==='undo'?redo:undo;
        if(source.length){target.push(current);trim(target);current=source.pop();engine.open(current,engine.password);}
        result=state();
      } else if(method==='font') {engine.fontFile=new Uint8Array(args.bytes);result={ok:true};}
      else if(method==='save') result={bytes:engine.export()};
      else throw new Error('Unknown editor request.');
      const transfer=result?.pixels?[result.pixels.buffer]:result?.bytes?[result.bytes.buffer]:[];
      self.postMessage({id,result},transfer);
    } catch(error){self.postMessage({id,error:error.message||'The PDF could not be processed.'});}
  });
};
