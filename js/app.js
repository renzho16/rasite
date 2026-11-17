(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const VIEWS=['home','archive','statement','quimera','knock'],S=window.SITE,pad=n=>String(n).padStart(2,'0');

// Entrada escalonada de las letras del titular
$$('#title>*').forEach((e,i)=>e.style.animationDelay=i*80+'ms');

// STATEMENT: estira cada línea al ancho de la referencia (sea cual sea la tipografía cargada)
const fit=()=>$$('#statement .ln').forEach(e=>{
  e.style.transform='';
  if(innerWidth/innerHeight>1.2)e.style.transform=`scaleX(${innerWidth*e.dataset.w/100/e.offsetWidth})`});
addEventListener('resize',fit);fit();document.fonts&&document.fonts.ready.then(fit);

// KNOCK: la palabra glitch se comprime para medir lo mismo que "creative"
const fitG=()=>{const a=$('.w.a'),g=$('.w.g');g.style.setProperty('--sy',1);g.style.setProperty('--sy',Math.min(1,a.offsetHeight/g.offsetHeight))};
addEventListener('resize',fitG);fitG();document.fonts&&document.fonts.ready.then(fitG);

/* ---------- Datos: CSV publicado + enlaces de Drive ---------- */
// Extrae el ID de un enlace de Drive (/d/ID/view, ?id=ID, open?id=ID...)
const driveId=u=>((u||'').match(/\/d\/([\w-]{15,})|[?&]id=([\w-]{15,})/)||[]).slice(1).find(Boolean);
const thumb=(id,w)=>`https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

// Lector CSV mínimo (comillas, comas y saltos de línea dentro de celdas)
function csv(t){const r=[];let f='',row=[],q=0;
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=0}else f+=c}
    else if(c=='"')q=1;
    else if(c==','){row.push(f);f=''}
    else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;row.push(f);r.push(row);row=[];f=''}
    else f+=c}
  if(f||row.length){row.push(f);r.push(row)}
  return r.filter(x=>x.some(y=>y.trim()))}

const cache={};
async function load(key){
  if(cache[key])return cache[key];
  const c=S[key];let items;
  if(!c.csv)items=c.demo.map(d=>({name:d.name,thumb:d.src,full:d.src}));
  else{
    const res=await fetch(c.csv,{cache:'no-store'});            // CSV caído -> lanza error
    if(!res.ok)throw Error('CSV '+res.status);
    const [h,...rows]=csv(await res.text()),k=h.map(x=>x.trim().toLowerCase());
    const g=(r,n)=>(r[k.indexOf(n)]||'').trim();
    items=rows.filter(r=>!/^(no|false|0)$/i.test(g(r,'visible')))
      .map(r=>({name:g(r,'nombre'),id:driveId(g(r,'link_drive')),o:parseFloat(g(r,'orden'))}))
      .filter(x=>x.id||console.warn('Fila omitida (enlace de Drive inválido o vacío):',x.name))
      .sort((a,b)=>(isNaN(a.o)?1e9:a.o)-(isNaN(b.o)?1e9:b.o))
      .map(x=>({name:x.name,thumb:thumb(x.id,600),full:thumb(x.id,2000)}));
  }
  if(!items.length)throw Error('Sin imágenes');
  return cache[key]=items;
}
// Mensaje de estado con botón opcional de reintento
const note=(sel,t,retry)=>{const e=$(sel);e.textContent=t||'';if(retry){const b=document.createElement('button');b.textContent=' RETRY';b.onclick=retry;e.append(b)}};

/* ---------- ARCHIVE: una imagen a la vez ---------- */
let A=[],ai=0;
async function showArchive(){
  if(A.length)return;note('#amsg','…');
  try{A=await load('archive');note('#amsg','');draw()}
  catch(e){A=[];note('#amsg','No se pudo cargar la galería.',showArchive)}
}
function draw(){
  const it=A[ai],im=$('#aimg');note('#amsg','');im.style.opacity=0;
  im.onload=()=>im.style.opacity=1;
  im.onerror=()=>note('#amsg','Imagen no disponible');   // enlace roto: se puede seguir navegando
  im.alt=it.name||'';im.src=it.full;
  $('#ac').textContent=`${pad(ai+1)} / ${pad(A.length)}`;
  new Image().src=A[(ai+1)%A.length].full;                  // precarga la siguiente
}
const step=d=>{if(A.length){ai=(ai+d+A.length)%A.length;draw()}};
$('#prev').onclick=()=>step(-1);$('#next').onclick=$('#aimg').onclick=()=>step(1);
let tx=0;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50){cur()=='archive'&&step(d<0?1:-1);!lb.hidden&&lstep(d<0?1:-1)}});

/* ---------- QUIMERA: mosaico + lightbox ---------- */
let Q=[],li=0;const lb=$('#lb'),lbi=$('img',lb);
const pos=b=>`left:${b[0]/16.72}%;top:${b[1]/9.41}%;width:${b[2]/16.72}%;height:${b[3]/9.41}%`;
function mk(it,i,box){
  const b=document.createElement('button'),im=new Image();
  b.className='sl';b.setAttribute('aria-label',it.name||'Abrir');if(box)b.style.cssText=pos(box);
  im.loading='lazy';im.alt=it.name||'';im.onload=()=>im.classList.add('ok');
  im.onerror=()=>b.classList.add('e');                       // miniatura rota: queda como celda vacía
  im.src=it.thumb;b.append(im);b.onclick=()=>openLb(i);return b}
function render(){
  const L=S.quimera.layout||[];let n=0;
  $('#grid').replaceChildren(...L.map(b=>{
    if(!b[4]&&n<Q.length)return mk(Q[n],n++,b);
    const e=document.createElement('div');e.className='sl e';e.style.cssText=pos(b);return e}));
  $('#more').replaceChildren(...Q.slice(n).map((it,j)=>mk(it,n+j)));
}
async function showQuimera(){
  if(Q.length)return;note('#qmsg','…');
  try{Q=await load('quimera');note('#qmsg','');render()}
  catch(e){Q=[];note('#qmsg','No se pudo cargar la galería.',showQuimera)}
}
const openLb=i=>{li=i;lb.hidden=false;lbi.src=Q[i].full};
const lstep=d=>{li=(li+d+Q.length)%Q.length;lbi.src=Q[li].full};
$('#lx').onclick=()=>lb.hidden=true;$('#lp').onclick=()=>lstep(-1);$('#ln').onclick=()=>lstep(1);
lb.onclick=e=>{if(e.target===lb)lb.hidden=true};

/* ---------- Router por #hash + teclado ---------- */
const cur=()=>{const h=location.hash.slice(1);return VIEWS.includes(h)?h:'home'};
function route(){
  const v=cur();lb.hidden=true;document.body.dataset.view=v;
  $$('.view').forEach(e=>e.classList.toggle('on',e.id==v));
  if(v=='archive')showArchive();if(v=='quimera')showQuimera();if(v=='statement')fit();if(v=='knock')fitG();
}
addEventListener('hashchange',route);route();
addEventListener('keydown',e=>{
  if(e.key=='Escape'){if(!lb.hidden)lb.hidden=true;else if(cur()!='home')location.hash='home';return}
  const d=e.key=='ArrowRight'?1:e.key=='ArrowLeft'?-1:0;if(!d)return;
  if(!lb.hidden)lstep(d);else if(cur()=='archive')step(d);
});
})();
