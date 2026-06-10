import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google GenAI with correct Telemetry headers and process.env.GEMINI_API_KEY
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });

  // API Route: AI Trust Standings
  app.post("/api/ai/insight", async (req: express.Request, res: express.Response) => {
    try {
      const { workerData } = req.body;
      if (!workerData) {
        return res.status(400).json({ error: "Missing workerData parameter." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following technical profile data of a local handyman (Fundi) and write a highly professional, encouraging, and local ecosystem cyberpunk trust validation summary (maximum 2 sentences) highlighting their local standing and verified expertise: ${JSON.stringify(workerData)}. Return only the concise insight text.`,
      });

      const generatedText = response.text?.trim() || "Profile verified via SkillMesh protocol.";
      res.json({ text: generatedText });
    } catch (err: any) {
      console.error("Gemini insight generation failed:", err);
      res.status(500).json({ error: "Failed to generate AI insight.", details: err.message });
    }
  });

  // API Route: AI Trades Suggestion Finder
  app.post("/api/ai/trades", async (req: express.Request, res: express.Response) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Missing input query." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following user job description or handiwork problem: "${input}". Recommend exactly 3 suited trade trade categories (like Electrical, Plumbing, Carpentry, Masonry, Solar Energy, Smart Tech) that can address this work. Return the 3 categories as a simple comma-separated list without numbering or intro text, e.g. "Electrical, Solar Energy, Smart Tech".`,
      });

      const generatedText = response.text?.trim() || "Electrical, Plumbing, Smart Tech";
      res.json({ text: generatedText });
    } catch (err: any) {
      console.error("Gemini trades suggestion failed:", err);
      res.status(500).json({ error: "Failed to suggest trades.", details: err.message });
    }
  });

  // Haversine distance calculator
  function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // API Route: AI Smart Match Finder with Sovereign Ranking Engine
  app.post("/api/ai/match", async (req: express.Request, res: express.Response) => {
    try {
      const { job, workers } = req.body;
      if (!job || !workers || !Array.isArray(workers)) {
        return res.status(400).json({ error: "Missing job or workers parameter." });
      }

      const jobLat = job.coordinates?.lat;
      const jobLng = job.coordinates?.lng;

      // PHASE 1: Use AI for Semantic Intelligence Only (Parsing intent & subskills)
      const nlpAnalysisResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: `You are the lead AI dispatch architect for FundiConnect in Kenya.
Analyze the following Job requirements and identify:
1. The most suitable Jua Kali primary category (e.g. "Electrical", "Plumbing", "Masonry", "Carpentry", "Solar Energy").
2. Standardized sub-skills or keywords (as an array of strings, e.g. ["wiring", "solar pump", "installation"]) that match this exact task.

Job Details:
- Title: ${job.title}
- Category: ${job.category}
- Description: ${job.description}

Output a clean JSON object following this strict schema:
{
  "primaryCategory": "string",
  "keywords": ["string"]
}`,
      });

      let nlpText = nlpAnalysisResponse.text?.trim() || "{}";
      if (nlpText.startsWith("```json")) {
        nlpText = nlpText.replace(/^```json/, "").replace(/```$/, "");
      } else if (nlpText.startsWith("```")) {
        nlpText = nlpText.replace(/^```/, "").replace(/```$/, "");
      }
      nlpText = nlpText.trim();
      
      let parsedNlp = { primaryCategory: job.category, keywords: [] as string[] };
      try {
        parsedNlp = JSON.parse(nlpText);
      } catch (err) {
        console.error("Failed to parse NLP response:", err);
      }

      const parsedCategory = parsedNlp.primaryCategory || job.category;
      const extractedKeywords = (parsedNlp.keywords || []).map((k: string) => k.toLowerCase());

      // PHASE 2: Sovereign Ranking Calculation (Deterministically computed using transparent formula)
      const scoredWorkers = workers.map((w: any) => {
        let distanceKm = 999;
        if (jobLat && jobLng && w.coordinates?.lat && w.coordinates?.lng) {
          distanceKm = getDistanceKm(jobLat, jobLng, w.coordinates.lat, w.coordinates.lng);
        }

        // 1. Skill Match Score (Max 40 points)
        let skillScore = 0;
        const categoryMatch = w.category.toLowerCase() === parsedCategory.toLowerCase() || w.category.toLowerCase() === job.category.toLowerCase();
        if (categoryMatch) {
          skillScore += 25; // Base category match matches
        } else if (w.category.toLowerCase().includes(parsedCategory.toLowerCase()) || parsedCategory.toLowerCase().includes(w.category.toLowerCase())) {
          skillScore += 15; // Partial category overlap overlap
        } else {
          skillScore += 5; // Trade baseline
        }

        // Sub-skills keyword matching
        const matchedSubSkills: string[] = [];
        const wSubSkills = (w.subSkills || []).map((s: string) => s.toLowerCase());
        const wBioAndName = `${w.bio || ""} ${w.name || ""}`.toLowerCase();

        extractedKeywords.forEach((kw: string) => {
          const directSkillMatch = wSubSkills.some((s: string) => s.includes(kw) || kw.includes(s));
          const bioMatch = wBioAndName.includes(kw);
          if (directSkillMatch || bioMatch) {
            matchedSubSkills.push(kw);
          }
        });

        // Add 5 points per matched keyword, max 15 points
        const keywordBonus = Math.min(15, matchedSubSkills.length * 5);
        skillScore += keywordBonus;
        skillScore = Math.min(40, skillScore);

        // 2. Proximity Score (Max 25 points)
        let distanceScore = 5;
        if (distanceKm <= 2) {
          distanceScore = 25;
        } else if (distanceKm <= 5) {
          distanceScore = 20;
        } else if (distanceKm <= 10) {
          distanceScore = 15;
        } else if (distanceKm <= 25) {
          distanceScore = 10;
        }

        // 3. Word Kept Score (Max 15 points) - based on proven completed jobs count
        const completedJobs = w.completedJobsCount || 0;
        const wordKeptScore = Math.min(15, 3 + (completedJobs * 2));

        // 4. Repeat Clients Score (Max 10 points) - rating and repeat signals
        const ratingVal = w.rating || 0;
        let repeatScore = 3;
        if (completedJobs > 0) {
          repeatScore = Math.min(10, Math.floor(completedJobs * 0.5) + (ratingVal >= 4.7 ? 5 : 2));
        }

        // 5. Elder Witness Score (Max 10 points) - based on parish board vouched/verification level
        let elderWitnessScore = 4;
        if (w.isVerified || w.verificationLevel === "Tier-3") {
          elderWitnessScore = 10;
        } else if (w.isVouched || w.trustLevel === "vouched") {
          elderWitnessScore = 8;
        }

        const totalScore = skillScore + distanceScore + wordKeptScore + repeatScore + elderWitnessScore;

        return {
          id: w.id,
          name: w.name,
          score: totalScore,
          category: w.category,
          breakdown: {
            skillScore,
            distanceScore,
            wordKeptScore,
            repeatScore,
            elderWitnessScore
          },
          metrics: {
            categoryMatch,
            matchedSubSkills: matchedSubSkills.slice(0, 3),
            distanceKm: distanceKm === 999 ? 0 : parseFloat(distanceKm.toFixed(2)),
            completedJobs,
            rating: ratingVal,
            elderVerified: w.isVerified || w.verificationLevel === "Tier-3"
          }
        };
      });

      // Sort workers by their calculated score and grab the top 3
      const top3Scored = scoredWorkers
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      // PHASE 3: AI Copywriting Only (Generate a humanized explanation in local Sheng/English hybrid tone)
      const copywritingResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: `You are the lead community dispatcher for FundiConnect, writing supportive, clear recommendations for Mama Becky and local clients.
Translate the mathematical scores of these top 3 sorted Fundis into 1-2 positive sentences of conversational Sheng/English hybrid local tone describing why they are a perfect match. Make sure to reference their distance and specific skill matches naturally.

Job description:
- Title: ${job.title}
- Description: ${job.description}
- Req Category: ${parsedCategory}

Sorted Nominated Workers:
${JSON.stringify(top3Scored.map((w: any) => ({
  id: w.id,
  name: w.name,
  score: w.score,
  distance: `${w.metrics.distanceKm} km`,
  matchedSkills: w.metrics.matchedSubSkills,
  rating: w.metrics.rating,
  completedJobs: w.metrics.completedJobs,
  isVerified: w.metrics.elderVerified
})))}

Output a clean JSON array matching the worker IDs:
[
  {
    "id": "matching worker id",
    "reason": "personalized local 1-2 sentence sheng explanation talking about their proximity, exact skill match, and reliable track record"
  }
]`,
      });

      let copyText = copywritingResponse.text?.trim() || "[]";
      if (copyText.startsWith("```json")) {
        copyText = copyText.replace(/^```json/, "").replace(/```$/, "");
      } else if (copyText.startsWith("```")) {
        copyText = copyText.replace(/^```/, "").replace(/```$/, "");
      }
      copyText = copyText.trim();

      let parsedReasons: any[] = [];
      try {
        parsedReasons = JSON.parse(copyText);
      } catch (err) {
        console.error("Failed to parse copywriting text:", err);
      }

      // Merge Gemini's localized COPY with the sovereign calculated score breakdown
      const finalMatches = top3Scored.map((w: any) => {
        const copyItem = Array.isArray(parsedReasons) ? parsedReasons.find((r: any) => r && r.id === w.id) : null;
        return {
          ...w,
          reason: copyItem?.reason || `${w.name} is classified as highly matching for ${w.category} in your local parish sector.`
        };
      });

      res.json({ matches: finalMatches });
    } catch (err: any) {
      console.error("Gemini smart match failed:", err);
      res.status(500).json({ error: "Failed to perform smart match.", details: err.message });
    }
  });

  // Vite development middleware vs Static Production bundle delivery
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started. Running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start fullstack server:", error);
});
