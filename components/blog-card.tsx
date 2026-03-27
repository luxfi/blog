import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  showRightBorder?: boolean;
}

export function BlogCard({ url, title, description, date, thumbnail }: BlogCardProps) {
  return (
    <Link
      href={url}
      className="group flex flex-col rounded-xl border border-border/50 bg-neutral-900/30 hover:bg-neutral-800/40 hover:border-border transition-all overflow-hidden"
    >
      {thumbnail && (
        <div className="relative w-full h-44 overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/90 leading-snug">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>
        <time className="text-xs text-muted-foreground/60 mt-1">{date}</time>
      </div>
    </Link>
  );
}
