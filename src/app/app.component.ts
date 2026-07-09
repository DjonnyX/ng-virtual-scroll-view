import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { delay, interval, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NgVirtualListModule, NgVirtualScrollViewComponent, ISize, Id,
  IScrollingSettings,
} from '../../projects/ng-virtual-scroll-view/src/public-api';
import { LOGO } from './const';
import { GradientColor, RoundedCorner } from './components/interfaces';
import { CustomScrollBarTheme } from './components/custom-scrollbar/interfaces/custom-scrollbar-theme';
import { CustomScrollbarModule } from './components/custom-scrollbar/custom-scrollbar.module';

const X_LITE_BLUE_PLASMA_GRADIENT: GradientColor = ["rgba(133, 142, 255, 0)", "rgb(0, 133, 160)"],
  ROUND_CORNER: RoundedCorner = [3, 3, 3, 3],
  CUSTOM_SCROLLBAR_THEME: CustomScrollBarTheme = {
    fill: ["rgba(101, 50, 147, 1)", "rgba(123, 50, 147, 1)"],
    hoverFill: ["rgba(73, 6, 133, 1)", "rgba(73, 6, 133, 1)"],
    pressedFill: ["rgba(73, 6, 150, 1)", "rgba(95, 0, 150, 1)"],
    strokeGradientColor: X_LITE_BLUE_PLASMA_GRADIENT,
    strokeAnimationDuration: 1000,
    roundCorner: ROUND_CORNER,
    rippleColor: 'rgba(255,255,255,0.5)',
    rippleEnabled: true,
  };

const MAX_ITEMS = 1000;

const generateItems = (len: number = MAX_ITEMS) => {
  const result = [];
  for (let i = 0, l = len; i < l; i++) {
    const idX = i + 1;
    for (let j = 0, l1 = len; j < l1; j++) {
      const idY = j + 1;
      result.push([{ idX }, { idY }]);
    }
  }
  return result;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, NgVirtualListModule, CustomScrollbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly logo = LOGO;

  customScrollBarThumbParams = CUSTOM_SCROLLBAR_THEME;

  scrollingSettings: IScrollingSettings = {
    frictionalForce: 0.05,
    mass: 0.005,
    maxDistance: 100000,
    maxDuration: 10000,
    speedScale: 10,
    optimization: false,
  }

  items = generateItems(1000);

  motionBlurEnabled = false;

  constructor() {
    const bp: Promise<EventTarget & { level: number, charging: boolean; }> | null = (navigator as any).getBattery?.() ?? null;
    if (!!bp) {
      bp.then(battery => {
        battery.addEventListener('levelchange', () => {
          this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
        });
        this.motionBlurEnabled = battery.level >= 0.10 || battery.charging;
      });
    }
  }

  onSelectHandler(data: Array<Id> | Id | null) {
    console.info(`Select: ${JSON.stringify(data)}`);
  }

  onViewportChangeHandler(size: ISize) {
    console.info(`Viewport changed: ${JSON.stringify(size)}`);
  }

  onScrollReachStartHandler() {
    console.info(`onScrollReachStart`);
  }

  onScrollReachEndHandler() {
    console.info(`onScrollReachEnd`);
  }
}
