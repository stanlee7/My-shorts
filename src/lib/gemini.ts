import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCreativeHooks(title: string, duration: number, clipCount: number = 3): Promise<any[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      `I am creating short-form video highlights for a YouTube video titled: "${title}". ` +
      `The video is approximately ${Math.round(duration)} seconds long. ` +
      `Generate ${clipCount} highly creative, viral-worthy highlight segments. ` +
      "Since you cannot see the video, invent plausible, highly engaging timestamps and explanations that fit the title. " +
      "For each segment, provide a catchy title, a brief explanation of why it's engaging, the start and end timestamps in seconds, and two lines of catchy Korean copywriting for the top of the video (topCopy1 and topCopy2). " +
      "CRITICAL FOR COPYWRITING: The copy must be highly engaging, viral, and contextually relevant to the video title. Use a two-line structure where the first line sets the context or curiosity, and the second line delivers the punchline or main hook. " +
      "DO NOT copy these examples exactly, use them ONLY as a structural reference: '복사 붙여넣기 하나로 / 3D 웹사이트 10초컷', '클릭을 부르는 디자인 / 마우스 반응의 정체는?'. " +
      "Generate completely new, creative, and unique copywriting every time. Be extremely creative!"
    ],
    config: {
      temperature: 0.9,
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
            topCopy1: { type: Type.STRING, description: "Catchy top copywriting line 1 in Korean" },
            topCopy2: { type: Type.STRING, description: "Catchy top copywriting line 2 in Korean, usually the main hook" },
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
      "CRITICAL FOR COPYWRITING: The copy must be highly engaging, viral, and contextually relevant. Use a two-line structure where the first line sets the context or curiosity, and the second line delivers the punchline or main hook. " +
      "DO NOT copy these examples exactly, use them ONLY as a structural reference: '복사 붙여넣기 하나로 / 3D 웹사이트 10초컷', '클릭을 부르는 디자인 / 마우스 반응의 정체는?', '구글 AI가 다해주는 / 미친 3D 홈페이지 제작'. " +
      "Generate completely new, creative, and unique copywriting every time based on the actual video content. Be extremely creative!"
    ],
    config: {
      temperature: 0.9,
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
