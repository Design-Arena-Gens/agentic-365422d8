"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useDashboard } from "@/context/dashboard-context";
import { LoginPanel } from "@/components/login-panel";
import { SuperAdminDashboard } from "@/components/dashboard/super-admin-dashboard";
import { DirectorDashboard } from "@/components/dashboard/director-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { Role } from "@/types";

export default function Home() {
  const { state } = useDashboard();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = currentUserId ? state.users[currentUserId] : undefined;

  const headerColor = state.settings.branding.primaryColor;

  const dashboard = useMemo(() => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "super_admin":
        return <SuperAdminDashboard userId={currentUser.id} />;
      case "director":
        return <DirectorDashboard userId={currentUser.id} />;
      case "teacher":
        return <TeacherDashboard userId={currentUser.id} />;
      case "parent":
        return <ParentDashboard userId={currentUser.id} />;
      default:
        return null;
    }
  }, [currentUser]);

  const handleLogout = () => setCurrentUserId(null);

  return (
    <main className="min-h-screen bg-[url('/grid.svg')] bg-fixed bg-cover bg-center bg-no-repeat">
      <div className="bg-gradient-to-b from-white/90 via-white/95 to-white/90">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          {currentUser ? (
            <div className="space-y-10">
              <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow"
                    style={{ background: headerColor }}
                  >
                    <Image src="/sunshine-logo.svg" alt="Logo" width={24} height={24} className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">Agentic Kindergarten HQ</h1>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Signed in as {labelForRole(currentUser.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-slate-500">
                    {currentUser.email ?? currentUser.phone}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    Log out
                  </button>
                </div>
              </header>
              {dashboard}
            </div>
          ) : (
            <div className="py-16">
              <LoginPanel onLogin={(id) => setCurrentUserId(id)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const labelForRole = (role: Role) => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "director":
      return "Director";
    case "teacher":
      return "Teacher";
    case "parent":
      return "Parent";
    default:
      return "User";
  }
};
