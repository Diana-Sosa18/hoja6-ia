import { runAgent } from "./agent.js";

// Wrapper para promptfoo
export async function run(input) {
  try {
    const prompt = input.vars?.prompt || "";
    const startTime = Date.now();

    const output = await runAgent(prompt);

    const latency = Date.now() - startTime;

    return {
      output,
      latency,
      tokens: {
        completion: 0,
        prompt: 0,
        total: 0,
      },
    };
  } catch (error) {
    return {
      output: "",
      error: error.message,
      latency: 0,
    };
  }
}
