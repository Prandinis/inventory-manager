import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mocks (must be defined before imports) ──────────────────────────

const prismaMock = vi.hoisted(() => ({
  hall: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  user: {
    count: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  reportEmail: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
}))

const authMock = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
    signUpEmail: vi.fn(),
  },
}))

const resendMock = vi.hoisted(() => ({
  sendWelcomeEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/resend', () => resendMock)
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import {
  createHall,
  toggleHall,
  getActiveHalls,
  createUser,
  setUserRole,
  addReportEmail,
  toggleReportEmail,
  createInitialAdmin,
} from '@/actions/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ADMIN = { id: 'admin1', role: 'admin', email: 'admin@test.com' }
const GUARD = { id: 'guard1', role: 'guard', email: 'guard@test.com' }
const VALID_CUID = 'cjld2cjxh0000qzrmn831i7rn'

function fd(data: Record<string, string>) {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => form.append(k, v))
  return form
}

// ─── createHall ───────────────────────────────────────────────────────────────

describe('createHall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.hall.create.mockResolvedValue({ id: VALID_CUID, name: 'Salão A' })
  })

  it('creates hall with valid data', async () => {
    await createHall(fd({ name: 'Salão A', description: 'Descrição' }))
    expect(prismaMock.hall.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Salão A' }) })
    )
  })

  it('rejects empty name', async () => {
    await expect(createHall(fd({ name: '' }))).rejects.toThrow()
    expect(prismaMock.hall.create).not.toHaveBeenCalled()
  })

  it('rejects name over 100 chars', async () => {
    await expect(createHall(fd({ name: 'a'.repeat(101) }))).rejects.toThrow()
  })

  it('rejects unauthenticated user', async () => {
    authMock.api.getSession.mockResolvedValue(null)
    await expect(createHall(fd({ name: 'A' }))).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('rejects non-admin user', async () => {
    authMock.api.getSession.mockResolvedValue({ user: GUARD })
    await expect(createHall(fd({ name: 'A' }))).rejects.toThrow('Acesso restrito a administradores')
  })
})

// ─── toggleHall ───────────────────────────────────────────────────────────────

describe('toggleHall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.hall.update.mockResolvedValue({})
  })

  it('toggles hall from active to inactive', async () => {
    prismaMock.hall.findUnique.mockResolvedValue({ id: VALID_CUID, active: true })
    await toggleHall(VALID_CUID)
    expect(prismaMock.hall.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } })
    )
  })

  it('toggles hall from inactive to active', async () => {
    prismaMock.hall.findUnique.mockResolvedValue({ id: VALID_CUID, active: false })
    await toggleHall(VALID_CUID)
    expect(prismaMock.hall.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: true } })
    )
  })

  it('throws if hall not found', async () => {
    prismaMock.hall.findUnique.mockResolvedValue(null)
    await expect(toggleHall(VALID_CUID)).rejects.toThrow('Salão não encontrado')
  })

  it('rejects invalid cuid', async () => {
    await expect(toggleHall('not-a-cuid')).rejects.toThrow()
    expect(prismaMock.hall.findUnique).not.toHaveBeenCalled()
  })
})

// ─── getActiveHalls ───────────────────────────────────────────────────────────

describe('getActiveHalls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: GUARD })
  })

  it('queries only active halls', async () => {
    prismaMock.hall.findMany.mockResolvedValue([])
    await getActiveHalls()
    expect(prismaMock.hall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true } })
    )
  })

  it('rejects unauthenticated user', async () => {
    authMock.api.getSession.mockResolvedValue(null)
    await expect(getActiveHalls()).rejects.toThrow('NEXT_REDIRECT:/login')
  })
})

// ─── createUser ───────────────────────────────────────────────────────────────

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    authMock.api.signUpEmail.mockResolvedValue({})
    prismaMock.user.update.mockResolvedValue({})
    resendMock.sendWelcomeEmail.mockResolvedValue(undefined)
  })

  it('creates user and sets mustChangePassword', async () => {
    await createUser(fd({ name: 'João Silva', email: 'joao@test.com' }))
    expect(authMock.api.signUpEmail).toHaveBeenCalled()
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'joao@test.com' },
        data: { mustChangePassword: true },
      })
    )
  })

  it('sends welcome email', async () => {
    await createUser(fd({ name: 'João Silva', email: 'joao@test.com' }))
    expect(resendMock.sendWelcomeEmail).toHaveBeenCalledWith(
      'joao@test.com',
      'João Silva',
      expect.any(String)
    )
  })

  it('rejects name shorter than 2 chars', async () => {
    await expect(createUser(fd({ name: 'J', email: 'j@test.com' }))).rejects.toThrow()
    expect(authMock.api.signUpEmail).not.toHaveBeenCalled()
  })

  it('rejects invalid email', async () => {
    await expect(createUser(fd({ name: 'João', email: 'not-an-email' }))).rejects.toThrow()
  })

  it('rejects if email already exists', async () => {
    authMock.api.signUpEmail.mockRejectedValue(new Error('User already exists'))
    await expect(createUser(fd({ name: 'João Silva', email: 'joao@test.com' }))).rejects.toThrow()
    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(resendMock.sendWelcomeEmail).not.toHaveBeenCalled()
  })
})

// ─── setUserRole ──────────────────────────────────────────────────────────────

describe('setUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.user.update.mockResolvedValue({})
  })

  it('sets role to admin', async () => {
    await setUserRole('user123', 'admin')
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'admin' } })
    )
  })

  it('sets role to guard', async () => {
    await setUserRole('user123', 'guard')
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'guard' } })
    )
  })

  it('rejects invalid role', async () => {
    await expect(setUserRole('user123', 'superadmin' as any)).rejects.toThrow()
  })

  it('rejects non-admin caller', async () => {
    authMock.api.getSession.mockResolvedValue({ user: GUARD })
    await expect(setUserRole('user123', 'admin')).rejects.toThrow('Acesso restrito a administradores')
  })
})

// ─── addReportEmail ───────────────────────────────────────────────────────────

describe('addReportEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.reportEmail.upsert.mockResolvedValue({})
  })

  it('creates report email', async () => {
    await addReportEmail(fd({ email: 'report@test.com', name: 'Relatório' }))
    expect(prismaMock.reportEmail.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'report@test.com' } })
    )
  })

  it('reactivates existing email via upsert', async () => {
    await addReportEmail(fd({ email: 'report@test.com' }))
    expect(prismaMock.reportEmail.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ active: true }) })
    )
  })

  it('rejects invalid email', async () => {
    await expect(addReportEmail(fd({ email: 'not-an-email' }))).rejects.toThrow()
    expect(prismaMock.reportEmail.upsert).not.toHaveBeenCalled()
  })
})

// ─── toggleReportEmail ────────────────────────────────────────────────────────

describe('toggleReportEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.reportEmail.update.mockResolvedValue({})
  })

  it('toggles email from active to inactive', async () => {
    prismaMock.reportEmail.findUnique.mockResolvedValue({ id: VALID_CUID, active: true })
    await toggleReportEmail(VALID_CUID)
    expect(prismaMock.reportEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } })
    )
  })

  it('toggles email from inactive to active', async () => {
    prismaMock.reportEmail.findUnique.mockResolvedValue({ id: VALID_CUID, active: false })
    await toggleReportEmail(VALID_CUID)
    expect(prismaMock.reportEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: true } })
    )
  })

  it('throws if email not found', async () => {
    prismaMock.reportEmail.findUnique.mockResolvedValue(null)
    await expect(toggleReportEmail(VALID_CUID)).rejects.toThrow('Email não encontrado')
  })
})

// ─── createInitialAdmin ───────────────────────────────────────────────────────

describe('createInitialAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.signUpEmail.mockResolvedValue({})
    prismaMock.user.update.mockResolvedValue({})
  })

  it('creates admin when database is empty and redirects', async () => {
    prismaMock.user.count.mockResolvedValue(0)
    await expect(
      createInitialAdmin(fd({ name: 'Admin', email: 'admin@test.com', password: 'senha123' }))
    ).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(authMock.api.signUpEmail).toHaveBeenCalled()
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'admin' } })
    )
  })

  it('rejects if users already exist', async () => {
    prismaMock.user.count.mockResolvedValue(1)
    await expect(
      createInitialAdmin(fd({ name: 'Admin', email: 'admin@test.com', password: 'senha123' }))
    ).rejects.toThrow('Já existem usuários cadastrados')
    expect(authMock.api.signUpEmail).not.toHaveBeenCalled()
  })
})
