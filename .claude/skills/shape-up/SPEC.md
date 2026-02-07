# Shape Up Methodology Principles

> 30 principios organizados en 5 categorías basados en el libro de Basecamp

---

## 1. Shaping (6 principios)

### 1.1 Principio de Shaping Level

**Descripción**: El shaping no es ni demasiado abstracto ni demasiado concreto.
Es "shaped" - tiene forma pero deja espacio para decisiones de implementación.

**Niveles**:

- **Demasiado abstracto**: "Mejorar la búsqueda" (no hay dirección)
- **Demasiado concreto**: Wireframes pixel-perfect (no hay libertad)
- **Shaped**: Breadboards y fat marker sketches (dirección + flexibilidad)

---

### 1.2 Principio de Appetite

**Descripción**: El appetite es cuánto tiempo estamos dispuestos a invertir, no
una estimación de cuánto tomará.

**Tamaños estándar**:

- **Small Batch**: 2 semanas o menos
- **Big Batch**: 6 semanas completas

**Regla**: El appetite es un constraint. Si no cabe en el appetite, reducir
scope, no extender tiempo.

---

### 1.3 Principio de Problem Definition

**Descripción**: Define claramente el problema antes de proponer soluciones. Qué
dolor estamos aliviando?

**Template**:

```markdown
## Problema

[Descripción del dolor actual]

## Evidencia

- [Tickets de soporte relacionados]
- [Feedback de usuarios]
- [Métricas que lo demuestran]

## Impacto

[Quién se beneficia y cómo]
```

---

### 1.4 Principio de Boundaries

**Descripción**: Definir qué está OUT of scope es tan importante como definir
qué está IN scope.

**Secciones del pitch**:

```markdown
## In Scope

- Feature A
- Feature B

## Out of Scope (Rabbit Holes)

- Feature C (demasiado complejo para este appetite)
- Integración con X (no necesaria para v1)

## No-gos

- NO construir UI admin (usar Retool)
- NO soporte mobile (desktop first)
```

---

### 1.5 Principio de De-risking

**Descripción**: Identificar y resolver incertidumbres técnicas ANTES de
apostar.

**Técnicas de de-risking**:

1. **Spike técnico**: Prototipar la parte más riesgosa
2. **Consultar experto**: Preguntar a quien conoce el sistema
3. **Buscar precedentes**: Cómo resolvieron otros esto?
4. **Simplificar**: Hay forma de evitar el riesgo?

---

### 1.6 Principio de Breadboarding

**Descripción**: Wireframes de muy bajo nivel que muestran flujo y componentes
sin diseño visual.

**Elementos de breadboard**:

- **Places**: Pantallas o estados (cajas)
- **Affordances**: Elementos interactivos (texto subrayado)
- **Connection lines**: Navegación entre places

**Ejemplo**:

```
[Invoice List]
  - Invoice #123 ($500)  →  [Invoice Detail]
  - Invoice #124 ($200)       - Pay Now Button → [Payment Form]
                               - Download PDF
```

---

## 2. Betting (6 principios)

### 2.1 Principio de Betting Table

**Descripción**: Un grupo pequeño decide qué proyectos shaped se construyen en
el próximo ciclo.

**Participantes típicos**:

- CEO / Product Lead
- CTO / Tech Lead
- Designer senior

**Reglas**:

- Solo se apuesta en trabajo shaped
- Decisiones son finales (no hay backlog)
- No hay compromisos más allá de 6 semanas

---

### 2.2 Principio de Pitches over Backlogs

**Descripción**: No hay backlog infinito. Ideas no apostadas se descartan. Si
son importantes, volverán.

**Flujo**:

```
Idea → Shaping → Pitch → Betting Table
                           ↓
                    [Bet] → Build
                    [No bet] → Discard (puede re-pitch después)
```

---

### 2.3 Principio de Circuit Breaker

**Descripción**: Si un proyecto no se completa en el ciclo, por defecto no
continúa. El equipo vuelve a cero.

**Excepciones**:

- Proyectos muy cerca de completar (1-2 días)
- Decisión explícita de apostar otro ciclo

**Beneficio**: Evita proyectos zombie que nunca terminan.

---

### 2.4 Principio de Betting Criteria

**Descripción**: Criterios para decidir qué apostar.

**Preguntas a responder**:

1. El problema es real y frecuente?
2. El pitch está bien shaped?
3. El appetite es apropiado?
4. Los rabbit holes están identificados?
5. El equipo correcto está disponible?
6. Es el momento correcto?

---

### 2.5 Principio de Team Assignment

**Descripción**: Equipos pequeños y autónomos para cada proyecto.

**Composición**:

- **Small Batch**: 1 designer + 1-2 developers
- **Big Batch**: 1 designer + 2-3 developers

**Reglas**:

- El equipo es dueño del proyecto completo
- Mínima dependencia de otros equipos
- Designer y developers trabajan juntos

---

### 2.6 Principio de Bug Handling

**Descripción**: Los bugs no tienen prioridad automática. Se evalúan igual que
features.

**Enfoques**:

- **Bug Smash**: Dedicar ciclo solo a bugs acumulados
- **Cool-down bugs**: Resolver bugs durante cooldown
- **Shape bugs grandes**: Bugs complejos pasan por shaping

---

## 3. Building (6 principios)

### 3.1 Principio de Getting Oriented

**Descripción**: El equipo empieza explorando el pitch y código existente antes
de escribir código nuevo.

**Primeros días**:

- Leer el pitch completo
- Explorar código relacionado
- Identificar las partes más inciertas
- Dividir en scopes

---

### 3.2 Principio de Scopes

**Descripción**: Dividir el proyecto en partes significativas que se pueden
completar independientemente.

**Características de buen scope**:

- Vertical slice (tiene UI, lógica, data)
- Completable en días, no semanas
- Demostrable ("mira, esto ya funciona")
- Nombre descriptivo

**Ejemplo**:

```
Proyecto: Sistema de Invoices
Scopes:
- "Invoice Creation" (create form + save)
- "Invoice List" (list + filters)
- "PDF Generation" (generate + download)
- "Payment Integration" (Stripe connect)
```

---

### 3.3 Principio de Hill Charts

**Descripción**: Visualizar progreso como subir y bajar una colina.

**Fases**:

```
        /\
       /  \
      /    \
     /      \
    /        \
---/-----------\---
  Uphill   Downhill

Uphill: Figuring things out (uncertainty)
Downhill: Executing (certainty)
```

**Uso**: Cada scope es un punto en la colina. Mover puntos en standups.

---

### 3.4 Principio de Imagined vs Discovered Tasks

**Descripción**: Las tareas reales se descubren trabajando, no se imaginan al
inicio.

**Anti-patrón**: Lista de tareas detallada el día 1

**Mejor práctica**:

- Día 1: Solo scopes de alto nivel
- Durante el ciclo: Tareas emergen del trabajo
- Tareas completadas se eliminan, no se trackean

---

### 3.5 Principio de Must-haves vs Nice-to-haves

**Descripción**: Al final del ciclo, recortar scope si es necesario.

**Técnica QA/QC**:

- **QA (Quality Assurance)**: Lo mínimo que DEBE funcionar
- **QC (Quality Control)**: Extras que serían buenos

**Regla**: Ship con todos los must-haves. Nice-to-haves solo si hay tiempo.

---

### 3.6 Principio de Scope Hammering

**Descripción**: Cuando algo toma más de lo esperado, la respuesta es reducir
scope, no extender tiempo.

**Preguntas para hammering**:

- Podemos resolver esto con una versión más simple?
- Hay un edge case que podemos no manejar ahora?
- Podemos usar una solución existente (gem, library)?
- Esto realmente necesita UI o puede ser admin-only?

---

## 4. Cooldown (6 principios)

### 4.1 Principio de Cooldown Period

**Descripción**: 2 semanas entre ciclos de 6 semanas. Tiempo sin proyectos
asignados.

**Uso**:

- Bugs y mantenimiento
- Exploración personal
- Preparar pitches
- Descanso y recuperación

---

### 4.2 Principio de Programmer Time

**Descripción**: Durante cooldown, programadores eligen en qué trabajar.

**Opciones**:

- Fix bugs que les molestan
- Refactoring pendiente
- Explorar nueva tecnología
- Prototipar ideas propias

---

### 4.3 Principio de Designer Time

**Descripción**: Designers usan cooldown para exploración y preparación.

**Actividades**:

- Explorar problemas para futuros pitches
- Mejorar design system
- Documentar patterns
- User research

---

### 4.4 Principio de Pitch Preparation

**Descripción**: Cooldown es momento ideal para preparar pitches del próximo
ciclo.

**Proceso**:

1. Identificar problema importante
2. Explorar soluciones
3. Consultar con tech lead sobre feasibility
4. Escribir pitch
5. Compartir para feedback

---

### 4.5 Principio de No Commitments

**Descripción**: Durante cooldown no hay entregas comprometidas.

**Beneficios**:

- Reduce estrés
- Permite trabajo profundo
- Flexibilidad para urgencias
- Creatividad sin presión

---

### 4.6 Principio de Cycle Rhythm

**Descripción**: El ritmo de 6+2 semanas crea predictibilidad.

**Calendario típico**:

```
Semana 1-6: Ciclo de desarrollo
Semana 7-8: Cooldown
Semana 8 final: Betting table para próximo ciclo
```

---

## 5. Culture (6 principios)

### 5.1 Principio de Autonomy

**Descripción**: Los equipos tienen autonomía completa dentro del scope
apostado.

**Autonomía significa**:

- Decidir cómo implementar
- Decidir orden de trabajo
- Decidir trade-offs técnicos
- Comunicar progreso, no pedir permiso

---

### 5.2 Principio de Responsibility

**Descripción**: Autonomía viene con responsabilidad de entregar.

**Responsabilidades del equipo**:

- Entregar algo usable en el ciclo
- Escalar problemas temprano
- Comunicar estado honestamente
- Pedir ayuda cuando necesario

---

### 5.3 Principio de Senior Leadership

**Descripción**: Shape Up funciona mejor con seniors que pueden manejar
ambigüedad.

**Expectativas de seniors**:

- Interpretar pitch, no seguir instrucciones
- Tomar decisiones de diseño e implementación
- Identificar y resolver problemas
- Mentorear juniors en el equipo

---

### 5.4 Principio de Fixed Time, Variable Scope

**Descripción**: El tiempo es fijo (6 semanas). El scope es variable.

**Implicaciones**:

- No hay extensiones de tiempo
- El scope se ajusta al tiempo disponible
- Mejor shipping algo que nothing

---

### 5.5 Principio de Betting not Planning

**Descripción**: Apostar es diferente a planificar. Apuestas tienen riesgo y se
pueden perder.

**Diferencias**:

| Planning                  | Betting                 |
| ------------------------- | ----------------------- |
| Compromisos a largo plazo | Solo próximas 6 semanas |
| Backlog infinito          | Sin backlog             |
| Estimaciones              | Appetites (constraints) |
| Scope fijo                | Scope variable          |

---

### 5.6 Principio de Continuous Shaping

**Descripción**: El shaping es continuo, no solo antes de betting.

**Shaping pipeline**:

```
Raw Ideas → Exploration → Shaped Pitches → Ready to Bet
                ↑                ↓
                └── Feedback ────┘
```

**Shapers** trabajan constantemente, no solo en cooldown.

---

## Quick Reference

| Categoría | Principios Clave                                     |
| --------- | ---------------------------------------------------- |
| Shaping   | Appetite, Breadboarding, De-risking                  |
| Betting   | Pitches over backlog, Circuit breaker                |
| Building  | Scopes, Hill charts, Scope hammering                 |
| Cooldown  | 2 weeks, No commitments, Pitch preparation           |
| Culture   | Autonomy + Responsibility, Fixed time variable scope |

---

## Recursos

- [Shape Up Book](https://basecamp.com/shapeup) (gratuito)
- [Basecamp's Approach](https://basecamp.com/features/hill-charts)
