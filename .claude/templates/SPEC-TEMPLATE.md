# SPEC: [NOMBRE_PROYECTO]

> Generado: [FECHA] | Versión: 1.0
> Autor: Vicente Rivas Monferrer

---

## Resumen Ejecutivo

[Descripción de 2-3 párrafos del proyecto, su propósito y propuesta de valor única]

---

## Declaración del Problema

### El Problema
[Descripción detallada del problema que resuelve]

### Contexto del Mercado
[Alternativas actuales y por qué no son suficientes]

### Impacto
[Qué sucede si el problema no se resuelve]

---

## Usuarios Objetivo

### Persona 1: [Nombre]
- **Rol**: [Descripción del rol]
- **Necesidades**: [Lista de necesidades principales]
- **Frustraciones**: [Puntos de dolor actuales]
- **Objetivos**: [Qué quiere lograr]

### Persona 2: [Nombre]
[Repetir estructura si hay más personas]

---

## Requisitos Funcionales

### Core Features (MVP)

#### Feature 1: [Nombre]
- **Descripción**: [Qué hace]
- **Criterios de Aceptación**:
  - [ ] [Criterio 1]
  - [ ] [Criterio 2]
  - [ ] [Criterio 3]
- **Flujo de Usuario**:
  1. [Paso 1]
  2. [Paso 2]
  3. [Paso 3]

#### Feature 2: [Nombre]
[Repetir estructura]

#### Feature 3: [Nombre]
[Repetir estructura]

### Scope Futuro (Post-MVP)
- [ ] [Feature futura 1]
- [ ] [Feature futura 2]
- [ ] [Feature futura 3]

---

## Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | [Tech] | [Por qué] |
| Backend | [Tech] | [Por qué] |
| Database | [Tech] | [Por qué] |
| Auth | [Tech] | [Por qué] |
| Hosting | [Tech] | [Por qué] |

### Diseño del Sistema

```
[Diagrama ASCII de la arquitectura]

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│  (Next.js)  │     │  (API/tRPC) │     │  (Supabase) │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Modelos de Datos

```typescript
// Entidad principal
interface [Entidad] {
  id: string;
  // ... campos
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Especificaciones UI/UX

### Flujos de Usuario

#### Flujo Principal: [Nombre]
```
[Estado A] → [Acción] → [Estado B] → [Acción] → [Estado C]
```

#### Flujo Secundario: [Nombre]
[Descripción del flujo]

### Wireframes (Descripciones)

#### Pantalla 1: [Nombre]
- **Header**: [Descripción]
- **Contenido Principal**: [Descripción]
- **Acciones**: [Botones/Links disponibles]
- **Estados**: [Loading, Error, Empty, Success]

#### Pantalla 2: [Nombre]
[Repetir estructura]

### Sistema de Diseño
- **Colores**: Usar Tailwind defaults o personalizar
- **Tipografía**: Inter para texto, monospace para código
- **Espaciado**: Sistema de 4px (Tailwind)
- **Componentes**: Atomic Design (atoms → molecules → organisms)

---

## Especificaciones de API

### Endpoints

#### `POST /api/[recurso]`
- **Descripción**: [Qué hace]
- **Request Body**:
```json
{
  "campo": "valor"
}
```
- **Response** (200):
```json
{
  "id": "...",
  "campo": "valor"
}
```
- **Errores**:
  - `400`: Validación fallida
  - `401`: No autenticado
  - `403`: No autorizado

[Repetir para cada endpoint]

---

## Estrategia de Testing

### Tests Unitarios
- Cobertura mínima: **80%**
- Framework: Jest
- Foco: Lógica de negocio, utilidades, hooks

### Tests de Integración
- Framework: Testing Library
- Foco: Componentes, flujos de usuario

### Tests E2E
- Framework: Playwright
- Foco: Flujos críticos de negocio
- Casos:
  - [ ] [Flujo crítico 1]
  - [ ] [Flujo crítico 2]

---

## Plan de Deployment

### Ambientes
| Ambiente | URL | Branch | Auto-deploy |
|----------|-----|--------|-------------|
| Development | localhost:3000 | - | - |
| Staging | staging.app.com | develop | Sí |
| Production | app.com | main | Sí |

### CI/CD Pipeline
1. Push a branch → Run tests
2. PR a develop → Run tests + Preview deploy
3. Merge a develop → Deploy a Staging
4. Merge a main → Deploy a Production

### Variables de Entorno
```bash
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs
[API_NAME]_API_KEY=
```

---

## Requisitos No Funcionales

### Rendimiento
- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms

### Seguridad
- [ ] Autenticación segura (JWT/Session)
- [ ] HTTPS obligatorio
- [ ] Rate limiting en APIs
- [ ] Validación de inputs
- [ ] Sanitización de outputs
- [ ] CSP headers configurados

### Escalabilidad
- Usuarios esperados inicialmente: [número]
- Crecimiento esperado: [%/mes]
- Datos estimados: [volumen]

### Accesibilidad
- [ ] WCAG 2.1 AA compliance
- [ ] Navegación por teclado
- [ ] Screen reader compatible
- [ ] Contraste adecuado

---

## Métricas de Éxito

### KPIs de Producto
| Métrica | Objetivo | Plazo |
|---------|----------|-------|
| [Métrica 1] | [Valor] | [Tiempo] |
| [Métrica 2] | [Valor] | [Tiempo] |

### KPIs Técnicos
| Métrica | Objetivo |
|---------|----------|
| Uptime | 99.9% |
| Error rate | < 0.1% |
| Response time (p95) | < 500ms |

---

## Timeline y Milestones

### Fase 1: Foundation (Semana 1)
- [ ] Setup del proyecto
- [ ] Configuración de CI/CD
- [ ] Modelos de datos base
- [ ] Autenticación

### Fase 2: Core Features (Semana 2-3)
- [ ] Feature 1 completa
- [ ] Feature 2 completa
- [ ] Feature 3 completa

### Fase 3: Polish (Semana 4)
- [ ] Testing completo
- [ ] Documentación
- [ ] Optimización de rendimiento
- [ ] Deploy a producción

---

## Notas Adicionales

[Cualquier información adicional relevante que no encaje en las secciones anteriores]

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | [FECHA] | Versión inicial |
