# NgVirtualScrollView

🚀 High-performance virtual scroll view for Angular apps. Smooth, customizable, and developer-friendly.

⚡A powerful API for implementing scrollers of varying functionality and complexity.

✨Flexible, and actively maintained Angular library that excels with high-performance, feature-rich virtualized scrollers. Angular (14–22) compatibility.

🧬 The main advantage of this solution is that visualization is as close as possible to native scroll containers.

💻 Works correctly in all browsers and platforms.

💪 The software portion of the project was completed without a single line of code written using AI (artificial intelligence)!

<img width="1033" height="171" alt="logo" src="https://github.com/user-attachments/assets/b559cfde-405a-4361-b71b-6715478d997d" />

<b>Angular version 18.X.X</b>.

[Documentation](https://ng-virtual-scroll-view.eugene-grebennikov.pro/)

<br/>

## 📦 Installation

```bash
npm i ng-virtual-scroll-view
```

<br/>

## 🚀 Quick Start
```html
<ng-virtual-scroll-view #scrollView class="scroll-view" direction="both">
  <div class="scroll-view__background" [style.width.px]="3000" [style.height.px]="3000" [class.grabbing]="scrollView.$grabbing | async"></div>
</ng-virtual-scroll-view>
```

<br/>

## 📚 API

### [NgVirtualSCrollViewComponent](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/ng-virtual-scroll-view.component.ts)

Inputs

| Property | Type | Description |
|---|---|---|
| alignment | [Alignment](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/alignment.ts) | Determines the alignment of the list. Two modes are available: `none` and `center`. The `center` mode aligns the list items to the center of the viewport, ideal for use with the `itemTransform` property. The `none` mode means no alignment. The default value is `none`. |
| animationParams | [IAnimationParams](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/animation-params.ts)? = { scrollToItem: 150, snapToItem: 150, navigateByKeyboard: 50 } | Animation parameters. The default value is "{ scrollToItem: 150, snapToItem: 150, navigateByKeyboard: 50 }". |
| clickDistance | number? = 40 | The maximum scroll distance at which a click event is triggered. |
| direction | [Direction? = 'both'](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/direction.ts) | Determines the direction in which elements are placed. Default value is "both". |
| id | number | Readonly. Returns the unique identifier of the component. | 
| langTextDir | [TextDirection? = 'ltr'](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/text-direction.ts) | A string indicating the direction of text for the locale. Can be either "ltr" (left-to-right) or "rtl" (right-to-left). |
| loading | boolean? = false | If `true`, the scrollBar goes into loading state. The default value is `false`. |
| maxMotionBlur | number = 0.5 | Maximum motion blur effect. The default value is `0.5`. |
| motionBlur | number \| 'disabled' = 0.15 | Motion blur effect. The default value is `0.25`. |
| motionBlurEnabled | boolean = false | Determines whether to apply motion blur or not. The default value is `false`. |
| overscrollEnabled | boolean? = true | Determines whether the overscroll (re-scroll) feature will work. The default value is "true". |
| overlappingScrollbar | boolean? = false | Determines whether the scroll bar will overlap the list. The default value is "false". |
| scrollLeftOffset | [FloatOrPersentageValue](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/float-or-persentage-value.ts) = 0 | Sets the scroll left offset value. Can be specified in absolute or percentage values. Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0". |
| scrollRightOffset | [FloatOrPersentageValue](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/float-or-persentage-value.ts) = 0 | Sets the scroll right offset value. Can be specified in absolute or percentage values. Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0". |
| scrollTopOffset | [FloatOrPersentageValue](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/float-or-persentage-value.ts) = 0 | Sets the scroll top offset value. Can be specified in absolute or percentage values. Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0". |
| scrollBottomOffset | [FloatOrPersentageValue](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/float-or-persentage-value.ts) = 0 | Sets the scroll bottom offset value. Can be specified in absolute or percentage values. Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0". |
| snapToItem | boolean = false | Snap to an item. The default value is `false`. |
| snapToItemAlign | [SnapToItemAlign](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/snap-to-item-align.ts) = [SnapToItemAligns](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/snap-to-item-aligns.ts).CENTER | Alignment for snapToItem. Available values ​​are `start`, `center`, and `end`. The default value is `center`. |
| snappingDistance | [SnappingDistance](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/snapping-distance.ts) = "25%" | Snapping activation distance. Can be specified as a percentage of the element size or in absolute values. The default value is `25%`. |
| snapScrollToLeft | boolean? = true | Determines whether the scrollbar is snapped to the left of the scroller. The default value is "true". That is, if `snapScrollToLeft` and `snapScrollToRight` are enabled, the scroller will initially snap to the left; if you move the scrollbar right, the scroller will snap to the right. If `snapScrollToLeft` is disabled and `snapScrollToRight` is enabled, the scroller will snap to the right; If you move the scrollbar left, the scroller will snap to the left. If both `snapScrollToLeft` and `snapScrollToRight` are disabled, the scroller will never snap to the left or right. In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToRight` property is automatically disabled because the list has no beginning or end. |
| snapScrollToRight | boolean? = true | Determines whether the scrollbar is snapped to the right of the scroller. The default value is "true". That is, if `snapScrollToRight` and `snapScrollToRight` are enabled, the scroller will initially snap to the left; if you move the scrollbar right, the scroller will snap to the right. If `snapScrollToLeft` is disabled and `snapScrollToRight` is enabled, the scroller will snap to the right; If you move the scrollbar left, the scroller will snap to the left. If both `snapScrollToLeft` and `snapScrollToRight` are disabled, the scroller will never snap to the left or right. In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToRight` property is automatically disabled because the list has no beginning or end. |
| snapScrollToTop | boolean? = true | Determines whether the scrollbar is snapped to the top of the scroller. The default value is "true". That is, if `snapScrollToTop` and `snapScrollToBottom` are enabled, the scroller will initially snap to the top; if you move the scrollbar down, the scroller will snap to the bottom. If `snapScrollToTop` is disabled and `snapScrollToBottom` is enabled, the scroller will snap to the bottom; If you move the scrollbar up, the scroller will snap to the top. If both `snapScrollToTop` and `snapScrollToBottom` are disabled, the scroller will never snap to the top or bottom. In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToBottom` property is automatically disabled because the list has no beginning or end. |
| snapScrollToBottom | boolean? = true | Determines whether the scrollbar is snapped to the bottom of the scroller. The default value is "true". That is, if `snapScrollToTop` and `snapScrollToBottom` are enabled, the scroller will initially snap to the top; if you move the scrollbar down, the scroller will snap to the bottom. If `snapScrollToTop` is disabled and `snapScrollToBottom` is enabled, the scroller will snap to the bottom; If you move the scrollbar up, the scroller will snap to the top. If both `snapScrollToTop` and `snapScrollToBottom` are disabled, the scroller will never snap to the top or bottom. In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToBottom` property is automatically disabled because the list has no beginning or end. |
| scrollable | boolean? = true | Determines whether the scrollbar is shown or not. The default value is "true". |
| scrollbarEnabled | boolean? = true | Determines whether the scrollbar is shown or not. The default value is "true". |
| scrollbarInteractive | boolean? = true | Determines whether scrolling using the scrollbar will be possible. The default value is "true". |
| scrollbarMinSize | number? = 80 | Minimum scrollbar size. |
| scrollbarThickness | number? = 6 | Scrollbar thickness. |
| scrollbarThumbRenderer | TemplateRef<any> \| null = null | Scrollbar customization template. |
| scrollbarThumbParams | {[propName: string]: any;} \| null | Additional options for the scrollbar. |
| scrollBehavior | ScrollBehavior? = 'smooth' | Defines the scrolling behavior for any element on the page. The default value is "smooth". |
| scrollingSettings | [IScrollingSettings](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/scrolling-settings.ts) = {frictionalForce: 0.035, mass: 0.005, maxDistance: 100000, maxDuration: 4000, speedScale: 10, optimization: true} | Scrolling settings. |
| scrollingOneByOne | boolean = false | Specifies whether to scroll one item at a time if true and the scrollToItem property is set. The default value is `false`. |
| spreadingMode | [SpreadingMode](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/enums/spreading-mode.ts) ='standart' | The order of list elements. Available values ​​are `standard` and `infinity`. `normal` — list elements are ordered according to the collection sequence. `infinity` — list elements are ordered cyclically, forming an infinite list. When set to `infinity`, the `alignment` property is forced to the value `Alignments.CENTER`, the `scrollbarEnabled` property is forced to the `false`. The default value is `standard`. |

<br/>

Outputs

| Event | Type | Description |
|---|---|---|
| onSnapItem | [Id](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/types/id.ts) | Emit the component ID when an element crosses the alignment line specified by the snapToItemAlign property. |
| onScroll | ([IScrollEvent](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/scroll-event.ts)) => void | Fires when the list has been scrolled. |
| onScrollEnd | ([IScrollEvent](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/scroll-event.ts)) => void | Fires when the list has completed scrolling. |
| onViewportChange | [ISize](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/size.ts) | Fires when the viewport size is changed. |
| onScrollReachLeft | void | Fires when the scroll reaches the left. |
| onScrollReachRight | void | Fires when the scroll reaches the right. |
| onScrollReachTop | void | Fires when the scroll reaches the top. |
| onScrollReachBottom | void | Fires when the scroll reaches the bottom. |

<br/>

Methods

| Method | Type | Description |
|--|--|--|
| scrollTo | (options: [IScrollOptions](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/interfaces/scroll-options.ts)) => Array<number> \| null | The method scrolls the scroll view and returns the animation ids if the behavior is set to smooth or null if the behavior is set to auto, instant, or not set. |

<br/>

### [VirtualClickModule](https://github.com/DjonnyX/ng-virtual-scroll-view/blob/18.x/projects/ng-virtual-scroll-view/src/lib/directives/item-click/item-click.module.ts)

### Virtual click directive

To correctly handle interactive elements within a list, such as buttons, you need to use the VirtualClick directive.

```ts
import { NgVirtualScrollViewModule, VirtualClickModule } from 'ng-virtual-scroll-view';

@Component({
  selector: 'example',
  imports: [NgVirtualScrollViewModule, VirtualClickModule],
})
```

```html
  <div virtualClick (onVirtualClick)="select(data.id)">
    <span>{{data.name}}</span>
  </div>
```

<br/>

## 📄 License

MIT License

Copyright (c) 2026 djonnyx (Evgenii Alexandrovich Grebennikov)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
