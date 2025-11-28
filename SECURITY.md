# Security Policy

## Versiones Soportadas

| Versión | Soportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad en CoopQuest, por favor:

1. **NO** abras un issue público
2. Envía un email a: **security@gcoop.coop**
3. Incluye:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Posibles soluciones (si las tienes)

Responderemos dentro de 48 horas y trabajaremos contigo para resolver el problema.

## Prácticas de Seguridad

### En Desarrollo

- Nunca commitees credenciales o secrets
- Usa `.env` para variables sensibles
- Mantén dependencias actualizadas (`npm audit`)

### En Producción

- Cambia todos los passwords por defecto
- Usa HTTPS/WSS exclusivamente
- Implementa firewall (UFW)
- Habilita backups automáticos
- Mantén el sistema operativo actualizado

### Reportadas y Resueltas

Ninguna vulnerabilidad reportada hasta la fecha.

---

**Gracias por ayudar a mantener CoopQuest seguro!** 🔐
