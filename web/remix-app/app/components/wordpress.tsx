/**
 * WordPress component library
 * Reusable components for displaying WordPress content
 */
import type { WordPressPost, WordPressPage } from "~/lib/wordpress";

interface PostCardProps {
  post: WordPressPost;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const title = post.title?.rendered || 'Untitled';
  const excerpt = post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';
  
  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      featured ? 'md:col-span-2 lg:col-span-2' : ''
    }`}>
      <div className="p-6">
        <h3 className={`font-semibold text-gray-900 mb-3 ${
          featured ? 'text-2xl' : 'text-xl'
        }`}>
          <a 
            href={`/posts/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {title}
          </a>
        </h3>
        
        {excerpt && (
          <p className={`text-gray-600 mb-4 ${
            featured ? 'text-lg line-clamp-4' : 'line-clamp-3'
          }`}>
            {excerpt}
          </p>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <a 
            href={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read More →
          </a>
        </div>
      </div>
    </article>
  );
}

interface PostGridProps {
  posts: WordPressPost[];
  featuredFirst?: boolean;
}

export function PostGrid({ posts, featuredFirst = false }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No posts found</h3>
        <p>No blog posts have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          featured={featuredFirst && index === 0}
        />
      ))}
    </div>
  );
}

interface PageContentProps {
  page: WordPressPage;
}

export function PageContent({ page }: PageContentProps) {
  const title = page.title?.rendered || 'Untitled';
  const content = page.content?.rendered || '';

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      <header className="p-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <div className="flex items-center text-sm text-gray-500">
          <time dateTime={page.date}>
            Published {new Date(page.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          
          {page.date !== page.modified && (
            <span className="ml-4">
              <time dateTime={page.modified}>
                Updated {new Date(page.modified).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </span>
          )}
        </div>
      </header>

      <div className="p-8">
        {content ? (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No content available for this page.</p>
          </div>
        )}
      </div>
    </article>
  );
}

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/posts' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <nav className={`bg-white shadow-lg ${className}`}>
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <a href="/" className="text-2xl font-bold text-gray-900">
            WP Remix
          </a>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">WP Remix</h3>
            <p className="text-gray-300">
              A modern WordPress + Remix application built with Platformatic.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/posts" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/posts?category=tech" className="hover:text-white transition-colors">Technology</a></li>
              <li><a href="/posts?category=design" className="hover:text-white transition-colors">Design</a></li>
              <li><a href="/posts?category=business" className="hover:text-white transition-colors">Business</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2023 WP Remix. Built with Platformatic, Remix, and WordPress.</p>
        </div>
      </div>
    </footer>
  );
}

interface ErrorMessageProps {
  title: string;
  message: string;
  showRetry?: boolean;
  retryUrl?: string;
}

export function ErrorMessage({ title, message, showRetry = false, retryUrl }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="space-x-4">
          {showRetry && retryUrl && (
            <a
              href={retryUrl}
              className="btn"
            >
              Try Again
            </a>
          )}
          <a
            href="/"
            className="btn btn-secondary"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}