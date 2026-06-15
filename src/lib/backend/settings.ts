/**
 * Global platform settings — backed by the `SiteSetting` key/value table.
 *
 * Only the General-tab fields survive: maintenance mode, default language, and
 * support email. Reads fall back to sane defaults when a key has never been set.
 */
import type { PrismaClient } from "@prisma/client";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { SUPPORT_EMAIL } from "@/lib/config/constants";

export type PlatformSettings = {
  maintenanceMode: boolean;
  defaultLanguage: string;
  supportEmail: string;
};

const DEFAULTS: PlatformSettings = {
  maintenanceMode: false,
  defaultLanguage: "en",
  supportEmail: SUPPORT_EMAIL,
};

const KEYS = ["maintenanceMode", "defaultLanguage", "supportEmail"] as const;

export async function getPlatformSettings(db: PrismaClient): Promise<PlatformSettings> {
  const rows = await db.siteSetting.findMany({ where: { key: { in: [...KEYS] } } });
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const maintenance = map.get("maintenanceMode");
  const language = map.get("defaultLanguage");
  const support = map.get("supportEmail");
  return {
    maintenanceMode: typeof maintenance === "boolean" ? maintenance : DEFAULTS.maintenanceMode,
    defaultLanguage: typeof language === "string" ? language : DEFAULTS.defaultLanguage,
    supportEmail: typeof support === "string" ? support : DEFAULTS.supportEmail,
  };
}

/** Lightweight read of just the maintenance flag (used by the maintenance gate). */
export async function getMaintenanceMode(db: PrismaClient): Promise<boolean> {
  const row = await db.siteSetting.findUnique({ where: { key: "maintenanceMode" } });
  return row?.value === true;
}

export async function updatePlatformSettings(
  db: PrismaClient,
  input: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  if (typeof input.maintenanceMode === "boolean") {
    await upsert(db, "maintenanceMode", input.maintenanceMode);
  }
  if (typeof input.defaultLanguage === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(input.defaultLanguage)) {
    await upsert(db, "defaultLanguage", input.defaultLanguage);
  }
  if (typeof input.supportEmail === "string" && input.supportEmail.includes("@")) {
    await upsert(db, "supportEmail", input.supportEmail.trim().slice(0, 160));
  }
  return getPlatformSettings(db);
}

async function upsert(db: PrismaClient, key: string, value: boolean | string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
