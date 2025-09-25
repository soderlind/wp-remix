/**
 * WordPress REST API Client
 * 
 * This module provides typed functions to interact with the WordPress REST API
 * replacing the mock data with real WordPress content.
 */

import type { 
  WordPressPost, 
  WordPressPage
} from './wordpress';

// Additional WordPress API types that extend the base types
export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  _links: Record<string, any>;
}

export interface WordPressTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  _links: Record<string, any>;
}

export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
  };
  source_url: string;
  _links: Record<string, any>;
}

export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
  _links: Record<string, any>;
}

/**
 * Configuration for WordPress API client
 */
interface WordPressConfig {
  baseUrl: string;
  timeout?: number;
  cache?: boolean;
  retries?: number;
}

/**
 * WordPress API Response for paginated endpoints
 */
interface WordPressApiResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

/**
 * WordPress API Error
 */
export class WordPressApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WordPressApiError';
  }
}

/**
 * WordPress API Client Class
 */
class WordPressApiClient {
  private config: Required<WordPressConfig>;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(config: WordPressConfig) {
    this.config = {
      timeout: 10000,
      cache: true,
      retries: 3,
      ...config,
    };
  }

  /**
   * Make authenticated request to WordPress API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTtl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const url = `${this.config.baseUrl}/wp-json/wp/v2${endpoint}`;
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // Check cache first
    if (this.config.cache && options.method !== 'POST') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new WordPressApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code
          );
        }

        const data = await response.json();

        // Cache successful responses
        if (this.config.cache && options.method !== 'POST') {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: cacheTtl,
          });
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on 4xx errors (client errors)
        if (error instanceof WordPressApiError && error.status && error.status < 500) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new WordPressApiError('Request failed after retries');
  }

  /**
   * Get posts with optional filtering
   */
  async getPosts(params: {
    page?: number;
    perPage?: number;
    categories?: string;
    tags?: string;
    search?: string;
    orderby?: 'date' | 'title' | 'menu_order';
    order?: 'asc' | 'desc';
    status?: 'publish' | 'draft' | 'private';
  } = {}): Promise<WordPressApiResponse<WordPressPost>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.categories) searchParams.append('categories', params.categories);
    if (params.tags) searchParams.append('tags', params.tags);
    if (params.search) searchParams.append('search', params.search);
    if (params.orderby) searchParams.append('orderby', params.orderby);
    if (params.order) searchParams.append('order', params.order);
    if (params.status) searchParams.append('status', params.status);

    // Always embed author, featured media, and categories
    searchParams.append('_embed', 'author,wp:featuredmedia,wp:term');

    const queryString = searchParams.toString();
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `Failed to fetch posts: ${response.statusText}`,
        response.status
      );
    }

    const posts = await response.json() as WordPressPost[];
    
    // Get pagination info from headers
    const total = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    const currentPage = params.page || 1;
    const perPage = params.perPage || 10;

    return {
      data: posts,
      total,
      totalPages,
      page: currentPage,
      perPage,
    };
  }

  /**
   * Get a single post by ID or slug
   */
  async getPost(identifier: string | number): Promise<WordPressPost> {
    const endpoint = typeof identifier === 'number' 
      ? `/posts/${identifier}?_embed=author,wp:featuredmedia,wp:term`
      : `/posts?slug=${identifier}&_embed=author,wp:featuredmedia,wp:term`;

    const result = await this.request<WordPressPost | WordPressPost[]>(endpoint);
    
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new WordPressApiError('Post not found', 404);
      }
      return result[0];
    }
    
    return result;
  }

  /**
   * Get pages with optional filtering
   */
  async getPages(params: {
    page?: number;
    perPage?: number;
    search?: string;
    parent?: number;
    orderby?: 'date' | 'title' | 'menu_order';
    order?: 'asc' | 'desc';
    status?: 'publish' | 'draft' | 'private';
  } = {}): Promise<WordPressApiResponse<WordPressPage>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.parent !== undefined) searchParams.append('parent', params.parent.toString());
    if (params.orderby) searchParams.append('orderby', params.orderby);
    if (params.order) searchParams.append('order', params.order);
    if (params.status) searchParams.append('status', params.status);

    searchParams.append('_embed', 'author,wp:featuredmedia');

    const queryString = searchParams.toString();
    const endpoint = `/pages${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `Failed to fetch pages: ${response.statusText}`,
        response.status
      );
    }

    const pages = await response.json() as WordPressPage[];
    
    const total = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    const currentPage = params.page || 1;
    const perPage = params.perPage || 10;

    return {
      data: pages,
      total,
      totalPages,
      page: currentPage,
      perPage,
    };
  }

  /**
   * Get a single page by ID or slug
   */
  async getPage(identifier: string | number): Promise<WordPressPage> {
    const endpoint = typeof identifier === 'number' 
      ? `/pages/${identifier}?_embed=author,wp:featuredmedia`
      : `/pages?slug=${identifier}&_embed=author,wp:featuredmedia`;

    const result = await this.request<WordPressPage | WordPressPage[]>(endpoint);
    
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new WordPressApiError('Page not found', 404);
      }
      return result[0];
    }
    
    return result;
  }

  /**
   * Get categories
   */
  async getCategories(params: {
    page?: number;
    perPage?: number;
    search?: string;
    orderby?: 'name' | 'slug' | 'count';
    order?: 'asc' | 'desc';
    hide_empty?: boolean;
  } = {}): Promise<WordPressApiResponse<WordPressCategory>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.orderby) searchParams.append('orderby', params.orderby);
    if (params.order) searchParams.append('order', params.order);
    if (params.hide_empty !== undefined) searchParams.append('hide_empty', params.hide_empty.toString());

    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2${endpoint}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `Failed to fetch categories: ${response.statusText}`,
        response.status
      );
    }

    const categories = await response.json() as WordPressCategory[];
    
    const total = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    const currentPage = params.page || 1;
    const perPage = params.perPage || 10;

    return {
      data: categories,
      total,
      totalPages,
      page: currentPage,
      perPage,
    };
  }

  /**
   * Search across posts and pages
   */
  async search(query: string, params: {
    type?: 'post' | 'page' | 'any';
    page?: number;
    perPage?: number;
  } = {}): Promise<WordPressApiResponse<WordPressPost | WordPressPage>> {
    const searchParams = new URLSearchParams();
    searchParams.append('search', query);
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('per_page', params.perPage.toString());
    
    const type = params.type || 'any';
    const endpoints = type === 'any' ? ['/posts', '/pages'] : [`/${type}s`];
    
    // For simplicity, we'll search posts if type is 'any' or specific type
    const endpoint = type === 'page' ? '/pages' : '/posts';
    const queryString = searchParams.toString();
    
    const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2${endpoint}?${queryString}&_embed=author,wp:featuredmedia,wp:term`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `Search failed: ${response.statusText}`,
        response.status
      );
    }

    const results = await response.json();
    
    const total = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    const currentPage = params.page || 1;
    const perPage = params.perPage || 10;

    return {
      data: results,
      total,
      totalPages,
      page: currentPage,
      perPage,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Health check - verify WordPress API is accessible
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/wp-json/wp/v2`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health checks
      });

      if (response.ok) {
        return { status: 'healthy', message: 'WordPress API is accessible' };
      } else {
        return { 
          status: 'unhealthy', 
          message: `WordPress API returned ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: `WordPress API is not accessible: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Default WordPress API client instance
let defaultClient: WordPressApiClient | null = null;

/**
 * Get or create the default WordPress API client
 */
export function getWordPressClient(): WordPressApiClient {
  if (!defaultClient) {
    const baseUrl = process.env.WORDPRESS_URL || 'http://localhost:3042/wp';
    const timeout = parseInt(process.env.WORDPRESS_API_TIMEOUT || '10000');
    const cache = process.env.WORDPRESS_API_CACHE_ENABLED !== 'false';
    const retries = parseInt(process.env.WORDPRESS_API_RETRIES || '3');
    
    defaultClient = new WordPressApiClient({ 
      baseUrl,
      timeout,
      cache,
      retries
    });
  }
  return defaultClient;
}

/**
 * Create a new WordPress API client with custom configuration
 */
export function createWordPressClient(config: WordPressConfig): WordPressApiClient {
  return new WordPressApiClient(config);
}

// Export the client class for advanced usage
export { WordPressApiClient };

// Convenience functions using the default client
export const wordpressApi = {
  getPosts: (params?: Parameters<WordPressApiClient['getPosts']>[0]) => 
    getWordPressClient().getPosts(params),
  
  getPost: (identifier: string | number) => 
    getWordPressClient().getPost(identifier),
  
  getPages: (params?: Parameters<WordPressApiClient['getPages']>[0]) => 
    getWordPressClient().getPages(params),
  
  getPage: (identifier: string | number) => 
    getWordPressClient().getPage(identifier),
  
  getCategories: (params?: Parameters<WordPressApiClient['getCategories']>[0]) => 
    getWordPressClient().getCategories(params),
  
  search: (query: string, params?: Parameters<WordPressApiClient['search']>[1]) => 
    getWordPressClient().search(query, params),
  
  healthCheck: () => 
    getWordPressClient().healthCheck(),
  
  clearCache: () => 
    getWordPressClient().clearCache(),
};