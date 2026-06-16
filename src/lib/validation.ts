import { z } from "zod";
import {
  assetConditionEnum,
  assetStatusEnum,
  assetTypeEnum,
  roleEnum,
  ticketCategoryEnum,
  ticketPriorityEnum,
  ticketStatusEnum,
} from "@/db/schema";

const emailField = z
  .string()
  .trim()
  .pipe(z.email({ message: "Enter a valid email address." }))
  .transform((s) => s.toLowerCase());

export const SignupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: emailField,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200)
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
});

export const LoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
});

export const CreateTicketSchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters.").max(160),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue (at least 10 characters).")
    .max(5000),
  priority: z.enum(ticketPriorityEnum.enumValues),
  category: z.enum(ticketCategoryEnum.enumValues),
});

export const AddNoteSchema = z.object({
  ticketId: z.uuid(),
  body: z.string().trim().min(1, "Note cannot be empty.").max(5000),
  isInternal: z.boolean(),
});

export const UpdateStatusSchema = z.object({
  ticketId: z.uuid(),
  status: z.enum(ticketStatusEnum.enumValues),
});

export const AssignSchema = z.object({
  ticketId: z.uuid(),
  assigneeId: z
    .union([z.uuid(), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

export const SetRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(roleEnum.enumValues),
});

export const ArticleSchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters.").max(160),
  body: z
    .string()
    .trim()
    .min(20, "Article body must be at least 20 characters.")
    .max(20000),
  category: z.enum(ticketCategoryEnum.enumValues),
});

export const VoteSchema = z.object({
  articleId: z.uuid(),
  helpful: z.boolean(),
});

export const AssetSchema = z.object({
  assetTag: z.string().trim().min(2, "Asset tag is required.").max(40),
  name: z.string().trim().min(2, "Name is required.").max(120),
  type: z.enum(assetTypeEnum.enumValues),
  condition: z.enum(assetConditionEnum.enumValues),
  serialNumber: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : null)),
  warranty: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
});

export const AssignAssetSchema = z.object({
  assetId: z.uuid(),
  assigneeId: z
    .union([z.uuid(), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

export const AssetStatusSchema = z.object({
  assetId: z.uuid(),
  status: z.enum(assetStatusEnum.enumValues),
});
