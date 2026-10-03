import { runAgent } from './agent.js';

export default async function runTest(prompt) {
  try {
    const startTime = Date.now();
    const output = await runAgent(prompt);
    const latency = Date.now() - startTime;

    return {
      output,
      latency,
      cost: 0,
      totalTokens: 0,
    };
  } catch (error) {
    return {
      output: '',
      error: error.message,
    };
  }
}
