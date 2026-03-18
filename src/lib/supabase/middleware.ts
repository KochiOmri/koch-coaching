// This file is kept for backwards compatibility but is no longer used.
// Auth is handled via:
//   - src/proxy.ts (thin session-refresh proxy)
//   - src/hooks/useAuth.ts (client-side session + role checks)
//   - src/components/AdminSidebar.tsx (redirects unauthenticated users)
export {};
