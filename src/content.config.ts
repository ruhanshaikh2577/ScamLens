import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const scams = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/scams" }),
  schema: z.object({
    title: z.string(),
    longTitle: z.string(),
    description: z.string(),
    tag: z.string(),
    intro: z.string(),
    looksLike: z.array(z.string()),
    warningSigns: z.array(z.string()),
    whyItWorks: z.string(),
    whatToDo: z.array(z.string()),
    verify: z.string(),
    similar: z.array(z.string()).default([]),
    updated: z.coerce.date().optional(),
    region: z.enum(["in", "global"]).default("in"),
    lastUpdated: z.coerce.date().optional(),
    sources: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    status: z.enum(["draft", "reviewed"]).default("reviewed"),
  }),
});

export const collections = { scams };
