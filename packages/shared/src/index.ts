export function isFunction(val) {
  return typeof val === 'function'
}
export function isString(val) {
  return typeof val === 'string'
}
const onRE = /^on[^a-z]/
/**
 * 是否 on 开头
 */
export const isOn = (key: string) => onRE.test(key)
/**
 * Object.assign
 */
export const extend = Object.assign
