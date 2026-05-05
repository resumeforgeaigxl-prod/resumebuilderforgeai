import { createClient } from '@/lib/supabase/server';

export type AuditEventType = 
    | 'LOGIN' 
    | 'RESUME_EXPORT' 
    | 'RESUME_DELETE' 
    | 'AI_USAGE' 
    | 'BILLING_CHANGE' 
    | 'SETTINGS_UPDATE';

export interface AuditLogEntry {
    userId: string;
    event: AuditEventType;
    resourceId?: string;
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
}

/**
 * Enterprise Audit Logging Service.
 * Ensures all sensitive actions are recorded for security and compliance.
 */
export async function logSecurityEvent({
    userId,
    event,
    resourceId,
    metadata,
    ip,
    userAgent
}: AuditLogEntry) {
    const supabase = createClient();
    
    try {
        const { error } = await supabase
            .from('security_audit_logs')
            .insert({
                user_id: userId,
                event_type: event,
                resource_id: resourceId,
                metadata: metadata || {},
                ip_address: ip,
                user_agent: userAgent,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('[AuditLog] Supabase Error:', error);
        }
    } catch (err) {
        console.error('[AuditLog] Failed to log security event:', err);
    }
}
