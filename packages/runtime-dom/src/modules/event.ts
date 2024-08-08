export function patchEvent(
  el: Element & { _vei?: object },
  rawName: string,
  prevValue,
  nextValue
) {
  // vei = vue event invokers 获取invokers对象
  const invokers = el._vei || (el._vei = {})
  //   获取当前事件的缓存
  const existingInvoker = invokers[rawName]
  //   如果以及有了事件缓存 并且 有新的回调
  if (existingInvoker && nextValue) {
    // 将内部的的缓存回调更改
    existingInvoker.value = nextValue
  } //没有事件缓存 那就添加当前事件的缓存进去
  else {
    //截取事件名称 onClick -> click
    const name = parseName(rawName)
    // 有新事件传入
    if (nextValue) {
      // add
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } // 没有监听当前事件 回调传入 删除事件缓存
    else if (existingInvoker) {
      // remove
      el.removeEventListener(name, existingInvoker)
      // 删除缓存
      invokers[rawName] = undefined
    }
  }
}
/**
 * 直接返回剔除 on，其余转化为小写的事件名即可
 */
function parseName(name: string) {
  return name.slice(2).toLowerCase()
}
/**
 * 生成 invoker 函数
 */
function createInvoker(initialValue) {
  // 设置invoker为一个回调函数用于触发监听事件 然后通过invoker触发 .value中的真实事件
  //这样子以后更改时就不需要删除invoker事件，而是直接修改value即可
  const invoker = (e: Event) => {
    invoker.value && invoker.value()
  }
  // value 为真实的事件行为
  invoker.value = initialValue
  return invoker
}
