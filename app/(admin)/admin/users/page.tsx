"use client";

import { useState, useMemo } from "react";
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
import { useDemoData } from "@/context/DemoDataContext";

export default function AdminUsersPage() {
  const { users: data, changeUserRole, suspendUser } = useDemoData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const handleRoleChange = (id: string, role: string) => {
    const confirm = window.confirm(`Change this user's role to ${role}?`);
    if (confirm) {
      changeUserRole(id, role as any);
    }
  };

  const handleSuspend = (id: string, action: "suspend" | "unsuspend") => {
    const confirm = window.confirm(`Are you sure you want to ${action} this user?`);
    if (confirm) {
      if (action === "suspend") {
        suspendUser(id, "Admin suspension");
      } else {
        // We do not have unsuspend, but we can simulate it by sending a suspend reason of ""
        suspendUser(id, "");
      }
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "avatarUrl",
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
          return <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${color}`}>{role}</span>;
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: info => {
          const status = info.getValue<string>();
          return status === "ACTIVE" 
            ? <span className="px-2 py-1 text-xs text-[#30D158] bg-[#30D158]/10 rounded border border-[#30D158]/30">Active</span>
            : <span className="px-2 py-1 text-xs text-red-500 bg-red-500/10 rounded border border-red-500/30">Suspended</span>;
        }
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: info => <span className="text-xs">{new Date(info.getValue<string>()).toLocaleDateString()}</span>
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-7 w-7 border border-white/20 bg-white/10 hover:bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all">
                  <Eye className="w-3 h-3" />
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-[#0A0A0A] border-white/10">
                  <SheetHeader>
                    <SheetTitle>User Management</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="w-16 h-16 rounded-full border border-white/20" alt="Avatar" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-2xl">
                          {(user.name || "U")[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-xs text-muted-foreground block mb-2">Role Management</span>
                        <div className="space-y-2">
                          <Button size="sm" onClick={() => handleRoleChange(user.id, "CITIZEN")} variant={user.role === "CITIZEN" ? "default" : "outline"} className="w-full text-xs h-7 justify-start">
                            <UserCheck className="w-3 h-3 mr-2" /> Citizen
                          </Button>
                          <Button size="sm" onClick={() => handleRoleChange(user.id, "WORKER")} variant={user.role === "WORKER" ? "default" : "outline"} className="w-full text-xs h-7 justify-start border-[#30D158]/50 text-[#30D158] hover:bg-[#30D158]/20">
                            <ShieldCheck className="w-3 h-3 mr-2" /> Worker
                          </Button>
                          <Button size="sm" onClick={() => handleRoleChange(user.id, "ADMIN")} variant={user.role === "ADMIN" ? "default" : "outline"} className="w-full text-xs h-7 justify-start border-[#00AEFF]/50 text-[#00AEFF] hover:bg-[#00AEFF]/20">
                            <Shield className="w-3 h-3 mr-2" /> Admin
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-xs text-muted-foreground block mb-2">Access Control</span>
                        <div className="space-y-2">
                          {user.status === "ACTIVE" ? (
                            <Button size="sm" onClick={() => handleSuspend(user.id, "suspend")} variant="destructive" className="w-full text-xs h-7 bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50">
                              <Ban className="w-3 h-3 mr-2" /> Suspend User
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleSuspend(user.id, "unsuspend")} className="w-full text-xs h-7 bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/40 border border-[#30D158]/50">
                              <UserCheck className="w-3 h-3 mr-2" /> Unsuspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          );
        }
      }
    ],
    [changeUserRole, suspendUser]
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
      </div>

      <Card className="glass-card p-0 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <Input 
            placeholder="Search users..." 
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs bg-black/50 border-white/20"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-muted-foreground uppercase text-xs border-b border-white/10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 font-semibold">
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
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
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
