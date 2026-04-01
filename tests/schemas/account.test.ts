import { describe, it, expect } from 'vitest'
import { ChangePasswordSchema, ResetPasswordSchema } from '@/lib/schemas/account'

describe('ChangePasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      ChangePasswordSchema.parse({
        currentPassword: 'senhaAtual',
        newPassword: 'novaSenha1',
        confirm: 'novaSenha1',
      })
    ).toBeDefined()
  })

  it('rejects if confirm does not match', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: 'senhaAtual',
        newPassword: 'novaSenha1',
        confirm: 'diferente',
      })
    ).toThrow()
  })

  it('rejects newPassword shorter than 8 chars', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: 'senhaAtual',
        newPassword: 'curta',
        confirm: 'curta',
      })
    ).toThrow()
  })

  it('rejects empty currentPassword', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: '',
        newPassword: 'novaSenha1',
        confirm: 'novaSenha1',
      })
    ).toThrow()
  })
})

describe('ResetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      ResetPasswordSchema.parse({ newPassword: 'novaSenha1', confirm: 'novaSenha1' })
    ).toBeDefined()
  })

  it('rejects mismatched passwords', () => {
    expect(() =>
      ResetPasswordSchema.parse({ newPassword: 'novaSenha1', confirm: 'diferente' })
    ).toThrow()
  })

  it('rejects password shorter than 8 chars', () => {
    expect(() =>
      ResetPasswordSchema.parse({ newPassword: 'curta', confirm: 'curta' })
    ).toThrow()
  })
})
