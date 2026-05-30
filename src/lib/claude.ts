/**
 * Claude Sonnet API (raw fetch, 不引入 SDK) — F-10 / F-11。
 *
 * 為什麼 raw fetch：每天只跑一次、用量極低、不需要 SDK 的 streaming / retry / batching。
 * 之後若要 prompt caching、tool use 再評估升 SDK。
 */

const MODEL_ID = "claude-sonnet-4-6";

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function callClaude(opts: {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status} ${res.statusText} ${errBody.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = json.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Claude response has no text content");
  return text;
}
