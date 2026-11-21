import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { sanitizeMessages } from "@/lib/messages";
import { BIBLE_MODEL } from "@/lib/model";
import { BIBLE_INSTRUCTIONS } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "The request could not be read." },
      { status: 400 },
    );
  }

  const rawMessages =
    payload && typeof payload === "object" && "messages" in payload
      ? (payload as { messages: unknown }).messages
      : null;

  const messages = sanitizeMessages(rawMessages);
  const latest = messages.at(-1);

  if (!latest || latest.role !== "user") {
    return Response.json(
      { error: "Ask a question about the Bible to begin." },
      { status: 400 },
    );
  }

  try {
    const result = streamText({
      model: BIBLE_MODEL,
      instructions: BIBLE_INSTRUCTIONS,
      messages: await convertToModelMessages(messages),
      reasoning: "low",
      maxOutputTokens: 1800,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        sendReasoning: false,
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : "";
          console.error(
            "stream error",
            error instanceof Error ? error.name : typeof error,
          );
          const lower = message.toLowerCase();
          if (
            lower.includes("unauthenticated") ||
            lower.includes("api key") ||
            lower.includes("unauthorized") ||
            lower.includes("oidc")
          ) {
            return "The guide could not sign in. On Vercel this is automatic; a local copy needs AI_GATEWAY_API_KEY.";
          }
          if (
            lower.includes("credit") ||
            lower.includes("insufficient") ||
            lower.includes("402")
          ) {
            return "The guide is unavailable until AI Gateway credits are added for this Vercel team.";
          }
          return "The reply was interrupted. Please try again.";
        },
      }),
    });
  } catch (error) {
    console.error(
      "chat route failed",
      error instanceof Error ? error.message : "unknown",
    );
    return Response.json(
      { error: "The guide is unavailable right now." },
      { status: 503 },
    );
  }
}
