# CoopQuest - Quick Start Guide

## Instalación Rápida (5 minutos)

### Opción 1: Docker (Más fácil)

```bash
# 1. Clonar
git clone https://github.com/gcoop/coopquest.git
cd coopquest

# 2. Levantar servicios
docker compose up -d

# 3. Cargar datos demo
docker exec coopquest-backend npm run seed:demo

# 4. ¡Listo!
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Opción 2: Manual

```bash
# 1. Clonar
git clone https://github.com/gcoop/coopquest.git
cd coopquest

# 2. Instalar dependencias
npm run install:all

# 3. Configurar PostgreSQL
createdb coopquest
psql coopquest < backend/database/schema.sql

# 4. Configurar .env (ya existe, editarlo si es necesario)

# 5. Cargar datos demo
cd backend && npm run seed:demo

# 6. Iniciar backend
npm run dev

# 7. En otra terminal, iniciar frontend
cd frontend && npm run dev
```

## Primeros Pasos

### Para Participantes:

1. **Acceder**: http://localhost:3000
2. **Registrar equipo** en el evento activo
3. **Escanear QR codes** con la cámara del celular
4. **Responder preguntas** para sumar puntos
5. **Ver ranking** en tiempo real

### Para Organizadores:

1. **Acceder al admin**: http://localhost:3000/admin
2. **Crear evento** con nombre, descripción, fecha y ubicación
3. **Agregar checkpoints** con preguntas y respuestas
4. **Generar QR codes** para imprimir y distribuir
5. **Activar el evento** cambiando estado a "Activo"
6. **Monitorear progreso** en el leaderboard público

## Respuestas Demo

- Stand de gcoop: `2007`
- Stand de FACTTIC: `30`
- Sala de Charlas: `código abierto`
- Área de Networking: `quinto` o `5`
- Demo de IA: `ollama`

## Panel Admin

- **URL**: http://localhost:3000/admin
- **Password**: `admin123` (cambiarlo en producción)

### Funcionalidades:

- ✅ **Gestión de Eventos**: Crear, editar y eliminar eventos
- ✅ **Gestión de Checkpoints**: Crear, editar y eliminar checkpoints por evento
- ✅ **Generador de QR**: Descargar códigos QR individuales o en lote
- 📊 **Estadísticas**: Ver resumen de participantes y progreso (próximamente)

## Documentación

- [README.md](README.md) - Documentación completa
- [USER_GUIDE.md](USER_GUIDE.md) - Guía de usuario
- [API_DOCS.md](API_DOCS.md) - Documentación API
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de deploy

## Soporte

- Issues: https://github.com/gcoop/coopquest/issues
- Email: info@gcoop.coop

---

**¡Disfruta CoopQuest!** 🎯
