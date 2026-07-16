"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditListRow } from "@/types/audit";
import { AuditStatusBadge } from "./AuditStatusBadge";
import { exportToCsv } from "@/lib/csv-export";

type SortKey = keyof Pick<
  AuditListRow,
  "address" | "homeownerName" | "auditDate" | "auditorName" | "dollarSavingsPerYear" | "efficiencyScore"
>;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "homeownerName", label: "Homeowner" },
  { key: "auditDate", label: "Date" },
  { key: "auditorName", label: "Auditor" },
  { key: "dollarSavingsPerYear", label: "Savings" },
  { key: "efficiencyScore", label: "Score" },
];

export function AuditTable({ audits }: { audits: AuditListRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("auditDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return audits.filter((a) => {
      const matchesQuery =
        !q ||
        [a.address, a.homeownerName, a.homeId, a.builder, a.neighborhood, a.auditorName]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesStatus = status === "all" || a.status === status;
      return matchesQuery && matchesStatus;
    }).sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [audits, query, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleExport() {
    exportToCsv(
      `ecowise-audits-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((a) => ({
        "Home ID": a.homeId,
        Address: a.address,
        Homeowner: a.homeownerName,
        Builder: a.builder,
        Neighborhood: a.neighborhood,
        Auditor: a.auditorName,
        Date: a.auditDate,
        Status: a.status,
        "Savings ($/yr)": a.dollarSavingsPerYear,
        Score: a.efficiencyScore,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search address, homeowner, home ID, builder..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead key={col.key}>
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {col.label}
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
              ))}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/audits/${audit.id}`}
                    className="hover:underline"
                  >
                    {audit.address}
                  </Link>
                  <div className="text-muted-foreground text-xs">
                    {audit.homeId}
                  </div>
                </TableCell>
                <TableCell>{audit.homeownerName}</TableCell>
                <TableCell>{audit.auditDate}</TableCell>
                <TableCell>{audit.auditorName}</TableCell>
                <TableCell>
                  {audit.dollarSavingsPerYear
                    ? `$${audit.dollarSavingsPerYear.toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell>{audit.efficiencyScore || "—"}</TableCell>
                <TableCell>
                  <AuditStatusBadge status={audit.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 1}
                  className="text-muted-foreground py-8 text-center"
                >
                  No audits match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
