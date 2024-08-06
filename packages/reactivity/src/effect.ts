import { CopmputedRefImpl } from './computed'
import { createDep, Dep } from './dep'
import { isArray } from './share'

type KeyToDepMap = Map<any, Dep>
//依赖数据结构 WeekMap<被代理对象,<被代理对象属性，使用属性的方法[]>>
const targetMap = new WeakMap<any, KeyToDepMap>()
//c-6-3 创建调度器类型
export type EffectScheduler = (...args: any[]) => any

/**
 * effect 函数
 * @param fn 执行方法
 * @returns 以 ReactiveEffect 实例为 this 的执行函数
 */
// 1.触发effect函数
export function effect<T = any>(fn: () => T) {
  // 2生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)
  //3. 执行 run 函数
  _effect.run()
}
/**
 * 单例的，当前的 调用的effect
 */
export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  /**
   *  c-5 存在该属性，则表示当前的 effect 为计算属性的 effect
   */
  computed?: CopmputedRefImpl<T>
  constructor(
    public fn: () => T,
    //c-6-3收集调度器执行函数
    public scheduler: EffectScheduler | null = null
  ) {}
  run() {
    // 为 activeEffect 赋值
    activeEffect = this
    return this.fn()
  }
}
/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 * @param oldValue 指定 key 的旧值
 */
export function trigger(target: object, key?: unknown, newValue?: unknown) {
  // 依据 target 获取存储的 map 实例
  const depsMap = targetMap.get(target)
  // 如果 map 不存在，则直接 return
  if (!depsMap) {
    return
  }
  // 依据 key，从 depsMap 中取出 value，该 value 是一个 Dep:ReactiveEffect[] 类型的数据`
  const dep = depsMap.get(key) as Dep
  // 如果 dep 不存在，则直接 return
  if (!dep) {
    return
  }
  // 执行 dep 中保存的 fn 函数
  triggerEffects(dep)
}

/**
 * 依次触发 dep 中保存的依赖
 */
export function triggerEffects(dep: Dep) {
  // 把 dep 构建为一个数组
  const effects = isArray(dep) ? dep : [...dep]
  // 依次触发
  // for (const effect of effects) {
  // 	triggerEffect(effect)
  // }

  // 不在依次触发，而是先触发所有的计算属性依赖，再触发所有的非计算属性依赖
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

/**
 * 触发指定的依赖
 */
export function triggerEffect(effect: ReactiveEffect) {
  //c-6-4 存在调度器就执行调度函数 更新数据
  if (effect.scheduler) {
    effect.scheduler()
  }
  // 否则直接执行 run 函数即可
  else {
    effect.run()
  }
}

/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 */
export function track(target: object, key: unknown) {
  // 如果当前不存在执行函数，则直接 return
  if (!activeEffect) return
  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)
  // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // 获取指定 key 的 dep 处理一个属性的多个依赖
  let dep = depsMap.get(key)
  // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep)
}

/**
 * 利用 dep 依次跟踪指定 key 的所有 effect
 * @param dep
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}
