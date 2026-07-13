import { Easing } from "../utils/animator";

/**
 * Interface IScrollOptions.
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/16.x/projects/ng-virtual-scroll-view/src/lib/interfaces/scroll-options.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface IScrollOptions {
    x?: number | null;
    y?: number | null;
    left?: number | null;
    top?: number | null;
    blending?: boolean;
    behavior?: ScrollBehavior;
    ease?: Easing;
    duration?: number;
}
