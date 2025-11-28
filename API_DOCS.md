# 📡 API Documentation - CoopQuest

**Version 1.0** - REST API Reference

Base URL: `http://localhost:3001/api` (desarrollo)

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Eventos](#eventos)
3. [Equipos](#equipos)
4. [Juego](#juego)
5. [Checkpoints](#checkpoints)
6. [Admin](#admin)
7. [Códigos de Error](#códigos-de-error)

---

## Autenticación

### Equipos (Participantes)

Los equipos reciben un JWT token al registrarse.

**Header requerido en requests autenticados**:
```
Authorization: Bearer {token}
```

### Administradores

**Header requerido en requests de admin**:
```
x-admin-password: {admin_password}
```

---

## Eventos

### GET /events

Obtener todos los eventos.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Punto Coop 2025",
      "description": "Evento nacional cooperativo",
      "date": "2025-11-13T10:00:00.000Z",
      "location": "Buenos Aires",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /events/active

Obtener solo eventos activos.

**Response**: Igual que GET /events pero filtrado por `status: "active"`

### GET /events/:id

Obtener un evento específico.

**Parameters**:
- `id` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Punto Coop 2025",
    "description": "Evento nacional cooperativo",
    "date": "2025-11-13T10:00:00.000Z",
    "location": "Buenos Aires",
    "status": "active",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### GET /events/:id/stats

Obtener estadísticas de un evento.

**Parameters**:
- `id` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "data": {
    "totalTeams": 25,
    "totalCheckpoints": 5,
    "totalCompletions": 87,
    "checkpointStats": [
      {
        "id": "uuid",
        "name": "Stand de gcoop",
        "completed_count": 20,
        "failed_count": 3
      }
    ]
  }
}
```

---

## Equipos

### POST /teams/register

Registrar un nuevo equipo.

**Body**:
```json
{
  "eventId": "uuid",
  "teamName": "Los Cooperativistas"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Equipo registrado exitosamente",
  "data": {
    "team": {
      "id": "uuid",
      "name": "Los Cooperativistas",
      "score": 0,
      "eventId": "uuid"
    },
    "token": "jwt-token-here"
  }
}
```

**Errores**:
- `400`: Datos inválidos o nombre ya usado
- `404`: Evento no encontrado
- `409`: Equipo ya existe

**Rate Limit**: 5 registros por 15 minutos por IP

### GET /teams/leaderboard/:eventId

Obtener clasificación de un evento.

**Parameters**:
- `eventId` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Los Cooperativistas",
      "score": 570,
      "completed_checkpoints": 5,
      "failed_checkpoints": 0,
      "total_checkpoints": 5
    },
    {
      "id": "uuid",
      "name": "Equipo Solidario",
      "score": 420,
      "completed_checkpoints": 3,
      "failed_checkpoints": 1,
      "total_checkpoints": 5
    }
  ]
}
```

---

## Juego

Todos los endpoints requieren autenticación (JWT token).

### GET /game/progress

Obtener progreso del equipo autenticado.

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "uuid",
      "name": "Los Cooperativistas",
      "score": 350
    },
    "checkpoints": [
      {
        "id": "uuid",
        "name": "Stand de gcoop",
        "description": "Cooperativa de software libre",
        "points": 100,
        "order_num": 1,
        "status": "completed",
        "answered_at": "2025-11-13T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "name": "Stand de FACTTIC",
        "description": "Federación de cooperativas",
        "points": 150,
        "order_num": 2,
        "status": "pending",
        "answered_at": null
      }
    ]
  }
}
```

### POST /game/scan

Escanear un código QR.

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "qrCode": "COOPQUEST-2025-CP001-GCOOP"
}
```

**Response (exitoso)**:
```json
{
  "success": true,
  "data": {
    "checkpoint": {
      "id": "uuid",
      "event_id": "uuid",
      "name": "Stand de gcoop",
      "description": "Cooperativa de software libre fundada en 2007",
      "question": "¿En qué año se fundó gcoop?",
      "points": 100,
      "order_num": 1
    },
    "message": "Checkpoint encontrado. Responde la pregunta para ganar puntos."
  }
}
```

**Errores**:
- `400`: Checkpoint ya completado o fallido
- `404`: Código QR inválido
- `429`: Demasiados escaneos (rate limit: 1 cada 5 segundos)

**Rate Limit**: 1 escaneo cada 5 segundos por equipo

### POST /game/answer

Responder pregunta de un checkpoint.

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "checkpointId": "uuid",
  "answer": "2007"
}
```

**Response (respuesta correcta)**:
```json
{
  "success": true,
  "data": {
    "correct": true,
    "points": 100,
    "newScore": 450,
    "message": "¡Correcto! Ganaste 100 puntos."
  }
}
```

**Response (respuesta incorrecta)**:
```json
{
  "success": true,
  "data": {
    "correct": false,
    "message": "Respuesta incorrecta. Este checkpoint se marca como fallido.",
    "correctAnswer": "2007"
  }
}
```

**Errores**:
- `400`: Checkpoint ya respondido o datos inválidos
- `404`: Checkpoint no encontrado

---

## Checkpoints

### GET /checkpoints/:eventId

Obtener checkpoints de un evento (sin respuestas).

**Parameters**:
- `eventId` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "name": "Stand de gcoop",
      "description": "Cooperativa de software libre",
      "points": 100,
      "order_num": 1,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Nota**: No incluye `answer` ni `question` por seguridad.

### GET /checkpoints/detail/:id

Obtener detalle de un checkpoint (autenticado).

**Headers**:
```
Authorization: Bearer {token}
```

**Parameters**:
- `id` (path): UUID del checkpoint

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "event_id": "uuid",
    "name": "Stand de gcoop",
    "description": "Cooperativa de software libre",
    "qr_code": "COOPQUEST-2025-CP001-GCOOP",
    "question": "¿En qué año se fundó gcoop?",
    "points": 100,
    "order_num": 1,
    "team_status": "pending",
    "answered_at": null
  }
}
```

**Nota**: No incluye `answer` para evitar trampa.

---

## Admin

Todos los endpoints requieren header `x-admin-password`.

### POST /admin/login

Verificar contraseña de administrador.

**Body**:
```json
{
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "authenticated": true
  }
}
```

**Errores**:
- `401`: Contraseña incorrecta

### POST /admin/events

Crear un nuevo evento.

**Headers**:
```
x-admin-password: {password}
```

**Body**:
```json
{
  "name": "Mi Evento 2025",
  "description": "Descripción del evento",
  "date": "2025-12-01T10:00:00",
  "location": "Buenos Aires",
  "status": "draft"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Evento creado exitosamente",
  "data": {
    "id": "uuid",
    "name": "Mi Evento 2025",
    "description": "Descripción del evento",
    "date": "2025-12-01T10:00:00.000Z",
    "location": "Buenos Aires",
    "status": "draft",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT /admin/events/:id

Actualizar un evento.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del evento

**Body** (todos los campos son opcionales):
```json
{
  "name": "Mi Evento 2025 - Actualizado",
  "status": "active"
}
```

**Response**: Igual que POST /admin/events

### DELETE /admin/events/:id

Eliminar un evento y todos sus datos relacionados.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "message": "Evento eliminado exitosamente"
}
```

### POST /admin/checkpoints

Crear un nuevo checkpoint.

**Headers**:
```
x-admin-password: {password}
```

**Body**:
```json
{
  "event_id": "uuid",
  "name": "Stand Principal",
  "description": "Descripción del checkpoint",
  "question": "¿Cuál es la pregunta?",
  "answer": "la respuesta correcta",
  "points": 100,
  "order_num": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Checkpoint creado exitosamente",
  "data": {
    "id": "uuid",
    "event_id": "uuid",
    "name": "Stand Principal",
    "description": "Descripción del checkpoint",
    "qr_code": "COOPQUEST-2025-12345678-ABCD1234",
    "question": "¿Cuál es la pregunta?",
    "answer": "la respuesta correcta",
    "points": 100,
    "order_num": 1,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Nota**: El `qr_code` se genera automáticamente.

### PUT /admin/checkpoints/:id

Actualizar un checkpoint.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del checkpoint

**Body** (todos los campos opcionales):
```json
{
  "name": "Stand Principal - Actualizado",
  "points": 150
}
```

**Response**: Igual que POST /admin/checkpoints

### DELETE /admin/checkpoints/:id

Eliminar un checkpoint.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del checkpoint

**Response**:
```json
{
  "success": true,
  "message": "Checkpoint eliminado exitosamente"
}
```

### GET /admin/checkpoints/:id/qr

Obtener código QR de un checkpoint como imagen.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del checkpoint

**Response**:
```json
{
  "success": true,
  "data": {
    "qrCode": "COOPQUEST-2025-12345678-ABCD1234",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Nota**: `qrImage` es un Data URL que puedes usar directamente en un `<img>` tag.

### GET /admin/events/:id/export

Exportar resultados de un evento.

**Headers**:
```
x-admin-password: {password}
```

**Parameters**:
- `id` (path): UUID del evento

**Response**:
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "name": "Punto Coop 2025",
      "status": "finished"
    },
    "teams": [
      {
        "id": "uuid",
        "name": "Los Cooperativistas",
        "score": 570,
        "completed_checkpoints": 5,
        "failed_checkpoints": 0,
        "total_checkpoints": 5
      }
    ],
    "checkpoints": [
      {
        "id": "uuid",
        "name": "Stand de gcoop",
        "points": 100,
        "order_num": 1
      }
    ],
    "stats": {
      "totalTeams": 25,
      "totalCheckpoints": 5,
      "totalCompletions": 87
    },
    "exportedAt": "2025-11-13T18:00:00.000Z"
  }
}
```

---

## Códigos de Error

### Códigos HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: nombre duplicado)
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Error del servidor

### Formato de Error

```json
{
  "error": true,
  "message": "Descripción del error",
  "statusCode": 400,
  "timestamp": "2025-11-13T10:00:00.000Z"
}
```

### Errores Comunes

**400 Bad Request**:
```json
{
  "error": true,
  "message": "EventId y nombre del equipo son requeridos",
  "statusCode": 400
}
```

**401 Unauthorized**:
```json
{
  "error": true,
  "message": "No se proporcionó token de autenticación",
  "statusCode": 401
}
```

**404 Not Found**:
```json
{
  "error": true,
  "message": "Código QR inválido",
  "statusCode": 404
}
```

**429 Rate Limit**:
```json
{
  "error": true,
  "message": "Espera 5 segundos antes de escanear otro código QR",
  "statusCode": 429
}
```

---

## Rate Limiting

Límites implementados:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `POST /teams/register` | 5 requests | 15 minutos |
| `POST /game/scan` | 1 request | 5 segundos |
| Todos los demás | 100 requests | 15 minutos |

Cuando se excede el límite, se retorna `429 Too Many Requests`.

**Headers de rate limit**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

---

## WebSocket

### Conexión

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
```

### Suscribirse a un evento

**Enviar**:
```json
{
  "type": "subscribe",
  "eventId": "uuid"
}
```

**Recibir confirmación**:
```json
{
  "type": "subscribed",
  "eventId": "uuid"
}
```

### Actualización de leaderboard

**Recibir** (cuando cambia el leaderboard):
```json
{
  "type": "leaderboard_update",
  "eventId": "uuid",
  "data": [
    {
      "id": "uuid",
      "name": "Los Cooperativistas",
      "score": 570,
      "completed_checkpoints": 5,
      "failed_checkpoints": 0,
      "total_checkpoints": 5
    }
  ]
}
```

---

## Ejemplos con cURL

### Registrar equipo
```bash
curl -X POST http://localhost:3001/api/teams/register \
  -H "Content-Type: application/json" \
  -d '{"eventId":"uuid","teamName":"Los Cooperativistas"}'
```

### Escanear QR (con token)
```bash
curl -X POST http://localhost:3001/api/game/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-token-jwt" \
  -d '{"qrCode":"COOPQUEST-2025-CP001-GCOOP"}'
```

### Crear evento (admin)
```bash
curl -X POST http://localhost:3001/api/admin/events \
  -H "Content-Type: application/json" \
  -H "x-admin-password: admin123" \
  -d '{
    "name":"Mi Evento 2025",
    "description":"Descripción",
    "date":"2025-12-01T10:00:00",
    "location":"Buenos Aires",
    "status":"active"
  }'
```

---

## Postman Collection

Una colección de Postman con todos los endpoints está disponible en:
```
docs/CoopQuest.postman_collection.json
```

Importa este archivo en Postman para testear la API fácilmente.

---

<div align="center">

**[README](README.md) | [User Guide](USER_GUIDE.md) | [Deployment](DEPLOYMENT.md)**

**Desarrollado por [gcoop](https://gcoop.coop)**

</div>
