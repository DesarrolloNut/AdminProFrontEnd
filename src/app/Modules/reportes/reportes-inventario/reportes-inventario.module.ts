import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesInventarioRoutingModule } from './reportes-inventario-routing.module';
import { ReportesInventarioComponent } from './reportes-inventario.component';
import { SharedModule } from '../../shared/shared.module';
import { ReporteExistenciaComponent } from './reporte-existencia/reporte-existencia.component';
import { ReporteInventarioActivo } from './reporte-inventario-activo/models/ReporteInventarioActivo';
import { ReporteInventarioEntregaPedidosComponent } from './reporte-inventario-entrega-pedidos/reporte-inventario-entrega-pedidos.component';


@NgModule({
  declarations: [ReportesInventarioComponent, ReporteExistenciaComponent, ReporteInventarioActivo, ReporteInventarioEntregaPedidosComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReportesInventarioRoutingModule
  ]
})
export class ReportesInventarioModule { }
