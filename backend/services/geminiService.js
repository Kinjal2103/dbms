import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateInsight = async (engagementData) => {
  const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());
  console.log("🤖 Generating fresh AI insight...");

  const fallback = {
    text: "Your engagement spikes at 6 PM — schedule more posts here.",
    confidence: 98,
    anomaly: { title: "Unexpected Engagement Dip", description: "Your weekend posts are seeing 30% less engagement. Consider scheduling for weekdays." }
  };

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `You are a social media analytics AI for a platform called SocialOps.
Based on the following engagement data, generate ONE actionable insight for the user (keep it under 20 words).
AND ALSO detect ONE anomaly from this data (give it a short title and a 20 word description).
Be specific and data-driven. Sound confident and professional.

Data:
- Weekly engagement trend: ${JSON.stringify(engagementData.weeklyEngagement)}
- Weekly reach trend: ${JSON.stringify(engagementData.weeklyReach)}
- Best performing content type: ${engagementData.topPostType}
- Top platform: ${engagementData.topPlatform}
- Total followers: ${engagementData.totalFollowers}
- Top audience country: ${engagementData.audienceTopCountry}

Respond with ONLY JSON:
{"insight":"...", "confidence":95, "anomaly": {"title": "...", "description": "..."}}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      text: parsed.insight,
      confidence: parsed.confidence,
      anomaly: parsed.anomaly
    };

  } catch (error) {
    console.error("⚠️ Gemini failed, using fallback insight:", error);
    return fallback;
  }
};