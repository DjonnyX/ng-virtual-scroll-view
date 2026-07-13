import { RoundedCorner } from "../interfaces";

/**
 * getShapeMinSize
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/21.x/projects/ng-virtual-scroll-view/src/lib/utils/get-shape-min-size.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export const getShapeMinSize = (roundedRectPath: RoundedCorner | null) => {
    if (!Array.isArray(roundedRectPath)) {
        return 0;
    }
    return Math.max(...roundedRectPath) * 2;
};
