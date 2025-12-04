// src/services/aiService.js
/**
 * Stub AI service – just echoes the user's prompt.
 * Replace with a real provider (Anthropic, OpenAI) when you have API keys.
 */
async function generateResponse({ prompt }) {
  // Simulate latency
  await new Promise(r => setTimeout(r, 300));
  return `You said: "${prompt}"`;
}

module.exports = {
  generateResponse,
};
