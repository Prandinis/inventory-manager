import { describe, it, expect } from 'vitest'
import {
  CreateHallSchema,
  AddReportEmailSchema,
  CreateUserSchema,
  CreateInitialAdminSchema,
  UserRoleSchema,
} from '@/lib/schemas/admin'

describe('CreateHallSchema', () => {
  it('accepts valid name', () => {
    expect(CreateHallSchema.parse({ name: 'Salão A' })).toMatchObject({ name: 'Salão A' })
  })
  it('rejects empty name', () => {
    expect(() => CreateHallSchema.parse({ name: '' })).toThrow()
  })
  it('rejects name over 100 chars', () => {
    expect(() => CreateHallSchema.parse({ name: 'a'.repeat(101) })).toThrow()
  })
  it('strips undefined description', () => {
    const result = CreateHallSchema.parse({ name: 'A' })
    expect(result.description).toBeUndefined()
  })
})

describe('AddReportEmailSchema', () => {
  it('accepts valid email', () => {
    expect(AddReportEmailSchema.parse({ email: 'a@b.com' })).toMatchObject({ email: 'a@b.com' })
  })
  it('rejects malformed email', () => {
    expect(() => AddReportEmailSchema.parse({ email: 'not-an-email' })).toThrow()
  })
  it('accepts optional name', () => {
    const result = AddReportEmailSchema.parse({ email: 'a@b.com', name: 'Relatório' })
    expect(result.name).toBe('Relatório')
  })
})

describe('CreateUserSchema', () => {
  it('accepts valid name and email', () => {
    expect(CreateUserSchema.parse({ name: 'João', email: 'joao@test.com' })).toBeDefined()
  })
  it('rejects name shorter than 2 chars', () => {
    expect(() => CreateUserSchema.parse({ name: 'J', email: 'j@test.com' })).toThrow()
  })
  it('rejects invalid email', () => {
    expect(() => CreateUserSchema.parse({ name: 'João', email: 'bad' })).toThrow()
  })
})

describe('CreateInitialAdminSchema', () => {
  it('accepts valid data', () => {
    expect(
      CreateInitialAdminSchema.parse({ name: 'Admin', email: 'a@b.com', password: 'senha123' })
    ).toBeDefined()
  })
  it('rejects password shorter than 8 chars', () => {
    expect(() =>
      CreateInitialAdminSchema.parse({ name: 'Admin', email: 'a@b.com', password: 'curta' })
    ).toThrow()
  })
})

describe('UserRoleSchema', () => {
  it('accepts admin', () => {
    expect(UserRoleSchema.parse('admin')).toBe('admin')
  })
  it('accepts guard', () => {
    expect(UserRoleSchema.parse('guard')).toBe('guard')
  })
  it('rejects unknown role', () => {
    expect(() => UserRoleSchema.parse('superadmin')).toThrow()
  })
})
