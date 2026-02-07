# Billing & SaaS Principles

> 36 principios organizados en 6 categorías para monetización SaaS

---

## 1. Modelos de Pricing (6 principios)

### 1.1 Principio de Pricing Simple

**Descripción**: El pricing debe ser fácil de entender. Si necesitas una
calculadora, es demasiado complejo.

**Reglas**:

- Máximo 3-4 tiers visibles
- Diferencias claras entre tiers
- Un tier "recomendado" destacado
- Precio mensual Y anual (descuento 15-20%)

**Anti-patrón**: Pricing con 10+ variables y addons confusos.

---

### 1.2 Principio de Value Metric

**Descripción**: Cobrar por la métrica que mejor refleja el valor que recibe el
cliente.

**Ejemplos de value metrics**:

| Tipo de SaaS       | Value Metric                  |
| ------------------ | ----------------------------- |
| Email marketing    | Subscribers                   |
| Storage            | GB stored                     |
| API                | Requests                      |
| Team collaboration | Active users                  |
| E-commerce         | GMV (Gross Merchandise Value) |

---

### 1.3 Principio de Freemium Strategic

**Descripción**: El tier gratuito debe ser útil pero crear fricción natural
hacia upgrade.

**Límites efectivos**:

- Límite de uso (X requests/mes)
- Límite de features (sin integraciones)
- Límite de colaboración (1 usuario)
- Límite de retención (datos 30 días)

**Anti-patrón**: Free tier tan bueno que nadie upgradea.

---

### 1.4 Principio de Grandfathering

**Descripción**: Los clientes existentes mantienen su precio cuando subes
precios (con límite de tiempo).

**Implementación**:

- Mantener precio por 12-24 meses
- Notificar con 3+ meses de anticipación
- Ofrecer lock-in anual al precio viejo
- Nuevos features solo en nuevo pricing

---

### 1.5 Principio de Usage-Based Billing

**Descripción**: Cobrar por uso real para ciertos componentes.

**Componentes típicos usage-based**:

- API calls sobre límite
- Storage adicional
- Bandwidth
- Compute time
- Emails enviados

**Implementación**: Prepaid credits o postpaid con caps.

---

### 1.6 Principio de Enterprise Pricing

**Descripción**: Enterprise tier con pricing personalizado y features
específicos.

**Features enterprise**:

- SSO/SAML
- Dedicated support
- Custom contracts
- SLA garantizado
- On-premise option
- Audit logs avanzados

---

## 2. Stripe Integration (6 principios)

### 2.1 Principio de Customer First

**Descripción**: Crear Stripe Customer antes de cualquier operación de pago.

**Flujo**:

```typescript
// Al crear usuario en tu app
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { userId: user.id },
});

// Guardar customer.id en tu DB
await db.users.update(user.id, { stripeCustomerId: customer.id });
```

---

### 2.2 Principio de Checkout Session

**Descripción**: Usar Stripe Checkout para pagos, no crear forms propios.

**Beneficios**:

- PCI compliance automático
- Optimizado para conversión
- Soporte para múltiples métodos de pago
- 3D Secure automático

**Flujo**:

```typescript
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/cancel`,
});
```

---

### 2.3 Principio de Webhook Reliability

**Descripción**: Los webhooks son la fuente de verdad para estado de pagos.

**Implementación robusta**:

1. Verificar firma del webhook
2. Idempotencia (guardar event.id procesados)
3. Retry logic (Stripe reintenta hasta 3 días)
4. Logging detallado
5. Alertas si webhook fails

**Eventos críticos**:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

### 2.4 Principio de Subscription Lifecycle

**Descripción**: Manejar todo el ciclo de vida de suscripción.

**Estados**:

```
trialing → active → past_due → canceled/unpaid

Transitions:
- Trial ends → active (si pago ok) o canceled
- Payment fails → past_due
- past_due + 3 retries → unpaid/canceled
- User cancels → active (until period end) → canceled
```

---

### 2.5 Principio de Prorating

**Descripción**: Al cambiar de plan, prorratear correctamente.

**Configuración Stripe**:

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: newPriceId }],
  proration_behavior: "create_prorations", // o 'none', 'always_invoice'
});
```

---

### 2.6 Principio de Customer Portal

**Descripción**: Usar Stripe Customer Portal para self-service billing.

**Funcionalidades**:

- Ver/descargar facturas
- Actualizar método de pago
- Cambiar plan
- Cancelar suscripción
- Ver historial

**Implementación**:

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${baseUrl}/settings`,
});
```

---

## 3. Subscription Management (6 principios)

### 3.1 Principio de Trial Period

**Descripción**: Trials deben ser suficientemente largos para mostrar valor.

**Recomendaciones**:

| Tipo de producto | Trial recomendado |
| ---------------- | ----------------- |
| Simple tool      | 7 días            |
| Complex SaaS     | 14 días           |
| Enterprise       | 30 días           |

**Tácticas**:

- No pedir tarjeta para trial (más signups)
- Pedir tarjeta para trial (más qualified leads)
- Extender trial si engagement alto

---

### 3.2 Principio de Graceful Downgrade

**Descripción**: Al bajar de plan o cancelar, no perder datos del usuario.

**Implementación**:

- Mantener datos por 30-90 días post-cancel
- Limitar features pero no borrar
- Permitir re-activar fácilmente
- Export de datos siempre disponible

---

### 3.3 Principio de Dunning Management

**Descripción**: Proceso automático para recuperar pagos fallidos.

**Secuencia típica**:

1. Día 0: Pago falla → email "actualiza tu tarjeta"
2. Día 3: Retry automático
3. Día 5: Email "tu cuenta está en riesgo"
4. Día 7: Retry automático
5. Día 10: Email "última oportunidad"
6. Día 14: Cancelar o downgrade a free

---

### 3.4 Principio de Pause vs Cancel

**Descripción**: Ofrecer pausar suscripción como alternativa a cancelar.

**Beneficios**:

- Retiene al cliente
- Menor fricción para volver
- Datos se mantienen
- Relación no se rompe

---

### 3.5 Principio de Cancellation Flow

**Descripción**: El flujo de cancelación debe intentar retener sin ser molesto.

**Flujo recomendado**:

1. Preguntar razón de cancelación (dropdown)
2. Ofrecer alternativa según razón:
   - "Muy caro" → descuento o downgrade
   - "No lo uso" → demo de features
   - "Falta feature X" → roadmap
3. Confirmar cancelación
4. Encuesta de salida (opcional)
5. Email con oferta de win-back

---

### 3.6 Principio de Usage Alerts

**Descripción**: Alertar usuarios cuando se acercan a límites.

**Thresholds**:

- 50%: Notificación informativa
- 80%: Warning, sugerir upgrade
- 100%: Hard limit o soft limit con overage

---

## 4. Invoicing (6 principios)

### 4.1 Principio de Invoice Compliant

**Descripción**: Las facturas deben cumplir requisitos legales locales.

**Campos obligatorios**:

- Número secuencial único
- Fecha de emisión
- Datos del emisor (nombre, dirección, NIF)
- Datos del receptor
- Descripción del servicio
- Base imponible, IVA, total

---

### 4.2 Principio de Tax Handling

**Descripción**: Gestionar impuestos según ubicación del cliente.

**Stripe Tax**:

```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  automatic_tax: { enabled: true },
  customer_update: {
    address: "auto",
    name: "auto",
  },
});
```

**Consideraciones**:

- EU: VAT según país del cliente
- US: Sales tax según estado
- B2B: Reverse charge si VAT ID válido

---

### 4.3 Principio de Invoice Customization

**Descripción**: Las facturas deben reflejar tu marca.

**Customización**:

- Logo de empresa
- Colores de marca
- Footer personalizado
- Términos de servicio
- Notas adicionales

---

### 4.4 Principio de Credit Notes

**Descripción**: Emitir notas de crédito para reembolsos parciales.

**Casos de uso**:

- Downgrade a mitad de ciclo
- Compensación por downtime
- Descuento retroactivo
- Error de facturación

---

### 4.5 Principio de Invoice Delivery

**Descripción**: Entregar facturas de forma automática y accesible.

**Canales**:

- Email automático al generar
- Descarga desde dashboard
- API para integración con contabilidad
- Customer Portal de Stripe

---

### 4.6 Principio de Payment Terms

**Descripción**: Para enterprise, soportar net-30/60/90.

**Implementación**:

```typescript
const invoice = await stripe.invoices.create({
  customer: customerId,
  collection_method: "send_invoice",
  days_until_due: 30,
});
```

---

## 5. Metrics & Analytics (6 principios)

### 5.1 Principio de MRR Tracking

**Descripción**: Monthly Recurring Revenue es la métrica principal de SaaS.

**Componentes de MRR**:

- New MRR: nuevos clientes
- Expansion MRR: upgrades
- Contraction MRR: downgrades
- Churned MRR: cancelaciones
- Net New MRR: sum of all above

---

### 5.2 Principio de Churn Analysis

**Descripción**: Medir y analizar churn para reducirlo.

**Métricas**:

- Customer Churn Rate: clientes perdidos / total
- Revenue Churn Rate: MRR perdido / total MRR
- Net Revenue Retention: incluye expansión

**Target**: Net Revenue Retention > 100%

---

### 5.3 Principio de LTV:CAC

**Descripción**: Lifetime Value debe ser al menos 3x Customer Acquisition Cost.

**Fórmula LTV**:

```
LTV = ARPU × Gross Margin × (1 / Churn Rate)

Ejemplo:
LTV = $50/mes × 80% × (1 / 5%) = $800
```

---

### 5.4 Principio de Cohort Analysis

**Descripción**: Analizar retención por cohorte de signup.

**Visualización**:

```
        M0    M1    M2    M3    M4
Jan     100%  85%   75%   70%   68%
Feb     100%  82%   72%   67%
Mar     100%  88%   80%
Apr     100%  90%
May     100%
```

---

### 5.5 Principio de Revenue Recognition

**Descripción**: Reconocer revenue según normativa contable (ASC 606).

**Regla básica**: Reconocer revenue cuando se entrega el servicio, no cuando se
cobra.

**Ejemplo suscripción anual**:

- Cobras $1200 en enero
- Reconoces $100/mes durante 12 meses

---

### 5.6 Principio de Billing Dashboard

**Descripción**: Dashboard con métricas clave de billing.

**Métricas a mostrar**:

- MRR actual y trend
- Nuevos clientes hoy/semana/mes
- Churn este mes
- Failed payments pendientes
- Próximas renovaciones
- Revenue por plan

---

## 6. Security & Compliance (6 principios)

### 6.1 Principio de PCI Compliance

**Descripción**: Nunca manejar datos de tarjeta directamente.

**Cómo cumplir**:

- Usar Stripe Elements o Checkout
- Nunca loguear números de tarjeta
- Tokenización en el cliente
- Certificar PCI-DSS si manejas datos

---

### 6.2 Principio de Audit Trail

**Descripción**: Registrar todas las operaciones de billing.

**Eventos a registrar**:

- Cambios de plan
- Pagos exitosos/fallidos
- Cambios de método de pago
- Cancelaciones
- Reembolsos
- Cambios de precio

---

### 6.3 Principio de Dispute Handling

**Descripción**: Proceso para manejar chargebacks.

**Respuesta a disputes**:

1. Notificación inmediata (webhook)
2. Recopilar evidencia:
   - Logs de uso
   - Emails de comunicación
   - ToS aceptados
   - IP de signup
3. Responder en Stripe dentro de deadline
4. Aprender para prevenir futuros

---

### 6.4 Principio de Refund Policy

**Descripción**: Política de reembolsos clara y publicada.

**Política típica SaaS**:

- 30 días money-back para anuales
- Prorrateo para cancelaciones anticipadas
- No reembolso para mensual consumido
- Excepciones caso por caso

---

### 6.5 Principio de Terms of Service

**Descripción**: ToS debe cubrir aspectos de billing.

**Secciones necesarias**:

- Descripción del servicio
- Precios y cambios de precio
- Ciclo de facturación
- Cancelación y reembolsos
- Suspensión por impago
- Disputas

---

### 6.6 Principio de Data Retention

**Descripción**: Retener datos de billing según requisitos legales.

**Retención típica**:

- Facturas: 7-10 años (requisito fiscal)
- Logs de transacciones: 7 años
- Datos de tarjeta: nunca (Stripe los tiene)
- Datos de cliente: mientras activo + 1 año

---

## Quick Reference

| Categoría     | Principios Clave                         |
| ------------- | ---------------------------------------- |
| Pricing       | Simple, Value metric, Freemium strategic |
| Stripe        | Customer first, Webhooks, Portal         |
| Subscriptions | Trial, Dunning, Graceful downgrade       |
| Invoicing     | Compliant, Tax handling, Credit notes    |
| Metrics       | MRR, Churn, LTV:CAC, Cohorts             |
| Compliance    | PCI, Audit trail, Dispute handling       |
