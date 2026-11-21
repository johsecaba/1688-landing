/**
 * The only model id in the app. `streamText` sends this plain
 * `provider/model` string through the Vercel AI Gateway: OIDC on Vercel,
 * `AI_GATEWAY_API_KEY` locally.
 *
 * Gemini 3.8 Flash is the current high-efficiency Gemini Flash — strong
 * instruction following for citations and refusals, at flash rather than
 * frontier prices. The chat route asks for low reasoning so tokens start
 * streaming without a long hidden preamble.
 */
export const BIBLE_MODEL = "google/gemini-3.8-flash";
