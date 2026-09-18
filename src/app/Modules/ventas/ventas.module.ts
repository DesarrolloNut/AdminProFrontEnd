import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { NotacreditoListadoComponent } from './notacredito/notacredito-listado/notacredito-listado.component';
import { NotacreditoFormularioComponent } from './notacredito/notacredito-formulario/notacredito-formulario.component';
import { CotizacionesListadoComponent } from './cotizaciones/cotizaciones-listado/cotizaciones-listado.component';
import { CotizacionesFormularioComponent } from './cotizaciones/cotizaciones-formulario/cotizaciones-formulario.component';
import { ReporteprontopagoComponent } from './reporteprontopago/reporteprontopago.component';
import { AutorizacionCotizacionComponent } from './cotizaciones/autorizacion-cotizacion/autorizacion-cotizacion.component';
import { PedidosEmpleadosListadoComponent } from './pedidos-empleado/pedidos-empleado-listado/pedidos-empleado-listado.component';
import { PedidosEmpleadoFormularioComponent } from './pedidos-empleado/pedidos-empleado-formulario/pedidos-empleado-formulario.component';
import { CotizacionesSeguimientoComponent } from './cotizaciones/cotizaciones-seguimiento/cotizaciones-seguimiento.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {NumberPickerModule} from 'ng-number-picker';
import { PedidosEmpleadoProductosComponent } from './pedidos-empleado/pedidos-empleado-productos/pedidos-empleado-productos.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PedidosEmpleadoCarritoComponent } from './pedidos-empleado/pedidos-empleado-carrito/pedidos-empleado-carrito.component';
import { AutorizacionFacturaComponent } from './facturas/factura-cotizacion/autorizacion-factura.component';
import { FacturaFormularioComponent } from './facturas/factura-formulario/factura-formulario.component';
import { FacturaListadoComponent } from './facturas/factura-listado/factura-listado.component';
import { FacturaSeguimientoComponent } from './facturas/factura-seguimiento/factura-seguimiento.component';

@NgModule({
  declarations:
  [VentasComponent,
   OfertasConsultasFacturasComponent,
   NotacreditoListadoComponent,
   NotacreditoFormularioComponent,
   CotizacionesListadoComponent,
   CotizacionesFormularioComponent,
   PedidosEmpleadosListadoComponent,
   PedidosEmpleadoFormularioComponent,
   PedidosEmpleadoProductosComponent,
   PedidosEmpleadoCarritoComponent,
    ReporteprontopagoComponent,

  AutorizacionCotizacionComponent,
  FacturaSeguimientoComponent,
  FacturaListadoComponent,
  FacturaFormularioComponent,
  AutorizacionFacturaComponent,
  CotizacionesSeguimientoComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    AngularDualListBoxModule,
    VentasRoutingModule,
    NumberPickerModule,
    PerfectScrollbarModule,
    NgxSkeletonLoaderModule
  ]
})
export class VentasModule { }
