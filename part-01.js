
function verasetasLeafletFailed(){
 const msg=document.createElement('div');
 msg.id='mapLoadError';
 msg.style.cssText='position:absolute;inset:10%;z-index:800;background:#173529;color:white;padding:22px;border:2px solid #e4a867;border-radius:16px;overflow:auto;box-shadow:0 5px 30px #000a';
 msg.innerHTML='<h2>El mapa no puede iniciarse</h2><p>No se ha cargado la biblioteca cartográfica Leaflet. Comprueba tu conexión a Internet y vuelve a cargar esta página. La app no incluye todavía mapas base sin conexión.</p><button onclick="location.reload()">Reintentar</button>';
 document.getElementById('mapWrap').appendChild(msg);
}
