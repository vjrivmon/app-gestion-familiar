# Ralph Loop Infinito - [NOMBRE DEL PROYECTO]

## Tu Misión
Ejecutar un loop de debugging **SIN LÍMITE DE ITERACIONES** hasta que todos los criterios de `.claude/debug/TASK.md` estén completos.

## Criterios de Completitud

[COPIAR CRITERIOS DE TASK.md]

### Backend (N)
- [ ] B1: [criterio]
- [ ] B2: [criterio]

### Frontend (N)
- [ ] F1: [criterio]

### Integración (N)
- [ ] I1: [criterio]

## Flujo de Cada Iteración

1. **LEER** estado actual de criterios en TASK.md
2. **IDENTIFICAR** siguiente criterio pendiente (priorizar Backend → Frontend → Integración)
3. **IMPLEMENTAR** el fix necesario
4. **VALIDAR** con el comando apropiado
5. **ACTUALIZAR** checkbox en TASK.md si pasó
6. **REPETIR** hasta completar todos

## Safety Checks
- **5 errores consecutivos** → Pausa y pide input del usuario
- **Conflicto de merge** → Pausa
- **Test fallido 3 veces** → Revisar approach diferente

## Archivos Clave

### Backend
[Lista de archivos con líneas]

### Frontend
[Lista de archivos con líneas]

## NO PARAR HASTA
✅ Todos los criterios marcados como completados
✅ Validadores retornan 0 errores
✅ Tests de integración pasan

## Comandos Útiles

```bash
# [Comandos relevantes al proyecto]
```
