const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash-lite"
    });

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    return res.json({ text });

  } catch (error) {
    console.error("Gemini API error:", error);

    // ✅ Handle quota / rate limit errors cleanly
    if (error.status === 429) {
      return res.status(429).json({
        error: "AI quota exceeded. Please try again later."
      });
    }

    return res.status(500).json({
      error: "AI service temporarily unavailable."
    });
  }
});

module.exports = router;
