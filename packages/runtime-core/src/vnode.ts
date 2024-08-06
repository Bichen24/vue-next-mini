export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
}

export function isVNode(val) {
  return val ? val.__v_isVNode : false
}
