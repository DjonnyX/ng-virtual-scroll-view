import { Easing } from "../../../utils/animator";

/**
 * IScrollToParams
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/22.x/projects/ng-virtual-scroll-view/src/lib/components/ng-scroll-view/interfaces/scroll-to-params.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface IScrollToParams {
    x?: number | null;
    y?: number | null;
    left?: number | null;
    top?: number | null;
    normalize?: boolean;
    force?: boolean;
    blending?: boolean;
    behavior?: ScrollBehavior;
    ease?: Easing;
    fireUpdate?: boolean;
    userAction?: boolean;
    duration?: number;
}
