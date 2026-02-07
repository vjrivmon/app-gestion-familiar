# /shapeup:pitch - Definir Pitch de Feature

Define un pitch siguiendo la metodología Shape Up antes de desarrollar.

## Uso

```
/shapeup:pitch <idea>
/shapeup:pitch "Sistema de autenticación con SSO"
```

## Instrucciones para Claude

Cuando el usuario ejecute `/shapeup:pitch <idea>`:

### 1. Entender el Concepto de Pitch

Un pitch en Shape Up es:

- Un documento que define QUÉ construir y POR QUÉ
- Incluye constraints y scope definido
- NO es una especificación detallada
- Tiene un "apetito" (tiempo máximo a invertir)

### 2. Guiar Entrevista de Pitch

Haz estas preguntas al usuario:

```
═══════════════════════════════════════════════════════════════
  SHAPE UP PITCH: <idea>
═══════════════════════════════════════════════════════════════

Vamos a definir el pitch para esta feature.

1. PROBLEMA
   ¿Qué problema resuelve esta feature?
   ¿Quién tiene este problema?
   ¿Cómo lo resuelven actualmente?

2. APETITO (tiempo máximo)
   ¿Cuánto tiempo máximo invertirías?
   - [ ] Small batch: 1-2 semanas
   - [ ] Big batch: 6 semanas
   - [ ] Otro: ___

3. SOLUCIÓN (en términos amplios)
   ¿Cuál es la solución propuesta?
   (No detalles técnicos, solo concepto)

4. RABBIT HOLES (riesgos a evitar)
   ¿Qué complicaciones debemos evitar?
   ¿Qué está fuera de scope?

5. NO-GOs (lo que NO haremos)
   ¿Qué features relacionadas NO incluiremos?
```

### 3. Generar Documento de Pitch

Crea `.claude/pitches/PITCH-<id>-<nombre>.md`:

```markdown
---
id: PITCH-001
title: <Título descriptivo>
status: draft|shaped|betting|approved|rejected
appetite: small|big
created_at: <timestamp>
author: <usuario>
---

# Pitch: <Título>

## Problema

### ¿Qué problema resuelve?

<Descripción del problema>

### ¿Quién lo tiene?

<Tipo de usuario afectado>

### ¿Cómo lo resuelven actualmente?

<Workaround actual si existe>

### Evidencia

- <Datos, feedback, métricas que validan el problema>

## Apetito

**Tiempo máximo: [X semanas]**

Este es el tiempo máximo que estamos dispuestos a invertir. Si no se puede hacer
en este tiempo, hay que reducir scope.

## Solución

### Concepto

<Descripción de alto nivel de la solución>

### Fat Marker Sketch
```

┌─────────────────────────────────────┐ │ [Sketch visual de la solución] │ │ │ │
┌─────┐ ┌─────┐ ┌─────┐ │ │ │ A │ -> │ B │ -> │ C │ │ │ └─────┘ └─────┘ └─────┘
│ │ │ └─────────────────────────────────────┘

```

### Elementos Clave
1. <Elemento 1>: <Descripción>
2. <Elemento 2>: <Descripción>
3. <Elemento 3>: <Descripción>

## Rabbit Holes

### ⚠️ Evitar
- <Complicación 1 a evitar>
- <Complicación 2 a evitar>

### 🚫 Fuera de Scope
- <Feature relacionada que NO incluimos>
- <Caso edge que NO cubrimos>

## No-Gos

Lo que explícitamente NO haremos:
- <No-go 1>
- <No-go 2>

## Riesgos y Mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| <Riesgo 1> | Alta/Media/Baja | <Cómo mitigar> |
| <Riesgo 2> | Alta/Media/Baja | <Cómo mitigar> |

## Betting Table

### Para discutir en betting:
- ¿El problema es real y urgente?
- ¿La solución es factible en el apetito?
- ¿Hay dependencias bloqueantes?
- ¿Qué equipo/recursos necesita?

### Decisión
- [ ] GO - Aprobar para próximo ciclo
- [ ] NO-GO - Rechazar o diferir
- [ ] RESHAPE - Necesita más trabajo

---

*Pitch creado: <fecha>*
*Estado: draft*
```

### 4. Crear Breadboard (opcional)

Si el usuario quiere, genera un breadboard:

```
BREADBOARD: Auth con SSO

[Landing Page]
    |
    v
[Login Button] --> [Auth Provider Selection]
                        |
            +-----------+-----------+
            |           |           |
            v           v           v
        [Google]    [GitHub]    [Email]
            |           |           |
            v           v           v
        [OAuth Flow] [OAuth Flow] [Magic Link]
            |           |           |
            +-----------+-----------+
                        |
                        v
                [Callback Handler]
                        |
                        v
                [Create/Update User]
                        |
                        v
                [Set Session Cookie]
                        |
                        v
                [Redirect to Dashboard]
```

### 5. Output al Usuario

```
═══════════════════════════════════════════════════════════════
  PITCH CREADO
═══════════════════════════════════════════════════════════════

ID: PITCH-001
Título: Sistema de autenticación con SSO
Apetito: 6 semanas (big batch)
Estado: draft

ARCHIVO: .claude/pitches/PITCH-001-auth-sso.md

PRÓXIMOS PASOS:
1. Revisar y refinar el pitch
2. Presentar en betting session:
   /shapeup:betting

3. Si se aprueba, iniciar ciclo:
   /shapeup:cycle 6

TIPS:
- Un buen pitch tiene scope fijo y tiempo fijo
- Si algo no cabe en el apetito, reduce scope
- Los rabbit holes son tan importantes como la solución

═══════════════════════════════════════════════════════════════
```

### 6. Guardar en Índice

Actualiza `.claude/pitches/PITCHES-INDEX.md`:

```markdown
# Índice de Pitches

## En Draft

- [PITCH-001](./PITCH-001-auth-sso.md) - Auth con SSO (6 sem)

## Shaped (listos para betting)

- (ninguno)

## Aprobados

- (ninguno)

## Rechazados

- (ninguno)
```

## Output Esperado

1. Pitch completo en `.claude/pitches/PITCH-XXX.md`
2. Índice actualizado
3. Breadboard visual (opcional)
4. Próximos pasos claros
