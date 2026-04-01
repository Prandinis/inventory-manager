import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  user: { update: vi.fn() },
}))

const authMock = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
    changePassword: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import { changeFirstLoginPassword } from '@/actions/account'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER = { id: 'user1', role: 'guard' }

function fd(data: Record<string, string>) {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => form.append(k, v))
  return form
}

// ─── changeFirstLoginPassword ─────────────────────────────────────────────────

describe('changeFirstLoginPassword', () => {
  const validForm = fd({
    currentPassword: 'senhaAtual1',
    newPassword: 'novaSenha123',
    confirm: 'novaSenha123',
  })

  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: USER })
    authMock.api.changePassword.mockResolvedValue({})
    prismaMock.user.update.mockResolvedValue({})
  })

  it('changes password, clears mustChangePassword and redirects to dashboard', async () => {
    await expect(changeFirstLoginPassword(validForm)).rejects.toThrow('NEXT_REDIRECT:/dashboard')
    expect(authMock.api.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          newPassword: 'novaSenha123',
          revokeOtherSessions: true,
        }),
      })
    )
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: USER.id },
        data: { mustChangePassword: false },
      })
    )
  })

  it('rejects if confirm does not match newPassword', async () => {
    await expect(
      changeFirstLoginPassword(fd({
        currentPassword: 'senhaAtual1',
        newPassword: 'novaSenha123',
        confirm: 'diferente',
      }))
    ).rejects.toThrow()
    expect(authMock.api.changePassword).not.toHaveBeenCalled()
  })

  it('rejects if new password is too short', async () => {
    await expect(
      changeFirstLoginPassword(fd({
        currentPassword: 'senhaAtual1',
        newPassword: 'curta',
        confirm: 'curta',
      }))
    ).rejects.toThrow()
    expect(authMock.api.changePassword).not.toHaveBeenCalled()
  })

  it('redirects to login if unauthenticated', async () => {
    authMock.api.getSession.mockResolvedValue(null)
    await expect(changeFirstLoginPassword(validForm)).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(authMock.api.changePassword).not.toHaveBeenCalled()
  })
})
