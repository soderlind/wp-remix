import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type WordPressPost } from "~/lib/wordpress";
import { getMockPost } from "~/lib/mock-wordpress";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: "Post Not Found - WP Remix" },
      { name: "description", content: "The requested post could not be found" },
    ];
  }

  const title = data.post.title?.rendered || "Untitled Post";
  const excerpt = data.post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';

  return [
    { title: `${title} - WP Remix` },
    { name: "description", content: excerpt || "Read this blog post" },
    { name: "author", content: data.post.author_name || "WP Remix" },
    { property: "og:title", content: title },
    { property: "og:description", content: excerpt },
    { property: "og:type", content: "article" },
    { property: "article:published_time", content: data.post.date },
    { property: "article:modified_time", content: data.post.modified },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    // Use mock data for testing
    const post = await getMockPost(slug);
    
    if (!post) {
      throw new Response("Post Not Found", { status: 404 });
    }

    return json({
      post,
      success: true,
    });
  } catch (error) {
    console.error("Error loading post:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Internal Server Error", { status: 500 });
  }
}

export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();

  const title = post.title?.rendered || 'Untitled';
  const content = post.content?.rendered || '';
  const excerpt = post.excerpt?.rendered || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <a
              href="/posts"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Posts
            </a>
          </div>

          {/* Article */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <header className="p-8 border-b border-gray-200">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              
              {excerpt && (
                <div 
                  className="text-xl text-gray-600 mb-6"
                  dangerouslySetInnerHTML={{ __html: excerpt }}
                />
              )}
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <time dateTime={post.date}>
                  Published {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                
                {post.author_name && (
                  <span>
                    by <strong>{post.author_name}</strong>
                  </span>
                )}
                
                {post.date !== post.modified && (
                  <time dateTime={post.modified}>
                    Updated {new Date(post.modified).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </header>

            {/* Content */}
            <div className="p-8">
              {content ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No content available for this post.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="p-8 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Share this post
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Twitter
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
                
                <a
                  href="/posts"
                  className="btn btn-secondary"
                >
                  More Posts
                </a>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Post not found
        </h1>
        <p className="text-gray-600 mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-x-4">
          <a
            href="/posts"
            className="btn"
          >
            Browse Posts
          </a>
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