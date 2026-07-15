import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ComingSoon({
  title,
  description,
  backHref = "/audits",
}: {
  title: string;
  description: string;
  backHref?: string;
}) {
  return (
    <Empty className="border rounded-lg bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" render={<Link href={backHref} />}>
        <ArrowLeft />
        Back
      </Button>
    </Empty>
  );
}
