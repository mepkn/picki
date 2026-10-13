import { Badge } from "@/components/ui/badge";
import { MODES } from "@/lib/modes";
import type { SelectionMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModeBadge({ mode, className }: { mode: SelectionMode; className?: string }) {
  const config = MODES[mode] ?? MODES.no_repetition;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("backdrop-blur-md", config.badge, className)}>
      <Icon />
      {config.label}
    </Badge>
  );
}
