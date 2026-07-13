import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NgVirtualScrollViewModule } from '../../projects/ng-virtual-scroll-view/src/lib/ng-virtual-scroll-view.module';
import { CommonModule } from '@angular/common';
import { CustomScrollbarModule } from './components/custom-scrollbar/custom-scrollbar.module';
import { VirtualClickModule } from '../../projects/ng-virtual-scroll-view/src/public-api';

@NgModule({
  declarations: [
    AppComponent,
  ],
  exports: [],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    NgVirtualScrollViewModule,
    VirtualClickModule,
    CustomScrollbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
