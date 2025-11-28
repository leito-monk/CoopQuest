# Guía del Panel de Administración - CoopQuest

## Acceso al Panel

**URL**: http://localhost:3000/admin  
**Contraseña por defecto**: `admin123`

> ⚠️ **IMPORTANTE**: Cambiar la contraseña en producción editando la variable `ADMIN_PASSWORD` en el archivo `.env`

---

## 📅 Gestión de Eventos

### Crear un Evento

1. Acceder a la pestaña **"Eventos"**
2. Hacer clic en **"+ Nuevo Evento"**
3. Completar el formulario:
   - **Nombre**: Nombre del evento (obligatorio)
   - **Descripción**: Detalles adicionales del evento
   - **Fecha**: Fecha de realización
   - **Ubicación**: Lugar donde se realizará
   - **Estado**: 
     - `Borrador`: No visible para los participantes
     - `Activo`: Visible y disponible para registro
     - `Finalizado`: No permite nuevos registros
4. Hacer clic en **"Crear Evento"**

### Editar un Evento

1. Buscar el evento en la lista
2. Hacer clic en el botón **✏️ (Editar)**
3. Modificar los campos necesarios
4. Hacer clic en **"Actualizar"**

### Eliminar un Evento

1. Buscar el evento en la lista
2. Hacer clic en el botón **🗑️ (Eliminar)**
3. Confirmar la eliminación

> ⚠️ **Atención**: Al eliminar un evento se eliminan también todos sus checkpoints y el progreso de los equipos.

---

## 📍 Gestión de Checkpoints

### Crear un Checkpoint

1. Acceder a la pestaña **"Checkpoints"**
2. Seleccionar el evento en el desplegable
3. Hacer clic en **"+ Nuevo Checkpoint"**
4. Completar el formulario:
   - **Nombre**: Nombre descriptivo del checkpoint (ej: "Stand de gcoop")
   - **Descripción**: Información adicional (opcional)
   - **Pregunta**: La pregunta que se mostrará al escanear el QR
   - **Respuesta**: La respuesta correcta (no distingue mayúsculas/minúsculas)
   - **Puntos**: Cantidad de puntos que otorga (100, 150, 200, etc.)
   - **Orden**: Número de secuencia del checkpoint (1, 2, 3, etc.)
5. Hacer clic en **"Crear Checkpoint"**

> 💡 **Tip**: Las respuestas se normalizan automáticamente (ignoran mayúsculas, acentos y caracteres especiales).

### Editar un Checkpoint

1. Seleccionar el evento
2. Buscar el checkpoint en la lista
3. Hacer clic en **✏️ (Editar)**
4. Modificar los campos
5. Hacer clic en **"Actualizar"**

### Descargar QR Individual

1. Buscar el checkpoint en la lista
2. Hacer clic en **📱 (Descargar QR)**
3. El código QR se descargará como imagen PNG

### Eliminar un Checkpoint

1. Buscar el checkpoint
2. Hacer clic en **🗑️ (Eliminar)**
3. Confirmar la eliminación

---

## 📱 Generador de Códigos QR

Esta sección permite generar y descargar códigos QR para los checkpoints.

### Descargar QR Seleccionados

1. Acceder a la pestaña **"Generar QR"**
2. Seleccionar el evento
3. Marcar los checkpoints deseados haciendo clic en las tarjetas
4. Hacer clic en **"Descargar Seleccionados (N)"**
5. Los códigos QR se descargarán uno por uno

### Descargar Todos los QR

1. Seleccionar el evento
2. Hacer clic en **"Descargar Todos"**
3. Se descargarán todos los códigos QR del evento en secuencia

### Formato de los Códigos QR

- **Tamaño**: 800x800 px (alta calidad para impresión)
- **Formato**: PNG
- **Margen**: 4 módulos
- **Nombre de archivo**: `checkpoint-{orden}-{nombre}.png`

> 💡 **Recomendación**: Imprimir en tamaño A4 o carta para mejor legibilidad.

---

## 🎯 Mejores Prácticas

### Planificación del Evento

1. **Crear el evento** con estado "Borrador"
2. **Agregar todos los checkpoints** antes de activar
3. **Generar y descargar los QR codes**
4. **Imprimir y ubicar los códigos** en los lugares correspondientes
5. **Cambiar el estado a "Activo"** cuando esté todo listo
6. **Comunicar la URL** a los participantes: `http://tu-dominio.com`

### Creación de Checkpoints Efectivos

#### Buenas Preguntas:
- ✅ "¿En qué año se fundó gcoop?" → Respuesta: "2007"
- ✅ "¿Cuántas cooperativas integran FACTTIC?" → Respuesta: "30"
- ✅ "¿Cuál es el quinto principio cooperativo?" → Respuesta: "educación"

#### Preguntas a Evitar:
- ❌ Preguntas muy largas o complejas
- ❌ Respuestas ambiguas con múltiples interpretaciones
- ❌ Preguntas que requieren conocimiento muy específico

### Distribución de Puntos

Recomendaciones:
- **Checkpoints fáciles**: 100 puntos
- **Checkpoints intermedios**: 150 puntos
- **Checkpoints difíciles**: 200-250 puntos
- **Checkpoint final/especial**: 300+ puntos

---

## 🔧 Configuración Avanzada

### Variables de Entorno

Editar el archivo `.env` en la raíz del proyecto:

```bash
# Seguridad
ADMIN_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu_secret_jwt_aqui
QR_CODE_SECRET=tu_secret_qr_aqui

# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/coopquest

# Puerto backend
PORT=3001
```

### Cambiar la Contraseña Admin

1. Editar `.env`:
   ```bash
   ADMIN_PASSWORD=mi_nueva_contraseña_segura
   ```
2. Reiniciar los contenedores:
   ```bash
   docker compose restart
   ```

### Seguridad de los QR Codes

Los códigos QR incluyen:
- **Prefijo único**: `COOPQUEST-2025`
- **Hash HMAC-SHA256**: Para prevenir falsificaciones
- **Identificador único**: Por checkpoint

Esto impide que se creen QR codes falsos sin acceso al sistema.

---

## 📊 Monitoreo del Evento

### Durante el Evento

1. **Leaderboard público**: http://localhost:3000/leaderboard/[EVENT_ID]
   - Se actualiza en tiempo real vía WebSocket
   - Muestra ranking de equipos por puntaje

2. **Dashboard de equipos**: Los participantes ven su progreso individual

3. **Consola del backend**: Logs de escaneos y respuestas
   ```bash
   docker logs -f coopquest-backend
   ```

### Después del Evento

1. Cambiar el estado del evento a **"Finalizado"**
2. Los equipos pueden ver su progreso pero no continuar jugando
3. El leaderboard queda visible para consultas

---

## 🐛 Resolución de Problemas

### Los QR codes no se escanean

- ✅ Verificar que la imagen esté bien impresa (sin cortes ni manchas)
- ✅ Asegurar buena iluminación
- ✅ Aumentar el tamaño de impresión
- ✅ Probar con diferentes cámaras/dispositivos

### Un checkpoint no acepta la respuesta correcta

1. Verificar la respuesta en el panel admin
2. Recordar que no distingue mayúsculas/minúsculas
3. Editar el checkpoint si es necesario
4. Los equipos pueden volver a intentar

### No puedo acceder al panel admin

1. Verificar que la URL sea correcta: `/admin`
2. Verificar la contraseña en `.env`
3. Revisar logs del backend:
   ```bash
   docker logs coopquest-backend
   ```

---

## 📚 Recursos Adicionales

- **Documentación completa**: [README.md](README.md)
- **Guía de usuario**: [USER_GUIDE.md](USER_GUIDE.md)
- **API Reference**: [API_DOCS.md](API_DOCS.md)
- **Despliegue en producción**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🆘 Soporte

¿Problemas o sugerencias?

- **Issues**: https://github.com/gcoop/coopquest/issues
- **Email**: info@gcoop.coop
- **Telegram**: @gcoop_ar

---

*Desarrollado con ❤️ por [gcoop](https://gcoop.coop) - Cooperativa de Software Libre*
