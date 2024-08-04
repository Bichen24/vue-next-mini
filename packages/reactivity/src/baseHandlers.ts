import { track, trigger } from './effect'

/**
 * 响应性的 handler //包含当前被代理对象的get set 方法的handler对象
 */
const get = createGetter()
const set = createSetter()

//reactive.ts
// function createReactive(
//   target: object,
//   baseHandlers: ProxyHandler<any>, //mutableHandlers
//   proxyMap: WeakMap<object, any> //收集被代理对象 依赖的map对象 reactiveMap
// ) {
//   //先查看收集的依赖中是否有相同的被代理对象
//   const existingProxy = proxyMap.get(target)
//   if (existingProxy) {
//     return existingProxy
//   }
// ------------------此处为进入点----------------------
//   const proxy = new Proxy(target, baseHandlers) // baseHandlers Proxy的get set等监听函数的对象
//   //设置被代理对象
//   proxyMap.set(target, proxy)
//   return proxy
// }
//从这个函数进入过来处理get 和 set
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
// 1.创建get
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    //1.1进行get获取值
    const res = Reflect.get(target, key, receiver)
    // 1.2收集依赖effect.ts 检查那些依赖在被设置值的时候需要触发
    track(target, key)
    return res
  }
}
// 2.创建 set
function createSetter() {
  // 这就是proxy的set函数
  return function set(
    target: object,
    key: string | symbol,
    newValue: unknown,
    receiver: object
  ) {
    //2.1进行set设置值
    const res = Reflect.set(target, key, newValue, receiver)

    //2.2在值被改变时触发依赖 effect.ts 更新内容
    trigger(target, key, newValue)
    return res
  }
}
