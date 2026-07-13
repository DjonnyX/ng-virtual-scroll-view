import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgVirtualScrollViewComponent } from './ng-virtual-scroll-view.component';
import { LocaleSensitiveModule } from './directives';
import { NgScrollerModule } from './components/ng-scroller/ng-scroller.module';
import { SCROLL_VIEW_SERVICE } from './components/ng-scroll-view/const';
import { NgVirtualScrollViewService } from './ng-virtual-scroll-view.service';

@NgModule({
  declarations: [NgVirtualScrollViewComponent],
  exports: [NgVirtualScrollViewComponent],
  imports: [CommonModule, NgScrollerModule, LocaleSensitiveModule],
  providers: [{ provide: SCROLL_VIEW_SERVICE, useClass: NgVirtualScrollViewService }],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NgVirtualScrollViewModule { }
