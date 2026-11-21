
(function(){
 const help=document.getElementById('iphoneHelp'),close=document.getElementById('iphoneHelpClose'),menu=document.getElementById('userMenu');
 menu.onclick=()=>help.classList.add('visible');close.onclick=()=>help.classList.remove('visible');
 help.addEventListener('click',e=>{if(e.target===help)help.classList.remove('visible')});
 const status=document.getElementById('iosStatus');
 function connection(){status.style.display=navigator.onLine?'none':'block';status.textContent='Sin conexión: mapas y meteorología no disponibles'}
 window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
 function resize(){if(typeof map!=='undefined'&&map&&typeof map.invalidateSize==='function')map.invalidateSize({pan:false})}
 window.addEventListener('resize',()=>requestAnimationFrame(resize));
 if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(resize));
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTimeout(resize,100)));
 window.addEventListener('pageshow',()=>setTimeout(resize,200));
})();
