/**
 * WordPress API Enhancement Plugin
 * 
 * This plugin adds middleware and enhancements for the WordPress API
 * communication in the Composer service
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function wordpressApiPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Add CORS headers for WordPress API requests
  fastify.addHook('onRequest', async (request, reply) => {
    // Set CORS headers for all requests
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-WP-Nonce')
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      reply.code(200).send()
      return
    }
  })

  // Add WordPress API health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Try to reach the WordPress service
      const response = await fetch('http://wp.plt.local/wp-json/wp/v2/', {
        method: 'HEAD',
        timeout: 5000
      })
      
      if (response.ok) {
        return {
          status: 'healthy',
          services: {
            wordpress: 'connected',
            composer: 'running'
          },
          timestamp: new Date().toISOString()
        }
      } else {
        reply.code(503)
        return {
          status: 'unhealthy',
          services: {
            wordpress: 'disconnected',
            composer: 'running'
          },
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      reply.code(503)
      return {
        status: 'unhealthy',
        services: {
          wordpress: 'error',
          composer: 'running'
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  })

  // Add WordPress API proxy enhancement
  fastify.addHook('onResponse', async (request, reply) => {
    // Log WordPress API requests for debugging
    if (request.url.startsWith('/wp/wp-json/')) {
      fastify.log.info({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime
      }, 'WordPress API request completed')
    }
  })

  // Add custom WordPress endpoints
  fastify.get('/wp-info', async (request, reply) => {
    try {
      // Get WordPress site info
      const response = await fetch('http://wp.plt.local/wp-json/wp/v2/', {
        timeout: 5000
      })
      
      if (!response.ok) {
        reply.code(502)
        return { error: 'WordPress API not available' }
      }
      
      const data = await response.json()
      return {
        wordpress: {
          name: data.name || 'WordPress Site',
          description: data.description || '',
          url: data.url || '',
          version: data.wp_version || 'unknown',
          api_version: data.api_version || 'unknown'
        },
        composer: {
          status: 'running',
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      reply.code(502)
      return {
        error: 'Failed to connect to WordPress',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
}