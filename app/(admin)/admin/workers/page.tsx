"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function AdminWorkersDeptsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState("");

  const fetchData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/departments")
      ]);
      const uJson = await uRes.json();
      const dJson = await dRes.json();
      setUsers(uJson);
      setDepartments(dJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDeptName) return;
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDeptName })
    });
    const json = await res.json();
    if (json.error) alert(json.error);
    else {
      setNewDeptName("");
      fetchData();
    }
  };

  const workers = users.filter(u => u.role === "WORKER" || u.role === "ADMIN" || u.role === "SUPERADMIN");

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workers and departments...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Workers & Departments</h1>

      <Tabs defaultValue="workers">
        <TabsList className="mb-4 bg-white/5 border border-white/10">
          <TabsTrigger value="workers">Workers ({workers.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <Card className="glass-card p-0 border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/40 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 font-medium">Worker</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">City</th>
                  <th className="px-6 py-3 font-medium">Reports Active</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {worker.image ? (
                        <img src={worker.image} className="w-8 h-8 rounded-full border border-white/20" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                          {(worker.name || "W")[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">{worker.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${worker.role === 'SUPERADMIN' ? 'text-[#9B5DE5] border-[#9B5DE5]/30 bg-[#9B5DE5]/10' : worker.role === 'ADMIN' ? 'text-[#00AEFF] border-[#00AEFF]/30 bg-[#00AEFF]/10' : 'text-[#30D158] border-[#30D158]/30 bg-[#30D158]/10'}`}>
                        {worker.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{worker.city || "-"}</td>
                    <td className="px-6 py-4 font-bold text-[#00FFE0]">{worker._count.issues || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {departments.map(dept => (
                <Card key={dept.id} className="glass-card p-4 flex items-center justify-between border-l-4 border-l-[#9B5DE5]">
                  <div>
                    <h3 className="font-bold text-lg">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Status: {dept.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{dept._count.issues}</p>
                    <p className="text-xs text-muted-foreground">Reports Handled</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="md:col-span-1">
              <Card className="glass-card p-6 border border-white/10">
                <h3 className="font-bold mb-4">Add Department</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Department Name</label>
                    <Input 
                      value={newDeptName} 
                      onChange={e => setNewDeptName(e.target.value)} 
                      placeholder="e.g. Sanitation, Roads..." 
                      className="bg-[#1A1A1A] border-white/10"
                    />
                  </div>
                  <Button onClick={handleCreateDepartment} className="w-full bg-[#9B5DE5] hover:bg-[#9B5DE5]/80 text-white font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Create Department
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
