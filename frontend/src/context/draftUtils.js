export function bestAvailablePlayer(players) {
  return [...players].sort((a, b) => (Number(b.avgFantasyPoints) || 0) - (Number(a.avgFantasyPoints) || 0))[0] || null
}

export function canCommitPick(state, expectedPickIndex, now = Date.now(), auto = false) {
  if (!state || state.currentPickIndex !== expectedPickIndex) return false
  const deadline = state.pickDeadline?.toMillis?.() || 0
  const expired = now >= deadline
  return auto ? expired : !expired
}

export function commitPick(state, player, auto = false) {
  if (!canCommitPick(state, state.currentPickIndex, Date.now(), auto)) return null
  return { ...state, currentPickIndex: state.currentPickIndex + 1, picks: [...(state.picks || []), { playerId: player.id, auto }] }
}
