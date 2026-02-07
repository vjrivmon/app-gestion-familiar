# Debug Loop Skill

Skill para debugging iterativo con Ralph Loop sin límite de iteraciones.

## Uso
```
/debug:loop <task-file>
```

## Qué Hace
1. Lee archivo de tarea con criterios de completitud
2. Crea estructura `.claude/debug/` en el proyecto actual
3. Genera PROMPT.md adaptado para Ralph Loop
4. Activa ralph-active flag
5. Ejecuta iterativamente hasta completar TODOS los criterios

## Estructura que Crea

```
.claude/
├── debug/
│   ├── TASK.md              # Tu tarea (criterios de completitud)
│   ├── validate_backend.py  # Validador de coherencia
│   ├── validate_frontend.py # Validador UI (Playwright)
│   └── resource_tracker.py  # Exportador a Excel
├── ralph-infinite/
│   ├── PROMPT.md            # Prompt del loop
│   └── ralph-infinite-hook.sh
└── logs/
    └── debug-sessions/
```

## Buenas Prácticas Incluidas

### 1. Criterios Verificables
- Cada criterio debe tener un comando de validación
- Usar checkboxes `[ ]` para tracking
- Dividir en Backend/Frontend/Integración

### 2. Validación Automática
- `validate_backend.py` - Verifica coherencia de datos
- `validate_frontend.py` - Compara UI vs datos (Playwright)
- `resource_tracker.py` - Genera Excel para análisis visual

### 3. Loop Sin Límite
- Solo se detiene cuando TODO está completo
- Safety check: 5 errores consecutivos → pausa
- Tracking de tiempo transcurrido

### 4. Console.log Estratégicos
Para debugging frontend:
```javascript
console.log('[DEBUG] handleBuildPhase:', phase_obj);
console.log('[DEBUG] Actualizando recursos P' + player + ':', hand_obj);
```

## Criterios de una Buena Tarea de Debug

- [ ] Descripción clara del problema
- [ ] Criterios verificables (checkboxes con IDs: B1, F1, etc.)
- [ ] Archivos específicos a modificar con líneas aproximadas
- [ ] Comandos de test para validar cada criterio
- [ ] Definición clara de "completado"

## Ejemplo de TASK.md

```markdown
# Debug Task: [Nombre del Bug]

## Problema
[Descripción clara]

## Criterios de Completitud

### Backend (N)
- [ ] B1: [Criterio verificable]
- [ ] B2: [Criterio verificable]

### Frontend (N)
- [ ] F1: [Criterio verificable]

### Integración (N)
- [ ] I1: [Test end-to-end]

## Comandos de Validación
- Backend: `python validate.py`
- Frontend: `npm test`

## Archivos a Modificar
| Archivo | Cambio | Línea |
|---------|--------|-------|
| file.py | Fix X  | 42    |
```

## Dependencias Opcionales

```bash
# Para tracking Excel
pip install openpyxl

# Para validación UI automatizada
pip install playwright
playwright install chromium
```

## Tips

1. **Empieza por el backend** - Los datos correctos primero
2. **Genera nuevas trazas** - Después de cada fix backend
3. **Valida incrementalmente** - Un criterio a la vez
4. **Usa Excel** - Para visualizar tendencias y detectar anomalías
5. **No optimices prematuramente** - Primero que funcione, después bonito
