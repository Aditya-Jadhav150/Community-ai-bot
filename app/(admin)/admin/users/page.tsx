"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowUpDown, Shield, Ban, ShieldCheck, UserCheck, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    const confirm = window.confirm(`Change this user's role to ${role}?`);
    if (confirm) {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (json.error) alert(json.error);
      else fetchData();
    }
  };

  const handleSuspend = async (id: string, action: "suspend" | "unsuspend") => {
    const confirm = window.confirm(`Are you sure you want to ${action} this user?`);
    if (confirm) {
      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days: 7 })
      });
      const json = await res.json();
      if (json.error) alert(json.error);
      else fetchData();
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "image",
        header: "User",
        cell: info => (
          <div className="flex items-center gap-3">
            {info.getValue<string>() ? (
              <img src={info.getValue<string>()} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                {(info.row.original.name || "U")[0]}
              </div>
            )}
            <div>
              <p className="font-bold">{info.row.original.username || info.row.original.name}</p>
              <p className="text-xs text-muted-foreground">{info.row.original.email}</p>
            </div>
          </div>
        )
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: info => {
          const role = info.getValue<string>();
          const color = role === "SUPERADMIN" ? "text-[#9B5DE5] border-[#9B5DE5]/30 bg-[#9B5DE5]/10" 
                      : role === "ADMIN" ? "text-[#00AEFF] border-[#00AEFF]/30 bg-[#00AEFF]/10"
                      : role === "WORKER" ? "text-[#30D158] border-[#30D158]/30 bg-[#30D158]/10"
                      : "text-muted-foreground border-white/10 bg-white/5";
          return <span className={`px-2 py-1 text-xs font-bold rounded border ${color}`}>{role}</span>;
        }
      },
      {
        accessorKey: "city",
        header: "City",
        cell: info => <span className="text-xs">{info.getValue<string>() || "-"}</span>
      },
      {
        accessorKey: "_count.issues",
        header: "Reports",
        cell: info => <span className="text-xs font-bold">{info.getValue<number>()}</span>
      },
      {
        accessorKey: "suspendedUntil",
        header: "Status",
        cell: info => {
          const suspended = info.getValue<string>();
          const isDeleted = info.row.original.deletedAt;
          if (isDeleted) return <span className="text-xs font-bold text-red-700">Deleted</span>;
          if (suspended && new Date(suspended) > new Date()) return <span className="text-xs font-bold text-red-500">Suspended</span>;
          return <span className="text-xs font-bold text-green-500">Active</span>;
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();

          return (
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-7 px-3 border border-white/20 hover:bg-white/10 transition-colors">
                  Manage
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto bg-[#0A0A0A] border-white/10">
                  <SheetHeader>
                    <SheetTitle>User Profile</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                       {user.image ? (
                        <img src={user.image} className="w-16 h-16 rounded-full border border-white/20 shrink-0 object-cover" alt="Avatar" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl shrink-0">
                          {(user.name || "U")[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold truncate">{user.displayName || user.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">@{user.username || "no_username"}</p>
                        <p className="text-sm text-muted-foreground truncate" title={user.email}>{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Reports</span>
                        <span className="font-bold">{user._count.issues}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Level</span>
                        <span className="font-bold text-[#00FFE0]">{user.level}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Role</span>
                        <span className="font-bold">{user.role}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Joined</span>
                        <span className="font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                      <h4 className="font-bold text-sm mb-2">Role Management</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, "USER")} disabled={user.role === "USER"}>User</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, "WORKER")} disabled={user.role === "WORKER"}>Worker</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRoleChange(user.id, "ADMIN")} disabled={user.role === "ADMIN"}>Admin</Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                      <h4 className="font-bold text-sm mb-2">Moderation</h4>
                      {isSuspended ? (
                        <Button size="sm" onClick={() => handleSuspend(user.id, "unsuspend")} className="w-full bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/30">
                          <UserCheck className="w-4 h-4 mr-2" /> Remove Suspension
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleSuspend(user.id, "suspend")} className="w-full bg-[#FF9500]/20 text-[#FF9500] hover:bg-[#FF9500]/30">
                          <Ban className="w-4 h-4 mr-2" /> Suspend for 7 Days
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          );
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
      </div>

      <Card className="glass-card p-0 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <Input 
            placeholder="Search by name, email, or role..." 
            value={globalFilter ?? ""} 
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-sm bg-[#1A1A1A] border-white/10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-black/40 uppercase border-b border-white/10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
