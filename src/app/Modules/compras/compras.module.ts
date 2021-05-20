import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';
import { SolicitudesComprasFormularioComponent } from './solicitudCompras/solicitudes-compras-formulario/solicitudes-compras-formulario.component';
import { SolicitudesComprasListadoComponent } from './solicitudCompras/solicitudes-compras-listado/solicitudes-compras-listado.component';

@NgModule({
  declarations: [
    ComprasComponent,
    SolicitudesComprasListadoComponent,
    SolicitudesComprasFormularioComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    ComprasRoutingModule
  ]
})
export class ComprasModule { }
