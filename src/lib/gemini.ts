import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractHighlights(file: File, targetDuration: number): Promise<any[]> {
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
      "Analyze this video and identify the 3 most engaging, viral-worthy highlight segments suitable for short-form content (like YouTube Shorts or TikTok). " +
      `CRITICAL: The target duration for each segment MUST be exactly around ${targetDuration} seconds (e.g., if ${targetDuration} is requested, the segment must be ~${targetDuration} seconds long). ` +
      "Ensure the video does not cut off abruptly. The start and end timestamps MUST align with natural pauses in speech or logical breaks in the context so the flow is smooth. " +
      "For each segment, provide a catchy title, a brief explanation of why it's engaging, the start and end timestamps in seconds, and two lines of catchy Korean copywriting for the top of the video (topCopy1 and topCopy2). " +
      "topCopy1 should be a short hook (e.g., '이거 모르면 손해', '클릭을 부르는 디자인'), and topCopy2 should be a strong, curiosity-inducing main hook (e.g., '마우스 반응의 정체는?', '역대급 레전드 순간 ㄷㄷ')."
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
