import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { Search, ChevronDown, Check, X, Globe } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeVariant?: "default" | "outline" | "secondary" | "destructive" | "success" | "warning";
  icon?: React.ReactNode;
  group?: string;
  keywords?: string[];
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  groupByCategory?: boolean;
  size?: "sm" | "default" | "lg";
  align?: "left" | "right";
  allowClear?: boolean;
  emptyMessage?: string;
  ariaLabel?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className = "",
  triggerClassName = "",
  disabled = false,
  groupByCategory = false,
  size = "default",
  align = "left",
  allowClear = false,
  emptyMessage = "No results found.",
  ariaLabel,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      if (opt.label.toLowerCase().includes(q)) return true;
      if (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) return true;
      if (opt.group && opt.group.toLowerCase().includes(q)) return true;
      if (opt.keywords && opt.keywords.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [options, searchQuery]);

  // Group filtered options if groupByCategory is true
  const groupedOptions = useMemo(() => {
    if (!groupByCategory) return { all: filteredOptions };
    const groups: Record<string, SearchableSelectOption[]> = {};
    filteredOptions.forEach((opt) => {
      const g = opt.group || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
    return groups;
  }, [filteredOptions, groupByCategory]);

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, isOpen]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      scrollToHighlighted(highlightedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollToHighlighted(highlightedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredOptions[highlightedIndex];
      if (target && !target.disabled) {
        onChange(target.value);
        setIsOpen(false);
      }
    }
  };

  const scrollToHighlighted = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-select-item="true"]');
    const targetElement = items[index] as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ block: "nearest" });
    }
  };

  const getBadgeStyle = (variant?: string) => {
    switch (variant) {
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "success":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "destructive":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      case "secondary":
        return "bg-secondary text-secondary-foreground border-border";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const heightClasses = {
    sm: "h-8 text-xs px-2.5",
    default: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4",
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-50" : "z-auto"} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border border-input bg-card/80 backdrop-blur font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm ${heightClasses} ${
          isOpen ? "border-primary ring-2 ring-primary/20 shadow-md" : ""
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 overflow-hidden text-left min-w-0 flex-1">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0 flex items-center justify-center">
                  {selectedOption.icon}
                </span>
              )}
              <span className="truncate font-semibold text-foreground text-xs sm:text-sm">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span
                  className={`hidden sm:inline-flex shrink-0 items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getBadgeStyle(
                    selectedOption.badgeVariant
                  )}`}
                >
                  {selectedOption.badge}
                </span>
              )}
              {selectedOption.sublabel && (
                <span className="hidden md:inline-block text-[11px] text-muted-foreground truncate">
                  • {selectedOption.sublabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-xs sm:text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {allowClear && selectedOption && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="size-3.5" />
            </div>
          )}
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu / Mobile Bottom Sheet */}
      {isOpen && (
        <>
          {/* Mobile backdrop to guarantee select is always on top & dismissible */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            id={listId}
            role="listbox"
            className={`fixed inset-x-3 bottom-3 top-auto z-[9999] sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:mt-1.5 ${
              align === "right" ? "sm:right-0 sm:left-auto" : "sm:left-0 sm:right-auto"
            } flex flex-col rounded-2xl sm:rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 max-h-[80vh] sm:max-h-[380px] sm:min-w-[280px] sm:w-max sm:max-w-[420px]`}
          >
            {/* Mobile Handle Header */}
            <div className="sm:hidden flex flex-col items-center justify-center pt-2.5 pb-1 border-b border-border/40 bg-muted/20">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <div className="flex items-center justify-between w-full px-4 pb-1">
                <span className="text-xs font-bold text-foreground">Select Option</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-primary hover:underline font-bold p-1"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Search Header */}
            <div className="p-2 sm:p-2.5 border-b border-border/60 bg-muted/20">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 rounded-lg bg-background/90 pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground border border-input focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 size-5 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-muted-foreground">
                <span>
                  {filteredOptions.length} {filteredOptions.length === 1 ? "match" : "matches"}
                </span>
                <span className="hidden sm:inline">Use ↑↓ keys to navigate, Enter to select</span>
              </div>
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="overflow-y-auto p-1.5 space-y-1 flex-1 max-h-[300px] scrollbar-thin scrollbar-thumb-muted-foreground/20"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Globe className="size-6 text-muted-foreground/40 stroke-1" />
                  <span>{emptyMessage}</span>
                </div>
              ) : (
                Object.entries(groupedOptions).map(([groupName, groupItems]) => (
                  <div key={groupName} className="space-y-0.5">
                    {groupByCategory && groupName !== "all" && (
                      <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted/30 rounded-md my-1">
                        {groupName} ({groupItems.length})
                      </div>
                    )}

                    {groupItems.map((opt) => {
                      const isSelected = opt.value === value;
                      const overallIndex = filteredOptions.indexOf(opt);
                      const isHighlighted = overallIndex === highlightedIndex;

                      return (
                        <div
                          key={opt.value}
                          data-select-item="true"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            if (!opt.disabled) {
                              onChange(opt.value);
                              setIsOpen(false);
                            }
                          }}
                          onMouseEnter={() => setHighlightedIndex(overallIndex)}
                          className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                              : isHighlighted
                              ? "bg-accent/80 text-accent-foreground font-medium"
                              : "text-foreground hover:bg-accent/50"
                          } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {opt.icon && (
                              <span className="shrink-0 text-base leading-none">{opt.icon}</span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{opt.label}</span>
                                {opt.badge && (
                                  <span
                                    className={`inline-flex shrink-0 items-center px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                      isSelected
                                        ? "bg-white/20 text-white border-white/30"
                                        : getBadgeStyle(opt.badgeVariant)
                                    }`}
                                  >
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              {opt.sublabel && (
                                <span
                                  className={`text-[10px] truncate ${
                                    isSelected
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {opt.sublabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="size-4 shrink-0 text-primary-foreground ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
