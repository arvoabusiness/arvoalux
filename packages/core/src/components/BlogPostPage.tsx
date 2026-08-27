import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { BlogPost } from "../blog";

/** Full article reading page for a single blog post. */
export function BlogPostPage({ post }: { post: BlogPost }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 md:py-12" data-testid="blog-post-page">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Vissza a bloghoz
      </Link>

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover rounded-2xl mb-8"
        />
      )}

      <p className="text-sm text-gray-400 mb-2">{post.date}</p>
      <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-gray-900 leading-tight mb-6">
        {post.title}
      </h1>
      {post.excerpt && <p className="text-lg text-gray-600 leading-relaxed mb-8">{post.excerpt}</p>}

      <div
        className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
      />
    </article>
  );
}
