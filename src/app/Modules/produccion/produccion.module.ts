import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProduccionRoutingModule } from './produccion-routing.module';
import { ProduccionComponent } from './produccion.component';
import { SharedModule } from '../shared/shared.module';
import { PesajeFormularioComponent } from './pesaje/pesaje-formulario/pesaje-formulario.component';
import { PesajeListadoComponent } from './pesaje/pesaje-listado/pesaje-listado.component';
import { PesajeResultadoComponent } from './pesaje/pesaje-resultado/pesaje-resultado.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { OrdenfabricacionListadoComponent } from './ordenfabricacion/ordenfabricacion-listado/ordenfabricacion-listado.component';
import { OrdenfabricacionFormularioComponent } from './ordenfabricacion/ordenfabricacion-formulario/ordenfabricacion-formulario.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrdenfabricacionPesajeComponent } from './ordenfabricacion/ordenfabricacion-pesaje/ordenfabricacion-pesaje.component';


@NgModule({
  declarations: [ProduccionComponent,PesajeFormularioComponent,PesajeListadoComponent, PesajeResultadoComponent, OrdenfabricacionListadoComponent, OrdenfabricacionFormularioComponent, OrdenfabricacionPesajeComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProduccionRoutingModule,
    NgxBarcodeModule,
    NgbModule
  ]
})
export class ProduccionModule { }
