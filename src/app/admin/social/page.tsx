/**
 * Social Media Management Dashboard — Admin Page
 *
 * Three tabs: (1) Create Post — write content, select platforms (Instagram, Facebook,
 * YouTube, TikTok), and schedule or post immediately; (2) Content Calendar — view
 * scheduled and published posts with delete for scheduled; (3) Analytics — placeholder
 * for follower counts and engagement (populated via Late API when connected).
 *
 * Uses Late API via /api/social. If LATE_API_KEY is not configured, shows setup
 * instructions (sign up at getlate.dev, connect accounts, add API key to .env.local).
 */
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Calendar,
  BarChart3,
  Link2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string;
  status: string;
}

type Tab = "create" | "calendar" | "analytics";

const platformOptions = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  { id: "tiktok", label: "TikTok", icon: Share2, color: "#000000" },
];

export default function SocialDashboard() {
  const [tab, setTab] = useState<Tab>("create");
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<"success" | "error" | null>(null);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<ScheduledPost[]>([]);

  useEffect(() => {
    fetch("/api/social?action=status")
      .then((res) => res.json())
      .then((data) => {
        setConfigured(data.configured);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (configured) {
      fetch("/api/social?action=scheduled")
        .then((r) => r.json())
        .then((d) => setScheduledPosts(d.posts || []));
      fetch("/api/social?action=published")
        .then((r) => r.json())
        .then((d) => setPublishedPosts(d.posts || []));
    }
  }, [configured]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePost = async () => {
    if (!postContent || selectedPlatforms.length === 0) return;
    setPosting(true);
    setPostResult(null);

    try {
      const body: Record<string, unknown> = {
        content: postContent,
        platforms: selectedPlatforms,
      };
      if (scheduleDate && scheduleTime) {
        body.scheduledAt = `${scheduleDate}T${scheduleTime}:00.000Z`;
      }

      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setPostResult("success");
        setPostContent("");
        setSelectedPlatforms([]);
        setScheduleDate("");
        setScheduleTime("");
      } else {
        setPostResult("error");
      }
    } catch {
      setPostResult("error");
    }
    setPosting(false);
    setTimeout(() => setPostResult(null), 3000);
  };

  const deletePost = async (id: string) => {
    await fetch(`/api/social?id=${id}`, { method: "DELETE" });
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const inputClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const renderSetup = () => (
    <div className="mx-auto max-w-xl rounded-2xl border p-8 text-center" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
      <Share2 size={48} className="mx-auto text-primary/40" />
      <h2 className="mt-4 text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
        Connect Your Social Accounts
      </h2>
      <p className="mt-2 text-sm text-muted">
        To post to Instagram, TikTok, Facebook, and YouTube from this dashboard, connect your accounts via the Late API.
      </p>
      <div className="mt-6 space-y-4 text-left">
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <h3 className="font-semibold">Step 1: Sign up at Late</h3>
          <p className="mt-1 text-sm text-muted">Go to <a href="https://getlate.dev" target="_blank" rel="noopener noreferrer" className="text-primary underline">getlate.dev</a> and create a free account (20 posts/month).</p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <h3 className="font-semibold">Step 2: Connect your social accounts</h3>
          <p className="mt-1 text-sm text-muted">In the Late dashboard, connect Instagram, TikTok, Facebook, or YouTube.</p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <h3 className="font-semibold">Step 3: Add API key</h3>
          <p className="mt-1 text-sm text-muted">Copy your API key and add it to <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">.env.local</code> as <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">LATE_API_KEY=your_key</code></p>
        </div>
      </div>
      <a href="https://getlate.dev" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-dark">
        <ExternalLink size={16} /> Get Started with Late
      </a>
    </div>
  );

  const renderCreate = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Create Post</h3>
        <textarea
          className={inputClass + " mt-4 resize-none"}
          rows={5}
          style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }}
          placeholder="Write your post caption..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-muted">{postContent.length} characters</p>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Platforms</label>
          <div className="flex flex-wrap gap-3">
            {platformOptions.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  borderColor: selectedPlatforms.includes(p.id) ? p.color : "var(--card-border)",
                  backgroundColor: selectedPlatforms.includes(p.id) ? p.color + "15" : "transparent",
                  color: selectedPlatforms.includes(p.id) ? p.color : "var(--muted)",
                }}
              >
                <p.icon size={16} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Schedule Date (optional)</label>
            <input type="date" className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Schedule Time</label>
            <input type="time" className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handlePost}
            disabled={posting || !postContent || selectedPlatforms.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {posting ? <Loader2 size={16} className="animate-spin" /> : scheduleDate ? <Clock size={16} /> : <Send size={16} />}
            {posting ? "Posting..." : scheduleDate ? "Schedule Post" : "Post Now"}
          </button>
          {postResult === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-500"><CheckCircle size={16} /> Posted!</span>
          )}
          {postResult === "error" && (
            <span className="flex items-center gap-1 text-sm text-red-400"><AlertCircle size={16} /> Failed — check API key</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const allPosts = [...scheduledPosts, ...publishedPosts].sort(
      (a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime()
    );

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {allPosts.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
            <Calendar size={48} className="mx-auto text-muted/30" />
            <p className="mt-4 text-muted">No scheduled or published posts yet.</p>
            <button onClick={() => setTab("create")} className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background">
              <Plus size={16} /> Create Your First Post
            </button>
          </div>
        ) : (
          allPosts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 rounded-2xl border p-5" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
              <div className="shrink-0 text-center">
                <div className="text-xs text-muted">
                  {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString("en-US", { month: "short" }) : "—"}
                </div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {post.scheduledAt ? new Date(post.scheduledAt).getDate() : "—"}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  {post.platforms?.map((p) => (
                    <span key={p} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{p}</span>
                  ))}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${post.status === "published" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {post.status}
                  </span>
                </div>
              </div>
              {post.status === "scheduled" && (
                <button onClick={() => deletePost(post.id)} className="text-red-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="mx-auto max-w-2xl rounded-2xl border p-8 text-center" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
      <BarChart3 size={48} className="mx-auto text-primary/40" />
      <h3 className="mt-4 text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Analytics</h3>
      <p className="mt-2 text-sm text-muted">
        Connect your social accounts to see follower counts, engagement rates, and top-performing posts. Analytics are pulled from the Late API once your accounts are connected.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <div className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>—</div>
          <div className="mt-1 text-xs text-muted">Total Followers</div>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <div className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>—</div>
          <div className="mt-1 text-xs text-muted">Engagement Rate</div>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
          <div className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>—</div>
          <div className="mt-1 text-xs text-muted">Posts This Month</div>
        </div>
      </div>
    </div>
  );

  const tabs: Array<{ key: Tab; label: string; icon: typeof Send }> = [
    { key: "create", label: "Create Post", icon: Plus },
    { key: "calendar", label: "Content Calendar", icon: Calendar },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <AdminSidebar />
      <main className="flex-1 md:ml-64">
        <div className="border-b px-8 py-6" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Social Media
          </h1>
          <p className="mt-1 text-sm text-muted">Manage all your social media from one place</p>
        </div>

        {!configured ? (
          <div className="p-8">{renderSetup()}</div>
        ) : (
          <>
            <div className="flex gap-1 border-b px-8 pt-4" style={{ borderColor: "var(--card-border)" }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: tab === t.key ? "var(--primary)" : "transparent",
                    color: tab === t.key ? "var(--background)" : "var(--muted)",
                  }}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-8">
              {tab === "create" && renderCreate()}
              {tab === "calendar" && renderCalendar()}
              {tab === "analytics" && renderAnalytics()}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
