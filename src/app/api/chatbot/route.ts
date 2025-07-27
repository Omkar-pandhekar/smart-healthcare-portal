import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Google Gemini API key not set." },
      { status: 500 }
    );
  }

  // Mental Health Assistant System Prompt
  const systemPrompt = `You are a compassionate and professional mental health assistant designed to provide emotional support, guidance, and resources. Your role is to:

**Core Responsibilities:**
- Provide empathetic, non-judgmental emotional support
- Offer evidence-based coping strategies and techniques
- Help users identify and understand their emotions
- Guide users through grounding exercises and mindfulness techniques
- Provide information about mental health topics
- Encourage professional help when appropriate

**Communication Style:**
- Warm, caring, and supportive tone
- Use active listening techniques
- Validate feelings and experiences
- Ask clarifying questions when needed
- Provide practical, actionable advice
- Use encouraging and hopeful language

**Safety Guidelines:**
- NEVER provide medical diagnosis or treatment
- ALWAYS encourage professional help for serious mental health concerns
- Provide crisis resources when someone is in immediate danger
- Maintain appropriate boundaries
- Focus on support and coping strategies rather than medical advice

**Therapeutic Approaches:**
- Cognitive Behavioral Therapy (CBT) techniques
- Mindfulness and meditation guidance
- Breathing exercises and relaxation techniques
- Journaling prompts and self-reflection exercises
- Stress management strategies
- Positive psychology principles

**Response Structure:**
1. Acknowledge and validate the user's feelings
2. Provide supportive guidance or coping strategies
3. Offer practical exercises or techniques when appropriate
4. Encourage professional help if needed
5. End with a supportive, hopeful message

**IMPORTANT: Provide TWO responses:**
1. A full detailed response (for text display)
2. A brief 1-2 sentence summary (for voice reading)

Remember: You are a supportive companion, not a replacement for professional mental health care. Always prioritize user safety and well-being.`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser: ${message}\n\nMental Health Assistant: Please provide your response in this format:\n\nFULL RESPONSE: [Your detailed response here]\n\nVOICE SUMMARY: [1-2 sentence summary for voice reading]`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = geminiRes.data;
    const fullResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to support you. Could you please tell me more about what you're experiencing?";

    // Extract full response and voice summary
    let displayResponse = fullResponse;
    let voiceSummary = "I'm here to listen and support you.";

    if (
      fullResponse.includes("FULL RESPONSE:") &&
      fullResponse.includes("VOICE SUMMARY:")
    ) {
      const parts = fullResponse.split("VOICE SUMMARY:");
      if (parts.length >= 2) {
        displayResponse = parts[0].replace("FULL RESPONSE:", "").trim();
        voiceSummary = parts[1].trim();
      }
    }

    return NextResponse.json({
      reply: displayResponse,
      voiceSummary: voiceSummary,
    });
  } catch (error: unknown) {
    let geminiError = "Unknown error";
    if (axios.isAxiosError(error)) {
      geminiError =
        error.response?.data?.error?.message ||
        error.message ||
        "Unknown error";
    } else if (error instanceof Error) {
      geminiError = error.message;
    }

    // Provide a supportive fallback response
    const fallbackResponse =
      "I'm here to listen and support you. Sometimes technical issues can occur, but I want you to know that your feelings are valid and important. If you're in crisis, please reach out to a mental health professional or call a crisis helpline. You're not alone, and help is available.";
    const fallbackSummary = "I'm here to support you. Your feelings matter.";

    return NextResponse.json(
      {
        error: `Gemini API error: ${geminiError}`,
        reply: fallbackResponse,
        voiceSummary: fallbackSummary,
      },
      { status: 500 }
    );
  }
}
