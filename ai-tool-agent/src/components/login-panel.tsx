"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/context/dashboard-context";
import { Role } from "@/types";

interface LoginPanelProps {
  onLogin: (userId: string) => void;
}

type ViewState = "select-role" | "choose-user" | "teacher-login" | "parent-login";

export const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const {
    state: { users, teachers },
  } = useDashboard();
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<ViewState>("select-role");
  const [teacherCode, setTeacherCode] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const roleUsers = useMemo(() => {
    if (!role) return [];
    return Object.values(users).filter((user) => user.role === role);
  }, [role, users]);

  const reset = () => {
    setError(null);
    setTeacherCode("");
    setParentPhone("");
  };

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
    reset();

    if (selected === "teacher") {
      setView("teacher-login");
      return;
    }
    if (selected === "parent") {
      setView("parent-login");
      return;
    }

    setView("choose-user");
  };

  const handleTeacherLogin = () => {
    const teacher = Object.values(teachers).find((t) => t.telegramCode === teacherCode.trim());
    if (!teacher) {
      setError("Invalid Telegram code");
      return;
    }
    const teacherUser = roleUsers.find((user) => user.relatedTeacherId === teacher.id);
    if (teacherUser) {
      onLogin(teacherUser.id);
    } else {
      setError("Teacher account not linked");
    }
  };

  const handleParentLogin = () => {
    const parent = roleUsers.find((user) => user.phone?.replace(/\s/g, "") === parentPhone.replace(/\s/g, ""));
    if (parent) {
      onLogin(parent.id);
    } else {
      setError("Parent phone not found");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white/90 p-10 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">AI Kindergarten Control Center</h1>
        <p className="mt-2 text-sm text-slate-600">
          Login to manage kindergartens, classrooms, attendance, and tuition in one place.
        </p>
      </div>
      {view === "select-role" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { role: "super_admin", label: "Super Admin", description: "Manage platform-wide operations" },
              { role: "director", label: "Director", description: "Oversee branches, staff, and payments" },
              { role: "teacher", label: "Teacher", description: "Track daily attendance and fees" },
              { role: "parent", label: "Parent", description: "Follow your child’s progress" },
            ] satisfies { role: Role; label: string; description: string }[]
          ).map((item) => (
            <button
              key={item.role}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow"
              onClick={() => handleRoleSelect(item.role)}
            >
              <div className="text-lg font-medium text-slate-900">{item.label}</div>
              <div className="mt-1 text-sm text-slate-600">{item.description}</div>
            </button>
          ))}
        </div>
      )}

      {view === "choose-user" && role && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Select {role.replace("_", " ")} account</h2>
            <p className="text-sm text-slate-600">Choose one of the existing users to get started.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {roleUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user.id)}
                className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:shadow"
              >
                <span className="text-base font-medium text-slate-900">{user.name}</span>
                <span className="text-xs text-slate-500">{user.email ?? user.phone}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setView("select-role")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to role selection
          </button>
        </div>
      )}

      {view === "teacher-login" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Teacher Telegram Login</h2>
            <p className="text-sm text-slate-600">
              Enter the one-time code provided by the kindergarten bot to access your groups.
            </p>
          </div>
          <input
            value={teacherCode}
            onChange={(event) => setTeacherCode(event.target.value)}
            placeholder="e.g. ANNA-1234"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div className="flex gap-3">
            <button
              onClick={handleTeacherLogin}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Connect via Telegram Code
            </button>
            <button
              onClick={() => {
                setView("select-role");
                setRole(null);
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === "parent-login" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Parent Phone Login</h2>
            <p className="text-sm text-slate-600">
              Enter the phone number registered with the kindergarten to view your child.
            </p>
          </div>
          <input
            value={parentPhone}
            onChange={(event) => setParentPhone(event.target.value)}
            placeholder="e.g. +99890 123 45 67"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div className="flex gap-3">
            <button
              onClick={handleParentLogin}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Access Parent Portal
            </button>
            <button
              onClick={() => {
                setView("select-role");
                setRole(null);
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
