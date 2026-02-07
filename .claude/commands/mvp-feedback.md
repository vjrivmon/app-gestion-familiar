# /mvp:feedback - Entrevista de Feedback (Solo Recopilación)

Realiza únicamente la entrevista de feedback post-MVP y genera FEEDBACK.md, sin
generar historias ni lanzar swarm.

## Uso

```
/mvp:feedback <proyecto>
/mvp:feedback flowlearn
/mvp:feedback mi-app --append
```

## Cuándo Usar

- Cuando quieres recopilar feedback sin ejecutar correcciones todavía
- Para hacer múltiples sesiones de feedback con diferentes testers
- Para documentar issues sin iniciar el flujo completo

## Instrucciones para Claude

Cuando el usuario ejecute `/mvp:feedback <proyecto>`:

### 1. Verificar Prerrequisitos

```bash
# Verificar que existe SPEC o código del proyecto
ls .claude/specs/*<proyecto>* 2>/dev/null || echo "Sin SPEC (continuando...)"

# Verificar si ya existe feedback previo
ls .claude/feedback/FEEDBACK-<proyecto>.md 2>/dev/null
```

### 2. Cargar Skill de Entrevista

Usa el skill `hardening-interviewer` ubicado en:
`.claude/skills/hardening-interviewer/SKILL.md`

### 3. Iniciar Entrevista

```
═══════════════════════════════════════════════════════════════
  MVP FEEDBACK - Recopilación de Issues
  Proyecto: <proyecto>
═══════════════════════════════════════════════════════════════

Esta sesión recopilará feedback sobre el MVP.
NO se generarán historias ni tareas automáticamente.

Para el flujo completo, usa: /mvp:harden <proyecto>
```

### 4. Ejecutar Entrevista Estructurada

Seguir las 6 fases del skill `hardening-interviewer`:

**Fase 1: BUGS (3-5 preguntas)**

Usar AskUserQuestion con opciones estructuradas cuando sea apropiado:

```
¿Cuáles de estos tipos de bugs has encontrado?

[ ] Errores que impiden continuar (crash, pantalla blanca)
[ ] Funcionalidades que no responden
[ ] Datos que no se guardan/cargan correctamente
[ ] Errores visuales o de layout
[ ] Otros (especificar)
```

Para cada bug, profundizar:

- ¿Dónde ocurre exactamente?
- ¿Qué pasos reproducen el error?
- ¿Con qué frecuencia sucede?
- ¿En qué dispositivo/navegador?

**Fase 2: UX (3-5 preguntas)**

```
En cuanto a la experiencia de uso:

[ ] Hay flujos que requieren demasiados pasos
[ ] Algunos elementos no son intuitivos
[ ] Falta feedback visual (loading, confirmaciones)
[ ] La navegación es confusa
[ ] Problemas en móvil
[ ] Otros (especificar)
```

**Fase 3: PERFORMANCE (2-4 preguntas)**

```
Sobre rendimiento:

[ ] Algunas pantallas cargan lento
[ ] Las acciones tardan en responder
[ ] La app se siente pesada
[ ] No he notado problemas de rendimiento
```

**Fase 4: SECURITY (2-3 preguntas)**

```
Sobre seguridad (si probaste):

[ ] Pude acceder a datos que no debería
[ ] Vi información sensible expuesta
[ ] La sesión no expira correctamente
[ ] No probé temas de seguridad
```

**Fase 5: FEATURES (2-4 preguntas)**

```
Sobre funcionalidades:

[ ] Hay features del SPEC que no encontré
[ ] Esperaba funcionalidad que no existe
[ ] Algunas integraciones no funcionan
[ ] Todo lo esperado está presente
```

**Fase 6: PRIORIZACIÓN (2-3 preguntas)**

```
De todo lo mencionado, ¿cuáles son los 3 problemas MÁS críticos
que bloquean el uso real del producto?

Ordénalos de mayor a menor importancia.
```

### 5. Clasificar Issues

Para cada issue recopilado, asignar:

**Severidad:**

- `critical`: Bloquea el uso, pérdida de datos, seguridad grave
- `high`: Funcionalidad core afectada, experiencia muy degradada
- `medium`: Problema molesto pero con workaround
- `low`: Cosmético, edge case, nice-to-have

**Categoría:**

- `BUG`: Error de funcionamiento
- `UX`: Problema de experiencia de usuario
- `PERF`: Problema de rendimiento
- `SEC`: Vulnerabilidad de seguridad
- `FEAT`: Funcionalidad faltante

### 6. Generar FEEDBACK.md

```bash
# Leer template
cat .claude/templates/FEEDBACK-TEMPLATE.md
```

Crear archivo `.claude/feedback/FEEDBACK-<proyecto>.md`:

1. Rellenar frontmatter con conteos
2. Agregar tabla resumen
3. Listar cada issue con su ID único
4. Incluir priorización del usuario
5. Calcular totales por severidad

### 7. Output Final

```
═══════════════════════════════════════════════════════════════
  FEEDBACK RECOPILADO
═══════════════════════════════════════════════════════════════

PROYECTO: <proyecto>
ARCHIVO: .claude/feedback/FEEDBACK-<proyecto>.md

RESUMEN:
  ┌─────────────┬───────┬──────────┬──────┬────────┬─────┐
  │ Categoría   │ Total │ Critical │ High │ Medium │ Low │
  ├─────────────┼───────┼──────────┼──────┼────────┼─────┤
  │ BUGS        │   3   │    1     │  1   │   1    │  0  │
  │ UX          │   2   │    0     │  1   │   1    │  0  │
  │ PERFORMANCE │   1   │    0     │  1   │   0    │  0  │
  │ SECURITY    │   0   │    0     │  0   │   0    │  0  │
  │ FEATURES    │   2   │    0     │  1   │   1    │  0  │
  ├─────────────┼───────┼──────────┼──────┼────────┼─────┤
  │ TOTAL       │   8   │    1     │  4   │   3    │  0  │
  └─────────────┴───────┴──────────┴──────┴────────┴─────┘

PRIORIDAD DEL USUARIO:
  1. [BUG-001] Login falla con mayúsculas (critical)
  2. [PERF-001] Dashboard lento al cargar (high)
  3. [FEAT-001] Falta exportar a PDF (high)

SIGUIENTE PASO:
  Para generar historias y lanzar correcciones:
  /mvp:fix

  Para flujo completo desde cero:
  /mvp:harden <proyecto>

═══════════════════════════════════════════════════════════════
```

## Flags Opcionales

### --append

Agrega al FEEDBACK.md existente (nueva sesión de feedback):

```
/mvp:feedback flowlearn --append
```

Útil para:

- Múltiples testers
- Sesiones de feedback incrementales
- Agregar issues descubiertos después

### --tester <nombre>

Identifica quién hizo el testing:

```
/mvp:feedback flowlearn --tester "Juan Pérez"
```

## Output Esperado

1. Archivo `.claude/feedback/FEEDBACK-<proyecto>.md` creado/actualizado
2. Resumen en consola con conteos por severidad
3. Priorización del usuario destacada
4. Sugerencia de siguiente paso

## Relación con Otros Comandos

```
/mvp:feedback  →  Solo recopila feedback (FEEDBACK.md)
       ↓
/mvp:fix       →  Genera historias/tareas desde FEEDBACK existente
       ↓
/swarm:launch  →  Lanza agentes para ejecutar

─────────────────────────────────────────────────────────────

/mvp:harden    →  Todo lo anterior en un solo flujo
```
