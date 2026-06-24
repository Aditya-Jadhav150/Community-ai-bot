"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, TrendingUp, Users, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ['#9B5DE5', '#00AEFF', '#00FFE0', '#F15BB5', '#FEE440'];

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading overview data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={data.totalReports} icon={<FileText className="w-5 h-5" />} color="text-white" />
        <StatCard title="Total Users" value={data.totalUsers} icon={<Users className="w-5 h-5" />} color="text-[#9B5DE5]" />
        <StatCard title="Avg Resolution" value={`${data.avgResolutionDays} days`} icon={<Clock className="w-5 h-5" />} color="text-[#00AEFF]" />
        <StatCard title="Past 30 Days" value={`+${data.timeBreakdown.last30d}`} icon={<TrendingUp className="w-5 h-5" />} color="text-[#00FFE0]" />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card p-6 flex items-center justify-between border-l-4 border-l-[#FF9500]">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Open Reports</p>
            <p className="text-3xl font-bold mt-1">{data.statusBreakdown.open}</p>
          </div>
          <div className="p-3 bg-[#FF9500]/10 rounded-full">
            <AlertCircle className="w-6 h-6 text-[#FF9500]" />
          </div>
        </Card>
        
        <Card className="glass-card p-6 flex items-center justify-between border-l-4 border-l-[#00AEFF]">
          <div>
            <p className="text-sm text-muted-foreground font-medium">In Progress</p>
            <p className="text-3xl font-bold mt-1">{data.statusBreakdown.inProgress}</p>
          </div>
          <div className="p-3 bg-[#00AEFF]/10 rounded-full">
            <Clock className="w-6 h-6 text-[#00AEFF]" />
          </div>
        </Card>

        <Card className="glass-card p-6 flex items-center justify-between border-l-4 border-l-[#30D158]">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Resolved</p>
            <p className="text-3xl font-bold mt-1">{data.statusBreakdown.resolved}</p>
          </div>
          <div className="p-3 bg-[#30D158]/10 rounded-full">
            <CheckCircle className="w-6 h-6 text-[#30D158]" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Line Chart */}
        <Card className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Report Volume (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#9B5DE5' }}
                />
                <Line type="monotone" dataKey="count" stroke="#9B5DE5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Issue Types</h3>
          <div className="h-72">
            {data.charts.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {data.topCategories.map((cat: any, i: number) => (
              <div key={cat.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="capitalize">{cat.type.replace(/_/g, " ").toLowerCase()}</span>
                </div>
                <span className="font-bold">{cat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-2 bg-white/5 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
