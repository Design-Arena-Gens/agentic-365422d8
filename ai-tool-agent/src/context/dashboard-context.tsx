"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { v4 as uuid } from "uuid";
import { initialState } from "@/lib/initial-data";
import {
  AttendanceStatus,
  DashboardState,
  NotificationEntry,
  Role,
  TeacherAttendanceSummary,
} from "@/types";

interface CreateKindergartenPayload {
  name: string;
  directorName: string;
  directorEmail: string;
}

interface ReviewApplicationPayload {
  applicationId: string;
  status: "approved" | "rejected";
  reviewerId: string;
  notes?: string;
}

interface AddBranchPayload {
  kindergartenId: string;
  name: string;
  address: string;
}

interface AddTeacherPayload {
  kindergartenId: string;
  branchId: string;
  name: string;
  phone: string;
}

interface AddStudentPayload {
  kindergartenId: string;
  branchId: string;
  groupId: string;
  name: string;
  age: number;
  parentName: string;
  parentPhone: string;
  baseMonthlyFee: number;
}

interface AddGroupPayload {
  kindergartenId: string;
  branchId: string;
  name: string;
  ageRange: string;
}

interface AssignTeacherPayload {
  groupId: string;
  teacherId: string;
}

interface RecordPaymentPayload {
  studentId: string;
  amount: number;
  method: "cash" | "card" | "transfer";
  recordedBy: string;
  memo?: string;
}

interface SendNotificationPayload {
  audience: NotificationEntry["audience"];
  senderId: string;
  senderRole: Role;
  message: string;
}

interface UpdateSettingsPayload {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  language?: string;
  currency?: string;
}

interface RecordAttendancePayload {
  studentId: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export type DashboardAction =
  | { type: "CREATE_KINDERGARTEN"; payload: CreateKindergartenPayload }
  | { type: "REVIEW_APPLICATION"; payload: ReviewApplicationPayload }
  | { type: "ADD_BRANCH"; payload: AddBranchPayload }
  | { type: "ADD_TEACHER"; payload: AddTeacherPayload }
  | { type: "ADD_GROUP"; payload: AddGroupPayload }
  | { type: "ASSIGN_TEACHER"; payload: AssignTeacherPayload }
  | { type: "ADD_STUDENT"; payload: AddStudentPayload }
  | { type: "RECORD_PAYMENT"; payload: RecordPaymentPayload }
  | { type: "SEND_NOTIFICATION"; payload: SendNotificationPayload }
  | { type: "UPDATE_SETTINGS"; payload: UpdateSettingsPayload }
  | { type: "RECORD_ATTENDANCE"; payload: RecordAttendancePayload };

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  getAttendanceSummaryForTeacher: (teacherId: string) => TeacherAttendanceSummary[];
}>({
  state: initialState,
  dispatch: () => undefined,
  getAttendanceSummaryForTeacher: () => [],
});

const getDaysInCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case "CREATE_KINDERGARTEN": {
      const kindergartenId = uuid();
      const directorId = uuid();
      const { name, directorEmail, directorName } = action.payload;

      return {
        ...state,
        kindergartens: {
          ...state.kindergartens,
          [kindergartenId]: {
            id: kindergartenId,
            name,
            status: "active",
            directorId,
            applicationId: undefined,
            branchIds: [],
          },
        },
        users: {
          ...state.users,
          [directorId]: {
            id: directorId,
            name: directorName,
            email: directorEmail,
            role: "director",
            relatedKindergartenId: kindergartenId,
          },
        },
      };
    }
    case "REVIEW_APPLICATION": {
      const { applicationId, reviewerId, status, notes } = action.payload;
      const application = state.applications[applicationId];
      if (!application) return state;

      const updatedApplication = {
        ...application,
        status,
        reviewerId,
        reviewedAt: new Date().toISOString(),
        notes,
      };

      let updatedState: DashboardState = {
        ...state,
        applications: {
          ...state.applications,
          [applicationId]: updatedApplication,
        },
      };

      if (status === "approved") {
        const kindergartenId = uuid();
        const directorId = uuid();
        updatedState = {
          ...updatedState,
          kindergartens: {
            ...updatedState.kindergartens,
            [kindergartenId]: {
              id: kindergartenId,
              name: application.name,
              status: "active",
              directorId,
              applicationId,
              branchIds: [],
            },
          },
          users: {
            ...updatedState.users,
            [directorId]: {
              id: directorId,
              role: "director",
              name: application.directorName,
              email: application.directorEmail,
              relatedKindergartenId: kindergartenId,
            },
          },
        };
      }

      return updatedState;
    }
    case "ADD_BRANCH": {
      const id = uuid();
      const branch = {
        id,
        kindergartenId: action.payload.kindergartenId,
        name: action.payload.name,
        address: action.payload.address,
        groupIds: [],
      };
      const kindergarten = state.kindergartens[action.payload.kindergartenId];
      return {
        ...state,
        branches: {
          ...state.branches,
          [id]: branch,
        },
        kindergartens: {
          ...state.kindergartens,
          [branch.kindergartenId]: {
            ...kindergarten,
            branchIds: [...(kindergarten?.branchIds ?? []), id],
          },
        },
      };
    }
    case "ADD_GROUP": {
      const id = uuid();
      const group = {
        id,
        kindergartenId: action.payload.kindergartenId,
        branchId: action.payload.branchId,
        name: action.payload.name,
        ageRange: action.payload.ageRange,
        teacherId: undefined,
        studentIds: [],
      };

      const branch = state.branches[action.payload.branchId];

      return {
        ...state,
        groups: {
          ...state.groups,
          [id]: group,
        },
        branches: {
          ...state.branches,
          [group.branchId]: {
            ...branch,
            groupIds: [...(branch?.groupIds ?? []), id],
          },
        },
      };
    }
    case "ADD_TEACHER": {
      const id = uuid();
      const code = `${action.payload.name.split(" ")[0].toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
      return {
        ...state,
        teachers: {
          ...state.teachers,
          [id]: {
            id,
            kindergartenId: action.payload.kindergartenId,
            branchId: action.payload.branchId,
            groupIds: [],
            name: action.payload.name,
            phone: action.payload.phone,
            telegramCode: code,
          },
        },
        users: {
          ...state.users,
          [id]: {
            id,
            role: "teacher",
            name: action.payload.name,
            phone: action.payload.phone,
            relatedKindergartenId: action.payload.kindergartenId,
            relatedTeacherId: id,
          },
        },
      };
    }
    case "ASSIGN_TEACHER": {
      const group = state.groups[action.payload.groupId];
      if (!group) return state;

      const previousTeacher = group.teacherId ? state.teachers[group.teacherId] : undefined;
      const nextTeacher = action.payload.teacherId ? state.teachers[action.payload.teacherId] : undefined;

      const updatedTeachers = { ...state.teachers };

      if (previousTeacher) {
        updatedTeachers[previousTeacher.id] = {
          ...previousTeacher,
          groupIds: previousTeacher.groupIds.filter((id) => id !== group.id),
        };
      }

      if (nextTeacher) {
        updatedTeachers[nextTeacher.id] = {
          ...nextTeacher,
          groupIds: Array.from(new Set([...nextTeacher.groupIds, group.id])),
        };
      }

      return {
        ...state,
        groups: {
          ...state.groups,
          [group.id]: {
            ...group,
            teacherId: nextTeacher?.id,
          },
        },
        teachers: updatedTeachers,
      };
    }
    case "ADD_STUDENT": {
      const id = uuid();
      const parentUserId = uuid();
      const student = {
        id,
        kindergartenId: action.payload.kindergartenId,
        branchId: action.payload.branchId,
        groupId: action.payload.groupId,
        name: action.payload.name,
        age: action.payload.age,
        parentName: action.payload.parentName,
        parentPhone: action.payload.parentPhone,
        parentUserId,
        baseMonthlyFee: action.payload.baseMonthlyFee,
        attendance: [],
        payments: [],
      };
      const group = state.groups[action.payload.groupId];

      return {
        ...state,
        students: {
          ...state.students,
          [id]: student,
        },
        groups: {
          ...state.groups,
          [group.id]: {
            ...group,
            studentIds: [...group.studentIds, id],
          },
        },
        users: {
          ...state.users,
          [parentUserId]: {
            id: parentUserId,
            role: "parent",
            name: action.payload.parentName,
            phone: action.payload.parentPhone,
            relatedParentStudentId: id,
          },
        },
      };
    }
    case "RECORD_PAYMENT": {
      const student = state.students[action.payload.studentId];
      if (!student) return state;

      const payment = {
        id: uuid(),
        studentId: student.id,
        amount: action.payload.amount,
        date: new Date().toISOString(),
        method: action.payload.method,
        recordedBy: action.payload.recordedBy,
        memo: action.payload.memo,
      };

      return {
        ...state,
        students: {
          ...state.students,
          [student.id]: {
            ...student,
            payments: [payment, ...student.payments],
          },
        },
      };
    }
    case "SEND_NOTIFICATION": {
      const notification: NotificationEntry = {
        id: uuid(),
        audience: action.payload.audience,
        senderId: action.payload.senderId,
        senderRole: action.payload.senderRole,
        message: action.payload.message,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications],
      };
    }
    case "UPDATE_SETTINGS": {
      const { accentColor, currency, language, logoUrl, primaryColor } = action.payload;
      return {
        ...state,
        settings: {
          branding: {
            logoUrl: logoUrl ?? state.settings.branding.logoUrl,
            primaryColor: primaryColor ?? state.settings.branding.primaryColor,
            accentColor: accentColor ?? state.settings.branding.accentColor,
          },
          localization: {
            language: language ?? state.settings.localization.language,
            currency: currency ?? state.settings.localization.currency,
          },
        },
      };
    }
    case "RECORD_ATTENDANCE": {
      const student = state.students[action.payload.studentId];
      if (!student) return state;

      const existing = student.attendance.find((rec) => rec.date === action.payload.date);
      let updatedAttendance = student.attendance;
      if (existing) {
        updatedAttendance = student.attendance.map((rec) =>
          rec.date === action.payload.date
            ? { ...rec, status: action.payload.status, note: action.payload.note }
            : rec,
        );
      } else {
        updatedAttendance = [
          {
            id: uuid(),
            studentId: student.id,
            date: action.payload.date,
            status: action.payload.status,
            recordedBy: action.payload.teacherId,
            note: action.payload.note,
          },
          ...student.attendance,
        ];
      }

      return {
        ...state,
        students: {
          ...state.students,
          [student.id]: {
            ...student,
            attendance: updatedAttendance,
          },
        },
      };
    }
    default:
      return state;
  }
};

const computeTeacherAttendanceSummary = (
  state: DashboardState,
  teacherId: string,
): TeacherAttendanceSummary[] => {
  const teacher = state.teachers[teacherId];
  if (!teacher) return [];
  const daysInMonth = getDaysInCurrentMonth();

  return teacher.groupIds.flatMap((groupId) => {
    const group = state.groups[groupId];
    if (!group) return [];

    return group.studentIds.map((studentId) => {
      const student = state.students[studentId];
      if (!student) return [];

      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyAttendance = student.attendance.filter((rec) => rec.date.startsWith(currentMonth));

      const presentDays = monthlyAttendance.filter((rec) => rec.status === "present").length;
      const absentDays = monthlyAttendance.filter((rec) => rec.status === "absent").length;
      const excusedDays = monthlyAttendance.filter((rec) => rec.status === "excused").length;
      const ratePerDay = student.baseMonthlyFee / daysInMonth;
      const adjustedFee = Math.max(student.baseMonthlyFee - absentDays * ratePerDay, 0);

      return {
        studentId: student.id,
        presentDays,
        absentDays,
        excusedDays,
        expectedDays: daysInMonth,
        ratePerDay,
        adjustedFee,
      } satisfies TeacherAttendanceSummary;
    });
  }).flat();
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      getAttendanceSummaryForTeacher: (teacherId: string) => computeTeacherAttendanceSummary(state, teacherId),
    }),
    [state, dispatch],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
