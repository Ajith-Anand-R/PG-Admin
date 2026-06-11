import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'


describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should resolve tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })
})
