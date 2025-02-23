export type APIResponsePost = {
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  category?: number[];
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: { name: string}[][]; // Taxonomies (e.g., categories, tags)
  };
};

export type Post = {
  id: number;
  title: string;
  content: string;
  featuredMedia?: string | undefined;
  date: string;
  category?: string;
  slug: string;
  excerpt: string; // Optional in case no image is available
};
