# Testing QR Code Download

## Problema Resuelto

Los códigos QR se descargaban corruptos desde el panel admin porque la función `getCheckpointQR` devolvía el objeto response completo de Axios en lugar de solo el blob data.

## Cambios Realizados

### 1. Backend (`/api/admin/checkpoints/:id/qr`)
✅ Ya estaba funcionando correctamente
- Genera PNG válido con Jimp
- Envía blob con Content-Type: image/png
- Tamaño: ~50KB por archivo

### 2. Frontend - API Service (`frontend/src/services/api.js`)
**Antes:**
```javascript
export const getCheckpointQR = (checkpointId, adminPassword) =>
  api.get(`/admin/checkpoints/${checkpointId}/qr`, {
    headers: { 'x-admin-password': adminPassword },
    responseType: 'blob'
  });
```

**Después:**
```javascript
export const getCheckpointQR = async (checkpointId, adminPassword) => {
  const response = await api.get(`/admin/checkpoints/${checkpointId}/qr`, {
    headers: { 'x-admin-password': adminPassword },
    responseType: 'blob'
  });
  return response.data; // ← Devolver solo el blob
};
```

### 3. Frontend - Admin Panel (`frontend/src/pages/Admin.jsx`)
**Antes:**
```javascript
const response = await getCheckpointQR(checkpoint.id, password);
const url = window.URL.createObjectURL(new Blob([response])); // ← Envolvía el objeto completo
```

**Después:**
```javascript
const blob = await getCheckpointQR(checkpoint.id, password);
const url = window.URL.createObjectURL(blob); // ← Usa el blob directamente
window.URL.revokeObjectURL(url); // ← Limpia la memoria
```

## Cómo Probar

### 1. Vía Panel Admin (Web)

1. Abrir: http://localhost:3000/admin
2. Ingresar password: `admin123`
3. Ir a tab "Checkpoints"
4. Click en "Descargar QR" en cualquier checkpoint
5. Verificar que el archivo PNG se descarga correctamente

**O bien:**

1. Ir a tab "Generador QR"
2. Seleccionar checkpoints
3. Click en "Descargar Seleccionados" o "Descargar Todos"
4. Verificar que todos los PNG se descargan correctamente

### 2. Vía curl (Terminal)

```bash
# Obtener ID de un checkpoint
CHECKPOINT_ID=$(curl -s -H "x-admin-password: admin123" \
  "http://localhost:3001/api/admin/checkpoints/9f5f868f-30fc-4035-a75e-9b100cf2a3d2" \
  | jq -r '.data[0].id')

# Descargar QR
curl -H "x-admin-password: admin123" \
  "http://localhost:3001/api/admin/checkpoints/${CHECKPOINT_ID}/qr" \
  -o test-qr.png

# Verificar que es un PNG válido
file test-qr.png
# Debe mostrar: test-qr.png: PNG image data, 800 x 1000, 8-bit/color RGBA, non-interlaced

# Ver tamaño
ls -lh test-qr.png
# Debe ser ~50KB
```

### 3. Validar el QR Code

```bash
# Instalar herramienta de lectura QR (opcional)
sudo apt install zbar-tools

# Leer contenido del QR
zbarimg test-qr.png
# Debe mostrar algo como: QR-Code:COOPQUEST-2025-CP001-GCOOP
```

### 4. Escanear con el Celular

1. Abrir la cámara del celular
2. Apuntar a un QR code descargado en la pantalla
3. Verificar que el celular detecta el código y muestra el contenido
4. Debe redireccionar a: `http://localhost:3001/qr/COOPQUEST-2025-CP001-GCOOP`

## Archivos Demo

Los QR codes demo ya están generados en:
```
/home/le/src/CoopQuest/demo-qrs/
├── checkpoint-1-gcoop.png
├── checkpoint-2-facttic.png
├── checkpoint-3-charlas.png
├── checkpoint-4-networking.png
├── checkpoint-5-iademo.png
└── README.md
```

## Verificar Contenido Visual

Los PNG generados deben tener:
- ✅ Tamaño: 800x1000 píxeles
- ✅ Fondo: Gradiente azul (#2563eb → #1e40af)
- ✅ Caja blanca superior con:
  - Título del evento
  - Nombre del checkpoint
  - Badge verde con puntos
- ✅ QR code centrado (400x400px) con fondo blanco
- ✅ Instrucciones en blanco
- ✅ Detalles del evento (lugar, fecha)
- ✅ Branding: "CoopQuest" y "gcoop"

## Troubleshooting

### El archivo descargado no es PNG válido
**Solución:** Asegúrate de que el frontend está reconstruido con los últimos cambios:
```bash
cd /home/le/src/CoopQuest
docker compose build frontend
docker compose up -d frontend
```

### El QR no se escanea
**Causa:** Resolución de pantalla baja o brillo insuficiente
**Solución:** Aumentar brillo de pantalla o imprimir el QR en papel

### Error "Endpoint no encontrado"
**Causa:** No se está enviando el header de autenticación
**Solución:** Verificar que el password admin es correcto y que el header `x-admin-password` se envía

## Status

✅ Backend genera PNG válidos
✅ Frontend descarga blobs correctamente
✅ Memoria se limpia con revokeObjectURL
✅ Funciona en todas las vistas del admin
✅ QR codes son escaneables
✅ Diseño profesional con branding

**Fecha de fix:** 28 de noviembre de 2025
