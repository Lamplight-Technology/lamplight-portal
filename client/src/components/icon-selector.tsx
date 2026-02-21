import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVAILABLE_ICONS } from "@shared/constants";

interface IconSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IconSelector({ value, onChange, placeholder = "Select an icon..." }: IconSelectorProps) {
  const [open, setOpen] = useState(false);

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    if (!IconComponent) return <Icons.HelpCircle className="h-4 w-4" />;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                {renderIcon(value)}
                <span>{value}</span>
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandEmpty>No icon found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {AVAILABLE_ICONS.map((iconName) => (
              <CommandItem
                key={iconName}
                value={iconName}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : iconName);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === iconName ? "opacity-100" : "opacity-0"
                  )}
                />
                {renderIcon(iconName)}
                <span className="ml-2">{iconName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
