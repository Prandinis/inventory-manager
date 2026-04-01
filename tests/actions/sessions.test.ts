import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  hall: { findUnique: vi.fn() },
  hallSession: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  sessionItem: { update: vi.fn() },
  reportEmail: { findMany: vi.fn() },
}))

const authMock = vi.hoisted(() => ({
  api: { getSession: vi.fn() },
}))

const resendMock = vi.hoisted(() => ({
  sendCheckoutReport: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/resend', () => resendMock)
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import { checkinAction, checkoutAction, getLastCheckoutItems } from '@/actions/sessions'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const GUARD = { id: 'guard1', role: 'guard' }
const ADMIN = { id: 'admin1', role: 'admin' }
const HALL_ID = 'cjld2cjxh0000qzrmn831i7rn'
const SESSION_ID = 'cjld2cjxh0001qzrmn831i7rn'

// ─── checkinAction ────────────────────────────────────────────────────────────

describe('checkinAction', () => {
  const input = {
    hallId: HALL_ID,
    items: [{ name: 'Cadeira', qty: 10 }],
    notes: 'tudo ok',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: GUARD })
    prismaMock.hall.findUnique.mockResolvedValue({ id: HALL_ID, active: true })
    prismaMock.hallSession.findFirst.mockResolvedValue(null)
    prismaMock.hallSession.create.mockResolvedValue({ id: SESSION_ID })
  })

  it('creates open session with items and redirects to dashboard', async () => {
    await expect(checkinAction(input)).rejects.toThrow('NEXT_REDIRECT:/dashboard')
    expect(prismaMock.hallSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hallId: HALL_ID,
          status: 'open',
          items: { create: [{ name: 'Cadeira', checkinQty: 10 }] },
        }),
      })
    )
  })

  it('rejects if hall not found or inactive', async () => {
    prismaMock.hall.findUnique.mockResolvedValue(null)
    await expect(checkinAction(input)).rejects.toThrow('Salão não encontrado')
    expect(prismaMock.hallSession.create).not.toHaveBeenCalled()
  })

  it('rejects if there is already an open session for the hall', async () => {
    prismaMock.hallSession.findFirst.mockResolvedValue({ id: 'existing' })
    await expect(checkinAction(input)).rejects.toThrow('Já existe um check-in aberto para este salão')
  })

  it('rejects unauthenticated user', async () => {
    authMock.api.getSession.mockResolvedValue(null)
    await expect(checkinAction(input)).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(prismaMock.hallSession.create).not.toHaveBeenCalled()
  })
})

// ─── checkoutAction ───────────────────────────────────────────────────────────

describe('checkoutAction', () => {
  const input = {
    sessionId: SESSION_ID,
    items: [{ itemId: 'item1', qty: 8 }],
  }

  const openSession = {
    id: SESSION_ID,
    guardId: GUARD.id,
    status: 'open',
    notes: null,
    items: [{ id: 'item1', name: 'Cadeira', checkinQty: 10 }],
  }

  const fullSession = {
    ...openSession,
    hall: { id: HALL_ID, name: 'Salão A' },
    guard: GUARD,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    authMock.api.getSession.mockResolvedValue({ user: GUARD })
    prismaMock.hallSession.findUnique
      .mockResolvedValueOnce(openSession)
      .mockResolvedValueOnce(fullSession)
    prismaMock.sessionItem.update.mockResolvedValue({})
    prismaMock.hallSession.update.mockResolvedValue({})
    prismaMock.reportEmail.findMany.mockResolvedValue([{ email: 'report@test.com' }])
    resendMock.sendCheckoutReport.mockResolvedValue(undefined)
  })

  it('closes session, updates item quantities and redirects', async () => {
    await expect(checkoutAction(input)).rejects.toThrow(`NEXT_REDIRECT:/sessions/${SESSION_ID}`)
    expect(prismaMock.sessionItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item1' }, data: { checkoutQty: 8 } })
    )
    expect(prismaMock.hallSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'closed' }) })
    )
  })

  it('sends checkout report to active emails', async () => {
    await expect(checkoutAction(input)).rejects.toThrow(/NEXT_REDIRECT/)
    expect(resendMock.sendCheckoutReport).toHaveBeenCalledWith(fullSession, ['report@test.com'])
  })

  it('rejects if session not found or already closed', async () => {
    prismaMock.hallSession.findUnique.mockReset()
    prismaMock.hallSession.findUnique.mockResolvedValueOnce(null)
    await expect(checkoutAction(input)).rejects.toThrow('Sessão não encontrada ou já encerrada')
  })

  it('rejects if guard tries to close another guard session', async () => {
    prismaMock.hallSession.findUnique.mockReset()
    prismaMock.hallSession.findUnique.mockResolvedValueOnce({ ...openSession, guardId: 'other-guard' })
    await expect(checkoutAction(input)).rejects.toThrow('Sem permissão para fazer checkout desta sessão')
  })

  it('allows admin to close any session', async () => {
    authMock.api.getSession.mockResolvedValue({ user: ADMIN })
    prismaMock.hallSession.findUnique.mockReset()
    prismaMock.hallSession.findUnique
      .mockResolvedValueOnce({ ...openSession, guardId: 'other-guard' })
      .mockResolvedValueOnce(fullSession)
    await expect(checkoutAction(input)).rejects.toThrow(/NEXT_REDIRECT/)
    expect(prismaMock.hallSession.update).toHaveBeenCalled()
  })
})

// ─── getLastCheckoutItems ─────────────────────────────────────────────────────

describe('getLastCheckoutItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns items from last closed session using checkoutQty', async () => {
    prismaMock.hallSession.findFirst.mockResolvedValue({
      items: [{ name: 'Cadeira', checkinQty: 10, checkoutQty: 8 }],
    })
    const result = await getLastCheckoutItems(HALL_ID)
    expect(result).toEqual([{ name: 'Cadeira', qty: 8 }])
  })

  it('falls back to checkinQty when checkoutQty is null', async () => {
    prismaMock.hallSession.findFirst.mockResolvedValue({
      items: [{ name: 'Mesa', checkinQty: 5, checkoutQty: null }],
    })
    const result = await getLastCheckoutItems(HALL_ID)
    expect(result).toEqual([{ name: 'Mesa', qty: 5 }])
  })

  it('returns null if hall has no previous checkout', async () => {
    prismaMock.hallSession.findFirst.mockResolvedValue(null)
    const result = await getLastCheckoutItems(HALL_ID)
    expect(result).toBeNull()
  })
})
