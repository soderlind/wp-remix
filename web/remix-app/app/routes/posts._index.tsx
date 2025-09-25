import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { type WordPressPost } from "~/lib/wordpress";
import { getMockPosts } from "~/lib/mock-wordpress";
import { PostGrid } from "~/components/wordpress";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog Posts - WP Remix" },
    { name: "description", content: "Browse all blog posts" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || undefined;
  const perPage = 10;

  try {
    // Use mock data for testing
    const allPosts = await getMockPosts();
    // Simulate pagination and search filtering
    let filteredPosts = allPosts;
    if (search) {
      filteredPosts = allPosts.filter(post => 
        post.title.rendered.toLowerCase().includes(search.toLowerCase()) ||
        post.content.rendered.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * perPage;
    const posts = filteredPosts.slice(startIndex, startIndex + perPage);

    return json({
      posts,
      currentPage: page,
      search: search || "",
      success: true,
      error: null as string | null,
    });
  } catch (error) {
    console.error("Error loading posts:", error);
    
    return json({
      posts: [],
      currentPage: page,
      search: search || "",
      success: false,
      error: error instanceof Error ? error.message : "Failed to load posts",
    });
  }
}

export default function PostsPage() {
  const { posts, currentPage, search, success, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog Posts
            </h1>
            <p className="text-xl text-gray-600">
              Discover our latest articles and insights
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <form method="get" className="flex gap-4">
              <input
                type="search"
                name="search"
                placeholder="Search posts..."
                defaultValue={search}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="btn"
              >
                Search
              </button>
            </form>
            {search && (
              <p className="mt-2 text-sm text-gray-600">
                Showing results for: <strong>"{search}"</strong>
              </p>
            )}
          </div>

          {/* Error State */}
          {!success && error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              <strong>Error loading posts:</strong> {error}
            </div>
          )}

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p>
                {search 
                  ? `No posts match your search for "${search}".`
                  : "No blog posts have been published yet."
                }
              </p>
              {search && (
                <a
                  href="/posts"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all posts
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="mb-12">
                <PostGrid posts={posts} />
              </div>

              {/* Pagination */}
              <Pagination currentPage={currentPage} hasNextPage={posts.length === 10} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}



function Pagination({ currentPage, hasNextPage }: { currentPage: number; hasNextPage: boolean }) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = hasNextPage ? currentPage + 1 : null;

  return (
    <div className="flex justify-center items-center space-x-4">
      {prevPage ? (
        <a
          href={`/posts?page=${prevPage}`}
          className="btn btn-secondary"
        >
          ← Previous
        </a>
      ) : (
        <span className="btn btn-secondary opacity-50 cursor-not-allowed">
          ← Previous
        </span>
      )}
      
      <span className="text-gray-600">
        Page {currentPage}
      </span>
      
      {nextPage ? (
        <a
          href={`/posts?page=${nextPage}`}
          className="btn btn-secondary"
        >
          Next →
        </a>
      ) : (
        <span className="btn btn-secondary opacity-50 cursor-not-allowed">
          Next →
        </span>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unable to load posts
        </h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading the blog posts. Please try again.
        </p>
        <a
          href="/posts"
          className="btn"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}