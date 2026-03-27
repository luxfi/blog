"use client";

import { useSearchParams } from "next/navigation";
import { BlogCard } from "@/components/blog-card";
import { TagSearch } from "@/components/tag-search";

interface BlogItem {
  url: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  thumbnail: string | null;
  formattedDate: string;
}

interface BlogListProps {
  blogs: BlogItem[];
  allTags: string[];
  tagCounts: Record<string, number>;
}

export function BlogList({ blogs, allTags, tagCounts }: BlogListProps) {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get("tag") || "All";

  const filteredBlogs =
    selectedTag === "All"
      ? blogs
      : blogs.filter((b) => b.tags.includes(selectedTag));

  return (
    <>
      {/* Tag filter bar */}
      <div className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {selectedTag === "All" ? (
            <span>{blogs.length} posts</span>
          ) : (
            <span>
              <span className="text-foreground font-medium">{selectedTag}</span>
              {" \u00b7 "}
              {filteredBlogs.length} post{filteredBlogs.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
        {allTags.length > 0 && (
          <TagSearch
            tags={allTags}
            selectedTag={selectedTag}
            tagCounts={tagCounts}
          />
        )}
      </div>

      {/* Blog grid */}
      <div className="max-w-5xl mx-auto w-full px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.url}
              url={blog.url}
              title={blog.title}
              description={blog.description}
              date={blog.formattedDate}
              thumbnail={blog.thumbnail ?? undefined}
              showRightBorder={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
