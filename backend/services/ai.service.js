const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

const initModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try gemini-1.5-flash first (most available on free tier)
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
};

/**
 * Generate a response from Gemini given a prompt
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const generateResponse = async (prompt) => {
  try {
    const m = initModel();
    const result = await m.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[SmartDoc AI] Gemini error:', error.message);
    // If model not found, try fallback model name
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      console.log('[SmartDoc AI] Trying fallback model: gemini-pro');
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
    throw error;
  }
};

module.exports = { generateResponse };
