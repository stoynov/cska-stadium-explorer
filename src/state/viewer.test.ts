import { test, expect } from 'bun:test'
import { initialState, viewerReducer } from './viewer'

test('manual input interrupts the tour without losing the chapter or display settings', () => {
  const state = {
    ...initialState,
    chapter: 3,
    tour: true,
    cutaway: true,
    night: true,
  }
  const next = viewerReducer(state, { type: 'manual' })
  expect(next.tour).toBe(false)
  expect(next.chapter).toBe(3)
  expect(next.cutaway).toBe(true)
  expect(next.night).toBe(true)
})
test('reset selects overview and preserves independent display and language settings', () => {
  const state = {
    ...initialState,
    chapter: 4,
    tour: true,
    labels: true,
    cutaway: true,
    language: 'en' as const,
  }
  const next = viewerReducer(state, { type: 'reset' })
  expect(next.chapter).toBe(0)
  expect(next.tour).toBe(false)
  expect(next.labels).toBe(true)
  expect(next.cutaway).toBe(true)
  expect(next.language).toBe('en')
  expect(next.request).toBeGreaterThan(state.request)
})
test('chapter selection cancels tour and replaces the previous camera request', () => {
  const next = viewerReducer(
    { ...initialState, tour: true },
    { type: 'chapter', chapter: 2 },
  )
  expect(next.chapter).toBe(2)
  expect(next.tour).toBe(false)
  expect(next.request).toBe(1)
})
test('tour advances cyclically without stopping and language changes do not move camera', () => {
  const state = { ...initialState, chapter: 4, tour: true }
  const next = viewerReducer(state, { type: 'advance' })
  expect(next.chapter).toBe(0)
  expect(next.tour).toBe(true)
  const localized = viewerReducer(next, { type: 'language', language: 'en' })
  expect(localized.request).toBe(next.request)
})
test('pausing signals cancellation of the active camera transition', () => {
  const state = { ...initialState, tour: true }
  expect(viewerReducer(state, { type: 'tour' }).cancel).toBe(state.cancel + 1)
  expect(viewerReducer(state, { type: 'manual' }).cancel).toBe(state.cancel + 1)
})
