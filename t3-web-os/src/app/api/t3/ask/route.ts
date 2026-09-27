import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PREAMBLE = `You are T³, an AI operating system control agent running inside a personal device shell.
You help the user navigate the OS, run shell commands, launch apps, switch themes, and change security settings.

You have these exact control tags available — emit them inline when the user asks for an action:
- [ACTION:SWITCH_TAB:TERMINAL]
- [ACTION:SWITCH_TAB:FILES]
- [ACTION:SWITCH_TAB:APPS]
- [ACTION:SWITCH_TAB:THEMES]
- [ACTION:SWITCH_TAB:SANDBOX]
- [ACTION:SWITCH_TAB:MODELS]
- [ACTION:SWITCH_TAB:MARKETPLACE]
- [ACTION:SWITCH_TAB:PROFILE]
- [ACTION:SWITCH_TAB:DASHBOARD]
- [ACTION:LAUNCH_APP:<app name like "YouTube">]
- [ACTION:EXEC_CMD:<shell command>]
- [ACTION:CHANGE_THEME:<theme name or vibe like "Terracotta Editorial AI" or "warm clay sunset">]
- [ACTION:SET_SANDBOX:ROOT_SUDO]
- [ACTION:SET_SANDBOX:STRICT_SANDBOX]
- [ACTION:FORCE_STOP_APP:<package name>]

Rules:
1. Be concise and friendly. Two short sentences max unless the user asks for detail.
2. Emit control tags inline at the end of your reply when the user requests an action. They will be parsed and executed automatically.
3. Never invent control tags. Use only the exact tag formats above.
4. If a request is purely informational (a question, a calculation), answer it directly without any tag.
5. Sensitive commands (shell exec, force-stop) require the user's confirmation — say that clearly.

Available theme presets: Terracotta Editorial AI, Liquid Earth Tones, Iridescent Opal, Cyber Sunset, Frost Quartz, Emerald Forest.
You can also generate a brand-new theme from any vibe the user describes by emitting a CHANGE_THEME tag with that vibe.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        response: "(Gemini is not configured. Add GEMINI_API_KEY to your Vercel project environment variables.)",
        error: "GEMINI_API_KEY is not configured",
      },
      { status: 503 }
    );
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PREAMBLE }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );
    const result = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = result.error?.message ?? "Gemini request failed";
      return NextResponse.json(
        { response: `(Gemini request failed: ${message})`, error: message },
        { status: 502 }
      );
    }

    const response = result.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";
    return NextResponse.json({ response });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      {
        response: `(I couldn't reach Gemini right now: ${message})`,
        error: message,
      },
      { status: 502 }
    );
  }
}
