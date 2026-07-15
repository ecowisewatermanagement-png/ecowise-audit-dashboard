import { Badge } from "@/components/ui/badge";
import type { MockAuditRow } from "@/lib/mock-data";

const STATUS_LABEL: Record<MockAuditRow["status"], string> = {
  draft: "Draft",
  in_progress: "In progress",
  completed: "Completed",
  reviewed: "Reviewed",
};

const STATUS_VARIANT: Record<
  MockAuditRow["status"],
  "secondary" | "outline" | "default"
> = {
  draft: "outline",
  in_progress: "secondary",
  completed: "default",
  reviewed: "default",
};

export function AuditStatusBadge({ status }: { status: MockAuditRow["status"] }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {STATUS_LABEL[status]}
    </Badge>
  );
}
