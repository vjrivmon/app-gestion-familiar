# Debug Task: [NOMBRE DEL BUG]

## Problema
[Descripción clara del problema - qué debería pasar vs qué pasa]

## Causa Raíz (si conocida)
[Hipótesis o causa identificada]

---

## Criterios de Completitud (N total)

### Backend (N)
- [ ] B1: [Criterio verificable]
- [ ] B2: [Criterio verificable]
- [ ] B3: `validate_backend.py` pasa con 0 errores

### Frontend (N)
- [ ] F1: [Criterio verificable]
- [ ] F2: [Criterio verificable]
- [ ] F3: `validate_frontend.py` pasa con 0 discrepancias

### Integración (N)
- [ ] I1: [Test end-to-end pasa]
- [ ] I2: [Verificación manual OK]

---

## Archivos a Modificar

### Backend
| Archivo | Cambio | Línea aprox |
|---------|--------|-------------|
| `path/file.py` | [Descripción del cambio] | ~42 |

### Frontend
| Archivo | Cambio | Línea aprox |
|---------|--------|-------------|
| `path/file.js` | [Descripción del cambio] | ~100 |

---

## Comandos de Validación

```bash
# Backend
python .claude/debug/validate_backend.py [archivo_test]

# Frontend
python .claude/debug/validate_frontend.py [url] [archivo_test]

# Generar nueva traza (si aplica)
[comando para generar datos de prueba]
```

---

## Notas Adicionales
[Cualquier contexto relevante, workarounds conocidos, etc.]
