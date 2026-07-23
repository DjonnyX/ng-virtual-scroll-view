import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, filter, from, of, Subject, takeUntil, tap } from 'rxjs';
import { ScrollBox } from './utils';
import { Id } from '../../types';
import { NgScrollBarComponent } from "../ng-scroll-bar/ng-scroll-bar.component";
import { GradientColorPositions } from '../../types/gradient-color-positions';
import {
  BEHAVIOR_INSTANT, DEFAULT_MAX_MOTION_BLUR, DEFAULT_MOTION_BLUR, DEFAULT_MOTION_BLUR_ENABLED, DEFAULT_OVERLAPPING_SCROLLBAR,
  DEFAULT_SCROLLBAR_ENABLED, DEFAULT_SCROLLBAR_INTERACTIVE, DEFAULT_SCROLLBAR_MIN_SIZE, DEFAULT_SCROLLBAR_THICKNESS, LEFT_PROP_NAME,
  PX, SCROLLER_SCROLL, TOP_PROP_NAME,
} from '../../const';
import { IScrollToParams, NgScrollView, SCROLL_VIEW_INVERSION } from '../ng-scroll-view';
import { IScrollBarDragEvent } from '../ng-scroll-bar/interfaces';
import { SCROLL_VIEW_NORMALIZE_VALUE_FROM_ZERO, SCROLL_VIEW_OVERSCROLL_ENABLED } from '../ng-scroll-view/const';
import { ISize } from '../../interfaces';
import { ScrollerDirection } from '../ng-scroll-view/enums';

const TOP = 'top',
  LEFT = 'left',
  INSTANT = 'instant',
  MOTION_BLUR = 'motion-blur';

export const SCROLL_EVENT = new Event(SCROLLER_SCROLL);

/**
 * The scroller for the NgVirtualScrollView item component
 * Maximum performance for extremely large lists.
 * It is based on algorithms for virtualization of screen objects.
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/16.x/projects/ng-virtual-scroll-view/src/lib/components/scroller/ng-scroller.component.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
@Component({
  selector: 'ng-scroller',
  providers: [
    { provide: SCROLL_VIEW_INVERSION, useValue: false },
    { provide: SCROLL_VIEW_NORMALIZE_VALUE_FROM_ZERO, useValue: true },
    { provide: SCROLL_VIEW_OVERSCROLL_ENABLED, useValue: true },
  ],
  standalone: false,
  templateUrl: './ng-scroller.component.html',
  styleUrls: ['./ng-scroller.component.scss'],
})
export class NgScrollerComponent extends NgScrollView {
  @ViewChild('scrollBarHorizontal', { read: NgScrollBarComponent })
  readonly scrollBarHorizontal: NgScrollBarComponent | undefined;

  @ViewChild('scrollBarVertical', { read: NgScrollBarComponent })
  readonly scrollBarVertical: NgScrollBarComponent | undefined;

  @ViewChild('filter')
  readonly filter: ElementRef<SVGFEGaussianBlurElement> | undefined;

  @Output()
  readonly onScrollbarVisible = new EventEmitter<boolean>();

  private _$scrollbarEnabled = new BehaviorSubject<boolean>(DEFAULT_SCROLLBAR_ENABLED);
  readonly $scrollbarEnabled = this._$scrollbarEnabled.asObservable();

  @Input()
  set scrollbarEnabled(v: boolean) {
    if (this._$scrollbarEnabled.getValue() !== v) {
      this._$scrollbarEnabled.next(v);
    }
  }
  get scrollbarEnabled() { return this._$scrollbarEnabled.getValue(); }

  private _$scrollbarInteractive = new BehaviorSubject<boolean>(DEFAULT_SCROLLBAR_INTERACTIVE);
  readonly $scrollbarInteractive = this._$scrollbarInteractive.asObservable();

  @Input()
  set scrollbarInteractive(v: boolean) {
    if (this._$scrollbarInteractive.getValue() !== v) {
      this._$scrollbarInteractive.next(v);
    }
  }
  get scrollbarInteractive() { return this._$scrollbarInteractive.getValue(); }

  private _$focusedElement = new BehaviorSubject<Id | undefined>(undefined);
  readonly $focusedElement = this._$focusedElement.asObservable();

  @Input()
  set focusedElement(v: Id | undefined) {
    if (this._$focusedElement.getValue() !== v) {
      this._$focusedElement.next(v);
    }
  }
  get focusedElement() { return this._$focusedElement.getValue(); }

  private _$overlappingScrollbar = new BehaviorSubject<boolean>(DEFAULT_OVERLAPPING_SCROLLBAR);
  readonly $overlappingScrollbar = this._$overlappingScrollbar.asObservable();

  @Input()
  set overlappingScrollbar(v: boolean) {
    if (this._$overlappingScrollbar.getValue() !== v) {
      this._$overlappingScrollbar.next(v);
    }
  }
  get overlappingScrollbar() { return this._$overlappingScrollbar.getValue(); }

  private _$content = new BehaviorSubject<HTMLElement | undefined>(undefined);
  readonly $content = this._$focusedElement.asObservable();

  @Input()
  set content(v: HTMLElement | undefined) {
    if (this._$content.getValue() !== v) {
      this._$content.next(v);
    }
  }
  get content() { return this._$content.getValue(); }

  private _$loading = new BehaviorSubject<boolean>(false);
  readonly $loading = this._$loading.asObservable();

  @Input()
  set loading(v: boolean) {
    if (this._$loading.getValue() !== v) {
      this._$loading.next(v);
    }
  }
  get loading() { return this._$loading.getValue(); }

  private _$classes = new BehaviorSubject<{ [cName: string]: boolean }>({});
  readonly $classes = this._$classes.asObservable();

  @Input()
  set classes(v: { [cName: string]: boolean }) {
    if (this._$classes.getValue() !== v) {
      this._$classes.next(v);
    }
  }
  get classes() { return this._$classes.getValue(); }

  private _$scrollbarMinSize = new BehaviorSubject<number>(DEFAULT_SCROLLBAR_MIN_SIZE);
  readonly $scrollbarMinSize = this._$scrollbarMinSize.asObservable();

  @Input()
  set scrollbarMinSize(v: number) {
    if (this._$scrollbarMinSize.getValue() !== v) {
      this._$scrollbarMinSize.next(v);
    }
  }
  get scrollbarMinSize() { return this._$scrollbarMinSize.getValue(); }

  private _$scrollbarThickness = new BehaviorSubject<number>(DEFAULT_SCROLLBAR_THICKNESS);
  readonly $scrollbarThickness = this._$scrollbarThickness.asObservable();

  @Input()
  set scrollbarThickness(v: number) {
    if (this._$scrollbarThickness.getValue() !== v) {
      this._$scrollbarThickness.next(v);
    }
  }
  get scrollbarThickness() { return this._$scrollbarThickness.getValue(); }

  private _$scrollbarThumbRenderer = new BehaviorSubject<TemplateRef<any> | null>(null);
  readonly $scrollbarThumbRenderer = this._$scrollbarThumbRenderer.asObservable();

  @Input()
  set scrollbarThumbRenderer(v: TemplateRef<any> | null) {
    if (this._$scrollbarThumbRenderer.getValue() !== v) {
      this._$scrollbarThumbRenderer.next(v);
    }
  }
  get scrollbarThumbRenderer() { return this._$scrollbarThumbRenderer.getValue(); }

  private _$scrollbarThumbParams = new BehaviorSubject<{ [propName: string]: any } | null>(null);
  readonly $scrollbarThumbParams = this._$scrollbarThumbParams.asObservable();

  @Input()
  set scrollbarThumbParams(v: { [propName: string]: any } | null) {
    if (this._$scrollbarThumbParams.getValue() !== v) {
      this._$scrollbarThumbParams.next(v);
    }
  }
  get scrollbarThumbParams() { return this._$scrollbarThumbParams.getValue(); }

  private _$motionBlur = new BehaviorSubject<number | 'disabled'>(DEFAULT_MOTION_BLUR);
  readonly $motionBlur = this._$motionBlur.asObservable();

  @Input()
  set motionBlur(v: number | 'disabled') {
    if (this._$motionBlur.getValue() !== v) {
      this._$motionBlur.next(v);
    }
  }
  get motionBlur() { return this._$motionBlur.getValue(); }

  private _$maxMotionBlur = new BehaviorSubject<number>(DEFAULT_MAX_MOTION_BLUR);
  readonly $maxMotionBlur = this._$maxMotionBlur.asObservable();

  @Input()
  set maxMotionBlur(v: number) {
    if (this._$maxMotionBlur.getValue() !== v) {
      this._$maxMotionBlur.next(v);
    }
  }
  get maxMotionBlur() { return this._$maxMotionBlur.getValue(); }

  private _$motionBlurEnabled = new BehaviorSubject<boolean>(DEFAULT_MOTION_BLUR_ENABLED);
  readonly $motionBlurEnabled = this._$motionBlurEnabled.asObservable();

  @Input()
  set motionBlurEnabled(v: boolean) {
    if (this._$motionBlurEnabled.getValue() !== v) {
      this._$motionBlurEnabled.next(v);
    }
  }
  get motionBlurEnabled() { return this._$motionBlurEnabled.getValue(); }

  private _$actualClasses = new BehaviorSubject<{ [cName: string]: boolean }>({});
  readonly $actualClasses = this._$actualClasses.asObservable();

  private _$containerClasses = new BehaviorSubject<{ [cName: string]: boolean }>({});
  readonly $containerClasses = this._$containerClasses.asObservable();

  private _$thumbGradientPositionsHorizontal = new BehaviorSubject<GradientColorPositions>([0, 0]);
  readonly $thumbGradientPositionsHorizontal = this._$thumbGradientPositionsHorizontal.asObservable();

  private _$thumbGradientPositionsVertical = new BehaviorSubject<GradientColorPositions>([0, 0]);
  readonly $thumbGradientPositionsVertical = this._$thumbGradientPositionsVertical.asObservable();

  private _$thumbSizeVertical = new BehaviorSubject<number>(0);
  readonly $thumbSizeVertical = this._$thumbSizeVertical.asObservable();

  private _$thumbSizeHorizontal = new BehaviorSubject<number>(0);
  readonly $thumbSizeHorizontal = this._$thumbSizeHorizontal.asObservable();

  private _$scrollbarHorizontalEnabled = new BehaviorSubject<boolean>(this.scrollableX);
  readonly $scrollbarHorizontalEnabled = this._$scrollbarHorizontalEnabled.asObservable();

  private _$scrollbarVerticalEnabled = new BehaviorSubject<boolean>(this.scrollableY);
  readonly $scrollbarVerticalEnabled = this._$scrollbarVerticalEnabled.asObservable();

  private _$preparedSignal = new BehaviorSubject<boolean>(false);
  readonly $preparedSignal = this._$preparedSignal.asObservable();

  private _$listStyles = new BehaviorSubject<{ perspectiveOrigin: string }>({ perspectiveOrigin: 'center' });
  readonly $listStyles = this._$listStyles.asObservable();

  private _$scrollbarHorizontalShow = new BehaviorSubject<boolean>(false);
  readonly $scrollbarHorizontalShow = this._$scrollbarHorizontalShow.asObservable();

  private _$scrollbarVerticalShow = new BehaviorSubject<boolean>(false);
  readonly $scrollbarVerticalShow = this._$scrollbarVerticalShow.asObservable();

  private _scrollBox = new ScrollBox();

  get host() {
    return this.scrollViewport?.nativeElement;
  }

  private _$scrollbarScroll = new Subject<boolean>();
  readonly $scrollbarScroll = this._$scrollbarScroll.asObservable();

  private _prepared = false;
  set prepared(v: boolean) {
    if (this._prepared !== v) {
      this._prepared = v;
      this._$preparedSignal.next(v);
    }
  }

  protected override setX(x: number, normalize: boolean = true) {
    if (x !== undefined && !Number.isNaN(x)) {
      this.updateDirectionX(x, this._x);

      this._x = this._actualX = x;

      const overridden = normalize ? this.normalizeScrollSize() : false;

      this.refreshCoordinate(this._x, this._y);

      if (!overridden) {
        this.measureVelocity();
      }

      this.updateScrollBar(false);

      this.recalculatePerspective();
    }
  }

  protected override setY(y: number, normalize: boolean = true) {
    if (y !== undefined && !Number.isNaN(y)) {
      this.updateDirectionY(y, this._y);

      this._y = this._actualY = y;

      const overridden = normalize ? this.normalizeScrollSize() : false;

      this.refreshCoordinate(this._x, this._y);

      if (!overridden) {
        this.measureVelocity();
      }

      this.updateScrollBar(true);

      this.recalculatePerspective();
    }
  }

  override set startLayoutOffsetX(v: number) {
    if (this._startLayoutOffsetX !== v) {
      this._startLayoutOffsetX = v;

      this.refreshCoordinate(this._x, this._y);

      this.recalculatePerspective();
    }
  }
  override get startLayoutOffsetX() { return this._startLayoutOffsetX; }

  override set startLayoutOffsetY(v: number) {
    if (this._startLayoutOffsetY !== v) {
      this._startLayoutOffsetY = v;

      this.refreshCoordinate(this._x, this._y);

      this.recalculatePerspective();
    }
  }
  override get startLayoutOffsetY() { return this._startLayoutOffsetY; }

  private _$viewInitialized = new BehaviorSubject<boolean>(false);
  readonly $viewInitialized = this._$viewInitialized.asObservable();

  private _isScrollbarUserActionX: boolean = false;
  get isScrollbarUserActionX() {
    return this._isScrollbarUserActionX;
  }

  private _isScrollbarUserActionY: boolean = false;
  get isScrollbarUserActionY() {
    return this._isScrollbarUserActionY;
  }

  protected _$resizeViewport = new Subject<ISize>();
  readonly $resizeViewport = this._$resizeViewport.asObservable();

  protected _$resizeContent = new Subject<ISize>();
  readonly $resizeContent = this._$resizeContent.asObservable();

  protected _filterId: string;

  protected _filter: string;

  constructor() {
    super();

    this._filterId = `${this._service.id}-${MOTION_BLUR}`;
    this._filter = `url(#${this._filterId})`;
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    const $filter = of(this.filter),
      $motionBlur = this.$motionBlur,
      $maxMotionBlur = this.$maxMotionBlur,
      $motionBlurEnabled = this.$motionBlurEnabled,
      $isVertical = this.$isVertical;

    const $scrollbarScroll = this.$scrollbarScroll;
    $scrollbarScroll.pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(50),
      tap(() => {
        this.dropVelocity();
        this.fireScrollEvent(false);
      }),
    ).subscribe();

    const $averageVelocityX = this.$averageVelocityX,
      $averageVelocityY = this.$averageVelocityY;
    combineLatest([$averageVelocityX, $averageVelocityY, $filter, $motionBlurEnabled, $motionBlur, $maxMotionBlur]).pipe(
      takeUntil(this._$unsubscribe),
      filter(([, , , f, e, mb]) => !!f && (!!e && mb !== 0)),
      tap(([x, y, filter, , mb, mbMax]) => {
        const _x = x * (mb as number), valueX = _x > mbMax ? mbMax : _x,
          _y = y * (mb as number), valueY = _y > mbMax ? mbMax : _y;
        filter!.nativeElement.setStdDeviation(x * valueX, y * valueY);
      }),
      debounceTime(50),
      tap(([, , filter, ,]) => {
        filter!.nativeElement.setStdDeviation(0, 0);
      }),
    ).subscribe();

    const $prepare = this.$preparedSignal;
    $prepare.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(() => {
        this.updateScrollBarHandler(false, true, false, true);
        this.updateScrollBarHandler(true, true, false, true);
      }),
    ).subscribe();

    combineLatest([this.$scrollbarHorizontalEnabled, this.$scrollbarEnabled, this.$preparedSignal]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([scrollbarHorizontalEnabled, scrollbarEnabled, prepared]) => {
        this._$scrollbarHorizontalShow.next(scrollbarHorizontalEnabled && scrollbarEnabled && prepared);
      }),
    ).subscribe();

    combineLatest([this.$scrollbarVerticalEnabled, this.$scrollbarEnabled, this.$preparedSignal]).pipe(
      takeUntil(this._$unsubscribe),
      tap(([scrollbarVerticalEnabled, scrollbarEnabled, prepared]) => {
        this._$scrollbarVerticalShow.next(scrollbarVerticalEnabled && scrollbarEnabled && prepared);
      }),
    ).subscribe();

    const $leftOffset = this.$leftOffset,
      $rightOffset = this.$rightOffset,
      $topOffset = this.$topOffset,
      $bottomOffset = this.$bottomOffset,
      $scrollbarMinSize = this.$scrollbarMinSize,
      $thumbSizeHorizontal = this.$thumbSizeHorizontal,
      $thumbSizeVertical = this.$thumbSizeVertical;

    from([$rightOffset, $leftOffset, $thumbSizeHorizontal, $scrollbarMinSize]).pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(() => {
        this.updateScrollBar(false);
      }),
    ).subscribe();

    from([$bottomOffset, $topOffset, $thumbSizeVertical, $scrollbarMinSize]).pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(() => {
        this.updateScrollBar(true);
      }),
    ).subscribe();

    const $updateScrollBarHorizontal = this.$updateScrollBarHorizontal,
      $updateScrollBarVertical = this.$updateScrollBarVertical;

    $updateScrollBarHorizontal.pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(() => {
        this.updateScrollBarHandler(false, !this._isScrollbarUserActionX);
      }),
    ).subscribe();

    $updateScrollBarVertical.pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(() => {
        this.updateScrollBarHandler(true, !this._isScrollbarUserActionY);
      }),
    ).subscribe();

    const $grabbing = this.$grabbing;
    $grabbing.pipe(
      takeUntil(this._$unsubscribe),
      tap(v => {
        this._service.grabbing = v;
      }),
    ).subscribe();

    combineLatest([this.$classes, this.$direction, this.$grabbing, this.$motionBlurEnabled, this.$preparedSignal]).pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(([classes, direction, grabbing, filtered, prepared]) => {
        this._$actualClasses.next({ ...classes, [direction]: true, grabbing, filtered, prepared });
      }),
    ).subscribe();

    combineLatest([
      this.$contentBounds, this.$viewportBounds, this.$direction, this.$grabbing, this.$scrollbarEnabled, this.$scrollable,
      this.$overlappingScrollbar,
    ]).pipe(
      takeUntil(this._$unsubscribe),
      debounceTime(0),
      tap(([contentBounds, viewportBounds, direction, grabbing, scrollbarEnabled, scrollEnabled, overlappingScrollbar]) => {
        const { width: contentWidth, height: contentHeight } = contentBounds,
          { width, height } = viewportBounds,
          viewportWidth = width,
          viewportHeight = height,
          scrollableX = contentWidth > viewportWidth,
          scrollableY = contentHeight > viewportHeight,
          scrollable = scrollEnabled && (scrollableX || scrollableY);
        this._$containerClasses.next({ [direction]: true, grabbing, enabled: scrollbarEnabled, scrollable, scrollableX, scrollableY, overlapping: overlappingScrollbar });
      }),
    ).subscribe();

    this.$viewInitialized.pipe(
      takeUntil(this._$unsubscribe),
      filter(v => !!v),
      tap(() => {
        this.updateScrollBarHandler(false);
        this.updateScrollBarHandler(true);
      }),
    ).subscribe();

    this._$viewInitialized.next(true);
  }

  private recalculatePerspective() {
    const scrollWidth = this.scrollLeft - this._startLayoutOffsetX,
      scrollHeight = this.scrollTop - this._startLayoutOffsetX,
      { width, height } = this._$viewportBounds.getValue();
    this._$listStyles.next({
      perspectiveOrigin: `${scrollWidth + width * .5}${PX} ${scrollHeight + height * .5}${PX}`
    });
  }

  protected override onResizeViewport() {
    const viewport = this.scrollViewport?.nativeElement;
    if (!!viewport) {
      const bounds: ISize = { width: viewport.offsetWidth, height: viewport.offsetHeight }, b = this._$viewportBounds.getValue();
      if (bounds.width === b.width && bounds.height === b.height) {
        return;
      }
      this._$viewportBounds.next(bounds);
      this.updateScrollBar(false);
      this.updateScrollBar(true);
      this._$resizeViewport.next(bounds);
    }
  }

  protected override onResizeContent(width: number | null = null, height: number | null = null) {
    const content = this.scrollContent?.nativeElement;
    if (!!content) {
      const bounds: ISize = {
        width: width ?? content.offsetWidth,
        height: height ?? content.offsetHeight,
      }, b = this._$contentBounds.getValue();
      if (width === null && height === null && bounds.width === b.width && bounds.height === b.height) {
        return;
      }
      this._$contentBounds.next(bounds);
      this.updateScrollBar(false);
      this.updateScrollBar(true);
      this._$resizeContent.next(bounds);
    }
  }

  private updateScrollBarHandler(isVertical: boolean, update: boolean = false, blending: boolean = true, fireUpdate: boolean = false) {
    const viewportBounds = this._$viewportBounds.getValue(),
      direction = this._$direction.getValue(),
      horizontalEnabled = direction === ScrollerDirection.BOTH || direction === ScrollerDirection.HORIZONTAL,
      verticalEnabled = direction === ScrollerDirection.BOTH || direction === ScrollerDirection.VERTICAL;
    if ((isVertical && verticalEnabled) || (!isVertical && horizontalEnabled)) {
      const contentBounds = this._$contentBounds.getValue(),
        startOffset = isVertical ? this.topOffset : this.leftOffset,
        endOffset = isVertical ? this.bottomOffset : this.rightOffset,
        {
          thumbSize,
          thumbPosition,
          thumbGradientPositions,
        } = this._scrollBox.calculateScroll({
          direction: isVertical ? ScrollerDirection.VERTICAL : ScrollerDirection.HORIZONTAL,
          viewportWidth: viewportBounds.width,
          viewportHeight: viewportBounds.height,
          contentWidth: contentBounds.width,
          contentHeight: contentBounds.height,
          startOffset,
          endOffset,
          positionX: this._x,
          positionY: this._y,
          minSize: this.scrollbarMinSize,
        });

      if (isVertical) {
        this._$thumbGradientPositionsVertical.next(thumbGradientPositions);
        this._$thumbSizeVertical.next(thumbSize);
      } else {
        this._$thumbGradientPositionsHorizontal.next(thumbGradientPositions);
        this._$thumbSizeHorizontal.next(thumbSize);
      }
      const actualThumbPosition = thumbPosition < startOffset ? startOffset : thumbPosition;
      if (update) {
        (isVertical ? this.scrollBarVertical : this.scrollBarHorizontal)?.scroll({
          [isVertical ? TOP_PROP_NAME : LEFT_PROP_NAME]: actualThumbPosition, fireUpdate, behavior: BEHAVIOR_INSTANT,
          userAction: false, blending,
        });
      }
    }

    if (isVertical) {
      this._$scrollbarVerticalEnabled.next(verticalEnabled && this.scrollableY && this.scrollbarEnabled);
    } else {
      this._$scrollbarHorizontalEnabled.next(horizontalEnabled && this.scrollableX && this.scrollbarEnabled);
    }
  };

  override tick() {
    super.tick();

    this.scrollBarHorizontal?.tick();
    this.scrollBarVertical?.tick();
  }

  private updateScrollBar(isVertical: boolean) {
    (isVertical ? this._$updateScrollBarVertical : this._$updateScrollBarHorizontal).next();
  }

  protected override normalizeScrollWidth() {
    const result = super.normalizeScrollWidth();
    this.scrollLimits();
    this.measureVelocity();
    return result;
  }

  protected override normalizeScrollHeight() {
    const result = super.normalizeScrollHeight();
    this.scrollLimits();
    this.measureVelocity();
    return result;
  }


  refreshScrollbar() {
    this.updateScrollBarHandler(true, true, false, false);
    this.updateScrollBarHandler(false, true, false, false);
  }

  protected onDragStartHorizontal() {
    this.onDragStart();

    this.stopScrollbar(false);

    this._isScrollbarUserActionX = false;

    this.updateScrollBar(false);
  }

  protected onDragStartVertical() {
    this.onDragStart();

    this.stopScrollbar(true);

    this._isScrollbarUserActionY = false;

    this.updateScrollBar(true);
  }

  override reset() {
    super.reset();
    this.totalWidth = this.totalHeight = 0;
    this.onResizeContent(0, 0);
    this.stopScrollbar(false);
    this.stopScrollbar(true);
    this.refresh(true, true);
    this.prepared = false;
  }

  refresh(fireUpdate: boolean = false, updateScrollbar: boolean = true) {
    if (updateScrollbar) {
      this.stopScrolling();
    }

    this.scrollLimits();

    this.refreshCoordinate(this._x, this._y);

    if (updateScrollbar) {
      this.updateScrollBarHandler(true, false);
      this.updateScrollBarHandler(false, false);
      this.emitScrollableEvent();
    }

    if (fireUpdate) {
      this.fireScrollEvent(false);
    }
  }

  startScrollTo() {
    this.stopScrollbar(false);
    this.stopScrollbar(true);
    this.stopScrolling();
    this.scrollDirectionX = this.scrollDirectionY = 0;
    this.dropVelocity();
    this._isScrollsTo = true;
  }

  finishedScrollTo() {
    this._isScrollsTo = false;
    this.scrollDirectionX = this.scrollDirectionY = 0;
    this.dropVelocity();
    this.fireScrollEvent(true);
  }

  scrollTo(params: IScrollToParams): Array<number> | null {
    const userAction = params?.userAction ?? true;
    if (userAction) {
      this._isScrollbarUserActionX = this._isScrollbarUserActionY = false;
      this.scrollBarHorizontal?.stopScrolling();
      this.scrollBarVertical?.stopScrolling();
    }
    return this.scroll({ ...params, userAction: userAction });
  }

  stopScrollbar(isVertical: boolean) {
    const scrollBar = isVertical ? this.scrollBarVertical : this.scrollBarHorizontal;
    if (!!scrollBar) {
      scrollBar.stopScrolling();
      this.dropVelocity();
    }
  }

  private dropVelocity() {
    this._velocitiesX = [0];
    this._$velocityX.next(0);
    this._$averageVelocityX.next(0);

    this._velocitiesY = [0];
    this._$velocityY.next(0);
    this._$averageVelocityY.next(0);
  }

  protected override stopMoving() {
    super.stopMoving();
    this.dropVelocity();
  }

  protected override onAnimationComplete(position: number) {
    this.dropVelocity();
    this._$scrollEnd.next(false);
  }

  onScrollBarDragHandler(event: IScrollBarDragEvent) {
    const { position, isVertical, min, max, userAction } = event;
    if (isVertical) {
      this._isScrollbarUserActionY = userAction;
    } else {
      this._isScrollbarUserActionX = userAction;
    }
    if (!userAction) {
      return;
    }
    this._$scrollbarScroll.next(true);
    this.stopScrolling();
    const {
      position: absolutePosition,
    } = this._scrollBox.getScrollPositionByScrollBar({
      scrollSize: isVertical ? this.scrollHeight : this.scrollWidth,
      position,
    });

    this.scrollTo({
      [isVertical ? TOP : LEFT]: absolutePosition, behavior: INSTANT,
      blending: false, userAction: true, fireUpdate: true,
    });
    this.emitScrollableEvent();
    this._service.update(false);
  }

  protected onScrollBarDragEndHandler(event: IScrollBarDragEvent) {
    const { position, min, max, isVertical, userAction } = event;
    if (isVertical) {
      this._isScrollbarUserActionY = userAction;
    } else {
      this._isScrollbarUserActionX = userAction;
    }
    if (!userAction) {
      return;
    }
    if (isVertical) {
      this._isScrollbarUserActionY = false;
    } else {
      this._isScrollbarUserActionX = false;
    }
    this.dropVelocity();
    this._service.update(false);
    this.fireUpdateIfEdgesDetected(isVertical, position, min, max, true, true);
    if (isVertical) {
      this.scrollDirectionY = 0;
    } else {
      this.scrollDirectionX = 0;
    }
    this._$scrollbarScroll.next(true);
    this.fireScrollEvent(true);
  }

  private fireUpdateIfEdgesDetected(isVertical: boolean, position: number, min: number = 0, max: number = 1, animation: boolean = false, userAction: boolean = false) {
    if (userAction && animation) {
      if (position <= min) {
        if (isVertical) {
          this._service.scrollToTop();
        } else {
          this._service.scrollToLeft();
        }
        return true;
      } else if (position >= max) {
        if (isVertical) {
          this._service.scrollToBottom();
        } else {
          this._service.scrollToRight();
        }
        return true;
      }
    }
    return false;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}