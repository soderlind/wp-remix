/**
 * WordPress API client for communicating with the WordPress backend
 * via the Platformatic Composer service
 */

const COMPOSER_URL = process.env.COMPOSER_URL || 'http://composer.plt.local';

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  modified: string;
  author: number;
  author_name?: string;
  featured_media: number;
  status: string;
  _links: Record<string, any>;
}

export interface WordPressPage {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  modified: string;
  parent: number;
  status: string;
  _links: Record<string, any>;
}

export interface GetPostsParams {
  page?: number;
  per_page?: number;
  search?: string;
  author?: number;
  status?: string;
}

/**
 * Fetch posts from WordPress API via Composer
 */
export async function getPosts(params: GetPostsParams = {}): Promise<WordPressPost[]> {
  const searchParams = new URLSearchParams();
  
  // Build search parameters
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.per_page) searchParams.set('per_page', params.per_page.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.author) searchParams.set('author', params.author.toString());
  if (params.status) searchParams.set('status', params.status);
  
  const url = `${COMPOSER_URL}/wp/wp-json/wp/v2/posts?${searchParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

export async function getPost(slug: string): Promise<WordPressPost | null> {
  const url = `${COMPOSER_URL}/wp/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }
  
  const posts = await response.json();
  return posts.length > 0 ? posts[0] : null;
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  const url = `${COMPOSER_URL}/wp/wp-json/wp/v2/posts?slug=${slug}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }
    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

/**
 * Fetch pages from WordPress API via Composer
 */
export async function getPages(options?: {
  page?: number;
  per_page?: number;
  parent?: number;
}): Promise<WordPressPage[]> {
  const searchParams = new URLSearchParams();
  
  if (options?.page) searchParams.set('page', options.page.toString());
  if (options?.per_page) searchParams.set('per_page', options.per_page.toString());
  if (options?.parent) searchParams.set('parent', options.parent.toString());

  const url = `${COMPOSER_URL}/wp/wp-json/wp/v2/pages?${searchParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}

/**
 * Fetch a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WordPressPage | null> {
  const url = `${COMPOSER_URL}/wp/wp-json/wp/v2/pages?slug=${slug}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    const pages = await response.json();
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}