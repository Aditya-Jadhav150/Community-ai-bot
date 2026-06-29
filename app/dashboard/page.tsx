"use client";

import { useDemoData } from "@/context/DemoDataContext";
import { Card } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";

export default function DashboardPage() {
  const { reports, users } = useDemoData();

  const resolvedCount = reports.filter(r => r.status === "RESOLVED").length;
  
  const stats = {
    reported: reports.length,
    resolved: resolvedCount,
    avgTime: resolvedCount > 0 ? "3.2 days" : "N/A",
    users: users.length,
  };

  const types: Record<string, number> = {};
  reports.forEach(r => {
    types[r.category] = (types[r.category] || 0) + 1;
  });
  
  const issuesByType = Object.entries(types).map(([name, value]) => ({ name, value }));
  
  // Mock issues over time since we need dates grouped
  const issuesOverTime = [
    { name: "Mon", issues: 4 },
    { name: "Tue", issues: 7 },
    { name: "Wed", issues: 5 },
    { name: "Thu", issues: 12 },
    { name: "Fri", issues: 8 },
    { name: "Sat", issues: 15 },
    { name: "Sun", issues: 10 },
  ];

  const COLORS = ['#00AEFF', '#00FFE0', '#9B5DE5', '#FF9500', '#FF3B30'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Impact Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FF3B30]/20 rounded-full text-[#FF3B30]"><AlertTriangle /></div>
            <div>
              <p className="text-sm text-muted-foreground uppercase">Total Issues</p>
              <p className="text-3xl font-bold">{stats.reported}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#30D158]/20 rounded-full text-[#30D158]"><CheckCircle /></div>
            <div>
              <p className="text-sm text-muted-foreground uppercase">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00AEFF]/20 rounded-full text-[#00AEFF]"><Clock /></div>
            <div>
              <p className="text-sm text-muted-foreground uppercase">Avg Resolution</p>
              <p className="text-3xl font-bold">{stats.avgTime}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#9B5DE5]/20 rounded-full text-[#9B5DE5]"><Users /></div>
            <div>
              <p className="text-sm text-muted-foreground uppercase">Active Heroes</p>
              <p className="text-3xl font-bold">{stats.users}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Issues Reported (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={issuesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3C" />
                <XAxis dataKey="name" stroke="#ABABAB" />
                <YAxis stroke="#ABABAB" />
                <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#3A3A3C' }} />
                <Line type="monotone" dataKey="issues" stroke="#00AEFF" strokeWidth={3} dot={{ r: 4, fill: '#00AEFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Issues by Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issuesByType}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {issuesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#3A3A3C' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Predictive Insights Stub */}
      <Card className="glass-card p-6 border-[#00FFE0]/30 shadow-[0_0_20px_rgba(0,255,224,0.05)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FFE0] animate-pulse"></span>
          AI Predictive Insights
        </h3>
        <p className="text-muted-foreground mb-4">
          Agent 5 (Insights) has detected 2 recurring hotspots in your district based on historical patterns.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-[#FF9500]/30">
            <p className="font-semibold text-[#FF9500]">Road Zone 4 — 87% probability of pothole recurrence</p>
            <p className="text-sm text-muted-foreground mt-1">High traffic area with historical degradation. Preemptive resurfacing recommended.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-[#9B5DE5]/30">
            <p className="font-semibold text-[#9B5DE5]">Market Square — 75% probability of illegal dumping</p>
            <p className="text-sm text-muted-foreground mt-1">Frequent dumping reported after weekends. Recommend installing additional bins.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
