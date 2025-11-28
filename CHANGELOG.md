# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-11-28

### Agregado - MVP Completo

#### Backend
- API REST completa con Express.js
- WebSocket para actualizaciones en tiempo real del leaderboard
- Base de datos PostgreSQL con schema completo
- Sistema de autenticación con JWT para equipos
- Panel de administración con password
- Rate limiting en endpoints críticos
- Generación automática de códigos QR
- Validación de respuestas con normalización
- Sistema de eventos, checkpoints, equipos y progreso
- Script de seed con datos de prueba pre-cargados
- 5 checkpoints demo listos para usar
- Exportación de resultados en JSON

#### Frontend
- PWA (Progressive Web App) con React 18
- Scanner de códigos QR integrado (html5-qrcode)
- Dashboard de equipo con progreso en tiempo real
- Leaderboard con actualización via WebSocket
- Sistema de registro de equipos
- Página de preguntas con validación
- Animaciones y gamificación (confetti)
- Diseño mobile-first con Tailwind CSS
- Modo offline básico
- Responsive en mobile, tablet y desktop

#### Docker
- Docker Compose con PostgreSQL, Backend y Frontend
- Configuración lista para producción
- Nginx como proxy reverso
- Health checks en contenedores

#### Documentación
- README.md completo con instalación y uso
- USER_GUIDE.md para participantes y organizadores
- API_DOCS.md con todos los endpoints documentados
- DEPLOYMENT.md con guía de deploy en VPS
- CONTRIBUTING.md para colaboradores
- Licencia AGPL-3.0

#### QR Codes Demo
- 5 códigos QR generados automáticamente
- Stand de gcoop (100 pts)
- Stand de FACTTIC (150 pts)
- Sala de Charlas (120 pts)
- Área de Networking (100 pts)
- Demo de IA (200 pts)
- README con respuestas para testing

### Características Técnicas

- ✅ 100% Open Source (AGPL-3.0)
- ✅ Sin dependencias de servicios propietarios
- ✅ Soberanía tecnológica
- ✅ Accesible (WCAG AA)
- ✅ Seguridad (rate limiting, JWT, hash QR)
- ✅ Real-time (WebSocket)
- ✅ Mobile-first
- ✅ PWA capabilities
- ✅ Docker ready

### Testing

- Evento demo completo pre-configurado
- Comando `npm run seed:demo` para cargar datos
- QR codes listos para imprimir
- Respuestas documentadas para testing

---

## [Próximas versiones]

### v1.1 - Planificado
- [ ] Sistema de hints (pistas)
- [ ] Timer global del evento
- [ ] Modo "Amazing Race" (checkpoints en orden)
- [ ] Compartir en redes sociales
- [ ] Múltiples idiomas (ES/EN)
- [ ] Dark mode
- [ ] Panel admin mejorado con UI completa

### v2.0 - Futuro
- [ ] App nativa (opcional)
- [ ] Sistema de badges y logros
- [ ] Certificados de participación (PDF)
- [ ] Analytics avanzados
- [ ] Notificaciones push
- [ ] Integración con APIs externas

---

[1.0.0]: https://github.com/gcoop/coopquest/releases/tag/v1.0.0
