// ============================================
// LexisAI — Gemini Transcribe Edge Function
// Proxies audio transcription requests to Google Gemini API
// Keeps the API key secure on the server side
// ============================================

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// CORS headers for browser requests
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Read the Gemini API key from environment (Supabase secret)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: API key not set" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    let body: {
      audio?: string;
      language?: string;
      mime_type?: string;
    };

    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Validate audio data
    const { audio, language = "Bengali", mime_type = "audio/webm" } = body;

    if (!audio) {
      return new Response(
        JSON.stringify({ error: "Missing required field: audio" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Validate language parameter
    const validLanguages = ["Bengali", "English"];
    const normalizedLanguage = validLanguages.includes(language)
      ? language
      : "Bengali";

    // Build the transcription prompt
    const prompt =
      `Transcribe the following audio in ${normalizedLanguage}. Return ONLY the transcribed text, nothing else. If the audio is unclear or empty, return an empty string. Do not add any explanation or formatting.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mime_type,
                  data: audio,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(
        `Gemini API error: ${geminiResponse.status} — ${errorText.substring(0, 500)}`,
      );

      return new Response(
        JSON.stringify({
          error: "Gemini API request failed",
          status: geminiResponse.status,
          details: errorText.substring(0, 200),
        }),
        {
          status: geminiResponse.status === 429 ? 429 : 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract transcribed text from Gemini response
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "";

    return new Response(
      JSON.stringify({ text, source: "gemini" }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
});
