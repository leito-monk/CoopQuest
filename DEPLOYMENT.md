# 🚀 Deployment Guide - CoopQuest

**Guía completa de deployment en producción**

---

## Tabla de Contenidos

1. [Requisitos de Producción](#requisitos-de-producción)
2. [Deploy con Docker (Recomendado)](#deploy-con-docker-recomendado)
3. [Deploy Manual en VPS](#deploy-manual-en-vps)
4. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
5. [Variables de Entorno](#variables-de-entorno)
6. [Backup y Restore](#backup-y-restore)
7. [Monitoreo](#monitoreo)
8. [Troubleshooting](#troubleshooting)
9. [Escalabilidad](#escalabilidad)

---

## Requisitos de Producción

### Servidor (VPS/Cloud)

**Mínimo**:
- 2 CPU cores
- 2 GB RAM
- 20 GB SSD
- Ubuntu 20.04+ / Debian 11+

**Recomendado para 100-300 usuarios**:
- 4 CPU cores
- 4 GB RAM
- 40 GB SSD
- Ubuntu 22.04 LTS

### Software

- Docker 20+ y Docker Compose 2+ (opción recomendada)
- O: Node.js 18+, PostgreSQL 15+, Nginx (instalación manual)

### Dominio

- Dominio propio (ej: `coopquest.gcoop.coop`)
- Acceso a DNS para configurar registros A/CNAME

---

## Deploy con Docker (Recomendado)

### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### 2. Clonar el Repositorio

```bash
cd /opt
sudo git clone https://github.com/gcoop/coopquest.git
cd coopquest
```

### 3. Configurar Variables de Entorno

```bash
sudo cp .env.example .env
sudo nano .env
```

**Configuración mínima**:
```env
# ⚠️ CAMBIAR EN PRODUCCIÓN
ADMIN_PASSWORD=tu-password-super-seguro-aqui
JWT_SECRET=jwt-secret-muy-largo-y-aleatorio-minimo-32-caracteres
QR_CODE_SECRET=qr-secret-muy-largo-y-aleatorio-minimo-32-caracteres

# Database
DATABASE_URL=postgresql://coopquest:coopquest123@postgres:5432/coopquest
DB_HOST=postgres
DB_PORT=5432
DB_NAME=coopquest
DB_USER=coopquest
DB_PASSWORD=coopquest-db-password-seguro

# Backend
PORT=3001
NODE_ENV=production

# URLs (actualizar con tu dominio)
VITE_API_URL=https://coopquest.tu-dominio.com
VITE_WS_URL=wss://coopquest.tu-dominio.com
```

**🔐 Generar secrets seguros**:
```bash
# JWT Secret
openssl rand -base64 48

# QR Secret
openssl rand -base64 48
```

### 4. Construir y Levantar Contenedores

```bash
# Build de las imágenes
sudo docker compose build

# Levantar servicios
sudo docker compose up -d

# Ver logs
sudo docker compose logs -f

# Verificar que todo está corriendo
sudo docker compose ps
```

Deberías ver 3 contenedores:
- `coopquest-db` (PostgreSQL)
- `coopquest-backend` (API)
- `coopquest-frontend` (React)

### 5. Cargar Datos de Prueba (Opcional)

```bash
sudo docker exec coopquest-backend npm run seed:demo
```

### 6. Verificar

```bash
# Backend health check
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

---

## Deploy Manual en VPS

### 1. Instalar Dependencias

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx

# PM2 (process manager)
sudo npm install -g pm2
```

### 2. Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -i -u postgres

# Crear base de datos y usuario
createuser coopquest
createdb coopquest -O coopquest

# Establecer password
psql -c "ALTER USER coopquest WITH PASSWORD 'password-seguro';"

# Salir
exit
```

### 3. Clonar y Configurar Proyecto

```bash
cd /opt
sudo git clone https://github.com/gcoop/coopquest.git
cd coopquest

# Instalar dependencias
npm run install:all

# Configurar variables de entorno
sudo cp .env.example .env
sudo nano .env
# (Editar con tus valores)

# Inicializar base de datos
cd backend
psql -U coopquest -d coopquest < database/schema.sql
```

### 4. Build del Frontend

```bash
cd /opt/coopquest/frontend
npm run build
```

### 5. Configurar PM2

```bash
cd /opt/coopquest/backend

# Iniciar backend con PM2
pm2 start src/index.js --name coopquest-backend

# Guardar configuración PM2
pm2 save

# Auto-start en boot
pm2 startup
# Ejecutar el comando que PM2 muestra
```

### 6. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/coopquest
```

```nginx
server {
    listen 80;
    server_name coopquest.tu-dominio.com;

    # Frontend
    location / {
        root /opt/coopquest/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/coopquest /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## Configuración de Dominio y SSL

### 1. Configurar DNS

En tu proveedor de DNS (ej: Cloudflare, GoDaddy):

```
Tipo: A
Nombre: coopquest (o @)
Valor: IP_DE_TU_SERVIDOR
TTL: 300
```

### 2. Instalar Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d coopquest.tu-dominio.com

# Seguir las instrucciones
# Certbot configurará automáticamente Nginx con SSL
```

### 3. Auto-renovación SSL

Certbot instala un cron job automáticamente. Para verificar:

```bash
# Probar renovación
sudo certbot renew --dry-run

# Ver timer de renovación automática
sudo systemctl status certbot.timer
```

### 4. Actualizar URLs en .env

```bash
sudo nano /opt/coopquest/.env
```

```env
VITE_API_URL=https://coopquest.tu-dominio.com
VITE_WS_URL=wss://coopquest.tu-dominio.com
```

Rebuild del frontend:
```bash
cd /opt/coopquest/frontend
npm run build
```

---

## Variables de Entorno

### Completas para Producción

```env
# ========================================
# SEGURIDAD (⚠️ CAMBIAR TODAS)
# ========================================
ADMIN_PASSWORD=password-admin-muy-seguro
JWT_SECRET=secret-jwt-minimo-32-caracteres-aleatorios
QR_CODE_SECRET=secret-qr-minimo-32-caracteres-aleatorios

# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL=postgresql://coopquest:password@localhost:5432/coopquest
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coopquest
DB_USER=coopquest
DB_PASSWORD=password-db-seguro

# ========================================
# BACKEND
# ========================================
PORT=3001
NODE_ENV=production

# ========================================
# FRONTEND
# ========================================
VITE_API_URL=https://coopquest.tu-dominio.com
VITE_WS_URL=wss://coopquest.tu-dominio.com

# ========================================
# QR CODES
# ========================================
QR_CODE_PREFIX=COOPQUEST-2025
```

---

## Backup y Restore

### Backup Automático de PostgreSQL

```bash
# Crear script de backup
sudo nano /opt/scripts/backup-coopquest.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/coopquest"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="coopquest_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Backup
pg_dump -U coopquest coopquest > $BACKUP_DIR/$FILENAME

# Comprimir
gzip $BACKUP_DIR/$FILENAME

# Eliminar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completado: $FILENAME.gz"
```

```bash
# Hacer ejecutable
sudo chmod +x /opt/scripts/backup-coopquest.sh

# Programar con cron (diario a las 2 AM)
sudo crontab -e
```

```cron
0 2 * * * /opt/scripts/backup-coopquest.sh >> /var/log/coopquest-backup.log 2>&1
```

### Backup con Docker

```bash
# Backup
sudo docker exec coopquest-db pg_dump -U coopquest coopquest > backup_$(date +%Y%m%d).sql

# Comprimir
gzip backup_*.sql
```

### Restore

```bash
# Desde archivo .sql
psql -U coopquest coopquest < backup.sql

# Desde archivo .sql.gz
gunzip -c backup.sql.gz | psql -U coopquest coopquest

# Con Docker
gunzip -c backup.sql.gz | sudo docker exec -i coopquest-db psql -U coopquest coopquest
```

---

## Monitoreo

### Logs

**Docker**:
```bash
# Ver logs en vivo
sudo docker compose logs -f

# Solo backend
sudo docker compose logs -f backend

# Últimas 100 líneas
sudo docker compose logs --tail=100
```

**PM2**:
```bash
# Ver logs
pm2 logs coopquest-backend

# Monitoreo en tiempo real
pm2 monit
```

### Health Checks

**Script de monitoreo**:
```bash
#!/bin/bash
# /opt/scripts/check-coopquest.sh

API_URL="https://coopquest.tu-dominio.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE != "200" ]; then
    echo "CoopQuest API DOWN - HTTP $RESPONSE"
    # Opcional: enviar alerta por email
    # echo "API down" | mail -s "CoopQuest Alert" admin@tu-dominio.com
    
    # Reintentar reiniciar servicio
    pm2 restart coopquest-backend
fi
```

**Cron cada 5 minutos**:
```cron
*/5 * * * * /opt/scripts/check-coopquest.sh
```

### Herramientas Recomendadas

- **Uptime Kuma**: Monitoreo visual self-hosted
- **Prometheus + Grafana**: Métricas avanzadas
- **PM2 Plus**: Monitoreo cloud (pm2.io)

---

## Troubleshooting

### El backend no arranca

```bash
# Ver logs
sudo docker compose logs backend
# O
pm2 logs coopquest-backend

# Verificar variables de entorno
env | grep DATABASE_URL

# Probar conexión a DB
psql -U coopquest -h localhost -d coopquest
```

### Error de conexión a base de datos

```bash
# Verificar PostgreSQL corriendo
sudo systemctl status postgresql
# O
sudo docker compose ps postgres

# Ver logs de PostgreSQL
sudo journalctl -u postgresql -n 50
# O
sudo docker compose logs postgres
```

### WebSocket no conecta

- Verificar configuración de Nginx para `/ws`
- Verificar que el firewall permite WebSocket
- En Cloudflare: habilitar WebSocket en SSL/TLS

### La cámara no funciona

- HTTPS es requerido para acceso a cámara
- Verificar permisos del navegador
- Probar en otro navegador

### Rate limiting muy agresivo

Ajustar en `backend/src/middleware/rateLimiter.js`:
```javascript
export const scanRateLimiter = rateLimit({
  windowMs: 3 * 1000, // 3 segundos en vez de 5
  max: 1,
  // ...
});
```

---

## Escalabilidad

### Para 500+ usuarios simultáneos

**Aumentar recursos**:
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

**Aumentar pool de conexiones DB**:
```javascript
// backend/src/database/db.js
const pool = new Pool({
  max: 50, // aumentar de 20 a 50
  // ...
});
```

### Load Balancing

Para múltiples instancias del backend:

```nginx
upstream coopquest_backend {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location /api {
        proxy_pass http://coopquest_backend;
        # ...
    }
}
```

### CDN

Para archivos estáticos (frontend):
- Cloudflare (gratis, recomendado)
- AWS CloudFront
- Google Cloud CDN

---

## Seguridad en Producción

### Checklist

- ✅ HTTPS habilitado
- ✅ Firewall configurado (UFW)
- ✅ Passwords fuertes en .env
- ✅ PostgreSQL solo accesible desde localhost
- ✅ Rate limiting habilitado
- ✅ Backups automáticos
- ✅ Actualizaciones de seguridad

### Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver reglas
sudo ufw status
```

### Actualizaciones

```bash
# Actualizar dependencias NPM
cd /opt/coopquest/backend
npm audit fix

cd /opt/coopquest/frontend
npm audit fix

# Rebuild después de actualizar
npm run build

# Reiniciar servicios
pm2 restart all
# O
sudo docker compose restart
```

---

## Contacto de Soporte

- **Documentación**: [GitHub](https://github.com/gcoop/coopquest)
- **Issues**: [GitHub Issues](https://github.com/gcoop/coopquest/issues)
- **Email**: info@gcoop.coop

---

<div align="center">

**[README](README.md) | [User Guide](USER_GUIDE.md) | [API Docs](API_DOCS.md)**

**¡Éxito con tu deployment! 🚀**

</div>
