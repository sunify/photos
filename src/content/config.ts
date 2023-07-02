import { defineCollection, z } from 'astro:content';

const photos = defineCollection({
  // Type-check frontmatter using a schema
  type: 'data',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    color: z.string(),
    exif: z.object({
      image: z.object({
        Make: z.string(),
        Model: z.string(),
      }),
      exif: z.object({
        ExposureTime: z.number(),
        FNumber: z.number(),
        ISO: z.number(),
        FocalLengthIn35mmFormat: z.number(),
        LensModel: z.string().optional(),
      }),
    }),
  }),
});

export const collections = { photos };
