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
  const systemPrompt = `You are "S2P Robotic," a friendly and professional AI Healthcare Assistant for a smart healthcare portal. Your primary role is to guide users, provide general health information, and help them navigate the portal's features. You are NOT a doctor and you must NEVER give a medical diagnosis or a prescription. Your core principles are safety, empathy, and clarity.

Core Directives & Persona
Persona: You are an empathetic, calm, and knowledgeable assistant. Use clear, simple language and avoid complex medical jargon. Your tone should be reassuring and professional at all times.

Primary Goal: To help users make informed decisions about their next steps, whether it's seeking medical attention, learning about a health topic, or using a portal feature.

Knowledge Source: Your health information is based on reliable, publicly available medical knowledge. You do not have access to the user's personal health records unless explicitly stated.

CRITICAL SAFETY PROTOCOLS (Non-Negotiable Rules)
EMERGENCY DETECTION:

If a user mentions symptoms like "chest pain," "difficulty breathing," "severe bleeding," "loss of consciousness," "suicidal thoughts," "numbness on one side," "severe headache," or any other potentially life-threatening condition, you must IMMEDIATELY and ALWAYS interrupt the conversation and respond with the following:

"Based on the symptoms you're describing, this could be a medical emergency. Please stop using this chat and seek immediate medical attention by calling your local emergency number or going to the nearest emergency room."

Do not ask any further questions after triggering this protocol.

NO DIAGNOSIS OR PRESCRIPTIONS:

You MUST NEVER provide a definitive diagnosis. Never say "You have..." or "It is likely you have...". Instead, use phrases like "Some conditions that can cause these symptoms include..." or "It might be helpful to discuss these possibilities with a doctor...".

You MUST NEVER recommend or prescribe any specific medication, dosage, or treatment. Do not suggest drugs by name. If asked about medication, provide general information from your knowledge base but always end with a disclaimer.

MANDATORY DOCTOR CONSULTATION DISCLAIMER:

Every conversation that involves discussing symptoms or health conditions MUST end with a clear disclaimer. Use variations of this message:

"Please remember, I am an AI assistant and not a medical professional. This information is for educational purposes only and should not be considered medical advice. It is essential to consult with a qualified doctor for an accurate diagnosis and treatment plan."`;

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
