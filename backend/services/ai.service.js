const { GoogleGenerativeAI } = require('@google/generative-ai');

// Supported models in order of preference
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

const generateResponse = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const modelName of MODELS) {
    try {
      console.log(`[SmartDoc AI] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`[SmartDoc AI] Success with model: ${modelName}`);
      return text;
    } catch (err) {
      console.warn(`[SmartDoc AI] Model ${modelName} failed: ${err.message}`);
      if (
        err.message?.includes('not found') ||
        err.message?.includes('404') ||
        err.message?.includes('not supported') ||
        err.message?.includes('deprecated')
      ) {
        continue; // try next model
      }
      throw err; // non-model error (quota, auth, etc) — throw immediately
    }
  }

  throw new Error('All Gemini models failed. Check your API key and quota.');
};

module.exports = { generateResponse };
