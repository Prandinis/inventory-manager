import { z } from "zod"

export const CuidSchema = z.string().cuid()

// Better Auth generates its own IDs (not CUIDs)
export const AuthIdSchema = z.string().min(1).max(256)

export const CreateHallSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  description: z.string().max(255).optional(),
})

export const AddReportEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().max(100).optional(),
})

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
})

export const CreateInitialAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export const UserRoleSchema = z.enum(["admin", "guard"])
