export function getMarkup(role, _price) {
  const r = Number(role)
  const ROLE_MARKUP = {
    0: 0.5, // guest
    1: 0.2, // staff
    2: 0.1, // influencer
    3: 0.1, // corporate
    4: 0.05, // agency
    100: 0, // admin
  }
  return ROLE_MARKUP[r] ?? 0
}
