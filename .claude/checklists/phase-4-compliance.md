# Checklist: Fase 4 - Compliance

## Objetivo

Cumplir requisitos legales y de privacidad para operar como SaaS.

---

## Items

### 1. Privacy Policy

- [ ] **Página /privacy** creada
  - Verificar: `ls src/app/privacy/`

- [ ] **Contenido incluye**:
  - [ ] Qué datos se recolectan
  - [ ] Cómo se usan los datos
  - [ ] Con quién se comparten
  - [ ] Derechos del usuario
  - [ ] Cómo contactar
  - [ ] Fecha de última actualización

- [ ] **Link en footer** de toda la app

### 2. Terms of Service

- [ ] **Página /terms** creada
  - Verificar: `ls src/app/terms/`

- [ ] **Contenido incluye**:
  - [ ] Descripción del servicio
  - [ ] Condiciones de uso
  - [ ] Limitación de responsabilidad
  - [ ] Terminación de cuenta
  - [ ] Propiedad intelectual
  - [ ] Ley aplicable

- [ ] **Aceptación en registro**
  - Checkbox obligatorio
  - Guardar timestamp de aceptación

### 3. GDPR Compliance

- [ ] **Base legal** para procesamiento
  - Consentimiento o interés legítimo

- [ ] **Derecho de acceso**
  - Endpoint para exportar datos del usuario
  - /api/user/export o similar

- [ ] **Derecho de eliminación**
  - Endpoint para borrar cuenta
  - /api/user/delete o similar
  - Borrar datos en 30 días

- [ ] **Derecho de portabilidad**
  - Exportar datos en formato legible
  - JSON o CSV

- [ ] **Data Processing Agreement** (si aplica)
  - Con proveedores de servicios

### 4. Cookie Consent

- [ ] **Banner de cookies** implementado
  - Verificar: `grep -r "cookie" src/`

- [ ] **Categorías de cookies**:
  - [ ] Esenciales (siempre activas)
  - [ ] Analytics (requiere consentimiento)
  - [ ] Marketing (requiere consentimiento)

- [ ] **Guardar preferencias**
  - Cookie de consentimiento
  - Respetar elección

- [ ] **Link a Cookie Policy**
  - Dentro del banner
  - O en Privacy Policy

### 5. Documentación Adicional

- [ ] **Página de contacto**
  - Email de soporte
  - Formulario de contacto

- [ ] **DPA (Data Processing Agreement)**
  - Para clientes enterprise
  - Template disponible

---

## Comandos de Verificación

```bash
# Páginas legales
ls src/app/privacy/
ls src/app/terms/

# Cookie consent
grep -r "cookie-consent\|gdpr" src/

# Data export
grep -r "export.*data\|user/export" src/
```

---

## Código de Ejemplo

### Cookie Consent Banner

```typescript
// src/components/CookieConsent.tsx
'use client'
import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 w-full bg-gray-900 p-4">
      <p>Usamos cookies para mejorar tu experiencia.</p>
      <button onClick={accept}>Aceptar</button>
      <a href="/privacy">Más info</a>
    </div>
  )
}
```

### Data Export Endpoint

```typescript
// src/app/api/user/export/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: true,
      comments: true,
      // ... otros datos
    },
  });

  return Response.json(userData);
}
```

### Data Deletion Endpoint

```typescript
// src/app/api/user/delete/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft delete o anonimizar
  await db.user.update({
    where: { id: session.user.id },
    data: {
      email: `deleted-${session.user.id}@deleted.com`,
      name: "Deleted User",
      deletedAt: new Date(),
    },
  });

  return Response.json({ success: true });
}
```

---

## Templates Legales

Usar como base y adaptar:

- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [Terms of Service Generator](https://termly.io/products/terms-and-conditions-generator/)

**IMPORTANTE**: Revisar con abogado antes de publicar.

---

## Recursos

- [GDPR Official](https://gdpr.eu/)
- [CCPA Overview](https://oag.ca.gov/privacy/ccpa)
- [Cookie Consent Best Practices](https://gdpr.eu/cookies/)

---

## Siguiente Fase

Una vez completado:

```
/scale:iteration deployment
```
