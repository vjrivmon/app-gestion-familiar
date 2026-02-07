# Skill: LinkedIn Content Generator

## Activación

Este skill se activa cuando el usuario:
- Usa el comando `/linkedin-post`
- Solicita crear contenido para LinkedIn
- Menciona "post de LinkedIn", "publicación LinkedIn", "contenido profesional"

## Descripción

Genera contenido optimizado para LinkedIn basado en el perfil, proyectos y experiencia de Vicente Rivas Monferrer como Full-Stack AI Engineer.

## Sintaxis de Uso

```
/linkedin-post [tipo] [tema]
```

### Tipos disponibles:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `technical` | Post técnico sobre un proyecto o tecnología | "Mi experiencia con RAG" |
| `learning` | Reflexión sobre aprendizaje | "Lo que aprendí en el hackathon" |
| `showcase` | Presentación de proyecto | "Presentando Zyndra" |
| `opinion` | Opinión sobre tendencia/tema | "El futuro de los LLMs" |
| `milestone` | Celebración de logro | "Premio Telefónica LDU" |

### Ejemplos de invocación:

```
/linkedin-post technical "Cómo implementé RAG con ChromaDB"
/linkedin-post learning "Mi primer año desarrollando IA"
/linkedin-post showcase "NeuroSpot - detección de TDAH"
/linkedin-post opinion "RAG vs Fine-tuning"
/linkedin-post milestone "1er puesto en Telefónica LDU"
```

## Estructura de Posts

### Formato estándar (hook → contexto → valor → CTA):

```
🎯 [HOOK impactante - estadística o pregunta]

[2-3 líneas de contexto personal]

[3-5 bullets con el contenido de valor]

💬 [Pregunta para engagement]

#Hashtag1 #Hashtag2 #Hashtag3
```

## Datos del Perfil de Vicente

### Identidad Profesional
- **Título**: Full-Stack AI Engineer
- **Rol**: Cofundador @Zyndra
- **Logro destacado**: 1er Puesto Nacional Telefónica LDU 2025
- **Ubicación**: Valencia, España
- **Disponibilidad**: Remoto/híbrido

### Especialización en IA
- Sistemas RAG con ensemble de 4 LLMs (GPT-4, Claude, Llama, Mistral)
- Computer Vision con YOLOv8 (99.6% precisión, 80K+ imágenes)
- Evaluación con framework RAGAS (68+ benchmarks)
- LangChain, ChromaDB, OpenAI API, Anthropic API

### Cloud & DevOps
- AWS: Lambda, DynamoDB, Cognito, S3, EC2, Rekognition, CloudWatch
- Docker, CI/CD con GitHub Actions
- Google Cloud, Firebase, Redis
- Arquitecturas serverless

### Métricas de Impacto
- 94% accuracy en chatbot RAG (122K+ líneas de código)
- 99.9% uptime en sistemas de producción
- 90% reducción trabajo administrativo (100+ familias)
- 630K+ líneas de código en arquitectura serverless
- 99.6% precisión en detección de obstáculos (<100ms latencia)

### Proyectos Principales
1. **Chatbot RAG ONG DNI** - TFG, 94% accuracy, RAGAS evaluation
2. **NeuroSpot** - Plataforma TDAH, 8 servicios AWS, 630K+ LOC
3. **Zyndra/AidGuide** - Robot guía, YOLOv8, ROS2, 80K imágenes
4. **Osyris-Web** - Gestión scout, 105K+ LOC, 90% reducción admin
5. **TeamLens** - Sistema producción, 99.9% uptime
6. **GeneticAgent** - IA Catan, 40K partidas, 100% win rate
7. **MCP Smart Agent** - npm package, 440+ descargas

### Formación
- Grado Tecnologías Interactivas - UPV (2022-2026)
- Especialización IA Sostenibilidad - Cátedra ENIA-UPV
- Despliegue AWS - CFP-UPV (60h)
- Bootcamp DevOps - Código Facilito

## Hashtags Estratégicos

### Core (siempre incluir 2-3):
`#AI` `#MachineLearning` `#Python`

### Por tema:
- **IA**: `#RAG` `#LLM` `#ComputerVision` `#DeepLearning` `#NLP` `#LangChain`
- **Cloud**: `#AWS` `#Docker` `#DevOps` `#CloudComputing` `#Serverless`
- **General**: `#TechForGood` `#Startup` `#Valencia` `#UPV` `#JuniorDev`

## Templates por Tipo

### Template: Technical Post
```
[Métrica impactante o pregunta técnica]

[Contexto: qué problema resolviste]

La solución:
• [Tecnología/técnica 1 + resultado]
• [Tecnología/técnica 2 + resultado]
• [Tecnología/técnica 3 + resultado]

[Lección aprendida o takeaway]

¿[Pregunta técnica relacionada para engagement]?

#AI #[TechSpecifica] #Python #[CloudService]
```

### Template: Learning Journey Post
```
[Reflexión o momento clave]

[Hace X meses/años, estaba en situación Y]

[3-4 puntos de lo que aprendiste]

[Cómo te ha cambiado o qué harías diferente]

¿[Pregunta personal para conexión]?

#Learning #[TemaEspecifico] #JuniorDev #Growth
```

### Template: Project Showcase Post
```
[Nombre del proyecto + una línea de impacto]

El problema: [descripción del problema que resuelve]

Mi solución:
• [Característica 1]
• [Característica 2]
• [Característica 3]

Métricas:
• [Resultado cuantificable 1]
• [Resultado cuantificable 2]

[Link o llamada a la acción]

#[TechStack] #[Industria] #OpenSource
```

### Template: Opinion Post
```
[Opinión controversial o pregunta retórica]

[Tu perspectiva basada en experiencia]

Mis argumentos:
• [Punto 1]
• [Punto 2]
• [Punto 3]

[Matiz o contraargumento que reconoces]

¿Qué opinas tú sobre [tema]?

#AI #[TemaDebate] #Opinion #Tech
```

### Template: Milestone Post
```
🏆 [Logro concreto]

[Contexto: cómo llegaste ahí]

[2-3 puntos de lo que significó el proceso]

Agradecimientos: [personas/instituciones]

[Siguiente paso o aspiración]

#Achievement #[Contexto] #Grateful
```

## Mejores Horarios de Publicación

| Día | Hora óptima | Notas |
|-----|-------------|-------|
| Martes | 8:00 - 9:00 | Posts técnicos |
| Miércoles | 9:00 - 10:00 | Carruseles/visuales |
| Jueves | 8:30 - 9:30 | Learning journey |
| Viernes | 10:00 - 11:00 | Opinión/casual |

## Output del Skill

Al ejecutar `/linkedin-post`, el skill genera:

1. **Post formateado** - Listo para copiar y pegar
2. **Hashtags sugeridos** - Optimizados para alcance
3. **Sugerencia de imagen/carrusel** - Ideas visuales
4. **Mejor horario** - Cuándo publicar
5. **Variantes** - 2-3 alternativas de hook

## Notas de Estilo para Vicente

- **Tono**: Profesional pero cercano, entusiasta sin ser excesivo
- **Idioma principal**: Español (con términos técnicos en inglés)
- **Emojis**: Usar con moderación, máximo 3-4 por post
- **Longitud**: 150-300 palabras (ideal para engagement)
- **Primera persona**: Siempre ("Desarrollé", "Aprendí", "Mi experiencia")
- **Evitar**: Superlativos vacíos, clickbait excesivo, humblebragging

## Archivo de Referencia

El contenido completo del perfil LinkedIn se encuentra en:
`/linkedin/` - Todos los textos listos para copiar
`/files/cv_vicente_rivas_*.tex` - CV con información detallada
