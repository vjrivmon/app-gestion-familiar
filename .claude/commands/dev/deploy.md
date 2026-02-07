# /dev:deploy - Deploy con Pre-flight Checks

Argumentos: $ARGUMENTS

## Instrucciones

Ejecutas un deploy seguro con validaciones pre-flight. NO auto-fixes.

### Flujo Obligatorio

#### Paso 1: Pre-flight Checks

Ejecuta TODOS estos checks secuencialmente. Si CUALQUIERA falla, PARA y reporta:

1. **Git status limpio**:

   ```bash
   git status --porcelain
   ```

   - Si hay cambios uncommitted: REPORTAR y PARAR
   - Si hay archivos untracked relevantes: ADVERTIR

2. **TypeScript** (si tsconfig.json existe):

   ```bash
   npx tsc --noEmit
   ```

3. **Tests** (si script existe):

   ```bash
   npm run test
   ```

4. **Build**:

   ```bash
   npm run build
   ```

5. **Lint**:
   ```bash
   npm run lint
   ```

#### Paso 2: Confirmar deploy

Muestra al usuario:

- Resumen de pre-flight (todo verde)
- Rama actual y ultimo commit
- Destino del deploy

Pregunta confirmacion explicitamente antes de proceder.

#### Paso 3: Ejecutar deploy

Detecta y ejecuta el metodo de deploy:

- Si `vercel.json` o Vercel project: `npx vercel --prod`
- Si `fly.toml`: `fly deploy`
- Si `Dockerfile` + deploy script: `npm run deploy`
- Si script custom: `npm run deploy` o lo que $ARGUMENTS indique
- Si git-based: `git push origin main`

#### Paso 4: Health Check Post-Deploy

Si se proporcionan URLs (en $ARGUMENTS o detectadas):

```bash
# Check 3 endpoints clave
curl -sf <url> -o /dev/null && echo "OK: <url>" || echo "FAIL: <url>"
curl -sf <url>/api/health -o /dev/null && echo "OK: health" || echo "FAIL: health"
```

- Si health check falla: REPORTAR con detalles, NO auto-fix
- Sugerir usar `/dev:verify <url>` para diagnostico detallado

### Reglas Estrictas

- **NO modifiques codigo** durante este flujo
- **NO hagas auto-fix** si algo falla en pre-flight
- **NO hagas rollback automatico** - solo reporta
- **NO continues** despues de un fallo - para y reporta
- Si pre-flight falla: sugiere `/dev:quick` o `/dev:feature` para el fix
