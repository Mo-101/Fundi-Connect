export const aiService = {
  async getTrustInsight(workerData: any) {
    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerData }),
      });
      const data = await res.json();
      return data.text ?? "Profile verified via SkillMesh protocol.";
    } catch (err) {
      console.error("AI insight fetch failed:", err);
      return "Profile verified via SkillMesh protocol.";
    }
  },

  async suggestTrades(input: string) {
    try {
      const res = await fetch("/api/ai/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      return data.text ?? "Plumber, Electrician, Carpenter";
    } catch (err) {
      console.error("AI trades fetch failed:", err);
      return "Plumber, Electrician, Carpenter";
    }
  }
};
