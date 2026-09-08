import test from 'node:test'
import assert from 'node:assert/strict'
import { atmosphereAt } from '../src/game/timeOfDay.js'
const at = (hour, minute = 0) => atmosphereAt(new Date(2026, 8, 8, hour, minute))

test('visitor-local daytime, dawn, dusk and overnight lighting', () => {
  assert.equal(at(12).night, 0)
  assert.equal(at(0).night, 1)
  assert.equal(at(23).night, 1)
  assert.equal(at(6).night, 1)
  assert.equal(at(8).night, 0)
  assert.equal(at(19).night, 1)
  assert.equal(at(7).night, .5)
  assert.equal(at(18).night, .5)
  assert.ok(at(7, 30).night < at(7).night)
  assert.ok(at(18, 30).night > at(18).night)
  assert.ok(at(23).keyIntensity < at(12).keyIntensity)
  assert.ok(at(23).fogDensity > at(12).fogDensity)
  assert.ok(at(23).hemisphere > 0)
})

test('manual day and night override local time; auto restores it', () => {
  const late = new Date(2026, 8, 8, 23)
  const noon = new Date(2026, 8, 8, 12)
  assert.equal(atmosphereAt(late, 'day').night, 0)
  assert.equal(atmosphereAt(noon, 'night').night, 1)
  assert.equal(atmosphereAt(late, 'auto').night, 1)
  assert.equal(atmosphereAt(noon, 'auto').night, 0)
})
