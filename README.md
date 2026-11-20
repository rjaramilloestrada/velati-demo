# Demo Velati (@velati.ec)

Página demo (estática, mobile first) preparada por IGNIS para Velati, velitas y workshop en el CC Albán Borja, Guayaquil. **No es el sitio oficial.** Lleva `noindex, nofollow, noarchive` y `robots.txt` con `Disallow: /`.

Publicado en: https://rjaramilloestrada.github.io/velati-demo/

Solo muestra datos verificados del perfil @velati.ec y del catálogo de Navidad 2025. Lo que falta se omite o queda como bloque reservado. **No se inventan precios, cupos, horarios, testimonios, aromas ni tiempos de quemado.**

## Qué tiene

1. **Hero:** la vela se enciende al cargar. En escritorio la escena se fija y la vela se derrite con el scroll; en móvil es una versión corta.
2. **Franja de confianza** (`confianza[]`) y **marquee** de colecciones (`marquee[]`).
3. **Catálogo tipo tienda:** filtros por categoría con contador, presupuesto, orden por precio, accesos "Regalos hasta $10 / de $11 a $25" (`atajos_regalo[]`), tarjetas con sello de oferta y botón "+".
4. **Ficha de producto** (`#p/<id>` abre la ficha directo): cantidad con oferta aplicada, "Agregar", "Pedir este por WhatsApp", "Cuidados básicos" y "Compartir".
5. **Cómo funciona** 01, 02, 03 (`pasos[]`).
6. **Arma tu regalo / Tu pedido:** panel lateral con 3 pasos (velas, caja, tarjeta), vista previa "Así llega tu pedido, ya armado" y envío a WhatsApp. El pedido se guarda en el navegador.
7. **Reserva de taller y grupo:** fechas futuras (las pasadas no se muestran), grupos de 6 a 8 personas de lunes a sábado, total = personas x USD 25.
8. Taller por dentro, regalos corporativos (oculto), el local, **testimonios** (bloque reservado), FAQ, pedido libre con vista previa del chat, pie con firma "Demo por IGNIS".

Navegación: cabecera con WhatsApp y "Tu pedido"; dock inferior en móvil (Catálogo, Regalo, Talleres, Pedido, WhatsApp) con indicador deslizante; botón flotante solo en escritorio. Barra de progreso de lectura.

Accesibilidad: foco atrapado en la ficha y en el panel del pedido, fondo inerte mientras están abiertos, Escape cierra el de arriba y el foco vuelve al botón que lo abrió. Los errores de formulario usan `aria-invalid` y `aria-describedby`. Las ocasiones del grupo se recorren con flechas.

Movimiento: GSAP, ScrollTrigger y Lenis en `vendor/` (Lenis solo en escritorio). Con `prefers-reduced-motion: reduce` no hay escena fija, chispas, pétalos ni cursor de llama. Si la animación no carga, el contenido aparece igual a los 2,5 s (`js-pending`).

## Archivos

```
index.html   estructura
styles.css   estilos (marca Velati; IGNIS solo en .ignis del pie)
app.js       lee data.json, dibuja la página, carrito, reservas y movimiento
data.json    TODO el contenido
vendor/      gsap, ScrollTrigger, lenis (locales)
assets/      favicon, og.png, apple-touch-icon y (cuando lleguen) productos/*.webp
.github/workflows/pages.yml   despliegue a GitHub Pages
```

## Probar en local

```bash
python3 -m http.server 8000
```

## Cómo editar `data.json`

**Negocio y demo**
- `whatsapp`: solo dígitos, con 593. Hoy `593984505397`.
- `demo.banner`, `demo.noindex`, `demo.texto`: aviso de demo arriba y en el pie.
- `marca.colores` y `marca.estado_colores` (`provisional` hasta muestrear el logo). `marca.nota_imagenes`: aviso "Ilustración referencial".
- `hero.linea`, `hero.bajada`: textos del inicio.
- `mensajes.*`: primeras líneas de cada mensaje a WhatsApp (`flotante`, `general`, `regalo_titulo`, `producto_titulo`, `taller_titulo`, `grupo_titulo`, `corporativo_titulo`, `pedido_titulo`).

**Catálogo**
- `precios_etiqueta`: se muestra en el catálogo, la ficha, el pedido y el mensaje. Cuando lleguen los precios 2026, cámbiala a "Precios 2026".
- `categorias[]`: id y nombre de cada filtro.
- `productos[]`:
  - `id`, `nombre`, `descripcion` (tal cual el catálogo de Velati), `categoria`, `coleccion`.
  - `precio`: número, o `null` con `precio_texto` (ej. tazas "$12 a $20").
  - `oferta`: `{ "cantidad": 3, "precio": 10 }` se aplica sola en el pedido; `null` si no hay.
  - `estado`: `referencial_2025` (precio del catálogo pasado), `verificado` (confirmado por Velati) o `proximamente` (se ve, pero no se puede agregar).
  - `fotos`: `[{ "src": "assets/productos/reno-480.webp", "src2x": "assets/productos/reno-960.webp", "alt": "..." }]`. La segunda foto aparece al pasar el mouse. Sin fotos se usa la ilustración (`ilustracion`, `tono`).
  - `sellos`: textos cortos opcionales ("Nuevo"). Solo si Velati los confirma.
  - `variantes`: lista de opciones (color, aroma, tamaño) o `null`.
- `destacados[]`: ids que aparecen en "Ideas para empezar".
- `atajos_regalo[]`: `{ texto, budget }` con `budget` = `b10`, `b25` o `b26`.
- `presentaciones[]`: opciones de caja del paso 2 (`producto` apunta al id de la caja).
- `tarjeta.encabezado`, `tarjeta.max`: tarjeta del regalo.
- `cuidados_titulo`, `cuidados[]`: consejos generales de seguridad en la ficha. No afirman nada del producto.

**Talleres y grupos**
- `talleres[0]`: `nombre`, `precio`, `incluye`, `aprendes[]`, `duracion`, `lugar`, `cupos_texto`, `estado`.
- `talleres[0].fechas[]`: `{ fecha: "AAAA-MM-DD", hora_inicio, hora_fin, cupos }`. Con `cupos` numérico se muestra "quedan X cupos" y limita las personas. Sin fechas futuras se ve "Próxima fecha: escríbenos".
- `grupos`: `min`, `max`, `precio_persona`, `dias`, `incluye`, `cupos_texto`, `ocasiones[]`.

**Otras secciones**
- `pasos[]`: Cómo funciona.
- `confianza[]`: `{ icono: flame|pin|wa|check, texto }`.
- `marquee[]`, `colecciones_anio[]`.
- `corporativo.mostrar`: `false` oculta la sección. Activarla solo si Velati hace regalos corporativos.
- `local`: `centro`, `local`, `ciudad`, `maps`, `horario` (`null` dice "escríbenos"), `descripcion`.
- `galeria[]` y `galeria_placeholder`: fotos de pedidos entregados, con permiso.
- `testimonios[]` (`{ texto, autor }`) y `testimonios_placeholder`. Vacío muestra el bloque reservado.
- `faq[]`: las preguntas con `respuesta: null` no se muestran.
- `firma.texto` ("Demo por") y `firma.enlace` (`null` = sin enlace).
- `medicion.meta_pixel_id`, `medicion.ga4_id`: vacíos = no se carga ningún script. Con IDs se registran `whatsapp_click`, `add_to_cart` y `form_submit`.

## Despliegue

`.github/workflows/pages.yml` publica en GitHub Pages en cada push a `claude-rjp/funny-rubin-tx0ll2`.
