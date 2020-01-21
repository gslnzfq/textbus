import { Commander, ReplaceModel } from './commander';
import { TBSelection } from '../viewer/selection';
import { Handler } from '../toolbar/handlers/help';
import { MatchState } from '../matcher/matcher';
import { AbstractData } from '../parser/abstract-data';
import { Fragment } from '../parser/fragment';
import { Single } from '../parser/single';
import { RootFragment } from '../parser/root-fragment';
import { VElement } from '../renderer/element';

export class CodeCommander implements Commander<string> {
  recordHistory = true;
  private lang = '';

  updateValue(value: string): void {
    this.lang = value;
  }

  command(selection: TBSelection, handler: Handler, overlap: boolean, rootFragment: RootFragment) {
    if (!overlap) {
      selection.ranges.forEach(range => {
        const fragment = range.startFragment;
        const context = fragment.parent;
        const pre = new Fragment(rootFragment.parser.getFormatStateByData(new AbstractData({
          tag: 'pre',
          attrs: {
            lang: this.lang
          }
        })));
        pre.append(new Single('br', rootFragment.parser.getFormatStateByData(new AbstractData({
          tag: 'br'
        }))));
        context.insert(pre, selection.firstRange.startFragment.getIndexInParent() + 1);
        const first = fragment.getContentAtIndex(0);
        if (fragment.contentLength === 0 || first instanceof Single && first.tagName === 'br') {
          fragment.destroy();
        }
        range.startIndex = range.endIndex = 0;
        range.startFragment = range.endFragment = pre;
      });

    } else {
      selection.ranges.forEach(range => {
        const states = rootFragment.parser.getFormatStateByData(new AbstractData({
            tag: 'pre',
            attrs: {
              lang: this.lang
            }
          })
        );
        range.commonAncestorFragment.mergeMatchStates(
          states,
          0,
          range.commonAncestorFragment.contentLength,
          false);
      });
    }
  }

  render(state: MatchState, rawElement?: VElement, abstractData?: AbstractData): ReplaceModel {
    if (state === MatchState.Valid) {
      const el = new VElement(abstractData.tag);
      const lang = abstractData?.attrs?.get('lang');
      if (lang) {
        el.attrs.set('lang', lang);
      }
      return new ReplaceModel(el);
    }
    return null;
  }
}
