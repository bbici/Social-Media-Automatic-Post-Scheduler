import { GoogleGenAI, Type } from "@google/genai";
import { 
  DraftContent, 
  AdaptedPost, 
  Platform, 
  ProfileData, 
  OptimizedProfileResult, 
  PostGeneratorData, 
  PhotoAnalysisResult 
} from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean Markdown code blocks from JSON string
const cleanJson = (text: string) => {
  if (!text) return "{}";
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const generateSocialVariants = async (
  draft: DraftContent,
  platforms: Platform[]
): Promise<AdaptedPost[]> => {
  const ai = getAI();

  // Define specific instructions for each platform to ensure high-quality output
  const platformInstructions: Record<string, string> = {
    twitter: "Twitter/X: Concise, conversational, and punchy. Under 280 characters. Use 1-2 relevant hashtags. Focus on 'What's happening' or a key insight.",
    linkedin: "LinkedIn: Professional yet personal. Use a 'Hook -> Value -> CTA' storytelling structure. Focus on industry insights, professional growth, or business lessons. Use 3-5 professional hashtags.",
    instagram: "Instagram: Visually descriptive and engaging. Use emojis and line breaks for readability. Include a block of 15-25 mixed volume hashtags at the end.",
    tiktok: "TikTok: Viral, high-energy, and short. Focus on a strong 'hook' in the first sentence. Suggest a trending sound vibe in brackets if applicable. Use trending tags like #fyp plus niche tags."
  };

  const specificInstructions = platforms
    .map(p => platformInstructions[p] || "")
    .filter(Boolean)
    .join('\n');

  // Handle case where text is empty but media exists
  const draftText = draft.text ? draft.text : "No text provided. Generate a caption based on the context of the attached media.";

  // We construct a prompt that asks for a JSON array of adaptations
  const prompt = `
    You are an expert Social Media Manager and Content Strategist. 
    Adapt the following draft content into optimized posts for these platforms: ${platforms.join(', ')}.

    ORIGINAL DRAFT:
    "${draftText}"

    MEDIA CONTEXT:
    Has Media: ${draft.mediaType !== 'none'}
    Media Type: ${draft.mediaType}
    ${draft.mediaType === 'image' ? 'Note: The user has uploaded an image. Ensure the caption references or complements the visual elements.' : ''}
    ${draft.mediaType === 'video' ? 'Note: The user has uploaded a video. The caption should encourage watching the video (e.g., "Wait for the end", "Sound on 🔊").' : ''}

    PLATFORM INSTRUCTIONS:
    ${specificInstructions}

    Return a JSON object containing an array "variants".
    Each item in "variants" must have:
    - "platform": string (one of the requested platforms)
    - "content": string (the post text/caption)
    - "hashtags": array of strings (hashtags without the # symbol)
  `;

  // If there is an image, we send it to the model for context-aware captions
  let parts: any[] = [];
  
  if (draft.media && draft.mediaType === 'image') {
    const base64Data = draft.media.includes(',') ? draft.media.split(',')[1] : draft.media;
    let mimeType = 'image/jpeg';
    if (draft.media.startsWith('data:')) {
        const matches = draft.media.match(/^data:(.+);base64,/);
        if (matches && matches[1]) {
            mimeType = matches[1];
        }
    }

    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }
  
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                content: { type: Type.STRING },
                hashtags: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["platform", "content", "hashtags"]
            }
          }
        }
      }
    }
  });

  const cleanedText = cleanJson(response.text || "{}");
  const result = JSON.parse(cleanedText);
  
  if (!result.variants) return [];

  // Map back to our application type, preserving the media URL for preview
  return result.variants.map((v: any) => ({
    platform: v.platform.toLowerCase() as Platform,
    content: v.content,
    hashtags: v.hashtags || [],
    mediaUrl: draft.media,
    mediaType: draft.mediaType,
    isPosted: false,
    scheduledTime: draft.scheduledTime
  }));
};

export const optimizeProfileWithGemini = async (data: ProfileData): Promise<OptimizedProfileResult> => {
  const ai = getAI();
  const prompt = `
    You are an expert LinkedIn Profile optimizer.
    Analyze the following profile data and provide optimizations.
    
    Current Headline: ${data.headline}
    Current About: ${data.about}
    Experience: ${data.experience}
    Skills: ${data.skills}

    Return a JSON object with:
    - critique: A short audit of what is wrong or could be better.
    - optimizedHeadline: An array of 3 strong, SEO-friendly headlines.
    - optimizedAbout: A rewritten, engaging About section (markdown supported).
    - optimizedExperience: Rewritten experience bullets emphasizing impact/metrics (markdown supported).
    - strategicTips: 3-4 actionable tips to improve profile visibility (markdown).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            critique: { type: Type.STRING },
            optimizedHeadline: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedAbout: { type: Type.STRING },
            optimizedExperience: { type: Type.STRING },
            strategicTips: { type: Type.STRING }
        },
        required: ["critique", "optimizedHeadline", "optimizedAbout", "optimizedExperience", "strategicTips"]
      }
    }
  });

  const cleanedText = cleanJson(response.text || "{}");
  return JSON.parse(cleanedText);
};

export const generateLinkedInPost = async (data: PostGeneratorData): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Write a high-performing LinkedIn post.
    Topic: ${data.topic}
    Tone: ${data.tone}
    Target Audience: ${data.audience}
    
    Structure:
    1. Hook (catchy first line)
    2. Value (main insight/story)
    3. Takeaway/Call to Action
    
    Format: Use short paragraphs, emojis where appropriate, and bold text for emphasis. Return raw text/markdown.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "";
};

export const analyzeProfilePhoto = async (base64Image: string): Promise<PhotoAnalysisResult> => {
  const ai = getAI();
  
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  let mimeType = 'image/jpeg';
  if (base64Image.startsWith('data:')) {
      const matches = base64Image.match(/^data:(.+);base64,/);
      if (matches && matches[1]) {
          mimeType = matches[1];
      }
  }

  const prompt = `
    Analyze this LinkedIn profile photo.
    Evaluate: Lighting, Composition, Professionalism, Approachability.
    
    Return JSON:
    - score: number (1-10)
    - feedback: 2-3 sentences on overall impression.
    - improvements: Array of short specific tips to improve (e.g., "Better lighting", "Smile more", "Crop closer").
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
           inlineData: {
             mimeType: mimeType,
             data: base64Data
           }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "feedback", "improvements"]
      }
    }
  });

  const cleanedText = cleanJson(response.text || "{}");
  return JSON.parse(cleanedText);
};