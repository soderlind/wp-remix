import { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    platformatic: any
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT?: string
      DATABASE_URL?: string
      WORDPRESS_DB_HOST?: string
      WORDPRESS_DB_NAME?: string
      WORDPRESS_DB_USER?: string
      WORDPRESS_DB_PASSWORD?: string
      WORDPRESS_URL?: string
      REMIX_APP_URL?: string
      COMPOSER_URL?: string
    }
  }
}