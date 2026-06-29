export interface DemoActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  createdAt: string;
}

export const demoActivityLog: DemoActivityLog[] = [
  {
    id: "log_001",
    adminId: "user_demo_admin_001",
    adminName: "Priya Subramaniam",
    action: "STATUS_CHANGE",
    targetType: "Report",
    targetId: "rpt_001",
    metadata: { oldStatus: "OPEN", newStatus: "IN_PROGRESS", note: "Assigned to Roads & Infrastructure dept. Crew scheduled." },
    createdAt: "2026-06-24T09:00:00Z",
  },
  {
    id: "log_002",
    adminId: "user_demo_admin_001",
    adminName: "Priya Subramaniam",
    action: "REPORT_ASSIGNED",
    targetType: "Report",
    targetId: "rpt_002",
    metadata: { assignedTo: "Kumar Selvam" },
    createdAt: "2026-06-23T11:00:00Z",
  },
  {
    id: "log_003",
    adminId: "user_demo_admin_001",
    adminName: "Priya Subramaniam",
    action: "STATUS_CHANGE",
    targetType: "Report",
    targetId: "rpt_003",
    metadata: { oldStatus: "IN_PROGRESS", newStatus: "RESOLVED", note: "Leak fixed and pipe replaced." },
    createdAt: "2026-06-21T16:45:00Z",
  },
  {
    id: "log_004",
    adminId: "user_demo_admin_001",
    adminName: "Priya Subramaniam",
    action: "USER_SUSPENDED",
    targetType: "User",
    targetId: "user_011",
    metadata: { reason: "Submitting fake reports", durationDays: 7 },
    createdAt: "2026-06-20T10:15:00Z",
  },
  {
    id: "log_005",
    adminId: "user_demo_admin_001",
    adminName: "Priya Subramaniam",
    action: "REPORT_ESCALATED",
    targetType: "Report",
    targetId: "rpt_008",
    metadata: { reason: "High severity hazard requiring immediate intervention." },
    createdAt: "2026-06-18T14:20:00Z",
  }
];
