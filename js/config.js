/* Configuración de las galerías.
   FASE 2: pega en `csv` la URL del CSV publicado de cada hoja de Google Sheets
   (Archivo > Compartir > Publicar en la web > formato CSV).
   Columnas: nombre, link_drive, orden, visible (opcional: no / false / 0 la oculta).
   Si `csv` está vacío se usan las imágenes demo de /assets/demo. */
const demo=(n)=>Array.from({length:n},(_,i)=>({name:'Demo '+(i+1),src:`assets/demo/d${String(i+1).padStart(2,'0')}.webp`}));

window.SITE={
  archive:{csv:'',demo:demo(8)},
  quimera:{csv:'',demo:demo(13)}
};
