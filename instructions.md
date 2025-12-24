
# Guía de Mando - Subasta Gamarra (Pro)

### 1. Nueva Estructura de Pestañas
Para que el Panel de Administración funcione, tu pestaña `subasta` debe tener **6 columnas**:

- **A1:** `ID_Prod`
- **B1:** `Precio_Act`
- **C1:** `Ganador`
- **D1:** `Fin_Time`
- **E1:** `Activo` (TRUE/FALSE)
- **F1:** `EnPausa` (TRUE/FALSE) <-- **NUEVA COLUMNA**

### 2. Cómo Acceder al Panel de Administración
La aplicación ahora tiene dos "caras":
1. **Pujador (Público)**: Accede normalmente.
2. **Administrador (Mando)**: Añade `?admin=true` al final de tu URL.
   *Ejemplo: https://tu-script-url/exec?admin=true*

### 3. Flujo de Trabajo del Administrador
1. Abre el Panel de Mando (`?admin=true`).
2. En la lista de la derecha (Catálogo), haz clic en el rayo azul `Zap` para preparar un producto.
3. El reloj aparecerá en **PAUSA**. Usa este tiempo para que el anfitrión en YouTube presente la prenda.
4. Cuando el anfitrión diga "¡Empieza la subasta!", presiona **REANUDAR**. El tiempo empezará a correr para todos los usuarios.
5. Si alguien puja al final, el tiempo se extiende automáticamente 30 segundos.
6. Cuando el tiempo acabe o el anfitrión quiera cerrar, presiona **VENDER**.

---
**RECUERDA:** Al actualizar `Backend.gs`, implementa una **Versión Nueva** en Google Apps Script para que los cambios surtan efecto.
