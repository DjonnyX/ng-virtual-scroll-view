import {
    Component, ElementRef, inject, Input, ViewChild,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ScrollerDirection, ScrollerDirections } from '../enums';
import { ISize } from '../../../interfaces';
import { SCROLL_VIEW_INVERSION, SCROLL_VIEW_OVERSCROLL_ENABLED, SCROLL_VIEW_SERVICE } from '../const';
import { TextDirection } from '../../../types';
import { TextDirections } from '../../../enums';
import { DisposableComponent } from '../../../utils/disposable-component';

/**
 * BaseScrollView
 * Maximum performance for extremely large lists.
 * It is based on algorithms for virtualization of screen objects.
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/14.x/projects/ng-virtual-scroll-view/src/lib/components/ng-scroll-view/base/base-scroll-view.component.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
@Component({
    selector: 'base-scroll-view',
    template: '',
})
export class BaseScrollView extends DisposableComponent {
    @ViewChild('scrollContent')
    scrollContent: ElementRef<HTMLDivElement> | undefined;

    @ViewChild('scrollViewport')
    readonly scrollViewport: ElementRef<HTMLDivElement> | undefined;

    protected _$direction = new BehaviorSubject<ScrollerDirections | any>(ScrollerDirection.VERTICAL);
    readonly $direction = this._$direction.asObservable();
    @Input()
    set direction(v: ScrollerDirections | any) {
        if (this._$direction.getValue() !== v) {
            this._$direction.next(v);
        }
    }
    get direction() { return this._$direction.getValue(); }

    protected _$langTextDir = new BehaviorSubject<TextDirection>(TextDirections.LTR);
    readonly $langTextDir = this._$langTextDir.asObservable();
    @Input()
    set langTextDir(v: TextDirection) {
        if (this._$langTextDir.getValue() !== v) {
            this._$langTextDir.next(v);
        }
    }
    get langTextDir() { return this._$langTextDir.getValue(); }

    protected _$leftOffset = new BehaviorSubject<number>(0);
    readonly $leftOffset = this._$leftOffset.asObservable();
    @Input()
    set leftOffset(v: number) {
        if (this._$leftOffset.getValue() !== v) {
            this._$leftOffset.next(v);
        }
    }
    get leftOffset() { return this._$leftOffset.getValue(); }

    protected _$topOffset = new BehaviorSubject<number>(0);
    readonly $topOffset = this._$topOffset.asObservable();
    @Input()
    set topOffset(v: number) {
        if (this._$topOffset.getValue() !== v) {
            this._$topOffset.next(v);
        }
    }
    get topOffset() { return this._$topOffset.getValue(); }

    protected _$rightOffset = new BehaviorSubject<number>(0);
    readonly $rightOffset = this._$rightOffset.asObservable();
    @Input()
    set rightOffset(v: number) {
        if (this._$rightOffset.getValue() !== v) {
            this._$rightOffset.next(v);
        }
    }
    get rightOffset() { return this._$rightOffset.getValue(); }

    protected _$bottomOffset = new BehaviorSubject<number>(0);
    readonly $bottomOffset = this._$bottomOffset.asObservable();
    @Input()
    set bottomOffset(v: number) {
        if (this._$bottomOffset.getValue() !== v) {
            this._$bottomOffset.next(v);
        }
    }
    get bottomOffset() { return this._$bottomOffset.getValue(); }

    protected _$isVertical = new BehaviorSubject<boolean>(true);
    readonly $isVertical = this._$isVertical.asObservable();

    protected _$grabbing = new BehaviorSubject<boolean>(false);
    readonly $grabbing = this._$grabbing.asObservable();
    get grabbing() { return this._$grabbing.getValue(); }

    protected _inversion = inject(SCROLL_VIEW_INVERSION);

    protected _overscrollEnabled = inject(SCROLL_VIEW_OVERSCROLL_ENABLED);

    protected _$updateScrollBarHorizontal = new Subject<void>();
    protected $updateScrollBarHorizontal = this._$updateScrollBarHorizontal.asObservable();

    protected _$updateScrollBarVertical = new Subject<void>();
    protected $updateScrollBarVertical = this._$updateScrollBarVertical.asObservable();

    get scrollableX() {
        const { width } = this._$viewportBounds.getValue(),
            viewportSize = width,
            totalSize = this._totalWidth;
        return this._inversion ? (totalSize < viewportSize) : (totalSize > viewportSize);
    }

    get scrollableY() {
        const { height } = this._$viewportBounds.getValue(),
            viewportSize = height,
            totalSize = this._totalHeight;
        return this._inversion ? (totalSize < viewportSize) : (totalSize > viewportSize);
    }

    protected _service = inject(SCROLL_VIEW_SERVICE);

    protected _isMoving = false;
    get isMoving() {
        return this._isMoving;
    }

    protected _x: number = 0;
    set x(v: number) {
        this._x = this._actualX = v;

        this.normalizeScrollSize();
    }
    get x() { return this._x; }

    protected _y: number = 0;
    set y(v: number) {
        this._y = this._actualY = v;

        this.normalizeScrollSize();
    }
    get y() { return this._y; }

    protected _actualTotalWidth: number = 0;
    protected _totalWidth: number = 0;
    set totalWidth(v: number) {
        if (this._totalWidth !== v) {
            this._totalWidth = v;
            const startOffset = this.leftOffset;
            this._actualTotalWidth = v + startOffset;

            this.normalizeScrollWidth();
        }
    }
    get totalWidth() {
        return this._totalWidth;
    }

    protected _actualTotalHeight: number = 0;
    protected _totalHeight: number = 0;
    set totalHeight(v: number) {
        if (this._totalHeight !== v) {
            this._totalHeight = v;
            const startOffset = this.topOffset;
            this._actualTotalHeight = v + startOffset;

            this.normalizeScrollHeight();
        }
    }
    get totalHeight() {
        return this._totalHeight;
    }

    protected _startLayoutOffsetX: number = 0;
    set startLayoutOffsetX(v: number) {
        if (this._startLayoutOffsetX !== v) {
            this._startLayoutOffsetX = v;
        }
    }
    get startLayoutOffsetX() { return this._startLayoutOffsetX; }

    protected _startLayoutOffsetY: number = 0;
    set startLayoutOffsetY(v: number) {
        if (this._startLayoutOffsetY !== v) {
            this._startLayoutOffsetY = v;
        }
    }
    get startLayoutOffsetY() { return this._startLayoutOffsetY; }

    get actualScrollHeight() {
        const { height: viewportHeight } = this._$viewportBounds.getValue(),
            totalSize = this._actualTotalHeight,
            startOffset = this.topOffset,
            endOffset = this.bottomOffset;
        if (this._inversion) {
            return totalSize > viewportHeight ? endOffset : viewportHeight - totalSize;
        }
        return totalSize < viewportHeight ? startOffset : totalSize - viewportHeight;
    }

    get actualScrollWidth() {
        const { width: viewportWidth } = this._$viewportBounds.getValue(),
            totalSize = this._actualTotalWidth,
            startOffset = this.leftOffset,
            endOffset = this.rightOffset;
        if (this._inversion) {
            return totalSize > viewportWidth ? endOffset : viewportWidth - totalSize;
        }
        return totalSize < viewportWidth ? startOffset : totalSize - viewportWidth;
    }

    protected _actualX: number = 0;
    get actualScrollLeft() {
        return this._actualX;
    }

    protected _actualY: number = 0;
    get actualScrollTop() {
        return this._actualY;
    }

    get scrollLeft() {
        return this._x;
    }

    get scrollTop() {
        return this._y;
    }

    get scrollWidth() {
        const { width: viewportWidth } = this._$viewportBounds.getValue(),
            { width: contentWidth } = this._$contentBounds.getValue(),
            startOffset = this.leftOffset,
            endOffset = this.rightOffset;
        if (this._inversion) {
            return contentWidth > viewportWidth ? endOffset : (viewportWidth - contentWidth);
        }
        return contentWidth < viewportWidth ? startOffset : (contentWidth - viewportWidth);
    }

    get scrollHeight() {
        const { height: viewportHeight } = this._$viewportBounds.getValue(),
            { height: contentHeight } = this._$contentBounds.getValue(),
            startOffset = this.topOffset,
            endOffset = this.bottomOffset;
        if (this._inversion) {
            return contentHeight > viewportHeight ? endOffset : (viewportHeight - contentHeight);
        }
        return contentHeight < viewportHeight ? startOffset : (contentHeight - viewportHeight);
    }

    protected _$viewportBounds = new BehaviorSubject<ISize>({ width: 0, height: 0 });
    readonly $viewportBounds = this._$viewportBounds.asObservable();

    protected _$contentBounds = new BehaviorSubject<ISize>({ width: 0, height: 0 });
    readonly $contentBounds = this._$contentBounds.asObservable();
    get contentBounds() { return this._$contentBounds.getValue(); }

    tick() {
        this.onResizeContent();
        this.onResizeViewport();
    }

    protected overrideCoordinates(x: number, y: number) { }

    protected normalizeScrollWidth() {
        return false;
    }

    protected normalizeScrollHeight() {
        return false;
    }

    protected normalizeScrollSize() {
        this.normalizeScrollWidth();
        this.normalizeScrollHeight();
    }

    protected onResizeViewport() {
        const viewport = this.scrollViewport?.nativeElement;
        if (!!viewport) {
            const leftOffset = this.leftOffset,
                rightOffset = this.rightOffset,
                topOffset = this.topOffset,
                bottomOffset = this.bottomOffset,
                w = viewport.offsetWidth,
                h = viewport.offsetHeight,
                width = w - leftOffset - rightOffset,
                height = h - topOffset - bottomOffset,
                bounds = this._$viewportBounds.getValue();
            if (bounds.width === width && bounds.height === height) {
                return;
            }
            this._$viewportBounds.next({ width, height });
        }
    }

    protected onResizeContent(valueWidth: number | null = null, valueHeight: number | null = null) {
        const content = this.scrollContent?.nativeElement;
        if (!!content) {
            const leftOffset = this.leftOffset,
                topOffset = this.topOffset,
                w = content.offsetWidth,
                h = content.offsetHeight,
                width = valueWidth ?? (w - leftOffset),
                height = valueHeight ?? (h - topOffset),
                bounds = this._$contentBounds.getValue();
            if (bounds.width === width && bounds.height === height) {
                return;
            }
            this._$contentBounds.next({ width, height });
        }
    }
}