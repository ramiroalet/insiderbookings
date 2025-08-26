import test from 'node:test'
import assert from 'node:assert'
import { getMarkup } from '../utils/markup.js'

test('getMarkup for guest tiers', () => {
  assert.strictEqual(getMarkup(1, 80), 0.5)
  assert.strictEqual(getMarkup(1, 150), 0.4)
  assert.strictEqual(getMarkup(1, 250), 0.3)
})

test('getMarkup for roles', () => {
  assert.strictEqual(getMarkup(2, 100), 0.2)
  assert.strictEqual(getMarkup(3, 100), 0.1)
  assert.strictEqual(getMarkup(4, 100), 0.1)
  assert.strictEqual(getMarkup(5, 100), 0.05)
  assert.strictEqual(getMarkup(99, 100), 0)
})
