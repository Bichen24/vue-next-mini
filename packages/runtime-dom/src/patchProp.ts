import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchAttr } from './modules/attrs'
import { patchStyle } from './modules/style'
import { patchEvent } from './modules/event'

/**
 * 为 prop 进行打补丁操作
 */
export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    // 事件
    patchEvent(el, key, prevValue, nextValue)
  } else if (shouldSetAsProp(el, key)) {
    // 通过 DOM Properties 指定
    patchDOMProp(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}
// 判断是否使用props.
const shouldSetAsProp = (el: Element, key) => {
  // #1787, #2840 表单元素的表单属性是只读的，必须设置为属性 attribute
  if (key === 'form') {
    return false
  }

  // #1526 <input list> 必须设置为属性 attribute
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }

  // #2766 <textarea type> 必须设置为属性 attribute
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }

  return key in el
}
