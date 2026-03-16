/* ============================================================
   INTEGRATIONS SETTINGS - src/app/admin/integrations/page.tsx
   ============================================================
   Admin page to view and manage Google integrations:
   - Google Calendar connection status
   - Google Sheets connection status
   - Test connection button
   - Sync all confirmed appointments
   - Setup instructions
   ============================================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Plug,
  Calendar,
  FileSpreadsheet,
  Video,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Zap,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

interface IntegrationStatus {
  calendar: {
    configured: boolean;
    calendarId: string | null;
    serviceAccountEmail: string | null;
  };
  sheets: {
    configured: boolean;
    sheetId: string | null;
  };
}

interface TestResult {
  calendar: { success: boolean; error?: string };
  sheets: { success: boolean; error?: string };
}

interface SyncResult {
  total: number;
  synced: number;
  failed: number;
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/integrations");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch integration status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
      }
    } catch (error) {
      console.error("Test connection failed:", error);
    } finally {
      setTesting(false);
    }
  };

  const syncAppointments = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (response.ok) {
        const data = await response.json();
        setSyncResult(data);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const StatusBadge = ({ configured, testSuccess }: { configured: boolean; testSuccess?: boolean }) => {
    if (testSuccess === true) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
          <CheckCircle2 size={12} /> Connected
        </span>
      );
    }
    if (testSuccess === false) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
          <XCircle size={12} /> Failed
        </span>
      );
    }
    if (configured) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500">
          <CheckCircle2 size={12} /> Configured
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-500/10 px-3 py-1 text-xs font-medium text-neutral-400">
        <XCircle size={12} /> Not Configured
      </span>
    );
  };

  const ConfigRow = ({ label, value }: { label: string; value: string | null }) => (
    <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: "var(--background)" }}>
      <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
      {value ? (
        <div className="flex items-center gap-2">
          <code className="rounded bg-black/20 px-2 py-1 text-xs" style={{ color: "var(--foreground)" }}>
            {value.length > 40 ? value.slice(0, 37) + "..." : value}
          </code>
          <button
            onClick={() => copyToClipboard(value, label)}
            className="rounded p-1 transition-colors hover:bg-white/5"
            title="Copy"
          >
            {copied === label ? <Check size={12} className="text-green-500" /> : <Copy size={12} style={{ color: "var(--muted)" }} />}
          </button>
        </div>
      ) : (
        <span className="text-xs italic" style={{ color: "var(--muted)" }}>Not set</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Integrations
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Google Calendar, Sheets & Meet connections
              </p>
            </div>
            <button
              onClick={fetchStatus}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {testing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Test Connection
                </button>
                <button
                  onClick={syncAppointments}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Sync All Appointments
                </button>
              </div>

              {/* Test results */}
              {testResult && (
                <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                  <h3 className="mb-3 text-sm font-semibold">Connection Test Results</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Calendar size={14} /> Google Calendar
                      </span>
                      {testResult.calendar.success ? (
                        <span className="text-xs text-green-500">Connected successfully</span>
                      ) : (
                        <span className="text-xs text-red-400">{testResult.calendar.error}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <FileSpreadsheet size={14} /> Google Sheets
                      </span>
                      {testResult.sheets.success ? (
                        <span className="text-xs text-green-500">Connected successfully</span>
                      ) : (
                        <span className="text-xs text-red-400">{testResult.sheets.error}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sync results */}
              {syncResult && (
                <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                  <h3 className="mb-2 text-sm font-semibold">Sync Results</h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {syncResult.total === 0
                      ? "No unsynced confirmed appointments found."
                      : `${syncResult.synced} of ${syncResult.total} appointments synced${syncResult.failed > 0 ? ` (${syncResult.failed} failed)` : ""}.`}
                  </p>
                </div>
              )}

              {/* Google Calendar card */}
              <div className="rounded-xl border" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Calendar size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Google Calendar</h2>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>Auto-create events with Google Meet links</p>
                    </div>
                  </div>
                  <StatusBadge
                    configured={status?.calendar.configured ?? false}
                    testSuccess={testResult?.calendar.success}
                  />
                </div>
                <div className="space-y-1 p-4">
                  <ConfigRow label="Calendar ID" value={status?.calendar.calendarId ?? null} />
                  <ConfigRow label="Service Account" value={status?.calendar.serviceAccountEmail ?? null} />
                </div>
              </div>

              {/* Google Sheets card */}
              <div className="rounded-xl border" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                      <FileSpreadsheet size={20} className="text-green-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Google Sheets</h2>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>Session logging and record keeping</p>
                    </div>
                  </div>
                  <StatusBadge
                    configured={status?.sheets.configured ?? false}
                    testSuccess={testResult?.sheets.success}
                  />
                </div>
                <div className="space-y-1 p-4">
                  <ConfigRow label="Sheet ID" value={status?.sheets.sheetId ?? null} />
                </div>
              </div>

              {/* Google Meet card */}
              <div className="rounded-xl border" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                      <Video size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Google Meet</h2>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>Auto-generated meeting links for confirmed sessions</p>
                    </div>
                  </div>
                  <StatusBadge configured={status?.calendar.configured ?? false} testSuccess={testResult?.calendar.success} />
                </div>
                <div className="p-4">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Meet links are automatically created when a Calendar event is created upon appointment confirmation.
                    No additional configuration needed — uses the Google Calendar API.
                  </p>
                </div>
              </div>

              {/* Setup instructions */}
              <div className="rounded-xl border" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
                <div className="border-b px-6 py-4" style={{ borderColor: "var(--card-border)" }}>
                  <h2 className="font-semibold">Setup Instructions</h2>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>How to configure the Google Service Account</p>
                </div>
                <div className="space-y-4 p-6">
                  <ol className="list-inside list-decimal space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline"
                        style={{ color: "var(--primary)" }}
                      >
                        Google Cloud Console <ExternalLink size={12} />
                      </a>{" "}
                      and create a project (or use an existing one)
                    </li>
                    <li>
                      Enable the <strong style={{ color: "var(--foreground)" }}>Google Calendar API</strong> and{" "}
                      <strong style={{ color: "var(--foreground)" }}>Google Sheets API</strong>
                    </li>
                    <li>Go to <strong style={{ color: "var(--foreground)" }}>Credentials</strong> → Create a <strong style={{ color: "var(--foreground)" }}>Service Account</strong></li>
                    <li>Download the JSON key file for the service account</li>
                    <li>
                      Share your Google Calendar with the service account email
                      (give it <strong style={{ color: "var(--foreground)" }}>&ldquo;Make changes to events&rdquo;</strong> permission)
                    </li>
                    <li>
                      Share your Google Sheet with the service account email
                      (give it <strong style={{ color: "var(--foreground)" }}>&ldquo;Editor&rdquo;</strong> permission)
                    </li>
                    <li>
                      Add the following to your <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">.env.local</code>:
                    </li>
                  </ol>

                  <div className="rounded-lg p-4" style={{ backgroundColor: "var(--background)" }}>
                    <pre className="overflow-x-auto text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
{`GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_CALENDAR_ID=your-calendar-id@gmail.com
GOOGLE_SHEET_ID=your-google-sheet-id`}
                    </pre>
                  </div>

                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    The Calendar ID can be found in Google Calendar → Settings → Calendar Settings.
                    The Sheet ID is the long string in the Google Sheet URL between <code className="rounded bg-black/30 px-1 py-0.5 text-xs">/d/</code> and <code className="rounded bg-black/30 px-1 py-0.5 text-xs">/edit</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
