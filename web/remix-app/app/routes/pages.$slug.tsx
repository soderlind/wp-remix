import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type WordPressPage } from "~/lib/wordpress";
import { wordpressApi, WordPressApiError } from "~/lib/wordpress-api";
import { getMockPageBySlug } from "~/lib/mock-wordpress";
import { PageContent } from "~/components/wordpress";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.page) {
    return [
      { title: "Page Not Found - WP Remix" },
      { name: "description", content: "The requested page could not be found" },
    ];
  }

  const title = data.page.title?.rendered || "Untitled Page";
  const excerpt = data.page.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';

  return [
    { title: `${title} - WP Remix` },
    { name: "description", content: excerpt || "View this page" },
    { property: "og:title", content: title },
    { property: "og:description", content: excerpt },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    let page: WordPressPage | null = null;
    let success = true;

    try {
      // Try WordPress API first
      const healthStatus = await wordpressApi.healthCheck();
      
      if (healthStatus.status === 'healthy') {
        page = await wordpressApi.getPage(slug);
      } else {
        throw new Error(healthStatus.message);
      }
    } catch (wpError) {
      console.warn(`WordPress API unavailable for page ${slug}, falling back to mock data:`, wpError);
      
      // Fall back to mock data
      page = await getMockPageBySlug(slug);
      success = false;
    }
    
    if (!page) {
      throw new Response("Page Not Found", { status: 404 });
    }

    return json({
      page,
      success,
    });
  } catch (error) {
    console.error("Error loading page:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    if (error instanceof WordPressApiError && error.status === 404) {
      throw new Response("Page Not Found", { status: 404 });
    }
    
    throw new Response("Internal Server Error", { status: 500 });
  }
}

export default function PagePage() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <a
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </a>
          </div>

          {/* Page Content */}
          <PageContent page={page} />
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
          Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-x-4">
          <a
            href="/"
            className="btn"
          >
            Go Home
          </a>
          <a
            href="/posts"
            className="btn btn-secondary"
          >
            Browse Posts
          </a>
        </div>
      </div>
    </div>
  );
}