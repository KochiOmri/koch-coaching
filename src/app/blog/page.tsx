import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Calendar, Tag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | KOCH Functional Patterns — Movement & Biomechanics Articles",
  description:
    "Explore articles on Functional Patterns, biomechanics, gait analysis, posture correction, and pain-free movement from KOCH coaching.",
  openGraph: {
    title: "Blog | KOCH Functional Patterns",
    description:
      "Articles on biomechanics, movement science, and Functional Patterns training.",
    type: "website",
    url: "https://koch-fp.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section
        className="relative pt-28 pb-16 sm:pt-36 sm:pb-20"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-medium tracking-widest text-primary">
              INSIGHTS & EDUCATION
            </span>
            <h1
              className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              The KOCH Blog
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              Deep dives into biomechanics, movement science, and the
              Functional Patterns methodology. Learn how to move better and live
              pain-free.
            </p>
          </div>
        </div>
      </section>

      <section
        className="pb-24 sm:pb-32"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="text-center text-muted">
              No posts yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-card-border bg-card-bg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex flex-1 flex-col p-8">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2
                      className="mt-4 text-xl font-bold transition-colors duration-200 group-hover:text-primary sm:text-2xl"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {post.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Calendar size={14} />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <span className="mx-1">·</span>
                        <span>{post.author}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Read
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
