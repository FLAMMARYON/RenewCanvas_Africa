import type { AuthPublicUser } from "./auth";

export type AnalyticsEventRecord = {
  id: string;
  userId: string | null;
  sessionId: string | null;
  eventName: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  occurredAt: Date;
  createdAt: Date;
};

export type AnalyticsDatabase = {
  analyticsEvent: {
    create(args: { data: Record<string, unknown> }): Promise<AnalyticsEventRecord>;
    findMany(args: { where: Record<string, unknown> }): Promise<AnalyticsEventRecord[]>;
  };
  analyticsDailyAggregate: {
    upsert(args: { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<unknown>;
    findMany(args: { where: Record<string, unknown>; orderBy: { date: "desc" } }): Promise<unknown[]>;
  };
};

export async function trackAnalyticsEvent(
  db: AnalyticsDatabase,
  input: {
    user?: AuthPublicUser | null;
    sessionId?: string;
    eventName: string;
    entityType?: string;
    entityId?: string;
    metadata?: unknown;
    occurredAt?: Date;
  }
) {
  const eventName = cleanText(input.eventName, 100) ?? "unknown";
  return normalizeEvent(
    await db.analyticsEvent.create({
      data: {
        userId: input.user?.id,
        sessionId: cleanText(input.sessionId, 120),
        eventName,
        entityType: cleanText(input.entityType, 80),
        entityId: cleanText(input.entityId, 120),
        metadata: input.metadata,
        occurredAt: input.occurredAt ?? new Date(),
      },
    })
  );
}

export async function aggregateDailyEvents(db: AnalyticsDatabase, date: Date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const nextDay = new Date(day.getTime() + 1000 * 60 * 60 * 24);
  const events = await db.analyticsEvent.findMany({ where: { occurredAt: { gte: day, lt: nextDay } } });
  const counts = new Map<string, number>();
  for (const event of events) counts.set(event.eventName, (counts.get(event.eventName) ?? 0) + 1);
  for (const [metric, value] of counts) {
    await db.analyticsDailyAggregate.upsert({
      where: { date_metric_entityType_entityId: { date: day, metric, entityType: null, entityId: null } },
      update: { value },
      create: { date: day, metric, entityType: null, entityId: null, value },
    });
  }
  return Object.fromEntries(counts);
}

function normalizeEvent(event: AnalyticsEventRecord) {
  return {
    id: event.id,
    userId: event.userId,
    sessionId: event.sessionId,
    eventName: event.eventName,
    entityType: event.entityType,
    entityId: event.entityId,
    occurredAt: event.occurredAt.toISOString(),
  };
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
