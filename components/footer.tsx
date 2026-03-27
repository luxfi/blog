import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Image
            src="/lux-logo.svg"
            alt="Lux"
            width={16}
            height={16}
            className="dark:invert-0 invert opacity-50"
          />
          <span>&copy; 2025 Lux Industries, Inc.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://lux.network/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="https://lux.network/terms" className="hover:text-foreground transition-colors">Terms</a>
          <a href="https://docs.lux.network" className="hover:text-foreground transition-colors hidden sm:block">docs</a>
          <a
            href="https://github.com/luxfi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
