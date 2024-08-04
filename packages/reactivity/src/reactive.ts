import { mutableHandlers } from './baseHandlers'
import { isObject } from './share'
/**
 * 响应性 Map 缓存对象
 * key：target
 * val：proxy
 */
// 2.创建依赖对象收集依赖
const reactiveMap = new WeakMap()

// 1.运行reactive函数
export function reactive(target: object) {
  return createReactive(target, mutableHandlers, reactiveMap)
}

// 3.创建createReactive
function createReactive(
  target: object,
  baseHandlers: ProxyHandler<any>, //mutableHandlers
  proxyMap: WeakMap<object, any> //收集被代理对象 依赖的map对象 reactiveMap
) {
  //4.先查看收集的依赖中是否有相同的被代理对象
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 5.没有则创建一个新的代理对象放入依赖weekMap中
  // 6.进入baseHandlers设置get set方法
  const proxy = new Proxy(target, baseHandlers) // baseHandlers Proxy的get set等监听函数的对象
  //设置被代理对象
  proxyMap.set(target, proxy)
  return proxy
}
export function toReactive<T extends unknown>(value: T): T {
  return isObject(value) ? reactive(value as object) : value
}
