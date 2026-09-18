import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioComponent } from './inventario.component';
import { SharedModule } from '../shared/shared.module';
import { DevolucionesListadoComponent } from './devoluciones/devoluciones-listado/devoluciones-listado.component';
import { RecepcionActivoListadoComponent } from './recepcion-activo/recepcion-activo-listado/recepcion-activo-listado.component';
import { EntregasListadoComponent } from './entregas/entregas-listado/entregas-listado.component';
import { EntregasFormularioComponent } from './entregas/entregas-formulario/entregas-formulario.component';
import { DespachoFormularioComponent } from './despacho/despacho-formulario/despacho-formulario.component';
import { DespachoListadoComponent } from './despacho/despacho-listado/despacho-listado.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { DespachoAsignacionFormularioComponent } from './despacho-asignacion/despacho-asignacion-formulario/despacho-asignacion-formulario.component';
import { DespachoAsignacionListadoComponent } from './despacho-asignacion/despacho-asignacion-listado/despacho-asignacion-listado.component';

import { TransferenciaListadoComponent } from './transferencia/transferencia-listado/transferencia-listado.component';
import { TransferenciaFormularioComponent } from './transferencia/transferencia-formulario/transferencia-formulario.component';
import { SolicitudDevolucionFormularioComponent } from './solicitud-devolucion/solicitud-devolucion-formulario/solicitud-devolucion-formulario.component';
import { SolicitudDevolucionListadoComponent } from './solicitud-devolucion/solicitud-devolucion-listado/solicitud-devolucion-listado.component';
import { SolicitudCambioFormularioComponent } from './solicitud-cambio/solicitud-cambio-formulario/solicitud-cambio-formulario.component';
import { SolicitudCambioListadoComponent } from './solicitud-cambio/solicitud-cambio-listado/solicitud-cambio-listado.component';
import { AlmacenInventarioListadoComponent } from './almacen-inventario/almacen-inventario-listado/almacen-inventario-listado.component';


@NgModule({
  declarations: [InventarioComponent, DevolucionesListadoComponent,
     RecepcionActivoListadoComponent,
     EntregasListadoComponent,
     EntregasFormularioComponent,
     DespachoListadoComponent,
     DespachoFormularioComponent,
     DespachoAsignacionFormularioComponent,
     DespachoAsignacionListadoComponent,
     TransferenciaListadoComponent,
     TransferenciaFormularioComponent,
     SolicitudDevolucionFormularioComponent,
     SolicitudDevolucionListadoComponent,
     SolicitudCambioFormularioComponent,
     SolicitudCambioListadoComponent,
     AlmacenInventarioListadoComponent

    ],
  imports: [
    CommonModule,
    SharedModule,
    NgxBarcodeModule,
    InventarioRoutingModule
  ]
})
export class InventarioModule { }
