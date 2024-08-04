export function isArray(item: any): boolean {
  return item instanceof Array
}
export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null
}
export function hasChanged(v1, v2): boolean {
  return !Object.is(v1, v2)
}
