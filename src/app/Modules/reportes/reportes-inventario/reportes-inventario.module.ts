import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesInventarioRoutingModule } from './reportes-inventario-routing.module';
import { ReportesInventarioComponent } from './reportes-inventario.component';
import { SharedModule } from '../../shared/shared.module';
import { ReporteExistenciaComponent } from './reporte-existencia/reporte-existencia.component';


@NgModule({
  declarations: [ReportesInventarioComponent, ReporteExistenciaComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReportesInventarioRoutingModule
  ]
})
export class ReportesInventarioModule { }
