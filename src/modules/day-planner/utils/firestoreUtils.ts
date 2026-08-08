/**
 * Recursively removes all `undefined` values from an object or array,
 * which are unsupported by Firebase Firestore.
 */
export const sanitizeForFirestore = (val: any): any => {
  if (val === undefined) {
    return null // Firestore accepts null but throws on undefined
  }
  if (val === null) {
    return null
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore)
  }
  if (typeof val === 'object') {
    const res: any = {}
    for (const key of Object.keys(val)) {
      if (val[key] !== undefined) {
        res[key] = sanitizeForFirestore(val[key])
      }
    }
    return res
  }
  return val
}
