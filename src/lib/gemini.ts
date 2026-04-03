import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractHighlights(file: File, targetDuration: number, clipCount: number = 3): Promise<any[]> {
  // Prevent browser memory crash and API payload limits (inlineData is limited to ~20MB)
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE");
  }

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Call Gemini API
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // Using the recommended model for general tasks
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        }
      },
      "Analyze this video and identify the " + clipCount + " most engaging, viral-worthy highlight segments suitable for short-form content (like YouTube Shorts or TikTok). " +
      `CRITICAL: The target duration is around ${targetDuration} seconds, BUT natural cuts are much more important than exact duration. ` +
      "DO NOT cut mid-sentence or mid-action. You MUST find natural pauses in speech (silence) or clear scene changes for the start and end timestamps. It is better to be a few seconds shorter or longer than to cut someone off while speaking. " +
      "For each segment, provide a catchy title, a brief explanation of why it's engaging, the start and end timestamps in seconds, and two lines of catchy Korean copywriting for the top of the video (topCopy1 and topCopy2). " +
      "CRITICAL FOR COPYWRITING: Each segment MUST have a completely different tone and style of copywriting. Do not repeat the same phrases. Use a mix of styles: [Curiosity (e.g., '이게 진짜 된다고?'), Shock (e.g., '역대급 장면 ㄷㄷ'), Informative (e.g., '1분 만에 배우는 꿀팁'), Empathy/Humor (e.g., '아 내 얘기네 ㅋㅋ')]. Make them highly clickable and contextually relevant to the specific segment."
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Catchy title for the short" },
            explanation: { type: Type.STRING, description: "Why this is a good highlight" },
            startTime: { type: Type.NUMBER, description: "Start time in seconds" },
            endTime: { type: Type.NUMBER, description: "End time in seconds" },
            topCopy1: { type: Type.STRING, description: "Catchy top copywriting line 1 in Korean (e.g., '클릭을 부르는 디자인')" },
            topCopy2: { type: Type.STRING, description: "Catchy top copywriting line 2 in Korean, usually the main hook (e.g., '마우스 반응의 정체는?')" },
          },
          required: ["title", "explanation", "startTime", "endTime", "topCopy1", "topCopy2"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text);
}
