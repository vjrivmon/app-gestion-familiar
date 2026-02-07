# Validación de Idea de Producto

Proceso estructurado para validar si una idea merece convertirse en un proyecto.

## Variables

- **IDEA_NAME**: $ARGUMENTS (nombre corto de la idea)
- **CONTEXTO**: Todo el texto adicional proporcionado después del nombre

## Modos de Uso

### Opción A: Solo nombre (entrevista completa)

```
/idea:validate mi-app
```

El sistema hace todas las preguntas desde cero.

### Opción B: Nombre + descripción (entrevista enriquecida)

```
/idea:validate mi-app

Descripción: [Explicación detallada de la idea]
Problema: [Qué problema resuelve]
Usuario: [Para quién es]
Diferenciador: [Qué lo hace único]
```

El sistema usa el contexto proporcionado y hace preguntas de seguimiento para
profundizar en áreas que necesiten más detalle.

### Opción C: Nombre + imagen/notas manuscritas

```
/idea:validate mi-app
[Adjuntar imagen de notas]
```

El sistema interpreta las notas y extrae la información, luego hace preguntas de
clarificación.

## Flujo de Validación

### Fase 0: Análisis de Contexto Inicial

**Si hay contexto proporcionado:**

1. Extraer información de la descripción/imagen
2. Resumir lo entendido al usuario
3. Confirmar: "He entendido que quieres [X]. ¿Es correcto?"
4. Identificar qué información falta para cada fase
5. Hacer preguntas SOLO sobre lo que falta

**Si NO hay contexto:**

1. Proceder con entrevista completa (Fase 1)

### Fase 1: Entendimiento Profundo

Usa AskUserQuestionTool para cada pregunta. NO asumas respuestas.
**IMPORTANTE**: Si ya tienes información del contexto, NO repitas preguntas.
Solo pregunta lo que falta o necesita clarificación.

**Preguntas sobre el Problema:**

1. ¿Cuál es el problema específico que quieres resolver?
2. ¿Cómo sabes que este problema existe? ¿Lo has experimentado personalmente?
3. ¿Qué soluciones usan actualmente las personas para resolver este problema?
4. ¿Qué tan frecuente es este problema? (diario/semanal/mensual/anual)
5. ¿Qué tan doloroso es no tener una solución? (1-10)

**Preguntas sobre el Usuario:**

1. ¿Quién exactamente tendría este problema? Sé muy específico.
2. ¿Dónde encuentras a estas personas? (comunidades, foros, redes)
3. ¿Cuánto pagarían por una solución? ¿O debería ser gratis?
4. ¿Has hablado con algún potencial usuario sobre esta idea?

**Preguntas sobre la Solución:**

1. ¿Cómo imaginas que funcionaría tu solución?
2. ¿Qué hace tu solución diferente/mejor que las existentes?
3. ¿Cuál sería el MVP más pequeño posible que aún sea útil?
4. ¿Qué tecnologías dominas que podrías usar?

### Fase 2: Análisis de Factibilidad

Evaluar internamente:

**Factibilidad Técnica:**

- [ ] ¿Las tecnologías requeridas existen y son accesibles?
- [ ] ¿El desarrollador tiene las skills necesarias o puede aprenderlas rápido?
- [ ] ¿El MVP se puede construir en menos de 4 semanas?
- [ ] ¿Hay APIs/servicios disponibles para las integraciones necesarias?

**Factibilidad de Recursos:**

- [ ] ¿El costo de infraestructura inicial es < $50/mes?
- [ ] ¿Se puede desarrollar con 1-2 personas?
- [ ] ¿Hay herramientas open source que aceleren el desarrollo?

**Factibilidad de Mercado:**

- [ ] ¿El mercado objetivo tiene > 10,000 potenciales usuarios?
- [ ] ¿Es posible llegar a los primeros 100 usuarios sin marketing pagado?
- [ ] ¿Existe un modelo de negocio viable (aunque sea simple)?

### Fase 3: Investigación de Mercado

Buscar en la web:

1. **Competidores directos:**
   - Buscar: "[problema] software" o "[problema] app"
   - Listar los 5 principales competidores
   - Analizar sus fortalezas y debilidades

2. **Competidores indirectos:**
   - ¿Qué soluciones "hacky" usa la gente? (Excel, Notion, etc.)
   - ¿Hay comunidades donde la gente pide esta solución?

3. **Tendencias:**
   - ¿El problema está creciendo o disminuyendo?
   - ¿Hay tecnologías nuevas que habiliten soluciones antes imposibles?

### Fase 4: Identificación de Océano Azul

Analizar:

**Matriz de Diferenciación:** | Factor | Competidor A | Competidor B | Mi
Solución | |--------|--------------|--------------|-------------| | Precio | | |
| | Facilidad de uso | | | | | Feature X | | | | | Feature Y | | | | | Soporte |
| | |

**Preguntas clave:**

- ¿Qué pueden eliminar que los competidores dan por hecho?
- ¿Qué pueden reducir muy por debajo del estándar de la industria?
- ¿Qué pueden elevar muy por encima del estándar?
- ¿Qué pueden crear que la industria nunca ha ofrecido?

### Fase 5: Validación de Impacto

Pregunta final al usuario:

> "Imagina que tu solución existe y funciona perfectamente. Describe cómo
> cambiaría el día a día de tu usuario típico. ¿Qué dejaría de hacer? ¿Qué
> empezaría a hacer? ¿Cómo se sentiría?"

Si la respuesta es vaga o genérica, la idea necesita más trabajo.

### Fase 6: Decisión y Output

**Si PASA validación (≥3 de 4 criterios):**

1. Crear `.claude/specs/<nombre>-SPEC.md` con toda la información recopilada
2. Generar resumen ejecutivo
3. Proponer siguiente paso: `/stories:generate`

**Si NO PASA (score bajo):**

1. Crear `.claude/specs/<nombre>-REJECTED.md`
2. Documentar razones del rechazo
3. Sugerir pivotes o mejoras para reconsiderar

**Criterios de Aprobación:**

- [ ] Problema real y frecuente (no nice-to-have)
- [ ] Usuario claramente definido y alcanzable
- [ ] Diferenciación clara vs competencia
- [ ] Técnicamente factible con recursos disponibles

## Output Final

```markdown
# Validación: [Nombre de la Idea]

## Score: X/4 - [APROBADA/RECHAZADA]

### Resumen

<Descripción de 2-3 oraciones>

### Problema

<Problema identificado>

### Usuario Target

<Descripción específica del usuario>

### Propuesta de Valor

<Qué hace diferente/mejor>

### Competencia

<Principales competidores y vacíos>

### Océano Azul

<Oportunidad identificada>

### Factibilidad

- Técnica: ✅/❌
- Recursos: ✅/❌
- Mercado: ✅/❌

### Próximos Pasos

1. <Acción 1>
2. <Acción 2>
3. <Acción 3>

### Riesgos Principales

- <Riesgo 1>
- <Riesgo 2>
```
