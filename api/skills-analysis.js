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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt for skills gap analysis
    const prompt = `
     You are an AI Career Advisor. 
The user has these skills: "${skills}" and their target role is: "${role}".  
Give a short, easy-to-read skill gap analysis in this format:  

**Key Gaps:** (3–5 bullet points, max 1 line each)  
**Next Steps:** (3 concise actions with suggested resources)  

Keep the response clear, concise, and actionable.

    `;

    const result = await model.generateContent(prompt);

    // Send back the AI's analysis
    res.status(200).json({ analysis: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
