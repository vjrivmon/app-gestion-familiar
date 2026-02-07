# /dev:verify - Verificacion Read-Only de Produccion

URL o servicio a verificar: $ARGUMENTS

## Instrucciones

Verificas que un servicio en produccion funciona correctamente. Eres
ESTRICTAMENTE read-only. No modificas nada.

### Restricciones Absolutas

- **CERO llamadas a Edit, Write, NotebookEdit**
- **CERO modificaciones de archivos**
- **CERO commits**
- Solo Read, Bash (curl/wget), WebFetch
- Si encuentras problemas: REPORTA, no corrijas

### Flujo

#### Paso 1: Identificar endpoints

A partir de $ARGUMENTS, identifica:

- URL base del servicio
- Endpoints clave a verificar (paginas, API, health)

Si no se proporciona URL, intenta detectarla de:

- `vercel.json` o `.vercel/project.json`
- `package.json` (homepage field)
- `fly.toml`
- `.env.production` (sin secretos, solo URLs publicas)

#### Paso 2: Health Checks

```bash
# Verificar que responde
curl -sf -o /dev/null -w "%{http_code} %{time_total}s" <URL>

# Verificar endpoints principales
curl -sf -o /dev/null -w "%{http_code}" <URL>/api/health
curl -sf -o /dev/null -w "%{http_code}" <URL>/api/...
```

Para cada endpoint registra:

- HTTP status code
- Tiempo de respuesta
- Si el body contiene lo esperado

#### Paso 3: Verificacion de contenido

Si es una web app:

- Fetch la pagina principal y verifica que contiene elementos esperados
- Verifica que no hay errores 500 visibles
- Verifica que assets cargan (CSS, JS)

Si es una API:

- Verifica responses tienen la estructura esperada
- Verifica que no hay errores en el response body

#### Paso 4: Reporte

Genera un reporte con formato:

```
## Verificacion: <URL>
Fecha: <timestamp>

### Resultados
| Endpoint | Status | Tiempo | OK? |
|----------|--------|--------|-----|
| /        | 200    | 0.3s   | OK  |
| /api/... | 500    | 1.2s   | FAIL|

### Issues Encontrados
1. [ISSUE-001] Endpoint /api/X retorna 500
2. [ISSUE-002] Pagina principal tarda >2s

### Acciones Sugeridas
- Para ISSUE-001: `/dev:quick "fix endpoint /api/X 500 error"`
- Para ISSUE-002: `/dev:feature "optimize page load performance"`
```

### Si hay issues

- NO corrijas nada
- Genera scope contracts sugeridos para cada issue
- Sugiere el comando adecuado (/dev:quick o /dev:feature) segun complejidad
- El usuario decidira que corregir en una sesion nueva
