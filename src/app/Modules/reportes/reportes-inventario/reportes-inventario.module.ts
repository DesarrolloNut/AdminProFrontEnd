import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesInventarioRoutingModule } from './reportes-inventario-routing.module';
import { ReportesInventarioComponent } from './reportes-inventario.component';
import { SharedModule } from '../../shared/shared.module';
import { ReporteExistenciaComponent } from './reporte-existencia/reporte-existencia.component';
import { ReporteInventarioActivoComponent } from './reporte-inventario-activo/reporte-inventario-activo.component';


@NgModule({
  declarations: [ReportesInventarioComponent, ReporteExistenciaComponent,ReporteInventarioActivoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReportesInventarioRoutingModule
  ]
})
export class ReportesInventarioModule { }
