import { runAgent } from "./agent.js";

export default class AgenteProvider {
  constructor(options = {}) {
    this.providerId = options.id || "agente-parachute";
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt) {
    try {
      const { respuesta, herramientas } = await runAgent(prompt);
      return { output: respuesta, metadata: { herramientas } };
    } catch (error) {
      return { error: error.message };
    }
  }
}
