import { Directions } from "../enums/directions";

/**
 * Axis of the arrangement of virtual list elements.
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/20.x/projects/ng-virtual-scroll-view/src/lib/enums/direction.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export type Direction = Directions | 'horizontal' | 'vertical' | 'both';
