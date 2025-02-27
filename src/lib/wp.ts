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
    yoast_head_json: seo,
  } = data;
  return { title, content, seo };
};

//function to fetch the wordpress latest articles data to astro
export const getLatestArticles = async ({
  perPage = 10,
  apiUrl,
}: {
  perPage?: number;
  apiUrl: string;
}) => {
  const response = await fetch(
    `${apiUrl}/wp-json/wp/v2/posts?per_page=${perPage}&_embed`
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
    const link = post.link;
    return {
      title,
      excerpt,
      content,
      date,
      slug,
      featuredMedia,
      category,
      link,
    };
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
  const primaryApiUrl = "https://www.telesign.com/wp-json/wp/v2";
  const secondaryApiUrl = "https://www.rollingstone.com/wp-json/wp/v2";

  try {
    return await fetchCategoryArticles(primaryApiUrl, categoryId, perPage);
  } catch (error) {
    console.warn(
      `Primary API (${primaryApiUrl}) failed: ${error.message}. Retrying with secondary API...`
    );

    try {
      return await fetchCategoryArticles(secondaryApiUrl, categoryId, perPage);
    } catch (secondError) {
      console.error(`Both APIs failed: ${secondError.message}`);
      throw new Error("Failed to fetch category articles from all sources.");
    }
  }
};

// Helper function to fetch articles for a given category from a specific API
const fetchCategoryArticles = async (
  apiUrl: string,
  categoryId: number,
  perPage: number
) => {
  const response = await fetch(
    `${apiUrl}/posts?categories=${categoryId}&per_page=${perPage}&_embed`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch latest posts from ${apiUrl}`);
  }

  const results = await response.json();
  if (!results.length) {
    throw new Error(`No posts found in ${apiUrl}`);
  }

  return results.map((post: any) => ({
    title: post.title.rendered,
    excerpt: post.excerpt.rendered,
    content: post.content.rendered,
    date: post.date,
    slug: post.slug,
    featuredMedia:
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "default-image-url.jpg",
    category: post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Unknown Category",
    apiUrl, // Store API source for reference
  }));
};

export const getCategoryBySlug = async (slug: string) => {
  const primaryApiUrl = "https://www.telesign.com/wp-json/wp/v2";
  const secondaryApiUrl = "https://www.rollingstone.com/wp-json/wp/v2";

  try {
    return await fetchCategory(primaryApiUrl, slug);
  } catch (error) {
    console.warn(
      `Primary API (${primaryApiUrl}) failed: ${error.message}. Retrying with secondary API...`
    );

    try {
      return await fetchCategory(secondaryApiUrl, slug);
    } catch (secondError) {
      console.error(`Both APIs failed: ${secondError.message}`);
      throw new Error("Failed to fetch category information from all sources.");
    }
  }
};

// Helper function to fetch category data from a specific API
const fetchCategory = async (apiUrl: string, slug: string) => {
  const response = await fetch(`${apiUrl}/categories?slug=${slug}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch category from ${apiUrl}`);
  }

  const categories = await response.json();
  if (!categories.length) {
    throw new Error(`Category not found in ${apiUrl}`);
  }

  const { id, name, description, yoast_head: seo } = categories[0];

  return { id, name, description, title: name, seo, apiUrl }; // Store API source for reference
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

// Function to fetch the WordPress post info per slug with embedded taxonomy data
export const getPostInfo = async (slug: string) => {
  const primaryApiUrl = "https://www.telesign.com/wp-json/wp/v2";
  const secondaryApiUrl = "https://www.rollingstone.com/wp-json/wp/v2";

  try {
    return await fetchPostInfo(primaryApiUrl, slug);
  } catch (error) {
    console.warn(
      `Primary API (${primaryApiUrl}) failed: ${error.message}. Retrying with secondary API...`
    );

    try {
      return await fetchPostInfo(secondaryApiUrl, slug);
    } catch (secondError) {
      console.error(`Both APIs failed: ${secondError.message}`);
      throw new Error("Failed to fetch post information from all sources.");
    }
  }
};

// Helper function to fetch post info from a given API URL
const fetchPostInfo = async (apiUrl: string, slug: string) => {
  const response = await fetch(`${apiUrl}/posts?slug=${slug}&_embed`);

  if (!response.ok) {
    throw new Error(`Failed to fetch post data from ${apiUrl}`);
  }

  // Destructure the first (and only) post from the JSON response
  const [data] = await response.json();

  // Destructure the needed fields from the data object
  const {
    title: { rendered: title },
    content: { rendered: content },
    yoast_head_json: seo,
    date,
    author,
  } = data;

  // Using the _embedded property to safely extract the category name.
  const category =
    data._embedded?.["wp:term"]?.[0]?.[0]?.name || "Unknown Category";
  const categorySlug =
    data._embedded?.["wp:term"]?.[0]?.[0]?.slug || "Unknown Category";
  const featuredMedia =
    data._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "default-image-url.jpg";

  // Return the extracted data, including category and source API URL
  return {
    title,
    content,
    seo,
    category,
    author,
    categorySlug,
    date,
    apiUrl,
    featuredMedia,
  };
};

export const getAuthorById = async (authorId: number | string) => {
  const primaryApiUrl = "https://www.telesign.com/wp-json/wp/v2";
  const secondaryApiUrl = "https://www.rollingstone.com/wp-json/wp/v2";

  try {
    return await fetchAuthor(primaryApiUrl, authorId);
  } catch (error) {
    console.warn(
      `Primary API (${primaryApiUrl}) failed: ${error.message}. Retrying with secondary API...`
    );

    try {
      return await fetchAuthor(secondaryApiUrl, authorId);
    } catch (secondError) {
      console.error(`Both APIs failed: ${secondError.message}`);
      throw new Error("Failed to fetch author information from all sources.");
    }
  }
};

// Helper function to fetch author data from a given API URL
const fetchAuthor = async (apiUrl: string, authorId: number | string) => {
  const id = typeof authorId === "string" ? parseInt(authorId, 10) : authorId;
  const response = await fetch(`${apiUrl}/users/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch author data from ${apiUrl}`);
  }

  const authorData = await response.json();
  return { id: authorData.id, name: authorData.name, apiUrl };
};
