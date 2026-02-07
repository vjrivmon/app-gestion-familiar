# 🎨 UX/UI Skills para Claude Code

Sistema completo de **54 leyes, principios y heurísticas de UX/UI** estructuradas como skills invocables por agentes de Claude Code.

## 📋 Índice de Categorías

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| [`heuristics/`](./heuristics/) | 10 | Heurísticas de Usabilidad de Nielsen |
| [`cognitive-laws/`](./cognitive-laws/) | 7 | Leyes Cognitivas Fundamentales |
| [`gestalt/`](./gestalt/) | 11 | Principios de Percepción Visual Gestalt |
| [`behavioral-effects/`](./behavioral-effects/) | 10 | Efectos Conductuales y Sesgos Cognitivos |
| [`perception/`](./perception/) | 5 | Leyes de Percepción y Atención |
| [`design-principles/`](./design-principles/) | 12 | Principios de Diseño de Interacción |
| [`frameworks/`](./frameworks/) | 5 | Frameworks de Experiencia de Usuario |
| [`accessibility/`](./accessibility/) | 4 | Principios WCAG de Accesibilidad |
| [`anti-patterns/`](./anti-patterns/) | 1 | Dark Patterns a Evitar |

## 🚀 Uso

Estos skills se activan **automáticamente** cuando Claude detecta relevancia en tu tarea:

```
Usuario: "Estoy diseñando una tabla de precios con 3 planes"

[Claude detecta relevancia de: anchoring-effect, von-restorff-effect, hicks-law]
[Invoca Skills para cargar contenido completo]
[Aplica principios en su respuesta]
```
## 📚 Catálogo Completo

### Heurísticas de Nielsen (1994)
1. `nielsen-visibility` - Visibilidad del Estado del Sistema
2. `nielsen-match-real-world` - Coincidencia Sistema-Mundo Real
3. `nielsen-user-control` - Control y Libertad del Usuario
4. `nielsen-consistency` - Consistencia y Estándares
5. `nielsen-error-prevention` - Prevención de Errores
6. `nielsen-recognition-recall` - Reconocimiento sobre Recuerdo
7. `nielsen-flexibility` - Flexibilidad y Eficiencia de Uso
8. `nielsen-minimalist-design` - Diseño Estético y Minimalista
9. `nielsen-error-recovery` - Recuperación de Errores
10. `nielsen-help-documentation` - Ayuda y Documentación

### Leyes Cognitivas
1. `fitts-law` - Ley de Fitts (tiempo de interacción)
2. `hicks-law` - Ley de Hick-Hyman (tiempo de decisión)
3. `millers-law` - Ley de Miller (7±2 chunks)
4. `jakobs-law` - Ley de Jakob (familiaridad)
5. `teslers-law` - Ley de Tesler (conservación de complejidad)
6. `postels-law` - Ley de Postel (robustez)
7. `doherty-threshold` - Umbral de Doherty (<400ms)

### Principios Gestalt
1. `proximity` - Ley de Proximidad
2. `similarity` - Ley de Similitud
3. `continuity` - Ley de Continuidad
4. `closure` - Ley de Cierre
5. `figure-ground` - Ley de Figura-Fondo
6. `common-fate` - Ley de Destino Común
7. `common-region` - Ley de Región Común
8. `uniform-connectedness` - Ley de Conexión Uniforme
9. `pragnanz` - Ley de Prägnanz (Simplicidad)
10. `symmetry` - Ley de Simetría
11. `past-experience` - Ley de Experiencia Pasada

### Efectos Conductuales
1. `von-restorff-effect` - Efecto de Aislamiento
2. `zeigarnik-effect` - Efecto de Tareas Incompletas
3. `peak-end-rule` - Regla Peak-End
4. `goal-gradient-effect` - Efecto de Gradiente de Meta
5. `endowment-effect` - Efecto de Dotación
6. `serial-position-effect` - Efecto de Posición Serial
7. `mere-exposure-effect` - Efecto de Mera Exposición
8. `aesthetic-usability-effect` - Efecto Estético-Usabilidad
9. `anchoring-effect` - Efecto de Anclaje
10. `paradox-of-choice` - Paradoja de la Elección

### Percepción
1. `weber-fechner-law` - Ley de Weber-Fechner
2. `banner-blindness` - Ceguera a Banners
3. `change-blindness` - Ceguera al Cambio
4. `inattentional-blindness` - Ceguera Inatencional
5. `cognitive-load` - Teoría de Carga Cognitiva

### Principios de Diseño
1. `affordances` - Affordances y Signifiers
2. `progressive-disclosure` - Revelación Progresiva
3. `consistency-principle` - Principio de Consistencia
4. `feedback-principle` - Principio de Feedback
5. `constraints-principle` - Principio de Constraints
6. `mapping-principle` - Principio de Mapping
7. `occams-razor` - Navaja de Occam
8. `kiss-principle` - Principio KISS
9. `poka-yoke` - Poka-Yoke (A Prueba de Errores)
10. `least-astonishment` - Principio de Menor Asombro
11. `direct-manipulation` - Manipulación Directa
12. `pareto-principle` - Principio de Pareto (80/20)

### Frameworks
1. `ux-honeycomb` - UX Honeycomb de Morville
2. `emotional-design` - Diseño Emocional de Norman
3. `universal-design` - 7 Principios de Diseño Universal
4. `inclusive-design` - Diseño Inclusivo de Microsoft
5. `trust-credibility` - Principios de Confianza y Credibilidad

### Accesibilidad WCAG
1. `wcag-perceivable` - Principio Perceptible
2. `wcag-operable` - Principio Operable
3. `wcag-understandable` - Principio Comprensible
4. `wcag-robust` - Principio Robusto

### Anti-Patterns
1. `dark-patterns` - Dark Patterns a Evitar

## 🎯 Stack Agnóstico

Estos skills aplican a **cualquier tecnología**:
- **Web**: React, Vue, Angular, Svelte, HTML/CSS
- **Mobile**: iOS (Swift/SwiftUI), Android (Kotlin), Flutter, React Native
- **Desktop**: Electron, Tauri, native apps
- **Design Tools**: Figma, Sketch, Adobe XD

## 📖 Formato de Skills

Cada skill sigue el estándar oficial de Claude Code:

```yaml
---
name: nombre-del-skill
description: Descripción clara de qué hace y cuándo usarlo
metadata:
  author: ux-ui-skills
  version: "1.0"
  category: categoria
---

# Nombre del Principio

## Resumen
## Origen
## Fundamento Psicológico
## Aplicación en Diseño
## Ejemplos
## Anti-patterns
## Métricas
## Principios Relacionados
## Referencias
```

## 🔗 Referencias Principales

- [Nielsen Norman Group](https://www.nngroup.com/)
- [Laws of UX](https://lawsofux.com/)
- [Interaction Design Foundation](https://www.interaction-design.org/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/)

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

---

**Autor**: Sistema de Skills UX/UI para Claude Code  
**Versión**: 1.0  
**Última actualización**: 2025