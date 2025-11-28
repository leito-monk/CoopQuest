# 📖 Guía de Usuario - CoopQuest

**Versión 1.0** - Noviembre 2025

---

## Tabla de Contenidos

1. [Para Participantes](#para-participantes)
2. [Para Organizadores](#para-organizadores)
3. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)

---

## Para Participantes

### 🎮 Cómo Jugar

#### 1. Acceder al Juego

1. Abre tu navegador móvil (Chrome, Safari, Firefox)
2. Ingresa a la URL del evento (ej: `coopquest.gcoop.coop`)
3. Verás la pantalla de bienvenida con los eventos activos

**💡 Tip**: Agrega la página a tu pantalla de inicio para usarla como app.

#### 2. Registrar tu Equipo

1. Selecciona el evento al que quieres unirte
2. Ingresa un nombre creativo para tu equipo
   - Máximo 50 caracteres
   - Debe ser único en el evento
   - No uses palabras ofensivas
3. Presiona "¡Comenzar la búsqueda!"
4. Tu sesión se guardará automáticamente

**⚠️ Importante**: 
- Solo puedes registrarte una vez por evento
- Guarda tu sesión para continuar después
- Si cierras el navegador, tu progreso se mantiene

#### 3. Dashboard Principal

Después de registrarte, verás tu dashboard con:

- **Puntos totales**: Tu score actual
- **Estadísticas**: Checkpoints completados/fallidos/pendientes
- **Lista de checkpoints**: Con su estado y puntos
- **Botones de acción**: Escanear QR y Ver Ranking

#### 4. Escanear Códigos QR

1. Presiona el botón "📷 Escanear QR"
2. Permite el acceso a la cámara (solo la primera vez)
3. Apunta la cámara al código QR
4. Mantén el teléfono estable
5. El código se detectará automáticamente

**💡 Tips para escanear**:
- Buena iluminación ayuda
- No cubras el código con tu sombra
- Mantén distancia de 10-30 cm
- Centra el QR en el cuadro

#### 5. Responder Preguntas

Cuando escanees un QR válido:

1. Aparecerá la pregunta del checkpoint
2. Lee cuidadosamente la pregunta
3. Escribe tu respuesta
4. Presiona "Responder"

**⚠️ MUY IMPORTANTE**:
- Solo tienes **UNA oportunidad** por checkpoint
- Si fallas, no podrás reintentar
- Las mayúsculas/minúsculas no importan
- Los acentos son opcionales

#### 6. Ganar Puntos

- ✅ **Respuesta correcta**: Sumas los puntos del checkpoint
- ❌ **Respuesta incorrecta**: El checkpoint se marca como fallido
- Los puntos varían según la dificultad (100-200 puntos)

#### 7. Ver el Ranking

1. Presiona "🏆 Ranking" desde el dashboard
2. Verás todos los equipos ordenados por puntos
3. Tu equipo estará destacado
4. El ranking se actualiza en tiempo real

**🏅 Medallas**:
- 🥇 1er lugar
- 🥈 2do lugar
- 🥉 3er lugar

#### 8. Completar el Juego

Cuando completes todos los checkpoints:
- 🎉 Verás una animación de celebración
- Aparecerá tu puntuación final
- Podrás ver tu posición en el ranking

---

## Para Organizadores

### 🔧 Configuración del Evento

#### 1. Instalación

Ver [README.md](README.md#instalación-rápida) para instrucciones detalladas.

**Opción rápida con Docker**:
```bash
git clone https://github.com/gcoop/coopquest.git
cd coopquest
cp .env.example .env
docker-compose up -d
```

#### 2. Configurar Variables de Entorno

Edita el archivo `.env`:

```env
# Contraseña del panel admin (¡CÁMBIALA!)
ADMIN_PASSWORD=tu-password-seguro

# Secreto para JWT (generar uno aleatorio)
JWT_SECRET=tu-secreto-jwt-muy-largo-y-seguro

# Secreto para QR codes (generar uno aleatorio)
QR_CODE_SECRET=tu-secreto-qr-muy-largo-y-seguro

# Base de datos (si no usas Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coopquest
DB_USER=coopquest
DB_PASSWORD=tu-password-db
```

**🔐 Seguridad**: Usa contraseñas fuertes en producción.

#### 3. Cargar Datos de Prueba

Para testear con el evento demo:

```bash
docker exec coopquest-backend npm run seed:demo
# O sin Docker:
cd backend && npm run seed:demo
```

Esto crea:
- 1 evento demo activo
- 5 checkpoints con preguntas
- 5 códigos QR en `backend/public/demo-qrs/`

#### 4. Crear tu Propio Evento

**Usando el panel admin** (próximamente en v1.1)

**Usando la API directamente**:

```bash
curl -X POST http://localhost:3001/api/admin/events \
  -H "Content-Type: application/json" \
  -H "x-admin-password: tu-password" \
  -d '{
    "name": "Mi Evento Cooperativo 2025",
    "description": "Descripción del evento",
    "date": "2025-11-13T10:00:00",
    "location": "Buenos Aires",
    "status": "active"
  }'
```

#### 5. Crear Checkpoints

```bash
curl -X POST http://localhost:3001/api/admin/checkpoints \
  -H "Content-Type: application/json" \
  -H "x-admin-password: tu-password" \
  -d '{
    "event_id": "id-del-evento",
    "name": "Stand Principal",
    "description": "Checkpoint en el stand de bienvenida",
    "question": "¿Cuál es el lema de nuestro evento?",
    "answer": "cooperación y tecnología",
    "points": 100,
    "order_num": 1
  }'
```

El sistema generará automáticamente un código QR único.

#### 6. Descargar Códigos QR

**Opción 1: Desde el seed demo**
```bash
ls backend/public/demo-qrs/
# Imprime estos archivos PNG
```

**Opción 2: Via API**
```bash
curl -X GET http://localhost:3001/api/admin/checkpoints/{checkpoint-id}/qr \
  -H "x-admin-password: tu-password"
```

#### 7. Imprimir y Colocar QR Codes

1. Imprime los códigos QR en tamaño A4 o A5
2. Plastifica o protege con mica
3. Coloca cada QR en su stand/ubicación correspondiente
4. Asegúrate de que estén a una altura visible
5. Buena iluminación ayuda al escaneo

**💡 Tips de impresión**:
- Tamaño mínimo: 10x10 cm
- Máximo: 20x20 cm (más grande = más fácil de escanear)
- Papel blanco para máximo contraste
- Evitar superficies reflectantes

#### 8. Durante el Evento

**Monitorear en tiempo real**:
1. Accede a `/admin`
2. Ingresa la contraseña de admin
3. Ve estadísticas en vivo
4. Consulta el leaderboard

**Estadísticas disponibles**:
- Total de equipos registrados
- Checkpoints más/menos visitados
- Ranking actualizado en tiempo real
- Tasa de éxito por checkpoint

#### 9. Después del Evento

**Exportar resultados**:
```bash
curl -X GET http://localhost:3001/api/admin/events/{event-id}/export \
  -H "x-admin-password: tu-password" > resultados.json
```

Los resultados incluyen:
- Clasificación final
- Puntos por equipo
- Checkpoints completados/fallidos
- Estadísticas del evento

#### 10. Cambiar Estado del Evento

Para finalizar el evento:

```bash
curl -X PUT http://localhost:3001/api/admin/events/{event-id} \
  -H "Content-Type: application/json" \
  -H "x-admin-password: tu-password" \
  -d '{"status": "finished"}'
```

Estados disponibles:
- `draft`: En preparación (no visible)
- `active`: En curso (visible y jugable)
- `finished`: Finalizado (visible pero no jugable)

---

## Preguntas Frecuentes (FAQ)

### Para Participantes

**P: ¿Necesito instalar una aplicación?**  
R: No. CoopQuest funciona 100% desde el navegador web. Es una PWA (Progressive Web App).

**P: ¿Funciona sin internet?**  
R: Necesitas internet para registrarte y enviar respuestas. La app tiene cache básico para funcionar con conexiones inestables.

**P: ¿Puedo jugar solo o debo formar equipo?**  
R: Puedes jugar solo usando tu nombre como nombre del equipo, o formar equipos reales con amigos.

**P: ¿Qué pasa si cierro el navegador?**  
R: Tu progreso se guarda automáticamente en tu dispositivo. Al volver a abrir, continúas donde dejaste.

**P: ¿Puedo usar el mismo QR varias veces?**  
R: No. Una vez que respondes (correcta o incorrectamente) un checkpoint, no puedes volver a intentarlo.

**P: ¿Las respuestas distinguen mayúsculas?**  
R: No. "GCOOP", "gcoop" y "Gcoop" son todas válidas. Tampoco importan los acentos.

**P: ¿Qué navegadores son compatibles?**  
R: Chrome, Firefox, Safari, Edge. Requiere un navegador moderno con soporte para cámara.

**P: ¿Funciona en iPhone?**  
R: Sí, en Safari iOS 12 o superior.

**P: La cámara no funciona, ¿qué hago?**  
R: 
1. Verifica permisos de cámara en configuración
2. Recarga la página
3. Usa otro navegador
4. Contacta al organizador

**P: ¿Puedo compartir mi resultado en redes sociales?**  
R: Próximamente en v1.1. Por ahora, puedes hacer screenshot del ranking.

### Para Organizadores

**P: ¿Cuántos equipos soporta?**  
R: El sistema está probado con 100-300 equipos simultáneos. Para más, consultar escalabilidad en DEPLOYMENT.md.

**P: ¿Necesito conocimientos técnicos?**  
R: Básicos. Si sabes usar Docker y la terminal, puedes instalarlo. Para personalización avanzada, se requiere programación.

**P: ¿Puedo personalizar preguntas y diseño?**  
R: Sí. Las preguntas se configuran via API o base de datos. El diseño requiere modificar el código (open source).

**P: ¿Cómo evito que hagan trampa?**  
R: 
- Los QR codes tienen hash de seguridad
- Rate limiting: 1 escaneo cada 5 segundos
- No se puede reintentar un checkpoint fallido
- Los QR codes solo funcionan para el evento correcto

**P: ¿Puedo tener múltiples eventos simultáneos?**  
R: Sí, en la misma instalación puedes tener múltiples eventos.

**P: ¿Cómo hago backup de los datos?**  
R: Ver [DEPLOYMENT.md](DEPLOYMENT.md#backup-y-restore) para instrucciones de backup de PostgreSQL.

**P: ¿Cuánto cuesta?**  
R: ¡Es gratis! Software 100% libre (AGPL-3.0). Solo pagas hosting si usas un servidor VPS.

**P: ¿Puedo modificar el código?**  
R: Sí, es open source. Si lo usas en producción y lo modificas, debes compartir los cambios (licencia AGPL).

**P: ¿Hay soporte técnico?**  
R: Soporte comunitario via GitHub Issues. Para soporte profesional, contacta a gcoop.

**P: ¿Funciona en eventos virtuales?**  
R: Está diseñado para eventos presenciales. Para eventos virtuales, deberías compartir los QR codes digitalmente (no es el uso recomendado).

---

## 📞 Soporte

Si tienes problemas o preguntas:

- **Documentación**: Lee [README.md](README.md) y [API_DOCS.md](API_DOCS.md)
- **Issues**: [GitHub Issues](https://github.com/gcoop/coopquest/issues)
- **Email**: info@gcoop.coop

---

## 🎯 Consejos para un Evento Exitoso

### Antes del Evento

- ✅ Testea todo el flujo completo con datos de prueba
- ✅ Imprime y coloca los QR codes con anticipación
- ✅ Verifica que todos los QR codes escanean correctamente
- ✅ Prepara instrucciones impresas para los participantes
- ✅ Ten un plan B si falla internet (4G, backup de internet)

### Durante el Evento

- ✅ Ten una persona monitoreando el panel admin
- ✅ Ten un QR code de "prueba" para ayudar a quienes tienen dudas
- ✅ Anuncia el ranking periódicamente para motivar
- ✅ Celebra cuando alguien completa todos los checkpoints

### Después del Evento

- ✅ Exporta los resultados inmediatamente
- ✅ Anuncia ganadores oficiales
- ✅ Comparte fotos del evento
- ✅ Pide feedback para mejorar

---

<div align="center">

**¿Necesitas más ayuda?**

[README](README.md) | [API Docs](API_DOCS.md) | [Deployment](DEPLOYMENT.md)

**Desarrollado con ❤️ por [gcoop](https://gcoop.coop)**

</div>
