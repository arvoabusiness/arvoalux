import { notFound } from "next/navigation";
import { BlogPostPage, blogPostBySlug, blogPosts } from "@arvoalux/core";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
