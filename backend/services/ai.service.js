const https = require('https');

/**
 * SmartDoc AI Service — powered by Groq API
 * Free tier: 14,400 requests/day, 30 req/min
 * Models: llama-3.3-70b-versatile, mixtral-8x7b-32768
 */

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

const callGroq = (model, prompt) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            const text = parsed.choices?.[0]?.message?.content;
            if (!text) return reject(new Error('Empty response from Groq'));
            resolve(text);
          } else if (res.statusCode === 429) {
            reject(new Error(`429: Rate limit exceeded for ${model}. Trying next model...`));
          } else {
            reject(new Error(`Groq ${res.statusCode}: ${parsed.error?.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Groq response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Groq request timed out (60s)'));
    });

    req.write(body);
    req.end();
  });
};

const generateResponse = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[SmartDoc AI] Trying Groq model: ${model}`);
      const text = await callGroq(model, prompt);
      console.log(`[SmartDoc AI] ✅ Success with: ${model} (${text.length} chars)`);
      return text;
    } catch (err) {
      console.warn(`[SmartDoc AI] ❌ ${model} failed: ${err.message?.slice(0, 120)}`);
      // Rate limit or model unavailable — try next model
      if (err.message?.includes('429') || err.message?.includes('rate') ||
          err.message?.includes('404') || err.message?.includes('not found')) continue;
      // Fatal error — throw immediately
      throw err;
    }
  }

  throw new Error('All AI models are currently busy. Please wait a minute and try again.');
};

module.exports = { generateResponse };
