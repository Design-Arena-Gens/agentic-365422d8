"use client";

import { FormEvent, useMemo, useState } from "react";
import { useDashboard } from "@/context/dashboard-context";
import { Group } from "@/types";

interface DirectorFormState {
  branchName: string;
  branchAddress: string;
  teacherName: string;
  teacherPhone: string;
  groupName: string;
  groupAge: string;
  studentName: string;
  studentAge: number;
  parentName: string;
  parentPhone: string;
  baseFee: number;
  enrollmentGroupId: string;
  paymentStudentId: string;
  paymentAmount: number;
  paymentMethod: "cash" | "card" | "transfer";
  paymentMemo: string;
  notificationAudience: "teachers" | "parents";
  notificationMessage: string;
}

const initialForm: DirectorFormState = {
  branchName: "",
  branchAddress: "",
  teacherName: "",
  teacherPhone: "",
  groupName: "",
  groupAge: "",
  studentName: "",
  studentAge: 4,
  parentName: "",
  parentPhone: "",
  baseFee: 700_000,
  enrollmentGroupId: "",
  paymentStudentId: "",
  paymentAmount: 350_000,
  paymentMethod: "cash",
  paymentMemo: "",
  notificationAudience: "teachers",
  notificationMessage: "",
};

export const DirectorDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { state, dispatch } = useDashboard();
  const director = state.users[userId];
  const kindergarten = director?.relatedKindergartenId
    ? state.kindergartens[director.relatedKindergartenId]
    : undefined;

  const [form, setForm] = useState(initialForm);

  const branches = useMemo(() => {
    if (!kindergarten) return [];
    return kindergarten.branchIds.map((id) => state.branches[id]).filter(Boolean);
  }, [kindergarten, state.branches]);

  const groupsByBranch = useMemo(() => {
    const mapping: Record<string, Group[]> = {};
    branches.forEach((branch) => {
      mapping[branch.id] = branch.groupIds.map((id) => state.groups[id]).filter(Boolean);
    });
    return mapping;
  }, [branches, state.groups]);

  const teachers = useMemo(() =>
    Object.values(state.teachers).filter((teacher) => teacher.kindergartenId === kindergarten?.id),
  [state.teachers, kindergarten]);

  const students = useMemo(
    () => Object.values(state.students).filter((student) => student.kindergartenId === kindergarten?.id),
    [state.students, kindergarten],
  );

  if (!director || !kindergarten) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        Director account is not linked with a kindergarten yet. Ask the Super Admin to complete setup.
      </div>
    );
  }

  const updateForm = <K extends keyof DirectorFormState>(field: K, value: DirectorFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addBranch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.branchName || !form.branchAddress) return;
    dispatch({
      type: "ADD_BRANCH",
      payload: {
        kindergartenId: kindergarten.id,
        name: form.branchName,
        address: form.branchAddress,
      },
    });
    setForm((prev) => ({ ...prev, branchName: "", branchAddress: "" }));
  };

  const addTeacher = (event: FormEvent<HTMLFormElement>, branchId: string) => {
    event.preventDefault();
    if (!form.teacherName || !form.teacherPhone) return;
    dispatch({
      type: "ADD_TEACHER",
      payload: {
        kindergartenId: kindergarten.id,
        branchId,
        name: form.teacherName,
        phone: form.teacherPhone,
      },
    });
    setForm((prev) => ({ ...prev, teacherName: "", teacherPhone: "" }));
  };

  const addGroup = (event: FormEvent<HTMLFormElement>, branchId: string) => {
    event.preventDefault();
    if (!form.groupName || !form.groupAge) return;
    dispatch({
      type: "ADD_GROUP",
      payload: {
        kindergartenId: kindergarten.id,
        branchId,
        name: form.groupName,
        ageRange: form.groupAge,
      },
    });
    setForm((prev) => ({ ...prev, groupName: "", groupAge: "" }));
  };

  const addStudent = (event: FormEvent<HTMLFormElement>, branchId: string) => {
    event.preventDefault();
    const groupId = form.enrollmentGroupId || groupsByBranch[branchId]?.[0]?.id;
    if (!groupId) return;
    dispatch({
      type: "ADD_STUDENT",
      payload: {
        kindergartenId: kindergarten.id,
        branchId,
        groupId,
        name: form.studentName,
        age: form.studentAge,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        baseMonthlyFee: form.baseFee,
      },
    });
    setForm((prev) => ({
      ...prev,
      studentName: "",
      studentAge: 4,
      parentName: "",
      parentPhone: "",
      baseFee: 700_000,
      enrollmentGroupId: "",
    }));
  };

  const assignTeacher = (groupId: string, teacherId: string) => {
    dispatch({
      type: "ASSIGN_TEACHER",
      payload: { groupId, teacherId },
    });
  };

  const recordPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.paymentStudentId) return;
    dispatch({
      type: "RECORD_PAYMENT",
      payload: {
        studentId: form.paymentStudentId,
        amount: form.paymentAmount,
        method: form.paymentMethod,
        memo: form.paymentMemo,
        recordedBy: userId,
      },
    });
    setForm((prev) => ({ ...prev, paymentAmount: 350_000, paymentMemo: "" }));
  };

  const sendNotification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.notificationMessage) return;
    dispatch({
      type: "SEND_NOTIFICATION",
      payload: {
        audience: form.notificationAudience,
        senderId: userId,
        senderRole: "director",
        message: form.notificationMessage,
      },
    });
    setForm((prev) => ({ ...prev, notificationMessage: "" }));
  };

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-slate-50 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{kindergarten.name}</h1>
        <p className="text-sm text-slate-600">Manage branches, team, groups, students, and finances.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Branches</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              {branches.length} locations
            </span>
          </div>
          <form onSubmit={addBranch} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">New branch name</label>
              <input
                value={form.branchName}
                onChange={(event) => updateForm("branchName", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Chilanzar Campus"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Address</label>
              <input
                value={form.branchAddress}
                onChange={(event) => updateForm("branchAddress", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Bunyodkor 8"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Add branch
            </button>
          </form>
          <div className="mt-6 space-y-4">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-slate-900">{branch.name}</h3>
                <p className="text-xs text-slate-500">{branch.address}</p>
                <p className="mt-1 text-xs text-slate-500">Groups: {branch.groupIds.length}</p>
              </div>
            ))}
            {branches.length === 0 && <p className="text-sm text-slate-500">No branches added yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
          <p className="text-sm text-slate-600">Record manual payments and track parent balances.</p>
          <form onSubmit={recordPayment} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Student</label>
              <select
                value={form.paymentStudentId}
                onChange={(event) => updateForm("paymentStudentId", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} · {student.parentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Amount (UZS)</label>
                <input
                  type="number"
                  value={form.paymentAmount}
                  onChange={(event) => updateForm("paymentAmount", Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(event) => updateForm("paymentMethod", event.target.value as DirectorFormState["paymentMethod"])}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank transfer</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Memo</label>
              <input
                value={form.paymentMemo}
                onChange={(event) => updateForm("paymentMemo", event.target.value)}
                placeholder="October tuition"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
            >
              Record payment
            </button>
          </form>
          <div className="mt-6 space-y-4">
            {students.slice(0, 4).map((student) => {
              const totalPaid = student.payments.reduce((sum, record) => sum + record.amount, 0);
              return (
                <div key={student.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                  <div className="text-xs text-slate-500">Parent: {student.parentName}</div>
                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span>Base fee</span>
                    <span>{student.baseMonthlyFee.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Paid</span>
                    <span>{totalPaid.toLocaleString()} UZS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{branch.name}</h2>
                <p className="text-xs text-slate-500">{branch.address}</p>
              </div>
              <div className="text-xs text-slate-500">
                Teachers: {teachers.filter((teacher) => teacher.branchId === branch.id).length} · Groups: {
                  groupsByBranch[branch.id]?.length ?? 0
                }
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <form onSubmit={(event) => addTeacher(event, branch.id)} className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <h3 className="text-sm font-semibold text-indigo-700">Invite teacher</h3>
                <input
                  value={form.teacherName}
                  onChange={(event) => updateForm("teacherName", event.target.value)}
                  placeholder="Teacher name"
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                <input
                  value={form.teacherPhone}
                  onChange={(event) => updateForm("teacherPhone", event.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add teacher
                </button>
              </form>

              <form onSubmit={(event) => addGroup(event, branch.id)} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Create group</h3>
                <input
                  value={form.groupName}
                  onChange={(event) => updateForm("groupName", event.target.value)}
                  placeholder="Group name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                <input
                  value={form.groupAge}
                  onChange={(event) => updateForm("groupAge", event.target.value)}
                  placeholder="Age range (e.g. 4-5 years)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Add group
                </button>
              </form>

              <form onSubmit={(event) => addStudent(event, branch.id)} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="text-sm font-semibold text-emerald-700">Enroll student</h3>
                <input
                  value={form.studentName}
                  onChange={(event) => updateForm("studentName", event.target.value)}
                  placeholder="Student name"
                  className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={form.studentAge}
                    onChange={(event) => updateForm("studentAge", Number(event.target.value))}
                    placeholder="Age"
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                  <select
                    value={form.enrollmentGroupId}
                    onChange={(event) => updateForm("enrollmentGroupId", event.target.value)}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  >
                    <option value="">Select group</option>
                    {groupsByBranch[branch.id]?.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={form.parentName}
                  onChange={(event) => updateForm("parentName", event.target.value)}
                  placeholder="Parent name"
                  className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                <input
                  value={form.parentPhone}
                  onChange={(event) => updateForm("parentPhone", event.target.value)}
                  placeholder="Parent phone"
                  className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                <input
                  type="number"
                  value={form.baseFee}
                  onChange={(event) => updateForm("baseFee", Number(event.target.value))}
                  placeholder="Base fee"
                  className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Enroll student
                </button>
              </form>
            </div>

            <div className="mt-6 space-y-4">
              {groupsByBranch[branch.id]?.map((group) => (
                <div key={group.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{group.name}</h3>
                      <p className="text-xs text-slate-500">Age: {group.ageRange}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Teacher:</span>
                      <select
                        value={group.teacherId ?? ""}
                        onChange={(event) => assignTeacher(group.id, event.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                      >
                        <option value="">Unassigned</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600">
                    {group.studentIds.map((studentId) => {
                      const student = state.students[studentId];
                      if (!student) return null;
                      const lastAttendance = student.attendance[0];
                      return (
                        <div key={studentId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <div>
                            <div className="font-medium text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500">Parent: {student.parentName}</div>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Last attendance: {lastAttendance ? `${lastAttendance.date} · ${lastAttendance.status}` : "N/A"}
                          </div>
                        </div>
                      );
                    })}
                    {group.studentIds.length === 0 && <div className="text-xs text-slate-500">No students yet.</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Telegram Notifications</h2>
        <p className="text-sm text-slate-600">Send quick updates to teachers or parents via the bot integration.</p>
        <form onSubmit={sendNotification} className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Audience</label>
            <select
              value={form.notificationAudience}
              onChange={(event) => updateForm("notificationAudience", event.target.value as DirectorFormState["notificationAudience"])}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            >
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
          </div>
          <div className="space-y-3">
            <textarea
              value={form.notificationMessage}
              onChange={(event) => updateForm("notificationMessage", event.target.value)}
              placeholder="Share a reminder or important announcement"
              className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              type="submit"
              className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Send broadcast
            </button>
          </div>
        </form>
        <div className="mt-6 space-y-3">
          {state.notifications
            .filter((notification) => notification.senderId === userId)
            .slice(0, 4)
            .map((notification) => (
              <div key={notification.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{notification.audience === "teachers" ? "Teachers" : "Parents"}</span>
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{notification.message}</p>
              </div>
            ))}
          {state.notifications.filter((notification) => notification.senderId === userId).length === 0 && (
            <p className="text-sm text-slate-500">No notifications sent yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
