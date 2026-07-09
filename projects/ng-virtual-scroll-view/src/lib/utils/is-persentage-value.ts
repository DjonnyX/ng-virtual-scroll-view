import { PERCENTAGE_VALUE_PATTERN } from "../const";

/**
 * isPercentageValue
 * @link https://github.com/DjonnyX/ng-virtual-scroll-view/blob/main/projects/ng-virtual-scroll-view/src/lib/utils/is-persentage-value.ts
 * @author Evgenii Alexandrovich Grebennikov
 * @email djonnyx@gmail.com
 */
export const isPercentageValue = (value: number | `${number}%` | string) => {
    if (value === undefined || typeof value === 'number') {
        return false;
    }
    return PERCENTAGE_VALUE_PATTERN.test(value);
};