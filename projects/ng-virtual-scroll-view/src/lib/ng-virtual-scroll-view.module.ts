import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgVirtualScrollViewComponent } from './ng-virtual-scroll-view.component';
import { LocaleSensitiveModule } from './directives';
import { NgScrollerModule } from './components/ng-scroller/ng-scroller.module';

@NgModule({
  declarations: [NgVirtualScrollViewComponent],
  exports: [NgVirtualScrollViewComponent],
  imports: [CommonModule, NgScrollerModule, LocaleSensitiveModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NgVirtualScrollViewModule { }
