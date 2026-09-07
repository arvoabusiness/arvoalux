import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { blogPosts } from "../blog";

/** Blog index — lists every article. */
export function BlogListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12" data-testid="blog-list-page">
      <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-gray-900 mb-8">Blog</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <span className="text-xs text-gray-400 mb-2">{post.date}</span>
              <h2 className="font-bold text-gray-900 text-[15px] leading-snug mb-2 group-hover:text-brand transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-3 flex-1">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 text-brand text-sm font-semibold mt-3">
                Teljes leírás <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
