// Mock WordPress data for testing the Remix application
import type { WordPressPost, WordPressPage } from './wordpress';

export const mockPosts: WordPressPost[] = [
  {
    id: 1,
    title: { rendered: 'Welcome to WordPress' },
    content: { rendered: '<p>This is a sample WordPress post content. It demonstrates the Remix integration with WordPress REST API.</p>' },
    excerpt: { rendered: '<p>This is a sample WordPress post excerpt...</p>' },
    slug: 'welcome-to-wordpress',
    date: '2024-01-15T10:00:00',
    modified: '2024-01-15T10:00:00',
    featured_media: 0,
    author: 1,
    status: 'publish',
    _links: {
      self: [{ href: 'http://localhost/wp-json/wp/v2/posts/1' }]
    }
  },
  {
    id: 2,
    title: { rendered: 'Remix with WordPress Integration' },
    content: { rendered: '<p>This post showcases how Remix can work seamlessly with WordPress as a headless CMS. The fast page loads and server-side rendering make for an excellent user experience.</p>' },
    excerpt: { rendered: '<p>Learn how Remix integrates with WordPress...</p>' },
    slug: 'remix-wordpress-integration',
    date: '2024-01-16T14:30:00',
    modified: '2024-01-16T14:30:00',
    featured_media: 0,
    author: 1,
    status: 'publish',
    _links: {
      self: [{ href: 'http://localhost/wp-json/wp/v2/posts/2' }]
    }
  },
  {
    id: 3,
    title: { rendered: 'Building Modern Web Apps' },
    content: { rendered: '<p>Modern web applications require fast loading times, great SEO, and excellent developer experience. This combination of Remix and WordPress delivers on all fronts.</p>' },
    excerpt: { rendered: '<p>Discover the benefits of modern web app architecture...</p>' },
    slug: 'building-modern-web-apps',
    date: '2024-01-17T09:15:00',
    modified: '2024-01-17T09:15:00',
    featured_media: 0,
    author: 1,
    status: 'publish',
    _links: {
      self: [{ href: 'http://localhost/wp-json/wp/v2/posts/3' }]
    }
  }
];

export const mockPages: WordPressPage[] = [
  {
    id: 4,
    title: { rendered: 'About Us' },
    content: { rendered: '<p>Welcome to our company! We are passionate about building modern web applications that deliver exceptional user experiences.</p><p>Our team specializes in React, Remix, WordPress, and cloud technologies.</p>' },
    excerpt: { rendered: '<p>Learn more about our company and team...</p>' },
    slug: 'about',
    date: '2024-01-10T12:00:00',
    modified: '2024-01-10T12:00:00',
    parent: 0,
    status: 'publish',
    _links: {
      self: [{ href: 'http://localhost/wp-json/wp/v2/pages/4' }]
    }
  },
  {
    id: 5,
    title: { rendered: 'Contact' },
    content: { rendered: '<p>Get in touch with us!</p><p>Email: hello@example.com<br>Phone: (555) 123-4567</p><p>We would love to hear about your project and discuss how we can help bring your ideas to life.</p>' },
    excerpt: { rendered: '<p>Contact us for more information...</p>' },
    slug: 'contact',
    date: '2024-01-12T15:30:00',
    modified: '2024-01-12T15:30:00',
    parent: 0,
    status: 'publish',
    _links: {
      self: [{ href: 'http://localhost/wp-json/wp/v2/pages/5' }]
    }
  }
];

// Mock WordPress API functions for testing
export async function getMockPosts(): Promise<WordPressPost[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPosts;
}

export async function getMockPost(slug: string): Promise<WordPressPost | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPosts.find(post => post.slug === slug) || null;
}

export async function getMockPageBySlug(slug: string): Promise<WordPressPage | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPages.find(page => page.slug === slug) || null;
}