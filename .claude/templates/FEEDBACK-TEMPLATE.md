---
project: <nombre-proyecto>
spec_file: .claude/specs/SPEC-<proyecto>.md
interview_date: YYYY-MM-DD
total_issues: 0
critical: 0
high: 0
medium: 0
low: 0
---

# MVP Feedback: <proyecto>

## Resumen Ejecutivo

| Categoría   | Total | Critical | High | Medium | Low |
| ----------- | ----- | -------- | ---- | ------ | --- |
| BUGS        | 0     | 0        | 0    | 0      | 0   |
| UX          | 0     | 0        | 0    | 0      | 0   |
| PERFORMANCE | 0     | 0        | 0    | 0      | 0   |
| SECURITY    | 0     | 0        | 0    | 0      | 0   |
| FEATURES    | 0     | 0        | 0    | 0      | 0   |
| **TOTAL**   | 0     | 0        | 0    | 0      | 0   |

## Contexto del MVP

- **SPEC Original**: [link al spec]
- **Fecha de Test**: YYYY-MM-DD
- **Tester**: <quién probó>
- **Entorno**: <browser/device/OS>

---

## Categoría: BUGS

### [BUG-001] <Título descriptivo>

- **Severidad**: critical | high | medium | low
- **Componente**: <ruta/componente afectado>
- **Descripción**: <qué ocurre>
- **Esperado**: <qué debería ocurrir>
- **Frecuencia**: Siempre | A veces | Aleatorio
- **Entorno**: <browser/device si relevante>

**Pasos para reproducir**:

1. <paso 1>
2. <paso 2>
3. <paso 3>

**Evidencia**: <screenshot/video si disponible>

---

### [BUG-002] <Título>

- **Severidad**:
- **Componente**:
- **Descripción**:
- **Esperado**:
- **Frecuencia**:
- **Entorno**:

**Pasos para reproducir**:

1.

---

## Categoría: UX

### [UX-001] <Título descriptivo>

- **Severidad**: high | medium | low
- **Pantalla**: <dónde ocurre>
- **Problema**: <descripción del problema de UX>
- **Impacto**: Bloqueante | Confuso | Molesto
- **Solución propuesta**: <sugerencia de mejora>

**Contexto**: <qué estaba intentando hacer el usuario>

---

### [UX-002] <Título>

- **Severidad**:
- **Pantalla**:
- **Problema**:
- **Impacto**:
- **Solución propuesta**:

---

## Categoría: PERFORMANCE

### [PERF-001] <Título descriptivo>

- **Severidad**: high | medium | low
- **Dónde**: <pantalla/acción lenta>
- **Tiempo actual**: <X segundos estimados>
- **Tiempo aceptable**: <Y segundos objetivo>
- **Condiciones**: <cuándo ocurre: siempre, con muchos datos, etc.>

**Notas técnicas**: <posibles causas si se identifican>

---

### [PERF-002] <Título>

- **Severidad**:
- **Dónde**:
- **Tiempo actual**:
- **Tiempo aceptable**:
- **Condiciones**:

---

## Categoría: SECURITY

### [SEC-001] <Título descriptivo>

- **Severidad**: critical | high | medium
- **Tipo**: XSS | CSRF | Auth Bypass | Data Leak | Injection | Other
- **Descripción**: <qué vulnerabilidad se encontró>
- **Impacto potencial**: <qué podría pasar si se explota>
- **Cómo se descubrió**: <pasos para reproducir>

**Recomendación**: <cómo arreglarlo>

---

### [SEC-002] <Título>

- **Severidad**:
- **Tipo**:
- **Descripción**:
- **Impacto potencial**:
- **Cómo se descubrió**:

---

## Categoría: FEATURES

### [FEAT-001] <Título descriptivo>

- **Prioridad**: critical | high | medium | low
- **Descripción**: <qué funcionalidad falta>
- **Valor de negocio**: <por qué es importante>
- **Prometido en SPEC**: Sí | No (descubierto durante uso)
- **Workaround actual**: <si existe alguno>

**Criterios de aceptación**:

1. <criterio 1>
2. <criterio 2>

---

### [FEAT-002] <Título>

- **Prioridad**:
- **Descripción**:
- **Valor de negocio**:
- **Prometido en SPEC**:
- **Workaround actual**:

---

## Priorización del Usuario

### TOP 3 - Must Fix (Bloqueantes para producción)

1. **[ID]** - <título> - Razón: <por qué es crítico>
2. **[ID]** - <título> - Razón: <por qué es crítico>
3. **[ID]** - <título> - Razón: <por qué es crítico>

### Should Fix (Importantes para experiencia)

- **[ID]** - <título>
- **[ID]** - <título>
- **[ID]** - <título>

### Nice to Have (Pueden esperar)

- **[ID]** - <título>
- **[ID]** - <título>

---

## Notas Adicionales

<Cualquier observación general del tester que no encaje en las categorías
anteriores>

---

## Siguiente Paso

Para generar historias y tareas desde este feedback:

```
/mvp:fix
```

O para regenerar con nueva entrevista:

```
/mvp:feedback <proyecto>
```
