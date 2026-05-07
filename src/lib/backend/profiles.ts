import { AuthError, type AuthPublicUser, type AuthUserRole } from "./auth";

type RoleProfileRecord = Record<string, unknown> | null;

export type ProfileAddressRecord = {
  id: string;
  userId: string;
  label: string;
  recipientName: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

export type ProfileDatabase = {
  buyerProfile: {
    findUnique(args: { where: { userId: string } }): Promise<RoleProfileRecord>;
    upsert(args: {
      where: { userId: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<RoleProfileRecord>;
  };
  artistProfile: {
    findUnique(args: { where: { userId: string } }): Promise<RoleProfileRecord>;
    upsert(args: {
      where: { userId: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<RoleProfileRecord>;
  };
  adminProfile: {
    findUnique(args: { where: { userId: string } }): Promise<RoleProfileRecord>;
    upsert(args: {
      where: { userId: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<RoleProfileRecord>;
  };
  address: {
    findFirst(args: {
      where: { userId: string; isDefault?: boolean };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<ProfileAddressRecord | null>;
    upsert(args: {
      where: { userId_label: { userId: string; label: string } };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<ProfileAddressRecord>;
  };
};

export type BuyerProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  notifications?: {
    orderUpdates?: boolean;
    promotions?: boolean;
    newArtworks?: boolean;
    artistUpdates?: boolean;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
};

export type ArtistProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  specialties?: string[];
  techniques?: string[];
  preferredMaterials?: string[];
  yearsExperience?: number;
  payoutMethod?: string;
  payoutAccountName?: string;
  payoutAccountNumber?: string;
  payoutBankName?: string;
};

export type AdminProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
};

export type ProfileUpdateInput = BuyerProfileInput | ArtistProfileInput | AdminProfileInput;

export async function getProfile(db: ProfileDatabase, user: AuthPublicUser) {
  const roleProfile = await findRoleProfile(db, user.role, user.id);
  const defaultAddress =
    user.role === "buyer"
      ? await db.address.findFirst({
          where: { userId: user.id, isDefault: true },
          orderBy: { createdAt: "asc" },
        })
      : null;

  return normalizeProfile(user, roleProfile, defaultAddress);
}

export async function updateProfile(
  db: ProfileDatabase,
  user: AuthPublicUser,
  input: ProfileUpdateInput
) {
  if (!input || typeof input !== "object") {
    throw new AuthError("invalid_profile", "Profile payload must be an object.", 400);
  }

  if (user.role === "buyer") {
    await updateBuyerProfile(db, user, input as BuyerProfileInput);
  } else if (user.role === "artist") {
    await updateArtistProfile(db, user, input as ArtistProfileInput);
  } else {
    await updateAdminProfile(db, user, input as AdminProfileInput);
  }

  return getProfile(db, user);
}

function findRoleProfile(db: ProfileDatabase, role: AuthUserRole, userId: string) {
  if (role === "buyer") return db.buyerProfile.findUnique({ where: { userId } });
  if (role === "artist") return db.artistProfile.findUnique({ where: { userId } });
  return db.adminProfile.findUnique({ where: { userId } });
}

async function updateBuyerProfile(db: ProfileDatabase, user: AuthPublicUser, input: BuyerProfileInput) {
  const profileData = {
    firstName: cleanText(input.firstName, 80),
    lastName: cleanText(input.lastName, 80),
    phone: cleanText(input.phone, 40),
    notifyOrderUpdates: boolOrDefault(input.notifications?.orderUpdates, true),
    notifyPromotions: boolOrDefault(input.notifications?.promotions, false),
    notifyNewArtworks: boolOrDefault(input.notifications?.newArtworks, true),
    notifyArtistUpdates: boolOrDefault(input.notifications?.artistUpdates, true),
  };

  await db.buyerProfile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: { userId: user.id, ...profileData },
  });

  if (input.address) {
    const line1 = cleanText(input.address.line1, 160);
    const city = cleanText(input.address.city, 80);
    const country = cleanText(input.address.country, 80);

    if (!line1 || !city || !country) {
      throw new AuthError("invalid_address", "Default address requires street, city, and country.", 400);
    }

    await db.address.upsert({
      where: { userId_label: { userId: user.id, label: "Default delivery" } },
      update: {
        recipientName: fullName(profileData.firstName, profileData.lastName) || user.name,
        phone: profileData.phone,
        line1,
        line2: cleanText(input.address.line2, 160),
        city,
        region: cleanText(input.address.region, 80),
        postalCode: cleanText(input.address.postalCode, 40),
        country,
        isDefault: true,
      },
      create: {
        userId: user.id,
        label: "Default delivery",
        recipientName: fullName(profileData.firstName, profileData.lastName) || user.name,
        phone: profileData.phone,
        line1,
        line2: cleanText(input.address.line2, 160),
        city,
        region: cleanText(input.address.region, 80),
        postalCode: cleanText(input.address.postalCode, 40),
        country,
        isDefault: true,
      },
    });
  }
}

async function updateArtistProfile(db: ProfileDatabase, user: AuthPublicUser, input: ArtistProfileInput) {
  const profileData = {
    firstName: cleanText(input.firstName, 80),
    lastName: cleanText(input.lastName, 80),
    phone: cleanText(input.phone, 40),
    bio: cleanText(input.bio, 500),
    location: cleanText(input.location, 120),
    website: cleanText(input.website, 160),
    instagram: cleanText(input.instagram, 80),
    twitter: cleanText(input.twitter, 80),
    facebook: cleanText(input.facebook, 120),
    specialties: cleanStringList(input.specialties, 12, 80),
    techniques: cleanStringList(input.techniques, 12, 80),
    preferredMaterials: cleanStringList(input.preferredMaterials, 16, 80),
    yearsExperience: boundedInteger(input.yearsExperience, 0, 80),
    payoutMethod: cleanText(input.payoutMethod, 80),
    payoutAccountName: cleanText(input.payoutAccountName, 120),
    payoutAccountNumber: cleanText(input.payoutAccountNumber, 80),
    payoutBankName: cleanText(input.payoutBankName, 120),
  };

  await db.artistProfile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: { userId: user.id, ...profileData },
  });
}

async function updateAdminProfile(db: ProfileDatabase, user: AuthPublicUser, input: AdminProfileInput) {
  const profileData = {
    firstName: cleanText(input.firstName, 80),
    lastName: cleanText(input.lastName, 80),
    phone: cleanText(input.phone, 40),
    title: cleanText(input.title, 100),
  };

  await db.adminProfile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: { userId: user.id, ...profileData },
  });
}

function normalizeProfile(
  user: AuthPublicUser,
  profile: RoleProfileRecord,
  defaultAddress: ProfileAddressRecord | null
) {
  const baseProfile = profile ?? {};
  return {
    user,
    profile: baseProfile,
    address: defaultAddress,
    displayName:
      fullName(String(baseProfile.firstName ?? ""), String(baseProfile.lastName ?? "")) || user.name,
  };
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanStringList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean)
    )
  ).slice(0, maxItems);
}

function boundedInteger(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function boolOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function fullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
