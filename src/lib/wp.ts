import type { Post, APIResponsePost } from "../types";

//Variables to make the connection
const domain = import.meta.env.WP_DOMAIN;
const apiUrl = `${domain}/wp-json/wp/v2`;

//function to fetch the wordpress page data to astro
export const getPageInfo = async (slug: string) => {
  const response = await fetch(`${apiUrl}/pages?slug=${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page data: ${response.statusText}`);
  }

  //destructuring data object and get the info
  const [data] = await response.json();
  //get the data to render on the pages
  const {
    title: { rendered: title },
    content: { rendered: content },
  } = data;
  return { title, content };
};

//function to fetch the wordpress latest articles data to astro
export const getLatestArticles = async ({
  perPage = 10,
}: {
  perPage?: number;
}) => {
  const response = await fetch(`${apiUrl}/posts?per_page=${perPage}&_embed`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest posts`);
  }
  const results = await response.json();
  if (!results.length) {
    throw new Error(`No posts found`);
  }
  const posts: Post[] = results.map((post: APIResponsePost) => {
    //destructuring data object and get the info
    const title = post.title.rendered;
    const excerpt = post.excerpt.rendered;
    const content = post.content.rendered;
    const date = post.date;
    const slug = post.slug;
    const featuredMedia =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "default-image-url.jpg";
    const category =
      post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Unknown Category";
    return { title, excerpt, content, date, slug, featuredMedia, category };
  });

  return posts;
};

//function to fetch the posts per category
export const getArticlesByCategory = async ({
  perPage = 10,
  categoryId,
}: {
  perPage?: number;
  categoryId: number;
}) => {
  const response = await fetch(
    `${apiUrl}/posts?categories=${categoryId}&perPage=${perPage}&_embed`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch latest posts`);
  }
  const results = await response.json();
  if (!results.length) {
    throw new Error(`No posts found`);
  }
  const posts: Post[] = results.map((post: APIResponsePost) => {
    //destructuring data object and get the info
    const title = post.title.rendered;
    const excerpt = post.excerpt.rendered;
    const content = post.content.rendered;
    const date = post.date;
    const slug = post.slug;
    const featuredMedia =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "default-image-url.jpg";
    const category =
      post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Unknown Category";

    return { title, excerpt, content, date, slug, featuredMedia, category };
  });
  console.log(posts);

  return posts;
};

export const getCategoryBySlug = async (slug: string) => {
  const response = await fetch(`${apiUrl}/categories?slug=${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  const categories = await response.json();
  if (!categories.length) {
    throw new Error("Category not found");
  }

  const { id, name, description, yoast_head: seo } = categories[0];
  return { id, name, description, title: name, seo };
};

export const getAllPostsSlugs = async () => {
  const response = await fetch(`${apiUrl}/posts?per_page=100`);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }
  const results = await response.json();
  if (!results.length) {
    throw new Error(`No posts found`);
  }
  const slugs = results.map((post: APIResponsePost) => post.slug);
  return slugs;
};

//function to fetch the wordpress post info per slug
export const getPostInfo = async (slug: string) => {
  const response = await fetch(`${apiUrl}/posts?slug=${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page data: ${response.statusText}`);
  }

  //destructuring data object and get the info
  const [data] = await response.json();
  //get the data to render on the pages
  const {
    title: { rendered: title },
    content: { rendered: content },
    yoast_head_json: seo,
  } = data;
  return { title, content, seo };
};
