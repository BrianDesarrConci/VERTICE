# Despliegue del backend (Google Apps Script)

El backend de VÉRTICE corre sobre **Google Apps Script** usando **Google Sheets como base de datos**. Sigue estos pasos una sola vez.

## 1. Crear la hoja de cálculo

1. Ve a [sheets.new](https://sheets.new) y crea una hoja nueva.
2. Renómbrala, por ejemplo, `VERTICE DB`.

## 2. Abrir el editor de Apps Script

1. En la hoja: menú **Extensiones → Apps Script**.
2. Se abre el editor. Borra el contenido de `Código.gs`.
3. Copia y pega **todo** el contenido de [`gas/Code.gs`](../gas/Code.gs).
4. (Opcional) En el ícono de engranaje **Configuración del proyecto**, marca
   *"Mostrar el archivo de manifiesto appsscript.json"* y pega
   [`gas/appsscript.json`](../gas/appsscript.json).
5. Guarda (💾).

## 3. Inicializar la base de datos

En la barra superior del editor, selecciona la función y ejecútala:

1. Selecciona **`setup`** → botón **Ejecutar**. Autoriza los permisos que pida
   (es tu propia cuenta y tu propia hoja).
   → Crea todas las hojas: `Productos`, `Categorias`, `Pedidos`, `Clientes`,
   `Inventario_Mov`, `Despachos`, `Usuarios_Admin`, `Configuracion`, `Cupones`.
2. Selecciona **`seedData`** → **Ejecutar**.
   → Carga productos, categorías, cupones y el usuario admin demo.

> Usuario admin demo: **admin@vertice.co / vertice123**
> (Cámbialo editando la hoja `Usuarios_Admin`; la contraseña se guarda como hash SHA-256.
> Para generar un hash nuevo, ejecuta en el editor: `Logger.log(sha256_('tu-clave'))`.)

## 4. Publicar como Web App

1. Botón **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Configuración:
   - **Descripción**: `VERTICE API v1`
   - **Ejecutar como**: *Yo* (tu cuenta).
   - **Quién tiene acceso**: *Cualquier persona*.
4. **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

## 5. Conectar el frontend

En la raíz del proyecto React, crea un archivo `.env` (copiando `.env.example`):

```bash
VITE_GAS_URL=https://script.google.com/macros/s/AKfy..../exec
VITE_ADMIN_TOKEN=vertice-dev-token
VITE_USE_MOCK=false
```

> `VITE_ADMIN_TOKEN` **debe coincidir** con la constante `ADMIN_TOKEN` al inicio de `Code.gs`.
> Cámbiala en ambos lados por un valor secreto en producción.

## 6. Actualizar el backend más adelante

Cuando edites `Code.gs`, publica los cambios con
**Implementar → Gestionar implementaciones → (editar) → Nueva versión**.
Así la misma URL `/exec` sirve el código actualizado.

## Notas de arquitectura

- Las respuestas usan `ContentService` con `MimeType.JSON` y el frontend hace
  `POST` con `Content-Type: text/plain` para **evitar el preflight CORS** (limitación conocida de GAS).
- Los endpoints admin exigen `token === ADMIN_TOKEN`. Es una capa mínima:
  para producción real, considera Firebase Auth / JWT o mover la lógica sensible fuera de GAS.
- Campos compuestos (`images`, `variants`, `items`, `customer`) se guardan como
  JSON en una sola celda y se (de)serializan automáticamente.
