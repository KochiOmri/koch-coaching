import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | KOCH Functional Patterns Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `https://koch-fp.com/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="mt-12 mb-4 text-2xl font-bold sm:text-3xl"
      style={{ fontFamily: "var(--font-outfit)" }}
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      className="mt-8 mb-3 text-xl font-bold sm:text-2xl"
      style={{ fontFamily: "var(--font-outfit)" }}
      {...props}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="my-4 leading-relaxed text-muted" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-muted" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-muted" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
      {...props}
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-primary pl-6 italic text-muted"
      {...props}
    />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className="border-b border-card-border px-4 py-3 font-semibold text-foreground"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td className="border-b border-card-border px-4 py-3 text-muted" {...props} />
  ),
  hr: () => <hr className="my-8 border-card-border" />,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <article
        className="relative pt-28 pb-16 sm:pt-36 sm:pb-24"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {post.title}
            </h1>

            <div className="mt-6 flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </div>

            <hr className="mt-8 border-card-border" />
          </header>

          <div className="prose-custom mt-8">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </div>
      </article>

      <section
        className="border-t border-card-border py-16 sm:py-20"
        style={{ backgroundColor: "var(--section-alt)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-medium tracking-widest text-primary">
            READY TO MOVE BETTER?
          </span>
          <h2
            className="mt-4 text-3xl font-bold sm:text-4xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Book Your Free Consultation
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Take the first step toward pain-free, optimized movement. Get a
            personalized assessment and discover how Functional Patterns can
            transform the way you move.
          </p>
          <a
            href="/#book"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-primary-dark hover:shadow-lg"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Book a Free Session
          </a>
        </div>
      </section>
    </>
  );
}
