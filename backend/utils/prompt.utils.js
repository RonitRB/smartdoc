const buildQAPrompt = (query, chunks, context = []) => {
  const docContext = chunks.map((c, i) => `[Source ${i + 1}]:\n${c.content}`).join('\n\n---\n\n');

  // Build conversation history if available
  let conversationHistory = '';
  if (context && context.length > 1) {
    const history = context.slice(0, -1); // exclude the current question (it's already separate)
    if (history.length > 0) {
      conversationHistory = '\nCONVERSATION HISTORY (for context on follow-up questions):\n' +
        history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 500)}`).join('\n') +
        '\n';
    }
  }

  return `You are SmartDoc, an expert AI assistant that answers questions based strictly on provided document content.

DOCUMENT CONTEXT:
${docContext}
${conversationHistory}
USER QUESTION: ${query}

INSTRUCTIONS:
- Answer using ONLY the information in the document context above.
- Be thorough, clear, and well-structured in your response.
- Use bullet points, numbered lists, or headings when appropriate for readability.
- If the user references something from the conversation history, use that context to understand their question.
- If the answer is not in the context, say: "I couldn't find this information in the uploaded document."
- Reference which source(s) you used at the end of your answer.

ANSWER:`;
};

const buildSummaryPrompt = (text) => {
  const truncated = text.slice(0, 6000);
  return `Summarize the following document clearly and concisely.
Include:
1. What this document is about (1-2 sentences)
2. Key points (3-5 bullet points)
3. Main conclusions or takeaways

Keep the summary professional and well-structured.

DOCUMENT:
${truncated}

SUMMARY:`;
};

const buildContentPrompt = (type, text, language = 'English') => {
  const truncated = text.slice(0, 5000);
  const prompts = {
    blog: `Write a detailed, engaging blog post based on the following document content. Include a catchy title, introduction, main sections with headings, and a conclusion. Make it informative and reader-friendly. Language: ${language}.

DOCUMENT:
${truncated}

BLOG POST:`,

    social: `Create 5 engaging social media posts based on the following document. Include one for LinkedIn (professional), one for Twitter/X (concise, under 280 chars), one for Instagram (with hashtags), one for Facebook (conversational), and one general post. Language: ${language}.

DOCUMENT:
${truncated}

SOCIAL MEDIA POSTS:`,

    email: `Write a professional email based on the following document content. Include a subject line, greeting, body paragraphs summarizing key points, call to action, and sign-off. Language: ${language}.

DOCUMENT:
${truncated}

EMAIL:`,

    bullets: `Extract and present the most important key takeaways from the following document as clear, concise bullet points. Group them by topic if applicable. Aim for 8-12 points. Language: ${language}.

DOCUMENT:
${truncated}

KEY TAKEAWAYS:`,

    quiz: `Generate 5 multiple-choice quiz questions based on the following document. For each question provide: the question, 4 options (A, B, C, D), and the correct answer with a brief explanation. Language: ${language}.

DOCUMENT:
${truncated}

QUIZ:`,

    flashcards: `Generate 10 flashcards based on the following document. Each flashcard should have:
- **Front**: A clear, specific question
- **Back**: A concise, accurate answer (1-3 sentences)

Format each flashcard as:
CARD 1:
Front: [question]
Back: [answer]

Make the flashcards cover the most important concepts, facts, and definitions. Language: ${language}.

DOCUMENT:
${truncated}

FLASHCARDS:`,

    keywords: `Extract the most important keywords, topics, and themes from the following document. Group them into: Main Topics, Key Terms, Important Names/Places, and Core Concepts. Language: ${language}.

DOCUMENT:
${truncated}

KEYWORDS & TOPICS:`,

    translate: `Translate the following document content into ${language}. Preserve the original structure, headings, and formatting as much as possible.

DOCUMENT:
${truncated}

TRANSLATION:`,

    presentation: `Create a presentation slide deck outline based on the following document. For each slide include:
- **Slide title**
- **3-4 bullet points** for the slide content
- **Speaker notes** (1-2 sentences of what to say)

Create 8-12 slides including a Title Slide, Agenda, main content slides, Key Takeaways, and a Q&A slide. Language: ${language}.

DOCUMENT:
${truncated}

PRESENTATION OUTLINE:`,

    mindmap: `Create a hierarchical mind map structure based on the following document. Use this format:
- **Central Topic** (main subject)
  - **Branch 1** (major theme)
    - Sub-topic 1.1
    - Sub-topic 1.2
  - **Branch 2** (major theme)
    - Sub-topic 2.1
    - Sub-topic 2.2

Identify 4-6 major branches with 2-4 sub-topics each. Make it comprehensive and well-organized. Language: ${language}.

DOCUMENT:
${truncated}

MIND MAP:`,
  };
  return prompts[type] || prompts.bullets;
};

module.exports = { buildQAPrompt, buildSummaryPrompt, buildContentPrompt };
