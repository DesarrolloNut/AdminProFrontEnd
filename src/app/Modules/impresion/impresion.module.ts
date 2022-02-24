import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImpresionRoutingModule } from './impresion-routing.module';
import { ImpresionComponent } from './impresion.component';


@NgModule({
  declarations: [ImpresionComponent],
  imports: [
    CommonModule,
    ImpresionRoutingModule
  ]
})
export class ImpresionModule { }
