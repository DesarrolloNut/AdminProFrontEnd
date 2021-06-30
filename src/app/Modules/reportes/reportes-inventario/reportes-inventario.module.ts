import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesInventarioRoutingModule } from './reportes-inventario-routing.module';
import { ReportesInventarioComponent } from './reportes-inventario.component';
import { ReporteCanastosComponent } from './reporte-canastos/reporte-canastos.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [ReportesInventarioComponent, ReporteCanastosComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReportesInventarioRoutingModule
  ]
})
export class ReportesInventarioModule { }
