"use client";

import { useTransition } from "react";
import { Building2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteCommunity, revokeClientAccess } from "@/app/(dashboard)/communities/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ClientType } from "@/types/database";

export interface CommunityWithClients {
  id: string;
  name: string;
  goalHomes: number | null;
  clients: {
    userId: string;
    fullName: string | null;
    email: string | null;
    clientType: ClientType | null;
  }[];
}

export function CommunityList({
  communities,
}: {
  communities: CommunityWithClients[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleDeleteCommunity(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Audits already tagged with it keep their data but lose the community link.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCommunity(id);
      if (!result.success) toast.error(result.message);
      else toast.success("Community deleted");
    });
  }

  function handleRevoke(userId: string, communityId: string) {
    startTransition(async () => {
      const result = await revokeClientAccess(userId, communityId);
      if (!result.success) toast.error(result.message);
      else toast.success("Access removed");
    });
  }

  if (communities.length === 0) {
    return (
      <Empty className="rounded-lg border bg-card py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>No communities yet</EmptyTitle>
          <EmptyDescription>Add your first one above.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {communities.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>{c.name}</CardTitle>
              {c.goalHomes && (
                <p className="text-muted-foreground text-sm">
                  Goal: {c.goalHomes} homes
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => handleDeleteCommunity(c.id, c.name)}
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 />
            </Button>
          </CardHeader>
          <CardContent>
            {c.clients.length === 0 ? (
              <p className="text-muted-foreground text-sm">No clients linked yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {c.clients.map((client) => (
                  <div
                    key={client.userId}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {client.fullName ?? "Unnamed"}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {client.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={client.clientType === "hoa_director" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {client.clientType === "hoa_director" ? "HOA director" : "Homeowner"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        onClick={() => handleRevoke(client.userId, c.id)}
                        aria-label={`Remove ${client.fullName ?? client.email}`}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
