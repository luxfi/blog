import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { Suspense } from "react";
import { BlogList } from "@/components/blog-list";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function HomePage() {
  const allPages = blogSource.getPages();
  const sortedBlogs = allPages
    .map((page) => {
      const d = page.data as {
        title: string;
        description: string;
        date: string;
        tags?: string[];
        thumbnail?: string;
      };
      return {
        url: page.url,
        title: d.title,
        description: d.description,
        date: d.date,
        tags: d.tags ?? [],
        thumbnail: d.thumbnail ?? null,
        formattedDate: formatDate(new Date(d.date)),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allTags = [
    "All",
    ...Array.from(new Set(sortedBlogs.flatMap((b) => b.tags))).sort(),
  ];

  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] =
      tag === "All"
        ? sortedBlogs.length
        : sortedBlogs.filter((b) => b.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 pt-16 pb-10 border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
            Lux Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Post-quantum blockchain, multi-consensus architecture, and sovereign compute infrastructure.
          </p>
        </div>
      </section>

      {/* Posts */}
      <Suspense>
        <BlogList blogs={sortedBlogs} allTags={allTags} tagCounts={tagCounts} />
      </Suspense>
    </div>
  );
}
