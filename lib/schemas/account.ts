import { z } from "zod"

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual obrigatória"),
    newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(256),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  })

export const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(256),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  })
