import type {
  Role,
  SecurityEventType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/db/schema";

export const ROLE_LABELS: Record<Role, string> = {
  employee: "Employee",
  it_staff: "IT Staff",
  admin: "Admin",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending_user: "Pending User",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_ORDER: TicketStatus[] = [
  "open",
  "in_progress",
  "pending_user",
  "resolved",
  "closed",
];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_ORDER: TicketPriority[] = ["urgent", "high", "medium", "low"];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  hardware: "Hardware",
  software: "Software",
  network: "Network",
  access: "Access / Account",
  other: "Other",
};

export const CATEGORY_ORDER: TicketCategory[] = [
  "hardware",
  "software",
  "network",
  "access",
  "other",
];

export const SECURITY_EVENT_LABELS: Record<SecurityEventType, string> = {
  login_success: "Login success",
  login_failure: "Login failure",
  logout: "Logout",
  user_created: "User created",
  role_change: "Role change",
  ticket_assigned: "Ticket assigned",
  admin_action: "Admin action",
};

// --- Flat, tool-style accents (dots + subtle chips, no pastel pills) ---------

// Status uses a colored dot + plain label (GitHub/Linear style).
export const STATUS_DOT: Record<TicketStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  pending_user: "bg-violet-500",
  resolved: "bg-emerald-500",
  closed: "bg-zinc-400",
};

export const PRIORITY_CHIP: Record<TicketPriority, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};

export const ROLE_CHIP: Record<Role, string> = {
  employee: "bg-zinc-100 text-zinc-600",
  it_staff: "bg-teal-50 text-teal-700",
  admin: "bg-zinc-900 text-white",
};

export const SECURITY_EVENT_CHIP: Record<SecurityEventType, string> = {
  login_success: "bg-emerald-50 text-emerald-700",
  login_failure: "bg-rose-50 text-rose-700",
  logout: "bg-zinc-100 text-zinc-600",
  user_created: "bg-blue-50 text-blue-700",
  role_change: "bg-violet-50 text-violet-700",
  ticket_assigned: "bg-sky-50 text-sky-700",
  admin_action: "bg-amber-50 text-amber-700",
};
