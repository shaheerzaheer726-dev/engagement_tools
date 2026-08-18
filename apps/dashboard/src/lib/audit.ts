import { getDb, type Prisma } from "@engagement-tools/database";

export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonObject;
}): Promise<void> {
  try {
    const db = getDb();
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
      },
    });
  } catch (error) {
    // Auditing should never break the primary action.
    console.error("Failed to write audit log:", error);
  }
}
