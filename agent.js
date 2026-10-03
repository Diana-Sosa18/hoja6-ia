import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Base de datos simulada para citas
const appointments = {};

// Base de datos de FAQs
const faqs = {
  "¿Cuál es el horario de atención?":
    "Atendemos de lunes a viernes de 9:00 AM a 6:00 PM",
  "¿Cómo agendar una cita?":
    "Puede agendar una cita proporcionando su nombre, fecha y hora deseada",
  "¿Cuál es el costo de la consulta?": "El costo de la consulta es de Q250 por sesión",
  "¿Se ofrecen consultas virtuales?":
    "Sí, ofrecemos tanto consultas presenciales como virtuales",
  "¿Cuál es la política de cancelación?":
    "Se pueden cancelar citas con 24 horas de anticipación sin penalización",
};

// Herramientas disponibles
const tools = [
  {
    name: "schedule_appointment",
    description: "Agenda una nueva cita con los detalles del cliente",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nombre completo del cliente",
        },
        date: {
          type: "string",
          description: "Fecha de la cita (formato: YYYY-MM-DD)",
        },
        time: {
          type: "string",
          description: "Hora de la cita (formato: HH:MM)",
        },
        email: {
          type: "string",
          description: "Email del cliente",
        },
      },
      required: ["name", "date", "time", "email"],
    },
  },
  {
    name: "get_appointment",
    description: "Obtiene los detalles de una cita existente",
    input_schema: {
      type: "object",
      properties: {
        appointment_id: {
          type: "string",
          description: "ID de la cita (ej: APT_0001)",
        },
      },
      required: ["appointment_id"],
    },
  },
  {
    name: "list_appointments",
    description: "Lista todas las citas agendadas",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "answer_faq",
    description: "Responde preguntas frecuentes de los clientes",
    input_schema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "La pregunta del cliente",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "get_all_faqs",
    description:
      "Obtiene la lista completa de preguntas frecuentes y sus respuestas",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
];

// Implementación de herramientas
function scheduleAppointment(name, date, time, email) {
  try {
    const appointmentId = `APT_${String(Object.keys(appointments).length + 1).padStart(4, "0")}`;
    appointments[appointmentId] = {
      name,
      date,
      time,
      email,
      created_at: new Date().toISOString(),
    };
    return {
      success: true,
      message: "Cita agendada exitosamente",
      appointment_id: appointmentId,
      details: appointments[appointmentId],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function getAppointment(appointmentId) {
  if (appointments[appointmentId]) {
    return {
      success: true,
      appointment: appointments[appointmentId],
    };
  }
  return {
    success: false,
    error: `Cita ${appointmentId} no encontrada`,
  };
}

function listAppointments() {
  return {
    success: true,
    total: Object.keys(appointments).length,
    appointments,
  };
}

function answerFaq(question) {
  for (const [faqQ, faqA] of Object.entries(faqs)) {
    if (
      question.toLowerCase().includes(faqQ.toLowerCase()) ||
      faqQ.toLowerCase().includes(question.toLowerCase())
    ) {
      return {
        success: true,
        question: faqQ,
        answer: faqA,
      };
    }
  }
  return {
    success: false,
    error: "Pregunta no encontrada en la base de datos de FAQs",
  };
}

function getAllFaqs() {
  return {
    success: true,
    faqs,
  };
}

// Procesar llamadas a herramientas
function processToolCall(toolName, toolInput) {
  switch (toolName) {
    case "schedule_appointment":
      return scheduleAppointment(
        toolInput.name,
        toolInput.date,
        toolInput.time,
        toolInput.email
      );
    case "get_appointment":
      return getAppointment(toolInput.appointment_id);
    case "list_appointments":
      return listAppointments();
    case "answer_faq":
      return answerFaq(toolInput.question);
    case "get_all_faqs":
      return getAllFaqs();
    default:
      return { error: `Tool ${toolName} not found` };
  }
}

// Ejecutar el agente
async function runAgent(userMessage) {
  const systemPrompt = `Eres un asistente de servicio al cliente amable y eficiente.
Ayudas a los clientes a agendar citas y responder sus preguntas frecuentes.
Cuando un cliente quiera agendar una cita, extrae la información necesaria y usa la herramienta schedule_appointment.
Cuando tenga preguntas, usa la herramienta answer_faq para responder.
Sé amable, profesional y conciso en tus respuestas.`;

  const messages = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    // Si no hay tool use, retorna la respuesta final
    if (response.stop_reason === "end_turn") {
      const finalResponse = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
      return finalResponse;
    }

    // Procesa tool calls
    if (response.stop_reason === "tool_use") {
      // Agrega la respuesta del asistente
      messages.push({
        role: "assistant",
        content: response.content,
      });

      // Procesa cada tool call
      const toolResults = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          const toolResult = processToolCall(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(toolResult),
          });
        }
      }

      // Agrega los resultados de las herramientas
      messages.push({
        role: "user",
        content: toolResults,
      });
    } else {
      break;
    }
  }

  return "No se pudo procesar la solicitud";
}

// Exportar para uso en promptfoo
export { runAgent };

// Prueba directa
if (import.meta.url === `file://${process.argv[1]}`) {
  const testMessages = [
    "¿Cuál es el horario de atención?",
    "Quiero agendar una cita para el 2024-10-15 a las 14:30, mi nombre es Juan Pérez y mi email es juan@example.com",
    "¿Cuál es la política de cancelación?",
  ];

  for (const msg of testMessages) {
    console.log(`\nUsuario: ${msg}`);
    try {
      const response = await runAgent(msg);
      console.log(`Agente: ${response}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}
