"use client";

import { FormEvent, useMemo, useState } from "react";
import { useDashboard } from "@/context/dashboard-context";
import { Role } from "@/types";

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  director: "Director",
  teacher: "Teacher",
  parent: "Parent",
};

export const SuperAdminDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { state, dispatch } = useDashboard();
  const [kindergartenForm, setKindergartenForm] = useState({
    name: "",
    directorName: "",
    directorEmail: "",
  });
  const [settingsForm, setSettingsForm] = useState({
    logoUrl: state.settings.branding.logoUrl,
    primaryColor: state.settings.branding.primaryColor,
    accentColor: state.settings.branding.accentColor,
    language: state.settings.localization.language,
    currency: state.settings.localization.currency,
  });
  const [applicationNotes, setApplicationNotes] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const activeKindergartens = Object.values(state.kindergartens).filter((kg) => kg.status === "active").length;
    const userCountByRole = Object.values(state.users).reduce<Record<Role, number>>(
      (acc, user) => ({
        ...acc,
        [user.role]: (acc[user.role] ?? 0) + 1,
      }),
      { super_admin: 0, director: 0, teacher: 0, parent: 0 },
    );
    return {
      activeKindergartens,
      totalBranches: Object.keys(state.branches).length,
      totalGroups: Object.keys(state.groups).length,
      userCountByRole,
      pendingApplications: Object.values(state.applications).filter((app) => app.status === "pending").length,
    };
  }, [state]);

  const handleCreateKindergarten = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({
      type: "CREATE_KINDERGARTEN",
      payload: {
        name: kindergartenForm.name,
        directorName: kindergartenForm.directorName,
        directorEmail: kindergartenForm.directorEmail,
      },
    });
    setKindergartenForm({ name: "", directorName: "", directorEmail: "" });
  };

  const handleReviewApplication = (applicationId: string, status: "approved" | "rejected") => {
    dispatch({
      type: "REVIEW_APPLICATION",
      payload: {
        applicationId,
        status,
        reviewerId: userId,
        notes: applicationNotes[applicationId],
      },
    });
  };

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: settingsForm,
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
        <p className="text-sm text-slate-500">High-level metrics across all kindergartens.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Active Kindergartens" value={stats.activeKindergartens} />
          <MetricCard label="Branches" value={stats.totalBranches} />
          <MetricCard label="Groups" value={stats.totalGroups} />
          <MetricCard label="Pending Applications" value={stats.pendingApplications} accent />
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Users by Role</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(stats.userCountByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                <dt className="font-medium text-slate-600">{roleLabels[role as Role]}</dt>
                <dd className="font-semibold text-slate-900">{count}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create Kindergarten</h2>
          <p className="text-sm text-slate-500">Provide director details to launch a new kindergarten space.</p>
          <form onSubmit={handleCreateKindergarten} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Kindergarten name</label>
              <input
                value={kindergartenForm.name}
                onChange={(event) => setKindergartenForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Director name</label>
                <input
                  value={kindergartenForm.directorName}
                  onChange={(event) => setKindergartenForm((prev) => ({ ...prev, directorName: event.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Director email</label>
                <input
                  type="email"
                  value={kindergartenForm.directorEmail}
                  onChange={(event) => setKindergartenForm((prev) => ({ ...prev, directorEmail: event.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Launch kindergarten
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Brand & Locale Settings</h2>
          <p className="text-sm text-slate-500">Control the global look & feel across all portals.</p>
          <form onSubmit={handleSettingsSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Logo URL</label>
              <input
                value={settingsForm.logoUrl}
                onChange={(event) => setSettingsForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Primary color</label>
                <input
                  value={settingsForm.primaryColor}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, primaryColor: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Accent color</label>
                <input
                  value={settingsForm.accentColor}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, accentColor: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Language</label>
                <input
                  value={settingsForm.language}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, language: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Currency</label>
                <input
                  value={settingsForm.currency}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, currency: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
            >
              Save settings
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Applications Under Review</h2>
        <p className="text-sm text-slate-500">Approve or reject new kindergarten onboarding requests.</p>
        <div className="mt-4 space-y-3">
          {Object.values(state.applications)
            .filter((app) => app.status === "pending")
            .map((application) => (
              <div key={application.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{application.name}</h3>
                    <p className="text-xs text-slate-500">
                      Director: {application.directorName} · Submitted {new Date(application.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">Pending</div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <textarea
                    value={applicationNotes[application.id] ?? ""}
                    onChange={(event) =>
                      setApplicationNotes((prev) => ({ ...prev, [application.id]: event.target.value }))
                    }
                    placeholder="Review notes"
                    className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      onClick={() => handleReviewApplication(application.id, "approved")}
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 sm:w-auto"
                    >
                      Approve & create space
                    </button>
                    <button
                      onClick={() => handleReviewApplication(application.id, "rejected")}
                      className="w-full rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 sm:w-auto"
                    >
                      Reject application
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {Object.values(state.applications).filter((app) => app.status === "pending").length === 0 && (
            <p className="text-sm text-slate-500">No pending applications – great job staying on top of reviews.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">User Directory</h2>
        <p className="text-sm text-slate-500">Central view of all user accounts across the platform.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-slate-600">Name</th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600">Role</th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600">Contact</th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600">Linked Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {Object.values(state.users).map((user) => {
                const role = roleLabels[user.role];
                const kindergarten = user.relatedKindergartenId
                  ? state.kindergartens[user.relatedKindergartenId]?.name
                  : undefined;
                const student = user.relatedParentStudentId
                  ? state.students[user.relatedParentStudentId]?.name
                  : undefined;
                return (
                  <tr key={user.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">{user.name}</td>
                    <td className="px-3 py-2 text-slate-600">{role}</td>
                    <td className="px-3 py-2 text-slate-500">{user.email ?? user.phone}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {kindergarten ?? student ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
      accent ? "ring-2 ring-amber-200" : ""
    }`}
  >
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
  </div>
);
