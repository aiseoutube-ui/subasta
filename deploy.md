
# 🚀 Guía de Despliegue Crítica

Si el botón de puja no funciona o ves errores de "Unable to open", sigue estos pasos exactos:

### 1. El Script (Backend.gs)
1. Copia el nuevo código de `Backend.gs`.
2. En Google Apps Script, pégalo y **Guarda** (Ctrl+S).

### 2. La Implementación (PASO VITAL)
1. Haz clic en **Implementar > Nueva implementación**.
2. **Tipo**: Aplicación Web.
3. **Descripción**: "Subasta Estable v2".
4. **Ejecutar como**: **Mismo usuario (Tú)**.
5. **Quién tiene acceso**: **Cualquier persona (Anyone)**. <-- SI PONES "SOLO YO" NADA FUNCIONARÁ.
6. Dale a **Implementar**.
7. Si te pide "Autorizar acceso", hazlo. Si aparece una advertencia de "Google no ha verificado esta app", haz clic en **Configuración Avanzada** y luego en **Ir a Subasta (No seguro)**.

### 3. El Link en el Frontend
1. Copia la URL que te da Google (termina en `/exec`).
2. Pégala en `App.tsx` en la variable `GAS_URL` (Línea 24).

### 4. Prueba de Conexión
- Si al abrir la app ves "Sincronizando Live..." infinitamente, es que la URL está mal o el script no es público.
- Si ves el nombre del producto y el precio, ¡estás conectado!
- Al pulsar el botón de puja, el icono del botón cambiará a un **círculo de carga** por 1 segundo. Si el precio no sube después de eso, revisa que tu pestaña `subasta` en el Excel tenga los datos correctos en la fila 2.

### 5. Multi-Cuenta de Google
**ADVERTENCIA**: Si tienes varias cuentas de Google abiertas en el mismo navegador (ej: personal y trabajo), Google Apps Script suele fallar. Intenta probar la app en una **Ventana de Incógnito**.
