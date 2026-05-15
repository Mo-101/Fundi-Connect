import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: (process.env.GEMINI_API_KEY as string) 
});

export const aiService = {
  async getTrustInsight(workerData: any) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this Jua Kali worker profile and provide a one-sentence trust insight for a potential client:
        Name: ${workerData.name}
        Skills: ${workerData.skills?.join(', ')}
        Experience: ${workerData.experienceYears} years
        Completed Jobs: ${workerData.completedJobsCount}
        Average Rating: ${workerData.avgRating}/5
        Verified: ${workerData.isVouched ? 'Yes' : 'No'}`,
      });
      return response.text;
    } catch (err) {
      console.error("Gemini AI Error:", err);
      return "Profile verified via SkillMesh protocol.";
    }
  },

  async suggestTrades(input: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `A user is looking for help with: "${input}". 
        List the top 3 relevant Jua Kali trades (e.g., Plumber, Welder, Carpenter) as comma-separated values.`,
      });
      return response.text;
    } catch (err) {
      console.error("Gemini AI Error:", err);
      return "Plumber, Electrician, Carpenter";
    }
  }
};
