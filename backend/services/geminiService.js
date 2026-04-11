const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateInsight = async (engagementData) => {
  console.log("🤖 Generating fresh AI insight...");
  const fallback = {
    text: "Your engagement spikes at 6 PM — schedule more posts here to maximize reach.",
    confidence: 98
  };

  try {
    const prompt = `You are a social media analytics AI for a platform called SocialOps.
Based on the following engagement data, generate ONE actionable insight
for the user. Keep it under 20 words. Be specific and data-driven.
Sound confident and professional. Do not use bullet points or lists.

Data:
- Weekly engagement trend: ${JSON.stringify(engagementData.weeklyEngagement)}
- Weekly reach trend: ${JSON.stringify(engagementData.weeklyReach)}
- Best performing content type: ${engagementData.topPostType}
- Top platform: ${engagementData.topPlatform}
- Total followers: ${engagementData.totalFollowers}
- Top audience country: ${engagementData.audienceTopCountry}

Respond with ONLY a JSON object in this exact format, nothing else:
{
  "insight": "your insight text here",
  "confidence": 95
}
confidence must be a number between 85 and 99.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let responseText = response.text || '';
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(responseText);

    return {
      text: parsed.insight,
      confidence: parsed.confidence
    };
  } catch (error) {
    console.error("⚠️ Gemini failed, using fallback insight");
    return fallback;
  }
};

module.exports = { generateInsight };
