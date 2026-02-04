import { ISLANDS, Island } from '@/types/listing';
import { cn } from '@/lib/utils';

interface IslandSelectorProps {
  selected: Island | 'all';
  onSelect: (island: Island | 'all') => void;
}

export function IslandSelector({ selected, onSelect }: IslandSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          selected === 'all'
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        🌍 Toutes les îles
      </button>
      {ISLANDS.map((island) => (
        <button
          key={island.value}
          onClick={() => onSelect(island.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selected === island.value
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {island.label}
        </button>
      ))}
    </div>
  );
}
