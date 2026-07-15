"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CommunitySwitcher({
  communities,
  selectedId,
}: {
  communities: { id: string; name: string }[];
  selectedId: string;
}) {
  const router = useRouter();

  if (communities.length <= 1) return null;

  return (
    <Select
      value={selectedId}
      onValueChange={(value) => value && router.push(`/community?community=${value}`)}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select community" />
      </SelectTrigger>
      <SelectContent>
        {communities.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
