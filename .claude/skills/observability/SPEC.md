# Observability Principles

> 36 principios organizados en 6 categorías para monitoreo efectivo

---

## 1. Logging (6 principios)

### 1.1 Principio de Structured Logging

**Descripción**: Logs en formato estructurado (JSON) para parsing y análisis
automático.

**Formato recomendado**:

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "error",
  "message": "Failed to process payment",
  "service": "payment-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "user_789",
  "error": {
    "type": "StripeError",
    "message": "Card declined",
    "code": "card_declined"
  },
  "context": {
    "amount": 9900,
    "currency": "usd"
  }
}
```

---

### 1.2 Principio de Log Levels

**Descripción**: Usar niveles apropiados para filtrado efectivo.

**Niveles**:

| Level   | Uso                                            |
| ------- | ---------------------------------------------- |
| `debug` | Información detallada para debugging           |
| `info`  | Eventos normales (startup, request completado) |
| `warn`  | Situaciones anómalas pero recuperables         |
| `error` | Errores que requieren atención                 |
| `fatal` | Errores que causan shutdown                    |

**Regla**: Producción en `info`, staging en `debug`.

---

### 1.3 Principio de Correlation ID

**Descripción**: Trace ID único que viaja con cada request a través de todos los
servicios.

**Propagación**:

```typescript
// Middleware que extrae o genera trace_id
app.use((req, res, next) => {
  req.traceId = req.headers["x-trace-id"] || generateTraceId();
  res.setHeader("x-trace-id", req.traceId);
  next();
});

// Logger incluye trace_id automáticamente
logger.info("Processing request", { trace_id: req.traceId });
```

---

### 1.4 Principio de Sensitive Data

**Descripción**: Nunca loguear datos sensibles en plain text.

**Datos a NO loguear**:

- Passwords
- Tokens/API keys
- Números de tarjeta (PCI)
- PII sin anonimizar

**Técnicas**:

- Redacción: `password: "[REDACTED]"`
- Masking: `card: "****1234"`
- Hashing: `email_hash: "sha256..."`

---

### 1.5 Principio de Log Retention

**Descripción**: Definir políticas de retención según tipo de log.

**Recomendaciones**:

| Tipo de log         | Retención  |
| ------------------- | ---------- |
| Application logs    | 30-90 días |
| Security/Audit logs | 1-7 años   |
| Debug logs          | 7 días     |
| Access logs         | 90 días    |

---

### 1.6 Principio de Log Aggregation

**Descripción**: Centralizar logs de todos los servicios en una plataforma.

**Stack recomendado**:

- **Cloud**: Datadog, AWS CloudWatch, GCP Logging
- **Self-hosted**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Open source**: Loki + Grafana

**Requisitos**:

- Búsqueda full-text
- Filtrado por campos
- Alertas basadas en logs
- Dashboards

---

## 2. Metrics (6 principios)

### 2.1 Principio de RED Method

**Descripción**: Para servicios, medir Rate, Errors, Duration.

**Métricas**:

- **Rate**: Requests per second
- **Errors**: Percentage of failed requests
- **Duration**: Latency distribution (p50, p95, p99)

**Implementación Prometheus**:

```
http_requests_total{method="GET", path="/api/users", status="200"}
http_request_duration_seconds{method="GET", path="/api/users"}
```

---

### 2.2 Principio de USE Method

**Descripción**: Para recursos (CPU, memoria, disco), medir Utilization,
Saturation, Errors.

**Métricas**:

- **Utilization**: % de recurso en uso
- **Saturation**: Trabajo en cola esperando
- **Errors**: Errores del recurso

---

### 2.3 Principio de Golden Signals

**Descripción**: Las cuatro señales clave de Google SRE.

**Signals**:

1. **Latency**: Tiempo de respuesta (distinguir success vs error)
2. **Traffic**: Demanda en el sistema
3. **Errors**: Rate de requests fallidos
4. **Saturation**: Qué tan "lleno" está el servicio

---

### 2.4 Principio de Cardinality Control

**Descripción**: Cuidado con labels de alta cardinalidad que explotan métricas.

**MAL**:

```
http_requests_total{user_id="123456"}  // Millones de series
```

**BIEN**:

```
http_requests_total{user_tier="free"}  // Pocas series
```

---

### 2.5 Principio de Histograms vs Summaries

**Descripción**: Usar histograms para latencia, son agregables entre instancias.

**Histogram buckets recomendados**:

```
le="0.005"   // 5ms
le="0.01"    // 10ms
le="0.025"   // 25ms
le="0.05"    // 50ms
le="0.1"     // 100ms
le="0.25"    // 250ms
le="0.5"     // 500ms
le="1"       // 1s
le="2.5"     // 2.5s
le="5"       // 5s
le="10"      // 10s
```

---

### 2.6 Principio de Business Metrics

**Descripción**: Métricas técnicas + métricas de negocio.

**Ejemplos business metrics**:

- Signups per hour
- Orders completed
- Revenue processed
- Active users (DAU/WAU/MAU)
- Feature adoption rate

---

## 3. Tracing (6 principios)

### 3.1 Principio de Distributed Tracing

**Descripción**: Seguir una request a través de múltiples servicios.

**Conceptos**:

- **Trace**: El viaje completo de una request
- **Span**: Una operación dentro del trace
- **Context**: Metadata propagada entre spans

---

### 3.2 Principio de Span Attributes

**Descripción**: Enriquecer spans con atributos útiles para debugging.

**Atributos recomendados**:

```json
{
  "http.method": "POST",
  "http.url": "/api/orders",
  "http.status_code": 201,
  "user.id": "user_123",
  "order.id": "order_456",
  "db.system": "postgresql",
  "db.statement": "SELECT..."
}
```

---

### 3.3 Principio de Sampling

**Descripción**: En alto volumen, samplear traces para reducir costos.

**Estrategias**:

- **Head-based**: Decidir al inicio (random %)
- **Tail-based**: Decidir al final (keep errors, slow)
- **Adaptive**: Ajustar según volumen

**Recomendación**: 100% errors, 10% success en producción.

---

### 3.4 Principio de Service Map

**Descripción**: Visualizar dependencias entre servicios automáticamente.

**Información derivada**:

- Qué servicios llaman a cuáles
- Latencia entre servicios
- Error rates por conexión
- Detección de ciclos

---

### 3.5 Principio de OpenTelemetry

**Descripción**: Usar OpenTelemetry como estándar vendor-neutral.

**Beneficios**:

- Un SDK para logs, metrics, traces
- Exporters para cualquier backend
- Auto-instrumentation disponible
- Futuro de observabilidad

---

### 3.6 Principio de Error Tracking

**Descripción**: Capturar y agrupar errores con contexto completo.

**Herramientas**: Sentry, Bugsnag, Rollbar

**Información a capturar**:

- Stack trace completo
- Request context
- User context
- Environment
- Release version
- Breadcrumbs (eventos previos)

---

## 4. Alerting (6 principios)

### 4.1 Principio de Symptom-Based Alerts

**Descripción**: Alertar por síntomas (lo que afecta usuarios), no causas.

**BIEN** (síntomas):

- Error rate > 1%
- Latency P99 > 2s
- Success rate < 99%

**MAL** (causas):

- CPU > 80%
- Disk > 70%
- Memory > 90%

---

### 4.2 Principio de Alert Severity

**Descripción**: Niveles de severidad con respuesta apropiada.

**Niveles**:

| Severity | Respuesta           | Ejemplo                    |
| -------- | ------------------- | -------------------------- |
| P1       | Despertar on-call   | Servicio down              |
| P2       | Resolver en horas   | Degradación significativa  |
| P3       | Resolver en días    | Warning, no impacto actual |
| P4       | Ticket para backlog | Optimización sugerida      |

---

### 4.3 Principio de Alert Fatigue Prevention

**Descripción**: Demasiadas alertas = ignoradas. Cada alerta debe ser
actionable.

**Reglas**:

- Si alerta y no haces nada → eliminar o ajustar
- Si siempre requiere la misma acción → automatizar
- Máximo 2-3 alertas/día objetivo
- Review mensual de alertas

---

### 4.4 Principio de Runbooks

**Descripción**: Cada alerta tiene un runbook con pasos de diagnóstico y
mitigación.

**Estructura de runbook**:

```markdown
# Alert: High Error Rate

## Descripción

Error rate > 1% en el último minuto.

## Impacto

Usuarios experimentan errores al usar la aplicación.

## Diagnóstico

1. Verificar logs: `grep ERROR /var/log/app.log | tail -100`
2. Verificar dependencias: health check de DB, Redis, APIs
3. Verificar deploys recientes: `git log --oneline -5`

## Mitigación

1. Si deploy reciente: rollback
2. Si dependencia down: activar circuit breaker
3. Si ataque: activar rate limiting extra

## Escalación

Si no se resuelve en 15 min, escalar a @platform-team
```

---

### 4.5 Principio de Alert Routing

**Descripción**: Las alertas llegan a quien puede actuar.

**Routing típico**:

- P1 → PagerDuty → on-call
- P2 → Slack #alerts → team lead
- P3 → Email → team
- P4 → Ticket automático

---

### 4.6 Principio de Alert Testing

**Descripción**: Probar que las alertas funcionan antes de necesitarlas.

**Tests**:

- Chaos engineering triggers alerts
- Game days mensuales
- Verificar que PagerDuty entrega
- Verificar runbooks actualizados

---

## 5. Dashboards (6 principios)

### 5.1 Principio de Dashboard Hierarchy

**Descripción**: Dashboards organizados por audiencia y nivel de detalle.

**Jerarquía**:

```
Executive Dashboard (KPIs)
    └── Team Dashboard (Service health)
        └── Service Dashboard (Detailed metrics)
            └── Debug Dashboard (Granular data)
```

---

### 5.2 Principio de At-a-Glance

**Descripción**: El estado general debe ser visible en 5 segundos.

**Elementos**:

- Traffic light indicators (verde/amarillo/rojo)
- Key numbers prominentes
- Trends (up/down arrows)
- Anomalies destacadas

---

### 5.3 Principio de Time Range Flexibility

**Descripción**: Permitir ver diferentes rangos temporales fácilmente.

**Presets útiles**:

- Last 15 minutes (real-time)
- Last 1 hour
- Last 24 hours
- Last 7 days
- Custom range

---

### 5.4 Principio de Drill-Down

**Descripción**: Desde overview poder navegar a detalle con clicks.

**Ejemplo**:

```
Overview: "Errors spiked at 14:00"
  → Click → Service errors breakdown
    → Click → Specific error type
      → Click → Individual traces
```

---

### 5.5 Principio de Annotations

**Descripción**: Marcar eventos importantes en los gráficos.

**Eventos a anotar**:

- Deploys
- Incidents
- Feature flags changed
- Config changes
- External outages

---

### 5.6 Principio de Dashboard as Code

**Descripción**: Dashboards versionados en código.

**Herramientas**:

- Grafana: JSON + Jsonnet
- Datadog: Terraform provider
- Custom: API + scripts

---

## 6. SLI/SLO/SLA (6 principios)

### 6.1 Principio de SLI Definition

**Descripción**: Service Level Indicators son las métricas que miden el
servicio.

**SLIs comunes**:

| Tipo         | SLI                       |
| ------------ | ------------------------- |
| Availability | % of successful requests  |
| Latency      | % of requests < threshold |
| Throughput   | Requests per second       |
| Quality      | % of correct responses    |

---

### 6.2 Principio de SLO Setting

**Descripción**: Service Level Objectives son los targets internos.

**Consideraciones**:

- Basarse en datos históricos
- Dejar margen sobre SLA
- Revisable trimestralmente
- Balancear reliability vs velocity

**Ejemplo**:

```
SLI: Request success rate
SLO: 99.9% over 30-day rolling window
```

---

### 6.3 Principio de Error Budget

**Descripción**: El SLO define cuánto puedes fallar. Ese es tu error budget.

**Cálculo**:

```
SLO: 99.9%
Error Budget: 0.1%

En 30 días (2,592,000 segundos):
Error Budget = 2,592 segundos = 43 minutos de downtime permitido
```

**Uso**: Si consumes el budget, freezear features y focus en reliability.

---

### 6.4 Principio de SLA Contracts

**Descripción**: Service Level Agreements son compromisos con clientes con
consecuencias.

**Elementos**:

- Métrica y threshold
- Período de medición
- Exclusiones (maintenance windows)
- Compensación si no se cumple

**Ejemplo**:

```
SLA: 99.5% uptime mensual
Compensación: 10% crédito si < 99.5%, 25% si < 99%
```

---

### 6.5 Principio de Multi-Window Alerts

**Descripción**: Alertar cuando burn rate amenaza el SLO.

**Windows**:

- Fast burn (1h): Detecta outages
- Slow burn (6h): Detecta degradación

**Fórmula**: Alert if burn rate would consume X% of monthly budget in Y hours.

---

### 6.6 Principio de SLO Review

**Descripción**: Revisar SLOs regularmente con el equipo.

**Agenda de review**:

1. Cumplimos el SLO este período?
2. Error budget remaining?
3. Incidentes que impactaron?
4. Debemos ajustar el SLO?
5. Actions para próximo período

---

## Quick Reference

| Categoría  | Principios Clave                           |
| ---------- | ------------------------------------------ |
| Logging    | Structured, Correlation ID, Sensitive data |
| Metrics    | RED/USE, Golden Signals, Business metrics  |
| Tracing    | OpenTelemetry, Sampling, Error tracking    |
| Alerting   | Symptom-based, Runbooks, Alert fatigue     |
| Dashboards | Hierarchy, At-a-glance, Drill-down         |
| SLI/SLO    | Error budget, Multi-window, Regular review |
