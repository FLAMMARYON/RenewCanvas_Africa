import type {
  ArtworkCategory,
  ImpactEstimate,
  PricingRecommendation,
  RecyclableMaterial,
} from "./schemas";
import type { MuseumCurationPlan } from "./curator";
import { defaultP1VerificationCopy, type P1VerificationQueueCopy } from "@/lib/i18n/p1-verification";

export type VerificationArtworkInput = {
  id: string;
  title: string;
  artistName: string;
  category: ArtworkCategory;
  materials: RecyclableMaterial[];
  materialWeightKg: number;
  verificationStatus: "unverified" | "needs_review" | "verified" | "rejected";
  pricingRecommendation?: PricingRecommendation;
  impactEstimate?: ImpactEstimate;
};

export type VerificationQueueItem = {
  artworkId: string;
  title: string;
  artistName: string;
  category: ArtworkCategory;
  materials: RecyclableMaterial[];
  verificationStatus: VerificationArtworkInput["verificationStatus"];
  pricingStatus: "ready" | "missing";
  impactStatus: "ready" | "missing";
  museumStatus: "placed" | "missing";
  museumRoom?: string;
  reviewFlags: string[];
  recommendedAction: "approve_ready" | "manual_review" | "request_more_info";
  plainLanguageSummary: string;
};

function roomTitleForArtwork(plan: MuseumCurationPlan | undefined, artworkId: string) {
  if (!plan) return undefined;
  const placement = plan.placements.find((item) => item.artworkId === artworkId);
  if (!placement) return undefined;
  return plan.rooms.find((room) => room.id === placement.roomId)?.title;
}

export function buildVerificationQueue(
  artworks: VerificationArtworkInput[],
  curationPlan?: MuseumCurationPlan,
  copy: P1VerificationQueueCopy = defaultP1VerificationCopy.queue
): VerificationQueueItem[] {
  return [...artworks]
    .sort((left, right) => {
      const statusPriority = { needs_review: 0, unverified: 1, verified: 2, rejected: 3 };
      const priorityDelta = statusPriority[left.verificationStatus] - statusPriority[right.verificationStatus];
      if (priorityDelta !== 0) return priorityDelta;
      return left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
    })
    .map((artwork) => {
      const museumRoom = roomTitleForArtwork(curationPlan, artwork.id);
      const reviewFlags: string[] = [];

      if (!artwork.pricingRecommendation) {
        reviewFlags.push(copy.flags.missingPricing);
      }

      if (!artwork.impactEstimate) {
        reviewFlags.push(copy.flags.missingImpact);
      } else if (artwork.impactEstimate.assumptions.length > 3) {
        reviewFlags.push(copy.flags.impactAssumptions);
      }

      if (!museumRoom) {
        reviewFlags.push(copy.flags.missingMuseumPlacement);
      }

      if (artwork.verificationStatus === "rejected") {
        reviewFlags.push(copy.flags.rejectedArtwork);
      }

      const pricingStatus = artwork.pricingRecommendation ? "ready" : "missing";
      const impactStatus = artwork.impactEstimate ? "ready" : "missing";
      const museumStatus = museumRoom ? "placed" : "missing";
      const ready = pricingStatus === "ready" && impactStatus === "ready" && museumStatus === "placed";
      const recommendedAction =
        artwork.verificationStatus === "rejected"
          ? "request_more_info"
          : ready && reviewFlags.length === 0
            ? "approve_ready"
            : reviewFlags.length >= 2
              ? "request_more_info"
              : "manual_review";

      return {
        artworkId: artwork.id,
        title: artwork.title,
        artistName: artwork.artistName,
        category: artwork.category,
        materials: artwork.materials,
        verificationStatus: artwork.verificationStatus,
        pricingStatus,
        impactStatus,
        museumStatus,
        museumRoom,
        reviewFlags,
        recommendedAction,
        plainLanguageSummary: copy.summary({
          title: artwork.title,
          pricingStatus,
          impactStatus,
          museumStatus,
          museumRoom,
        }),
      };
    });
}
