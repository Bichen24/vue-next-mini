import { isArray, isObject } from 'packages/reactivity/src/share'
import { isString } from '.'

export function normalizeClass(value): string {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const key in value) {
      if (value[key]) {
        res += key + ' '
      }
    }
  }
  return res.trim()
}
