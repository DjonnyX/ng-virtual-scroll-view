/**
 * getDir
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/22.x/projects/ng-virtual-scroll-view/src/lib/components/ng-scroll-view/utils/get-dir.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export const getDir = (p: number, c: number) => {
    return p < c ? 1 : p > c ? -1 : 0;
}