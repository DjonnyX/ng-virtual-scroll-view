import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Injector, Input, OnDestroy, Output, TemplateRef, ViewChild, ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, of, skip, Subject, switchMap, take, takeUntil, tap,
} from 'rxjs';
import {
  BEHAVIOR_INSTANT, CLASS_SCROLL_VIEW_HORIZONTAL, CLASS_SCROLL_VIEW_VERTICAL, DEFAULT_DIRECTION, DEFAULT_LIST_SIZE, LEFT_PROP_NAME,
  TOP_PROP_NAME, MIN_PIXELS_FOR_PREVENT_SNAPPING, DEFAULT_LANG_TEXT_DIR, DEFAULT_CLICK_DISTANCE, DEFAULT_SCROLLBAR_THICKNESS,
  DEFAULT_SCROLLBAR_MIN_SIZE, BEHAVIOR_AUTO, DEFAULT_SCROLLBAR_ENABLED, DEFAULT_SCROLLBAR_INTERACTIVE, DEFAULT_OVERSCROLL_ENABLED,
  DEFAULT_ANIMATION_PARAMS, DEFAULT_SCROLL_BEHAVIOR, DEFAULT_SCROLLING_SETTINGS, DEFAULT_SNAP_TO_ITEM, DEFAULT_SNAP_TO_ITEM_ALIGN,
  DEFAULT_MOTION_BLUR, DEFAULT_MAX_MOTION_BLUR, DEFAULT_SCROLLING_ONE_BY_ONE, DEFAULT_MOTION_BLUR_ENABLED, DEFAULT_SNAPPING_DISTANCE,
  DEFAULT_ALIGNMENT, DEFAULT_SPREADING_MODE, DEFAULT_OVERLAPPING_SCROLLBAR, DEFAULT_SNAP_SCROLLTO_LEFT, DEFAULT_SNAP_SCROLLTO_TOP,
  DEFAULT_SNAP_SCROLLTO_RIGHT, DEFAULT_SNAP_SCROLLTO_BOTTOM, CLASS_SCROLL_VIEW_BOTH,
} from './const';
import {
  IScrollEvent, IAnimationParams, ISize, IScrollingSettings, IScrollOptions,
} from './interfaces';
import {
  Alignment, Id, SnappingDistance, Direction, SnapToItemAlign, TextDirection,
  SpreadingMode,
} from './types';
import {
  Alignments, Directions, SpreadingModes,
} from './enums';
import { ScrollEvent, toggleClassName } from './utils';
import { isDirection } from './utils/is-direction';
import { NgVirtualScrollViewService } from './ng-virtual-scroll-view.service';
import {
  validateBoolean, validateFloat, validateInt, validateObject, validateString,
} from './utils/validation';
import { objectAsReadonly } from './utils/object';
import { NgScrollerComponent } from './components/ng-scroller/ng-scroller.component';
import { IScrollToParams } from './components/ng-scroll-view';
import { parseArithmeticExpression } from './utils/parse-arithmetic-expression';
import { isSpreadingMode } from './utils/is-spreading-mode';
import { SCROLL_VIEW_SERVICE } from './components/ng-scroll-view/const';
import { DisposableComponent } from './utils/disposable-component';

/**
 * Virtual list component.
 * Maximum performance for extremely large lists.
 * It is based on algorithms for virtualization of screen objects.
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/15.x/projects/ng-virtual-scroll-view/src/lib/ng-virtual-scroll-view.component.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
@Component({
  selector: 'ng-virtual-scroll-view',
  templateUrl: './ng-virtual-scroll-view.component.html',
  styleUrls: ['./ng-virtual-scroll-view.component.scss'],
  host: {
    'style': 'position: relative;'
  },
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    { provide: SCROLL_VIEW_SERVICE, useClass: NgVirtualScrollViewService },
  ],
})
export class NgVirtualScrollViewComponent extends DisposableComponent implements OnDestroy {
  private static __nextId: number = 0;

  private _id: number = NgVirtualScrollViewComponent.__nextId;

  /**
   * Readonly. Returns the unique identifier of the component.
   */
  get id() { return this._id; }

  private _service = inject(SCROLL_VIEW_SERVICE);

  @ViewChild('scroller', { read: NgScrollerComponent })
  private _scrollerComponent: NgScrollerComponent | undefined;

  private _$scroller = new BehaviorSubject<ElementRef<HTMLDivElement> | undefined>(undefined);
  protected readonly $scroller = this._$scroller.asObservable();

  /**
   * Fires when the list has been scrolled.
   */
  @Output()
  onScroll = new EventEmitter<IScrollEvent>();

  /**
   * Fires when the list has completed scrolling.
   */
  @Output()
  onScrollEnd = new EventEmitter<IScrollEvent>();

  /**
   * Fires when the viewport size is changed.
   */
  @Output()
  onViewportChange = new EventEmitter<ISize>();

  /**
   * Emit the component ID when an element crosses the alignment line specified by the snapToItemAlign property.
   */
  @Output()
  onSnapItem = new EventEmitter<Id>();

  /**
   * Fires when the scroll reaches the left.
   */
  @Output()
  onScrollReachLeft = new EventEmitter<void>();

  /**
   * Fires when the scroll reaches the right.
   */
  @Output()
  onScrollReachRight = new EventEmitter<void>();

  /**
   * Fires when the scroll reaches the top.
   */
  @Output()
  onScrollReachTop = new EventEmitter<void>();

  /**
   * Fires when the scroll reaches the bottom.
   */
  @Output()
  onScrollReachBottom = new EventEmitter<void>();

  private _$show = new BehaviorSubject<boolean>(false);
  readonly $show = this._$show.asObservable();

  private _$initialized = new BehaviorSubject<boolean>(false);
  readonly $initialized = this._$initialized.asObservable();

  private _$scrollbarThickness = new BehaviorSubject<number>(DEFAULT_SCROLLBAR_THICKNESS);
  protected readonly $scrollbarThickness = this._$scrollbarThickness.asObservable();

  private _scrollbarThicknessTransform = (v: number) => {
    const valid = validateInt(v, true);

    if (!valid) {
      console.error('The "scrollbarThickness" parameter must be of type `number`.');
      return DEFAULT_SCROLLBAR_THICKNESS;
    }
    return v;
  };

  /**
   * Scrollbar thickness.
   */
  @Input()
  set scrollbarThickness(v: number) {
    if (this._$scrollbarThickness.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarThicknessTransform(v);

    this._$scrollbarThickness.next(transformedValue);
  };
  get scrollbarThickness() { return this._$scrollbarThickness.getValue(); }

  private _$scrollbarMinSize = new BehaviorSubject<number>(DEFAULT_SCROLLBAR_MIN_SIZE);
  protected readonly $scrollbarMinSize = this._$scrollbarMinSize.asObservable();

  private _scrollbarMinSizeTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "scrollbarMinSize" parameter must be of type `number`.');
      return DEFAULT_SCROLLBAR_MIN_SIZE;
    }
    return v;
  };

  /**
   * Minimum scrollbar size.
   */
  @Input()
  set scrollbarMinSize(v: number) {
    if (this._$scrollbarMinSize.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarMinSizeTransform(v);

    this._$scrollbarMinSize.next(transformedValue);
  };
  get scrollbarMinSize() { return this._$scrollbarMinSize.getValue() as number; }

  private _$scrollbarThumbRenderer = new BehaviorSubject<TemplateRef<any> | null>(null);
  protected readonly $scrollbarThumbRenderer = this._$scrollbarThumbRenderer.asObservable();

  private _scrollbarThumbRendererTransform = (v: TemplateRef<any> | null) => {
    const valid = validateObject(v, true, true);

    if (!valid) {
      console.error('The "scrollbarThumbRenderer" parameter must be of type `object`.');
      return null;
    }
    return v;
  };

  /**
   * Scrollbar customization template.
   */
  @Input()
  set scrollbarThumbRenderer(v: TemplateRef<any> | null) {
    if (this._$scrollbarThumbRenderer.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarThumbRendererTransform(v);

    this._$scrollbarThumbRenderer.next(transformedValue);
  };
  get scrollbarThumbRenderer() { return this._$scrollbarThumbRenderer.getValue(); }

  private _$scrollbarThumbParams = new BehaviorSubject<{ [propName: string]: any } | null>({});
  protected readonly $scrollbarThumbParams = this._$scrollbarThumbParams.asObservable();

  private _scrollbarThumbParamsTransform = (v: { [propName: string]: any } | null) => {
    const valid = validateObject(v, true, true);

    if (!valid) {
      console.error('The "scrollbarThumbParams" parameter must be of type `object`.');
      return null;
    }
    return v;
  };

  /**
   * Additional options for the scrollbar.
   */
  @Input()
  set scrollbarThumbParams(v: { [propName: string]: any } | null) {
    if (this._$scrollbarThumbParams.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarThumbParamsTransform(v);

    this._$scrollbarThumbParams.next(transformedValue);
  };
  get scrollbarThumbParams() { return this._$scrollbarThumbParams.getValue(); }

  private _$clickDistance = new BehaviorSubject<number>(DEFAULT_CLICK_DISTANCE);
  protected readonly $clickDistance = this._$clickDistance.asObservable();

  private _clickDistanceTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "clickDistance" parameter must be of type `number`.');
      return DEFAULT_CLICK_DISTANCE;
    }
    return v;
  };

  /**
   * The maximum scroll distance at which a click event is triggered.
   */
  @Input()
  set clickDistance(v: number) {
    if (this._$clickDistance.getValue() === v) {
      return;
    }

    const transformedValue = this._clickDistanceTransform(v);

    this._$clickDistance.next(transformedValue);
  };
  get clickDistance() { return this._$clickDistance.getValue() as number; }

  private _$scrollLeftOffset = new BehaviorSubject<number>(0);
  protected readonly $scrollLeftOffset = this._$scrollLeftOffset.asObservable();

  private _scrollLeftOffsetTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "scrollLeftOffset" parameter must be one of type `number` or `string`.');
      return 0;
    }
    return v;
  };

  /**
   * Sets the scroll left offset value. Can be specified in absolute or percentage values.
   * Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0".
   */
  @Input()
  set scrollLeftOffset(v: number) {
    if (this._$scrollLeftOffset.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollLeftOffsetTransform(v);

    this._$scrollLeftOffset.next(transformedValue);
  };
  get scrollLeftOffset() { return this._$scrollLeftOffset.getValue() as number; }

  private _$scrollTopOffset = new BehaviorSubject<number>(0);
  protected readonly $scrollTopOffset = this._$scrollTopOffset.asObservable();

  private _scrollTopOffsetTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "scrollTopOffset" parameter must be one of type `number` or `string`.');
      return 0;
    }
    return v;
  };

  /**
   * Sets the scroll top offset value. Can be specified in absolute or percentage values.
   * Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0".
   */
  @Input()
  set scrollTopOffset(v: number) {
    if (this._$scrollTopOffset.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollTopOffsetTransform(v);

    this._$scrollTopOffset.next(transformedValue);
  };
  get scrollTopOffset() { return this._$scrollTopOffset.getValue() as number; }

  private _$scrollRightOffset = new BehaviorSubject<number>(0);
  protected readonly $scrollRightOffset = this._$scrollRightOffset.asObservable();

  private _scrollRightOffsetTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "scrollRightOffset" parameter must be one of type `number` or `string`.');
      return 0;
    }
    return v;
  };

  /**
   * Sets the scroll right offset value. Can be specified in absolute or percentage values.
   * Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0".
   */
  @Input()
  set scrollRightOffset(v: number) {
    if (this._$scrollRightOffset.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollRightOffsetTransform(v);

    this._$scrollRightOffset.next(transformedValue);
  };
  get scrollRightOffset() { return this._$scrollRightOffset.getValue() as number; }

  private _$scrollBottomOffset = new BehaviorSubject<number>(0);
  protected readonly $scrollBottomOffset = this._$scrollBottomOffset.asObservable();

  private _scrollBottomOffsetTransform = (v: number) => {
    const valid = validateInt(v);

    if (!valid) {
      console.error('The "scrollBottomOffset" parameter must be one of type `number` or `string`.');
      return 0;
    }
    return v;
  };

  /**
   * Sets the scroll bottom offset value. Can be specified in absolute or percentage values.
   * Supports arithmetic expressions of addition `50% + 25` or subtraction `50% - 25`. Default value is "0".
   */
  @Input()
  set scrollBottomOffset(v: number) {
    if (this._$scrollBottomOffset.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollBottomOffsetTransform(v);

    this._$scrollBottomOffset.next(transformedValue);
  };
  get scrollBottomOffset() { return this._$scrollBottomOffset.getValue() as number; }

  private _$snapScrollToLeft = new BehaviorSubject<boolean>(DEFAULT_SNAP_SCROLLTO_LEFT);
  protected readonly $snapScrollToLeft = this._$snapScrollToLeft.asObservable();

  private _snapScrollToLeftTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "snapScrollToLeft" parameter must be of type `boolean`.');
      return DEFAULT_SNAP_SCROLLTO_LEFT;
    }
    return v;
  };

  /**
   * Determines whether the scrollbar is snapped to the left of the scroller. The default value is "true".
   * That is, if snapScrollToLeft and snapScrollToRight are enabled, the scroller will initially snap
   * to the left; if you move the scrollbar right, the scroller will snap to the right.
   * If snapScrollToLeft is disabled and snapScrollToRight is enabled, the scroller will snap to the right;
   * If you move the scrollbar left, the scroller will snap to the left.
   * If both snapScrollToLeft and snapScrollToRight are disabled, the scroller will never snap to the left or right.
   * In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToRight` property is automatically disabled because the list has no beginning or end.
   */
  @Input()
  set snapScrollToLeft(v: boolean) {
    if (this._$snapScrollToLeft.getValue() === v) {
      return;
    }

    const transformedValue = this._snapScrollToLeftTransform(v);

    this._$snapScrollToLeft.next(transformedValue);
  };
  get snapScrollToLeft() { return this._$snapScrollToLeft.getValue(); }

  private _$snapScrollToTop = new BehaviorSubject<boolean>(DEFAULT_SNAP_SCROLLTO_TOP);
  protected readonly $snapScrollToTop = this._$snapScrollToTop.asObservable();

  private _snapScrollToTopTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "snapScrollToTop" parameter must be of type `boolean`.');
      return DEFAULT_SNAP_SCROLLTO_TOP;
    }
    return v;
  };

  /**
   * Determines whether the scrollbar is snapped to the top of the scroller. The default value is "true".
   * That is, if snapScrollToTop and snapScrollToBottom are enabled, the scroller will initially snap
   * to the top; if you move the scrollbar down, the scroller will snap to the bottom.
   * If snapScrollToTop is disabled and snapScrollToBottom is enabled, the scroller will snap to the bottom;
   * If you move the scrollbar up, the scroller will snap to the top.
   * If both snapScrollToTop and snapScrollToBottom are disabled, the scroller will never snap to the top or bottom.
   * In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToBottom` property is automatically disabled because the list has no beginning or end.
   */
  @Input()
  set snapScrollToTop(v: boolean) {
    if (this._$snapScrollToTop.getValue() === v) {
      return;
    }

    const transformedValue = this._snapScrollToTopTransform(v);

    this._$snapScrollToTop.next(transformedValue);
  };
  get snapScrollToTop() { return this._$snapScrollToTop.getValue(); }

  private _$snapScrollToRight = new BehaviorSubject<boolean>(DEFAULT_SNAP_SCROLLTO_RIGHT);
  protected readonly $snapScrollToRight = this._$snapScrollToRight.asObservable();

  private _snapScrollToRightTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "snapScrollToRight" parameter must be of type `boolean`.');
      return DEFAULT_SNAP_SCROLLTO_RIGHT;
    }
    return v;
  };

  /**
   * Determines whether the scrollbar is snapped to the right of the scroller. The default value is "true".
   * That is, if snapScrollToLeft and snapScrollToRight are enabled, the scroller will initially snap
   * to the left; if you move the scrollbar right, the scroller will snap to the right.
   * If snapScrollToLeft is disabled and snapScrollToRight is enabled, the scroller will snap to the right;
   * If you move the scrollbar left, the scroller will snap to the left.
   * If both snapScrollToLeft and snapScrollToRight are disabled, the scroller will never snap to the left or right.
   * In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToRight` property is automatically disabled because the list has no beginning or end.
   */
  @Input()
  set snapScrollToRight(v: boolean) {
    if (this._$snapScrollToRight.getValue() === v) {
      return;
    }

    const transformedValue = this._snapScrollToRightTransform(v);

    this._$snapScrollToRight.next(transformedValue);
  };
  get snapScrollToRight() { return this._$snapScrollToRight.getValue(); }

  private _$snapScrollToBottom = new BehaviorSubject<boolean>(DEFAULT_SNAP_SCROLLTO_BOTTOM);
  protected readonly $snapScrollToBottom = this._$snapScrollToBottom.asObservable();

  private _snapScrollToBottomTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "snapScrollToBottom" parameter must be of type `boolean`.');
      return DEFAULT_SNAP_SCROLLTO_BOTTOM;
    }
    return v;
  };

  /**
   * Determines whether the scrollbar is snapped to the bottom of the scroller. The default value is "true".
   * That is, if snapScrollToTop and snapScrollToBottom are enabled, the scroller will initially snap
   * to the top; if you move the scrollbar down, the scroller will snap to the bottom.
   * If snapScrollToTop is disabled and snapScrollToBottom is enabled, the scroller will snap to the bottom;
   * If you move the scrollbar up, the scroller will snap to the top.
   * If both snapScrollToTop and snapScrollToBottom are disabled, the scroller will never snap to the top or bottom.
   * In the `spreadingMode=SpreadingModes.INFINITY` mode, the `snapScrollToBottom` property is automatically disabled because the list has no beginning or end.
   */
  @Input()
  set snapScrollToBottom(v: boolean) {
    if (this._$snapScrollToBottom.getValue() === v) {
      return;
    }

    const transformedValue = this._snapScrollToBottomTransform(v);

    this._$snapScrollToBottom.next(transformedValue);
  };
  get snapScrollToBottom() { return this._$snapScrollToBottom.getValue(); }

  private _$scrollable = new BehaviorSubject<boolean>(DEFAULT_SCROLLBAR_ENABLED);
  protected readonly $scrollable = this._$scrollable.asObservable();

  private _scrollableTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "scrollable" parameter must be of type `boolean`.');
      return DEFAULT_SCROLLBAR_ENABLED;
    }
    return v;
  };

  /**
  /**
   * Determines whether scrolling is enabled or disabled. The default value is "true".
   */
  @Input()
  set scrollable(v: boolean) {
    if (this._$scrollable.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollableTransform(v);

    this._$scrollable.next(transformedValue);
  };
  get scrollable() { return this._$scrollable.getValue(); }

  private _$scrollbarEnabled = new BehaviorSubject<boolean>(DEFAULT_SCROLLBAR_ENABLED);
  protected readonly $scrollbarEnabled = this._$scrollbarEnabled.asObservable();

  private _scrollbarEnabledTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "scrollbarEnabled" parameter must be of type `boolean`.');
      return DEFAULT_SCROLLBAR_ENABLED;
    }
    return v;
  };

  /**
   * Determines whether the scrollbar is shown or not. The default value is "true".
   */
  @Input()
  set scrollbarEnabled(v: boolean) {
    if (this._$scrollbarEnabled.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarEnabledTransform(v);

    this._$scrollbarEnabled.next(transformedValue);
  };
  get scrollbarEnabled() { return this._$scrollbarEnabled.getValue(); }

  private _$scrollbarInteractive = new BehaviorSubject<boolean>(DEFAULT_SCROLLBAR_INTERACTIVE);
  protected readonly $scrollbarInteractive = this._$scrollbarInteractive.asObservable();

  private _scrollbarInteractiveTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "scrollbarInteractive" parameter must be of type `boolean`.');
      return DEFAULT_SCROLLBAR_INTERACTIVE;
    }
    return v;
  };

  /**
   * Determines whether scrolling using the scrollbar will be possible. The default value is "true".
   */
  @Input()
  set scrollbarInteractive(v: boolean) {
    if (this._$scrollbarInteractive.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollbarInteractiveTransform(v);

    this._$scrollbarInteractive.next(transformedValue);
  };
  get scrollbarInteractive() { return this._$scrollbarInteractive.getValue(); }

  private _$overlappingScrollbar = new BehaviorSubject<boolean>(DEFAULT_OVERLAPPING_SCROLLBAR);
  protected readonly $overlappingScrollbar = this._$overlappingScrollbar.asObservable();

  private _overlappingScrollbarTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "overlappingScrollbar" parameter must be of type `boolean`.');
      return DEFAULT_OVERLAPPING_SCROLLBAR;
    }
    return v;
  };

  /**
   * Determines whether the scroll bar will overlap the list. The default value is "false".
   */
  @Input()
  set overlappingScrollbar(v: boolean) {
    if (this._$overlappingScrollbar.getValue() === v) {
      return;
    }

    const transformedValue = this._overlappingScrollbarTransform(v);

    this._$overlappingScrollbar.next(transformedValue);
  };
  get overlappingScrollbar() { return this._$overlappingScrollbar.getValue(); }

  private _$scrollBehavior = new BehaviorSubject<ScrollBehavior>(DEFAULT_SCROLL_BEHAVIOR);
  protected readonly $scrollBehavior = this._$scrollBehavior.asObservable();

  private _scrollBehaviorTransform = (v: ScrollBehavior) => {
    const valid = validateString(v, true, true);

    if (!valid) {
      console.error('The "scrollBehavior" parameter must be of type `boolean`.');
      return DEFAULT_SCROLL_BEHAVIOR;
    }
    return v;
  };

  /**
   * Defines the scrolling behavior for any element on the page. The default value is "smooth".
   */
  @Input()
  set scrollBehavior(v: ScrollBehavior) {
    if (this._$scrollBehavior.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollBehaviorTransform(v);

    this._$scrollBehavior.next(transformedValue);
  };
  get scrollBehavior() { return this._$scrollBehavior.getValue(); }

  private _$scrollingSettings = new BehaviorSubject<IScrollingSettings>(DEFAULT_SCROLLING_SETTINGS);
  protected readonly $scrollingSettings = this._$scrollingSettings.asObservable();

  private _scrollingSettingsTransform = (v: IScrollingSettings): IScrollingSettings => {
    let valid = validateObject(v, true, true);
    if (valid && !!v) {
      const { frictionalForce, mass, maxDistance, maxDuration, speedScale, optimization } = v;
      valid = validateFloat(frictionalForce, true);
      if (!valid) {
        console.error('The "frictionalForce" parameter must be of type `number` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
      valid = validateFloat(mass, true);
      if (!valid) {
        console.error('The "mass" parameter must be of type `number` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
      valid = validateFloat(maxDistance, true);
      if (!valid) {
        console.error('The "maxDistance" parameter must be of type `number` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
      valid = validateFloat(maxDuration, true);
      if (!valid) {
        console.error('The "maxDuration" parameter must be of type `number` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
      valid = validateFloat(speedScale, true);
      if (!valid) {
        console.error('The "speedScale" parameter must be of type `number` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
      valid = validateBoolean(optimization, true);
      if (!valid) {
        console.error('The "optimization" parameter must be of type `boolean` or `undefined`.');
        return DEFAULT_SCROLLING_SETTINGS;
      }
    }
    if (!valid) {
      console.error('The "scrollingSettings" parameter must be of type `object` or null.');
      return DEFAULT_SCROLLING_SETTINGS;
    }
    return {
      frictionalForce: v.frictionalForce !== undefined && v.frictionalForce > 0 ? v.frictionalForce : DEFAULT_SCROLLING_SETTINGS.frictionalForce,
      mass: v.mass !== undefined && v.mass > 0 ? v.mass : DEFAULT_SCROLLING_SETTINGS.mass,
      maxDistance: v.maxDistance !== undefined && v.maxDistance > 0 ? v.maxDistance : DEFAULT_SCROLLING_SETTINGS.maxDistance,
      maxDuration: v.maxDuration !== undefined && v.maxDuration > 0 ? v.maxDuration : DEFAULT_SCROLLING_SETTINGS.maxDuration,
      speedScale: v.speedScale !== undefined && v.speedScale > 0 ? v.speedScale : DEFAULT_SCROLLING_SETTINGS.speedScale,
      optimization: v.optimization ?? DEFAULT_SCROLLING_SETTINGS.optimization,
    };
  };

  /**
   * Scrolling settings.
   * - frictionalForce - Frictional force. Default value is 0.035.
   * - mass - Mass. Default value is 0.005.
   * - maxDistance - Maximum scrolling distance. Default value is 100000.
   * - maxDuration - Maximum animation duration. Default value is 4000.
   * - speedScale - Speed scale. Default value is 10.
   * - optimization - Enables scrolling performance optimization. Default value is `true`.
   */
  @Input()
  set scrollingSettings(v: IScrollingSettings) {
    if (this._$scrollingSettings.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollingSettingsTransform(v);

    this._$scrollingSettings.next(transformedValue);
  };
  get scrollingSettings() { return this._$scrollingSettings.getValue(); }

  private _$snapToItem = new BehaviorSubject<boolean>(DEFAULT_SNAP_TO_ITEM);
  protected readonly $snapToItem = this._$snapToItem.asObservable();

  private _snapToItemTransform = (v: boolean) => {
    const valid = validateBoolean(v);

    if (!valid) {
      console.error('The "snapToItem" parameter must be of type `boolean`.');
      return DEFAULT_SNAP_TO_ITEM;
    }
    return v;
  };

  /**
   * Snap to an item. The default value is `false`.
   */
  @Input()
  set snapToItem(v: boolean) {
    if (this._$snapToItem.getValue() === v) {
      return;
    }

    const transformedValue = this._snapToItemTransform(v);

    this._$snapToItem.next(transformedValue);
  };
  get snapToItem() { return this._$snapToItem.getValue(); }

  private _$snapToItemAlign = new BehaviorSubject<SnapToItemAlign>(DEFAULT_SNAP_TO_ITEM_ALIGN);
  protected readonly $snapToItemAlign = this._$snapToItemAlign.asObservable();

  private _snapToItemAlignTransform = (v: SnapToItemAlign) => {
    const valid = validateString(v) && (v === 'start' || v === 'center' || v === 'end');

    if (!valid) {
      console.error('The "snapToItemAlign" parameter must be one of `start`, `center` or `end`.');
      return DEFAULT_SNAP_TO_ITEM_ALIGN;
    }
    return v;
  };

  /**
   * Alignment for snapToItem. Available values ​​are `start`, `center`, and `end`. The default value is `center`.
   */
  @Input()
  set snapToItemAlign(v: SnapToItemAlign) {
    if (this._$snapToItemAlign.getValue() === v) {
      return;
    }

    const transformedValue = this._snapToItemAlignTransform(v);

    this._$snapToItemAlign.next(transformedValue);
  };
  get snapToItemAlign() { return this._$snapToItemAlign.getValue(); }

  private _$snappingDistance = new BehaviorSubject<SnappingDistance>(DEFAULT_SNAPPING_DISTANCE);
  protected readonly $snappingDistance = this._$snappingDistance.asObservable();

  private _snappingDistanceTransform = (v: SnappingDistance | any) => {
    const valid = validateString(v) || validateFloat(v);

    if (!valid) {
      console.error('The "snappingDistance" parameter must be of type `number` or `string`.');
      return DEFAULT_SNAPPING_DISTANCE;
    }
    return v;
  };

  /**
   * Snapping activation distance. Can be specified as a percentage of the element size or in absolute values.
   * The default value is `25%`.
   */
  @Input()
  set snappingDistance(v: SnappingDistance) {
    if (this._$snappingDistance.getValue() === v) {
      return;
    }

    const transformedValue = this._snappingDistanceTransform(v);

    this._$snappingDistance.next(transformedValue);
  };
  get snappingDistance() { return this._$snappingDistance.getValue(); }

  private _$scrollingOneByOne = new BehaviorSubject<boolean>(DEFAULT_SCROLLING_ONE_BY_ONE);
  protected readonly $scrollingOneByOne = this._$scrollingOneByOne.asObservable();

  private _scrollingOneByOneTransform = (v: any) => {
    const valid = validateBoolean(v);

    if (!valid) {
      console.error('The "scrollingOneByOne" parameter must be of type `boolean`.');
      return DEFAULT_SCROLLING_ONE_BY_ONE;
    }
    return v;
  };

  /**
   * Specifies whether to scroll one item at a time if true and the scrollToItem property is set. The default value is `false`.
   */
  @Input()
  set scrollingOneByOne(v: boolean) {
    if (this._$scrollingOneByOne.getValue() === v) {
      return;
    }

    const transformedValue = this._scrollingOneByOneTransform(v);

    this._$scrollingOneByOne.next(transformedValue);
  };
  get scrollingOneByOne() { return this._$scrollingOneByOne.getValue(); }

  private _$alignment = new BehaviorSubject<Alignment>(DEFAULT_ALIGNMENT);
  protected readonly $alignment = this._$alignment.asObservable();

  private _alignmentTransform = (v: Alignment) => {
    const valid = validateString(v) && (v === 'none' || v === 'center');

    if (!valid) {
      console.error('The "alignment" parameter must be one of `none` or `centert`.');
      return DEFAULT_ALIGNMENT;
    }
    return v;
  };

  /**
   * Determines the alignment of the list. Two modes are available: `none` and `center`. The `center` mode aligns the list items to the center of the viewport, ideal for use with the `itemTransform` property.
   * The `none` mode means no alignment. The default value is `none`.
   */
  @Input()
  set alignment(v: Alignment) {
    if (this._$alignment.getValue() === v) {
      return;
    }

    const transformedValue = this._alignmentTransform(v);

    this._$alignment.next(transformedValue);
  };
  get alignment() { return this._$alignment.getValue(); }

  private _$spreadingMode = new BehaviorSubject<SpreadingMode>(DEFAULT_SPREADING_MODE);
  protected readonly $spreadingMode = this._$spreadingMode.asObservable();

  private _spreadingModeTransform = (v: SpreadingMode) => {
    const valid = validateString(v) && (v === 'normal' || v === 'infinity');

    if (!valid) {
      console.error('The "spreadingMode" parameter must be one of `normal` or `infinity`.');
      return DEFAULT_SPREADING_MODE;
    }
    return v;
  };

  /**
   * The order of list elements. Available values ​​are `standard` and `infinity`.
   * `normal` — list elements are ordered according to the collection sequence.
   * `infinity` — list elements are ordered cyclically, forming an infinite list.
   * When set to `infinity`, the `alignment` property is forced to the value `Alignments.CENTER`, the `scrollbarEnabled` property is forced to the `false`
   * The default value is `standard`.
   */
  @Input()
  set spreadingMode(v: SpreadingMode) {
    if (this._$spreadingMode.getValue() === v) {
      return;
    }

    const transformedValue = this._spreadingModeTransform(v);

    this._$spreadingMode.next(transformedValue);
  };
  get spreadingMode() { return this._$spreadingMode.getValue(); }

  private _$motionBlur = new BehaviorSubject<number>(DEFAULT_MOTION_BLUR);
  protected readonly $motionBlur = this._$motionBlur.asObservable();

  private _motionBlurTransform = (v: number) => {
    const valid = validateFloat(v);

    if (!valid) {
      console.error('The "motionBlur" parameter must be of type `number`.');
      return DEFAULT_MOTION_BLUR;
    }
    return v <= 0 ? DEFAULT_MOTION_BLUR : v;
  };

  /**
   * Motion blur effect. The default value is `0.15`.
   */
  @Input()
  set motionBlur(v: number) {
    if (this._$motionBlur.getValue() === v) {
      return;
    }

    const transformedValue = this._motionBlurTransform(v);

    this._$motionBlur.next(transformedValue);
  };
  get motionBlur() { return this._$motionBlur.getValue(); }

  private _$maxMotionBlur = new BehaviorSubject<number>(DEFAULT_MAX_MOTION_BLUR);
  protected readonly $maxMotionBlur = this._$maxMotionBlur.asObservable();

  private _maxMotionBlurTransform = (v: number) => {
    const valid = validateFloat(v);

    if (!valid) {
      console.error('The "maxMotionBlur" parameter must be of type `number`.');
      return DEFAULT_MAX_MOTION_BLUR;
    }
    return v <= 0 ? DEFAULT_MAX_MOTION_BLUR : v;
  };

  /**
   * Maximum motion blur effect. The default value is `0.5`.
   */
  @Input()
  set maxMotionBlur(v: number) {
    if (this._$maxMotionBlur.getValue() === v) {
      return;
    }

    const transformedValue = this._maxMotionBlurTransform(v);

    this._$maxMotionBlur.next(transformedValue);
  };
  get maxMotionBlur() { return this._$maxMotionBlur.getValue(); }

  private _$motionBlurEnabled = new BehaviorSubject<boolean>(DEFAULT_MOTION_BLUR_ENABLED);
  protected readonly $motionBlurEnabled = this._$motionBlurEnabled.asObservable();

  private _motionBlurEnabledTransform = (v: boolean) => {
    const valid = validateBoolean(v);

    if (!valid) {
      console.error('The "motionBlurEnabled" parameter must be of type `boolean`.');
      return DEFAULT_MOTION_BLUR_ENABLED;
    }
    return v;
  };

  /**
   * Determines whether to apply motion blur or not. The default value is `false`.
   */
  @Input()
  set motionBlurEnabled(v: boolean) {
    if (this._$motionBlurEnabled.getValue() === v) {
      return;
    }

    const transformedValue = this._motionBlurEnabledTransform(v);

    this._$motionBlurEnabled.next(transformedValue);
  };
  get motionBlurEnabled() { return this._$motionBlurEnabled.getValue(); }


  private _$animationParams = new BehaviorSubject<IAnimationParams>(DEFAULT_ANIMATION_PARAMS);
  protected readonly $animationParams = this._$animationParams.asObservable();

  private _animationParamsTransform = (v: IAnimationParams) => {
    const valid = validateObject(v, true, true);

    if (!validateFloat(v.scrollToItem)) {
      console.error('The "scrollToItem" parameter must be of type `number`.');
      return DEFAULT_ANIMATION_PARAMS;
    }
    if (!validateFloat(v.snapToItem)) {
      console.error('The "snapToItem" parameter must be of type `number`.');
      return DEFAULT_ANIMATION_PARAMS;
    }
    if (!valid) {
      console.error('The "animationParams" parameter must be of type `object`.');
      return DEFAULT_ANIMATION_PARAMS;
    }
    return v;
  };

  /**
   * Animation parameters. The default value is "{ scrollToItem: 0, snapToItem: 150 }".
   */
  @Input()
  set animationParams(v: IAnimationParams) {
    if (this._$animationParams.getValue() === v) {
      return;
    }

    const transformedValue = this._animationParamsTransform(v);

    this._$animationParams.next(transformedValue);
  };
  get animationParams() { return this._$animationParams.getValue(); }


  private _$overscrollEnabled = new BehaviorSubject<boolean>(DEFAULT_OVERSCROLL_ENABLED);
  protected readonly $overscrollEnabled = this._$overscrollEnabled.asObservable();

  private _overscrollEnabledTransform = (v: boolean) => {
    const valid = validateBoolean(v, true);

    if (!valid) {
      console.error('The "overscrollEnabled" parameter must be of type `boolean`.');
      return DEFAULT_OVERSCROLL_ENABLED;
    }
    return v;
  };

  /**
   * Determines whether the overscroll (re-scroll) feature will work. The default value is "true".
   */
  @Input()
  set overscrollEnabled(v: boolean) {
    if (this._$overscrollEnabled.getValue() === v) {
      return;
    }

    const transformedValue = this._overscrollEnabledTransform(v);

    this._$overscrollEnabled.next(transformedValue);
  };
  get overscrollEnabled() { return this._$overscrollEnabled.getValue(); }

  private _$direction = new BehaviorSubject<Direction>(DEFAULT_DIRECTION);
  protected readonly $direction = this._$direction.asObservable();

  private _directionTransform = (v: Direction) => {
    const valid = validateString(v) && (v === 'horizontal' || v === 'vertical');
    if (!valid) {
      console.error('The "direction" parameter must be one of `horizontal` or `vertical`.');
      return DEFAULT_DIRECTION;
    }
    return v;
  };

  /**
   * Determines the direction in which elements are placed. Default value is "vertical".
   */
  @Input()
  set direction(v: Direction) {
    if (this._$direction.getValue() === v) {
      return;
    }

    const transformedValue = this._directionTransform(v);

    this._$direction.next(transformedValue);
  };
  get direction() { return this._$direction.getValue(); }

  private _$loading = new BehaviorSubject<boolean>(false);
  protected readonly $loading = this._$loading.asObservable();

  private _loadingTransform = (v: boolean) => {
    const valid = validateBoolean(v);

    if (!valid) {
      console.error('The "loading" parameter must be of type `boolean`.');
      return false;
    }
    return v;
  };

  /**
   * If `true`, the scrollBar goes into loading state. The default value is `false`.
   */
  @Input()
  set loading(v: boolean) {
    if (this._$loading.getValue() === v) {
      return;
    }

    const transformedValue = this._loadingTransform(v);

    this._$loading.next(transformedValue);
  };
  get loading() { return this._$loading.getValue() as boolean; }

  private _$langTextDir = new BehaviorSubject<TextDirection>(DEFAULT_LANG_TEXT_DIR);
  protected readonly $langTextDir = this._$langTextDir.asObservable();

  private _langTextDirTransform = (v: TextDirection) => {
    const valid = validateString(v);
    if (!valid) {
      console.error('The "langTextDir" parameter must be of type `string`.');
      return DEFAULT_LANG_TEXT_DIR;
    }
    return v;
  };

  /**
   * A string indicating the direction of text for the locale.
   * Can be either "ltr" (left-to-right) or "rtl" (right-to-left).
   */
  @Input()
  set langTextDir(v: TextDirection) {
    if (this._$langTextDir.getValue() === v) {
      return;
    }

    const transformedValue = this._langTextDirTransform(v);

    this._$langTextDir.next(transformedValue);
  };
  get langTextDir() { return this._$langTextDir.getValue(); }

  protected _$isInfinity = new BehaviorSubject<boolean>(false);
  protected $isInfinity = this._$isInfinity.asObservable();
  protected get isInfinity() {
    return this._$isInfinity.getValue();
  }

  private _$focusedElement = new BehaviorSubject<Id | null>(null);
  protected $focusedElement = this._$focusedElement.asObservable();

  private _$classes = new BehaviorSubject<{ [cName: string]: boolean }>({});
  protected $classes = this._$classes.asObservable();

  private _$bounds = new BehaviorSubject<ISize | null>(null);
  protected $bounds: Observable<ISize | null> = this._$bounds.asObservable();

  private _$actualScrollbarEnabled = new BehaviorSubject<boolean>(this.scrollbarEnabled);
  protected $actualScrollbarEnabled: Observable<boolean> = this._$actualScrollbarEnabled.asObservable();

  private _$actualAlignment = new BehaviorSubject<Alignment>(this.alignment);
  protected $actualAlignment: Observable<Alignment> = this._$actualAlignment.asObservable();
  protected get actualAlignment() { return this._$actualAlignment.getValue(); }

  private _$scrollerBounds = new BehaviorSubject<ISize | null>(null);
  protected $scrollerBounds: Observable<ISize | null> = this._$scrollerBounds.asObservable();

  private _$scrollSizeX = new BehaviorSubject<number>(0);
  protected $scrollSizeX: Observable<number> = this._$scrollSizeX.asObservable();

  private _$scrollSizeY = new BehaviorSubject<number>(0);
  protected $scrollSizeY: Observable<number> = this._$scrollSizeY.asObservable();

  private _$isScrollLeft = new BehaviorSubject<boolean>(true);
  protected $isScrollLeft: Observable<boolean> = this._$isScrollLeft.asObservable();

  private _$isScrollRight = new BehaviorSubject<boolean>(false);
  protected $isScrollRight: Observable<boolean> = this._$isScrollRight.asObservable();

  private _$isScrollTop = new BehaviorSubject<boolean>(true);
  protected $isScrollTop: Observable<boolean> = this._$isScrollTop.asObservable();

  private _$isScrollBottom = new BehaviorSubject<boolean>(false);
  protected $isScrollBottom: Observable<boolean> = this._$isScrollBottom.asObservable();

  protected _$precalculatedScrollLeftOffset = new BehaviorSubject<number>(0);
  protected $precalculatedScrollLeftOffset: Observable<number> = this._$precalculatedScrollLeftOffset.asObservable();

  protected _$precalculatedScrollTopOffset = new BehaviorSubject<number>(0);
  protected $precalculatedScrollTopOffset: Observable<number> = this._$precalculatedScrollTopOffset.asObservable();

  protected _$precalculatedScrollRightOffset = new BehaviorSubject<number>(0);
  protected $precalculatedScrollRightOffset: Observable<number> = this._$precalculatedScrollRightOffset.asObservable();

  protected _$precalculatedScrollBottomOffset = new BehaviorSubject<number>(0);
  protected $precalculatedScrollBottomOffset: Observable<number> = this._$precalculatedScrollBottomOffset.asObservable();

  protected _$actualScrollLeftOffset = new BehaviorSubject<number>(0);
  protected $actualScrollLeftOffset: Observable<number> = this._$actualScrollLeftOffset.asObservable();

  protected _$actualScrollRightOffset = new BehaviorSubject<number>(0);
  protected $actualScrollRightOffset: Observable<number> = this._$actualScrollRightOffset.asObservable();

  protected _$actualScrollTopOffset = new BehaviorSubject<number>(0);
  protected $actualScrollTopOffset: Observable<number> = this._$actualScrollTopOffset.asObservable();

  protected _$actualScrollBottomOffset = new BehaviorSubject<number>(0);
  protected $actualScrollBottomOffset: Observable<number> = this._$actualScrollBottomOffset.asObservable();

  protected _$actualSnapScrollToLeft = new BehaviorSubject<boolean>(false);
  protected $actualSnapScrollToLeft: Observable<boolean> = this._$actualSnapScrollToLeft.asObservable();

  protected _$actualSnapScrollToRight = new BehaviorSubject<boolean>(false);
  protected $actualSnapScrollToRight: Observable<boolean> = this._$actualSnapScrollToRight.asObservable();

  protected _$actualSnapScrollToTop = new BehaviorSubject<boolean>(false);
  protected $actualSnapScrollToTop: Observable<boolean> = this._$actualSnapScrollToTop.asObservable();

  protected _$actualSnapScrollToBottom = new BehaviorSubject<boolean>(false);
  protected $actualSnapScrollToBottom: Observable<boolean> = this._$actualSnapScrollToBottom.asObservable();

  protected _$alignmentScrollLeftOffset = new BehaviorSubject<number>(0);
  protected $alignmentScrollLeftOffset: Observable<number> = this._$alignmentScrollLeftOffset.asObservable();

  protected _$alignmentScrollRightOffset = new BehaviorSubject<number>(0);
  protected $alignmentScrollRightOffset: Observable<number> = this._$alignmentScrollRightOffset.asObservable();

  protected _$alignmentScrollTopOffset = new BehaviorSubject<number>(0);
  protected $alignmentScrollTopOffset: Observable<number> = this._$alignmentScrollTopOffset.asObservable();

  protected _$alignmentScrollBottomOffset = new BehaviorSubject<number>(0);
  protected $alignmentScrollBottomOffset: Observable<number> = this._$alignmentScrollBottomOffset.asObservable();

  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private _$scroll = new Subject<IScrollEvent>();
  readonly $scroll = this._$scroll.asObservable();

  get $grabbing() { return this._service.$grabbing };

  private _$fireUpdate = new Subject<boolean>();
  protected readonly $fireUpdate = this._$fireUpdate.asObservable();

  private _$fireUpdateNextFrame = new Subject<boolean>();
  protected readonly $fireUpdateNextFrame = this._$fireUpdateNextFrame.asObservable();

  private _$preventScrollSnapping = new BehaviorSubject<boolean>(false);
  protected readonly $preventScrollSnapping = this._$preventScrollSnapping.asObservable();

  private _isLoading = false;

  private _animationIds: Array<number> | null = null;

  private _$viewInit = new BehaviorSubject<boolean>(false);
  private readonly $viewInit = this._$viewInit.asObservable();

  private _injector = inject(Injector);

  constructor() {
    super();
    NgVirtualScrollViewComponent.__nextId = NgVirtualScrollViewComponent.__nextId + 1 === Number.MAX_SAFE_INTEGER
      ? 0 : NgVirtualScrollViewComponent.__nextId + 1;
    this._id = NgVirtualScrollViewComponent.__nextId;

    this._service.initialize(this._id);

    const $animationParams = this.$animationParams;
    $animationParams.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.animationParams = v;
      }),
    ).subscribe();

    this.$spreadingMode.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._$isInfinity.next(isSpreadingMode(v, SpreadingModes.INFINITY));
      }),
    ).subscribe();

    const $isInfinity = this.$isInfinity;
    $isInfinity.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.isInfinity = v;
      }),
    ).subscribe();

    const $bounds = this.$bounds.pipe(
      filter(b => !!b),
    ),
      $rawScrollLeftOffset = this.$scrollLeftOffset,
      $rawScrollRightOffset = this.$scrollRightOffset,
      $rawScrollTopOffset = this.$scrollTopOffset,
      $rawScrollBottomOffset = this.$scrollBottomOffset;

    combineLatest([$bounds, $rawScrollLeftOffset]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([bounds, value]) => {
        const val = parseArithmeticExpression(value, bounds!.width);
        this._$precalculatedScrollLeftOffset.next(val);
      }),
    ).subscribe();

    combineLatest([$bounds, $rawScrollRightOffset]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([bounds, value]) => {
        const val = parseArithmeticExpression(value, bounds!.width);
        this._$precalculatedScrollRightOffset.next(val);
      }),
    ).subscribe();

    combineLatest([$bounds, $rawScrollTopOffset]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([bounds, value]) => {
        const val = parseArithmeticExpression(value, bounds!.height);
        this._$precalculatedScrollTopOffset.next(val);
      }),
    ).subscribe();

    combineLatest([$bounds, $rawScrollBottomOffset]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([bounds, value]) => {
        const val = parseArithmeticExpression(value, bounds!.height);
        this._$precalculatedScrollBottomOffset.next(val);
      }),
    ).subscribe();

    this._service.$tick.pipe(
      takeUntil(this._$unsubscribe),
      tap(() => {
        this._scrollerComponent?.tick();
      }),
    ).subscribe();
  }

  ngAfterViewInit() {
    let hasUserAction = false;

    const _$created = new BehaviorSubject<boolean>(false),
      $created = _$created.asObservable();

    combineLatest([$created, this.$show]).pipe(
      takeUntil(this._$unsubscribe),
      filter(([created, shown]) => created && shown),
      debounceTime(1),
      tap(v => {
        this._$initialized.next(true);
      }),
    ).subscribe();

    const $isInfinity = this.$isInfinity,
      $bounds = this.$bounds.pipe(
        filter(b => !!b),
      ),
      $scrollerComponent = of(this._scrollerComponent),
      $resizeViewport = $scrollerComponent.pipe(
        takeUntil(this._$unsubscribe),
        filter(v => !!v),
        switchMap(scroller => scroller!.$resizeViewport),
      ),
      $resizeContent = $scrollerComponent.pipe(
        takeUntil(this._$unsubscribe),
        filter(v => !!v),
        switchMap(scroller => scroller!.$resizeContent),
      );

    $resizeViewport.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(v => {
        this._$bounds.next(v);
        this.onAfterResize(true);
      }),
    ).subscribe();

    $resizeContent.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(v => {
        this._$scrollerBounds.next(v);
        this.onAfterResize();
      }),
    ).subscribe();

    const $scrollLeftOffset = this.$actualScrollLeftOffset.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
    ),
      $scrollRightOffset = this.$actualScrollRightOffset.pipe(
        takeUntil(this._$unsubscribe),
        distinctUntilChanged(),
      ),
      $scrollTopOffset = this.$actualScrollTopOffset.pipe(
        takeUntil(this._$unsubscribe),
        distinctUntilChanged(),
      ),
      $scrollBottomOffset = this.$actualScrollBottomOffset.pipe(
        takeUntil(this._$unsubscribe),
        distinctUntilChanged(),
      );

    this._$scroller.next(this._scrollerComponent?.scrollViewport);

    const $scrollbarThickness = this.$scrollbarThickness;
    $scrollbarThickness.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(scrollbarThickness => {
        this._service.scrollBarSize = scrollbarThickness;
      }),
    ).subscribe();

    this.$fireUpdateNextFrame.pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(userAction => {
        this._$fireUpdate.next(userAction);
      }),
    ).subscribe();

    const $langTextDir = this.$langTextDir;
    $langTextDir.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.langTextDir = v;
      }),
    ).subscribe();

    this.$clickDistance.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      tap(v => {
        this._service.clickDistance = v;
      }),
    ).subscribe();

    combineLatest([this.$snapScrollToLeft, this.$spreadingMode]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([snapScrollToLeft, spreadingMode]) => {
        const isInfinity = isSpreadingMode(spreadingMode, SpreadingModes.INFINITY);
        this._$actualSnapScrollToLeft.next(isInfinity ? false : snapScrollToLeft);
      }),
    ).subscribe();

    combineLatest([this.$snapScrollToRight, this.$spreadingMode]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([snapScrollToRight, spreadingMode]) => {
        const isInfinity = isSpreadingMode(spreadingMode, SpreadingModes.INFINITY);
        this._$actualSnapScrollToRight.next(isInfinity ? false : snapScrollToRight);
      }),
    ).subscribe();

    combineLatest([this.$snapScrollToTop, this.$spreadingMode]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([snapScrollToTop, spreadingMode]) => {
        const isInfinity = isSpreadingMode(spreadingMode, SpreadingModes.INFINITY);
        this._$actualSnapScrollToTop.next(isInfinity ? false : snapScrollToTop);
      }),
    ).subscribe();

    combineLatest([this.$snapScrollToBottom, this.$spreadingMode]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([snapScrollToBottom, spreadingMode]) => {
        const isInfinity = isSpreadingMode(spreadingMode, SpreadingModes.INFINITY);
        this._$actualSnapScrollToBottom.next(isInfinity ? false : snapScrollToBottom);
      }),
    ).subscribe();

    const $viewInit = this.$viewInit,
      $fireUpdate = this.$fireUpdate;

    $fireUpdate.pipe(
      takeUntil(this._$unsubscribe),
      tap(userAction => {
        hasUserAction = userAction;
      }),
    ).subscribe();

    $viewInit.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      switchMap(() => {
        return combineLatest([
          $alignment, $scrollLeftOffset, $scrollRightOffset, $scrollTopOffset, $scrollRightOffset, $bounds, $precalculatedScrollLeftOffset,
          $precalculatedScrollRightOffset, $precalculatedScrollTopOffset, $precalculatedScrollBottomOffset, $isInfinity,
        ]).pipe(
          takeUntil(this._$unsubscribe),
          tap(() => {
            this.updateOffsetsByAllignment();
            this._scrollerComponent?.refreshScrollbar();
          }),
        );
      }),
    ).subscribe();

    const $snapScrollToLeft = this.$actualSnapScrollToLeft,
      $snapScrollToRight = this.$actualSnapScrollToRight,
      $snapScrollToTop = this.$actualSnapScrollToTop,
      $snapScrollToBottom = this.$actualSnapScrollToBottom;

    const $isScrollLeft = this.$isScrollLeft,
      $isScrollRight = this.$isScrollRight,
      $isScrollTop = this.$isScrollTop,
      $isScrollBottom = this.$isScrollBottom,
      $direction = this.$direction;

    $snapScrollToLeft.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.snapScrollToLeft = v;
      }),
    ).subscribe();

    $snapScrollToRight.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.snapScrollToRight = v;
      }),
    ).subscribe();

    $snapScrollToTop.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.snapScrollToTop = v;
      }),
    ).subscribe();

    $snapScrollToBottom.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.snapScrollToBottom = v;
      }),
    ).subscribe();

    $direction.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.direction = v;
      }),
    ).subscribe();

    $scrollLeftOffset.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      tap(v => {
        this._service.scrollLeftOffset = v;
      }),
    ).subscribe();

    $scrollRightOffset.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      tap(v => {
        this._service.scrollRightOffset = v;
      }),
    ).subscribe();

    $scrollTopOffset.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      tap(v => {
        this._service.scrollTopOffset = v;
      }),
    ).subscribe();

    $scrollBottomOffset.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      tap(v => {
        this._service.scrollBottomOffset = v;
      }),
    ).subscribe();

    $isScrollLeft.pipe(
      takeUntil(this._$unsubscribe),
      skip(1),
      distinctUntilChanged(),
      debounceTime(0),
      filter(v => !!v),
      tap(() => {
        if (this._scrollerComponent?.scrollableX) {
          this.onScrollReachLeft.emit();
        }
      }),
    ).subscribe();

    $isScrollRight.pipe(
      takeUntil(this._$unsubscribe),
      skip(1),
      distinctUntilChanged(),
      debounceTime(0),
      filter(v => !!v),
      tap(v => {
        if (this._scrollerComponent?.scrollableX) {
          this.onScrollReachRight.emit();
        }
      }),
    ).subscribe();

    $isScrollTop.pipe(
      takeUntil(this._$unsubscribe),
      skip(1),
      distinctUntilChanged(),
      debounceTime(0),
      filter(v => !!v),
      tap(v => {
        if (this._scrollerComponent?.scrollableY) {
          this.onScrollReachTop.emit();
        }
      }),
    ).subscribe();

    $isScrollBottom.pipe(
      takeUntil(this._$unsubscribe),
      skip(1),
      distinctUntilChanged(),
      debounceTime(0),
      filter(v => !!v),
      tap(v => {
        if (this._scrollerComponent?.scrollableY) {
          this.onScrollReachBottom.emit();
        }
      }),
    ).subscribe();

    combineLatest([this.$alignment, this.$isInfinity]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([alignment, isInfinity]) => {
        this._$actualAlignment.next(isInfinity ? Alignments.CENTER : alignment);
      }),
    ).subscribe();

    combineLatest([this.$scrollbarEnabled, this.$isInfinity]).pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(([scrollbarEnabled, isInfinity]) => {
        this._$actualScrollbarEnabled.next(isInfinity ? false : scrollbarEnabled);
      }),
    ).subscribe();

    const $alignment = this.$actualAlignment,
      $precalculatedScrollLeftOffset = this.$precalculatedScrollLeftOffset,
      $precalculatedScrollRightOffset = this.$precalculatedScrollRightOffset,
      $precalculatedScrollTopOffset = this.$precalculatedScrollTopOffset,
      $precalculatedScrollBottomOffset = this.$precalculatedScrollBottomOffset,
      $scrollerBounds = this.$scrollerBounds.pipe(
        filter(b => !!b),
      ),
      $scrollSizeX = this._$scrollSizeX.asObservable().pipe(
        takeUntil(this._$unsubscribe),
        distinctUntilChanged(),
      ),
      $scrollSizeY = this._$scrollSizeY.asObservable().pipe(
        takeUntil(this._$unsubscribe),
        distinctUntilChanged(),
      ),
      $snapToItem = this.$snapToItem,
      $snapToItemAlign = this.$snapToItemAlign;

    $snapToItem.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.snapToItem = v;
      }),
    ).subscribe();

    $viewInit.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      debounceTime(0),
      tap(() => {
        this._scrollerComponent?.snapIfNeed();
      }),
    ).subscribe();

    $direction.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        const el: HTMLElement = this._elementRef.nativeElement;
        if (isDirection(Directions.BOTH, v)) {
          toggleClassName(el, CLASS_SCROLL_VIEW_BOTH, [CLASS_SCROLL_VIEW_HORIZONTAL, CLASS_SCROLL_VIEW_VERTICAL]);
        } else if (isDirection(Directions.HORIZONTAL, v)) {
          toggleClassName(el, CLASS_SCROLL_VIEW_HORIZONTAL, [CLASS_SCROLL_VIEW_BOTH, CLASS_SCROLL_VIEW_VERTICAL]);
        } else if (isDirection(Directions.VERTICAL, v)) {
          toggleClassName(el, CLASS_SCROLL_VIEW_VERTICAL, [CLASS_SCROLL_VIEW_BOTH, CLASS_SCROLL_VIEW_HORIZONTAL]);
        }
      }),
    ).subscribe();

    const $preventScrollSnapping = this.$preventScrollSnapping;

    $preventScrollSnapping.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(() => {
        this._$isScrollLeft.next(false);
        this._$isScrollRight.next(false);
      }),
      tap(() => {
        this._$preventScrollSnapping.next(false);
      }),
    ).subscribe();

    const $loading = this.$loading;

    $loading.pipe(
      takeUntil(this._$unsubscribe),
      skip(1),
      distinctUntilChanged(),
      tap(v => {
        if (v) {
          this._isLoading = true;
        }
      }),
      filter(v => !v),
      tap(() => {
        this._$preventScrollSnapping.next(true);
      }),
      debounceTime(100),
      tap(() => {
        this._isLoading = false;
      }),
    ).subscribe();

    $viewInit.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      switchMap(() => {
        return combineLatest([$isInfinity, $snapScrollToLeft, $snapScrollToRight, $snapScrollToTop, $snapScrollToBottom, $precalculatedScrollLeftOffset, $precalculatedScrollRightOffset, $precalculatedScrollTopOffset,
          $precalculatedScrollBottomOffset, $bounds, $scrollerBounds,
          $scrollLeftOffset, $scrollRightOffset, $scrollTopOffset, $scrollBottomOffset, $scrollSizeX, $scrollSizeY, $direction, $snapToItem, $snapToItemAlign,
          $alignment, this.$fireUpdate,
        ]).pipe(
          takeUntil(this._$unsubscribe),
          tap(([
            isInfinity, snapScrollToLeft, snapScrollToRight, snapScrollToTop, snapScrollToBottom, precalculatedScrollLeftOffset, precalculatedScrollRightOffset,
            precalculatedScrollTopOffset, precalculatedScrollBottomOffset, bounds, scrollerBounds,
            scrollLeftOffset, scrollRightOffset, scrollTopOffset, scrollBottomOffset, scrollSizeX, scrollSizeY, direction, snapToItem, snapToItemAlign,
            alignment,
          ]) => {
            const scroller = this._scrollerComponent;
            if (!!scroller) {
              const userAction = hasUserAction, ready = _$created.getValue();

              if (!_$created.getValue()) {
                _$created.next(true);
              }

              if (ready) {
                const currentScrollSizeX = scroller.scrollLeft,
                  currentScrollSizeY = scroller.scrollTop;

                this.snappingHandler();

                this.updateOffsetsByAllignment();

                const roundedMaxPositionAfterUpdateX = scroller.actualScrollWidth,
                  roundedMaxPositionAfterUpdateY = scroller.actualScrollHeight;

                let toStart = false,
                  toEnd = false;

                if ((snapScrollToLeft && scroller.horizontalScrollRatio === 0 && currentScrollSizeX !== 0)) {
                  this.emitScrollEvent(true, false, userAction);

                  const params: IScrollToParams = {
                    [LEFT_PROP_NAME]: 0, userAction,
                    fireUpdate: true, behavior: (this.animationParams.scrollToItem > 0 && this.scrollBehavior !== BEHAVIOR_INSTANT) ? BEHAVIOR_AUTO : BEHAVIOR_INSTANT,
                    blending: !!this._animationIds ? scroller.hasAnimation(...this._animationIds) : false, duration: this.animationParams.scrollToItem,
                  };
                  const animationIds = scroller?.scrollTo?.(params);
                  if (animationIds !== null) {
                    this._animationIds = animationIds;
                  } else if (this._animationIds !== null) {
                    scroller.stopAnimation(...this._animationIds);
                  }
                  toStart = true;
                }

                if ((snapScrollToTop && scroller.verticalScrollRatio === 0 && currentScrollSizeY !== 0)) {
                  this.emitScrollEvent(true, false, userAction);

                  const params: IScrollToParams = {
                    [TOP_PROP_NAME]: 0, userAction,
                    fireUpdate: true, behavior: (this.animationParams.scrollToItem > 0 && this.scrollBehavior !== BEHAVIOR_INSTANT) ? BEHAVIOR_AUTO : BEHAVIOR_INSTANT,
                    blending: !!this._animationIds ? scroller.hasAnimation(...this._animationIds) : false, duration: this.animationParams.scrollToItem,
                  };
                  const animationIds = scroller?.scrollTo?.(params);
                  if (animationIds !== null) {
                    this._animationIds = animationIds;
                  } else if (this._animationIds !== null) {
                    scroller.stopAnimation(...this._animationIds);
                  }
                  toStart = true;
                }

                if (toStart) {
                  return;
                }

                if ((snapScrollToRight && scroller.horizontalScrollRatio === 1 && currentScrollSizeX !== roundedMaxPositionAfterUpdateX)) {

                  this.emitScrollEvent(true, false, false);

                  const params: IScrollToParams = {
                    [LEFT_PROP_NAME]: roundedMaxPositionAfterUpdateX,
                    behavior: (this.animationParams.scrollToItem > 0 && this.scrollBehavior !== BEHAVIOR_INSTANT) ? BEHAVIOR_AUTO : BEHAVIOR_INSTANT,
                    userAction: false, blending: !!this._animationIds ? scroller.hasAnimation(...this._animationIds) : false, duration: this.animationParams.scrollToItem,
                  };
                  const animationIds = scroller?.scrollTo?.(params);
                  if (animationIds !== null) {
                    this._animationIds = animationIds;
                  } else if (this._animationIds !== null) {
                    scroller.stopAnimation(...this._animationIds);
                  }
                  toEnd = true;
                }

                if ((snapScrollToBottom && scroller.verticalScrollRatio === 1 && currentScrollSizeY !== roundedMaxPositionAfterUpdateY)) {

                  this.emitScrollEvent(true, false, false);

                  const params: IScrollToParams = {
                    [TOP_PROP_NAME]: roundedMaxPositionAfterUpdateY,
                    behavior: (this.animationParams.scrollToItem > 0 && this.scrollBehavior !== BEHAVIOR_INSTANT) ? BEHAVIOR_AUTO : BEHAVIOR_INSTANT,
                    userAction: false, blending: !!this._animationIds ? scroller.hasAnimation(...this._animationIds) : false, duration: this.animationParams.scrollToItem,
                  };
                  const animationIds = scroller?.scrollTo?.(params);
                  if (animationIds !== null) {
                    this._animationIds = animationIds;
                  } else if (this._animationIds !== null) {
                    scroller.stopAnimation(...this._animationIds);
                  }
                  toEnd = true;
                }

                if (toEnd) {
                  return;
                }
              }
            }
          }),
        );
      }),
    ).subscribe();

    const $scroller = this.$scroller.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      map(v => v!.nativeElement),
      take(1),
    ),
      $scrollerScroll = $scrollerComponent.pipe(
        takeUntil(this._$unsubscribe),
        filter(v => !!v),
        take(1),
        switchMap(scroller => scroller!.$scroll),
      ),
      $scrollerScrollEnd = $scrollerComponent.pipe(
        takeUntil(this._$unsubscribe),
        filter(v => !!v),
        take(1),
        switchMap(scroller => scroller!.$scrollEnd),
      ),
      $scrollbarScroll = $scrollerComponent.pipe(
        takeUntil(this._$unsubscribe),
        filter(v => !!v),
        take(1),
        switchMap(scroller => scroller!.$scrollbarScroll),
      );

    $scrollerComponent.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      switchMap(scroller => scroller!.$contentBounds.pipe(
        takeUntil(this._$unsubscribe),
        tap(({ width, height }) => {
          if (!!scroller) {
            scroller.totalWidth = width;
            scroller.totalHeight = height;
          }
        })
      )),
    ).subscribe();

    $scrollerComponent.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      take(1),
      tap(scroller => {
        scroller!.prepared = true;
      }),
    ).subscribe();

    const scrollHandler = (userAction: boolean = false) => {
      const scroller = this._scrollerComponent;
      if (!!scroller) {
        const scrollSizeX = scroller.scrollLeft,
          scrollSizeY = scroller.scrollTop;

        if (userAction) {
          this._$preventScrollSnapping.next(true);
        }

        this._$scrollSizeX.next(scrollSizeX);
        this._$scrollSizeY.next(scrollSizeY);
      }
    };

    $scroller.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      switchMap(scroller => {
        return $scrollbarScroll.pipe(
          takeUntil(this._$unsubscribe),
          tap(userAction => {
            const scrollerEl = this._$scroller.getValue()?.nativeElement, scrollerComponent = this._scrollerComponent;
            if (!!scrollerEl && !!scrollerComponent) {
              this.emitScrollEvent(false, true, hasUserAction);
            }
            if (userAction) {
              if (this._$isScrollLeft.getValue() || this._$isScrollRight.getValue() || this._$isScrollTop.getValue() || this._$isScrollBottom.getValue()) {
                this._$preventScrollSnapping.next(true);
              }
              this._$preventScrollSnapping.next(true);
            }
          }),
        );
      }),
    ).subscribe();

    $scroller.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      switchMap(scroller => {
        return $scrollerScroll.pipe(
          takeUntil(this._$unsubscribe),
        );
      }),
      tap(userAction => {
        hasUserAction = userAction;
        const scrollerEl = this._$scroller.getValue()?.nativeElement, scrollerComponent = this._scrollerComponent;
        if (!!scrollerEl && !!scrollerComponent) {
          this.emitScrollEvent(false, true, userAction);
        }
        scrollHandler(userAction);
      }),
    ).subscribe();

    $scroller.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      switchMap(scroller => {
        return $scrollerScrollEnd.pipe(
          takeUntil(this._$unsubscribe),
        );
      }),
      tap(userAction => {
        hasUserAction = userAction;
        const scrollerEl = this._$scroller.getValue()?.nativeElement, scrollerComponent = this._scrollerComponent;
        if (!!scrollerEl && !!scrollerComponent) {
          this.emitScrollEvent(true, true, userAction);
        }
        scrollHandler(userAction);
      }),
    ).subscribe();

    $bounds.pipe(
      takeUntil(this._$unsubscribe),
      distinctUntilChanged(),
      filter(v => !!v),
      tap(value => {
        const size: ISize = { width: value!.width, height: value!.height };
        this.onViewportChange.emit(objectAsReadonly(size));
      }),
    ).subscribe();

    this._$viewInit.next(true);

    this._$fireUpdate.next(false);
  }

  private onAfterResize(update = false) {
    this.snappingHandler();

    if (update) {
      const scroller = this._scrollerComponent;
      if (!!scroller) {
        this._$fireUpdate.next(false);
        scroller.refresh(true, true);
      }
    }
  }

  private snappingHandler() {
    const scroller = this._scrollerComponent;
    if (!!scroller) {
      const maxScrollWidth = Math.round(scroller.scrollWidth ?? 0),
        maxScrollHeight = Math.round(scroller.scrollHeight),
        scrollWidth = scroller.scrollLeft ?? 0,
        scrollHeight = scroller.scrollTop ?? 0,
        actualScrollWidth = Math.round(scrollWidth),
        actualScrollHeight = Math.round(scrollHeight);
      if (!this._isLoading) {
        const _isScrollRight = (maxScrollWidth >= (actualScrollWidth - MIN_PIXELS_FOR_PREVENT_SNAPPING)) || !scroller.scrollableX;
        if (_isScrollRight) {
          this._$isScrollLeft.next(false);
          this._$isScrollRight.next(true);
        } else {
          const isScrollStart = (maxScrollWidth <= MIN_PIXELS_FOR_PREVENT_SNAPPING);
          this._$isScrollLeft.next(isScrollStart);
          this._$isScrollRight.next(false);
        }
        const _isScrollBottom = (maxScrollHeight >= (actualScrollHeight - MIN_PIXELS_FOR_PREVENT_SNAPPING)) || !scroller.scrollableY;
        if (_isScrollBottom) {
          this._$isScrollTop.next(false);
          this._$isScrollBottom.next(true);
        } else {
          const isScrollTop = (maxScrollHeight <= MIN_PIXELS_FOR_PREVENT_SNAPPING);
          this._$isScrollTop.next(isScrollTop);
          this._$isScrollBottom.next(false);
        }
      } else {
        const snapScrollToLeft = this._$actualSnapScrollToLeft.getValue(), snapScrollToRight = this._$actualSnapScrollToRight.getValue();
        if (!snapScrollToLeft && snapScrollToRight) {
          this._$isScrollLeft.next(false);
          this._$isScrollRight.next(true);
        } else if (snapScrollToLeft && snapScrollToRight) {
          this._$isScrollLeft.next(true);
          this._$isScrollRight.next(false);
        } else {
          this._$isScrollLeft.next(false);
          this._$isScrollRight.next(false);
        }
        const snapScrollToTop = this._$actualSnapScrollToTop.getValue(), snapScrollToBottom = this._$actualSnapScrollToBottom.getValue();
        if (!snapScrollToTop && snapScrollToBottom) {
          this._$isScrollLeft.next(false);
          this._$isScrollRight.next(true);
        } else if (snapScrollToTop && snapScrollToBottom) {
          this._$isScrollLeft.next(true);
          this._$isScrollRight.next(false);
        } else {
          this._$isScrollLeft.next(false);
          this._$isScrollRight.next(false);
        }
      }
    }
  };

  private emitScrollEvent(isScrollEnd: boolean = false, update: boolean = true, userAction: boolean = false) {
    const scrollerComponent = this._scrollerComponent;
    if (!!scrollerComponent) {
      const scrollWidth = scrollerComponent.scrollLeft,
        scrollHeight = scrollerComponent.scrollTop,
        maxScrollWidth = scrollerComponent.scrollWidth,
        maxScrollHeight = scrollerComponent.scrollHeight,
        bounds = this._$bounds.getValue() || { x: 0, y: 0, width: DEFAULT_LIST_SIZE, height: DEFAULT_LIST_SIZE };

      const event = new ScrollEvent({
        directionX: scrollerComponent.scrollDirectionX,
        directionY: scrollerComponent.scrollDirectionY,
        bounds,
        scrollerDirection: this.direction,
        scrollWidth,
        scrollHeight,
        isRight: !scrollerComponent.scrollableX || this._$isScrollRight.getValue() || (Math.round(scrollWidth) === Math.round(maxScrollWidth)),
        isBottom: !scrollerComponent.scrollableY || this._$isScrollBottom.getValue() || (Math.round(scrollHeight) === Math.round(maxScrollHeight)),
        userAction,
      });
      if (update) {
        this._$scroll.next(event);
      }

      if (isScrollEnd) {
        this.onScrollEnd.emit(event);
      } else {
        this.onScroll.emit(event);
      }
    }
  }

  private updateOffsetsByAllignment() {
    const scrollerComponent = this._scrollerComponent;
    if (!!scrollerComponent) {
      const alignment = this._$actualAlignment.getValue(),
        isInfinity = this._$isInfinity.getValue(),
        { width, height } = this._$bounds.getValue() || { width: DEFAULT_LIST_SIZE, height: DEFAULT_LIST_SIZE },
        viewportSizeWidth = width,
        viewportSizeHeight = height,
        { width: contentWidth, height: contentHeight } = scrollerComponent.contentBounds,
        precalculatedScrollLeftOffset = this._$precalculatedScrollLeftOffset.getValue(),
        precalculatedScrollRightOffset = this._$precalculatedScrollRightOffset.getValue(),
        precalculatedScrollTopOffset = this._$precalculatedScrollTopOffset.getValue(),
        precalculatedScrollBottomOffset = this._$precalculatedScrollBottomOffset.getValue();
      switch (alignment) {
        case Alignments.NONE: {
          this._$actualScrollLeftOffset.next(precalculatedScrollLeftOffset);
          this._$actualScrollRightOffset.next(precalculatedScrollRightOffset);
          this._$actualScrollTopOffset.next(precalculatedScrollTopOffset);
          this._$actualScrollBottomOffset.next(precalculatedScrollBottomOffset);
          break;
        }
        case Alignments.CENTER: {
          const alignmentLeftOffset = viewportSizeWidth * .5 - contentWidth * (isInfinity || !scrollerComponent.scrollableX ? 0 : .5),
            alignmentRightOffset = viewportSizeWidth * .5 - contentWidth * (isInfinity || !scrollerComponent.scrollableX ? 0 : .5),
            alignmentTopOffset = viewportSizeHeight * .5 - contentHeight * (isInfinity || !scrollerComponent.scrollableY ? 0 : .5),
            alignmentBottomOffset = viewportSizeHeight * .5 - contentHeight * (isInfinity || !scrollerComponent.scrollableY ? 0 : .5);

          this._$alignmentScrollLeftOffset.next(alignmentLeftOffset);
          this._$alignmentScrollRightOffset.next(alignmentRightOffset);
          this._$alignmentScrollTopOffset.next(alignmentTopOffset);
          this._$alignmentScrollBottomOffset.next(alignmentBottomOffset);
          this._$actualScrollLeftOffset.next(precalculatedScrollLeftOffset + alignmentLeftOffset);
          this._$actualScrollRightOffset.next(precalculatedScrollRightOffset + alignmentRightOffset);
          this._$actualScrollTopOffset.next(precalculatedScrollTopOffset + alignmentTopOffset);
          this._$actualScrollBottomOffset.next(precalculatedScrollBottomOffset + alignmentBottomOffset);
          break;
        }
      }
    }
  }

  /**
   * The method scrolls the scroll view and returns the animation ids if the behavior is set to smooth or null 
   * if the behavior is set to auto, instant, or not set.
   */
  scrollTo(options: IScrollOptions) {
    const behavior = options?.behavior ?? BEHAVIOR_INSTANT,
      blending = options?.blending ?? false,
      x = options?.x,
      y = options?.y,
      left = options?.left,
      top = options?.top,
      ease = options?.ease,
      duration = options?.duration;
    const scroller = this._scrollerComponent;
    if (!!scroller) {
      scroller.stopScrolling(true);
      return scroller.scroll({ x, y, left, top, behavior, blending, ease, duration, userAction: true });
    }
    return null;
  }

  /**
   * Prevents the list from snapping to its start or end edge.
   */
  preventSnapping() {
    const scroller = this._scrollerComponent;
    this._$isScrollLeft.next(false);
    this._$isScrollRight.next(false);
    if (!!scroller) {
      scroller.stopScrolling();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
