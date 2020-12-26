import { Injector } from '@tanbo/di';
import { Grammar, languages, Token, tokenize } from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-stylus';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';

import {
  BlockFormatter,
  ChildSlotMode, Component,
  ComponentLoader,
  BackboneAbstractComponent,
  FormatAbstractData,
  FormatEffect,
  FormatRendingContext,
  Fragment,
  InlineFormatter, Interceptor,
  ReplaceMode, SlotRendererFn, TBClipboard, TBEvent, TBSelection,
  VElement,
  ViewData
} from '../core/_api';
import { BrComponent } from './br.component';

export const codeStyles = {
  keyword: 'keyword',
  string: 'string',
  function: 'function',
  number: 'number',
  tag: 'tag',
  comment: 'comment',
  boolean: 'boolean',
  operator: false,
  builtin: 'builtin',
  punctuation: false,
  regex: 'regex',
  selector: 'selector',
  property: 'attr-name',
  'class-name': 'class-name',
  'attr-name': 'attr-name',
  'attr-value': 'attr-value',
  'template-punctuation': 'string',
};

export type PreTheme = 'dark' | 'light';

class CodeFormatter extends BlockFormatter {
  constructor() {
    super({}, 1);
  }

  read(): FormatAbstractData {
    return undefined;
  }

  render(): ReplaceMode | ChildSlotMode | null {
    return new ChildSlotMode(new VElement('code'));
  }
}

class CodeStyleFormatter extends InlineFormatter {
  constructor() {
    super({}, 10);
  }

  read(): FormatAbstractData {
    return undefined;
  }

  render(context: FormatRendingContext): ReplaceMode | ChildSlotMode | null {
    const el = new VElement('span');
    el.classes.push(...context.abstractData.classes);
    return new ChildSlotMode(el);
  }
}

const codeStyleFormatter = new CodeStyleFormatter();
const codeFormatter = new CodeFormatter();

class PreComponentLoader implements ComponentLoader {
  private tagName = 'pre';

  match(component: HTMLElement): boolean {
    return component.nodeName.toLowerCase() === this.tagName;
  }

  read(el: HTMLElement): ViewData {
    el.querySelectorAll('br').forEach(br => {
      br.parentNode.replaceChild(document.createTextNode('\n'), br);
    })
    const component = new PreComponent(el.getAttribute('lang'), el.innerText, el.getAttribute('theme') as PreTheme);
    return {
      component: component,
      slotsMap: []
    };
  }
}

class PreComponentInterceptor implements Interceptor<PreComponent> {
  private selection: TBSelection;

  setup(injector: Injector) {
    this.selection = injector.get(TBSelection);
  }

  onEnter(event: TBEvent<PreComponent>) {
    const firstRange = this.selection.firstRange;
    const component: PreComponent = event.instance;
    let newSlot = null;
    let i = 0;
    for (const slot of component) {
      i++;
      if (slot === this.selection.commonAncestorFragment) {
        const startIndex = firstRange.startIndex;
        newSlot = slot.cut(startIndex, slot.contentLength - startIndex - 1);/* 1代表Br */
        newSlot.append(new BrComponent());
        component.splice(i, 0, newSlot);
        break;
      }
    }
    firstRange.setStart(newSlot, 0);
    firstRange.collapse();
    event.stopPropagation();
  }

  onPaste(event: TBEvent<PreComponent, TBClipboard>) {
    const text = event.data.text;
    const component = event.instance;
    const firstRange = this.selection.firstRange;
    const lines = text.split(/\n/g);
    const len = lines.length;
    const lastLine = lines[len - 1];
    const slot = this.selection.commonAncestorFragment;
    const index = component.indexOf(slot);
    let endSlot: Fragment;
    let curIndex = lastLine.length;
    const startIndex = firstRange.startIndex;

    if (len === 1) {
      slot.insert(lines[0], startIndex);
      curIndex = startIndex + lines[0].length;
      endSlot = slot;
    } else {
      endSlot = slot.cut(startIndex, slot.contentLength - startIndex - 1);/* 1代表Br */
      slot.insert(lines[0], startIndex);
      endSlot.insert(lastLine, 0);
      endSlot.append(new BrComponent());
      component.splice(index + 1, 0, endSlot);
      if (len > 2) {
        const betweenSlots: Fragment[] = [];
        for (let i = 1; i < len - 1; ++i) {
          const line = lines[i];
          const slot = new Fragment();
          slot.append(line);
          slot.append(new BrComponent());
          betweenSlots.push(slot);
        }
        component.splice(index, 0, ...betweenSlots);
      }
    }
    firstRange.setStart(endSlot, curIndex);
    firstRange.collapse();
    event.stopPropagation();
  }
}

@Component({
  loader: new PreComponentLoader(),
  interceptor: new PreComponentInterceptor(),
  styles: [
    `
   code, pre {background-color: rgba(0, 0, 0, .03);}
   pre code {padding: 0; border: none; background: none; border-radius: 0; vertical-align: inherit;}
   code {padding: 1px 5px; border-radius: 3px; vertical-align: middle; border: 1px solid rgba(0, 0, 0, .08);}
   pre {line-height: 1.418em; padding: 15px; border-radius: 5px; border: 1px solid #e9eaec; word-break: break-all; word-wrap: break-word; white-space: pre-wrap;}
   code, kbd, pre, samp {font-family: Microsoft YaHei Mono, Menlo, Monaco, Consolas, Courier New, monospace;}`,
    `
    /* 不要使用block行,会复制出br; */
   .code-line {
     display: inline-block;
     width: 100%;
   }
   `,
    `
  /* 伪类实现的下标 */
  pre { counter-reset: codeNum; }
  pre>.code-line::before {
    counter-increment: codeNum;
    content: counter(codeNum);
    padding-right: 10px;
  }`,
    `
  .tb-hl-keyword { font-weight: bold; }
  .tb-hl-string { color: rgb(221, 17, 68) }
  .tb-hl-function { color: rgb(0, 134, 179); }
  .tb-hl-number { color: #388138 }
  .tb-hl-tag { color: rgb(0, 0, 128) }
  .tb-hl-comment { color: rgb(153, 153, 136); font-style: italic; }
  .tb-hl-boolean { color: #388138; font-weight: bold }
  .tb-hl-builtin { color: rgb(0, 134, 179); }
  .tb-hl-regex { color: #f60; }
  .tb-hl-attr-name { color: rgb(0, 128, 128) }
  .tb-hl-attr-value { color: rgb(221, 17, 68) }
  .tb-hl-class-name { color: rgb(0, 134, 179); font-weight: bold }
  .tb-hl-selector { color: rgb(0, 134, 179); font-weight: bold }
  `,
    `
  pre[theme=dark] {color: #a9aeb2; background-color: #1c2838; border-color: #1c2838 }
  pre[theme=dark] .tb-hl-tag {color: rgb(91 155 190)}
  `
  ]
})
export class PreComponent extends BackboneAbstractComponent {
  static theme: PreTheme = 'light';

  constructor(public lang: string, code: string, private theme?: PreTheme) {
    super('pre');
    this.setSourceCode(code)
  }

  public map<U>(callbackFn: (value: Fragment, index: number, array: Fragment[]) => U, thisArg?: any): U[] {
    return super.map(callbackFn, thisArg);
  }

  public splice(start: number, deleteCount: number, ...items: Fragment[]): Fragment[] {
    return super.splice(start, deleteCount, ...items);
  }

  clone() {
    const fragments = this.map(slot => slot.clone());
    const component = new PreComponent(this.lang, '', this.theme);
    component.clean();
    component.push(...fragments);
    return component;
  }

  canDelete(deletedSlot: Fragment): boolean {
    this.splice(this.indexOf(deletedSlot), 1);
    return this.slotCount === 0;
  }

  componentContentChange() {
    this.reformat();
  }

  render(isOutputMode: boolean, slotRendererFn: SlotRendererFn) {
    const block = new VElement('pre');
    block.attrs.set('lang', this.lang);
    block.attrs.set('theme', this.theme || PreComponent.theme);
    this.map(slot => {
      const line = new VElement('div');
      line.attrs.set('class', 'code-line');
      block.appendChild(slotRendererFn(slot, line));
    })
    return block;
  }

  setSourceCode(code: string) {
    const fragments = code.split(/[\n]/).map(lineContent => {
      const fragment = new Fragment();
      fragment.append(lineContent || new BrComponent());
      return fragment
    })
    this.clean();
    this.push(...fragments);
  }

  getSourceCode() {
    return Array.from(this).map(slot => {
      return slot.sliceContents(0).map(i => {
        return typeof i === 'string' ? i.trim() : '';
      }).join('')
    }).join('');
  }

  format(tokens: Array<string | Token>, slot: Fragment, index: number) {
    tokens.forEach(token => {
      if (token instanceof Token) {
        const styleName = codeStyles[token.type];
        if (styleName) {
          slot.apply(codeStyleFormatter, {
            startIndex: index,
            endIndex: index + token.length,
            state: FormatEffect.Valid,
            abstractData: new FormatAbstractData({
              classes: ['tb-hl-' + styleName]
            })
          });
        } else if (styleName === false) {
          slot.apply(codeStyleFormatter, {
            startIndex: index,
            endIndex: index + token.length,
            state: FormatEffect.Invalid,
            abstractData: null
          })
        }
        if (Array.isArray(token.content)) {
          this.format(token.content, slot, index);
        }
      }
      index += token.length;
    })
  }

  private reformat() {
    const languageGrammar = this.getLanguageGrammar();
    this.map(slot => {
      if (slot.dirty === false) return;
      const content = slot.sliceContents(0).map(item => {
        if (typeof item === 'string') {
          return item;
        } else if (item instanceof BrComponent) {
          return '\n';
        }
      }).join('');
      const fragment = new Fragment();
      content.replace(/\n|[^\n]+/g, str => {
        fragment.append(str === '\n' ? new BrComponent() : str);
        return '';
      })
      if (languageGrammar) {
        const tokens = tokenize(content, languageGrammar);
        this.format(tokens, fragment, 0);
      }
      slot.getFormatKeys().forEach(format => {
        if (format instanceof BlockFormatter) {
          slot.getFormatRanges(format).forEach(r => {
            fragment.apply(format, r);
          })
        }
      })
      fragment.apply(codeFormatter, {abstractData: null, state: FormatEffect.Valid});
      slot.from(fragment);
    })
  }

  private getLanguageGrammar(): Grammar {
    return {
      HTML: languages.html,
      Javascript: languages.javascript,
      CSS: languages.css,
      Typescript: languages.typescript,
      Java: languages.java,
      Shell: languages.shell,
      Python: languages.python,
      Swift: languages.swift,
      JSON: languages.json,
      Ruby: languages.ruby,
      Less: languages.less,
      SCSS: languages.scss,
      Stylus: languages.stylus,
      C: languages.c,
      CPP: languages.cpp,
      CSharp: languages.csharp
    }[this.lang];
  }
}
