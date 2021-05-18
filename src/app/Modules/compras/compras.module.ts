import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';
import { SolicitudComprasListadoComponent } from './solicitudCompras/solicitud-compras-listado/solicitud-compras-listado.component';
import { SolicitudComprasFormularioComponent } from './solicitudCompras/solicitud-compras-formulario/solicitud-compras-formulario.component';


@NgModule({
  declarations: [ComprasComponent, SolicitudComprasListadoComponent, SolicitudComprasFormularioComponent],
  imports: [
    CommonModule,
    ComprasRoutingModule
  ]
})
export class ComprasModule { }
