import { createRenderer } from 'packages/runtime-core/src/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { extend } from '@vue/shared'

const rendererOptinos = extend({ patchProp }, nodeOps)

let renderer

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptinos))
}

export function render(...args) {
  ensureRenderer().render(...args)
}
