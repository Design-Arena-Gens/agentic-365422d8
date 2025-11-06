"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/context/dashboard-context";
import { AttendanceStatus } from "@/types";

const statusOptions: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "present", label: "Present", tone: "bg-emerald-100 text-emerald-700" },
  { value: "absent", label: "Absent", tone: "bg-rose-100 text-rose-600" },
  { value: "excused", label: "Excused", tone: "bg-amber-100 text-amber-700" },
];

export const TeacherDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { state, dispatch, getAttendanceSummaryForTeacher } = useDashboard();

  const teacherId = state.users[userId]?.relatedTeacherId;
  const teacher = teacherId ? state.teachers[teacherId] : undefined;
  const [selectedGroupId, setSelectedGroupId] = useState<string>(teacher?.groupIds[0] ?? "");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const groups = useMemo(() => teacher?.groupIds.map((id) => state.groups[id]).filter(Boolean) ?? [], [teacher, state.groups]);

  const activeGroupId = useMemo(() => {
    if (selectedGroupId && groups.some((group) => group.id === selectedGroupId)) {
      return selectedGroupId;
    }
    return groups[0]?.id ?? "";
  }, [groups, selectedGroupId]);

  const currentGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const students = currentGroup?.studentIds.map((id) => state.students[id]).filter(Boolean) ?? [];

  const monthlySummaries = useMemo(() => (teacherId ? getAttendanceSummaryForTeacher(teacherId) : []), [getAttendanceSummaryForTeacher, teacherId]);

  if (!teacher) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        Teacher account not linked. Contact director to assign you to a group.
      </div>
    );
  }

  const applyStatus = (studentId: string, status: AttendanceStatus) => {
    dispatch({
      type: "RECORD_ATTENDANCE",
      payload: {
        studentId,
        teacherId: teacher.id,
        date: selectedDate,
        status,
        note: noteDrafts[studentId],
      },
    });
  };

  const latestAttendanceFor = (studentId: string) =>
    state.students[studentId]?.attendance.find((record) => record.date === selectedDate);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Hello, {teacher.name}</h1>
            <p className="text-sm text-slate-600">Track attendance and tuition adjustments for your groups.</p>
          </div>
          <div className="text-xs text-slate-500">
            Telegram code: <span className="font-semibold text-slate-900">{teacher.telegramCode}</span>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Daily Attendance</h2>
            <p className="text-sm text-slate-600">Mark presence and add optional notes for each child.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
            <select
              value={activeGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} · {group.ageRange}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {students.map((student) => {
            const todaysRecord = latestAttendanceFor(student.id);
            return (
              <div key={student.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">Parent: {student.parentName}</div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Monthly fee: {student.baseMonthlyFee.toLocaleString()} UZS
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => applyStatus(student.id, option.value)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        todaysRecord?.status === option.value
                          ? `${option.tone} ring-2 ring-offset-1`
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={noteDrafts[student.id] ?? todaysRecord?.note ?? ""}
                  onChange={(event) =>
                    setNoteDrafts((prev) => ({
                      ...prev,
                      [student.id]: event.target.value,
                    }))
                  }
                  placeholder="Optional note for today"
                  className="h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                {todaysRecord && (
                  <p className="text-[11px] text-slate-500">
                    Last update: {todaysRecord.status.toUpperCase()} · {todaysRecord.date}
                  </p>
                )}
              </div>
            );
          })}
          {students.length === 0 && <p className="text-sm text-slate-500">No students assigned to this group yet.</p>}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attendance History</h2>
          <p className="text-sm text-slate-600">Recent entries across your classroom.</p>
          <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {students.flatMap((student) =>
              student.attendance.slice(0, 10).map((record) => (
                <div key={`${student.id}-${record.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{student.name}</span>
                    <span>{record.date}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{record.status.toUpperCase()}</div>
                  {record.note && <div className="text-xs text-slate-500">Note: {record.note}</div>}
                </div>
              )),
            )}
            {students.every((student) => student.attendance.length === 0) && (
              <p className="text-sm text-slate-500">No attendance data registered yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tuition Adjustments</h2>
          <p className="text-sm text-slate-600">Automatic payment recalculations based on attendance.</p>
          <div className="mt-4 space-y-3">
            {monthlySummaries.map((summary) => {
              const student = state.students[summary.studentId];
              if (!student) return null;
              return (
                <div key={summary.studentId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between text-sm font-semibold text-slate-900">
                    <span>{student.name}</span>
                    <span>{summary.adjustedFee.toLocaleString()} UZS</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Present {summary.presentDays} · Absent {summary.absentDays} · Excused {summary.excusedDays}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Base fee {student.baseMonthlyFee.toLocaleString()} · Daily rate {summary.ratePerDay.toFixed(0)} UZS
                  </div>
                </div>
              );
            })}
            {monthlySummaries.length === 0 && <p className="text-sm text-slate-500">No tuition data available.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};
