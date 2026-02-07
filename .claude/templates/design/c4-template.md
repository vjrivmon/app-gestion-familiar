# C4 Model Templates (Mermaid)

Usa estas plantillas para generar diagramas C4 en Mermaid.
Rellena los placeholders `[...]` con informacion del proyecto.

---

## Level 1: System Context

Muestra el sistema en su entorno: actores y sistemas externos.

```mermaid
C4Context
    title System Context Diagram - [Nombre del Sistema]

    Person(user, "[Actor Principal]", "[Descripcion del actor]")
    Person(admin, "[Actor Secundario]", "[Descripcion]")

    System(system, "[Nombre del Sistema]", "[Descripcion de lo que hace]")

    System_Ext(ext1, "[Sistema Externo 1]", "[Que servicio provee]")
    System_Ext(ext2, "[Sistema Externo 2]", "[Que servicio provee]")

    Rel(user, system, "[Accion principal]", "[Protocolo]")
    Rel(admin, system, "[Accion admin]", "[Protocolo]")
    Rel(system, ext1, "[Que consume]", "[Protocolo]")
    Rel(system, ext2, "[Que consume]", "[Protocolo]")
```

### Instrucciones Level 1:
- Incluir TODOS los actores humanos (roles distintos)
- Incluir TODOS los sistemas externos con los que se integra
- Las relaciones describen QUE hace, no COMO
- No incluir detalles tecnicos internos

---

## Level 2: Container Diagram

Muestra los contenedores tecnicos dentro del sistema.

```mermaid
C4Container
    title Container Diagram - [Nombre del Sistema]

    Person(user, "[Actor Principal]", "[Descripcion]")

    System_Boundary(system, "[Nombre del Sistema]") {
        Container(web, "[Web App]", "[Tecnologia]", "[Responsabilidad principal]")
        Container(api, "[API Server]", "[Tecnologia]", "[Responsabilidad principal]")
        Container(worker, "[Background Worker]", "[Tecnologia]", "[Responsabilidad principal]")
        ContainerDb(db, "[Database]", "[Tecnologia]", "[Que datos almacena]")
        ContainerDb(cache, "[Cache]", "[Tecnologia]", "[Que cachea]")
    }

    System_Ext(ext1, "[Sistema Externo]", "[Servicio]")

    Rel(user, web, "Usa", "HTTPS")
    Rel(web, api, "Llama", "HTTPS/JSON")
    Rel(api, db, "Lee/Escribe", "TCP")
    Rel(api, cache, "Cachea", "TCP")
    Rel(api, worker, "Encola trabajo", "Queue")
    Rel(worker, ext1, "Consume", "HTTPS")
```

### Instrucciones Level 2:
- Cada contenedor = un proceso desplegable independientemente
- Incluir tecnologia concreta (Next.js, FastAPI, PostgreSQL, Redis)
- Cada contenedor tiene UNA responsabilidad clara
- Bases de datos y caches son ContainerDb
- Relaciones incluyen protocolo de comunicacion

---

## Level 3: Component Diagram

Muestra componentes internos de UN contenedor. Solo necesario para contenedores complejos (>= 3 responsabilidades).

```mermaid
C4Component
    title Component Diagram - [Nombre del Contenedor]

    Container_Boundary(api, "[Nombre del Contenedor]") {
        Component(auth, "[Auth Module]", "[Tecnologia]", "[Autenticacion y autorizacion]")
        Component(users, "[User Service]", "[Tecnologia]", "[CRUD de usuarios]")
        Component(orders, "[Order Service]", "[Tecnologia]", "[Gestion de pedidos]")
        Component(notifications, "[Notification Service]", "[Tecnologia]", "[Envio de notificaciones]")
    }

    ContainerDb(db, "[Database]", "[Tecnologia]")
    System_Ext(email, "[Email Provider]", "[SendGrid/SES]")

    Rel(auth, users, "Valida usuarios")
    Rel(users, db, "Lee/Escribe", "SQL")
    Rel(orders, db, "Lee/Escribe", "SQL")
    Rel(notifications, email, "Envia emails", "HTTPS")
```

### Instrucciones Level 3:
- Solo diagramar si el contenedor tiene >= 3 componentes/modulos
- Un componente = un grupo logico de funcionalidad
- Mapea a modulos, servicios o clases principales del codigo
- NO diagramar contenedores simples (un CRUD basico no lo necesita)

---

## Cuando usar cada nivel

| Nivel | Siempre? | Audiencia | Detalle |
|-------|----------|-----------|---------|
| L1 Context | Si | Stakeholders, devs | Sistema como caja negra |
| L2 Container | Si | Devs, architects | Decisiones de tecnologia |
| L3 Component | Solo si >= 3 servicios | Devs implementando | Modulos internos |
| L4 Code | Nunca manual | -- | Se genera del codigo |

## Checklist

- [ ] L1: Todos los actores identificados?
- [ ] L1: Todos los sistemas externos listados?
- [ ] L2: Cada contenedor tiene tecnologia asignada?
- [ ] L2: Las relaciones incluyen protocolo?
- [ ] L3: Solo contenedores complejos diagramados?
- [ ] Nombres consistentes entre niveles?
