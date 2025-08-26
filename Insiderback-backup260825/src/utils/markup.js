export function getMarkup(role, price) {
  const r = Number(role)
  if (r === 1) {
    const p = Number(price) || 0
    if (p < 100) return 0.5
    if (p < 200) return 0.4
    return 0.3
  }
  if (r === 2) return 0.2
  if (r === 3) return 0.1
  if (r === 4) return 0.1
  if (r === 5) return 0.05
  return 0
}
