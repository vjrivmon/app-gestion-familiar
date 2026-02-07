# Auth & Security Principles

> 42 principios organizados en 7 categorías para sistemas seguros

---

## 1. Autenticación (6 principios)

### 1.1 Principio de Password Hashing

**Descripción**: Las contraseñas nunca se almacenan en texto plano. Siempre hash
con algoritmo diseñado para passwords.

**Algoritmos recomendados** (en orden de preferencia):

1. Argon2id (ganador PHC, recomendado)
2. bcrypt (probado, ampliamente soportado)
3. scrypt (alta memoria requerida)

**Configuración Argon2id**:

```
time: 3
memory: 64MB
parallelism: 4
```

**Anti-patrón**: MD5, SHA-1, SHA-256 sin salt.

---

### 1.2 Principio de Session Management

**Descripción**: Las sesiones deben ser seguras, rotarse y expirar
apropiadamente.

**Best practices**:

- Session ID de al menos 128 bits de entropía
- Regenerar session ID tras login
- Expirar sessions inactivas (30 min default)
- Expirar sessions absolutas (24h default)
- Invalidar todas las sessions al cambiar password

---

### 1.3 Principio de Token-Based Auth

**Descripción**: Para APIs stateless, usar tokens JWT con refresh tokens.

**Estructura JWT**:

```json
{
  "sub": "user_id",
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "unique_token_id"
}
```

**Tiempos de expiración**:

- Access token: 15 minutos
- Refresh token: 7 días
- Refresh token (remember me): 30 días

---

### 1.4 Principio de Credential Recovery

**Descripción**: El proceso de recuperación de credenciales no debe revelar
información sobre cuentas existentes.

**Flujo seguro**:

1. Usuario ingresa email
2. Siempre mostrar "Si existe una cuenta, recibirás un email"
3. Token de reset con expiración corta (1 hora)
4. Token de un solo uso
5. Invalidar otros tokens de reset pendientes
6. Notificar al email si password cambiado

---

### 1.5 Principio de Account Lockout

**Descripción**: Proteger contra ataques de fuerza bruta sin crear DoS.

**Estrategia recomendada**:

- 5 intentos fallidos → CAPTCHA
- 10 intentos fallidos → bloqueo temporal 15 min
- 20 intentos fallidos → bloqueo 1 hora
- Después de bloqueo exitoso → reset contador

**Anti-patrón**: Bloqueo permanente (permite DoS).

---

### 1.6 Principio de Secure Logout

**Descripción**: Logout debe invalidar completamente la sesión.

**Checklist**:

- [ ] Invalidar session en servidor
- [ ] Eliminar cookies de sesión
- [ ] Añadir token a blacklist (si JWT)
- [ ] Limpiar localStorage/sessionStorage
- [ ] Redirect a página pública

---

## 2. Autorización (6 principios)

### 2.1 Principio de RBAC

**Descripción**: Control de acceso basado en roles. Usuarios tienen roles, roles
tienen permisos.

**Estructura**:

```
User → Role → Permission

Ejemplo:
User "alice" → Role "editor" → ["posts:read", "posts:write", "posts:delete"]
```

**Best practice**: Preferir permisos granulares sobre roles monolíticos.

---

### 2.2 Principio de ABAC

**Descripción**: Control de acceso basado en atributos. Para casos complejos
donde RBAC no es suficiente.

**Ejemplo de política**:

```
ALLOW if:
  user.department == resource.department AND
  user.clearance >= resource.classification AND
  time.current BETWEEN 09:00 AND 18:00
```

---

### 2.3 Principio de Resource Ownership

**Descripción**: Los usuarios solo pueden acceder a recursos que les pertenecen,
salvo permisos explícitos.

**Implementación**:

```sql
SELECT * FROM posts
WHERE user_id = :current_user_id
   OR :current_user_id IN (SELECT user_id FROM post_collaborators WHERE post_id = posts.id)
   OR :current_user_has_admin_role
```

---

### 2.4 Principio de Deny by Default

**Descripción**: Si no hay regla que permita acceso, denegar. Nunca asumir
acceso permitido.

**Implementación**:

```typescript
function canAccess(user, resource, action): boolean {
  // Explicit deny siempre gana
  if (hasExplicitDeny(user, resource, action)) return false;

  // Debe haber explicit allow
  return hasExplicitAllow(user, resource, action);
}
```

---

### 2.5 Principio de Separation of Duties

**Descripción**: Operaciones críticas requieren múltiples actores o roles.

**Ejemplos**:

- Aprobar pago > $10k requiere 2 managers
- Delete production data requiere admin + security
- Deploy to production requiere developer + reviewer

---

### 2.6 Principio de Audit Authorization

**Descripción**: Toda decisión de autorización debe quedar registrada.

**Log entry**:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "user_123",
  "action": "posts:delete",
  "resource": "post_456",
  "decision": "DENY",
  "reason": "Missing permission posts:delete",
  "context": { "ip": "192.168.1.1" }
}
```

---

## 3. Multi-Factor Authentication (6 principios)

### 3.1 Principio de MFA Obligatorio para Admin

**Descripción**: Cuentas administrativas DEBEN tener MFA habilitado.

**Implementación**:

- Forzar MFA setup en primer login de admin
- No permitir desactivar MFA para roles admin
- Require MFA para operaciones sensitivas

---

### 3.2 Principio de TOTP

**Descripción**: Time-based One-Time Passwords como segundo factor estándar.

**Implementación**:

- Algoritmo: HMAC-SHA1 (compatible) o SHA256
- Periodo: 30 segundos
- Digits: 6
- Permitir ±1 ventana para clock skew

**Backup**: Siempre generar códigos de recuperación (8-10 códigos de un uso).

---

### 3.3 Principio de WebAuthn/FIDO2

**Descripción**: Autenticación passwordless con hardware keys o biometría.

**Beneficios**:

- Phishing-resistant
- No hay secrets que robar
- User-friendly (biometría)

**Implementación**: Ofrecer como opción preferida sobre TOTP.

---

### 3.4 Principio de SMS como Último Recurso

**Descripción**: SMS 2FA es vulnerable a SIM swapping. Usar solo si no hay
alternativa.

**Orden de preferencia**:

1. Hardware key (YubiKey)
2. WebAuthn (biometría)
3. TOTP (authenticator app)
4. Push notification
5. SMS (último recurso)

---

### 3.5 Principio de Recovery Codes

**Descripción**: Siempre proveer método de recuperación para MFA perdido.

**Implementación**:

- Generar 10 códigos de un solo uso
- Mostrar solo una vez al setup
- Hash y almacenar como passwords
- Permitir regenerar (invalida anteriores)

---

### 3.6 Principio de Step-Up Authentication

**Descripción**: Requerir re-autenticación para operaciones sensitivas incluso
con sesión activa.

**Operaciones que requieren step-up**:

- Cambiar email/password
- Ver/cambiar datos de pago
- Desactivar MFA
- Eliminar cuenta
- Acceder a datos sensibles

---

## 4. OAuth & SSO (6 principios)

### 4.1 Principio de OAuth 2.0 + PKCE

**Descripción**: Usar Authorization Code flow con PKCE para todas las apps
(incluso confidential clients).

**Flujo**:

1. Generate code_verifier (random string)
2. Generate code_challenge = SHA256(code_verifier)
3. Authorization request con code_challenge
4. Token request con code_verifier
5. Server verifica code_verifier contra code_challenge

---

### 4.2 Principio de OpenID Connect

**Descripción**: Usar OIDC sobre OAuth 2.0 para obtener información de
identidad.

**Claims estándar**:

- `sub`: Subject identifier (user id)
- `email`: Email verificado
- `name`: Display name
- `picture`: Avatar URL

---

### 4.3 Principio de State Parameter

**Descripción**: Siempre usar state parameter para prevenir CSRF en OAuth.

**Implementación**:

```typescript
const state = crypto.randomBytes(32).toString("hex");
session.oauthState = state;

// En callback
if (params.state !== session.oauthState) {
  throw new Error("Invalid state");
}
```

---

### 4.4 Principio de Token Storage

**Descripción**: Almacenar tokens de forma segura según el tipo de aplicación.

**Recomendaciones**:

| Tipo de App | Access Token        | Refresh Token         |
| ----------- | ------------------- | --------------------- |
| SPA         | Memory only         | HttpOnly cookie o BFF |
| Mobile      | Secure storage      | Secure storage        |
| Server      | Memory/encrypted DB | Encrypted DB          |
| Desktop     | OS keychain         | OS keychain           |

---

### 4.5 Principio de Scope Mínimo

**Descripción**: Solicitar solo los scopes necesarios para la funcionalidad.

**Ejemplo**:

```
// MAL
scope: "read write admin delete"

// BIEN
scope: "profile email" // solo lo necesario para login
```

---

### 4.6 Principio de Provider Verification

**Descripción**: Verificar la configuración del OAuth provider antes de confiar.

**Checklist**:

- [ ] HTTPS obligatorio
- [ ] Tokens firmados (RS256 preferido sobre HS256)
- [ ] JWKS endpoint disponible
- [ ] Issuer validation
- [ ] Audience validation

---

## 5. API Security (6 principios)

### 5.1 Principio de API Authentication

**Descripción**: Toda API debe requerir autenticación salvo endpoints públicos
explícitos.

**Métodos**:

- Bearer token (JWT) para usuarios
- API key para service-to-service
- mTLS para alta seguridad

---

### 5.2 Principio de Rate Limiting

**Descripción**: Limitar requests por cliente para prevenir abuso.

**Estrategia por capas**:

| Capa        | Límite    | Ventana |
| ----------- | --------- | ------- |
| Global      | 10000 req | 1 min   |
| Por IP      | 100 req   | 1 min   |
| Por User    | 1000 req  | 1 min   |
| Por API Key | 5000 req  | 1 min   |

**Headers de respuesta**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

---

### 5.3 Principio de Input Validation

**Descripción**: Validar todo input antes de procesarlo.

**Capas**:

1. **Schema validation**: Zod, Yup, JSON Schema
2. **Sanitización**: Escapar HTML, SQL
3. **Business validation**: Reglas de negocio

**Ejemplo Zod**:

```typescript
const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(13).max(120),
});
```

---

### 5.4 Principio de Output Encoding

**Descripción**: Encodear output según contexto para prevenir XSS.

**Contextos**:

| Contexto       | Encoding             |
| -------------- | -------------------- |
| HTML body      | HTML entity encoding |
| HTML attribute | Attribute encoding   |
| JavaScript     | JavaScript encoding  |
| URL            | URL encoding         |
| CSS            | CSS encoding         |

---

### 5.5 Principio de Error Handling

**Descripción**: Los errores no deben revelar información interna del sistema.

**Respuesta pública**:

```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

**Log interno** (con trace_id):

```json
{
  "error": "DatabaseError",
  "message": "Connection refused to postgres:5432",
  "trace_id": "abc123",
  "stack": "..."
}
```

---

### 5.6 Principio de CORS

**Descripción**: Configurar CORS restrictivamente.

**Configuración segura**:

```typescript
{
  origin: ["https://app.example.com"],  // NO usar "*"
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
}
```

---

## 6. Secure Headers (6 principios)

### 6.1 Content-Security-Policy

**Descripción**: Controlar qué recursos puede cargar la página.

**Política recomendada**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
```

---

### 6.2 Strict-Transport-Security

**Descripción**: Forzar HTTPS para todas las conexiones.

**Configuración**:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

### 6.3 X-Content-Type-Options

**Descripción**: Prevenir MIME type sniffing.

```
X-Content-Type-Options: nosniff
```

---

### 6.4 X-Frame-Options

**Descripción**: Prevenir clickjacking.

```
X-Frame-Options: DENY
```

O usar CSP frame-ancestors (más flexible).

---

### 6.5 Referrer-Policy

**Descripción**: Controlar qué información de referrer se envía.

```
Referrer-Policy: strict-origin-when-cross-origin
```

---

### 6.6 Permissions-Policy

**Descripción**: Controlar qué APIs del browser puede usar la página.

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 7. Vulnerabilidades Comunes (6 principios)

### 7.1 SQL Injection

**Descripción**: Prevenir inyección de SQL mediante parameterized queries.

**MAL**:

```typescript
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**BIEN**:

```typescript
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

---

### 7.2 XSS (Cross-Site Scripting)

**Descripción**: Prevenir ejecución de scripts maliciosos.

**Medidas**:

1. Output encoding por contexto
2. CSP restrictivo
3. HttpOnly cookies
4. Sanitizar HTML si necesario (DOMPurify)

---

### 7.3 CSRF (Cross-Site Request Forgery)

**Descripción**: Prevenir requests forjados desde otros sitios.

**Medidas**:

1. CSRF tokens en formularios
2. SameSite=Strict cookies
3. Verificar Origin header
4. Require re-auth para acciones críticas

---

### 7.4 IDOR (Insecure Direct Object Reference)

**Descripción**: Verificar autorización antes de acceder a recursos por ID.

**MAL**:

```typescript
app.get("/api/users/:id", (req, res) => {
  return db.users.findById(req.params.id); // No verifica ownership
});
```

**BIEN**:

```typescript
app.get("/api/users/:id", (req, res) => {
  const user = db.users.findById(req.params.id);
  if (user.id !== req.user.id && !req.user.isAdmin) {
    throw new ForbiddenError();
  }
  return user;
});
```

---

### 7.5 Broken Authentication

**Descripción**: Verificar toda la cadena de autenticación.

**Checklist**:

- [ ] Passwords hasheados correctamente
- [ ] Sessions expiran
- [ ] Tokens validados en cada request
- [ ] MFA no bypasseable
- [ ] Logout invalida session

---

### 7.6 Security Misconfiguration

**Descripción**: Configuración por defecto es insegura. Revisar todo.

**Checklist**:

- [ ] Debug mode desactivado en producción
- [ ] Stack traces no expuestos
- [ ] Directorios no listables
- [ ] Defaults cambiados (admin/admin)
- [ ] Servicios innecesarios desactivados

---

## Quick Reference

| Categoría        | Principios Clave                            |
| ---------------- | ------------------------------------------- |
| Autenticación    | Argon2id, Session rotation, JWT short-lived |
| Autorización     | RBAC, Deny by default, Audit logging        |
| MFA              | TOTP, WebAuthn, Recovery codes              |
| OAuth/SSO        | PKCE, State param, Secure token storage     |
| API Security     | Rate limiting, Input validation, CORS       |
| Headers          | CSP, HSTS, X-Frame-Options                  |
| Vulnerabilidades | SQLi, XSS, CSRF, IDOR prevention            |
