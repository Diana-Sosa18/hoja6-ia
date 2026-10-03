# Hoja de Trabajo #5 y #6 - Agente de Servicio al Cliente con Evals

## Descripción

Agente inteligente de servicio al cliente en JavaScript que:
- **Funcionalidad 1:** Agenda citas con clientes
- **Funcionalidad 2:** Responde preguntas frecuentes (FAQs)

Evaluado usando **promptfoo** con múltiples tipos de pruebas:
- ✅ Factuality (Factualidad)
- ✅ Determinísticas (contains/regex)
- ✅ Latencia
- ✅ Tool execution (Verificación de llamadas a herramientas)

## Requisitos

- Node.js 16+
- API Key de Anthropic

## Instalación

```bash
npm install
npm install -g promptfoo
```

## Configuración

1. Crea un archivo `.env` con tu API key:
```bash
cp .env.example .env
# Edita .env y agrega tu ANTHROPIC_API_KEY
```

## Uso

### Ejecutar el agente directamente:
```bash
npm start
```

### Ejecutar evals con promptfoo:
```bash
npm test
```

### Ver reporte web:
```bash
npm run view
```

## Estructura del Proyecto

```
.
├── agent.js                 # Agente principal con herramientas
├── agent-wrapper.js        # Wrapper para promptfoo
├── promptfooconfig.yaml    # Configuración de evals
├── package.json            # Dependencias Node.js
├── .env.example            # Template de variables de entorno
├── .gitignore              # Archivos a ignorar
└── README.md               # Este archivo
```

## Herramientas del Agente

### schedule_appointment
Agenda una nueva cita con los siguientes parámetros:
- `name`: Nombre del cliente
- `date`: Fecha (YYYY-MM-DD)
- `time`: Hora (HH:MM)
- `email`: Email del cliente

### answer_faq
Responde preguntas frecuentes del cliente
- `question`: La pregunta a responder

### get_appointment
Obtiene detalles de una cita existente
- `appointment_id`: ID de la cita

### list_appointments
Lista todas las citas agendadas

### get_all_faqs
Obtiene la lista completa de FAQs

## Pruebas Implementadas

### Factuality (Factualidad)
- Verifica que las respuestas de FAQs contengan información correcta
- Valida datos específicos como horarios, precios, políticas

### Determinísticas
- **Contains:** Verifica que la respuesta contenga palabras clave
- **Regex:** Verifica patrones (ej: ID de cita APT_XXXX)

### Latencia
- Verifica que las respuestas se procesen en menos de 5 segundos
- Aplica a FAQs y agendamiento de citas

### Tool Execution
- Verifica que se usen las herramientas correctas
- Valida que el agente use `answer_faq` para preguntas
- Valida que el agente use `schedule_appointment` para agendar citas

## Ejemplos de Uso

```javascript
import { runAgent } from './agent.js';

// Ejemplo 1: Responder FAQ
const response1 = await runAgent("¿Cuál es el horario de atención?");

// Ejemplo 2: Agendar cita
const response2 = await runAgent(
  "Quiero agendar una cita para el 2024-10-15 a las 14:30, " +
  "mi nombre es Juan Pérez y mi email es juan@example.com"
);

// Ejemplo 3: Multi-turn
const response3 = await runAgent(
  "Primero ¿cuál es el costo? Después quiero agendar para el 2024-11-01 a las 10:00, " +
  "soy María García, maria@example.com"
);
```

## Resultados Esperados

Al ejecutar `npm test`, espera ver:

- ✅ Respuestas de FAQs que contengan información correcta
- ✅ Citas agendadas exitosamente con ID único
- ✅ Latencia menor a 5 segundos por solicitud
- ✅ Uso correcto de herramientas según el tipo de solicitud
- ✅ Manejo apropiado de preguntas no disponibles

## Notas

- El agente usa Claude 3.5 Sonnet como modelo base
- Las citas se almacenan en memoria (no se persisten entre ejecuciones)
- El agente mantiene contexto dentro de una conversación
- Desarrollado como módulo ES6 (import/export)