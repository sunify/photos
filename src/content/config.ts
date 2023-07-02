import { defineCollection, z } from 'astro:content';

const photos = defineCollection({
	// Type-check frontmatter using a schema
	type: 'data',
	schema: z.object({
		id: z.string(),
		title: z.string(),
		color: z.string(),
		shutterSpeed: z.number(),
		iso: z.number(),
		f: z.string(),
		focalLength: z.number(),
		camera: z.string(),
	}),
});

export const collections = { photos };
