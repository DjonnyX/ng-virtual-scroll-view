/**
 * IAnimatorUpdateData
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/22.x/projects/ng-virtual-scroll-view/src/lib/utils/animator/interfaces/animator-update-data.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export interface IAnimatorUpdateData {
    id: number;
    timestamp: number;
    elapsed: number;
    delta: number;
    value: number;
}