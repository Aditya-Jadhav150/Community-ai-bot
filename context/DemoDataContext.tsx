"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DemoReport, demoReports } from "@/lib/demoData/reports";
import { DemoUser, allDemoUsers } from "@/lib/demoData/users";
import { DemoDepartment, demoDepartments } from "@/lib/demoData/departments";
import { DemoActivityLog, demoActivityLog } from "@/lib/demoData/activityLog";
import { useDemoAuth } from "./DemoAuthContext";

interface DemoDataContextType {
  reports: DemoReport[];
  users: DemoUser[];
  departments: DemoDepartment[];
  activityLogs: DemoActivityLog[];
  upvoteReport: (reportId: string) => void;
  submitReport: (newReport: Omit<DemoReport, "id" | "createdAt" | "updatedAt" | "statusHistory" | "upvotes" | "verifications" | "comments" | "hasUserUpvoted">) => DemoReport;
  assignReport: (reportId: string, assignment: { type: "department" | "worker"; name: string; workerId?: string }) => void;
  changeStatus: (reportId: string, newStatus: string, note?: string) => void;
  escalateReport: (reportId: string, reason: string) => void;
  addComment: (reportId: string) => void;
  suspendUser: (userId: string, reason: string) => void;
  changeUserRole: (userId: string, newRole: "CITIZEN" | "ADMIN" | "WORKER") => void;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export const DemoDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useDemoAuth();
  
  // Use lazy initialization or just load from static memory. 
  // In a real demo, we don't even need to persist reports to localStorage, memory is fine for a single session.
  const [reports, setReports] = useState<DemoReport[]>(demoReports);
  const [users, setUsers] = useState<DemoUser[]>(allDemoUsers);
  const [departments, setDepartments] = useState<DemoDepartment[]>(demoDepartments);
  const [activityLogs, setActivityLogs] = useState<DemoActivityLog[]>(demoActivityLog);

  const logActivity = (action: string, targetType: string, targetId: string, metadata: any) => {
    if (!user) return;
    const newLog: DemoActivityLog = {
      id: `log_${Date.now()}`,
      adminId: user.id,
      adminName: user.name,
      action,
      targetType,
      targetId,
      metadata,
      createdAt: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const upvoteReport = (reportId: string) => {
    setReports(prev => prev.map(r =>
      r.id === reportId
        ? { ...r, upvotes: r.upvotes + 1, hasUserUpvoted: true }
        : r
    ));
  };

  const submitReport = (reportData: Omit<DemoReport, "id" | "createdAt" | "updatedAt" | "statusHistory" | "upvotes" | "verifications" | "comments" | "hasUserUpvoted">) => {
    const newReport: DemoReport = {
      ...reportData,
      id: `rpt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      hasUserUpvoted: false,
      verifications: 0,
      comments: 0,
      statusHistory: [{ status: reportData.status || "OPEN", changedAt: new Date().toISOString(), note: "Report submitted" }],
    };
    setReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const assignReport = (reportId: string, assignment: { type: "department" | "worker"; name: string; workerId?: string }) => {
    setReports(prev => prev.map(r =>
      r.id === reportId ? { 
        ...r, 
        assignedTo: assignment, 
        status: "ASSIGNED",
        updatedAt: new Date().toISOString(),
        statusHistory: [...r.statusHistory, { status: "ASSIGNED", changedAt: new Date().toISOString(), changedBy: user?.name, note: `Assigned to ${assignment.name}` }]
      } : r
    ));
    logActivity("REPORT_ASSIGNED", "Report", reportId, { assignedTo: assignment.name });
  };

  const changeStatus = (reportId: string, newStatus: string, note?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        logActivity("STATUS_CHANGE", "Report", reportId, { oldStatus: r.status, newStatus, note });
        return {
          ...r,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          resolvedAt: newStatus === "RESOLVED" ? new Date().toISOString() : r.resolvedAt,
          statusHistory: [...r.statusHistory, { status: newStatus, changedAt: new Date().toISOString(), changedBy: user?.name, note }]
        };
      }
      return r;
    }));
  };

  const escalateReport = (reportId: string, reason: string) => {
    changeStatus(reportId, "ESCALATED", reason);
    logActivity("REPORT_ESCALATED", "Report", reportId, { reason });
  };

  const addComment = (reportId: string) => {
    setReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, comments: r.comments + 1 } : r
    ));
  };

  const suspendUser = (userId: string, reason: string) => {
    logActivity("USER_SUSPENDED", "User", userId, { reason });
    // Minimal implementation for demo, we don't physically block login here since they are predefined demo users
  };

  const changeUserRole = (userId: string, newRole: "CITIZEN" | "ADMIN" | "WORKER") => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    logActivity("ROLE_CHANGED", "User", userId, { newRole });
  };

  return (
    <DemoDataContext.Provider value={{
      reports, users, departments, activityLogs,
      upvoteReport, submitReport, assignReport, changeStatus, escalateReport, addComment, suspendUser, changeUserRole
    }}>
      {children}
    </DemoDataContext.Provider>
  );
};

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (!context) throw new Error("useDemoData must be used within DemoDataProvider");
  return context;
};
