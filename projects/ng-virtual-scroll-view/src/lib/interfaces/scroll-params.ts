import { Id } from "../types";

/**
 * IScrollParams
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/main/projects/ng-virtual-scroll-view/src/lib/interfaces/scroll-options.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface IScrollParams {
    id: Id;
    behavior?: ScrollBehavior;
    blending?: boolean;
    iteration?: number;
    isLastIteration?: boolean;
    scrollCalled?: boolean;
    delay?: number;
    cb?: () => void;
}
