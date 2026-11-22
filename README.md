# VeraSetas 4.0 — Beta 22 (diagnóstico)

Mejora la comprobación de Catálogo en las pruebas voluntarias de las seis pestañas. No altera las predicciones.

## Cómo probar sin reemplazar la versión pública

Publicar el contenido de este ZIP en una ruta o repositorio de prueba separado servido por HTTPS (no abrir `index.html` directamente desde Archivos: los módulos JS pueden quedar bloqueados por Safari). Abrir en Safari del iPad, pulsar Diagnóstico y luego «Probar las 6 pestañas». Copiar el informe si hay errores. No sobrescribir el GitHub Pages estable.

## Límites

No se ha ejecutado Safari real ni validado Open-Meteo en producción. Quedan 15 sobrescrituras heredadas identificadas.

## Cartografía forestal de La Vera

Flora carga `data/mfe_vera.geojson` desde el mismo servidor de VeraSetas. Los filtros
de especies y la visualización del MFE25 se controlan en Flora. La cartografía
oficial es una referencia visual independiente de la consulta de OpenStreetMap.
No modifica la predicción y no incluye pH.

- **Datos forestales.** Fuente: «© Ministerio para la Transición Ecológica y el Reto
  Demográfico». [MFE25 de Extremadura](https://www.miteco.gob.es/es/cartografia-y-sig/ide/descargas/biodiversidad/mfe_extremadura.html).
  El ZIP oficial `mfe_extremadura.zip` usado tiene SHA-256
  `12299bcf71b030a8240e3cdb890468d0cce472cc97241adb96d10ede068007e0`.
  Contiene el Shapefile `MFE_43` en ETRS89 / UTM zona 30N (EPSG:25830) y su
  diccionario. El filtro `PRO_F=10 AND ORIGEN='MFE25'` identifica 54.560 teselas de
  Cáceres. Se conservan las teselas con especie principal informada y los atributos
  `Poligon`, `Especie1`, `FormArbol` y `TIPOBOSQUE` como `id`,
  `scientific_name`, `formation` y `forest_type`.
- **Recorte.** Unión de los 19 municipios del
  [Plan Territorial de La Vera](https://doe.juntaex.es/otrosFormatos/html.php?anio=2026&doe=530o&xml=2026080390).
  Límites del [servicio INSPIRE de Unidades Administrativas](https://www.ign.es/wfs-inspire/unidades-administrativas)
  (IGN/CNIG, CC BY 4.0 ign.es), capa `au:AdministrativeUnit`, códigos nacionales
  `34111010` + `014, 022, 065, 068, 079, 081, 091, 104, 105, 110, 111, 138, 157,
  179, 181, 191, 204, 206, 212`.
- **Preparación para móvil.** Intersección con la unión municipal en EPSG:25830
  mediante GDAL, simplificación topológica Douglas–Peucker de 12 m conservando
  teselas con Mapshaper, y reproyección a WGS 84 con orden longitud/latitud
  (GeoJSON RFC 7946). Se usa una precisión de cinco decimales y se validan las
  geometrías tras ajustar la precisión. La simplificación puede desplazar
  ligeramente los bordes de las teselas. Un fragmento del recorte quedó sin superficie
  a esa precisión y se descartó. El resultado contiene 1.268 teselas
  arboladas y 19 valores de especie principal.
