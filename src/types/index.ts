export type APIResponsePost = {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  categorySlug?: string;
  category?: number[];
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: { name: string}[][]; // Taxonomies (e.g., categories, tags)
  };
  link: string;
  author: string
};

export type Post = {
  id: number;
  title: string;
  content: string;
  featuredMedia?: string | undefined;
  date: string;
  category?: string;
  categorySlug?: string;
  slug: string;
  excerpt: string; // Optional in case no image is available
  link: string;
  author: string;
  apiUrl?: string;
};
