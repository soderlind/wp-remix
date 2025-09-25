import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type WordPressPost } from "~/lib/wordpress";
import { wordpressApi, WordPressApiError } from "~/lib/wordpress-api";
import { getMockPosts } from "~/lib/mock-wordpress";
import { PostGrid } from "~/components/wordpress";

export const meta: MetaFunction = () => {
  return [
    { title: "WP Remix - WordPress + Remix App" },
    { name: "description", content: "A modern WordPress and Remix application powered by Platformatic Watt" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Try to get real WordPress posts first
    let posts: WordPressPost[] = [];
    let success = true;
    let error: string | null = null;

    try {
      // Check if WordPress API is healthy
      const healthStatus = await wordpressApi.healthCheck();
      
      if (healthStatus.status === 'healthy') {
        const response = await wordpressApi.getPosts({ 
          perPage: 6, 
          orderby: 'date', 
          order: 'desc',
          status: 'publish' 
        });
        posts = response.data;
      } else {
        throw new Error(healthStatus.message);
      }
    } catch (wpError) {
      console.warn("WordPress API unavailable, falling back to mock data:", wpError);
      
      // Fall back to mock data
      const mockPosts = await getMockPosts();
      posts = mockPosts.slice(0, 6);
      success = false;
      error = wpError instanceof WordPressApiError 
        ? `WordPress API Error: ${wpError.message}`
        : "WordPress is temporarily unavailable, showing sample content";
    }

    return json({
      posts,
      success,
      error,
    });
  } catch (error) {
    console.error("Critical error loading homepage:", error);
    
    return json({
      posts: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to load content",
    });
  }
}

export default function Index() {
  const { posts, success, error } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              WP Remix
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              A modern WordPress and Remix application powered by Platformatic Watt microservices
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/posts"
                className="btn bg-white text-blue-600 hover:bg-gray-100"
              >
                View Posts
              </a>
              <a
                href="/about"
                className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Latest Posts
          </h2>
          
        {/* Recent Posts */}
        {!success && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error loading content:</strong> {error}
            <p className="mt-2 text-sm">
              WordPress content is temporarily unavailable. Please try again later.
            </p>
          </div>
        )}
        
        <PostGrid posts={posts} featuredFirst={true} />
        
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <a
              href="/posts"
              className="btn btn-secondary"
            >
              View All Posts
            </a>
          </div>
        )}          {posts.length > 0 && (
            <div className="text-center mt-12">
              <a
                href="/posts"
                className="btn btn-secondary"
              >
                View All Posts
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Powered by Modern Technology
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Remix Framework"
                description="Modern React framework with server-side rendering, nested routing, and progressive enhancement"
                icon="⚡"
              />
              <FeatureCard
                title="WordPress Backend"
                description="Flexible content management with WordPress REST API for easy content creation and management"
                icon="📝"
              />
              <FeatureCard
                title="Platformatic Watt"
                description="Microservices orchestration platform for scalable and maintainable architecture"
                icon="🔧"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading the homepage. Please try refreshing the page.
        </p>
        <a
          href="/"
          className="btn"
        >
          Refresh Page
        </a>
      </div>
    </div>
  );
}