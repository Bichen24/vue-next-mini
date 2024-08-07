export function isArray(item: any): boolean {
  return item instanceof Array && typeof item === 'object'
}
export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null
}
export function hasChanged(v1, v2): boolean {
  return !Object.is(v1, v2)
}
export function isFunction(fn): boolean {
  return typeof fn === 'function'
}
