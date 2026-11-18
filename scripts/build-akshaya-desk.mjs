import {writeFileSync, readFileSync} from 'node:fs';
import {siteFooter} from './lib/page-policy.mjs';

// Both languages are rendered as complete HTML; JavaScript only enhances filtering and the checklist.
const tasks = [
 ['image','Resize a photo for a form','ഫോമിനായി ഫോട്ടോയുടെ വലുപ്പം മാറ്റാം','photo image resize ഫോട്ടോ',[
  ['Read the current form instructions: width, height, file type and maximum KB.','ഫോമിലെ ഇപ്പോഴത്തെ നിർദേശങ്ങളിൽ വീതി, ഉയരം, ഫയൽ തരം, പരമാവധി KB എന്നിവ പരിശോധിക്കുക.'],
  ['Set the required pixel dimensions in Image Resizer. Keep a copy of the original.','Image Resizer-ൽ ആവശ്യമായ പിക്സൽ അളവുകൾ നൽകുക. യഥാർത്ഥ ഫോട്ടോയുടെ ഒരു പകർപ്പ് സൂക്ഷിക്കുക.','/tools/image/resize/','Image Resizer'],
  ['If the file is still too large, compress the resized copy, then check the downloaded dimensions and readability.','ഫയൽ വലുതാണെങ്കിൽ വലുപ്പം മാറ്റിയ പകർപ്പ് കംപ്രസ് ചെയ്യുക. ഡൗൺലോഡ് ചെയ്ത ഫയലിന്റെ അളവും വ്യക്തതയും പരിശോധിക്കുക.','/tools/image/compress/','Image Compressor']]],
 ['image','Reduce a photo to a KB limit','ഫോട്ടോയുടെ KB കുറയ്ക്കാം','compress 20kb 50kb 100kb 200kb ഫോട്ടോ',[
  ['Choose the maximum size written on the application portal; there is no single limit for all services.','അപേക്ഷാ പോർട്ടലിൽ പറഞ്ഞിരിക്കുന്ന പരമാവധി വലുപ്പം തിരഞ്ഞെടുക്കുക. എല്ലാ സേവനങ്ങൾക്കും ഒരേ പരിധിയല്ല.'],
  ['Select your photo, enter the target KB and download the result.','ഫോട്ടോ തിരഞ്ഞെടുക്കുക, ആവശ്യമായ KB നൽകുക, ഫലം ഡൗൺലോഡ് ചെയ്യുക.','/tools/image/compress/','Image Compressor'],
  ['Read the output file size and inspect the face or signature. A smaller file is useful only if it remains clear.','ലഭിച്ച ഫയലിന്റെ വലുപ്പവും മുഖം അല്ലെങ്കിൽ ഒപ്പ് വ്യക്തമായി കാണുന്നുണ്ടോ എന്നും പരിശോധിക്കുക.']]],
 ['image','Prepare a PSC or other application photo','PSC ഉൾപ്പെടെയുള്ള അപേക്ഷകൾക്ക് ഫോട്ടോ തയ്യാറാക്കാം','psc pan upsc passport government സർക്കാർ',[
  ['Compare the current application notice with the tool preset before using it. Requirements can change.','ടൂളിലെ പ്രീസെറ്റ് ഉപയോഗിക്കുന്നതിന് മുമ്പ് ഇപ്പോഴത്തെ അപേക്ഷാ വിജ്ഞാപനവുമായി താരതമ്യം ചെയ്യുക. നിബന്ധനകൾ മാറാം.'],
  ['Choose a preset, position the face inside the crop and export a copy.','പ്രീസെറ്റ് തിരഞ്ഞെടുക്കുക, ക്രോപ്പിനുള്ളിൽ മുഖം ശരിയായി ക്രമീകരിച്ച് പകർപ്പ് സേവ് ചെയ്യുക.','/tools/image/govt-photo/','Government Form Photo'],
  ['Verify any required name, date, background and file limit against the official notice.','പേര്, തീയതി, പശ്ചാത്തലം, ഫയൽ പരിധി എന്നിവ സംബന്ധിച്ച നിബന്ധനകൾ ഔദ്യോഗിക വിജ്ഞാപനത്തിൽ പരിശോധിക്കുക.']]],
 ['image','Resize a centre or office portrait','സെന്റർ / ഓഫീസ് ആവശ്യത്തിന് പോർട്രെയ്റ്റ് മാറ്റാം','aadhaar adhaar portrait ആധാർ',[
  ['Use this 200×230 pixel portrait only when your separate office workflow asks for those dimensions.','നിങ്ങളുടെ പ്രത്യേക ഓഫീസ് ആവശ്യത്തിൽ 200×230 പിക്സൽ അളവ് ആവശ്യപ്പെട്ടാൽ മാത്രം ഇത് ഉപയോഗിക്കുക.'],
  ['Crop and download a portrait copy. This is not an official UIDAI photo specification.','പോർട്രെയ്റ്റ് ക്രോപ്പ് ചെയ്ത് പകർപ്പ് ഡൗൺലോഡ് ചെയ്യുക. ഇത് ഔദ്യോഗിക UIDAI ഫോട്ടോ അളവല്ല.','/tools/image/govt-photo/aadhaar/','200×230 Portrait Resizer'],
  ['Resizing a photo here does not update Aadhaar. Follow UIDAI instructions for enrolment or photo updates at an authorised centre.','ഇവിടെ ഫോട്ടോയുടെ വലുപ്പം മാറ്റിയാൽ ആധാറിലെ ഫോട്ടോ മാറില്ല. എൻറോൾമെന്റിനും ഫോട്ടോ അപ്ഡേറ്റിനും അംഗീകൃത കേന്ദ്രത്തിലെ UIDAI നിർദേശങ്ങൾ പാലിക്കുക.']]],
 ['pdf','Turn document photos into one PDF','രേഖകളുടെ ഫോട്ടോകൾ ഒറ്റ PDF ആക്കാം','scan images jpg pdf രേഖ',[
  ['Photograph every page clearly, including its edges. Avoid glare and keep text upright.','എല്ലാ പേജുകളും അരികുകൾ ഉൾപ്പെടെ വ്യക്തമായി ചിത്രീകരിക്കുക. വെളിച്ചത്തിന്റെ പ്രതിഫലനം ഒഴിവാക്കി എഴുത്ത് നേരെയാക്കുക.'],
  ['Add the images, arrange them in the required order and create the PDF.','ചിത്രങ്ങൾ ചേർത്ത് ആവശ്യമായ ക്രമത്തിൽ വയ്ക്കുക. തുടർന്ന് PDF ഉണ്ടാക്കുക.','/tools/pdf/image-to-pdf/','Image to PDF'],
  ['Open the downloaded PDF and check every page before submitting.','ഡൗൺലോഡ് ചെയ്ത PDF തുറന്ന് അയയ്ക്കുന്നതിന് മുമ്പ് ഓരോ പേജും പരിശോധിക്കുക.']]],
 ['pdf','Combine supporting documents','അനുബന്ധ രേഖകൾ ഒന്നിപ്പിക്കാം','merge combine pdf രേഖ',[
  ['Check whether the portal wants one combined PDF or separate documents.','പോർട്ടലിൽ ഒറ്റ PDF ആണോ വ്യത്യസ്ത രേഖകളാണോ ആവശ്യപ്പെടുന്നതെന്ന് പരിശോധിക്കുക.'],
  ['Add the PDFs in the required sequence and merge them.','ആവശ്യമായ ക്രമത്തിൽ PDF ഫയലുകൾ ചേർത്ത് ഒന്നിപ്പിക്കുക.','/tools/pdf/merge/','Merge PDF'],
  ['Review page order and remove accidental duplicates if necessary.','പേജുകളുടെ ക്രമം പരിശോധിച്ച് ആവശ്യമെങ്കിൽ ആവർത്തിച്ച പേജുകൾ നീക്കുക.','/tools/pdf/organize/','Organize PDF']]],
 ['pdf','Reduce a PDF for upload','അപ്‌ലോഡിനായി PDF വലുപ്പം കുറയ്ക്കാം','compress pdf size kb mb',[
  ['Check the portal’s file-size limit and retain the original PDF.','പോർട്ടലിലെ ഫയൽ വലുപ്പ പരിധി പരിശോധിച്ച് യഥാർത്ഥ PDF സൂക്ഷിക്കുക.'],
  ['Compress a copy and compare the downloaded size with the limit. Some PDFs cannot shrink much further.','പകർപ്പ് കംപ്രസ് ചെയ്ത് ലഭിച്ച വലുപ്പം പരിധിയുമായി താരതമ്യം ചെയ്യുക. ചില PDF-കളുടെ വലുപ്പം കൂടുതൽ കുറയ്ക്കാൻ കഴിയണമെന്നില്ല.','/tools/pdf/compress/','Compress PDF'],
  ['Zoom in to check names, numbers, stamps and small text before using the result.','പേര്, നമ്പറുകൾ, മുദ്രകൾ, ചെറിയ അക്ഷരങ്ങൾ എന്നിവ സൂം ചെയ്ത് വ്യക്തത പരിശോധിക്കുക.']]],
 ['pdf','Extract or straighten pages','പേജുകൾ വേർതിരിക്കാം / നേരെയാക്കാം','split rotate pdf pages',[
  ['Select only the pages needed for the application and export a separate copy.','അപേക്ഷയ്ക്ക് ആവശ്യമായ പേജുകൾ മാത്രം തിരഞ്ഞെടുത്ത് വേറെ പകർപ്പായി സേവ് ചെയ്യുക.','/tools/pdf/split/','Split PDF'],
  ['Rotate sideways or upside-down pages and download the corrected PDF.','വശത്തേക്കോ തലകീഴായോ ഉള്ള പേജുകൾ തിരിച്ച് ശരിയാക്കിയ PDF ഡൗൺലോഡ് ചെയ്യുക.','/tools/pdf/rotate/','Rotate PDF'],
  ['Check that no required page is missing and that all pages open correctly.','ആവശ്യമായ പേജുകൾ നഷ്ടപ്പെട്ടിട്ടില്ലെന്നും എല്ലാം ശരിയായി തുറക്കുന്നുണ്ടെന്നും പരിശോധിക്കുക.']]]
];
const faq = [
 ['What is the Akshaya work desk?','അക്ഷയ വർക്ക് ഡെസ്ക് എന്താണ്?','It is a free collection of photo and PDF workflows for Akshaya staff and people preparing documents before visiting a centre. It prepares files; it does not submit government applications.','അക്ഷയ ജീവനക്കാർക്കും സെന്ററിൽ പോകുന്നതിന് മുമ്പ് രേഖകൾ തയ്യാറാക്കുന്നവർക്കുമുള്ള സൗജന്യ ഫോട്ടോ, PDF സഹായിയാണ് ഇത്. ഫയലുകൾ തയ്യാറാക്കാം; സർക്കാർ അപേക്ഷകൾ ഇവിടെ സമർപ്പിക്കാൻ കഴിയില്ല.'],
 ['Is this an official Akshaya service?','ഇത് ഔദ്യോഗിക അക്ഷയ സേവനമാണോ?','No. ToolShoppy is independent and is not affiliated with Akshaya, the Government of Kerala or UIDAI. Use the official service portal or an authorised centre to submit applications.','അല്ല. ToolShoppy സ്വതന്ത്രമാണ്; അക്ഷയ, കേരള സർക്കാർ, UIDAI എന്നിവയുമായി ബന്ധമില്ല. അപേക്ഷകൾ സമർപ്പിക്കാൻ ഔദ്യോഗിക പോർട്ടലോ അംഗീകൃത കേന്ദ്രമോ ഉപയോഗിക്കുക.'],
 ['Are files uploaded, and do I need an account?','ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുമോ? അക്കൗണ്ട് വേണോ?','The linked photo and PDF tools process selected files in your browser. No signup or payment is required. The site may make ordinary network requests for page assets and consent services; see the privacy policy. Downloaded files remain on your device until you remove them.','ഇവിടെ നൽകിയ ഫോട്ടോ, PDF ടൂളുകൾ തിരഞ്ഞെടുത്ത ഫയലുകൾ നിങ്ങളുടെ ബ്രൗസറിൽ തന്നെ പ്രോസസ് ചെയ്യുന്നു. രജിസ്ട്രേഷനോ പണമടയ്ക്കലോ ആവശ്യമില്ല. പേജ് ഫയലുകൾക്കും സമ്മത സേവനങ്ങൾക്കും സാധാരണ നെറ്റ്‌വർക്ക് അഭ്യർത്ഥനകൾ ഉണ്ടാകാം; സ്വകാര്യതാ നയം കാണുക. ഡൗൺലോഡ് ചെയ്ത ഫയലുകൾ നിങ്ങൾ നീക്കുന്നതുവരെ ഉപകരണത്തിൽ തുടരും.'],
 ['Which photo size should I choose?','ഏത് ഫോട്ടോ വലുപ്പമാണ് തിരഞ്ഞെടുക്കേണ്ടത്?','Use the dimensions, format and KB limit in the current application instructions. A 20 KB or 200×230 preset is not a universal government requirement. Check the final file before submitting.','ഇപ്പോഴത്തെ അപേക്ഷാ നിർദേശങ്ങളിലെ അളവ്, ഫോർമാറ്റ്, KB പരിധി എന്നിവ ഉപയോഗിക്കുക. 20 KB അല്ലെങ്കിൽ 200×230 പ്രീസെറ്റ് എല്ലാ സർക്കാർ ആവശ്യങ്ങൾക്കും ബാധകമല്ല. സമർപ്പിക്കുന്നതിന് മുമ്പ് അവസാന ഫയൽ പരിശോധിക്കുക.'],
 ['Are the instructions available in Malayalam?','മലയാളത്തിൽ നിർദേശങ്ങൾ ലഭ്യമാണോ?','Yes. This desk has English and Malayalam instructions. Linked tools currently use English controls; their names are shown in both versions so you can find the same tool.','അതെ. ഈ ഡെസ്കിൽ മലയാളത്തിലും ഇംഗ്ലീഷിലും നിർദേശങ്ങളുണ്ട്. ലിങ്ക് ചെയ്ത ടൂളുകളുടെ നിയന്ത്രണങ്ങൾ ഇപ്പോൾ ഇംഗ്ലീഷിലാണ്. അതേ ടൂൾ എളുപ്പം കണ്ടെത്താൻ രണ്ട് പതിപ്പിലും അതിന്റെ പേര് നൽകിയിട്ടുണ്ട്.']
];
const checks = [
 ['File format matches the portal (JPG, PNG or PDF).','ഫയൽ തരം പോർട്ടൽ ആവശ്യപ്പെടുന്നതാണ് (JPG, PNG അല്ലെങ്കിൽ PDF).'],
 ['Pixel dimensions and file size meet the current limit.','പിക്സൽ അളവും ഫയൽ വലുപ്പവും ഇപ്പോഴത്തെ പരിധിക്ക് യോജിക്കുന്നു.'],
 ['All required pages are present and in order.','ആവശ്യമായ എല്ലാ പേജുകളും ശരിയായ ക്രമത്തിലുണ്ട്.'],
 ['Names, numbers, face and signatures are readable.','പേര്, നമ്പറുകൾ, മുഖം, ഒപ്പുകൾ എന്നിവ വ്യക്തമാണ്.'],
 ['The downloaded result opens, and the original is retained.','ഡൗൺലോഡ് ചെയ്ത ഫയൽ തുറക്കുന്നു; യഥാർത്ഥ പകർപ്പ് സൂക്ഷിച്ചിട്ടുണ്ട്.']
];
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const shell = readFileSync('about.html','utf8');
const header = shell.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
for (const ml of [false,true]) {
 const lang = ml ? 'ml' : 'en', index = ml ? 1 : 0;
 const pick = (en,mal) => ml ? mal : en;
 const slug = ml ? 'akshaya-malayalam' : 'akshaya';
 const url = `https://toolshoppy.com/${slug}/`;
 const name = pick('Akshaya Work Desk','അക്ഷയ വർക്ക് ഡെസ്ക്');
 const description = pick('Free photo and PDF tools for Akshaya centre staff and customers. Resize photos, reduce KB, merge PDFs and check files with English and Malayalam instructions.','അക്ഷയ ജീവനക്കാർക്കും ഉപഭോക്താക്കൾക്കും സൗജന്യ ഫോട്ടോ, PDF ടൂളുകൾ. ഫോട്ടോ വലുപ്പം മാറ്റാം, KB കുറയ്ക്കാം, PDF ഒന്നിപ്പിക്കാം. മലയാളത്തിലും ഇംഗ്ലീഷിലും നിർദേശങ്ങൾ.');
 const graph = [
  {'@type':'CollectionPage',name,url,description,inLanguage:lang,mainEntity:{'@type':'ItemList',itemListElement:tasks.map((t,i)=>({'@type':'ListItem',position:i+1,name:t[index+1],url:`${url}#task-${i+1}`}))}},
  {'@type':'WebApplication',name,url,description,inLanguage:lang,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:'0',priceCurrency:'INR'}},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'https://toolshoppy.com/'},{'@type':'ListItem',position:2,name,item:url}]},
  {'@type':'FAQPage',inLanguage:lang,mainEntity:faq.map(q=>({'@type':'Question',name:q[index],acceptedAnswer:{'@type':'Answer',text:q[index+2]}}))}
 ];
 writeFileSync(`${slug}.html`, `<!DOCTYPE html>
<html lang="${lang}" data-theme-enabled><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>(function(){try{document.documentElement.setAttribute('data-theme',localStorage.getItem('ts-theme')==='dark'?'dark':'light');}catch(e){}})();</script>
<title>${name} — ${pick('Photo & PDF Tools in English & Malayalam','ഫോട്ടോ & PDF സഹായം')} | ToolShoppy</title>
<meta name="description" content="${escape(description)}"><meta name="robots" content="index, follow"><meta name="ts-ads" content="off">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="https://toolshoppy.com/akshaya/"><link rel="alternate" hreflang="ml" href="https://toolshoppy.com/akshaya-malayalam/"><link rel="alternate" hreflang="x-default" href="https://toolshoppy.com/akshaya/">
<meta property="og:title" content="${name} | ToolShoppy"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="ToolShoppy"><meta property="og:locale" content="${ml?'ml_IN':'en_IN'}"><meta property="og:image" content="https://toolshoppy.com/assets/img/og-image.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${name}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="https://toolshoppy.com/assets/img/og-image.jpg">
<link rel="icon" href="/favicon.ico?v=2"><link rel="stylesheet" href="/assets/css/main.css?v=15"><link rel="stylesheet" href="/assets/css/akshaya.css?v=1"><meta name="theme-color" content="#DC2626">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph})}</script>
<script defer src="/assets/js/core.js?v=10"></script><script defer src="/assets/js/akshaya.js?v=1"></script>
</head><body class="tool-experience">${header}
<main class="container desk" data-desk>
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${pick('Home','ഹോം')}</a><span aria-hidden="true"> / </span><span aria-current="page">${name}</span></nav>
<section class="desk-hero"><p class="desk-eyebrow">${pick('FOR CENTRE STAFF & EVERYDAY APPLICATIONS','സെന്റർ ജീവനക്കാർക്കും അപേക്ഷകർക്കും')}</p><h1>${name}</h1><p>${description}</p>
<nav class="desk-languages" aria-label="${pick('Language','ഭാഷ')}"><a class="btn ${!ml?'btn-primary':'btn-secondary'}" href="/akshaya/" lang="en" hreflang="en" ${!ml?'aria-current="page"':''}>English</a><a class="btn ${ml?'btn-primary':'btn-secondary'}" href="/akshaya-malayalam/" lang="ml" hreflang="ml" ${ml?'aria-current="page"':''}>മലയാളം</a></nav>
<p class="trust-badge"><svg class="icon-svg" width="18" height="18" aria-hidden="true"><use href="/assets/icons/sprite.svg#lock"></use></svg> ${pick('Your files never leave your device. Free · No signup.','നിങ്ങളുടെ ഫയലുകൾ ഉപകരണത്തിൽ തന്നെ. സൗജന്യം · രജിസ്ട്രേഷൻ വേണ്ട.')}</p>
<p>${pick('Choose a job below. Tool links open in a new tab so these instructions stay beside your work.','താഴെ ചെയ്യേണ്ട ജോലി തിരഞ്ഞെടുക്കുക. ടൂളുകൾ പുതിയ ടാബിൽ തുറക്കും; ജോലി ചെയ്യുമ്പോൾ ഈ നിർദേശങ്ങളും നോക്കാം.')}</p></section>
<div class="desk-layout"><section class="desk-workflows" aria-labelledby="workflows"><h2 id="workflows">${pick('What do you need to prepare?','എന്താണ് തയ്യാറാക്കേണ്ടത്?')}</h2>
<div data-enhanced hidden><label for="desk-search">${pick('Find a workflow','ജോലി കണ്ടെത്തുക')}</label><input class="desk-search" id="desk-search" type="search" placeholder="${pick('Try photo, PDF or PSC','ഫോട്ടോ, PDF, PSC…')}" aria-controls="desk-tasks"><div class="desk-filters">${[['all','All jobs','എല്ലാം'],['image','Photos','ഫോട്ടോ'],['pdf','PDFs','PDF']].map(([v,en,mal])=>`<button class="filter-chip ${v==='all'?'active':''}" type="button" data-filter="${v}" aria-pressed="${v==='all'}">${pick(en,mal)}</button>`).join('')}</div><p id="desk-results" role="status"></p></div>
<div id="desk-tasks">${tasks.map((t,i)=>`<details class="desk-task" id="task-${i+1}" data-task data-category="${t[0]}" data-tags="${t[3]}" ${i===0?'open':''}><summary>${t[index+1]}</summary><ol>${t[4].map(s=>`<li>${s[index]}${s[2]?` <a href="${s[2]}" target="_blank" rel="noopener">${s[3]} <span class="sr-only">${pick('(opens in a new tab)','(പുതിയ ടാബിൽ തുറക്കും)')}</span></a>`:''}</li>`).join('')}</ol></details>`).join('')}</div></section>
<aside class="desk-checklist" aria-labelledby="checklist"><h2 id="checklist">${pick('Ready to submit?','സമർപ്പിക്കാൻ തയ്യാറാണോ?')}</h2><p>${pick('Check the downloaded file against the current portal instructions.','ഡൗൺലോഡ് ചെയ്ത ഫയൽ ഇപ്പോഴത്തെ പോർട്ടൽ നിർദേശങ്ങളുമായി താരതമ്യം ചെയ്യുക.')}</p>${checks.map((c,i)=>`<label><input type="checkbox" data-check id="check-${i}"><span>${c[index]}</span></label>`).join('')}<p id="desk-progress" role="status"></p><button type="button" class="btn btn-secondary" id="desk-reset">${pick('Reset for next customer','അടുത്ത ഉപഭോക്താവിനായി റീസെറ്റ്')}</button><p>${pick('This checklist is not saved. Reset clears ticks only; it does not delete files or close other tabs. On a shared computer, close customer files and remove downloaded copies according to your centre’s handling rules.','ഈ ചെക്ക്ലിസ്റ്റ് സേവ് ചെയ്യില്ല. റീസെറ്റ് ടിക്കുകൾ മാത്രം നീക്കും; ഫയലുകൾ ഇല്ലാതാക്കുകയോ മറ്റ് ടാബുകൾ അടയ്ക്കുകയോ ചെയ്യില്ല. പങ്കിടുന്ന കമ്പ്യൂട്ടറിൽ ഉപഭോക്താവിന്റെ ഫയലുകൾ അടച്ച്, സെന്ററിന്റെ ചട്ടപ്രകാരം ഡൗൺലോഡ് ചെയ്ത പകർപ്പുകൾ നീക്കുക.')}</p></aside></div>
<section class="desk-note"><h2>${pick('Before you visit or submit','സെന്ററിൽ പോകുന്നതിനോ സമർപ്പിക്കുന്നതിനോ മുമ്പ്')}</h2><p>${pick('Confirm the service’s current document list, original-document requirements and photo limits with the official portal or your centre. This independent desk helps prepare digital files; it is not an Akshaya booking or government application service.','സേവനത്തിന് ഇപ്പോൾ ആവശ്യമായ രേഖകളുടെ പട്ടിക, അസൽ രേഖകൾ, ഫോട്ടോ പരിധി എന്നിവ ഔദ്യോഗിക പോർട്ടലിലോ സെന്ററിലോ ഉറപ്പാക്കുക. ഈ സ്വതന്ത്ര ഡെസ്ക് ഡിജിറ്റൽ ഫയലുകൾ തയ്യാറാക്കാൻ സഹായിക്കുന്നു; ഇത് അക്ഷയ ബുക്കിങ് അല്ലെങ്കിൽ സർക്കാർ അപേക്ഷാ സേവനമല്ല.')}</p><a href="https://www.akshaya.kerala.gov.in/services">${pick('Official Akshaya services','ഔദ്യോഗിക അക്ഷയ സേവനങ്ങൾ')}</a> · <a href="/privacy/">${pick('Privacy policy','സ്വകാര്യതാ നയം')}</a></section>
<section class="desk-faq"><h2>${pick('Common questions','സാധാരണ ചോദ്യങ്ങൾ')}</h2>${faq.map(q=>`<h3>${q[index]}</h3><p>${q[index+2]}</p>`).join('')}</section>
</main>${siteFooter()}</body></html>\n`);
}
