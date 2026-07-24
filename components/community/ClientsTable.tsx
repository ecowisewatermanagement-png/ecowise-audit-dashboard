"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EditClientDialog } from "./EditClientDialog";
import type { ClientType } from "@/types/database";

export interface ClientRow {
  userId: string;
  fullName: string | null;
  email: string | null;
  clientType: ClientType | null;
  homeAddress: string | null;
  communities: string[];
  communityIds: string[];
  pendingRequest: string | null;
}

export function ClientsTable({
  clients,
  allCommunities,
}: {
  clients: ClientRow[];
  allCommunities: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      const matchesQuery =
        !q ||
        [c.fullName, c.email, c.homeAddress, ...c.communities]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesType = type === "all" || c.clientType === type;
      return matchesQuery && matchesType;
    });
  }, [clients, query, type]);

  if (clients.length === 0) {
    return (
      <Empty className="rounded-lg border bg-card py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No clients yet</EmptyTitle>
          <EmptyDescription>
            Clients show up here once they sign up from /join or you invite
            them from Communities.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, address, community..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Client type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All client types</SelectItem>
            <SelectItem value="homeowner">Homeowner</SelectItem>
            <SelectItem value="hoa_director">HOA director</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Home address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Community</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((client) => (
              <TableRow key={client.userId}>
                <TableCell className="font-medium">
                  {client.fullName ?? "Unnamed"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-56 truncate">
                  {client.homeAddress ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.clientType === "hoa_director" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {client.clientType === "hoa_director" ? "HOA director" : "Homeowner"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {client.communities.length > 0 ? (
                    client.communities.join(", ")
                  ) : client.pendingRequest ? (
                    <span className="italic">Pending: {client.pendingRequest}</span>
                  ) : (
                    "Unassigned"
                  )}
                </TableCell>
                <TableCell>
                  <EditClientDialog
                    userId={client.userId}
                    fullName={client.fullName}
                    email={client.email}
                    clientType={client.clientType}
                    homeAddress={client.homeAddress}
                    communities={allCommunities}
                    currentCommunityIds={client.communityIds}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  No clients match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
