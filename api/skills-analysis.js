import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { skills, role } = req.body;

    if (!skills || !role) {
      return res.status(400).json({ error: "Skills and role are required" });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt for skills gap analysis
    const prompt = `
      You are an AI Career Advisor. 
      The user currently has these skills: "${skills}". 
      Their target role or career path is: "${role}". 
      Identify the main skill gaps, recommend how to close them (with next steps, courses or learning paths),
      and present it in a clear, actionable format.
    `;

    const result = await model.generateContent(prompt);

    // Send back the AI's analysis
    res.status(200).json({ analysis: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
