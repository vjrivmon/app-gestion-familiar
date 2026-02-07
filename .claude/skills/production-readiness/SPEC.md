# Production Readiness Principles

> 48 principios organizados en 8 categorías para sistemas production-grade

---

## 1. Resiliencia y Disponibilidad (6 principios)

### 1.1 Principio de Graceful Degradation

**Descripción**: El sistema debe degradarse elegantemente ante fallos parciales,
manteniendo funcionalidad core mientras componentes secundarios fallan.

**Aplicación**:

- Circuit breakers para servicios externos
- Fallbacks para features no críticas
- Modo offline para operaciones básicas

**Anti-patrón**: Sistema que falla completamente si un servicio auxiliar no
responde.

---

### 1.2 Principio de Health Checks

**Descripción**: Cada servicio debe exponer endpoints de salud que permitan
verificar su estado y el de sus dependencias.

**Implementación**:

- `/health` - Estado básico (liveness)
- `/ready` - Listo para recibir tráfico (readiness)
- `/health/deep` - Estado de dependencias

**Métricas**: Latencia P99 < 100ms para health checks.

---

### 1.3 Principio de Redundancia N+1

**Descripción**: Siempre tener al menos una instancia extra de cada componente
crítico para tolerar fallos sin degradación.

**Aplicación**:

- Mínimo 2 réplicas de cada servicio
- Multi-AZ deployment
- Database replicas con failover automático

---

### 1.4 Principio de Timeout Universal

**Descripción**: Toda operación de I/O debe tener un timeout explícito. Nunca
esperar indefinidamente.

**Valores recomendados**:

- HTTP requests: 30s máximo
- Database queries: 10s máximo
- Cache operations: 1s máximo
- Health checks: 5s máximo

---

### 1.5 Principio de Retry con Backoff

**Descripción**: Los reintentos deben usar backoff exponencial con jitter para
evitar thundering herd.

**Fórmula**: `delay = min(cap, base * 2^attempt) + random_jitter`

**Ejemplo**:

```typescript
const delays = [100, 200, 400, 800, 1600]; // ms con cap en 1600
```

---

### 1.6 Principio de Bulkhead

**Descripción**: Aislar componentes para que el fallo de uno no afecte a otros.
Como compartimentos de un barco.

**Implementación**:

- Thread pools separados por servicio
- Rate limits por tenant
- Colas separadas por prioridad

---

## 2. Seguridad (6 principios)

### 2.1 Principio de Defense in Depth

**Descripción**: Múltiples capas de seguridad. Si una falla, las otras protegen.

**Capas**:

1. WAF / Rate limiting (edge)
2. Autenticación (identity)
3. Autorización (access control)
4. Validación de input (application)
5. Encriptación (data)

---

### 2.2 Principio de Least Privilege

**Descripción**: Cada componente debe tener solo los permisos mínimos necesarios
para su función.

**Aplicación**:

- Service accounts con permisos específicos
- Database users con acceso solo a tablas necesarias
- API keys scoped por feature

---

### 2.3 Principio de Secrets Management

**Descripción**: Los secretos nunca en código. Siempre en vault o variables de
entorno inyectadas.

**Herramientas**:

- HashiCorp Vault
- AWS Secrets Manager
- Doppler / 1Password Secrets

**Anti-patrón**: `.env` commiteado, API keys hardcodeadas.

---

### 2.4 Principio de Input Validation

**Descripción**: Validar TODO input en el boundary del sistema. Never trust user
input.

**Capas de validación**:

1. Sintáctica (formato, tipo, longitud)
2. Semántica (valores permitidos, rangos)
3. Business rules (permisos, ownership)

---

### 2.5 Principio de Secure Defaults

**Descripción**: La configuración por defecto debe ser la más segura posible.

**Ejemplos**:

- HTTPS by default
- Cookies: Secure, HttpOnly, SameSite=Strict
- CORS restrictivo
- CSP habilitado

---

### 2.6 Principio de Audit Trail

**Descripción**: Toda acción sensible debe quedar registrada con contexto
suficiente para investigación forense.

**Datos a registrar**:

- Who: User ID, IP, session
- What: Action, resource
- When: Timestamp (UTC)
- Result: Success/failure, changes

---

## 3. Observabilidad (6 principios)

### 3.1 Principio de Los Tres Pilares

**Descripción**: Observabilidad completa requiere Logs + Metrics + Traces
trabajando juntos.

**Correlación**: Usar trace_id común en los tres pilares.

**Stack recomendado**:

- Logs: Datadog / ELK
- Metrics: Prometheus / Datadog
- Traces: Jaeger / Datadog APM

---

### 3.2 Principio de Structured Logging

**Descripción**: Logs en formato estructurado (JSON) para parsing automático.

**Campos obligatorios**:

```json
{
  "timestamp": "ISO8601",
  "level": "info|warn|error",
  "message": "Human readable",
  "trace_id": "uuid",
  "context": {}
}
```

---

### 3.3 Principio de SLI/SLO/SLA

**Descripción**: Definir métricas de servicio antes de lanzar.

- **SLI**: Métricas que mides (latency P99, error rate)
- **SLO**: Objetivos internos (99.9% availability)
- **SLA**: Compromisos con clientes (99.5% con compensación)

---

### 3.4 Principio de Alerting Inteligente

**Descripción**: Alertas basadas en síntomas, no en causas. Evitar alert
fatigue.

**Buenas alertas**:

- Error rate > 1% por 5 minutos
- Latencia P99 > 2s por 10 minutos
- Available instances < 2

**Malas alertas**:

- CPU > 80% (puede ser normal)
- Disco > 70% (muy anticipado)

---

### 3.5 Principio de Runbooks

**Descripción**: Cada alerta debe tener un runbook asociado con pasos de
diagnóstico y mitigación.

**Estructura**:

1. Descripción del problema
2. Impacto esperado
3. Pasos de diagnóstico
4. Acciones de mitigación
5. Escalación

---

### 3.6 Principio de Dashboards por Audiencia

**Descripción**: Diferentes dashboards para diferentes roles.

**Tipos**:

- **Executive**: KPIs de negocio, uptime
- **Engineering**: Latency, errors, saturation
- **On-call**: Alertas activas, recent deploys
- **Debug**: Traces, logs filtrados

---

## 4. Escalabilidad (6 principios)

### 4.1 Principio de Stateless Services

**Descripción**: Los servicios no deben guardar estado en memoria entre
requests. Estado en stores externos.

**Beneficios**:

- Horizontal scaling trivial
- Deploys sin pérdida de datos
- Load balancing simple

---

### 4.2 Principio de Horizontal over Vertical

**Descripción**: Preferir escalar añadiendo instancias (horizontal) sobre
aumentar recursos de una instancia (vertical).

**Límites verticales**: CPU/RAM tienen techo. Horizontal es "infinito".

---

### 4.3 Principio de Caching Strategy

**Descripción**: Cache en múltiples capas con estrategia clara de invalidación.

**Capas**:

1. CDN (estáticos, 1 día)
2. API Gateway (responses, 5 min)
3. Application (computed data, 1 hora)
4. Database (query cache, 5 min)

---

### 4.4 Principio de Async por Defecto

**Descripción**: Operaciones que no necesitan respuesta inmediata deben ser
asíncronas.

**Candidatos**:

- Envío de emails
- Generación de reportes
- Procesamiento de imágenes
- Webhooks a terceros

---

### 4.5 Principio de Database Scaling

**Descripción**: Estrategias de escalado de base de datos.

**Progresión**:

1. Read replicas (read scaling)
2. Connection pooling (connection scaling)
3. Sharding (write scaling)
4. CQRS (separation of concerns)

---

### 4.6 Principio de Rate Limiting

**Descripción**: Proteger el sistema de abuso y garantizar fairness entre
usuarios.

**Tipos**:

- Por IP (DDoS protection)
- Por user (abuse prevention)
- Por endpoint (resource protection)
- Por tenant (fairness)

---

## 5. Deployment (6 principios)

### 5.1 Principio de Immutable Infrastructure

**Descripción**: Nunca modificar infra en producción. Siempre reemplazar con
nueva versión.

**Implementación**:

- Containers inmutables
- AMIs versionadas
- No SSH a producción

---

### 5.2 Principio de Blue-Green Deployment

**Descripción**: Dos environments idénticos. Uno activo, uno standby. Switch
instantáneo.

**Beneficios**:

- Zero downtime
- Rollback instantáneo
- Testing en producción (blue)

---

### 5.3 Principio de Canary Releases

**Descripción**: Desplegar nuevas versiones gradualmente. 1% → 10% → 50% → 100%.

**Criterios de promoción**:

- Error rate igual o menor
- Latencia igual o menor
- No alertas nuevas

---

### 5.4 Principio de Feature Flags

**Descripción**: Separar deploy de release. Código desplegado pero features
controladas por flags.

**Beneficios**:

- Kill switch para features problemáticas
- A/B testing
- Gradual rollout
- Beta testing con usuarios específicos

---

### 5.5 Principio de Rollback Automático

**Descripción**: Si métricas degradan post-deploy, rollback automático sin
intervención humana.

**Triggers**:

- Error rate > threshold
- Latencia > threshold
- Health checks failing

---

### 5.6 Principio de Infrastructure as Code

**Descripción**: Toda infraestructura definida en código versionado.

**Herramientas**:

- Terraform (cloud resources)
- Pulumi (programmatic)
- Kubernetes manifests (containers)
- Ansible (configuration)

---

## 6. Data Management (6 principios)

### 6.1 Principio de Backup 3-2-1

**Descripción**: 3 copias, 2 medios diferentes, 1 offsite.

**Implementación**:

- Primary database
- Replica en otra AZ
- Snapshot diario en otra región

---

### 6.2 Principio de Point-in-Time Recovery

**Descripción**: Capacidad de restaurar a cualquier momento en el tiempo, no
solo a backups específicos.

**Retención recomendada**: 7-30 días de PITR.

---

### 6.3 Principio de Data Encryption

**Descripción**: Datos encriptados at rest y in transit.

**At rest**:

- Database encryption (TDE)
- Disk encryption
- Backup encryption

**In transit**:

- TLS 1.3 everywhere
- mTLS entre servicios

---

### 6.4 Principio de Data Retention

**Descripción**: Políticas claras de cuánto tiempo retener cada tipo de dato.

**Ejemplo**:

- Logs: 90 días
- Analytics: 2 años
- User data: Mientras cuenta activa + 30 días
- Backups: 30 días

---

### 6.5 Principio de Schema Migrations

**Descripción**: Cambios de schema deben ser backwards compatible y ejecutarse
sin downtime.

**Estrategia**:

1. Add new column (nullable)
2. Deploy code that writes to both
3. Backfill old data
4. Deploy code that reads from new
5. Remove old column

---

### 6.6 Principio de Data Validation

**Descripción**: Constraints en base de datos además de validación en
aplicación.

**Tipos**:

- NOT NULL
- UNIQUE
- CHECK constraints
- Foreign keys

---

## 7. Testing (6 principios)

### 7.1 Principio de Testing Pyramid

**Descripción**: Más tests unitarios, menos E2E. Pirámide, no helado.

**Proporciones**:

- Unit: 70%
- Integration: 20%
- E2E: 10%

---

### 7.2 Principio de Staging Parity

**Descripción**: Staging debe ser lo más similar posible a producción.

**Paridad en**:

- Configuración
- Datos (anonimizados)
- Infraestructura
- Scale (puede ser menor pero proporcional)

---

### 7.3 Principio de Chaos Engineering

**Descripción**: Probar resiliencia inyectando fallos controlados.

**Experimentos**:

- Kill random pods
- Add network latency
- Exhaust disk space
- Fail database connection

---

### 7.4 Principio de Load Testing

**Descripción**: Conocer los límites del sistema antes de producción.

**Tipos**:

- Load test: Carga esperada
- Stress test: Carga límite
- Soak test: Carga sostenida
- Spike test: Picos súbitos

---

### 7.5 Principio de Contract Testing

**Descripción**: Validar contratos entre servicios sin necesidad de integration
tests completos.

**Herramientas**:

- Pact
- OpenAPI validation
- GraphQL schema validation

---

### 7.6 Principio de Test in Production

**Descripción**: Ciertos tests solo tienen sentido en producción (con cuidado).

**Técnicas**:

- Synthetic monitoring
- Canary testing
- Shadow traffic
- Feature flags para tests

---

## 8. Operaciones (6 principios)

### 8.1 Principio de On-Call Rotation

**Descripción**: Rotación equitativa de on-call con compensación y límites.

**Best practices**:

- Rotaciones de 1 semana
- Máximo 2 alertas/noche objetivo
- Compensación por fuera de horario
- Handoff documentado

---

### 8.2 Principio de Incident Management

**Descripción**: Proceso claro para gestionar incidentes.

**Roles**:

- Incident Commander
- Technical Lead
- Communications Lead

**Proceso**:

1. Detect
2. Triage
3. Mitigate
4. Resolve
5. Postmortem

---

### 8.3 Principio de Blameless Postmortems

**Descripción**: Postmortems enfocados en sistema, no en personas. Aprender, no
culpar.

**Contenido**:

- Timeline
- Root cause
- Impact
- Action items
- Lessons learned

---

### 8.4 Principio de Documentation as Code

**Descripción**: Documentación versionada junto al código.

**Tipos**:

- README.md en cada servicio
- ADRs para decisiones
- Runbooks para operaciones
- API docs auto-generadas

---

### 8.5 Principio de Change Management

**Descripción**: Cambios en producción deben ser tracked y reversibles.

**Proceso**:

1. PR con descripción
2. Review (code + ops)
3. Deploy a staging
4. Deploy a prod (canary)
5. Monitor
6. Rollback si necesario

---

### 8.6 Principio de Capacity Planning

**Descripción**: Planificar capacidad antes de necesitarla.

**Métricas a tracking**:

- Tráfico (requests/s)
- Recursos (CPU, RAM, disk)
- Costo proyectado
- Límites de servicios externos

---

## Quick Reference

| Categoría      | Principios Clave                               |
| -------------- | ---------------------------------------------- |
| Resiliencia    | Graceful degradation, Health checks, Timeouts  |
| Seguridad      | Defense in depth, Least privilege, Audit trail |
| Observabilidad | 3 pilares, Structured logs, SLI/SLO            |
| Escalabilidad  | Stateless, Horizontal, Caching, Async          |
| Deployment     | Immutable, Blue-green, Feature flags           |
| Data           | 3-2-1 backup, PITR, Encryption                 |
| Testing        | Pyramid, Staging parity, Chaos engineering     |
| Operaciones    | On-call, Postmortems, Change management        |
