/**
 * Frontend API client for the Listing Assistant
 */

export type ListingAssistantRequest = {
  title: string;
  description: string;
  materials: string[];
  price: number;
  category?: string;
  dimensions?: string;
};

export type ListingAssistantResponse = {
  ok: boolean;
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
  requestId: string;
  error?: string;
  errors?: Record<string, string>;
};

/**
 * Calls the listing assistant API to get AI suggestions for an artwork listing
 */
export async function getListingSuggestions(
  input: ListingAssistantRequest
): Promise<ListingAssistantResponse> {
  const response = await fetch("/api/pricing/listing-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error ||
        (payload.errors ? Object.values(payload.errors).join(", ") : "Failed to get suggestions.")
    );
  }

  return payload;
}
