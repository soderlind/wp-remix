# WP Remix - WordPress + Remix Microservices App

A modern WordPress and Remix application built with Platformatic Watt for microservices orchestration.

## Architecture

This application uses a three-service microservices architecture:

- **Remix App** (`web/remix-app/`): Frontend application built with Remix (React Router 7)
- **WordPress** (`web/wp/`): Backend CMS powered by WordPress with Platformatic PHP
- **Composer** (`web/composer/`): API orchestration service using Platformatic Composer

All services are orchestrated using **Platformatic Watt Runtime**.

## Technology Stack

- **Frontend**: Remix v2 (React Router 7), TypeScript, Tailwind CSS v4
- **Backend**: WordPress, MySQL
- **Orchestration**: Platformatic Watt
- **Runtime**: Node.js >= 22.14.0

## Prerequisites

- Node.js >= 22.14.0
- Docker and Docker Compose (for MySQL)
- npm

## Quick Start

> **Current Status**: The Remix frontend application is fully functional with mock WordPress data. The full microservices orchestration with Platformatic Watt is under development.

### 1. Clone and Setup

```bash
git clone https://github.com/soderlind/wp-remix
cd wp-remix
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Database

```bash
npm run db:setup
```

### 4. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 5. Start Development Server

**Option A: Full Stack (Recommended for production):**
```bash
npm run dev
```
*Note: This may require additional Platformatic configuration setup*

**Option B: Remix Frontend Only (Works immediately):**
```bash
cd web/remix-app
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Commands

```bash
# Start all services in development mode
npm run dev

# Start all services in production mode
npm start

# Build all services
npm run build

# Database management
npm run db:setup    # Start MySQL database
npm run db:down     # Stop database
npm run db:reset    # Reset database (removes all data)

# Linting and testing
npm run lint        # Lint all workspaces
npm run test        # Run tests for all workspaces
```

## Project Structure

```
wp-remix/
├── design.md                 # Design documentation
├── package.json              # Root workspace configuration
├── platformatic.json         # Platformatic runtime configuration
├── docker-compose.yml        # MySQL database setup
├── .env.example              # Environment variables template
└── web/                      # Service applications
    ├── remix-app/            # Remix frontend application
    │   ├── app/              # Remix app directory
    │   │   ├── routes/       # File-based routing
    │   │   ├── components/   # React components
    │   │   ├── lib/          # Utility functions
    │   │   └── root.tsx      # Root layout
    │   ├── public/           # Static assets
    │   ├── package.json      # Remix dependencies
    │   ├── platformatic.json # Platformatic config
    │   ├── vite.config.ts    # Vite configuration
    │   └── tailwind.config.ts # Tailwind config
    ├── wp/                   # WordPress backend
    │   └── ...               # WordPress files
    └── composer/             # Composer service
        └── ...               # Platformatic Composer files
```

## Service Communication

- **Frontend → Composer**: HTTP API calls via Platformatic Composer
- **Composer → WordPress**: Direct API communication with WordPress REST API
- **Development**: All services run under single Watt runtime with automatic service discovery

## API Endpoints

### WordPress Content API (via Composer)

- `GET /wp/wp-json/wp/v2/posts` - Get posts
- `GET /wp/wp-json/wp/v2/posts/{id}` - Get specific post
- `GET /wp/wp-json/wp/v2/pages` - Get pages
- `GET /wp/wp-json/wp/v2/pages/{id}` - Get specific page

### Frontend Routes

- `/` - Homepage
- `/posts` - Blog posts listing
- `/posts/{slug}` - Individual post
- `/pages/{slug}` - Individual page

## Development Workflow

### Adding New Routes

1. Create route file in `web/remix-app/app/routes/`
2. Add loader function for server-side data fetching
3. Add action function for form handling (if needed)
4. Export default component

### Adding WordPress Content

1. Create content in WordPress admin (via `/wp/wp-admin/`)
2. Content automatically available via REST API
3. Use WordPress API client in Remix loaders

### Service Configuration

Each service has its own `platformatic.json` configuration file. The main orchestration is configured in the root `platformatic.json` file.

## Production Deployment

```bash
# Build all services
npm run build

# Start in production mode
NODE_ENV=production npm start
```

## Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL` - MySQL connection string
- `WORDPRESS_DB_*` - WordPress database configuration
- `PORT` - Application port (default: 3042)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
docker-compose ps

# Reset database
npm run db:reset
```

### Service Communication Issues

- Verify all services are running: `npm run dev`
- Check service logs in terminal output
- Ensure environment variables are correctly configured

### Platformatic Configuration Issues

If `npm run dev` fails with "Add a module property to the config":

```bash
# Alternative: Start Remix app directly
cd web/remix-app
npm run dev
# App will be available at http://localhost:3000
```

### Security Vulnerabilities

If you see npm audit warnings:
```bash
npm audit fix
```

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Documentation

- [Design Document](./design.md) - Detailed architecture and migration strategy
- [Platformatic Watt Documentation](https://platformatic.dev/docs/guides)
- [Remix Documentation](https://remix.run/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)