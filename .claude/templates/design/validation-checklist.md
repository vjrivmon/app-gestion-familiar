# Validation Checklist - [Nombre del Proyecto]

Fecha: YYYY-MM-DD
Estado: [ ] Pendiente | [ ] Aprobado | [ ] Requiere cambios

---

## C4 Architecture

- [ ] **C4 Context**: Todos los actores y sistemas externos identificados
- [ ] **C4 Containers**: Cada contenedor tiene tecnologia y responsabilidad clara
- [ ] **C4 Components**: Diagramado para contenedores con >= 3 modulos (o justificado por que no)
- [ ] **Consistencia**: Nombres de contenedores iguales en L1, L2 y L3

## UML Diagrams

- [ ] **Use Cases**: Cubren todos los requisitos funcionales del SPEC
- [ ] **Sequences**: Flujos criticos diagramados (login, CRUD principal, integraciones)
- [ ] **Class Diagram**: Entidades del dominio con atributos y relaciones

## User Flows

- [ ] **Happy Path**: Cada flujo critico tiene diagrama completo
- [ ] **Edge Cases**: 5 preguntas respondidas por cada flujo:
  - [ ] Empty state (datos vacios)
  - [ ] Network error (error de red)
  - [ ] Authorization (sin permisos)
  - [ ] Validation (datos invalidos)
  - [ ] Interruption (interrupcion)
- [ ] **UI Mapping**: Cada nodo del flujo mapeado a componente/pantalla

## Domain Model (DDD)

- [ ] **Bounded Contexts**: Definidos y delimitados
- [ ] **Aggregates**: Identificados con raiz de agregado clara
- [ ] **Ubiquitous Language**: Glosario con >= 10 terminos del dominio
- [ ] **Relaciones entre contextos**: Tipo de relacion documentado (Shared Kernel, Customer-Supplier, etc.)

## Architecture Decision Records

- [ ] **ADRs**: Al menos 1 por decision tecnologica significativa
- [ ] **Alternativas**: Cada ADR incluye alternativas consideradas
- [ ] **Consecuencias**: Positivas, negativas y riesgos documentados

## Cross-Cutting

- [ ] **Consistencia de nombres**: Diagramas, glosario y ADRs usan los mismos terminos
- [ ] **Viabilidad**: Cada contenedor del C4 tiene libreria/servicio concreto asignado
- [ ] **SPEC alignment**: Todos los requisitos del SPEC estan cubiertos en al menos un artefacto
- [ ] **DESIGN-SUMMARY.md**: Generado con links a todos los artefactos

---

## Resultado

| Area | Estado | Notas |
|------|--------|-------|
| C4 | [ ] OK / [ ] Falta | |
| UML | [ ] OK / [ ] Falta | |
| Flows | [ ] OK / [ ] Falta | |
| Domain | [ ] OK / [ ] Falta | |
| ADRs | [ ] OK / [ ] Falta | |
| Cross-Cutting | [ ] OK / [ ] Falta | |

**Decision**: [ ] Listo para codigo | [ ] Requiere iteracion
