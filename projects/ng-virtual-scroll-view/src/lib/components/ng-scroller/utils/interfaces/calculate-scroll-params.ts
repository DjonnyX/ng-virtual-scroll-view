import { ScrollerDirections } from "../../../ng-scroll-view/enums";

/**
 * ICalculateScrollMetrics
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/20.x/projects/ng-virtual-scroll-view/src/lib/components/scroller/utils/interfaces/calculate-scroll-params.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface ICalculateScrollParams {
    direction: ScrollerDirections;
    viewportWidth: number;
    viewportHeight: number;
    contentWidth: number;
    contentHeight: number;
    startOffset: number;
    endOffset: number;
    positionX: number;
    positionY: number;
    minSize: number;
}