import { Metadata } from "next";
import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { siteConfig } from "@/lib/site";

const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(docs, meta),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const page = blogSource.getPage([slug]);

    if (!page) {
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const ogUrl = `${siteConfig.url}/blog/${slug}`;
    const ogImage = `${ogUrl}/opengraph-image`;

    return {
      title: page.data.title,
      description: page.data.description,
      keywords: [
        page.data.title,
        ...(Array.isArray(page.data.tags) ? page.data.tags : []),
        "Lux Network",
        "Blog",
        "Blockchain",
        "Infrastructure",
      ],
      authors: [
        {
          name: typeof page.data.author === 'string' ? page.data.author : "Lux Network",
          url: siteConfig.url,
        },
      ],
      creator: typeof page.data.author === 'string' ? page.data.author : "Lux Network",
      publisher: "Lux Network",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: page.data.title,
        description: page.data.description,
        type: "article",
        url: ogUrl,
        publishedTime: typeof page.data.date === 'string' ? page.data.date : undefined,
        authors: [typeof page.data.author === 'string' ? page.data.author : "Lux Network"],
        tags: Array.isArray(page.data.tags) ? page.data.tags : undefined,
        images: [
          {
            url: typeof page.data.thumbnail === 'string' ? page.data.thumbnail : ogImage,
            width: 1200,
            height: 630,
            alt: page.data.title,
          },
        ],
        siteName: siteConfig.name,
      },
      twitter: {
        card: "summary_large_image",
        title: page.data.title,
        description: page.data.description,
        images: [typeof page.data.thumbnail === 'string' ? page.data.thumbnail : ogImage],
        creator: "@luxnetwork",
        site: "@luxnetwork",
      },
      alternates: {
        canonical: ogUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}
