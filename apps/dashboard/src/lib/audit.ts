import { db } from "@engagement-tools/database";

export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
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