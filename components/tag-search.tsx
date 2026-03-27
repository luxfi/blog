"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Tag, X, Hash } from "lucide-react";

interface TagSearchProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
}

export function TagSearch({ tags, selectedTag, tagCounts }: TagSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Reset query and focus input when dialog opens
    const timer = setTimeout(() => {
      setQuery("");
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  const handleSelect = (tag: string) => {
    const params = new URLSearchParams();
    if (tag !== "All") params.set("tag", tag);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const filtered = tags.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase())
  );

  const displayTag = selectedTag === "All" ? "All posts" : selectedTag;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-border transition-all text-sm text-muted-foreground group"
      >
        <Hash className="h-3.5 w-3.5" />
        <span className="hidden sm:block">{displayTag}</span>
        <span className="hidden sm:flex items-center gap-0.5 ml-1 text-xs border border-border/40 rounded px-1 py-0.5 font-mono">
          <span>&#8984;</span><span>K</span>
        </span>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/4 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl border border-border bg-neutral-900 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[10%] data-[state=open]:slide-in-from-top-[10%]">
            <Dialog.Title className="sr-only">Filter by tag</Dialog.Title>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tags..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tag list */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No tags found</p>
              ) : (
                filtered.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelect(tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-neutral-800 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 opacity-50" />
                      <span>{tag}</span>
                    </div>
                    {tagCounts?.[tag] !== undefined && (
                      <span className={`text-xs font-medium tabular-nums ${
                        selectedTag === tag ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {tagCounts[tag]}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
              <span>&#8629; select</span>
              <span>esc close</span>
              <span className="ml-auto">&#8984;K to toggle</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
