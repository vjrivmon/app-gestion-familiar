---
name: project:stack
description: Recomienda stack tecnológico óptimo basado en requisitos del proyecto
allowed-tools: Read, WebSearch, AskUserQuestionTool
---

# Comando: Recomendar Stack Tecnológico

Analiza los requisitos del proyecto y recomienda el stack tecnológico óptimo basado en las preferencias de Vicente y mejores prácticas actuales.

## Uso

```
/project:stack
/project:stack <nombre-spec>  # Si ya existe SPEC
```

## Proceso de Recomendación

### 1. Recopilar Información

Si existe SPEC.md, leerlo. Si no, preguntar:

```markdown
1. **Tipo de aplicación**:
   - Web app (SPA/SSR)
   - Mobile app
   - API/Backend
   - AI/ML application
   - IoT project
   - CLI tool

2. **Escala esperada**:
   - Prototipo/MVP (< 100 usuarios)
   - Pequeña (100-1K usuarios)
   - Media (1K-10K usuarios)
   - Grande (10K+ usuarios)

3. **Requisitos especiales**:
   - [ ] Tiempo real (websockets)
   - [ ] Autenticación
   - [ ] Pagos
   - [ ] Offline-first
   - [ ] Internacionalización
   - [ ] Alto rendimiento

4. **Restricciones**:
   - Presupuesto mensual máximo
   - Tecnologías obligatorias/prohibidas
   - Timeline
```

### 2. Stacks Predefinidos de Vicente

#### Web Full Stack (MVP Rápido)
```
Frontend:  Next.js 14+ (App Router), TypeScript, Tailwind CSS
Backend:   Next.js API Routes o tRPC
Database:  Supabase (PostgreSQL + Auth + Realtime + Storage)
Hosting:   Vercel (auto-deploy desde GitHub)
Testing:   Jest + Testing Library + Playwright
```

#### AI/ML Application
```
Backend:   Python 3.11+, FastAPI
ML:        PyTorch (preferido) o TensorFlow
Vector DB: Pinecone (managed) o Chroma (self-hosted)
Hosting:   Modal (GPU) o Replicate (modelos pre-entrenados)
Monitor:   Weights & Biases
```

#### IoT Project
```
MCU:       ESP32 con MicroPython
Backend:   Python FastAPI + MQTT (Mosquitto)
Database:  TimescaleDB (time-series)
Dashboard: Grafana
Hosting:   Fly.io o Railway
```

#### Mobile Application
```
Framework:   React Native con Expo
State:       Zustand o Jotai
Backend:     Supabase
Navigation:  Expo Router
Deployment:  EAS Build
```

### 3. Matriz de Decisión

Para cada componente, evaluar:

| Criterio | Peso | Opción A | Opción B | Opción C |
|----------|------|----------|----------|----------|
| Experiencia de Vicente | 30% | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| Time-to-market | 25% | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| Escalabilidad | 20% | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Mantenibilidad | 15% | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| Costo | 10% | ★★★☆☆ | ★★★★★ | ★★★★☆ |

### 4. Casos Especiales

#### Presupuesto Muy Limitado ($0-10/mes)
```
Frontend:  Cloudflare Pages (gratis)
Backend:   Vercel Serverless (gratis)
Database:  Supabase Free o PlanetScale Free
Auth:      Supabase Auth (gratis)
```

#### Máxima Escala
```
Frontend:  Next.js en Vercel Edge
Backend:   Go o Rust en Fly.io
Database:  CockroachDB o PlanetScale
Cache:     Redis (Upstash)
Queue:     BullMQ o Temporal
```

#### Prototipo Ultra-Rápido
```
UI:        v0.dev para generación inicial
Backend:   Supabase completo
Hosting:   Vercel
Testing:   Solo E2E críticos
```

## Output

```markdown
## Recomendación de Stack para [Nombre del Proyecto]

### Stack Recomendado

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | Next.js 14 | SSR, experiencia previa, deploy fácil |
| Backend | tRPC | Type-safety end-to-end, integración Next |
| Database | Supabase | Auth incluido, realtime, tier gratis |
| Hosting | Vercel | Auto-deploy, Edge Functions |
| Testing | Jest + Playwright | Coverage completo |

### Estimación de Costos

| Servicio | Tier | Costo/mes |
|----------|------|-----------|
| Vercel | Pro | $20 |
| Supabase | Free | $0 |
| Total | | **$20/mes** |

### Alternativas Consideradas

| Componente | Alternativa | Por qué no |
|------------|-------------|------------|
| Database | PostgreSQL local | Mayor complejidad ops |
| Frontend | Remix | Menor experiencia |
| Backend | FastAPI | Separación innecesaria para MVP |

### Trade-offs de esta Elección

**Ventajas:**
- Desarrollo rápido
- Type-safety completo
- Fácil de escalar
- Costo inicial bajo

**Desventajas:**
- Vendor lock-in con Vercel
- Limitaciones de Edge Functions
- Learning curve de App Router

### Próximos Pasos

1. Ejecutar `/project:interview [nombre]` para definir SPEC completo
2. Ejecutar `/project:mvp [nombre]` para generar el proyecto
```

## Integración con Otros Comandos

Este comando puede ser invocado automáticamente por:
- `/project:interview` - Al definir arquitectura técnica
- Tech Advisor Skill - Como parte del análisis
