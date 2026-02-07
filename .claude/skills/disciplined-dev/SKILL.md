# Skill: Disciplined Dev Workflow

Sistema de desarrollo disciplinado que previene buggy code post-deploy,
over-engineering, scope creep y cambios excesivos.

## Problema que Resuelve

| Problema                          | Frecuencia | Solucion                   |
| --------------------------------- | ---------- | -------------------------- |
| Buggy code post-deploy            | 22/130     | Pre-commit validation gate |
| Wrong approach / over-engineering | 18/130     | Routing por complejidad    |
| Misunderstood request             | 8/130      | Scope contracts            |
| Excessive changes                 | 6/130      | File allowlist en scope    |
| Planning instead of executing     | 5/130      | /dev:quick sin plan mode   |

## Comandos

| Comando               | Uso                    | Archivos |
| --------------------- | ---------------------- | -------- |
| `/dev:quick <desc>`   | Cambios simples        | 1-3      |
| `/dev:feature <desc>` | Features medios        | 4-10     |
| `/dev:deploy`         | Deploy con pre-flight  | 0        |
| `/dev:verify <url>`   | Verificacion read-only | 0        |

## Routing por Complejidad

```
Archivos a tocar:
  1-3   → /dev:quick
  4-10  → /dev:feature
  10+   → gurusup-workflow (explore → plan → implement)
```

## Pre-Commit Validation Gate

Hook automatico (`pre-commit-validate.sh`) que se ejecuta antes de cada
`git commit`:

1. **Scope contract check**: si `.claude/scope-contract.active.md` existe,
   verifica que los archivos staged estan en la lista permitida
2. **tsc --noEmit**: type checking (si hay tsconfig.json)
3. **npm run build**: build check (si script existe)
4. **npm run lint**: lint check (si script existe)

Si cualquier check falla → exit 2 → commit bloqueado.

## Scope Contract

Archivo temporal `.claude/scope-contract.active.md` que define:

- Que archivos se pueden modificar
- Que archivos NO se deben tocar
- Nivel de complejidad
- Fases de implementacion (para /dev:feature)

Se crea al inicio del trabajo y se elimina despues del commit exitoso.

Ver: `references/scope-contract-guide.md`

## Integracion con Workflows Existentes

- **GuruSup**: Para tareas complejas (10+ archivos). No se modifica.
- **Ralph Loop**: Compatible con /dev:feature para ejecucion autonoma.
- **Post-edit format hook**: Se ejecuta antes del pre-commit gate.
- **Checkpoint hook**: Se ejecuta despues del pre-commit gate.

## Archivos del Sistema

```
.claude/
├── hooks/scripts/
│   └── pre-commit-validate.sh    # Gate de validacion
├── commands/dev/
│   ├── quick.md                  # /dev:quick
│   ├── feature.md                # /dev:feature
│   ├── deploy.md                 # /dev:deploy
│   └── verify.md                 # /dev:verify
├── skills/disciplined-dev/
│   ├── SKILL.md                  # Este archivo
│   └── references/
│       └── scope-contract-guide.md
└── scope-contract.active.md      # Temporal, durante trabajo
```
