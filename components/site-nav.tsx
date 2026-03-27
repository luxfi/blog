import Image from "next/image";
import { MessageCircle } from "lucide-react";

export function SiteNav() {
  return (
    <header className="border-b border-border/50 px-6 py-4 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <a
          href="https://lux.network"
          className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
        >
          <Image
            src="/lux-logo.svg"
            alt="Lux"
            width={20}
            height={20}
            className="dark:invert-0 invert"
          />
          <span className="font-semibold text-base tracking-tight">lux</span>
          <span className="text-muted-foreground text-sm">/ blog</span>
        </a>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="https://lux.network" className="hover:text-foreground transition-colors">lux.network</a>
          <a href="https://docs.lux.network" className="hover:text-foreground transition-colors hidden sm:block">docs</a>
          <a href="https://explorer.lux.network" className="hover:text-foreground transition-colors hidden sm:block">explorer</a>
          <a
            href="https://discord.gg/luxnetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-accent transition-all text-sm font-medium"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Discord
          </a>
        </nav>
      </div>
    </header>
  );
}
