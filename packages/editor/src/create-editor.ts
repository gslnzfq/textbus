import { EditorOptions } from './types'
import {
  blockComponentLoader,
  blockquoteComponentLoader,
  headingComponentLoader,
  imageComponentLoader,
  listComponentLoader,
  paragraphComponentLoader,
  preComponentLoader,
  tableComponentLoader,
  audioComponentLoader,
  videoComponentLoader,
} from './components/_api'
import {
  boldFormatLoader,
  italicFormatLoader,
  colorFormatLoader,
  fontFamilyFormatLoader,
  fontSizeFormatLoader,
  letterSpacingFormatLoader,
  lineHeightFormatLoader,
  strikeThroughFormatLoader,
  subscriptFormatLoader,
  superscriptFormatLoader,
  underlineFormatLoader,
  codeFormatLoader,
  blockBackgroundColorFormatLoader,
  linkFormatLoader,
  textBackgroundColorFormatLoader,
  textAlignFormatLoader, textIndentFormatLoader, verticalAlignFormatLoader, dirFormatLoader
} from './formatters/_api'
import { Editor } from './editor'
import {
  Toolbar,
  boldTool, cleanTool, colorTool, defaultGroupTool, fontFamilyTool, fontSizeTool, headingTool,
  historyBackTool,
  historyForwardTool, imageTool, insertParagraphAfterTool, insertParagraphBeforeTool,
  italicTool, linkTool, olTool,
  strikeThroughTool, tableAddTool, tableRemoveTool, textAlignTool, textBackgroundTool, textIndentTool, ulTool,
  underlineTool, unlinkTool, ToolFactory
} from './toolbar/_api'
import { LinkJumpTipPlugin } from './plugins/_api'
import { ComponentLoader, FormatLoader } from '@textbus/browser'

export const defaultComponentLoaders: ComponentLoader[] = [
  audioComponentLoader,
  blockComponentLoader,
  blockquoteComponentLoader,
  headingComponentLoader,
  imageComponentLoader,
  listComponentLoader,
  paragraphComponentLoader,
  preComponentLoader,
  tableComponentLoader,
  videoComponentLoader
]

export const defaultFormatLoaders: FormatLoader[] = [
  boldFormatLoader,
  italicFormatLoader,
  colorFormatLoader,
  fontFamilyFormatLoader,
  fontSizeFormatLoader,
  letterSpacingFormatLoader,
  lineHeightFormatLoader,
  strikeThroughFormatLoader,
  subscriptFormatLoader,
  superscriptFormatLoader,
  underlineFormatLoader,
  codeFormatLoader,
  blockBackgroundColorFormatLoader,
  linkFormatLoader,
  textBackgroundColorFormatLoader,
  textAlignFormatLoader,
  textIndentFormatLoader,
  verticalAlignFormatLoader,
  dirFormatLoader
]

export const defaultOptions: EditorOptions = {
  editingStyleSheets: [
    `[textbus-document=true] [style*=color]:not([style*=background-color])
     [textbus-document=true] a {color: inherit;}
     [textbus-document=true] a {text-decoration: underline; color: #449fdb; cursor: text;}
     [textbus-document=true] {line-height: 1.5em}`
  ],
  componentLoaders: defaultComponentLoaders,
  formatLoaders: defaultFormatLoaders
}

export const defaultTools: ToolFactory[][] = [
  [historyBackTool, historyForwardTool],
  [defaultGroupTool],
  [headingTool],
  [boldTool, italicTool, strikeThroughTool, underlineTool],
  [olTool, ulTool],
  [fontSizeTool, textIndentTool],
  [colorTool, textBackgroundTool],
  [insertParagraphBeforeTool, insertParagraphAfterTool],
  [fontFamilyTool],
  [linkTool, unlinkTool],
  [imageTool],
  [textAlignTool],
  [tableAddTool, tableRemoveTool],
  [cleanTool]
]

export function createEditor(selector: string | HTMLElement, options: EditorOptions = {}) {
  return new Editor(selector, {
    plugins: [
      new Toolbar(defaultTools),
      new LinkJumpTipPlugin()
    ],
    ...defaultOptions,
    ...options
  })
}
