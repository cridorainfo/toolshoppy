// Native PDF object editing. Runs in a worker; no document bytes leave the device.
import { init } from '../libs/pdfium/pdfium.mjs';

export class PdfEditEngine {
  static async create(wasmBinary) {
    const api = await init({ wasmBinary });
    api.PDFiumExt_Init();
    return new PdfEditEngine(api);
  }
  constructor(api) { this.api = api; this.doc = 0; this.input = 0; this.fontFile = null; }
  alloc(size) {
    const ptr = this.api.pdfium.wasmExports.malloc(size);
    if (!ptr) throw new Error('Not enough memory. Try a smaller PDF.');
    return ptr;
  }
  free(ptr) { this.api.pdfium.wasmExports.free(ptr); }
  memory() { return this.api.pdfium.HEAPU8; }
  floats(ptr, n) { return Array.from(new Float32Array(this.memory().buffer, ptr, n)); }
  check(ok, message) { if (!ok) throw new Error(message); }
  close() {
    if (this.doc) this.api.FPDF_CloseDocument(this.doc);
    if (this.input) this.free(this.input);
    this.doc = this.input = 0;
  }
  open(bytes, password = '') {
    const ptr = this.alloc(bytes.length);
    this.memory().set(bytes, ptr);
    const doc = this.api.FPDF_LoadMemDocument64(ptr, bytes.length, password);
    if (!doc) { this.free(ptr); const err = this.api.FPDF_GetLastError(); throw new Error(err === 4 ? 'This PDF needs its password. Enter it and open the file again.' : 'This file could not be read as a PDF.'); }
    const count = this.api.FPDF_GetPageCount(doc);
    if (count < 1 || count > 1000) { this.api.FPDF_CloseDocument(doc); this.free(ptr); throw new Error('Choose a PDF with 1–1,000 pages.'); }
    const permissions = this.api.FPDF_GetDocPermissions(doc);
    if (!(permissions & 8)) { this.api.FPDF_CloseDocument(doc); this.free(ptr); throw new Error('This document does not permit content editing. Open an unrestricted copy.'); }
    this.close(); this.doc = doc; this.input = ptr; this.password = password;
    this.count = count;
    this.signatures = this.api.FPDF_GetSignatureCount(doc);
    return { count, signatures: this.signatures };
  }
  page(index) {
    if (!this.doc || !Number.isInteger(index) || index < 0 || index >= this.count) throw new Error('Page is unavailable.');
    const page = this.api.FPDF_LoadPage(this.doc, index);
    this.check(page, 'Could not open this page.');
    return page;
  }
  utf16(text, callback) {
    const ptr = this.alloc((text.length + 1) * 2);
    try { this.api.pdfium.stringToUTF16(text, ptr, (text.length + 1) * 2); return callback(ptr); }
    finally { this.free(ptr); }
  }
  objectText(object, textPage) {
    const size = this.api.FPDFTextObj_GetText(object, textPage, 0, 0);
    if (!size) return '';
    const ptr = this.alloc(size);
    try { this.api.FPDFTextObj_GetText(object, textPage, ptr, size); return this.api.pdfium.UTF16ToString(ptr); }
    finally { this.free(ptr); }
  }
  fontName(font) {
    const size = this.api.FPDFFont_GetBaseFontName(font, 0, 0);
    if (!size) return 'Unknown font';
    const ptr = this.alloc(size);
    try { this.api.FPDFFont_GetBaseFontName(font, ptr, size); return this.api.pdfium.UTF8ToString(ptr); }
    finally { this.free(ptr); }
  }
  fontSize(object) {
    const p = this.alloc(4);
    try { this.check(this.api.FPDFTextObj_GetFontSize(object, p), 'Cannot read font size.'); return this.floats(p, 1)[0]; }
    finally { this.free(p); }
  }
  matrix(object) {
    const p = this.alloc(24);
    try { this.check(this.api.FPDFPageObj_GetMatrix(object, p), 'Cannot read object position.'); return this.floats(p, 6); }
    finally { this.free(p); }
  }
  setMatrix(object, values) {
    const p = this.alloc(24);
    try { new Float32Array(this.memory().buffer, p, 6).set(values); this.check(this.api.FPDFPageObj_SetMatrix(object, p), 'Cannot position this object.'); }
    finally { this.free(p); }
  }
  bounds(object) {
    const p = this.alloc(16);
    try { this.check(this.api.FPDFPageObj_GetBounds(object, p, p+4, p+8, p+12), 'Cannot read object bounds.'); return this.floats(p, 4); }
    finally { this.free(p); }
  }
  color(object) {
    const p = this.alloc(16);
    try {
      if (!this.api.FPDFPageObj_GetFillColor(object, p, p+4, p+8, p+12)) return '#000000';
      return '#' + Array.from(new Uint32Array(this.memory().buffer, p, 3)).map(v => v.toString(16).padStart(2, '0')).join('');
    } finally { this.free(p); }
  }
  setColor(object, hex, alpha = 255) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Choose a valid color.');
    const rgb = [1,3,5].map(n => parseInt(hex.slice(n,n+2),16));
    this.check(this.api.FPDFPageObj_SetFillColor(object, ...rgb, alpha), 'Cannot set color.');
  }
  toDevice(page, width, height, x, y) {
    const p = this.alloc(8);
    try {
      this.check(this.api.FPDF_PageToDevice(page, 0,0,width,height,0,x,y,p,p+4), 'Cannot map page coordinates.');
      return Array.from(new Int32Array(this.memory().buffer,p,2));
    } finally { this.free(p); }
  }
  toPage(page, width, height, x, y) {
    const p = this.alloc(16);
    try {
      this.check(this.api.FPDF_DeviceToPage(page,0,0,width,height,0,Math.round(x),Math.round(y),p,p+8), 'Cannot map position.');
      return Array.from(new Float64Array(this.memory().buffer,p,2));
    } finally { this.free(p); }
  }
  inspect(page, width, height) {
    const a = this.api, textPage = a.FPDFText_LoadPage(page), objects = [];
    let grouped = 0;
    try {
      for (let i=0; i<a.FPDFPage_CountObjects(page); i++) {
        const object = a.FPDFPage_GetObject(page,i), type = a.FPDFPageObj_GetType(object);
        if (type === 5) { grouped++; continue; }
        if (![1,2,3].includes(type)) continue;
        const box = this.bounds(object);
        const corners = [[box[0],box[1]],[box[2],box[3]],[box[0],box[3]],[box[2],box[1]]].map(([x,y])=>this.toDevice(page,width,height,x,y));
        const xs=corners.map(v=>v[0]), ys=corners.map(v=>v[1]);
        const result = { id:i, type, x:Math.min(...xs), y:Math.min(...ys), width:Math.max(...xs)-Math.min(...xs), height:Math.max(...ys)-Math.min(...ys), color:this.color(object) };
        if (type === 1) {
          const font = a.FPDFTextObj_GetFont(object), matrix=this.matrix(object);
          result.text=this.objectText(object,textPage);
          result.font=this.fontName(font);
          result.embedded=a.FPDFFont_GetIsEmbedded(font)===1;
          result.size=this.fontSize(object)*Math.hypot(matrix[0],matrix[1]);
          result.mode=a.FPDFTextObj_GetTextRenderMode(object);
          result.editable=Boolean(result.text.trim()) && result.mode === 0 && Math.abs(matrix[1]) < .001 && Math.abs(matrix[2]) < .001 && matrix[0]>0 && matrix[3]>0;
          if (!result.editable) result.reason='This text uses rotation, clipping, or special rendering. You can add a separate text box.';
        }
        objects.push(result);
      }
      return { objects, grouped, textCharacters:a.FPDFText_CountChars(textPage) };
    } finally { a.FPDFText_ClosePage(textPage); }
  }
  render(index, requestedWidth = 900, includeObjects=true) {
    const page=this.page(index), a=this.api;
    let bitmap=0;
    try {
      const pageWidth=a.FPDF_GetPageWidth(page), pageHeight=a.FPDF_GetPageHeight(page);
      const scale=Math.min(Math.max(120,requestedWidth)/pageWidth, Math.sqrt(4000000/(pageWidth*pageHeight)));
      const width=Math.max(1,Math.round(pageWidth*scale)), height=Math.max(1,Math.round(pageHeight*scale));
      bitmap=a.FPDFBitmap_Create(width,height,1); this.check(bitmap,'Not enough memory to render this page.');
      a.FPDFBitmap_FillRect(bitmap,0,0,width,height,0xffffffff);
      a.FPDF_RenderPageBitmap(bitmap,page,0,0,width,height,0,1);
      const ptr=a.FPDFBitmap_GetBuffer(bitmap), stride=a.FPDFBitmap_GetStride(bitmap), source=this.memory();
      const pixels=new Uint8ClampedArray(width*height*4);
      for(let y=0;y<height;y++) for(let x=0;x<width;x++) { const s=ptr+y*stride+x*4,d=(y*width+x)*4; pixels[d]=source[s+2];pixels[d+1]=source[s+1];pixels[d+2]=source[s];pixels[d+3]=source[s+3]; }
      return {width,height,pixels,pageWidth,pageHeight,...(includeObjects?this.inspect(page,width,height):{})};
    } finally { if(bitmap)a.FPDFBitmap_Destroy(bitmap);a.FPDF_ClosePage(page); }
  }
  export() {
    const a=this.api, writer=a.PDFiumExt_OpenFileWriter();
    this.check(writer,'Could not prepare PDF download.');
    let p=0;
    try {
      // Full rewrite, never incremental: removed objects aren't appended as an old revision.
      this.check(a.FPDF_SaveAsCopy(this.doc,writer,2),'Could not save this PDF.');
      const size=a.PDFiumExt_GetFileWriterSize(writer);
      this.check(size>0,'The saved PDF was empty.');
      p=this.alloc(size);a.PDFiumExt_GetFileWriterData(writer,p,size);
      return this.memory().slice(p,p+size);
    } finally { if(p)this.free(p);a.PDFiumExt_CloseFileWriter(writer); }
  }
  validateText(text) {
    if (!text.trim()) throw new Error('Enter text, or use Delete selected to remove it.');
    if (text.length>5000) throw new Error('Use text boxes of at most 5,000 characters.');
    if (/[\n\r\t\x00-\x1f]/.test(text)) throw new Error('Edit one line at a time. Add another text box for a new line.');
    if (/[\u0590-\u0fff\u1780-\u17ff\u200c-\u200f\u202a-\u202e]/.test(text)) throw new Error('Complex-script text needs shaping that this editor does not yet support. The original text is unchanged.');
  }
  knownCharacters(fontName) {
    const known=new Set([' ']), a=this.api;
    for(let n=0;n<this.count;n++) {
      const page=this.page(n), tp=a.FPDFText_LoadPage(page);
      try { for(let i=0;i<a.FPDFPage_CountObjects(page);i++) {
        const ob=a.FPDFPage_GetObject(page,i);
        if(a.FPDFPageObj_GetType(ob)===1 && this.fontName(a.FPDFTextObj_GetFont(ob))===fontName) for(const ch of this.objectText(ob,tp))known.add(ch);
      } } finally {a.FPDFText_ClosePage(tp);a.FPDF_ClosePage(page);}
    }
    return known;
  }
  assertFontCharacters(font, text) {
    const name=this.fontName(font);
    const standard=/^(Helvetica|Times|Courier)(-|$)/.test(name) && this.api.FPDFFont_GetIsEmbedded(font)!==1;
    if(standard) {
      if([...text].some(c=>c.codePointAt(0)>255)) throw new Error('This standard font does not support those characters. Load a suitable TTF font.');
    } else {
      const known=this.knownCharacters(name);
      const missing=[...new Set([...text].filter(c=>!known.has(c)))];
      if(missing.length) throw new Error('Original font coverage is unverified for: '+missing.slice(0,12).join(' ') + '. Load the full TTF font or explicitly choose a replacement font.');
    }
  }
  setText(object,text,page,verify=true) {
    this.utf16(text,p=>this.check(this.api.FPDFText_SetText(object,p),'This font cannot encode the new text. Choose another font.'));
    if(!verify)return;
    const tp=this.api.FPDFText_LoadPage(page);
    try { this.check(this.objectText(object,tp)===text,'This font could not preserve all characters. Choose another font; the edit was not applied.'); }
    finally {this.api.FPDFText_ClosePage(tp);}
  }
  mutate(command) {
    const backup=this.export();
    try { return this.apply(command); }
    catch(error) { this.open(backup,this.password); throw error; }
  }
  apply(c) {
    const a=this.api, page=this.page(c.page);
    let customFont=0, fontPtr=0;
    try {
      const object=Number.isInteger(c.id)?a.FPDFPage_GetObject(page,c.id):0;
      if(c.action==='delete') {
        this.check(object && a.FPDFPage_RemoveObject(page,object),'Cannot delete this object.');a.FPDFPageObj_Destroy(object);
      } else if(c.action==='move') {
        this.check(object,'Select an object first.');
        const from=this.toPage(page,c.width,c.height,c.from[0],c.from[1]),to=this.toPage(page,c.width,c.height,c.to[0],c.to[1]);
        a.FPDFPageObj_Transform(object,1,0,0,1,to[0]-from[0],to[1]-from[1]);
      } else if(c.action==='rotate') {
        a.FPDFPage_SetRotation(page,(a.FPDFPage_GetRotation(page)+1)%4);
      } else if(c.action==='text') {
        this.validateText(c.text);
        if(!Number.isFinite(c.size)||c.size<4||c.size>200)throw new Error('Font size must be between 4 and 200 points.');
        if(object) {
          this.check(a.FPDFPageObj_GetType(object)===1,'Select a text object.');
          const m=this.matrix(object);
          this.check(a.FPDFTextObj_GetTextRenderMode(object)===0 && Math.abs(m[1])<.001 && Math.abs(m[2])<.001 && m[0]>0 && m[3]>0,'Rotated or specially rendered text cannot be edited safely.');
        }
        const source=object || (Number.isInteger(c.sourceId)?a.FPDFPage_GetObject(page,c.sourceId):0);
        let font;
        if(c.font==='original') {
          this.check(source && a.FPDFPageObj_GetType(source)===1,'Select existing text to reuse its font.');
          font=a.FPDFTextObj_GetFont(source);this.assertFontCharacters(font,c.text);
        } else if(c.font==='uploaded') {
          this.check(this.fontFile,'Choose a TTF font file first.');
          fontPtr=this.alloc(this.fontFile.length);this.memory().set(this.fontFile,fontPtr);
          customFont=a.FPDFText_LoadFont(this.doc,fontPtr,this.fontFile.length,2,true);font=customFont;
          this.check(font,'This font could not be loaded. Use a TrueType (.ttf) font.');
        } else {
          const allowed=['Helvetica','Helvetica-Bold','Helvetica-Oblique','Times-Roman','Times-Bold','Courier'];
          this.check(allowed.includes(c.font),'Choose an available font.');
          customFont=a.FPDFText_LoadStandardFont(this.doc,c.font);font=customFont;
          this.assertFontCharacters(font,c.text);
        }
        const originalBounds=object?this.bounds(object):null;
        let target=object, replacement=false;
        if(!object || c.font!=='original') {
          target=a.FPDFPageObj_CreateTextObj(this.doc,font,c.size);this.check(target,'Could not create text.');replacement=true;
          try {
            this.setText(target,c.text,page,false);
            if(object) { const m=this.matrix(object), scale=Math.hypot(m[0],m[1]); for(let i=0;i<4;i++)m[i]/=scale;this.setMatrix(target,m); }
            else {
              const [x,y]=this.toPage(page,c.width,c.height,c.x,c.y);
              const rotation=a.FPDFPage_GetRotation(page);
              const basis=[[1,0,0,1],[0,1,-1,0],[-1,0,0,-1],[0,-1,1,0]][rotation];
              this.setMatrix(target,[...basis,x,y]);
            }
            this.setColor(target,c.color);
          } catch(e) {a.FPDFPageObj_Destroy(target);throw e;}
          if(object) {this.check(a.FPDFPage_RemoveObject(page,object),'Cannot replace this text object.');a.FPDFPageObj_Destroy(object);}
          a.FPDFPage_InsertObject(page,target);this.setText(target,c.text,page);
        } else {
          this.setText(target,c.text,page);
          const matrix=this.matrix(target),ratio=c.size/(this.fontSize(target)*Math.hypot(matrix[0],matrix[1]));
          for(let i=0;i<4;i++)matrix[i]*=ratio;
          this.setMatrix(target,matrix);this.setColor(target,c.color);
        }
        const box=this.bounds(target);
        if(originalBounds && !c.allowOverflow && box[2]-box[0] > originalBounds[2]-originalBounds[0]+2) {
          throw new Error('The new text is wider than the original. Shorten it, reduce the size, or enable “Allow wider text” and check the page.');
        }
      } else if(c.action==='shape') {
        const start=this.toPage(page,c.width,c.height,c.x,c.y),end=this.toPage(page,c.width,c.height,c.x+c.w,c.y+c.h);
        const ob=a.FPDFPageObj_CreateNewRect(Math.min(start[0],end[0]),Math.min(start[1],end[1]),Math.abs(end[0]-start[0]),Math.abs(end[1]-start[1]));
        this.check(ob,'Cannot create shape.');this.setColor(ob,c.color,c.highlight?65:255);
        a.FPDFPath_SetDrawMode(ob,2,false);a.FPDFPage_InsertObject(page,ob);
      } else if(c.action==='image') {
        const bitmap=a.FPDFBitmap_Create(c.pixelWidth,c.pixelHeight,1);this.check(bitmap,'Cannot load this image.');
        let ob=0;
        try {
          const ptr=a.FPDFBitmap_GetBuffer(bitmap),stride=a.FPDFBitmap_GetStride(bitmap);
          const mem=this.memory();
          for(let y=0;y<c.pixelHeight;y++)for(let x=0;x<c.pixelWidth;x++){const s=(y*c.pixelWidth+x)*4,d=ptr+y*stride+x*4;mem[d]=c.pixels[s+2];mem[d+1]=c.pixels[s+1];mem[d+2]=c.pixels[s];mem[d+3]=c.pixels[s+3];}
          ob=a.FPDFPageObj_NewImageObj(this.doc);this.check(ob,'Cannot create image object.');
          this.check(a.FPDFImageObj_SetBitmap(0,0,ob,bitmap),'Cannot embed image.');
          const bottom=this.toPage(page,c.width,c.height,c.x,c.y+c.h),right=this.toPage(page,c.width,c.height,c.x+c.w,c.y+c.h),top=this.toPage(page,c.width,c.height,c.x,c.y);
          this.setMatrix(ob,[right[0]-bottom[0],right[1]-bottom[1],top[0]-bottom[0],top[1]-bottom[1],...bottom]);
          a.FPDFPage_InsertObject(page,ob);ob=0;
        } finally {if(ob)a.FPDFPageObj_Destroy(ob);a.FPDFBitmap_Destroy(bitmap);}
      } else throw new Error('Unknown editing action.');
      this.check(a.FPDFPage_GenerateContent(page),'Could not write the edited page.');
      return {ok:true};
    } finally {if(customFont)a.FPDFFont_Close(customFont);if(fontPtr)this.free(fontPtr);a.FPDF_ClosePage(page);}
  }
}
