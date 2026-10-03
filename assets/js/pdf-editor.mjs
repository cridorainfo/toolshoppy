const $=id=>document.getElementById(id);
let worker, serial=0, pending=new Map(), fileName='document.pdf', page=0, count=0, view, selected=null, sourceId=null;
let mode='edit', busy=false, changed=false, zoom=1, position=null, history={canUndo:false,canRedo:false}, drag=null, image=null;
function message(text,error=false){$('editorStatus').textContent=text;$('editorStatus').classList.toggle('is-error',error);}
function rpc(method,args={}) {
  if(!worker){
    worker=new Worker('/assets/js/pdf-editor-worker.mjs?v=1',{type:'module'});
    worker.onmessage=({data})=>{const call=pending.get(data.id);if(!call)return;pending.delete(data.id);data.error?call.reject(new Error(data.error)):call.resolve(data.result);};
    worker.onerror=()=>{for(const call of pending.values())call.reject(new Error('The PDF engine stopped. Reopen your original file; unsaved changes may be lost.'));pending.clear();worker.terminate();worker=null;};
  }
  return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});worker.postMessage({id,method,args});});
}
function controls() {
  $('editorWorkspace').setAttribute('aria-busy',String(busy));
  document.querySelectorAll('[data-editor-control]').forEach(el=>el.disabled=busy);
  $('undoEdit').disabled=busy||!history.canUndo;$('redoEdit').disabled=busy||!history.canRedo;
  $('previousEditPage').disabled=busy||page===0;$('nextEditPage').disabled=busy||page>=count-1;
  $('deleteEditObject').disabled=busy||!selected;
  if(selected?.type===1&&!selected.editable){$('editTextValue').disabled=true;$('applyTextEdit').disabled=true;}
}
async function run(task) {if(busy)return;busy=true;controls();try{await task();}catch(e){message(e.message,true);}finally{busy=false;controls();}}
function canvasPaint(canvas,result) {canvas.width=result.width;canvas.height=result.height;canvas.getContext('2d').putImageData(new ImageData(result.pixels,result.width,result.height),0,0);}
async function render() {
  const maxWidth=Math.max(320,Math.min(1100,$('pdfStage').clientWidth-40));
  view=await rpc('render',{page,width:Math.round(maxWidth*zoom)});
  canvasPaint($('pdfCanvas'),view);
  $('pdfSheet').style.width=view.width+'px';$('pdfSheet').style.height=view.height+'px';
  $('pageReadout').textContent=`Page ${page+1} of ${count}`;$('zoomReadout').textContent=Math.round(zoom*100)+'%';
  $('pageJump').value=page+1;$('pageJump').max=count;
  selected=null;sourceId=null;position=null;drawTargets();showProperties();
  $('pageWarning').textContent=view.textCharacters===0?'This page has no selectable text. It may be a scan. You can add text, or use Image OCR to extract wording.':view.grouped?'Some content is grouped inside the PDF. Grouped or specially rendered text is preserved, but cannot be edited here.':'';
  $('pageWarning').hidden=!$('pageWarning').textContent;
  await thumbnails();
}
async function thumbnails() {
  const rail=$('pdfPages');rail.replaceChildren();
  // A bounded window keeps large PDFs responsive and memory usage predictable.
  const first=Math.max(0,Math.min(page-2,count-5)),last=Math.min(count,first+5);
  for(let n=first;n<last;n++){
    const button=document.createElement('button');button.type='button';button.className='pdf-page-thumb';button.dataset.editorControl='';button.disabled=busy;button.setAttribute('aria-label',`Open page ${n+1}`);button.setAttribute('aria-current',n===page?'page':'false');
    const canvas=document.createElement('canvas'),label=document.createElement('span');label.textContent=`${n+1}`;button.append(canvas,label);rail.append(button);
    const thumbnail=await rpc('render',{page:n,width:110,objects:false});canvasPaint(canvas,thumbnail);
    button.addEventListener('click',()=>goPage(n));
  }
}
function drawTargets(){
  const layer=$('pdfTargets');layer.replaceChildren();
  if(!view)return;
  layer.className='pdf-targets mode-'+mode;
  if(mode==='edit'||mode==='select')for(const object of view.objects){
    if(mode==='edit'&&(object.type!==1||!object.text?.trim()))continue;
    const target=document.createElement('button');target.type='button';target.className='pdf-target'+(selected?.id===object.id?' is-selected':'');target.dataset.object=object.id;
    target.style.left=object.x+'px';target.style.top=object.y+'px';target.style.width=Math.max(8,object.width)+'px';target.style.height=Math.max(14,object.height)+'px';
    target.setAttribute('aria-label',object.type===1?`Edit text: ${object.text}`:object.type===3?'Select image':'Select shape');
    target.title=object.type===1?object.text:'Select object';
    target.addEventListener('click',event=>{event.stopPropagation();if(busy)return;select(object);});
    target.addEventListener('pointerdown',event=>{if(mode!=='select'||busy)return;event.preventDefault();select(object);drag={kind:'move',id:object.id,start:point(event),end:point(event)};layer.setPointerCapture(event.pointerId);});
    layer.append(target);
  }
}
function select(object){selected=object;sourceId=object.type===1?object.id:null;position=null;drawTargets();showProperties();controls();if(matchMedia('(max-width: 849px)').matches)$('selectionTitle').scrollIntoView({block:'nearest'});}
function showProperties(){
  const text=selected?.type===1;
  $('selectionTitle').textContent=text?'Edit existing text':selected?'Selected object':mode==='add'?'Add a text box':'Text & appearance';
  $('textControls').hidden=!!selected&&!text;
  $('editTextValue').value=text?selected.text:'';
  $('editFontSize').value=text?Math.round(selected.size*100)/100:16;
  $('editTextColor').value=text?selected.color:'#1e293b';
  $('editFont').value=text?'original':'Helvetica';
  $('originalFontOption').disabled=!text&&sourceId===null;
  $('editTextValue').disabled=text&&!selected.editable;
  $('applyTextEdit').disabled=text&&!selected.editable;
  $('allowTextOverflow').checked=false;
  fontStatus();
  $('selectionHelp').textContent=text?(selected.editable?'Change the wording, then Apply. The original text object is updated in the PDF.':selected.reason):selected?'Drag in Select mode to move this object, or delete it.':'Choose Edit text and click a line on the page. For a new text box, choose Add text and click its position.';
}
function fontStatus(){
  const font=$('editFont').value;
  $('fontStatus').textContent=font==='original'?`${selected?.font||'Selected PDF font'} · ${selected?.embedded?'embedded font':'PDF font resource'}. New characters must be verified; no silent substitution.`:font==='uploaded'?'Your local TTF font will be embedded in the PDF.':`${font} · explicitly selected replacement font.`;
}
function setMode(next){
  mode=next;
  document.querySelectorAll('[data-edit-mode]').forEach(b=>{const active=b.dataset.editMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  if(mode==='add'){
    const previous=selected;sourceId=previous?.type===1?previous.id:null;selected=null;position=null;
    showProperties();if(previous?.type===1){$('editFont').value='original';$('originalFontOption').disabled=false;$('editFontSize').value=previous.size;$('editTextColor').value=previous.color;$('fontStatus').textContent=`New text will reuse ${previous.font}, if its characters are supported.`;}
  }
  drawTargets();
  message(({edit:'Click a text line to edit it.',select:'Select an object. Drag it to move; Delete removes it.',add:'Click the page where the new text should begin.',highlight:'Drag across the area to highlight.',rectangle:'Drag to draw a filled rectangle.',image:'Click the page to place your image.'})[mode]);
}
function point(event){const rect=$('pdfSheet').getBoundingClientRect();return [Math.max(0,Math.min(view.width,(event.clientX-rect.left)*view.width/rect.width)),Math.max(0,Math.min(view.height,(event.clientY-rect.top)*view.height/rect.height))];}
async function edit(command){
  history=await rpc('edit',{page,...command});count=history.count;changed=true;await render();message('Change applied. Download your edited PDF free—no watermark.');
}
async function goPage(n){if(!Number.isInteger(n)||n<0||n>=count||n===page)return;await run(async()=>{const previous=page;page=n;try{await render();message('Page ready.');}catch(e){page=previous;await render();throw e;}});}
async function openFile(file){
  if(!file)return;
  if(changed&&!confirm('Open another PDF? Download your current changes first if you want to keep them.'))return;
  await run(async()=>{
    if(file.size>40*1024*1024)throw new Error('This browser editor supports PDFs up to 40 MB. Try a smaller document.');
    message('Opening privately on your device…');
    const result=await rpc('open',{bytes:await file.arrayBuffer(),password:$('pdfPassword').value});
    fileName=file.name;page=0;count=result.count;history=result;changed=false;zoom=1;
    $('editorWorkspace').hidden=false;$('pdfOpenPanel').hidden=true;$('documentName').textContent=fileName;
    $('signedPdfNotice').hidden=!result.signatures;
    await render();setMode('edit');
  });
}
$('pdfFileInput').addEventListener('change',event=>{openFile(event.target.files[0]);event.target.value='';});
$('openPdfButton').addEventListener('click',()=>$('pdfFileInput').click());
$('replacePdfButton').addEventListener('click',()=>$('pdfFileInput').click());
$('pdfOpenPanel').addEventListener('dragover',e=>e.preventDefault());
$('pdfOpenPanel').addEventListener('drop',e=>{e.preventDefault();openFile(e.dataTransfer.files[0]);});
document.querySelectorAll('[data-edit-mode]').forEach(b=>b.addEventListener('click',()=>{if(!busy)setMode(b.dataset.editMode);}));
$('editFont').addEventListener('change',fontStatus);
$('loadEditFont').addEventListener('change',event=>run(async()=>{
  const file=event.target.files[0];if(!file)return;if(file.size>10*1024*1024)throw new Error('Choose a TTF font smaller than 10 MB.');
  const bytes=await file.arrayBuffer();if(new DataView(bytes).getUint32(0)!==0x00010000)throw new Error('Choose a TrueType (.ttf) font.');
  await rpc('font',{bytes});$('uploadedFontOption').disabled=false;$('uploadedFontOption').textContent=file.name;$('editFont').value='uploaded';fontStatus();message('Font loaded locally. Apply to embed it.');
}));
$('applyTextEdit').addEventListener('click',()=>run(async()=>{
  if(!selected&&!position)throw new Error('Choose Add text and click the page to place the text.');
  if(selected&&!selected.editable)throw new Error(selected.reason||'Select editable text.');
  await edit({action:'text',id:selected?.id,sourceId,text:$('editTextValue').value,font:$('editFont').value,size:Number($('editFontSize').value),color:$('editTextColor').value,allowOverflow:$('allowTextOverflow').checked,x:position?.[0],y:position?.[1],width:view.width,height:view.height});
}));
$('deleteEditObject').addEventListener('click',()=>run(async()=>{if(selected)await edit({action:'delete',id:selected.id});}));
$('undoEdit').addEventListener('click',()=>run(async()=>{history=await rpc('undo');count=history.count;changed=true;await render();message('Change undone.');}));
$('redoEdit').addEventListener('click',()=>run(async()=>{history=await rpc('redo');count=history.count;changed=true;await render();message('Change restored.');}));
$('rotateEditPage').addEventListener('click',()=>run(()=>edit({action:'rotate'})));
$('previousEditPage').addEventListener('click',()=>goPage(page-1));$('nextEditPage').addEventListener('click',()=>goPage(page+1));
$('pageJump').addEventListener('change',()=>goPage(Number($('pageJump').value)-1));
for(const [id,delta]of [['editorZoomOut',-.25],['editorZoomIn',.25]])$(id).addEventListener('click',()=>run(async()=>{zoom=Math.min(2,Math.max(.5,zoom+delta));await render();}));
$('downloadEditedPdf').addEventListener('click',()=>run(async()=>{
  const {bytes}=await rpc('save');TS.downloadBlob(new Blob([bytes],{type:'application/pdf'}),fileName.replace(/\.pdf$/i,'')+'-edited.pdf');changed=false;message('Downloaded free. No watermark, account or payment required.');
}));
$('pdfTargets').addEventListener('pointerdown',event=>{
  if(busy||!view||event.target!==$('pdfTargets'))return;
  const p=point(event);
  if(mode==='add'){position=p;message('Text position selected. Enter your wording and click Apply.');$('editTextValue').focus();return;}
  if(mode==='image'&&image){run(async()=>{const w=Math.min(view.width*.35,image.width),h=w*image.height/image.width;await edit({action:'image',pixels:image.pixels,pixelWidth:image.width,pixelHeight:image.height,x:p[0],y:p[1],w,h,width:view.width,height:view.height});image=null;setMode('select');});return;}
  if(['rectangle','highlight'].includes(mode)){event.preventDefault();drag={kind:'shape',start:p,end:p};$('pdfTargets').setPointerCapture(event.pointerId);}
});
$('pdfTargets').addEventListener('pointermove',event=>{
  if(!drag)return;drag.end=point(event);
  if(drag.kind==='shape'){const [x,y]=drag.start,[ex,ey]=drag.end;$('pdfDragBox').hidden=false;Object.assign($('pdfDragBox').style,{left:Math.min(x,ex)+'px',top:Math.min(y,ey)+'px',width:Math.abs(ex-x)+'px',height:Math.abs(ey-y)+'px'});}
});
$('pdfTargets').addEventListener('pointerup',event=>{
  if(!drag)return;const d=drag;drag=null;$('pdfDragBox').hidden=true;
  const end=point(event),dx=end[0]-d.start[0],dy=end[1]-d.start[1];if(Math.hypot(dx,dy)<4)return;
  run(async()=>{
    if(d.kind==='move')await edit({action:'move',id:d.id,from:d.start,to:end,width:view.width,height:view.height});
    else await edit({action:'shape',x:Math.min(d.start[0],end[0]),y:Math.min(d.start[1],end[1]),w:Math.abs(dx),h:Math.abs(dy),width:view.width,height:view.height,color:mode==='highlight'?'#ffdf36':$('editTextColor').value,highlight:mode==='highlight'});
  });
});
$('pdfTargets').addEventListener('pointercancel',()=>{drag=null;$('pdfDragBox').hidden=true;});
$('insertImageButton').addEventListener('click',()=>$('editorImageFile').click());
$('editorImageFile').addEventListener('change',event=>run(async()=>{
  const file=event.target.files[0];if(!file)return;if(file.size>15*1024*1024)throw new Error('Choose an image smaller than 15 MB.');
  const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  image={pixels:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height};setMode('image');event.target.value='';
}));
document.addEventListener('keydown',event=>{
  if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||busy)return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'redoEdit':'undoEdit').click();}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(view)$('downloadEditedPdf').click();}
  if(event.key==='Delete'&&selected){event.preventDefault();$('deleteEditObject').click();}
});
window.addEventListener('beforeunload',event=>{if(changed){event.preventDefault();event.returnValue='';}});
controls();
