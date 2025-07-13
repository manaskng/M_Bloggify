const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // Use your Gemini 2.0 Flash-Lite model here
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash-lite'
    });

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    res.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;
