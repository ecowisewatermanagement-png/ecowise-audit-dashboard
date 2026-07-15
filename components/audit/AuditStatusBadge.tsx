import { Badge } from "@/components/ui/badge";
import type { AuditStatus } from "@/types/audit";

const STATUS_LABEL: Record<AuditStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  completed: "Completed",
  reviewed: "Reviewed",
};

const STATUS_VARIANT: Record<AuditStatus, "secondary" | "outline" | "default"> = {
  draft: "outline",
  in_progress: "secondary",
  completed: "default",
  reviewed: "default",
};

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {STATUS_LABEL[status]}
    </Badge>
  );
}
