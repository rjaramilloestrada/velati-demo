# Demo Velati (@velati.ec)

Página demo (estática, mobile first) preparada por IGNIS para Velati. **No es el sitio oficial.** Lleva `noindex` y `robots.txt` con `Disallow: /`.

Publicado en: https://rjaramilloestrada.github.io/velati-demo/

## Qué tiene

1. **Arma tu regalo:** velas, combos y bouquets del catálogo de Navidad 2025, caja opcional (x4 o x5), tarjeta escrita en vivo y total referencial. Aplica las ofertas por cantidad (reno 2 x 8, copos 3 x 10). Arma el mensaje a WhatsApp.
2. **Reserva tu taller o tu grupo:** taller abierto (fechas futuras de `data.json`; si no hay, "Próxima fecha: escríbenos") y grupo privado (6 a 8 personas, lunes a sábado, bloquea domingos, total = personas x USD 25).
3. Colección Navidad con filtros, colecciones por temporada, el taller por dentro, el local, galería reservada, FAQ verificada, formulario de pedido y botón flotante de WhatsApp.

## Editar `data.json`

- **Productos:** `productos[]`. `estado: "proximamente"` se muestra sin botón de agregar. `oferta: { cantidad, precio }` para ofertas por cantidad.
- **Etiqueta de precios:** `precios_etiqueta`. Cambiarla cuando lleguen los precios 2026.
- **Talleres:** `talleres[0].fechas[]` con `fecha` (AAAA-MM-DD), `hora_inicio`, `hora_fin` y `cupos` (número o `null`; con número se muestra "quedan X cupos"). Las fechas pasadas no se muestran.
- **Grupos:** `grupos.min`, `grupos.max`, `grupos.precio_persona`.
- **Regalos corporativos:** `corporativo.mostrar: true` para mostrar la sección (hoy oculta).
- **Horario del local:** `local.horario` (con `null` dice "escríbenos").
- **FAQ:** preguntas con `respuesta: null` no se muestran.
- **Galería:** `galeria: [{ "src": "assets/x.webp", "alt": "..." }]`.
- **Colores:** `marca.colores` (hoy `estado_colores: "provisional"`).
- **Medición:** `medicion.meta_pixel_id` y `medicion.ga4_id`. Vacíos = no se carga ningún script.

## Probar en local

```bash
python3 -m http.server 8000
```

## Despliegue

`.github/workflows/pages.yml` publica en GitHub Pages en cada push a `claude-rjp/funny-rubin-tx0ll2`. Requiere **Settings > Pages > Source: GitHub Actions**.
