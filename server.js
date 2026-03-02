import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const MODEL = "llama-3.3-70b-versatile";

/* =========================================================
   ROUTE 1 → RESUME GENERATOR
========================================================= */
app.get("/",(req,res)=>{
    res.json({
    message: "Server is running",
    status: "success"
});
})
app.post("/generate-resume", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();
    const html = data.choices[0].message.content;

    res.json({ success: true, html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Resume generation failed" });
  }
});

/* =========================================================
   ROUTE 2 → RESUME ANALYZER
========================================================= */

app.post("/analyze-resume", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();
    let raw = data.choices[0].message.content;

    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(raw);

    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Analysis failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});