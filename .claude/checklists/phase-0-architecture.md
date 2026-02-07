# Checklist: Fase 0 - Arquitectura Cloud-Native

## Objetivo

Preparar la base técnica para escalar a producción.

---

## Items

### 1. Containerización

- [ ] **Dockerfile** presente y optimizado
  - Verificar: `ls Dockerfile`
  - Multi-stage build para menor tamaño
  - Usuario no-root configurado

- [ ] **docker-compose.yml** para desarrollo
  - Verificar: `ls docker-compose.yml`
  - Servicios: app, db, redis (si aplica)
  - Volúmenes para desarrollo

- [ ] **.dockerignore** configurado
  - Verificar: `ls .dockerignore`
  - Excluir: node_modules, .git, .env

### 2. Variables de Entorno

- [ ] **.env.example** con todas las variables
  - Verificar: `ls .env.example`
  - Documentar cada variable
  - Valores de ejemplo seguros

- [ ] **Separación por ambiente**
  - .env.development
  - .env.staging
  - .env.production
  - Verificar: `ls .env.*`

- [ ] **Validación de env vars** al iniciar
  - Usar zod o similar para validar
  - Fallar rápido si falta variable crítica

### 3. Estructura de Código

- [ ] **Separación de concerns clara**
  - src/domain/ (o equivalente)
  - src/application/
  - src/infrastructure/
  - src/presentation/

- [ ] **Path aliases** configurados
  - tsconfig.json paths
  - @/ o similar

### 4. Health Checks

- [ ] **Endpoint /health** implementado
  - Verificar: `grep -r "health" src/`
  - Retorna estado de DB
  - Retorna estado de servicios externos

- [ ] **Readiness probe** configurado
  - Para Kubernetes/Docker
  - Verifica que app está lista

---

## Comandos de Verificación

```bash
# Docker
docker build -t test .
docker compose config

# Env vars
cat .env.example | wc -l

# Health check
curl http://localhost:3000/health
```

---

## Recursos

- [12 Factor App](https://12factor.net/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## Siguiente Fase

Una vez completado, ejecutar:

```
/scale:iteration auth
```
