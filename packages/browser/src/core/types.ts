import { SlotLiteral } from '@textbus/core'
import { Injector, Provider } from '@tanbo/di'

import { FormatLoader, ComponentLoader } from '../dom-support/parser'

export interface Plugin {
  setup(injector: Injector): void

  onDestroy?(): void
}

export interface BaseEditorOptions {
  componentLoaders?: ComponentLoader[]
  formatLoaders?: FormatLoader[]
  content?: string | SlotLiteral
  styleSheets?: string[]
  /** 配置文档编辑状态下用到的样式 */
  editingStyleSheets?: string[];
  plugins?: Plugin[]
  providers?: Provider[]
}
