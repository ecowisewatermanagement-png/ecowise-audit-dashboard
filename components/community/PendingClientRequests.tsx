"use client";

import { useState, useTransition } from "react";
import { Check, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { approveClientRequest } from "@/app/(dashboard)/communities/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ClientType } from "@/types/database";

export interface PendingClientRequest {
  userId: string;
  fullName: string | null;
  email: string | null;
  requestedCommunity: string;
  clientType: ClientType | null;
  homeAddress: string | null;
}

function guessCommunityId(
  requestedText: string,
  communities: { id: string; name: string }[]
) {
  const match = communities.find((c) =>
    requestedText.toLowerCase().includes(c.name.toLowerCase())
  );
  return match?.id ?? communities[0]?.id ?? "";
}

function RequestRow({
  request,
  communities,
}: {
  request: PendingClientRequest;
  communities: { id: string; name: string }[];
}) {
  const [communityId, setCommunityId] = useState(() =>
    guessCommunityId(request.requestedCommunity, communities)
  );
  const [isPending, startTransition] = useTransition();

  function approve() {
    if (!communityId) return;
    startTransition(async () => {
      const result = await approveClientRequest(request.userId, communityId);
      if (!result.success) toast.error(result.message);
      else toast.success(`${request.fullName ?? request.email} approved`);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{request.fullName ?? "Unnamed"}</span>
          {request.clientType && (
            <Badge variant={request.clientType === "hoa_director" ? "default" : "secondary"} className="text-[10px]">
              {request.clientType === "hoa_director" ? "HOA director" : "Homeowner"}
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground truncate text-xs">{request.email}</div>
        <div className="text-muted-foreground mt-1 text-xs italic">
          Requested community: &ldquo;{request.requestedCommunity}&rdquo;
          {request.homeAddress && <> · Address: {request.homeAddress}</>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={communityId} onValueChange={(v) => v && setCommunityId(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Community" />
          </SelectTrigger>
          <SelectContent>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" disabled={isPending || !communityId} onClick={approve}>
          <Check />
          Approve
        </Button>
      </div>
    </div>
  );
}

export function PendingClientRequests({
  requests,
  communities,
}: {
  requests: PendingClientRequest[];
  communities: { id: string; name: string }[];
}) {
  if (requests.length === 0) {
    return (
      <Empty className="rounded-lg border bg-card py-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserCircle />
          </EmptyMedia>
          <EmptyTitle>No pending sign-ups</EmptyTitle>
          <EmptyDescription>
            New community sign-ups from /join will show up here for approval.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <RequestRow key={r.userId} request={r} communities={communities} />
      ))}
    </div>
  );
}
