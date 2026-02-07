# /prd:issue - Crear Issue desde PRD

## Descripción
Crea una issue de GitHub con formato PRD a partir de un documento existente o del contexto actual.

## Uso
```
/prd:issue [repo] [--from archivo.md]
```

## Parámetros
- `repo`: Repositorio target (ej: `vjrivmon/Osyris-Web`)
- `--from`: Archivo PRD fuente (opcional)

## Flujo

### Sin archivo fuente
1. Usar el PRD del contexto actual (si hay)
2. O pedir descripción del problema para generar uno rápido

### Con archivo fuente
1. Leer el archivo PRD
2. Extraer secciones relevantes
3. Formatear para issue

### Creación
1. Confirmar repo y título
2. Sugerir labels
3. Crear via API/CLI
4. Retornar URL

## Ejemplo
```
Usuario: /prd:issue vjrivmon/Osyris-Web

VisiClaw: 
📝 Creando issue desde el PRD actual...

**Título propuesto:** 🚀 Feature: Sistema de notificaciones push
**Labels sugeridos:** enhancement, feature, prd
**Milestone:** (ninguno detectado)

¿Confirmo la creación?

Usuario: sí

VisiClaw: ✅ Issue creada: https://github.com/vjrivmon/Osyris-Web/issues/5
```

## Requisitos
- Token de GitHub configurado (`~/.config/github_token` o `gh auth`)
- Permisos de escritura en el repo

## Skill Reference
`.claude/skills/prd-workflow/agents/prd-issue-creator.md`
