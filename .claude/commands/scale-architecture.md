# /scale:architecture - Análisis y Mejoras Arquitectónicas

Analiza la arquitectura actual y propone mejoras para escalar.

## Uso

```
/scale:architecture [--deep]
```

- Sin flag: Análisis rápido de estructura
- `--deep`: Análisis profundo incluyendo dependencias y patterns

## Instrucciones para Claude

Cuando el usuario ejecute `/scale:architecture`:

### 1. Análisis de Estructura

```bash
# Estructura de directorios
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | head -50

# Archivos principales
ls -la src/ 2>/dev/null
ls -la app/ 2>/dev/null
ls -la pages/ 2>/dev/null

# Configuración
cat tsconfig.json | jq '.compilerOptions.paths' 2>/dev/null
cat package.json | jq '.dependencies' 2>/dev/null
```

### 2. Detectar Patrones Actuales

Identifica qué arquitectura se está usando:

**Clean Architecture**:

```
src/
├── domain/      # Entidades y reglas de negocio
├── application/ # Casos de uso
├── infrastructure/ # Implementaciones
└── presentation/   # UI/API
```

**Feature-based**:

```
src/
├── features/
│   ├── auth/
│   ├── billing/
│   └── dashboard/
└── shared/
```

**Pages-based (Next.js tradicional)**:

```
src/
├── pages/
├── components/
├── lib/
└── utils/
```

### 3. Análisis de Dependencias

```bash
# Dependencias principales
cat package.json | jq '.dependencies | keys[]' | head -20

# Tamaño de bundles (si existe)
cat .next/build-manifest.json 2>/dev/null | jq '.pages' | head -10

# Circular dependencies (si hay herramienta)
npx madge --circular src/ 2>/dev/null
```

### 4. Identificar Problemas Comunes

Busca anti-patterns:

- **God components**: Archivos > 500 líneas
- **Prop drilling**: Props pasadas > 3 niveles
- **Missing types**: Uso de `any`
- **Hardcoded values**: URLs, keys en código
- **Missing error boundaries**: try/catch ausentes

```bash
# Archivos muy grandes
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -10

# Uso de any
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# Hardcoded URLs
grep -rn "http://\|https://" src/ --include="*.ts" | grep -v "node_modules" | head -10
```

### 5. Generar Reporte de Arquitectura

Crea `.claude/scale/ARCHITECTURE-ANALYSIS.md`:

````markdown
# Análisis Arquitectónico

## Estructura Detectada

- Patrón: Feature-based / Clean / Monolítico
- Framework: Next.js 14 (App Router)
- Estado: Zustand / Redux / Context

## Fortalezas

1. ✅ Separación clara de features
2. ✅ TypeScript configurado en strict
3. ✅ Path aliases configurados

## Problemas Detectados

1. ⚠️ **3 archivos > 500 líneas**
   - `src/components/Dashboard.tsx` (750 líneas)
   - `src/lib/api.ts` (600 líneas)
   - Recomendación: Dividir en módulos más pequeños

2. ⚠️ **45 usos de `any`**
   - Archivos afectados: api.ts, utils.ts
   - Recomendación: Definir tipos específicos

3. ❌ **Sin error boundaries**
   - No se detectan ErrorBoundary components
   - Recomendación: Implementar en \_app o layout

## Recomendaciones para Escalar

### Prioridad Alta

1. **Implementar Error Boundaries**
   ```typescript
   // src/components/ErrorBoundary.tsx
   "use client";
   import { ErrorBoundary } from "react-error-boundary";
   ```
````

2. **Separar API en módulos**
   ```
   src/lib/api/
   ├── auth.ts
   ├── users.ts
   └── index.ts
   ```

### Prioridad Media

3. **Añadir capa de servicios**
   - Separar lógica de negocio de componentes
   - Implementar Repository pattern para data

4. **Configurar path aliases adicionales**
   ```json
   {
     "@/services/*": ["src/services/*"],
     "@/domain/*": ["src/domain/*"]
   }
   ```

## Diagrama Propuesto

\`\`\` ┌─────────────────────────────────────────┐ │ Presentation │ │ (Pages,
Components, API Routes) │ └────────────────┬────────────────────────┘ │
┌────────────────▼────────────────────────┐ │ Application │ │ (Services, Use
Cases, DTOs) │ └────────────────┬────────────────────────┘ │
┌────────────────▼────────────────────────┐ │ Domain │ │ (Entities, Business
Rules) │ └────────────────┬────────────────────────┘ │
┌────────────────▼────────────────────────┐ │ Infrastructure │ │ (Repositories,
External APIs, DB) │ └─────────────────────────────────────────┘ \`\`\`

## Próximos Pasos

1. Ejecutar `/scale:iteration architecture` para implementar mejoras
2. Refactorizar archivos grandes identificados
3. Añadir tipos donde hay `any`

````

### 6. Modo Deep (--deep)

Si se usa `--deep`, incluir:

- Análisis de performance (bundle size)
- Dependencias desactualizadas
- Vulnerabilidades conocidas
- Complejidad ciclomática

```bash
# Bundle analysis
npm run build && npx @next/bundle-analyzer

# Outdated deps
npm outdated

# Vulnerabilities
npm audit --json | jq '.vulnerabilities | length'
````

## Output Esperado

1. Reporte en `.claude/scale/ARCHITECTURE-ANALYSIS.md`
2. Lista priorizada de mejoras
3. Diagrama de arquitectura propuesta
4. Comandos específicos para implementar mejoras
