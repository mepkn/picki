import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MODE_ORDER, MODES } from "@/lib/modes";
import type { SelectionMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  value: SelectionMode;
  onChange: (mode: SelectionMode) => void;
  orientation?: "horizontal" | "vertical";
};

/** The three selection modes as pressable cards (single choice). */
export function ModePicker({ value, onChange, orientation = "horizontal" }: Props) {
  return (
    <ToggleGroup
      aria-label="Selection mode"
      value={[value]}
      // Clicking the active card would clear the group; keep a mode selected.
      onValueChange={(next) => next[0] && onChange(next[0] as SelectionMode)}
      orientation={orientation}
      className={cn("grid w-full gap-2.5", orientation === "horizontal" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1")}
    >
      {MODE_ORDER.map((mode) => {
        const config = MODES[mode];
        const Icon = config.icon;
        return (
          <ToggleGroupItem
            key={mode}
            value={mode}
            variant="outline"
            className={cn(
              "h-auto w-full flex-col items-start justify-start gap-1 whitespace-normal rounded-xl border-slate-800/80 bg-slate-950/50 p-3 text-left text-slate-400 hover:border-slate-700 hover:bg-slate-950/70 data-[pressed]:text-white",
              config.active,
            )}
          >
            <span className={cn("flex items-center gap-1.5 text-xs font-semibold", config.text)}>
              <Icon className="size-3.5" />
              {config.label}
            </span>
            <span className="text-[11px] leading-tight font-normal text-slate-400">{config.description}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
