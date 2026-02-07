# Claude Code Hooks

Este directorio contiene scripts de automatización que se ejecutan en diferentes momentos del ciclo de vida de Claude Code.

## Estructura

```
hooks/
├── scripts/
│   ├── session-init.sh      # Se ejecuta al iniciar sesión
│   ├── pre-tool-validate.sh # Se ejecuta antes de Bash
│   ├── post-tool-format.sh  # Se ejecuta después de Edit/Write
│   └── test-runner.sh       # Se ejecuta al finalizar sesión
└── README.md
```

## Hooks Configurados

### SessionStart

**Script**: `session-init.sh`

Se ejecuta al iniciar una sesión de Claude Code.

**Funciones:**
- Carga variables de entorno desde `.env`
- Verifica si existen dependencias instaladas
- Inicializa servicios necesarios
- Exporta variables al entorno de Claude

### PreToolUse (Bash)

**Script**: `pre-tool-validate.sh`

Se ejecuta antes de cada comando Bash.

**Funciones:**
- Bloquea comandos peligrosos (`rm -rf /`, `:(){ :|:& };:`)
- Previene force push a main/master
- Advierte sobre modificación de archivos sensibles
- Valida comandos de Docker

**Variables de entrada:**
- `$TOOL_INPUT` - Comando a ejecutar

### PostToolUse (Edit|Write)

**Script**: `post-tool-format.sh`

Se ejecuta después de editar o crear archivos.

**Funciones:**
- Formatea archivos TypeScript/JavaScript con Prettier
- Formatea archivos Python con Black
- Formatea JSON/YAML con jq/yq
- Ejecuta linter según tipo de archivo

**Variables de entrada:**
- `$TOOL_INPUT` - Ruta del archivo modificado

### Stop

**Script**: `test-runner.sh`

Se ejecuta cuando Claude termina su trabajo.

**Funciones:**
- Detecta framework de testing (Jest/Pytest/Go)
- Ejecuta suite de tests
- Reporta resultados
- Advierte si hay tests fallando

## Configuración

Los hooks se configuran en `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/session-init.sh"
      }]
    }],
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/pre-tool-validate.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/post-tool-format.sh"
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/test-runner.sh"
      }]
    }]
  }
}
```

## Variables Disponibles

| Variable | Descripción |
|----------|-------------|
| `$CLAUDE_PROJECT_DIR` | Directorio raíz del proyecto |
| `$TOOL_INPUT` | Input de la herramienta (para Pre/Post) |
| `$TOOL_OUTPUT` | Output de la herramienta (para Post) |
| `$CLAUDE_ENV_FILE` | Archivo para persistir variables |

## Añadir Nuevos Hooks

1. Crear script en `scripts/`:
   ```bash
   #!/bin/bash
   # mi-hook.sh
   echo "Hook ejecutado"
   ```

2. Dar permisos de ejecución:
   ```bash
   chmod +x scripts/mi-hook.sh
   ```

3. Configurar en `settings.json`:
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "MiTool",
         "hooks": [{
           "type": "command",
           "command": "bash scripts/mi-hook.sh"
         }]
       }]
     }
   }
   ```

## Debugging

Para depurar hooks:

```bash
# Ejecutar manualmente
TOOL_INPUT='{"command": "ls"}' bash scripts/pre-tool-validate.sh

# Ver logs
tail -f /tmp/claude-hooks.log
```

## Desactivar Hooks

Para desactivar temporalmente los hooks, crear `.claude/settings.local.json`:

```json
{
  "hooks": {}
}
```

O renombrar el archivo de settings:
```bash
mv .claude/settings.json .claude/settings.json.bak
```
