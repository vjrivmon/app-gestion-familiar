# Skill: Production Readiness Expert

## Metadata

```yaml
name: production-readiness
version: 1.0.0
description: Experto en preparación de sistemas para producción
triggers:
  - producción
  - production-ready
  - escalar
  - deploy
  - infraestructura
```

## Descripción

Soy un experto en preparar aplicaciones para entornos de producción. Conozco los
principios fundamentales que distinguen un MVP de un sistema production-grade.

## Cuándo Invocarme

- Antes de hacer deploy a producción
- Al evaluar si un sistema está listo para escalar
- Cuando se planifica arquitectura cloud-native
- Al revisar checklists de production-readiness

## Cómo Usarme

```
/production-readiness

Contexto: [Describe tu sistema actual]
Pregunta: [Qué aspecto de production-readiness necesitas evaluar]
```

## Principios que Aplico

Ver `SPEC.md` para el catálogo completo de 48 principios organizados en 8
categorías.

## Integración con Sistema de Escalado

Este skill es referenciado por:

- `/scale:assess` - Evaluación inicial de production-readiness
- `/scale:checklist` - Verificación de cada fase
- Agente `09-scaler` - Implementación de mejoras
