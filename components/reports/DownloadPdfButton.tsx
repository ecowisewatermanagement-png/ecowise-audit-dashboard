"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DocumentProps } from "@react-pdf/renderer";

export function DownloadPdfButton({
  fileName,
  buildDocument,
  children,
  variant,
  size,
}: {
  fileName: string;
  /** Built lazily on click so we never render a PDF unless the user asks for it. */
  buildDocument: () => Promise<React.ReactElement<DocumentProps>>;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const document = await buildDocument();
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant={variant} size={size} disabled={loading} onClick={handleClick}>
      {loading ? <Loader2 className="animate-spin" /> : <Download />}
      {children}
    </Button>
  );
}
