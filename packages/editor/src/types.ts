import { Observable } from '@tanbo/stream'
import { Component } from '@textbus/core'
import { BaseEditorOptions } from '@textbus/browser'
import { I18NConfig } from './i18n'
import { UploadConfig } from './file-uploader'

/**
 * 编辑器配置项
 */
export interface EditorOptions extends BaseEditorOptions {
  /** 主题配置，目前只支持 dark */
  theme?: string
  /** 自定义根组件，否则使用默认根组件 */
  rootComponent?: Component
  /** 国际化配置 */
  i18n?: I18NConfig
  /** 当内容为空时，编辑器内的提示文字 */
  placeholder?: string

  /**
   * 资源上传接口
   * @param config
   */
  uploader?(config: UploadConfig): string | string[] | Promise<string | string[]> | Observable<string | string[]>
}
