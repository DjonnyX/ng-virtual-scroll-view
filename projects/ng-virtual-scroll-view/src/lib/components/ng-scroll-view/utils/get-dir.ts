/**
 * getDir
 * @link https://github.com/DjonnyX/ng-virtual-grid/blob/14.x/projects/ng-virtual-grid/src/lib/components/ng-scroll-view/utils/get-dir.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export const getDir = (p: number, c: number) => {
    return p < c ? 1 : p > c ? -1 : 0;
}