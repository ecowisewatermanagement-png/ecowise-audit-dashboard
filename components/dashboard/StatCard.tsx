import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "primary" | "success";
  className?: string;
}) {
  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardContent className="flex items-center gap-4 px-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            accent === "success"
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-2xl font-semibold tabular-nums">
            {value}
          </div>
          <div className="text-muted-foreground truncate text-xs">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
