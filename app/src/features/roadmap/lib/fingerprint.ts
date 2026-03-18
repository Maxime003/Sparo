const KEY = 'sparo_visitor_fp'

export function getFingerprint(): string {
  let fp = localStorage.getItem(KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(KEY, fp)
  }
  return fp
}
