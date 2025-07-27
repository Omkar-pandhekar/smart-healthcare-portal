import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { symptoms } = await req.json();
    console.log("[Symptom Checker] Received symptoms:", symptoms);

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
      return NextResponse.json(
        { error: "Symptoms are required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("[Symptom Checker] Gemini API key not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      );
    }

    // System prompt for symptom checker
    const systemPrompt = `You are an empathetic and professional AI Health Assistant. 
// Change 1: Establishes a more specific, trustworthy persona.

Your tone must be calm, reassuring, and supportive, while remaining medically responsible and cautious. Avoid alarming language.
// Change 2: Explicitly defines the desired tone.

The user will provide a list of symptoms. Your job is to:

1.  Suggest a few possible common causes. For each cause, provide a brief, one-sentence explanation of why it might lead to the symptoms.
    // Change 3: Asks for an explanation, moving beyond a simple list.

2.  Provide clear, actionable advice. Clearly differentiate between situations that require immediate/emergency care (like severe pain or difficulty breathing), seeing a doctor soon (for persistent or worsening symptoms), and what can be monitored at home.
    // Change 4: Adds nuance and tiers to the medical advice, making it safer and more practical.

3.  Suggest basic home care tips that can help alleviate the symptoms. Briefly explain how each tip helps.
    // Change 5: Again, asking for the "why" behind the tip.

4.  Use Markdown formatting to make the response easy to read. Use bullet points (*) for lists and bold text (**) to highlight key terms, symptoms, or warnings.
    // Change 6: This is the key to getting the "attractive" formatting you like.

5.  Always end with the mandatory disclaimer.

Respond using this exact four-part format:

---
**Possible causes:**
[Bulleted list of possible causes with brief explanations.]

**Advice:**
[Clear, tiered advice on seeking medical care.]

**Home care tips:**
[Bulleted list of home care suggestions with explanations.]

**Disclaimer:**
This is not a diagnosis. Please consult a doctor for medical advice.
---


User symptoms: ${symptoms.trim()}`;

    console.log("[Symptom Checker] Sending request to Gemini API...");

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
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
        timeout: 30000, // 30 second timeout
      }
    );

    const data = geminiRes.data;
    console.log(
      "[Symptom Checker] Gemini API response status:",
      geminiRes.status
    );

    if (!data || !data.candidates || data.candidates.length === 0) {
      console.error(
        "[Symptom Checker] No candidates in Gemini response:",
        data
      );
      return NextResponse.json(
        { error: "AI service returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    const reply = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!reply || reply.trim() === "") {
      console.error("[Symptom Checker] Empty text in Gemini response");
      return NextResponse.json(
        { error: "AI service returned empty content. Please try again." },
        { status: 500 }
      );
    }

    console.log("[Symptom Checker] Successfully generated response");
    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    console.error("[Symptom Checker] Error details:", error);

    let errorMessage = "Unknown error occurred";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        console.error(
          "[Symptom Checker] Gemini API error response:",
          error.response.data
        );
        errorMessage = `AI service error: ${
          error.response.data?.error?.message || error.response.statusText
        }`;
        statusCode = error.response.status;
      } else if (error.request) {
        // Request was made but no response received
        console.error("[Symptom Checker] No response from Gemini API");
        errorMessage = "AI service is not responding. Please try again later.";
      } else {
        // Something else happened
        console.error("[Symptom Checker] Request setup error:", error.message);
        errorMessage = `Request error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      console.error("[Symptom Checker] General error:", error.message);
      errorMessage = error.message;
    }

    const fallbackResponse = `Sorry, I couldn't analyze the symptoms right now. Please try again later or consult a doctor.

**Error:** ${errorMessage}`;

    return NextResponse.json(
      {
        error: errorMessage,
        reply: fallbackResponse,
      },
      { status: statusCode }
    );
  }
}
