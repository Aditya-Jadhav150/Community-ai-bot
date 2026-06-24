"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ShieldAlert, UserCog, Edit3, Trash2, CheckCircle, Clock } from "lucide-react";

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then(res => res.json())
      .then(d => setLogs(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading activity log...</div>;

  const getIconForAction = (action: string) => {
    if (action.includes("STATUS") || action.includes("RESOLVED")) return <CheckCircle className="w-5 h-5 text-[#30D158]" />;
    if (action.includes("ESCALATE")) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (action.includes("ROLE") || action.includes("SUSPEND")) return <UserCog className="w-5 h-5 text-[#00AEFF]" />;
    if (action.includes("DELETE")) return <Trash2 className="w-5 h-5 text-red-700" />;
    if (action.includes("ASSIGN")) return <Edit3 className="w-5 h-5 text-[#9B5DE5]" />;
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const formatMetadata = (metadata: string) => {
    try {
      const parsed = JSON.parse(metadata);
      return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(" | ");
    } catch {
      return metadata;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Activity Log</h1>

      <Card className="glass-card p-6 border border-white/10">
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity recorded yet.</p>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0A0A0A] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                  {getIconForAction(log.action)}
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#9B5DE5] text-sm">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-white/80 mb-2">
                    <span className="font-semibold text-white">{log.admin.name}</span> performed action on {log.targetType} <span className="font-mono text-xs bg-black/50 px-1 py-0.5 rounded text-white/60">{log.targetId.slice(-6)}</span>
                  </div>
                  {log.metadata && log.metadata !== "{}" && (
                    <div className="p-2 bg-black/30 rounded text-xs text-muted-foreground font-mono truncate">
                      {formatMetadata(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
