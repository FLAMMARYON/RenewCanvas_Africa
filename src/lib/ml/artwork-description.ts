import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

/**
 * Generates a short, plain-language artwork description from its title + tags
 * using Claude. Output is localised to the requested language. Falls back to a
 * deterministic template if the AI service is unavailable, so the endpoint
 * always returns something useful.
 */

export type ArtworkDescriptionInput = {
  title: string;
  category?: string | null;
  materials?: string[];
  tags?: string[];
  theme?: string | null;
  locale: Locale;
};

export function fallbackDescription(input: ArtworkDescriptionInput): string {
  const materials = (input.materials ?? []).filter(Boolean);
  const bits = [
    `${input.title} is a piece of upcycled art`,
    input.category ? `in the ${input.category} category` : "",
    materials.length ? `made from ${materials.slice(0, 4).join(", ")}` : "",
    input.theme ? `exploring ${input.theme}` : "",
  ].filter(Boolean);
  return `${bits.join(" ")}. Each RenewCanvas Africa work turns reclaimed waste into a story of renewal.`;
}

export async function generateArtworkDescription(
  input: ArtworkDescriptionInput,
  apiKey: string
): Promise<string> {
  const language = LOCALE_LABELS[input.locale] ?? "English";
  const facts = [
    `Title: ${input.title}`,
    input.category ? `Category: ${input.category}` : "",
    input.materials?.length ? `Materials: ${input.materials.join(", ")}` : "",
    input.tags?.length ? `Tags: ${input.tags.join(", ")}` : "",
    input.theme ? `Theme: ${input.theme}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You write short, warm, plain-language descriptions for an upcycled-art marketplace in Africa.
Write 2-3 sentences (max ~60 words) describing this artwork for a general audience. Avoid jargon and hype.
Write the description in ${language}.

${facts}

Return only the description text, no preamble.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status}`);
  }

  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) {
    throw new Error("Empty description from AI service.");
  }
  return text;
}
