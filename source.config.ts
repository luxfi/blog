import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export default defineConfig({
  mdxOptions: {
    providerImportSource: "@/mdx-components",
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _deps = { frontmatterSchema };

export const { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional().default(false),
      readTime: z.string().optional(),
      author: z.string().optional(),
      thumbnail: z.string().optional(),
    }),
  },
});
