# Checklist: Fase 2 - Billing + Monetización

## Objetivo

Implementar sistema de pagos y subscripciones.

---

## Items

### 1. Integración de Pagos

- [ ] **Stripe/Paddle configurado**
  - Cuenta creada
  - API keys en .env
  - Verificar: `grep -r "stripe\|paddle" src/`

- [ ] **SDK instalado**
  - `npm install stripe` o `@paddle/paddle-js`
  - Server-side y client-side

- [ ] **Productos/Precios** creados en dashboard
  - Plan Free (si aplica)
  - Plan Pro
  - Plan Enterprise (si aplica)

### 2. Webhooks

- [ ] **Endpoint de webhooks** implementado
  - Ruta: /api/webhooks/stripe
  - Verificar: `ls src/app/api/webhooks/`

- [ ] **Verificación de firma**
  - Stripe webhook secret configurado
  - Validación de eventos

- [ ] **Eventos manejados**:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed

### 3. Modelo de Subscripción

- [ ] **Tabla/modelo de subscripción** en DB
  - user_id
  - stripe_customer_id
  - stripe_subscription_id
  - status
  - current_period_end

- [ ] **Sincronización** con Stripe
  - Crear customer al registrar usuario
  - Actualizar status via webhooks

### 4. UI de Billing

- [ ] **Página de pricing** (/pricing)
  - Mostrar planes
  - Destacar plan recomendado

- [ ] **Checkout flow**
  - Botón de upgrade
  - Redirect a Stripe Checkout

- [ ] **Portal del cliente**
  - Link a Stripe Customer Portal
  - Ver/cambiar plan
  - Ver facturas
  - Cancelar subscripción

### 5. Acceso por Plan

- [ ] **Middleware de plan**
  - Verificar plan del usuario
  - Restringir features por plan

- [ ] **Feature flags** por plan
  - Qué puede hacer Free
  - Qué puede hacer Pro

---

## Comandos de Verificación

```bash
# Stripe SDK
npm list stripe

# Webhooks
ls src/app/api/webhooks/

# Variables de entorno
grep "STRIPE" .env.example
```

---

## Código de Ejemplo

### Stripe Checkout

```typescript
// src/app/api/checkout/route.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  switch (event.type) {
    case "checkout.session.completed":
      // Handle successful checkout
      break;
    case "customer.subscription.deleted":
      // Handle cancellation
      break;
  }

  return Response.json({ received: true });
}
```

---

## Variables de Entorno

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
```

---

## Recursos

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/checkout/quickstart)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## Siguiente Fase

Una vez completado:

```
/scale:iteration monitoring
```
