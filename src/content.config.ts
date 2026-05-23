import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Loader baru wajib di Astro v6

const blogCollection = defineCollection({
    // Loader ini otomatis mendeteksi semua file .md di subfolder sedalam apa pun
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        category: z.string(),
        readingTime: z.string(),
        
        // TAMBAHKAN BARIS INI
        image: z.string().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
};