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

## Capas visuales de viento, suelo y laderas

- **Clima.** «Viento medio» muestra la media de las velocidades medias diarias.
  «Viento máximo» muestra el mayor de los máximos diarios del intervalo. Ambos
  son datos modelizados a 10 m en km/h, obtenidos de las zonas de referencia
  regionales. El máximo de velocidad y la racha son variables distintas.
  [API de Open-Meteo](https://open-meteo.com/en/docs)
- **Flora → Suelo y laderas.** El pH estimado procede de la media de
  `phh2o_0-5cm_mean_1000.tif`, producto agregado de 1 km de ISRIC SoilGrids
  (CC BY 4.0). El valor entero de origen se divide entre diez. Es una estimación
  modelizada de los primeros 5 cm y el mapa muestra intervalos.
  [Descarga de SoilGrids](https://files.isric.org/soilgrids/latest/data_aggregated/1000m/phh2o/)
- **Pendiente y orientación.** Se calculan en la malla nativa de 25 m con GDAL
  a partir de `Elevacion25830_25` del WCS del IGN/CNIG (CC BY 4.0 ign.es).
  La pendiente se expresa en grados y la orientación indica el sentido de
  descenso respecto al norte de la cuadrícula UTM. El recorte de origen en
  EPSG:25830 abarca X 245000–302000 e Y 4424500–4461000.
  [Modelos digitales del terreno del IGN](https://datos.gob.es/es/catalogo/e00125901-spaignmdt)

Los PNG de `data/entorno/` se recortan a los mismos 19 municipios que el MFE25.
Se reproyectan a Web Mercator por vecino más cercano para la visualización
móvil, con píxeles de salida de 100 m proyectados para laderas y 300 m
proyectados para el pH. El remuestreo del pH conserva las clases de la malla
original de 1 km. El manifiesto contiene la extensión, fuente y leyenda de
cada imagen. Los píxeles sin datos son transparentes.

Estas capas son visuales y no intervienen en el cálculo de Predicción.

En la ficha de un punto se muestra el intervalo de pH y el rumbo de la ladera
del píxel correspondiente. Fuera del recorte o en píxeles sin cobertura, la
ficha indica que no hay datos. El contador de viento usa la media diaria a
10 m de Open-Meteo y cuenta los días que superan 30 km/h en el intervalo
previo configurado para la lluvia. Si falta algún día, el contador queda
sin valor.
