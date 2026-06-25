import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtworkCard } from "@/components/ArtworkCard";
import type { FrontendArtwork } from "@/lib/frontend/artworks-api";
import { addToWishlist, removeFromWishlist } from "@/lib/frontend/wishlist-api";

// The card calls the wishlist API on click; stub it so the test stays offline
// and deterministic, and so we can assert how the component uses it.
jest.mock("@/lib/frontend/wishlist-api", () => ({
  addToWishlist: jest.fn().mockResolvedValue(undefined),
  removeFromWishlist: jest.fn().mockResolvedValue(undefined),
}));

/** Build a minimal-but-valid artwork; override only the fields a test cares about. */
function makeArtwork(overrides: Partial<FrontendArtwork> = {}): FrontendArtwork {
  return {
    id: "art_1",
    slug: "ocean-bloom",
    title: "Ocean Bloom",
    description: "A coral reef sculpted from reclaimed bottle caps.",
    category: "sculpture",
    ownerType: "artist",
    status: "published",
    priceAmount: 12000,
    currency: "RWF",
    dimensions: "40x40cm",
    kgDiverted: 2.5,
    viewCount: 0,
    favouriteCount: 4,
    rejectionReason: null,
    submittedAt: null,
    reviewedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    artist: { id: "usr_1", name: "Amina K.", email: "amina@example.com", phone: null },
    images: [{ id: "img_1", url: "/art.jpg", altText: "Ocean Bloom", sortOrder: 0 }],
    materials: [],
    latestPricingRecommendation: null,
    latestImpactEstimate: null,
    ...overrides,
  } as FrontendArtwork;
}

describe("ArtworkCard", () => {
  it("renders the core artwork details", () => {
    render(<ArtworkCard artwork={makeArtwork()} compact={false} onStatus={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Ocean Bloom" })).toBeInTheDocument();
    expect(screen.getByText("by Amina K.")).toBeInTheDocument();
    expect(screen.getByText("12,000 RWF")).toBeInTheDocument();
    expect(screen.getByText(/2\.5 kg diverted/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ocean Bloom" })).toHaveAttribute("src", "/art.jpg");
  });

  it("falls back to the RenewCanvas name when there is no artist", () => {
    render(
      <ArtworkCard artwork={makeArtwork({ artist: null })} compact={false} onStatus={jest.fn()} />,
    );
    expect(screen.getByText("by RenewCanvas Africa")).toBeInTheDocument();
  });

  it("optimistically saves to the wishlist and reports status on click", async () => {
    const user = userEvent.setup();
    const onStatus = jest.fn();
    render(<ArtworkCard artwork={makeArtwork()} compact={false} onStatus={onStatus} />);

    const saveButton = screen.getByRole("button", { name: "Save to wishlist" });
    expect(saveButton).toHaveAttribute("aria-pressed", "false");
    expect(saveButton).toHaveTextContent("4");

    await user.click(saveButton);

    // Optimistic update: the favourite count bumps immediately.
    expect(saveButton).toHaveTextContent("5");
    expect(saveButton).toHaveAttribute("aria-pressed", "true");
    expect(addToWishlist).toHaveBeenCalledWith("art_1");
    await waitFor(() =>
      expect(onStatus).toHaveBeenCalledWith("Artwork saved to your wishlist."),
    );
    expect(removeFromWishlist).not.toHaveBeenCalled();
  });

  it("reverts the optimistic update when the API call fails", async () => {
    (addToWishlist as jest.Mock).mockRejectedValueOnce(new Error("Sign in as a buyer to save artwork."));
    const user = userEvent.setup();
    const onStatus = jest.fn();
    render(<ArtworkCard artwork={makeArtwork()} compact={false} onStatus={onStatus} />);

    const saveButton = screen.getByRole("button", { name: "Save to wishlist" });
    await user.click(saveButton);

    await waitFor(() =>
      expect(onStatus).toHaveBeenCalledWith("Sign in as a buyer to save artwork."),
    );
    // Count and pressed state roll back to their original values.
    expect(saveButton).toHaveTextContent("4");
    expect(saveButton).toHaveAttribute("aria-pressed", "false");
  });
});
