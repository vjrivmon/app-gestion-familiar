# PRD Workflow Skill

## Descripción
Flujo especializado para crear Product Requirement Documents (PRDs) completos y generar issues detalladas de GitHub con formato PRD-style. Activa con la palabra clave **PRD**.

## Activación
- Usuario menciona "PRD" en el mensaje
- Comando `/prd` o `/prd:create`
- Detección de necesidad de documentación de requisitos

## Flujo Principal

### Fase 1: Entrevista de Clarificación
**Agente:** `prd-interviewer`

Preguntas clave (8-12):
1. ¿Cuál es el problema que resuelve esta feature?
2. ¿Quiénes son los usuarios afectados?
3. ¿Cuál es el comportamiento actual vs esperado?
4. ¿Hay restricciones técnicas conocidas?
5. ¿Cuál es la prioridad y deadline?
6. ¿Existen dependencias con otras features?
7. ¿Hay requisitos de seguridad o compliance?
8. ¿Cómo mediremos el éxito?

### Fase 2: Análisis y Diseño
**Agente:** `prd-analyst`

Genera:
- Análisis de impacto técnico
- Identificación de edge cases
- Propuesta de arquitectura (si aplica)
- Estimación de esfuerzo

### Fase 3: Generación del PRD
**Agente:** `prd-writer`

Secciones del PRD:
```markdown
## 🎯 Resumen Ejecutivo
[Descripción del problema y solución]

## 📋 Contexto del Problema
[Background, usuarios afectados, impacto]

## 🔧 Análisis Técnico
[Componentes afectados, dependencias, riesgos]

## ⚠️ Edge Cases y Escenarios
[Lista de casos límite a considerar]

## ✅ Criterios de Aceptación
[Checklist verificable]

## 🧪 Plan de Testing
[Estrategia de pruebas]

## 📊 Métricas de Éxito
[KPIs y cómo medirlos]

## 🚀 Plan de Implementación
[Fases, tareas, estimaciones]

## 📚 Referencias
[Docs, links, contexto adicional]
```

### Fase 4: Creación de Issue en GitHub
**Agente:** `prd-issue-creator`

Usa la API de GitHub para crear la issue con:
- Labels automáticos según tipo
- Milestone si aplica
- Assignees sugeridos
- Formato PRD completo en el body

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/prd` | Inicia flujo completo de PRD |
| `/prd:interview` | Solo fase de entrevista |
| `/prd:analyze` | Analiza requisitos existentes |
| `/prd:issue` | Crea issue desde PRD existente |
| `/prd:template` | Genera template vacío |

## Integración con Ralph Loop

Después de crear el PRD, opcionalmente ejecuta el **Ralph Loop** para:
1. Dividir en micro-tareas
2. Implementar iterativamente
3. Validar cada paso

Ver: `references/ralph-loop-integration.md`

## Archivos de Referencia
- `references/prd-template.md` - Template completo
- `references/interview-questions.md` - Banco de preguntas
- `references/issue-format.md` - Formato de issues
- `references/ralph-loop-integration.md` - Integración con Ralph Loop
- `agents/` - Definición de agentes especializados
- `templates/` - Templates reutilizables

## Ejemplo de Uso

```
Usuario: PRD para implementar sistema de notificaciones push

VisiClaw: 
1. [Entrevista] Haré 8 preguntas para entender los requisitos...
2. [Análisis] Identifico estos componentes afectados...
3. [PRD] Genero el documento completo...
4. [Issue] ¿Creo la issue en GitHub? Repo: ___
```

## Notas
- El flujo es conversacional (chat-based)
- Todas las decisiones de producto se consultan
- Implementación es autónoma tras aprobación del PRD
- Compatible con gurusup-workflow para implementación
