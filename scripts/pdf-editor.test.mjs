import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { PdfEditEngine } from '../assets/js/pdf-edit-engine.mjs';
const require=createRequire(import.meta.url);
const {PDFDocument,StandardFonts,rgb}=require('../assets/libs/pdf-lib.min.js');
const wasm=fs.readFileSync(new URL('../assets/libs/pdfium/pdfium.wasm',import.meta.url));
async function sample() {
  const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.TimesRoman);
  const p=doc.addPage([500,600]);
  p.drawRectangle({x:20,y:450,width:450,height:80,color:rgb(.9,.94,1)});
  p.drawText('Original invoice 2026',{x:40,y:490,size:20,font,color:rgb(.1,.2,.4)});
  p.drawText('Keep this searchable',{x:40,y:430,size:12,font});
  doc.addPage([300,400]).drawText('Second page',{x:30,y:300,size:16,font});
  return doc.save();
}
test('native editing retains fonts, removes original wording, and preserves vector pages',async()=>{
  const engine=await PdfEditEngine.create(wasm);
  try {
    const bytes=await sample();engine.open(bytes);
    const view=engine.render(0,750), selected=view.objects.find(o=>o.text?.startsWith('Original'));
    assert.equal(selected.font,'Times-Roman');
    engine.mutate({action:'text',page:0,id:selected.id,text:'Updated invoice 2027',font:'original',size:selected.size,color:selected.color,allowOverflow:true});
    const output=engine.export();engine.open(output);
    const after=engine.render(0,750);
    assert.ok(after.objects.some(o=>o.text==='Updated invoice 2027'&&o.font==='Times-Roman'));
    assert.ok(!after.objects.some(o=>o.text?.includes('Original invoice')));
    assert.ok(after.objects.some(o=>o.text==='Keep this searchable'));
    assert.ok(after.objects.some(o=>o.type===2));
    assert.equal(engine.count,2);
    fs.mkdirSync(new URL('../artifacts/pdf-editor/',import.meta.url),{recursive:true});
    fs.writeFileSync(new URL('../artifacts/pdf-editor/sample.pdf',import.meta.url),bytes);
    fs.writeFileSync(new URL('../artifacts/pdf-editor/edited.pdf',import.meta.url),output);
  } finally {engine.close();}
});
test('addition, deletion, rotation and failed edits survive save and reopen',async()=>{
  const e=await PdfEditEngine.create(wasm);
  try {
    e.open(await sample());let v=e.render(0,500);
    const ob=v.objects.find(o=>o.type===1);
    assert.throws(()=>e.mutate({action:'text',page:0,id:ob.id,text:'A much longer sentence that will exceed the original line by a lot',font:'original',size:20,color:'#000000'}),/wider/);
    assert.ok(e.render(0,500).objects.some(o=>o.text==='Original invoice 2026'));
    e.mutate({action:'text',page:0,text:'Free download',font:'Helvetica',size:14,color:'#000000',x:60,y:220,width:500,height:600});
    v=e.render(0,500);const added=v.objects.find(o=>o.text==='Free download');assert.ok(added);
    e.mutate({action:'move',page:0,id:added.id,width:500,height:600,from:[60,220],to:[80,250]});
    e.mutate({action:'delete',page:0,id:added.id});
    e.mutate({action:'rotate',page:1});
    e.open(e.export());assert.ok(!e.render(0,500).objects.some(o=>o.text==='Free download'));
    const rotated=e.render(1,400);assert.equal(rotated.pageWidth,400);assert.equal(rotated.pageHeight,300);
  }finally{e.close();}
});

test('embedded TrueType font reuse and explicit unsupported-character rejection',async()=>{
  const fontPath='C:/Windows/Fonts/arial.ttf';
  assert.ok(fs.existsSync(fontPath),'A real TrueType fixture is needed for the embedded-font test');
  const e=await PdfEditEngine.create(wasm);
  try {
    e.open(await sample());e.fontFile=fs.readFileSync(fontPath);
    e.mutate({action:'text',page:0,text:'Embedded sample 123',font:'uploaded',size:18,color:'#124578',x:50,y:300,width:500,height:600});
    e.open(e.export());let obj=e.render(0,500).objects.find(o=>o.text==='Embedded sample 123');
    assert.equal(obj.embedded,true);
    const fontName=obj.font;
    e.mutate({action:'text',page:0,id:obj.id,text:'sample 321',font:'original',size:18,color:'#124578'});
    e.open(e.export());obj=e.render(0,500).objects.find(o=>o.text==='sample 321');
    assert.equal(obj.font,fontName);assert.equal(obj.embedded,true);
    assert.throws(()=>e.mutate({action:'text',page:0,id:obj.id,text:'Missing Z',font:'original',size:18,color:'#124578'}),/coverage/);
    assert.ok(e.render(0,500).objects.some(o=>o.text==='sample 321'));
    assert.throws(()=>e.mutate({action:'text',page:0,id:obj.id,text:'مرحبا',font:'original',size:18,color:'#124578'}),/Complex-script/);
  }finally{e.close();}
});

test('repeated font resizing uses the current effective size',async()=>{
  const e=await PdfEditEngine.create(wasm);
  try{
    e.open(await sample());let obj=e.render(0,500).objects.find(o=>o.type===1);
    for(const size of [14,24,16]){
      e.mutate({action:'text',page:0,id:obj.id,text:'Invoice',font:'original',size,color:'#123456',allowOverflow:true});
      e.open(e.export());obj=e.render(0,500).objects.find(o=>o.text==='Invoice');
      assert.ok(Math.abs(obj.size-size)<.01,JSON.stringify(obj));
    }
  }finally{e.close();}
});

test('image and highlight additions preserve text and survive PDF round-trip',async()=>{
  const e=await PdfEditEngine.create(wasm);
  try{
    e.open(await sample());
    e.mutate({action:'shape',page:0,x:30,y:95,w:220,h:24,width:500,height:600,color:'#ffdf36',highlight:true});
    e.mutate({action:'image',page:0,pixels:new Uint8Array([255,0,0,255,0,255,0,255,0,0,255,255,255,255,255,255]),pixelWidth:2,pixelHeight:2,x:40,y:350,w:80,h:80,width:500,height:600});
    e.open(e.export());const v=e.render(0,500);
    assert.ok(v.objects.some(o=>o.type===3));assert.ok(v.objects.some(o=>o.text==='Original invoice 2026'));
    assert.equal(v.objects.filter(o=>o.type===2).length,2);
  }finally{e.close();}
});
