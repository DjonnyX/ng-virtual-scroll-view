/**
 * IScrollBarDragEvent
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/16.x/projects/ng-virtual-scroll-view/src/lib/components/ng-scroll-bar/interfaces/scrollbar-drag-data.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface IScrollBarDragEvent {
    position: number;
    min: number;
    max: number;
    userAction: boolean;
    animation: boolean;
    isVertical: boolean;
}
