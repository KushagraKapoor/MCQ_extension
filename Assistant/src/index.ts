import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fetch } from 'undici';

const app = express();
const port = 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('🧠 Jarvis MCQ Generator Backend is running!');
});

// Main route
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log('🟢 Received content to generate MCQs:\n', userMessage);

  // 🔧 Clean, Phi-2-safe prompt
  const prompt = `Generate 3 multiple-choice questions from the content below.

Use this format:
Q: [question]
A. [option A]
B. [option B]
C. [option C]
D. [option D]
Answer: [correct option letter] 

Content:
${userMessage}
`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi',
        prompt: prompt,
        stream: false
      })
    });

    const raw = await response.text();
    console.log('📨 Ollama raw response:\n', raw);

    const data = JSON.parse(raw) as { response: string };

    res.json({ reply: data.response });

  } catch (error) {
    console.error('❌ Error talking to Ollama:', error);
    res.status(500).json({ reply: 'Sorry, something went wrong generating MCQs.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
