# 🎯 CoopQuest

**Juego de búsqueda del tesoro con códigos QR para eventos cooperativos**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

---

## 📖 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Uso](#-uso)
- [Datos de Prueba](#-datos-de-prueba)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 📝 Descripción

CoopQuest es una Progressive Web App (PWA) de código abierto que convierte eventos en experiencias interactivas de gamificación. Los participantes forman equipos, escanean códigos QR distribuidos en diferentes stands o ubicaciones, responden preguntas sobre cooperativismo y software libre, y compiten en un ranking en tiempo real.

Desarrollado específicamente para **Punto Coop 2025** (evento nacional cooperativo argentino), pero completamente adaptable a cualquier evento.

### ¿Para qué sirve?

- ✅ Aumentar la interacción en eventos presenciales
- ✅ Promover el recorrido por todos los stands
- ✅ Educar sobre cooperativismo de forma lúdica
- ✅ Fomentar el networking entre participantes
- ✅ Generar competencia amigable y engagement

---

## ✨ Características

### Para Participantes

- 📱 **PWA Mobile-First**: Funciona como app nativa sin instalación
- 📷 **Scanner QR integrado**: Usa la cámara del celular
- 🎯 **Sistema de puntos**: Respuestas correctas suman puntos
- 🏆 **Ranking en tiempo real**: Leaderboard con WebSocket
- ✅ **Progreso visual**: Checkpoints completados/pendientes/fallidos
- 🎉 **Gamificación**: Animaciones, confetti, badges

### Para Organizadores

- 🔧 **Panel admin web completo**: ABM de eventos y checkpoints sin código
- 📱 **Generador de QR**: Descarga individual o masiva de códigos
- 📊 **Estadísticas en vivo**: Monitoreo del evento en tiempo real
- ✏️ **Gestión de contenido**: Editar preguntas, respuestas y puntos sobre la marcha
- 📥 **Exportar resultados**: JSON/CSV para análisis posterior
- 🔐 **Seguridad**: Rate limiting, validación de QR codes, autenticación admin

### Técnicas

- 🌐 **100% Open Source**: AGPL-3.0
- 🐳 **Docker Ready**: Deploy con un comando
- 🔄 **Real-time**: WebSocket para actualizaciones instantáneas
- 📴 **Offline-first**: PWA con cache para conexiones inestables
- 🎨 **Responsive**: Mobile, tablet, desktop
- ♿ **Accesible**: WCAG AA compliance

---

## 🛠 Tecnologías

### Backend

- **Node.js 18+** + Express
- **PostgreSQL 15+** (base de datos)
- **WebSocket** (ws library para real-time)
- **JWT** (autenticación)
- **QRCode** (generación de códigos)

### Frontend

- **React 18** + React Router
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **html5-qrcode** (scanner QR)
- **canvas-confetti** (animaciones)
- **Axios** (HTTP client)

### DevOps

- **Docker** + Docker Compose
- **Nginx** (proxy reverso en producción)
- **GitHub Actions** (CI/CD ready)

---

## 📋 Requisitos Previos

- **Node.js 18+** y npm
- **PostgreSQL 15+** (o usar Docker)
- **Git**
- Navegador moderno (Chrome, Firefox, Safari)
- Cámara en dispositivo móvil (para escanear QR)

---

## 🚀 Instalación Rápida

### Opción 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/gcoop/coopquest.git
cd coopquest

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo con Docker
docker-compose up -d

# 4. Cargar datos de prueba
docker exec coopquest-backend npm run seed:demo

# ✅ Listo! Accede a:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# QR Codes: backend/public/demo-qrs/
```

### Opción 2: Instalación Manual

```bash
# 1. Clonar el repositorio
git clone https://github.com/gcoop/coopquest.git
cd coopquest

# 2. Instalar dependencias
npm run install:all

# 3. Configurar base de datos PostgreSQL
createdb coopquest
psql coopquest < backend/database/schema.sql

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 5. Cargar datos de prueba
cd backend
npm run seed:demo

# 6. Iniciar backend
npm run dev

# 7. En otra terminal, iniciar frontend
cd ../frontend
npm run dev

# ✅ Listo! Accede a:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 🎮 Uso

### 1. Acceder a la Aplicación

Abre tu navegador en `http://localhost:3000`

### 2. Registrar un Equipo

1. Haz clic en el evento demo "Punto Coop 2025 - Demo"
2. Ingresa un nombre para tu equipo (ej: "Los Cooperativistas")
3. Haz clic en "¡Comenzar la búsqueda!"

### 3. Escanear Códigos QR

1. Desde el dashboard, haz clic en "📷 Escanear QR"
2. Permite el acceso a la cámara
3. Apunta a uno de los QR codes de `backend/public/demo-qrs/`
4. Responde la pregunta que aparece
5. ¡Suma puntos!

### 4. Ver el Ranking

Haz clic en "🏆 Ranking" para ver la clasificación en tiempo real

### 5. Panel Admin

1. Ve a `http://localhost:3000/admin`
2. Contraseña por defecto: `admin123`
3. Explora eventos, estadísticas y documentación

---

## 🧪 Datos de Prueba

### Evento Demo Pre-cargado

Al ejecutar `npm run seed:demo`, se crea automáticamente:

- **Evento**: "Punto Coop 2025 - Demo"
- **Estado**: Activo (listo para jugar)
- **5 Checkpoints** con preguntas y respuestas

### Checkpoints y Respuestas

| # | Checkpoint | Pregunta | Respuesta | Puntos |
|---|-----------|----------|-----------|--------|
| 1 | Stand de gcoop | ¿En qué año se fundó gcoop? | `2007` | 100 |
| 2 | Stand de FACTTIC | ¿Cuántas cooperativas integran FACTTIC? | `30` | 150 |
| 3 | Sala de Charlas | ¿Qué significa "open source"? | `código abierto` | 120 |
| 4 | Área de Networking | ¿Número del principio de educación? | `quinto` o `5` | 100 |
| 5 | Demo de IA | ¿Qué IA usa gcoop para chatbots? | `ollama` | 200 |

### Ubicación de QR Codes

```
backend/public/demo-qrs/
├── checkpoint-1-gcoop.png
├── checkpoint-2-facttic.png
├── checkpoint-3-charlas.png
├── checkpoint-4-networking.png
├── checkpoint-5-iademo.png
└── README.md
```

**💡 Tip**: Imprime estos QR codes o ábrelos en otra pantalla para escanearlos desde tu celular.

---

## 📁 Estructura del Proyecto

```
coopquest/
├── backend/                    # API + WebSocket Server
│   ├── src/
│   │   ├── database/          # Conexión y schema SQL
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── models/            # Modelos de datos
│   │   ├── routes/            # Endpoints API
│   │   ├── seeds/             # Datos de prueba
│   │   ├── utils/             # Helpers
│   │   └── index.js           # Servidor principal
│   ├── public/demo-qrs/       # QR codes generados
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                   # React PWA
│   ├── src/
│   │   ├── pages/             # Componentes de páginas
│   │   ├── services/          # API + WebSocket
│   │   ├── App.jsx            # Router principal
│   │   └── main.jsx           # Entry point
│   ├── public/                # Assets estáticos
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml          # Orquestación Docker
├── .env.example               # Variables de entorno
├── package.json               # Scripts raíz
├── LICENSE                    # AGPL-3.0
├── README.md                  # Este archivo
├── DEPLOYMENT.md              # Guía de deploy
├── USER_GUIDE.md              # Guía para usuarios
└── API_DOCS.md                # Documentación API
```

---

## 📜 Scripts Disponibles

### Raíz del Proyecto

```bash
npm run install:all      # Instala dependencias de backend y frontend
npm run dev              # Inicia backend y frontend en modo desarrollo
npm run build            # Build de producción del frontend
npm run seed:demo        # Carga datos de prueba
npm run docker:up        # Levanta contenedores Docker
npm run docker:down      # Detiene contenedores Docker
npm run docker:logs      # Ver logs de Docker
npm run docker:rebuild   # Reconstruir contenedores
```

### Backend

```bash
cd backend
npm run dev              # Modo desarrollo con nodemon
npm start                # Modo producción
npm run seed:demo        # Cargar datos demo
npm run db:init          # Inicializar schema SQL
```

### Frontend

```bash
cd frontend
npm run dev              # Servidor de desarrollo Vite
npm run build            # Build de producción
npm run preview          # Preview del build
```

---

## 📚 Documentación

- **[QUICKSTART.md](QUICKSTART.md)**: Instalación y primeros pasos en 5 minutos
- **[USER_GUIDE.md](USER_GUIDE.md)**: Guía completa para participantes
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)**: 🆕 Guía del panel de administración
- **[API_DOCS.md](API_DOCS.md)**: Documentación de endpoints REST
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Guía de deployment en VPS/Cloud
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guía para contribuir al proyecto
- **[CHANGELOG.md](CHANGELOG.md)**: Historial de cambios por versión

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto de software libre.

### Cómo Contribuir

1. **Fork** el repositorio
2. Crea una **rama** para tu feature: `git checkout -b feature/mi-feature`
3. **Commit** tus cambios: `git commit -am 'Agrega mi feature'`
4. **Push** a la rama: `git push origin feature/mi-feature`
5. Abre un **Pull Request**

### Reportar Bugs

Abre un [Issue](https://github.com/gcoop/coopquest/issues) con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica

### Código de Conducta

- Respeto y cordialidad
- Lenguaje inclusivo
- Colaboración constructiva

---

## 📄 Licencia

**AGPL-3.0** - GNU Affero General Public License v3.0

Este software es **100% libre y de código abierto**. Puedes:
- ✅ Usar para cualquier propósito
- ✅ Estudiar y modificar el código
- ✅ Distribuir copias
- ✅ Distribuir versiones modificadas

**Requisito**: Si modificas y usas este software en un servidor (SaaS), **debes** compartir el código fuente modificado bajo la misma licencia.

Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **gcoop - Cooperativa de Software Libre**
  - Web: [gcoop.coop](https://gcoop.coop)
  - Email: info@gcoop.coop
  - GitHub: [@gcoop](https://github.com/gcoop)

### Creado por:
- Leandro - Presidente de gcoop y ex-presidente de FACTTIC

---

## 🙏 Agradecimientos

- **FACTTIC** - Federación Argentina de Cooperativas de Trabajo de Tecnología
- **Punto Coop 2025** - Evento nacional cooperativo
- Todas las cooperativas que inspiran este proyecto
- La comunidad de software libre

---

## 📞 Soporte

- **Documentación**: [README.md](README.md) | [USER_GUIDE.md](USER_GUIDE.md) | [API_DOCS.md](API_DOCS.md)
- **Issues**: [GitHub Issues](https://github.com/gcoop/coopquest/issues)
- **Email**: info@gcoop.coop

---

## 🗺 Roadmap

### v1.0 (Actual - MVP)
- ✅ Registro de equipos
- ✅ Scanner de QR codes
- ✅ Sistema de preguntas/respuestas
- ✅ Ranking en tiempo real
- ✅ Panel admin básico
- ✅ PWA capabilities

### v1.1 (Próximamente)
- [ ] Sistema de hints (pistas)
- [ ] Timer global del evento
- [ ] Modo "Amazing Race" (checkpoints en orden)
- [ ] Compartir en redes sociales
- [ ] Múltiples idiomas (ES/EN)
- [ ] Dark mode

### v2.0 (Futuro)
- [ ] App nativa (opcional)
- [ ] Integración con APIs externas
- [ ] Sistema de badges y logros
- [ ] Certificados de participación (PDF)
- [ ] Analytics avanzados
- [ ] Notificaciones push

---

## ⭐ ¿Te gusta CoopQuest?

Si este proyecto te resulta útil:
- Dale una ⭐ en GitHub
- Compártelo con otras cooperativas
- Contribuye con código o ideas
- Úsalo en tus eventos y cuéntanos cómo fue

---

<div align="center">

**Hecho con ❤️ por [gcoop](https://gcoop.coop)**

**Software Libre para un Mundo Cooperativo**

</div>
