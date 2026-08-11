import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const learning = defineCollection({
  loader: glob({ base: "./src/content/learning", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // What kind of thing was studied today.
    kind: z.enum(["paper", "component", "pattern"]),
    tags: z.array(z.string()),
    // One sentence you should remember a year from now.
    tldr: z.string(),
    // The heuristic: how to pick the right variant under pressure.
    decisionRule: z.string(),
    // What you need before this entry makes sense. `check` is a question you
    // should be able to answer — if you can't, learn that first.
    prerequisites: z.array(
      z.object({
        topic: z.string(),
        why: z.string(),
        check: z.string(),
      })
    ),
    // The honesty contract: every entry states its own boundary, so a gap is
    // visible instead of silent.
    scope: z.object({
      covered: z.array(z.string()),
      notCovered: z.array(
        z.object({
          topic: z.string(),
          why: z.string(),
          where: z.string(),
        })
      ),
    }),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        type: z.enum(["paper", "docs", "blog", "video", "book", "code"]),
      })
    ),
    // Ordered path from "can talk about it" to "can operate it".
    mastery: z.array(
      z.object({
        stage: z.string(),
        topics: z.array(z.string()),
      })
    ),
  }),
});

export const collections = { blog, learning };
