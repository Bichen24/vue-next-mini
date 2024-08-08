import { isArray, isObject } from 'packages/reactivity/src/share'
import { isVNode, VNode } from './vnode'
import { isFunction, isString } from '@vue/shared'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { normalizeClass } from 'packages/shared/src/normalizeProps'

export function h(type: any, propOrChildren?: any, children?: any) {
  const l = arguments.length
  if (l == 2) {
    if (isObject(propOrChildren) && !isArray(propOrChildren)) {
      //   是对象而且是VNode
      if (isVNode(propOrChildren)) {
        return createVNode(type, null, [propOrChildren])
      }
      //   是对象但是是props
      return createVNode(type, propOrChildren, [])
    } else {
      //   是数组不是对象
      return createVNode(type, null, propOrChildren)
    }
  } else {
    // 如果参数在三个以上，则从第二个参数开始，把后续所有参数都作为 children
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
    } // 如果传递的参数只有三个，则 children 是单纯的 children
    else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propOrChildren, children)
  }
}
export function createVNode(type, props, children): VNode {
  if (props) {
    // 处理 class
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  // 通过 bit 位处理 shapeFlag 类型
  // 获取当前VNode主节点的类(Element\Component\...)型便于后续计算
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type) //判断是否为组件 组件是一个带有 render方法的对象传递进 render 函数 本质上是一个vnode对象
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  return createBaseVNode(type, props, children, shapeFlag)
}
export function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlag
  } as VNode
  // 解析children
  normalizeChildren(vnode, children)

  return vnode
}
export function normalizeChildren(vnode, children) {
  let type = 0
  const { shapeFlag } = vnode
  //分析children类型
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    // TODO: array
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    // TODO: object
  } else if (isFunction(children)) {
    // TODO: function
  } else {
    // children 为 string
    children = String(children)
    // 为 type 指定 Flags
    type = ShapeFlags.TEXT_CHILDREN
  }
  // 修改 vnode 的 chidlren
  vnode.children = children
  // 按位或赋值 根据children类型进行位运算
  //   计算出是什么情况Element\Component... + ArrayChildren\TextChildren...
  //   每个情况都有自己的位运算值便于rednder函数分析
  vnode.shapeFlag |= type
}
