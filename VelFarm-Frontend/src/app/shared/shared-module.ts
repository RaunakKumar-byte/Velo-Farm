import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Loader } from './loader/loader';


@NgModule({
  declarations: [
    Header,
    Footer,
    Loader
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports: [
    Header,
    Footer,
    Loader
  ]
})
export class SharedModule { }
