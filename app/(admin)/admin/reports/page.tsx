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
import { Download, ArrowUpDown, ChevronDown, Trash } from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDemoData } from "@/context/DemoDataContext";

export default function AdminReportsPage() {
  const { reports: data, users, assignReport, changeStatus, escalateReport } = useDemoData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const workers = users.filter((u) => u.role === "WORKER" || u.role === "ADMIN");

  const handleAssign = (id: string, assignedToId: string) => {
    const worker = users.find(u => u.id === assignedToId);
    if (worker) {
      assignReport(id, { type: "worker", name: worker.name, workerId: worker.id });
      toast.success("Worker assigned successfully!");
    } else {
      toast.error("Failed to assign worker");
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    changeStatus(id, status);
    toast.success("Status updated!");
  };

  const handleEscalate = (id: string) => {
    escalateReport(id, "Manually escalated by Admin");
    toast.success("Report escalated to CRITICAL!");
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm(`Type the report ID to confirm deletion: ${id}`);
    if (confirm) {
      changeStatus(id, "DELETED", "Deleted by admin");
      toast.success("Report marked as deleted");
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Report ID",
        meta: { className: "hidden md:table-cell" },
        cell: info => <span className="font-mono text-xs font-bold text-[#00AEFF] bg-[#00AEFF]/10 border border-[#00AEFF]/30 px-2 py-1 rounded">REP-{info.getValue<string>().slice(-5).toUpperCase()}</span>
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4 h-8 px-4">
            Title <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: info => <span className="font-medium truncate max-w-[200px] block">{info.getValue<string>()}</span>
      },
      {
        accessorKey: "category",
        header: "Category",
        meta: { className: "hidden md:table-cell" },
        cell: info => <span className="text-xs uppercase">{info.getValue<string>().replace(/_/g, " ")}</span>
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: info => {
          const val = info.getValue<string>();
          const colors: Record<string, string> = {
            OPEN: "bg-white/10 text-white",
            IN_PROGRESS: "bg-[#00AEFF]/20 text-[#00AEFF] border-[#00AEFF]/50",
            ESCALATED: "bg-red-500/20 text-red-500 border-red-500/50",
            RESOLVED: "bg-[#30D158]/20 text-[#30D158] border-[#30D158]/50",
            ASSIGNED: "bg-[#9B5DE5]/20 text-[#9B5DE5] border-[#9B5DE5]/50",
            DELETED: "bg-red-900/50 text-red-300"
          };
          return (
            <span className={`px-2 py-1 text-xs font-bold rounded border ${colors[val] || "bg-white/10"}`}>
              {val}
            </span>
          );
        }
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: info => (
          <span className={`text-xs font-bold ${info.getValue() === "CRITICAL" ? "text-red-500" : "text-white"}`}>
            {info.getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        meta: { className: "hidden md:table-cell" },
        cell: info => <span className="text-xs">{new Date(info.getValue<string>()).toLocaleDateString()}</span>
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-7 px-3 border border-white/20 bg-white/10 hover:bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all">
                  View
                </SheetTrigger>
                <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#0A0A0A] border-white/10" : "w-[400px] sm:w-[540px] overflow-y-auto bg-[#0A0A0A] border-white/10"}>
                  <SheetHeader>
                    <SheetTitle>Report Details</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Status</span>
                        <span className="font-bold">{report.status}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Severity</span>
                        <span className="font-bold text-red-500">{report.severity}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">Reporter</span>
                        <span className="font-bold">{report.submittedBy?.name || "Anonymous"}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg flex flex-col justify-between">
                        <span className="text-xs text-muted-foreground block mb-1">Assigned To</span>
                        <div className="relative">
                          <select 
                            className="w-full bg-black/40 border border-white/20 rounded p-1.5 text-sm font-bold text-white outline-none focus:border-[#00AEFF] transition-colors appearance-none cursor-pointer pr-6"
                            value={report.assignedTo?.workerId || ""}
                            onChange={(e) => handleAssign(report.id, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-1.5 top-2 pointer-events-none text-white/50" />
                        </div>
                      </div>
                    </div>

                    {report.aiSummary && (
                      <div className="p-4 bg-[#9B5DE5]/10 border border-[#9B5DE5]/20 rounded-xl">
                        <h4 className="font-bold text-[#9B5DE5] mb-2 text-sm">AI Analysis</h4>
                        <p className="text-sm text-muted-foreground">{report.aiSummary}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                      <h4 className="font-bold text-sm mb-2">Admin Actions</h4>
                      {report.status !== "RESOLVED" && report.status !== "DELETED" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(report.id, "IN_PROGRESS")} className="w-full bg-[#00AEFF]/20 text-[#00AEFF] hover:bg-[#00AEFF]/40 border border-[#00AEFF]/50 shadow-[0_0_15px_rgba(0,174,255,0.2)] transition-all">Mark In Progress</Button>
                          <Button size="sm" onClick={() => handleStatusChange(report.id, "RESOLVED")} className="w-full bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/40 border border-[#30D158]/50 shadow-[0_0_15px_rgba(48,209,88,0.2)] transition-all">Mark Resolved</Button>
                          <Button size="sm" onClick={() => handleEscalate(report.id)} className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">Escalate</Button>
                        </>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)} className="w-full mt-4 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all hover:bg-red-600">
                        <Trash className="w-4 h-4 mr-2" /> Soft Delete
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          );
        }
      }
    ],
    [workers, isMobile, handleAssign, handleStatusChange, handleEscalate, handleDelete]
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

  const handleExportCSV = () => {
    const csvRows = [];
    const headers = ["ID", "Title", "Category", "Severity", "Status", "Date", "AssignedTo"];
    csvRows.push(headers.join(','));

    table.getFilteredRowModel().rows.forEach(row => {
      const values = [
        row.original.id,
        `"${row.original.title.replace(/"/g, '""')}"`,
        row.original.category,
        row.original.severity,
        row.original.status,
        new Date(row.original.createdAt).toISOString(),
        row.original.assignedTo?.name || "Unassigned"
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Reports Management</h1>
        <Button onClick={handleExportCSV} variant="outline" className="border-white/20">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="glass-card p-0 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <Input 
            placeholder="Search all columns..." 
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
                    <th key={header.id} className={`p-4 font-semibold ${(header.column.columnDef.meta as any)?.className || ""}`}>
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
                      <td key={cell.id} className={`p-4 ${(cell.column.columnDef.meta as any)?.className || ""}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                    No results found.
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
