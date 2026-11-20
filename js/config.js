/* Configuración de las galerías.
   FASE 2: pega en `csv` la URL del CSV publicado de cada hoja de Google Sheets
   (Archivo > Compartir > Publicar en la web > formato CSV).
   Columnas: nombre, link_drive, orden, visible (opcional: no / false / 0 la oculta).
   Si `csv` está vacío se usan las imágenes demo de /assets/demo. */
const img=n=>`assets/demo/d${String(n).padStart(2,'0')}.webp`;
const demo=list=>list.map((n,i)=>({name:'Demo '+(i+1),src:img(n)}));

// Rejilla de QUIMERA copiada de la referencia (marco de 1672x941): [x, y, ancho, alto, vacío?]
// Las celdas con imágenes se rellenan en este orden; las vacías son solo el recuadro.
// Si hay más imágenes que celdas, el resto va en filas de cuadrados debajo.
const layout=[
  [57,118,252,231],[57,377,252,231],
  [316,118,257,220,1],[316,337,257,328],[316,664,257,213],
  [580,118,251,228],[580,374,251,239],[580,651,251,226],
  [839,118,257,228],[839,374,257,239],[839,651,257,226],
  [1103,118,255,220,1],[1103,337,255,328],[1103,664,255,213,1],
  [1364,118,254,228],[1364,377,254,237],[1364,651,254,226]
];

window.SITE={
  archive:{csv:'',demo:demo([1,2,3,4,5,6,7,8])},
  quimera:{csv:'',layout,demo:demo([1,2,9,10,3,6,11,4,7,12,9,5,8,13])}
};

// Foto del titular de la home: WebP (escala de grises) en base64, repartido en 4 archivos de texto js/title-img-N.js.
// Se cargan en orden y, al terminar, se asigna a la <image> del titular. Así no hace falta subir ningun binario.
(()=>{for(let i=1;i<=4;i++){const s=document.createElement('script');s.src=`js/title-img-${i}.js`;s.async=false;
  if(i==4)s.onload=()=>document.querySelector('#title image').setAttribute('href','data:image/webp;base64,'+window.TI);
  document.head.append(s)}})();
