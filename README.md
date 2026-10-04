# Hoja de Trabajo 6 - Evals

Evals con [promptfoo](https://www.promptfoo.dev/) para el agente de Parachute S.A. desarrollado en la hoja de trabajo 5. El agente cumple dos funciones:

- **Agendar citas** (`agendar_cita`, `consultar_cita`)
- **Responder preguntas frecuentes** (`buscar_faq`)

## Estructura

| Archivo | Contenido |
| --- | --- |
| `agent.js` | Agente con Claude y uso de herramientas. Devuelve la respuesta y el registro de herramientas llamadas. |
| `provider.js` | Provider personalizado de promptfoo que ejecuta el agente y expone las herramientas en `metadata`. |
| `promptfooconfig.yaml` | Casos de prueba y aserciones. |
| `reporte/` | Reporte generado por promptfoo (HTML y JSON). |

## Tipos de evals

| Tipo | Aserción de promptfoo | Qué valida |
| --- | --- | --- |
| Factuality | `factuality`, `llm-rubric` | La respuesta coincide con la información oficial y no inventa datos. |
| Determinísticos | `contains`, `icontains`, `contains-all`, `regex`, `not-regex` | Datos clave (Q250, Zona 10, 24 horas), formato del ID `APT_0000` y ausencia de confirmaciones indebidas. |
| Latencia | `latency` | Tiempo máximo de respuesta por caso (10 a 20 segundos). |
| Tool execution | `javascript` | Herramienta correcta, argumentos normalizados (fecha `YYYY-MM-DD`, hora `HH:MM`) y que no se agende sin datos completos. |

Los casos cubren preguntas frecuentes, una pregunta fuera de la base, citas con datos completos, fechas en lenguaje natural, datos faltantes, días no hábiles, horas fuera de horario y un mensaje que combina pregunta y cita.

## Ejecución

```bash
npm install
cp .env.example .env   # agregar ANTHROPIC_API_KEY
npm run eval           # genera reporte/reporte-promptfoo.html y .json
npm run view           # abre el visor web de promptfoo
```

Para probar el agente manualmente:

```bash
npm run agente -- "¿Cuál es el horario de atención?"
```
