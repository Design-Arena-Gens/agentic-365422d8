export type Role = "super_admin" | "director" | "teacher" | "parent";

export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string
  status: AttendanceStatus;
  recordedBy: string; // teacherId
  note?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: "cash" | "card" | "transfer";
  recordedBy: string; // directorId or system
  memo?: string;
}

export interface NotificationEntry {
  id: string;
  audience: "teachers" | "parents";
  senderRole: Role;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface Student {
  id: string;
  kindergartenId: string;
  branchId: string;
  groupId: string;
  name: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentUserId: string;
  baseMonthlyFee: number;
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

export interface Teacher {
  id: string;
  kindergartenId: string;
  branchId: string;
  groupIds: string[];
  name: string;
  phone: string;
  telegramCode: string;
}

export interface Group {
  id: string;
  kindergartenId: string;
  branchId: string;
  name: string;
  ageRange: string;
  teacherId?: string;
  studentIds: string[];
}

export interface Branch {
  id: string;
  kindergartenId: string;
  name: string;
  address: string;
  groupIds: string[];
}

export interface KindergartenApplication {
  id: string;
  name: string;
  directorName: string;
  directorEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  notes?: string;
}

export interface Kindergarten {
  id: string;
  name: string;
  status: "active" | "inactive" | "draft";
  directorId: string;
  applicationId?: string;
  branchIds: string[];
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email?: string;
  phone?: string;
  relatedKindergartenId?: string;
  relatedTeacherId?: string;
  relatedParentStudentId?: string;
}

export interface SystemSettings {
  branding: {
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  localization: {
    language: string;
    currency: string;
  };
}

export interface DashboardState {
  settings: SystemSettings;
  kindergartens: Record<string, Kindergarten>;
  branches: Record<string, Branch>;
  groups: Record<string, Group>;
  teachers: Record<string, Teacher>;
  students: Record<string, Student>;
  users: Record<string, User>;
  applications: Record<string, KindergartenApplication>;
  notifications: NotificationEntry[];
}

export interface SessionState {
  userId: string;
}

export interface TeacherAttendanceSummary {
  studentId: string;
  presentDays: number;
  absentDays: number;
  excusedDays: number;
  expectedDays: number;
  ratePerDay: number;
  adjustedFee: number;
}
