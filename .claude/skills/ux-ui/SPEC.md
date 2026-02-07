# Catálogo completo de leyes UX/UI como SKILLS de Claude Code

Este informe presenta **50+ leyes, principios y heurísticas de UX/UI** estructuradas como skills invocables por agentes de Claude Code. El formato sigue el estándar oficial de Agent Skills publicado por Anthropic en diciembre 2025, con YAML frontmatter y contenido Markdown progresivo.

## Arquitectura del sistema de SKILLS

Claude Code utiliza **model-invoked discovery**: los agentes leen automáticamente los campos `name` y `description` de cada skill (~100 tokens cada uno) y cargan el contenido completo solo cuando es relevante. Esto optimiza el contexto mientras mantiene acceso a conocimiento especializado.

### Estructura de directorios propuesta

```
~/.claude/skills/ux-ui/
├── README.md                           # Índice y guía de uso
│
├── heuristics/
│   ├── nielsen-visibility/SKILL.md
│   ├── nielsen-match-real-world/SKILL.md
│   ├── nielsen-user-control/SKILL.md
│   ├── nielsen-consistency/SKILL.md
│   ├── nielsen-error-prevention/SKILL.md
│   ├── nielsen-recognition-recall/SKILL.md
│   ├── nielsen-flexibility/SKILL.md
│   ├── nielsen-minimalist-design/SKILL.md
│   ├── nielsen-error-recovery/SKILL.md
│   └── nielsen-help-documentation/SKILL.md
│
├── cognitive-laws/
│   ├── fitts-law/SKILL.md
│   ├── hicks-law/SKILL.md
│   ├── millers-law/SKILL.md
│   ├── jakobs-law/SKILL.md
│   ├── teslers-law/SKILL.md
│   ├── postels-law/SKILL.md
│   └── doherty-threshold/SKILL.md
│
├── gestalt/
│   ├── proximity/SKILL.md
│   ├── similarity/SKILL.md
│   ├── continuity/SKILL.md
│   ├── closure/SKILL.md
│   ├── figure-ground/SKILL.md
│   ├── common-fate/SKILL.md
│   ├── common-region/SKILL.md
│   ├── uniform-connectedness/SKILL.md
│   ├── pragnanz/SKILL.md
│   ├── symmetry/SKILL.md
│   └── past-experience/SKILL.md
│
├── behavioral-effects/
│   ├── von-restorff-effect/SKILL.md
│   ├── zeigarnik-effect/SKILL.md
│   ├── peak-end-rule/SKILL.md
│   ├── goal-gradient-effect/SKILL.md
│   ├── endowment-effect/SKILL.md
│   ├── serial-position-effect/SKILL.md
│   ├── mere-exposure-effect/SKILL.md
│   ├── aesthetic-usability-effect/SKILL.md
│   ├── anchoring-effect/SKILL.md
│   └── paradox-of-choice/SKILL.md
│
├── perception/
│   ├── weber-fechner-law/SKILL.md
│   ├── banner-blindness/SKILL.md
│   ├── change-blindness/SKILL.md
│   ├── inattentional-blindness/SKILL.md
│   └── cognitive-load/SKILL.md
│
├── design-principles/
│   ├── affordances/SKILL.md
│   ├── progressive-disclosure/SKILL.md
│   ├── consistency-principle/SKILL.md
│   ├── feedback-principle/SKILL.md
│   ├── constraints-principle/SKILL.md
│   ├── mapping-principle/SKILL.md
│   ├── occams-razor/SKILL.md
│   ├── kiss-principle/SKILL.md
│   ├── poka-yoke/SKILL.md
│   ├── least-astonishment/SKILL.md
│   ├── direct-manipulation/SKILL.md
│   └── pareto-principle/SKILL.md
│
├── frameworks/
│   ├── ux-honeycomb/SKILL.md
│   ├── emotional-design/SKILL.md
│   ├── universal-design/SKILL.md
│   ├── inclusive-design/SKILL.md
│   └── trust-credibility/SKILL.md
│
├── accessibility/
│   ├── wcag-perceivable/SKILL.md
│   ├── wcag-operable/SKILL.md
│   ├── wcag-understandable/SKILL.md
│   └── wcag-robust/SKILL.md
│
└── anti-patterns/
    └── dark-patterns/SKILL.md
```

---

## Formato oficial de SKILL.md

Cada skill requiere YAML frontmatter con campos específicos:

```yaml
---
name: nombre-del-skill          # Max 64 chars, lowercase, hyphens
description: Descripción clara de qué hace el skill y cuándo usarlo.
license: MIT                    # Opcional
metadata:
  author: tu-organizacion
  version: "1.0"
  category: ux-ui
---
```

El contenido Markdown debe mantenerse **bajo 500 líneas** usando progressive disclosure hacia archivos de referencia.

---

## Catálogo completo de leyes y principios

### 1. Heurísticas de Nielsen (1994)

Las **10 heurísticas de usabilidad** de Jakob Nielsen son el framework más citado para evaluación de interfaces. Origen: Nielsen Norman Group, refinadas en 2020.

| # | Heurística | Definición esencial |
|---|------------|---------------------|
| 1 | **Visibilidad del estado** | El sistema informa constantemente qué está ocurriendo con feedback apropiado y oportuno |
| 2 | **Coincidencia sistema-mundo real** | Usa lenguaje y conceptos familiares para usuarios, no jerga técnica |
| 3 | **Control y libertad del usuario** | Proporciona "salidas de emergencia" claras: deshacer, cancelar, volver |
| 4 | **Consistencia y estándares** | Sigue convenciones de plataforma e industria; mismas palabras = mismas acciones |
| 5 | **Prevención de errores** | Diseña para evitar errores antes de que ocurran, no solo para recuperarse |
| 6 | **Reconocimiento sobre recuerdo** | Minimiza carga de memoria: opciones visibles, no requiere recordar información |
| 7 | **Flexibilidad y eficiencia** | Provee atajos para expertos sin afectar a novatos |
| 8 | **Diseño estético y minimalista** | Elimina información irrelevante; cada elemento compite por atención |
| 9 | **Recuperación de errores** | Mensajes en lenguaje claro, indican el problema y sugieren solución |
| 10 | **Ayuda y documentación** | Documentación accesible, orientada a tareas, con pasos concretos |

**Fundamento psicológico**: Reducción de carga cognitiva, modelos mentales, teoría del aprendizaje.

---

### 2. Leyes cognitivas fundamentales

#### Ley de Fitts (1954)
**Autor**: Paul Morris Fitts | **Fórmula**: T = a + b × log₂(2D/W)

El tiempo para alcanzar un objetivo es función de la distancia y el tamaño del objetivo. **Targets más grandes y cercanos** son más rápidos de alcanzar.

- Botones mínimos: **44×44px** (Apple) / **48×48dp** (Google)
- Bordes de pantalla son "targets infinitos" para mouse
- Menús circulares (pie menus) son más eficientes que lineales

#### Ley de Hick-Hyman (1952)
**Autores**: William Hick, Ray Hyman | **Fórmula**: RT = a + b × log₂(n)

El tiempo de decisión aumenta logarítmicamente con el número de opciones. **Menos opciones = decisiones más rápidas**.

- Limitar navegación a ~7 categorías principales
- Usar progressive disclosure para opciones avanzadas
- Resaltar opciones recomendadas
- Netflix agrupa contenido en 6-7 categorías visibles

#### Ley de Miller (1956)
**Autor**: George A. Miller | **Límite**: 7±2 chunks (investigación reciente sugiere **4±1**)

La memoria de trabajo retiene aproximadamente 7 elementos simultáneamente. La información debe **chunkearse** en grupos significativos.

- Formatear números: (123) 456-7890
- Limitar opciones por pantalla
- Agrupar campos de formulario lógicamente
- Usar whitespace para separar chunks visuales

#### Ley de Jakob (2000)
**Autor**: Jakob Nielsen

Los usuarios pasan la mayor parte del tiempo en **otros sitios**, por lo que esperan que tu sitio funcione igual que los que ya conocen.

- Carrito de compras arriba-derecha
- Logo que enlaza a homepage arriba-izquierda
- Icono de hamburguesa para menús móviles
- YouTube permitió preview antes de rediseño completo

#### Ley de Tesler (1980s)
**Autor**: Larry Tesler | **Alias**: Conservación de la Complejidad

Toda aplicación tiene una cantidad irreducible de complejidad. La pregunta es: **¿quién la maneja - el usuario, el desarrollador, o la plataforma?**

- Auto-formateo de fechas y teléfonos
- Smart defaults que anticipan necesidades
- Complejidad absorbida por el sistema, no expuesta al usuario

#### Ley de Postel (1980)
**Autor**: Jon Postel | **Origen**: RFC 761 (TCP)

"Sé **liberal en lo que aceptas**, conservador en lo que envías." Acepta variaciones de input, produce output consistente.

- Google corrige errores ortográficos ("Did you mean...?")
- Formularios que aceptan múltiples formatos de fecha
- Validación flexible con normalización interna

#### Umbral de Doherty (1982)
**Autores**: Walter Doherty, Ahrvind Thadani

La productividad aumenta dramáticamente cuando la respuesta del sistema es **<400ms**. Nielsen refinó: **0.1s** = instantáneo, **1s** = flujo, **10s** = atención perdida.

- Feedback visual inmediato en cada interacción
- Skeleton screens durante carga
- Optimistic UI updates antes de confirmación del servidor
- Google INP metric: ≤200ms es "bueno"

---

### 3. Leyes de Gestalt (1912-1923)

Fundadores: Max Wertheimer, Kurt Koffka, Wolfgang Köhler. Principio central: **"El todo es diferente de la suma de sus partes."**

| Ley | Definición | Aplicación UX |
|-----|------------|---------------|
| **Proximidad** | Elementos cercanos se perciben como grupo | Agrupar campos relacionados, spacing consistente |
| **Similitud** | Elementos similares se perciben como relacionados | Estilos consistentes para misma función, color-coding |
| **Continuidad** | El ojo sigue líneas y curvas naturalmente | Progress indicators, timelines, breadcrumbs |
| **Cierre** | La mente completa formas incompletas | Logos minimalistas (WWF), carruseles parciales |
| **Figura-Fondo** | Separamos figura del fondo instintivamente | Modales con overlay, contraste de CTAs |
| **Destino común** | Elementos que se mueven juntos se perciben como grupo | Animaciones coordinadas, hover states grupales |
| **Región común** | Elementos dentro de un borde se agrupan | Cards, form sections, navigation regions |
| **Conexión uniforme** | Elementos conectados visualmente se relacionan | Flowcharts, data viz, form groupings |
| **Prägnanz** | El cerebro busca la interpretación más simple | Diseño minimalista, iconografía clara |
| **Simetría** | Buscamos balance y orden visual | Layouts centrados, grids, alignment |
| **Experiencia pasada** | Interpretamos según experiencia previa | Convenciones establecidas, íconos familiares |

**Jerarquía de fuerza** (más fuerte → menos): Conexión uniforme > Región común > Proximidad > Similitud > Continuidad > Cierre

---

### 4. Efectos conductuales y sesgos cognitivos

#### Efecto Von Restorff (1933)
**Autora**: Hedwig von Restorff

Entre elementos similares, el **distintivo se recuerda mejor**. El cerebro asigna más recursos a estímulos inusuales.

- CTAs con color contrastante
- Plan "recomendado" destacado en pricing tables
- Netflix usa rojo consistente para elementos clicables
- **Anti-pattern**: Demasiados elementos destacados compiten entre sí

#### Efecto Zeigarnik (1927)
**Autora**: Bluma Zeigarnik

Las **tareas incompletas se recuerdan mejor** que las completadas. La tensión cognitiva mantiene la información activa.

- Progress bars de perfil ("70% completado")
- Badges de notificaciones pendientes
- Gamificación con logros parciales
- Cart abandonment emails efectivos

#### Regla Peak-End (1993)
**Autor**: Daniel Kahneman

Juzgamos experiencias por su **momento más intenso y su final**, no por el promedio. La duración importa menos de lo esperado.

- Celebraciones después de completar tareas (Mailchimp)
- Checkout experiences memorables
- Recuperación elegante de errores
- Enterprise Rent-A-Car: despedida amigable

#### Efecto Goal-Gradient (1932)
**Autor**: Clark Hull

La motivación **aumenta con la proximidad a la meta**. Kivetz (2006) confirmó en comportamiento de consumidores.

- Loyalty cards con progreso visible
- "16 estrellas para tu próxima recompensa"
- Progress bars en checkout
- **Endowed progress**: dar head-start aumenta engagement

#### Efecto Dotación (Endowment) (1980)
**Autor**: Richard Thaler

Valoramos más lo que **poseemos o percibimos como nuestro**. Pérdida de propiedad pesa más que ganancia equivalente.

- Free trials crean sensación de propiedad
- Personalización de perfiles
- "Tus" listas, favoritos, colecciones
- Money-back guarantees reducen fricción

#### Efecto de Posición Serial (Ebbinghaus, 1885)
Recordamos mejor los elementos **al principio (primacía) y al final (recencia)** de una secuencia.

- Información clave al inicio y final de páginas
- Navegación: items más importantes primero y último
- Amazon: contenido personalizado arriba y abajo

#### Efecto de Mera Exposición (1968)
**Autor**: Robert Zajonc

La familiaridad genera preferencia. **Repetición** (incluso subliminal) aumenta el agrado.

- Branding consistente
- Retargeting publicitario (70% mayor conversión)
- Design patterns familiares
- **Excepción crítica**: solo funciona si el estímulo inicial es neutral o positivo

#### Efecto Estético-Usabilidad (1995)
**Autores**: Masaaki Kurosu, Kaori Kashimura

Los usuarios perciben interfaces **atractivas como más usables**, incluso con usabilidad idéntica o inferior.

- Visual polish importa para percepción de calidad
- Primeras impresiones determinan percepciones a largo plazo
- **Límite**: estética no compensa problemas severos de usabilidad

---

### 5. Principios de diseño de interacción

#### Affordances (Gibson 1979, Norman 1988)
Las **posibilidades de acción** que un objeto sugiere. Norman distingue affordances reales de **signifiers** (señales que comunican la affordance).

- Botones con sombra sugieren "presionabilidad"
- Scroll bars indican contenido scrollable
- Campos de texto con cursor parpadeante
- **Anti-pattern**: Flat design sin indicadores de interacción

#### Progressive Disclosure (Nielsen 1995)
Revelar información y opciones **gradualmente**, mostrando solo lo esencial inicialmente.

- "Opciones avanzadas" bajo expand
- Wizards multi-paso
- Acordeones para FAQs
- Tabs para categorizar contenido denso

#### Principio de Constraints (Norman 1988)
**Restringir interacciones** para prevenir errores y guiar acciones correctas.

- Tipos: Physical, Logical, Cultural, Semantic
- Deshabilitar botones hasta completar prerequisitos
- Date pickers que previenen fechas inválidas
- Input masks para formatos específicos

#### Principio de Mapping (Norman 1988)
La relación entre controles y efectos debe ser **espacialmente lógica y clara**.

- Controles de estufa alineados con quemadores
- Scroll bars posicionados donde está el contenido
- Volume sliders: derecha = más fuerte
- **Anti-pattern**: Controles en fila para quemadores en cuadrícula

#### Poka-Yoke (Shingo, 1960s)
Diseño que **hace imposible o inmediatamente detectable** cometer errores.

- USB-C funciona en cualquier orientación
- Confirmación antes de acciones destructivas
- Auto-save para prevenir pérdida de datos
- Validación en tiempo real de formularios

#### Principio de Menor Asombro (1967)
El sistema debe comportarse como **la mayoría de usuarios esperarían**. Sorpresas = fricción cognitiva.

- F1 abre ayuda en Windows universalmente
- Ctrl+Z deshace en cualquier aplicación
- Carrito arriba-derecha en e-commerce
- **Anti-pattern**: Gestos no estándares para acciones comunes

---

### 6. Frameworks de UX

#### UX Honeycomb de Peter Morville (2004)
Siete facetas de experiencia de usuario valiosa:

1. **Useful** - Resuelve necesidades reales
2. **Usable** - Fácil de usar y aprender
3. **Desirable** - Atractivo emocionalmente
4. **Findable** - Contenido localizable
5. **Accessible** - Usable por todos
6. **Credible** - Genera confianza
7. **Valuable** - Entrega valor a usuarios y negocio

#### Diseño Emocional de Don Norman (2004)
Tres niveles de respuesta emocional al diseño:

| Nivel | Procesamiento | Enfoque | Ejemplo |
|-------|---------------|---------|---------|
| **Visceral** | Automático, subconsciente | Apariencia, primera impresión | iPhone: deseo inmediato al verlo |
| **Behavioral** | Subconsciente, uso | Función, usabilidad, performance | Google Search: eficiencia perfecta |
| **Reflective** | Consciente, reflexión | Significado, identidad, recuerdos | Nike: vende estilo de vida |

#### 7 Principios de Diseño Universal (1997)
**Autor**: Ronald L. Mace, NC State University

1. **Uso equitativo** - Útil para personas con diversas capacidades
2. **Flexibilidad** - Acomoda preferencias y habilidades
3. **Simple e intuitivo** - Fácil independiente de experiencia
4. **Información perceptible** - Comunica efectivamente en cualquier condición
5. **Tolerancia al error** - Minimiza consecuencias de errores
6. **Bajo esfuerzo físico** - Uso eficiente y cómodo
7. **Tamaño y espacio apropiados** - Accesible desde cualquier postura

#### Diseño Inclusivo de Microsoft (2015, actualizado 2022)

**Tres principios**:
1. **Reconocer exclusión** - Puntos de exclusión son oportunidades de innovación
2. **Aprender de la diversidad** - Co-crear con comunidades diversas
3. **Resolver para uno, extender a muchos** - Diseñar para edge cases beneficia a todos

**Persona Spectrum**: Permanente → Temporal → Situacional
- Un brazo → Brazo enyesado → Padre sosteniendo bebé
- Los curb cuts diseñados para sillas de ruedas benefician carritos, maletas, bicicletas

---

### 7. Accesibilidad WCAG 2.2 (2023)

Los cuatro principios **POUR**:

#### Perceptible
- Alt text para imágenes
- Captions para video/audio
- Contraste mínimo **4.5:1** (AA), 7:1 (AAA)
- No depender solo de color

#### Operable
- Todo accesible por teclado
- Sin trampas de teclado
- Touch targets mínimo **44×44px**
- No contenido que parpadee >3 veces/segundo

#### Comprensible
- Idioma declarado en HTML
- Navegación consistente
- Identificación y sugerencias de errores
- Labels para todos los inputs

#### Robusto
- HTML/CSS válido
- ARIA usado correctamente
- Compatible con tecnologías asistivas

---

### 8. Dark Patterns a evitar

**Creador del término**: Harry Brignull (2010) | **Estado legal**: Muchos ahora ilegales bajo GDPR, FTC Act

| Pattern | Descripción | Consecuencia legal |
|---------|-------------|-------------------|
| **Bait and Switch** | Cambiar términos después de compromiso | Fraude |
| **Confirmshaming** | Culpa para forzar aceptación | Multas GDPR |
| **Roach Motel** | Fácil entrar, difícil salir | FTC demandó a Amazon |
| **Hidden Costs** | Cargos revelados tarde en checkout | Regulación FTC |
| **Forced Continuity** | Cargo automático sin aviso claro | Multas millonarias |
| **Misdirection** | Diseño que distrae de opciones | Prácticas engañosas |
| **Preselection** | Opciones no deseadas pre-marcadas | GDPR violations |

**Multas recientes**: Google €170M (Francia), Epic Games $245M, Meta €68M

---

## Templates de SKILL.md

### Template base

```markdown
---
name: nombre-principio
description: [Qué hace] y [cuándo usarlo]. Use cuando diseñe [contexto específico].
metadata:
  author: ux-ui-skills
  version: "1.0"
  category: [heuristics|cognitive-laws|gestalt|behavioral|perception|design-principles|frameworks|accessibility]
---

# [Nombre del Principio]

## Resumen
[2-3 oraciones con la esencia del principio]

## Origen
- **Autor**: [Nombre]
- **Año**: [Año]
- **Fuente**: [Publicación original]

## Fundamento psicológico
[Por qué funciona a nivel cognitivo/perceptual]

## Aplicación en diseño
1. [Aplicación específica 1]
2. [Aplicación específica 2]
3. [Aplicación específica 3]

## Ejemplos
- [Ejemplo concreto con producto/contexto]
- [Ejemplo concreto con producto/contexto]

## Anti-patterns
- ❌ [Qué NO hacer]
- ❌ [Qué NO hacer]

## Métricas
- [Métrica cuantificable 1]
- [Métrica cuantificable 2]

## Principios relacionados
- [[nombre-principio-1]]
- [[nombre-principio-2]]

## Referencias
- [Fuente académica o profesional]
```

### Ejemplo completo: Ley de Fitts

```markdown
---
name: fitts-law
description: Optimiza tiempo de interacción calculando relación entre distancia y tamaño de targets. Use cuando diseñe botones, menús, touch targets, o cualquier elemento interactivo.
metadata:
  author: ux-ui-skills
  version: "1.0"
  category: cognitive-laws
---

# Ley de Fitts

## Resumen
El tiempo para alcanzar un objetivo es función del logaritmo de la distancia dividida por el tamaño del target. Targets más grandes y cercanos al punto de partida son más rápidos de alcanzar.

## Origen
- **Autor**: Paul Morris Fitts
- **Año**: 1954
- **Fuente**: "The information capacity of the human motor system in controlling the amplitude of movement," Journal of Experimental Psychology

## Fórmula
```
T = a + b × log₂(2D/W)
```
- T = Tiempo de movimiento
- D = Distancia al target
- W = Ancho del target
- a, b = Constantes del dispositivo

## Fundamento psicológico
El movimiento humano tiene dos fases: inicial (rápido, grueso) y final (lento, preciso). Targets pequeños requieren más tiempo en la fase de precisión. La relación logarítmica refleja la capacidad de procesamiento del sistema motor.

## Aplicación en diseño

### Tamaño de targets
- Mínimo touch: **44×44px** (Apple) / **48×48dp** (Material)
- Área clicable debe incluir todo el elemento, no solo texto/icono
- Botones primarios más grandes que secundarios

### Distancia
- CTAs cerca del contenido relacionado
- Acciones frecuentes en "prime pixel" (posición actual del cursor)
- Considerar "thumb zone" en móvil

### Bordes de pantalla
- Los bordes son "targets infinitos" para mouse (no requieren precisión vertical)
- Menú bar de macOS aprovecha borde superior
- Taskbar de Windows aprovecha borde inferior

### Menús
- Pie menus son más eficientes (equidistantes)
- Mega menus mejor que listas largas lineales
- Items frecuentes más cerca del trigger

## Ejemplos
- **Apple menu bar**: Anclado al borde superior, target infinito
- **Floating Action Button**: Grande, posición thumb-friendly
- **Amazon "Buy Now"**: Botón prominente cerca de descripción
- **Spotify context menu**: Aparece cerca del click derecho

## Anti-patterns
- ❌ Botones pequeños para acciones importantes
- ❌ Submit alejado de campos de formulario
- ❌ Touch targets que solo incluyen el icono, no el label
- ❌ Menús lineales largos cuando pie menu funcionaría
- ❌ Acciones críticas en esquinas opuestas al flujo

## Métricas
- **Tiempo de movimiento** (ms)
- **Index of Difficulty**: ID = log₂(2D/W) bits
- **Throughput**: bits/segundo
- **Tasa de error**: misclicks por interacción
- **Heatmaps**: distribución de clicks vs target

## Principios relacionados
- [[millers-law]] - Chunking reduce targets necesarios
- [[hicks-law]] - Menos opciones = menos targets
- [[nielsen-minimalist-design]] - Diseño limpio permite targets claros
- [[proximity]] - Targets relacionados deben estar cerca

## Referencias
- Fitts, P.M. (1954). Journal of Experimental Psychology
- MacKenzie, I.S. & Buxton, W. (1992). CHI '92
- Apple Human Interface Guidelines
- Material Design Guidelines
```

---

## Cómo los agentes invocan skills

Los skills se invocan **automáticamente** cuando Claude detecta relevancia:

```
Usuario: "Estoy diseñando una tabla de precios con 3 planes"

[Claude lee descriptions de skills disponibles]
[Detecta relevancia de: anchoring-effect, von-restorff-effect, hicks-law]
[Invoca Skill tool para cargar contenido completo]
[Aplica principios en su respuesta]
```

### Configurar subagentes con skills

```yaml
# .claude/agents/ux-reviewer/AGENT.md
---
name: ux-reviewer
description: Revisa interfaces aplicando principios de UX/UI
skills: fitts-law, hicks-law, nielsen-consistency, gestalt-proximity
---
```

---

## Implementación recomendada

### Paso 1: Crear estructura base
```bash
mkdir -p ~/.claude/skills/ux-ui/{heuristics,cognitive-laws,gestalt,behavioral-effects,perception,design-principles,frameworks,accessibility,anti-patterns}
```

### Paso 2: Poblar skills prioritarios
Comenzar con los de mayor impacto:
1. Las 10 heurísticas de Nielsen
2. Fitts, Hick, Miller, Jakob
3. Gestalt principales (proximidad, similitud, cierre)
4. Von Restorff, Peak-End, Zeigarnik
5. Affordances, Progressive Disclosure

### Paso 3: Crear README índice
```markdown
# UX/UI Skills para Claude Code

## Uso
Estos skills se activan automáticamente cuando trabajas en:
- Diseño de interfaces
- Revisión de usabilidad
- Arquitectura de información
- Optimización de conversión

## Categorías
- `/heuristics/` - Heurísticas de Nielsen
- `/cognitive-laws/` - Fitts, Hick, Miller, etc.
- `/gestalt/` - Principios de percepción visual
...
```

### Paso 4: Integrar con flujos de trabajo
Los skills funcionan agnósticos de stack - aplican igual a:
- Web (React, Vue, Angular, HTML/CSS)
- Mobile (iOS, Android, Flutter, React Native)
- Desktop (Electron, native)
- Design tools (Figma, Sketch)

---

## Resumen de cobertura

Este catálogo incluye **54 principios** organizados en 9 categorías:

| Categoría | Cantidad | Ejemplos clave |
|-----------|----------|----------------|
| Heurísticas Nielsen | 10 | Visibility, Consistency, Error Prevention |
| Leyes cognitivas | 7 | Fitts, Hick, Miller, Jakob, Tesler, Postel, Doherty |
| Gestalt | 11 | Proximity, Similarity, Closure, Prägnanz |
| Efectos conductuales | 10 | Von Restorff, Zeigarnik, Peak-End, Goal-Gradient |
| Percepción | 5 | Weber-Fechner, Banner Blindness, Cognitive Load |
| Principios de diseño | 12 | Affordances, Progressive Disclosure, Poka-Yoke |
| Frameworks | 5 | UX Honeycomb, Emotional Design, Inclusive Design |
| Accesibilidad | 4 | WCAG POUR principles |
| Anti-patterns | 1 | Dark Patterns comprehensive |

Cada skill incluye: nombre oficial, alternativas, definición completa, origen/autor/año, fundamento psicológico, aplicaciones concretas, ejemplos, anti-patterns, métricas, relaciones y referencias académicas.

El sistema está diseñado para **escalabilidad**: nuevos principios pueden agregarse siguiendo el template base, y los agentes los descubrirán automáticamente a través del mecanismo de model-invoked discovery de Claude Code.