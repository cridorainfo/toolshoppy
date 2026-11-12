from pathlib import Path
from PIL import Image
import re,json
root=Path('.')
files=[*root.glob('*.html'),*root.glob('tools/**/*.html'),*root.glob('blog/**/*.html'),*root.glob('search/**/*.html')]
im=Image.open('assets/img/logo.png'); im.thumbnail((56,56)); im.save('assets/img/logo.webp','WEBP',lossless=True,method=6)
for p in files:
 s=p.read_text(encoding='utf-8'); old=s
 s=s.replace('/assets/img/logo.png?v=2','/assets/img/logo.webp?v=3')
 # Only independent, noncritical scripts can be deferred without changing tool initialization.
 s=re.sub(r'<script src="(/assets/js/(?:ads|analytics)\.js[^" ]*)">',r'<script defer src="\1">',s)
 if p.as_posix() in ['about.html','contact.html','privacy.html','terms.html']:
  title=re.sub('<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S)[1]); url=re.search(r'rel="canonical" href="([^"]+)',s)[1]
  nav='<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true"> / </span><span aria-current="page">'+title+'</span></nav>'
  s=re.sub(r'(<main\b[^>]*>)',lambda m:m[1]+'\n  '+nav,s,count=1)
  schema={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':'https://toolshoppy.com/'},{'@type':'ListItem','position':2,'name':title,'item':url}]}
  s=s.replace('</head>','<script type="application/ld+json">'+json.dumps(schema)+'</script>\n</head>')
 if re.fullmatch(r'tools/[^/]+/index.html',p.as_posix()):
  s=s.replace('<div class="featured-grid"','<h2 class="section-heading">Choose a tool</h2>\n  <div class="featured-grid"',1)
 if p.as_posix()=='blog/index.html':
  s=s.replace('<div class="blog-grid"','<h2 class="section-heading">Practical tool guides</h2>\n  <div class="blog-grid"',1)
 if p.as_posix().startswith('blog/') and '<article>' in s:
  bio='<aside class="author-bio" aria-label="About the author"><h2>About the author</h2><p>By <a href="/about/#editorial-team" rel="author">ToolShoppy</a>, the independent project behind these browser-based utilities. Our guides explain tool workflows, output limits, and common file-preparation tasks for users in India and the Gulf.</p><p>Found an error? <a href="/contact/">Send a correction</a>. For application requirements, check the current instructions from the issuing authority before submitting.</p></aside>'
  s=s.replace('</article>',bio+'\n  </article>')
  def schema_author(m):
   obj=json.loads(m[1])
   if obj.get('@type')=='BlogPosting': obj['author']={'@type':'Organization','@id':'https://toolshoppy.com/about/#editorial-team','name':'ToolShoppy','url':'https://toolshoppy.com/about/#editorial-team'}
   return '<script type="application/ld+json">\n'+json.dumps(obj,ensure_ascii=False,indent=2)+'\n</script>'
  s=re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>',schema_author,s)
 if p.name=='about.html': s=s.replace('<h2>Who\'s behind it</h2>','<h2 id="editorial-team">Who\'s behind it</h2>')
 # Correct skipped levels in rendered HTML only; keep the original visual size.
 parts=re.split(r'(<(?:script|style)\b[^>]*>[\s\S]*?</(?:script|style)>)',s,flags=re.I)
 prev=[0]
 def heading(m):
  level=int(m[1]); new=min(level,prev[0]+1,4) if prev[0] else level; prev[0]=new
  attrs=m[2]
  if new!=level:
   if 'class="' in attrs: attrs=attrs.replace('class="',f'class="seo-heading-{level} ',1)
   else: attrs+=f' class="seo-heading-{level}"'
  return f'<h{new}{attrs}>{m[3]}</h{new}>'
 for i in range(0,len(parts),2): parts[i]=re.sub(r'<h([1-6])([^>]*)>([\s\S]*?)</h\1>',heading,parts[i],flags=re.I)
 s=''.join(parts)
 # Stable boxes for previews whose actual content appears only after user input.
 def img(m):
  tag=m[0]
  if 'width=' not in tag and 'height=' not in tag:
   wh=(200,200) if 'Sticker preview' in tag else (320,240)
   tag=tag.replace('<img',f'<img width="{wh[0]}" height="{wh[1]}"',1)
   if 'style="' in tag: tag=tag.replace('style="','style="object-fit:contain;',1)
  return tag
 parts=re.split(r'(<script\b[^>]*>[\s\S]*?</script>)',s,flags=re.I)
 for i in range(0,len(parts),2): parts[i]=re.sub(r'<img\b[^>]*>',img,parts[i])
 s=''.join(parts)
 if s!=old: p.write_text(s,encoding='utf-8',newline='')
# Keep generation sources consistent for logos and hub heading structure.
for p in [Path('scripts/improve-tool-seo-landing.mjs'),Path('assets/templates/seo-trend-landing.html')]:
 s=p.read_text(encoding='utf-8').replace('/assets/img/logo.png?v=2','/assets/img/logo.webp?v=3')
 if p.suffix=='.mjs': s=s.replace('<div class="featured-grid" style="margin-top:20px;">','<h2 class="section-heading">Choose a tool</h2>\n  <div class="featured-grid" style="margin-top:20px;">')
 p.write_text(s,encoding='utf-8',newline='')
p=Path('assets/css/main.css'); s=p.read_text(encoding='utf-8')
# Original component selectors continue to style headings after semantic correction.
for level in [3,4]: s=re.sub(r'(?<=[ .\w-])h'+str(level)+r'(?=[ {,:])',':is(h'+str(level)+', .seo-heading-'+str(level)+')',s)
s+='\n/* Semantic headings retain their previous scale; bios use theme tokens. */\n.seo-heading-3 { font-size: 1.17em; }\n.seo-heading-4 { font-size: 1em; }\n.section-heading { font-size: 1.2rem; margin: 24px 0 12px; }\n.author-bio { margin-top: 28px; padding: 20px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }\n.author-bio h2 { font-size: 1.1rem; margin-bottom: 8px; }\n.author-bio p + p { margin-top: 8px; }\n'
p.write_text(s,encoding='utf-8',newline='')
print('Optimized logo bytes',Path('assets/img/logo.webp').stat().st_size)
