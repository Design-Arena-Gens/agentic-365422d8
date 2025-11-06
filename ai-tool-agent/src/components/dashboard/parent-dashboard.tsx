"use client";

import { useMemo } from "react";
import { useDashboard } from "@/context/dashboard-context";

export const ParentDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { state } = useDashboard();
  const parentUser = state.users[userId];
  const student = parentUser?.relatedParentStudentId
    ? state.students[parentUser.relatedParentStudentId]
    : undefined;

  const notificationFeed = useMemo(() => state.notifications.slice(0, 5), [state.notifications]);

  if (!student) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
        Your child is not linked yet. Contact your kindergarten director for assistance.
      </div>
    );
  }

  const kindergarten = state.kindergartens[student.kindergartenId];
  const branch = state.branches[student.branchId];
  const group = state.groups[student.groupId];
  const teacher = group?.teacherId ? state.teachers[group.teacherId] : undefined;

  const attendanceByStatus = student.attendance.reduce(
    (acc, record) => ({
      ...acc,
      [record.status]: (acc[record.status] ?? 0) + 1,
    }),
    { present: 0, absent: 0, excused: 0 },
  );

  const totalPaid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome, {parentUser?.name}</h1>
            <p className="text-sm text-slate-600">Monitor {student.name}&apos;s attendance, tuition, and news.</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            Kindergarten: <span className="font-semibold text-slate-900">{kindergarten?.name}</span>
            <br /> Branch: <span className="font-semibold text-slate-900">{branch?.name}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Child overview</h2>
          <dl className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <dt className="font-medium text-slate-500">Name</dt>
              <dd className="font-semibold text-slate-900">{student.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-500">Age</dt>
              <dd className="font-semibold text-slate-900">{student.age} years</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-500">Group</dt>
              <dd className="font-semibold text-slate-900">{group?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-500">Teacher</dt>
              <dd className="font-semibold text-slate-900">{teacher?.name ?? "TBD"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-500">Contact</dt>
              <dd className="font-semibold text-slate-900">{teacher?.phone ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attendance balance</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <StatBadge label="Present" value={attendanceByStatus.present} tone="emerald" />
            <StatBadge label="Absent" value={attendanceByStatus.absent} tone="rose" />
            <StatBadge label="Excused" value={attendanceByStatus.excused} tone="amber" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Payment status</h2>
          <p className="mt-2 text-sm text-slate-600">Monthly tuition: {student.baseMonthlyFee.toLocaleString()} UZS</p>
          <p className="text-sm text-slate-600">Total paid: {totalPaid.toLocaleString()} UZS</p>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            {student.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <div className="font-semibold text-slate-900">{payment.amount.toLocaleString()} UZS</div>
                  <div className="text-[11px]">{payment.method.toUpperCase()}</div>
                </div>
                <div className="text-right text-[11px]">
                  <div>{new Date(payment.date).toLocaleDateString()}</div>
                  {payment.memo && <div>{payment.memo}</div>}
                </div>
              </div>
            ))}
            {student.payments.length === 0 && <p>No payments recorded yet.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent attendance</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {student.attendance.slice(0, 12).map((record) => (
            <div key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="font-semibold text-slate-900">{new Date(record.date).toLocaleDateString()}</div>
              <div className="text-xs text-slate-500">Status: {record.status.toUpperCase()}</div>
              {record.note && <div className="text-xs text-slate-500">Note: {record.note}</div>}
            </div>
          ))}
          {student.attendance.length === 0 && <p className="text-sm text-slate-500">No attendance yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Kindergarten updates</h2>
        <div className="mt-4 space-y-3">
          {notificationFeed.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{notification.audience === "parents" ? "Parents" : "Teachers"}</span>
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{notification.message}</p>
            </div>
          ))}
          {notificationFeed.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
        </div>
      </section>
    </div>
  );
};

const StatBadge: React.FC<{ label: string; value: number; tone: "emerald" | "rose" | "amber" }> = ({ label, value, tone }) => {
  const toneMapping = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  } as const;
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${toneMapping[tone]}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
};
