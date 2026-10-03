import { runAgent } from './agent.js';
import fs from 'fs';
import path from 'path';

const tests = [
  {
    name: "FAQ - Horario de atención",
    prompt: "¿Cuál es el horario de atención?",
    assertions: [{ type: "contains", value: "9:00 AM" }]
  },
  {
    name: "FAQ - Costo de consulta",
    prompt: "¿Cuál es el costo de la consulta?",
    assertions: [{ type: "contains", value: "Q250" }]
  },
  {
    name: "FAQ - Consultas virtuales",
    prompt: "¿Se ofrecen consultas virtuales?",
    assertions: [{ type: "contains", value: "Sí" }]
  },
  {
    name: "FAQ - Política de cancelación",
    prompt: "¿Cuál es la política de cancelación?",
    assertions: [{ type: "contains", value: "24 horas" }]
  },
  {
    name: "Agendar cita - Verificar confirmación",
    prompt: "Quiero agendar una cita para el 2024-10-15 a las 14:30, mi nombre es Carlos García y mi email es carlos@example.com",
    assertions: [{ type: "regex", value: "(APT_|exitosamente|agendada)" }]
  },
  {
    name: "Agendar cita - Capturar todos los datos",
    prompt: "Por favor agenda una cita a nombre de María López para el 2024-11-20 a las 10:00, correo maria@example.com",
    assertions: [{ type: "contains", value: "cita" }]
  },
  {
    name: "Agendar cita - Respuesta con ID",
    prompt: "Necesito agendar cita el 2024-12-01 a las 15:45, soy Ana Martínez, ana@example.com",
    assertions: [{ type: "regex", value: "APT_" }]
  },
  {
    name: "Latencia - Respuesta rápida a FAQ",
    prompt: "¿Cuál es tu horario?",
    assertions: [{ type: "latency", value: 5000 }]
  },
  {
    name: "Latencia - Procesamiento rápido de cita",
    prompt: "Quiero agendar para el 2024-10-25 a las 16:00, soy Roberto Díaz, roberto@example.com",
    assertions: [{ type: "latency", value: 5000 }]
  },
  {
    name: "Edge case - Pregunta no en FAQs",
    prompt: "¿Cuál es el nombre del CEO?",
    assertions: [{ type: "contains", value: "no encontrada" }]
  },
  {
    name: "Edge case - Formato incorrecto",
    prompt: "Agendar cita para mañana a las 3pm, soy Juan, juan@test.com",
    assertions: [{ type: "contains", value: "cita" }]
  },
  {
    name: "Multiturn - Consulta y agendamiento",
    prompt: "Primero quiero saber ¿cuál es el horario?, y después agendar una cita para el 2024-10-30 a las 13:00, soy Sofia López, sofia@example.com",
    assertions: [{ type: "contains", value: "9:00 AM" }]
  }
];

function evaluateAssertion(output, assertion) {
  switch (assertion.type) {
    case "contains":
      return output.toLowerCase().includes(assertion.value.toLowerCase());
    case "regex":
      return new RegExp(assertion.value).test(output);
    case "latency":
      return true; // Checked separately
    default:
      return false;
  }
}

async function runTests() {
  console.log("🚀 Iniciando evaluación del agente...\n");

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Ejecutando: ${test.name}... `);

    const startTime = Date.now();
    const output = await runAgent(test.prompt);
    const latency = Date.now() - startTime;

    let testPassed = true;
    const failedAssertions = [];

    for (const assertion of test.assertions) {
      if (assertion.type === "latency") {
        if (latency > assertion.value) {
          testPassed = false;
          failedAssertions.push(`Latencia excedida: ${latency}ms > ${assertion.value}ms`);
        }
      } else {
        if (!evaluateAssertion(output, assertion)) {
          testPassed = false;
          failedAssertions.push(`Assertion falló: ${assertion.type} "${assertion.value}"`);
        }
      }
    }

    if (testPassed) {
      console.log("✅ PASS");
      passed++;
    } else {
      console.log("❌ FAIL");
      failed++;
    }

    results.push({
      name: test.name,
      prompt: test.prompt,
      output,
      latency,
      passed: testPassed,
      assertions: test.assertions,
      failedAssertions,
      timestamp: new Date().toISOString()
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log(`📊 REPORTE DE EVALUACIÓN`);
  console.log("=".repeat(70));
  console.log(`Total de tests: ${tests.length}`);
  console.log(`✅ Pasaron: ${passed}`);
  console.log(`❌ Fallaron: ${failed}`);
  console.log(`📈 Tasa de éxito: ${((passed / tests.length) * 100).toFixed(2)}%`);
  console.log("=".repeat(70) + "\n");

  // Guardar reporte JSON
  const reportData = {
    summary: {
      total: tests.length,
      passed,
      failed,
      successRate: ((passed / tests.length) * 100).toFixed(2)
    },
    tests: results,
    generatedAt: new Date().toISOString()
  };

  const reportPath = path.join(process.cwd(), 'evals-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`💾 Reporte guardado en: ${reportPath}\n`);

  // Mostrar fallos si los hay
  if (failed > 0) {
    console.log("⚠️ PRUEBAS FALLIDAS:\n");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`❌ ${r.name}`);
      r.failedAssertions.forEach(fa => console.log(`   - ${fa}`));
      console.log();
    });
  }

  return reportData;
}

runTests().catch(error => {
  console.error("Error durante la evaluación:", error);
  process.exit(1);
});
