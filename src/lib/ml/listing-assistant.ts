/**
 * Listing Assistant (F06)
 *
 * Uses Claude AI to improve artwork descriptions, suggest tags,
 * and recommend price ranges for artist listings.
 */

import { artworkCategories, recyclableMaterials, type ArtworkCategory, type RecyclableMaterial } from "./schemas";

export const LISTING_ASSISTANT_VERSION = "listing-assistant-v1";

export type ListingAssistantInput = {
  title: string;
  description: string;
  materials: string[];
  price: number;
  category?: string;
  dimensions?: string;
};

export type ListingAssistantOutput = {
  improvedDescription: string;
  suggestedTags: string[];
  priceRange: {
    min: number;
    max: number;
    currency: "RWF";
    reasoning: string;
  };
  titleSuggestion?: string;
  marketingTips: string[];
  version: string;
};

export type ListingAssistantValidation =
  | { ok: true; value: ListingAssistantInput }
  | { ok: false; errors: Record<string, string> };

/**
 * Validates listing assistant input
 */
export function validateListingAssistantInput(input: unknown): ListingAssistantValidation {
  const errors: Record<string, string> = {};

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: { input: "Invalid input format." } };
  }

  const record = input as Record<string, unknown>;

  // Title validation
  if (typeof record.title !== "string" || record.title.trim().length === 0) {
    errors.title = "Title is required.";
  } else if (record.title.length > 200) {
    errors.title = "Title must be 200 characters or less.";
  }

  // Description validation
  if (typeof record.description !== "string") {
    errors.description = "Description is required.";
  } else if (record.description.length > 5000) {
    errors.description = "Description must be 5000 characters or less.";
  }

  // Materials validation
  if (!Array.isArray(record.materials) || record.materials.length === 0) {
    errors.materials = "At least one material is required.";
  } else if (record.materials.length > 12) {
    errors.materials = "Maximum 12 materials allowed.";
  }

  // Price validation
  const price = Number(record.price);
  if (typeof record.price === "undefined" || isNaN(price)) {
    errors.price = "Price is required.";
  } else if (price < 0 || price > 10000000) {
    errors.price = "Price must be between 0 and 10,000,000 RWF.";
  }

  // Optional: Category validation
  if (record.category !== undefined && typeof record.category !== "string") {
    errors.category = "Category must be a string.";
  }

  // Optional: Dimensions validation
  if (record.dimensions !== undefined && typeof record.dimensions !== "string") {
    errors.dimensions = "Dimensions must be a string.";
  } else if (typeof record.dimensions === "string" && record.dimensions.length > 100) {
    errors.dimensions = "Dimensions must be 100 characters or less.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      materials: record.materials as string[],
      price,
      category: record.category as string | undefined,
      dimensions: record.dimensions as string | undefined,
    },
  };
}

/**
 * Builds the prompt for Claude AI
 */
export function buildListingAssistantPrompt(input: ListingAssistantInput): string {
  const materialsList = input.materials.join(", ");
  const categoryInfo = input.category ? `Category: ${input.category}` : "";
  const dimensionsInfo = input.dimensions ? `Dimensions: ${input.dimensions}` : "";

  return `You are a listing assistant for RenewCanvas Africa, a marketplace for upcycled art made from recycled materials in Rwanda/Africa.

Analyze this artwork listing and provide improvements:

**ARTWORK DETAILS:**
Title: ${input.title}
${categoryInfo}
${dimensionsInfo}
Materials used: ${materialsList}
Current price: ${input.price.toLocaleString()} RWF
Artist's description:
${input.description || "(No description provided)"}

**YOUR TASKS:**

1. **Improved Description**: Write a compelling 2-3 paragraph description that:
   - Highlights the environmental impact (recycled materials transformed into art)
   - Tells a story about the artwork's creation and meaning
   - Appeals to sustainability-conscious buyers
   - Maintains the artist's voice if they provided a description
   - Keep it under 500 words

2. **Suggested Tags**: Provide 5-8 relevant tags for search and discovery. Include:
   - Material types
   - Art style/category
   - Use case (home decor, gift, etc.)
   - Sustainability keywords

3. **Price Range**: Analyze the price and suggest a range in RWF based on:
   - Materials used and their rarity
   - Typical upcycled art market prices in Africa
   - The complexity implied by the description
   - Provide min, max, and reasoning

4. **Title Suggestion** (optional): If the title could be more compelling, suggest an alternative.

5. **Marketing Tips**: Provide 2-3 actionable tips to help the artist sell this piece.

Respond in this exact JSON format:
{
  "improvedDescription": "...",
  "suggestedTags": ["tag1", "tag2", ...],
  "priceRange": {
    "min": number,
    "max": number,
    "reasoning": "..."
  },
  "titleSuggestion": "..." or null,
  "marketingTips": ["tip1", "tip2", ...]
}

Only output valid JSON, no markdown code blocks or extra text.`;
}

/**
 * Parses Claude's response into structured output
 */
export function parseListingAssistantResponse(
  responseText: string,
  originalPrice: number
): ListingAssistantOutput {
  // Try to extract JSON from the response
  let jsonStr = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```")) {
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      jsonStr = match[1].trim();
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and sanitize the response
    const improvedDescription = typeof parsed.improvedDescription === "string"
      ? parsed.improvedDescription.slice(0, 2000)
      : "Unable to generate improved description.";

    const suggestedTags = Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags
          .filter((tag: unknown) => typeof tag === "string")
          .slice(0, 10)
          .map((tag: string) => tag.toLowerCase().trim())
      : ["upcycled", "sustainable", "african-art"];

    const priceRange = {
      min: typeof parsed.priceRange?.min === "number"
        ? Math.max(1000, Math.round(parsed.priceRange.min / 1000) * 1000)
        : Math.round(originalPrice * 0.7 / 1000) * 1000,
      max: typeof parsed.priceRange?.max === "number"
        ? Math.min(10000000, Math.round(parsed.priceRange.max / 1000) * 1000)
        : Math.round(originalPrice * 1.5 / 1000) * 1000,
      currency: "RWF" as const,
      reasoning: typeof parsed.priceRange?.reasoning === "string"
        ? parsed.priceRange.reasoning.slice(0, 500)
        : "Price range based on materials and complexity.",
    };

    // Ensure min <= max
    if (priceRange.min > priceRange.max) {
      const temp = priceRange.min;
      priceRange.min = priceRange.max;
      priceRange.max = temp;
    }

    const titleSuggestion = typeof parsed.titleSuggestion === "string" && parsed.titleSuggestion.trim()
      ? parsed.titleSuggestion.slice(0, 200)
      : undefined;

    const marketingTips = Array.isArray(parsed.marketingTips)
      ? parsed.marketingTips
          .filter((tip: unknown) => typeof tip === "string")
          .slice(0, 5)
      : ["Take high-quality photos in natural light.", "Share your artwork's story on social media."];

    return {
      improvedDescription,
      suggestedTags,
      priceRange,
      titleSuggestion,
      marketingTips,
      version: LISTING_ASSISTANT_VERSION,
    };
  } catch {
    // Fallback response if JSON parsing fails
    return {
      improvedDescription: responseText.slice(0, 1000) || "Unable to generate improved description.",
      suggestedTags: ["upcycled", "sustainable", "recycled", "african-art", "eco-friendly"],
      priceRange: {
        min: Math.round(originalPrice * 0.7 / 1000) * 1000,
        max: Math.round(originalPrice * 1.5 / 1000) * 1000,
        currency: "RWF",
        reasoning: "Price range estimated based on typical upcycled art pricing.",
      },
      marketingTips: [
        "Take high-quality photos in natural light.",
        "Share your artwork's story on social media.",
        "Highlight the environmental impact of your materials.",
      ],
      version: LISTING_ASSISTANT_VERSION,
    };
  }
}

/**
 * Calls the Anthropic API to get listing suggestions
 */
export async function callListingAssistant(
  input: ListingAssistantInput,
  apiKey: string
): Promise<ListingAssistantOutput> {
  // Debug logging to confirm API key is passed
  console.log("[listing-assistant] DEBUG: callListingAssistant received apiKey =", apiKey ? `sk-...${apiKey.slice(-8)}` : "undefined");

  const prompt = buildListingAssistantPrompt(input);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();

  // Extract text from the response
  const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
  const responseText = textBlock?.text || "";

  return parseListingAssistantResponse(responseText, input.price);
}
