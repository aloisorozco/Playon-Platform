import { bestAvailablePlayer, canCommitPick, commitPick } from './draftUtils'

const timestamp = (milliseconds) => ({ toMillis: () => milliseconds })

describe('draft policy', () => {
  test('racing clients can only commit the same pick once', () => {
    const state = { currentPickIndex: 3, pickDeadline: timestamp(Date.now() + 10000), picks: [] }
    const first = commitPick(state, { id: 'player-a' })
    expect(first.currentPickIndex).toBe(4)
    expect(canCommitPick(first, state.currentPickIndex)).toBe(false)
  })

  test('a manual pick one second before the deadline is valid', () => {
    const now = Date.now()
    const state = { currentPickIndex: 0, pickDeadline: timestamp(now + 1000), picks: [] }
    expect(canCommitPick(state, 0, now)).toBe(true)
  })

  test('a reconnecting client can auto-pick an expired turn', () => {
    const state = { currentPickIndex: 1, pickDeadline: timestamp(Date.now() - 1), picks: [] }
    expect(canCommitPick(state, 1, Date.now(), true)).toBe(true)
    expect(bestAvailablePlayer([{ id: 'low', avgFantasyPoints: 4 }, { id: 'high', avgFantasyPoints: 9 }]).id).toBe('high')
  })
})