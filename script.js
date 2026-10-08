/* Neukomm Wimmis GmbH */
document.documentElement.classList.add('js');

/* Saison-Umschaltung: Ski-Sachen zuerst von 15.9. bis 7.5., sonst Bodenbeläge zuerst. Format 'MM-TT'. */
var SAISON={start:'09-15',ende:'05-07'};
/* Heutiges Datum in Schweizer Zeit als 'MM-TT' */
function heute(){
 try{
  var p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),m,d;
  p.forEach(function(x){if(x.type==='month')m=x.value;if(x.type==='day')d=x.value});
  if(m&&d)return m+'-'+d;
 }catch(e){}
 var n=new Date();
 return ('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);
}
var DATEN={};
function winterJetzt(){
 var q=(location.search.match(/[?&]saison=(sommer|winter)/)||[])[1];
 if(q)return q==='winter';
 var t=heute();
 return t>=SAISON.start||t<=SAISON.ende;
}
function applySeason(){
 var wi=winterJetzt(),root=document.documentElement;
 root.classList.toggle('sommer',!wi);
 document.querySelectorAll('.sw').forEach(function(w){
  var kids=[].slice.call(w.children);
  if(!wi){
   var a=null;kids.forEach(function(c){if(!a&&c.dataset.g!=='boden')a=c});
   if(a)kids.forEach(function(c){if(c.dataset.g==='boden')w.insertBefore(c,a)});
  }else{
   var f=null;kids.forEach(function(c){if(!f&&c.dataset.g==='boden')f=c});
   if(f)kids.forEach(function(c){if(c.dataset.g==='ski')w.insertBefore(c,f)});
  }
 });
 root.classList.add('sorted');
}
/* TT.MM. -> 'MM-TT' */
function md(s){var m=(s||'').match(/(\d{1,2})\.\s*(\d{1,2})/);return m?('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2):null}
function datenAnwenden(t){
 t.split(/\r?\n/).forEach(function(l){
  var i=l.indexOf(':');if(i<1||l.charAt(0)==='#')return;
  var k=l.slice(0,i).trim().toLowerCase(),v=l.slice(i+1).trim();
  if(k&&v)DATEN[k]=v;
 });
 document.querySelectorAll('[data-d]').forEach(function(e){var v=DATEN[e.getAttribute('data-d')];if(v)e.textContent=v});
 if(md(DATEN.umschalten_ski))SAISON.start=md(DATEN.umschalten_ski);
 if(md(DATEN.umschalten_boden))SAISON.ende=md(DATEN.umschalten_boden);
 applySeason();
}

document.documentElement.classList.toggle('sommer',!winterJetzt());
document.addEventListener('DOMContentLoaded',function(){
applySeason();
if(innerWidth<760)document.querySelectorAll('details.acc').forEach(function(d){d.open=false});
if(window.fetch&&location.protocol!=='file:')fetch('daten.txt?'+Date.now()).then(function(r){return r.ok?r.text():''}).then(function(t){if(t)datenAnwenden(t)}).catch(function(){});
var b=document.body,m=document.getElementById('menu'),o=document.getElementById('mopen');
function t(on){m.classList.toggle('on',on);b.classList.toggle('lock',on);o.setAttribute('aria-expanded',on)}
o.onclick=function(){t(true)};
document.getElementById('mclose').onclick=function(){t(false)};
m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){t(false)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')t(false)});
var h=document.getElementById('hd');
addEventListener('scroll',function(){h.classList.toggle('s',scrollY>40)},{passive:true});
var d=String(new Date().getDay());
document.querySelectorAll('[data-days]').forEach(function(r){if(r.dataset.days.split(',').indexOf(d)>-1)r.classList.add('today')});
var ds=document.getElementById('dsd');
function od(){if(location.hash==='#datenschutz')ds.open=true}
document.getElementById('dslink').addEventListener('click',function(){ds.open=true});
addEventListener('hashchange',od);od();
var fm=document.getElementById('form'),fs=document.getElementById('fs');
fm.addEventListener('submit',function(e){
 e.preventDefault();
 var btn=fm.querySelector('button'),fd={},i;
 for(i=0;i<fm.elements.length;i++){var el=fm.elements[i];if(el.name)fd[el.name]=el.value}
 if(fd._honey)return;
 btn.disabled=true;fs.className='fs';fs.textContent='Wird gesendet …';
 fetch('https://formsubmit.co/ajax/neukomm-wimmis@bluewin.ch',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(fd)})
 .then(function(r){return r.json()})
 .then(function(r){
  if(r.success===true||r.success==='true'){fs.className='fs ok';fs.textContent='Vielen Dank! Ihre Nachricht wurde gesendet. Wir melden uns bei Ihnen.';fm.reset()}
  else throw 0;
 })
 .catch(function(){
  fs.className='fs err';
  var body=Object.keys(fd).filter(function(k){return k.charAt(0)!=='_'}).map(function(k){return k+': '+fd[k]}).join('\n');
  fs.innerHTML='Das Senden hat leider nicht geklappt. Bitte schreiben Sie uns direkt: <a href="mailto:neukomm-wimmis@bluewin.ch?subject='+encodeURIComponent('Kontaktformular')+'&body='+encodeURIComponent(body)+'">E-Mail öffnen</a> oder rufen Sie an: 033 657 16 93.';
 })
 .then(function(){btn.disabled=false});
});

/* Scroll-Effekte */
var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
var rv=document.querySelectorAll('.rv,.rvc');
rv.forEach(function(el){
 if(el.classList.contains('rvc'))[].forEach.call(el.children,function(c,i){c.style.setProperty('--i',Math.min(i,8))});
});
if(calm||!('IntersectionObserver' in window)){rv.forEach(function(el){el.classList.add('in')});}
else{
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px',threshold:0.08});
 rv.forEach(function(el){io.observe(el)});
}
var bar=document.querySelector('.prog'),px=[].slice.call(document.querySelectorAll('[data-px]')),tick=false;
function frame(){
 tick=false;
 var de=document.documentElement,max=de.scrollHeight-innerHeight;
 if(bar)bar.style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';
 if(calm)return;
 px.forEach(function(img){
  var r=img.parentNode.getBoundingClientRect();
  if(r.bottom<0||r.top>innerHeight)return;
  var s=parseFloat(img.dataset.px)||1.2,lim=r.height*(s-1)/2,y=(r.top+r.height/2-innerHeight/2)*-0.1;
  y=Math.max(-lim,Math.min(lim,y));
  img.style.transform='translate3d(0,'+y.toFixed(1)+'px,0) scale('+s+')';
 });
}
function req(){if(!tick){tick=true;requestAnimationFrame(frame)}}
addEventListener('scroll',req,{passive:true});
addEventListener('resize',req);
frame();
});
