import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { normalizeArtwork } from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

const RECOMMENDATION_LIMIT = 6;

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const sessionToken = readSessionCookie(request);
    const user = await readSessionUser(db, sessionToken);

    // If logged in as a buyer, get personalized recommendations
    if (user?.role === "buyer") {
      // Get categories from wishlist and past orders
      const [wishlistCategories, orderCategories] = await Promise.all([
        db.wishlistItem.findMany({
          where: { buyerId: user.id },
          select: { artwork: { select: { id: true, category: true } } },
        }),
        db.orderItem.findMany({
          where: { order: { buyerId: user.id } },
          select: { artwork: { select: { category: true } } },
        }),
      ]);

      // Extract unique categories
      const categories = new Set<string>();
      for (const item of wishlistCategories) {
        if (item.artwork?.category) {
          categories.add(item.artwork.category);
        }
      }
      for (const item of orderCategories) {
        if (item.artwork?.category) {
          categories.add(item.artwork.category);
        }
      }

      // If the buyer has history, find matching artworks
      if (categories.size > 0) {
        const categoryList = Array.from(categories);

        // Get wishlist artwork IDs to exclude from recommendations
        const wishlistArtworkIds = wishlistCategories
          .map((item: { artwork: { id: string; category: string } | null }) => item.artwork?.id)
          .filter((id): id is string => Boolean(id));

        const artworks = await db.artwork.findMany({
          where: {
            status: "listed",
            category: { in: categoryList },
            id: { notIn: wishlistArtworkIds.length > 0 ? wishlistArtworkIds : undefined },
          },
          include: {
            artist: { select: { id: true, name: true, email: true } },
            images: { orderBy: { sortOrder: "asc" } },
            materials: true,
            pricingRecommendations: { orderBy: { createdAt: "desc" }, take: 1 },
            impactEstimates: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
          take: RECOMMENDATION_LIMIT,
        });

        // If we found recommendations based on categories, return them
        if (artworks.length > 0) {
          return NextResponse.json({
            ok: true,
            artworks: artworks.map(normalizeArtwork),
            source: "personalized",
          });
        }
      }
    }

    // Fallback: return most recently listed artworks
    const artworks = await db.artwork.findMany({
      where: { status: "listed" },
      include: {
        artist: { select: { id: true, name: true, email: true } },
        images: { orderBy: { sortOrder: "asc" } },
        materials: true,
        pricingRecommendations: { orderBy: { createdAt: "desc" }, take: 1 },
        impactEstimates: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: RECOMMENDATION_LIMIT,
    });

    return NextResponse.json({
      ok: true,
      artworks: artworks.map(normalizeArtwork),
      source: "recent",
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
