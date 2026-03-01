/**
 * Provider API key validators.
 * Each validator makes a lightweight HTTP request to verify that the API key is valid.
 */

const TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

const validators = {
  async anthropic(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async openai(apiKey, baseUrl) {
    const url = baseUrl ? `${baseUrl.replace(/\/$/, "")}/v1/models` : "https://api.openai.com/v1/models";
    const res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async google(apiKey, _baseUrl) {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async perplexity(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      }),
    });
    // Even a 400 means the key is valid (model may differ)
    return { valid: res.status !== 401 && res.status !== 403, error: res.status === 401 || res.status === 403 ? `HTTP ${res.status}` : undefined };
  },

  async mistral(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.mistral.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async groq(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async deepseek(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.deepseek.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async together(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.together.xyz/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async fireworks(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.fireworks.ai/inference/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async cohere(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.cohere.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async openrouter(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async huggingface(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async xai(apiKey, _baseUrl) {
    const res = await fetchWithTimeout("https://api.x.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  async ollama(_apiKey, baseUrl) {
    const url = baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/tags` : "http://localhost:11434/api/tags";
    const res = await fetchWithTimeout(url);
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },

  // Generic fallback for providers with OpenAI-compatible API
  async _generic(apiKey, baseUrl) {
    if (!baseUrl) return { valid: false, error: "Base URL required" };
    const url = `${baseUrl.replace(/\/$/, "")}/v1/models`;
    const res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  },
};

/**
 * Validate a provider API key or access token.
 * @param {string} providerId - Provider identifier
 * @param {string} secret - API key or access token
 * @param {string} [baseUrl] - Optional custom base URL
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateProviderKey(providerId, secret, baseUrl) {
  try {
    const validator = validators[providerId] || validators._generic;
    return await validator(secret, baseUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("abort")) {
      return { valid: false, error: "Connection timeout" };
    }
    return { valid: false, error: message };
  }
}

module.exports = { validateProviderKey };
