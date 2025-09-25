import { json } from "@remix-run/node";
import { wordpressApi } from "~/lib/wordpress-api";

/**
 * Health check endpoint for WordPress API integration
 * GET /api/health-check
 */
export async function loader() {
  try {
    const healthStatus = await wordpressApi.healthCheck();
    
    const response = {
      timestamp: new Date().toISOString(),
      wordpress: healthStatus,
      environment: {
        wordpressUrl: process.env.WORDPRESS_URL || 'http://localhost:3042/wp',
        nodeEnv: process.env.NODE_ENV || 'development',
      }
    };

    return json(response, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return json(
      {
        timestamp: new Date().toISOString(),
        wordpress: {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Health check failed',
        },
        environment: {
          wordpressUrl: process.env.WORDPRESS_URL || 'http://localhost:3042/wp',
          nodeEnv: process.env.NODE_ENV || 'development',
        }
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}