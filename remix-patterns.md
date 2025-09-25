# Remix Migration Patterns

## Key Differences from Next.js to Remix

### 1. Routing Patterns

#### Next.js (Pages Router)
```javascript
// pages/index.js
export default function HomePage() {
  return <div>Home</div>
}

// pages/posts/[slug].js  
export default function PostPage() {
  return <div>Post</div>
}

export async function getServerSideProps({ params }) {
  const post = await fetchPost(params.slug)
  return { props: { post } }
}
```

#### Remix (File-based Routes)
```typescript
// app/routes/_index.tsx
export default function HomePage() {
  return <div>Home</div>
}

// app/routes/posts.$slug.tsx
import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await fetchPost(params.slug)
  return post
}

export default function PostPage() {
  const post = useLoaderData<typeof loader>()
  return <div>Post: {post.title}</div>
}
```

### 2. Data Loading Patterns

#### Next.js Patterns
- `getServerSideProps()` - Server-side rendering on each request
- `getStaticProps()` - Static generation at build time
- `useEffect()` + `useState()` - Client-side data fetching

#### Remix Patterns
- `loader()` - Server-side data loading (runs on each request)
- `useLoaderData()` - Access loader data in components
- `useFetcher()` - Client-side data mutations and fetching

### 3. Form Handling

#### Next.js
```javascript
// API route: pages/api/contact.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle form submission
    res.json({ success: true })
  }
}

// Component with client-side submission
function ContactForm() {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/contact', { 
      method: 'POST', 
      body: new FormData(e.target) 
    })
    setLoading(false)
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

#### Remix
```typescript
// app/routes/contact.tsx
import { ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  // Handle form submission
  return { success: true }
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  
  return (
    <Form method="post">
      {/* Form works without JavaScript */}
      <button disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </Form>
  )
}
```

### 4. Error Handling

#### Next.js
```javascript
// pages/_error.js
export default function ErrorPage({ statusCode }) {
  return <div>Error: {statusCode}</div>
}

// Component-level error handling
class ErrorBoundary extends React.Component {
  // Manual error boundary implementation
}
```

#### Remix
```typescript
// app/routes/posts.$slug.tsx
export function ErrorBoundary() {
  return <div>Something went wrong loading this post</div>
}

// app/root.tsx - Global error boundary
export function ErrorBoundary() {
  return <div>Global error occurred</div>
}
```

### 5. Route File Naming Conventions

#### Next.js
- `pages/index.js` → `/`
- `pages/about.js` → `/about`
- `pages/posts/[slug].js` → `/posts/:slug`
- `pages/api/posts.js` → `/api/posts`

#### Remix
- `app/routes/_index.tsx` → `/`
- `app/routes/about.tsx` → `/about`
- `app/routes/posts.$slug.tsx` → `/posts/:slug`
- `app/routes/posts.tsx` → `/posts` (layout route)
- `app/routes/_layout.about.tsx` → `/about` (with layout)

### 6. Nested Routing

#### Next.js
Limited nested routing, requires manual layout composition

#### Remix
Built-in nested routing with automatic layout composition:
```
app/routes/
├── posts.tsx              # Layout for /posts/*
├── posts._index.tsx       # /posts
├── posts.$slug.tsx        # /posts/:slug
└── posts.new.tsx          # /posts/new
```

### 7. WordPress Integration Patterns

#### Data Loading Strategy
```typescript
// app/lib/wordpress.ts
export async function getPostBySlug(slug: string) {
  const response = await fetch(`${COMPOSER_URL}/wp/wp-json/wp/v2/posts?slug=${slug}`)
  const posts = await response.json()
  return posts[0] || null
}

// app/routes/posts.$slug.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getPostBySlug(params.slug!)
  
  if (!post) {
    throw new Response("Post not found", { status: 404 })
  }
  
  return { post }
}
```

## Migration Checklist

### Route Migration
- [ ] Convert page components to route modules
- [ ] Add loader functions for data fetching  
- [ ] Update component exports and structure
- [ ] Implement error boundaries
- [ ] Add loading states with navigation hooks

### Data Loading Migration
- [ ] Replace `getServerSideProps` with `loader` functions
- [ ] Convert client-side fetching to `useFetcher`
- [ ] Update WordPress API integration
- [ ] Add proper TypeScript typing for loader data

### Form Migration
- [ ] Convert API routes to action functions
- [ ] Update form components to use Remix Form
- [ ] Add progressive enhancement
- [ ] Implement optimistic UI updates

### Styling Migration
- [ ] Update Tailwind CSS import strategy
- [ ] Convert CSS modules to Tailwind classes
- [ ] Update component styling approach
- [ ] Add responsive design patterns

## Best Practices for WordPress + Remix

### 1. Server-Side Rendering
Always fetch WordPress data in loaders for better SEO and performance:

```typescript
export async function loader() {
  // This runs on the server, great for SEO
  const posts = await getPosts()
  return { posts }
}
```

### 2. Error Boundaries
Implement granular error handling for WordPress content:

```typescript
export function ErrorBoundary() {
  return (
    <div className="error-boundary">
      <h2>Unable to load WordPress content</h2>
      <p>Please try again later.</p>
    </div>
  )
}
```

### 3. Progressive Enhancement
Forms work without JavaScript:

```typescript
export default function SearchForm() {
  return (
    <Form method="get" action="/search">
      <input name="q" type="search" />
      <button type="submit">Search</button>
    </Form>
  )
}
```

### 4. Type Safety
Leverage TypeScript for WordPress API responses:

```typescript
interface WordPressPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  slug: string
  date: string
}

export async function loader(): Promise<{ posts: WordPressPost[] }> {
  const posts = await getPosts()
  return { posts }
}
```

This migration strategy ensures we maintain all the benefits of the WordPress backend while leveraging Remix's modern React patterns for better performance and developer experience.