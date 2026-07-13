import { debounce } from "./debounce";
import { IDebounce } from "./debounce";
import { ScrollEvent } from "./scroll-event";
import { EventEmitter, IEventEmitter } from "./event-emitter";
import { copyValueAsReadonly, objectAsReadonly } from './object';
import { isPercentageValue } from './is-persentage-value';
import { isSpreadingMode } from './is-spreading-mode';
import { parseArithmeticExpression } from './parse-arithmetic-expression';
import { parseFloatOrPersentageValue } from './parse-float-or-persentage-value';
import { toggleClassName } from './toggle-class-name';
import { Animator, Easing, easeLinear, easeOutQuad, ANIMATOR_MIN_TIMESTAMP } from './animator';

export {
    debounce,
    objectAsReadonly,
    copyValueAsReadonly,
    isPercentageValue,
    isSpreadingMode,
    parseArithmeticExpression,
    parseFloatOrPersentageValue,
    toggleClassName,
    ScrollEvent,
    EventEmitter,
    Animator,
    easeLinear,
    easeOutQuad,
    ANIMATOR_MIN_TIMESTAMP,
};

export type {
    IDebounce,
    IEventEmitter,
    Easing,
};

