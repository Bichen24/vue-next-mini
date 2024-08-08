import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, isSameVNodeType, Text } from './vnode'
import { isString } from '@vue/shared'
import { normalizeVNode } from './componentRenderUtils'

export interface RendererOptions {
  /*** 为指定 element 的 prop 打补丁*/
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  /*** 为指定的 Element 设置 text*/
  setElementText(node: Element, text: string): void
  /*** 插入指定的 el 到 parent 中，anchor 表示插入的位置，即：锚点*/
  insert(el, parent: Element, anchor?): void
  /*** 创建指定的 Element*/
  createElement(type: string)
  /*** 卸载指定dom*/
  remove(el): void
  /*** 创建 Text 节点*/
  createText(text: string)
  /*** 设置 text*/
  setText(node, text): void
  /*** 设置comment*/
  createComment(text: string)
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

//option是入口函数传进来的参数 是元素操作的api
function baseCreateRenderer(options: RendererOptions): any {
  /*** 解构 options，获取所有的兼容性方法*/
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment,
    remove: hostRemove
  } = options
  const unmount = vnode => {
    hostRemove(vnode.el!)
  }
  /**
   * Element 的打补丁操作
   */
  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载操作
      mountElement(newVNode, container, anchor)
    } else {
      // TODO: 更新操作
      patchElement(oldVNode, newVNode)
    }
  }

  /**
   * Text 的打补丁操作
   */
  const processText = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateText(newVNode.children as string)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 更新节点
      const el = (newVNode.el = oldVNode.el)
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children as string)
      }
    }
  }
  /**
   * Comment 的打补丁操作
   */
  const processCommentNode = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 生成节点
      newVNode.el = hostCreateComment((newVNode.children as string) || '')
      // 挂载
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 无更新
      newVNode.el = oldVNode.el
    }
  }
  /**
   * Fragment 的打补丁操作
   */
  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  //   挂载
  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode

    // 创建 element
    const el = (vnode.el = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 设置 文本子节点
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO: 设置 Array 子节点
    }

    // 处理props的添加
    if (props) {
      // 遍历 props 对象
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 插入 el 到指定的位置
    hostInsert(el, container, anchor)
  }

  /**
   * 挂载Fragmemt子节点
   */
  const mountChildren = (children, container, anchor) => {
    // 处理 Cannot assign to read only property '0' of string 'xxx'
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }
  // 更新节点
  const patchElement = (oldVNode, newVNode) => {
    // 获取指定的 el
    const el = (newVNode.el = oldVNode.el!)

    // 新旧 props
    const oldProps = oldVNode.props || null
    const newProps = newVNode.props || null

    // 更新子节点
    patchChildren(oldVNode, newVNode, el, null)
    // 更新 props
    patchProps(el, newVNode, oldProps, newProps)
  }

  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    // 旧节点的 children
    const c1 = oldVNode && oldVNode.children
    // 旧节点的 prevShapeFlag
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0

    // 新节点的 children
    const c2 = newVNode.children || ''
    // 新节点的 shapeFlag
    const { shapeFlag } = newVNode

    // 新子节点为 TEXT_CHILDREN
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 卸载旧子节点
      }
      // 新旧子节点不同
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2 as string)
      }
    } else {
      // 旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新子节点也为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 这里要进行 diff 运算
        }
        // 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
        else {
          // TODO: 卸载
        }
      } else {
        // 旧子节点为 TEXT_CHILDREN
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧的文本
          hostSetElementText(container, '')
        }
        // 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独挂载新子节点操作
        }
      }
    }
  }
  const patchProps = (el: Element, newVNode, oldProps, newProps) => {
    // 新旧 props 不相同时才进行处理
    if (oldProps !== newProps) {
      // 遍历新的 props，依次触发 hostPatchProp ，赋值新属性
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        // 对比新旧属性，如果新旧属性不同，则触发 hostPatchProp
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
    }
    // 存在旧的 props 时
    if (oldProps !== null) {
      // 遍历旧的 props，依次触发 hostPatchProp ，删除不存在于新props 中的旧属性
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  //挂载更新节点
  const patch = (oldVNode, newVNode, container, achor = null) => {
    if (oldVNode === newVNode) {
      return
    }
    /**
     * 判断是否为相同类型节点
     */
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }
    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, achor)
        break
      // patch 方法中 switch 逻辑
      case Comment:
        // Comment
        processCommentNode(oldVNode, newVNode, container, achor)
        break
      case Fragment:
        // Fragment
        processFragment(oldVNode, newVNode, container, achor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 解析并挂载元素
          processElement(oldVNode, newVNode, container, achor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // TODO: 组件
        }
    }
  }
  //render函数入口
  const render = (vnode, container) => {
    // 不存在新的 vnode 时
    if (vnode == null) {
      // 但是存在旧的 vnode
      if (container._vnode) {
        // 则直接执行卸载操作
        unmount(container._vnode)
      }
    } else {
      // 打补丁（包括了挂载和更新）
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render
  }
}
