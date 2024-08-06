import { isFunction } from './share'
import type { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'
// c-1.构建computed函数
export function computed(getterOrOptions) {
  let getter
  //c-2.判断传递参数是否为函数
  const onlyGetter = isFunction(getterOrOptions)
  //c-3.是函数就赋值给getter
  if (onlyGetter) {
    getter = getterOrOptions
  }
  //c-4.创建cRef实例并返回
  const cRef = new CopmputedRefImpl(getter)
  return cRef as any
}

// c-5构建cmpouted class
export class CopmputedRefImpl<T> {
  // c-5存储依赖
  public dep?: Dep = undefined
  //c-5 存储value值
  private _value!: T
  public readonly effect: ReactiveEffect<T>
  // c-5 ref标识
  public readonly __v_isRef = true

  // c-6-1 脏：为 false 时，表示需要触发依赖。为 true 时表示需要重新执行 run 方法，更新value数据。即：数据脏了
  public _dirty = true

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      //c-6-3 判断当前脏的状态，如果为 false，表示需要《触发依赖》更新数据
      if (!this._dirty) {
        // 将脏置为 true，表示
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this

    // class ReactiveEffect{
    //    c-5 存在该属性，则表示当前的 effect 为计算属性的 effect
    //   computed?: CopmputedRefImpl<T>
    //   constructor(public fn: () => T) {}
    //   run() {
    //     // 为 activeEffect 赋值
    //     activeEffect = this
    //     this.fn()
    //   } }
  }

  get value() {
    // c-5 收集依赖 存入dep
    trackRefValue(this)

    // c-6-2 判断当前脏的状态，如果为 true ，则表示需要重新执行 run，获取最新数据
    if (this._dirty) {
      this._dirty = false
      //c-5 执行 run 函数 执行调度器 计算新数据
      this._value = this.effect.run()!
    }

    // c-5 返回计算之后的真实值
    return this._value
  }
}
